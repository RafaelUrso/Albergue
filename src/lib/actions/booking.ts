"use server";

import { prisma } from "@/lib/prisma";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

/**
 * RF-011 / RN-011: Motor de reservas com anti-double-booking
 * RF-012: Reserva de leito individual
 * RF-013: Reserva de quarto inteiro
 * RF-016 / RN-012 / RN-020: Coleta de dados de acompanhantes
 * RF-017 / RN-013: Declaração de menores/PCD
 */
export async function createBooking(input: BookingInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  const validatedData = bookingSchema.parse(input);
  const { dataCheckin, dataCheckout, acompanhantes, declaracaoGrupo, quartoInteiroId } = validatedData;
  let { leitosIds } = validatedData;

  // Normalizar datas para o meio-dia (12h00) - RN-011
  const checkin = new Date(dataCheckin);
  checkin.setUTCHours(12, 0, 0, 0);
  const checkout = new Date(dataCheckout);
  checkout.setUTCHours(12, 0, 0, 0);

  if (checkout <= checkin) {
    throw new Error("A data de check-out deve ser posterior ao check-in.");
  }

  // Se for reserva de quarto inteiro, buscar todos os leitos do quarto
  if (quartoInteiroId) {
    const leitosDoQuarto = await prisma.leito.findMany({
      where: { quartoId: quartoInteiroId, status: "DISPONIVEL" },
      select: { id: true }
    });
    if (leitosDoQuarto.length === 0) {
      throw new Error("Não há leitos disponíveis neste quarto.");
    }
    leitosIds = leitosDoQuarto.map(l => l.id);
  }

  // RN-012 / RN-020: Validar acompanhantes
  // Deve haver dados para todos os leitos exceto um (que presume-se ser do titular)
  if (leitosIds.length > 1 && acompanhantes.length < leitosIds.length - 1) {
    throw new Error("Dados de acompanhantes obrigatórios para todos os leitos adicionais.");
  }

  // Validar se leitoId dos acompanhantes pertence aos leitos selecionados
  for (const acompanhante of acompanhantes) {
    if (!leitosIds.includes(acompanhante.leitoId)) {
      throw new Error(`Leito ${acompanhante.leitoId} do acompanhante não está na seleção da reserva.`);
    }
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Bloqueio transacional (Anti-double-booking) - RNF-012
    // Garante que ninguém mais altere esses leitos durante a transação
    await tx.$executeRaw`
      SELECT id FROM "Leito"
      WHERE id IN (${Prisma.join(leitosIds)})
      FOR UPDATE
    `;

    // 2. Verificar colisões de datas - RN-011
    const colisoes = await tx.reservaLeito.findMany({
      where: {
        leitoId: { in: leitosIds },
        reserva: {
          status: { in: ["CONFIRMADA", "CHECKIN"] },
          AND: [
            { dataCheckin: { lt: checkout } },
            { dataCheckout: { gt: checkin } }
          ]
        }
      },
      include: { leito: true }
    });

    if (colisoes.length > 0) {
      const codigos = Array.from(new Set(colisoes.map(c => c.leito.codigo))).join(", ");
      throw new Error(`Conflito de reserva para os leitos: ${codigos}`);
    }

    // 3. Cálculo de Valor (Fase 6 antecipada minimamente) - RN-014
    const leitos = await tx.leito.findMany({
      where: { id: { in: leitosIds } },
      include: { quarto: true }
    });

    const numDiarias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    let valorTotal = new Prisma.Decimal(0);

    for (const leito of leitos) {
      const tarifa = await tx.tarifa.findFirst({
        where: { quartoTipo: leito.quarto.tipo },
        orderBy: { createdAt: 'desc' } // Pega a mais recente
      });
      if (!tarifa) throw new Error(`Tarifa não definida para o tipo ${leito.quarto.tipo}`);
      valorTotal = valorTotal.add(tarifa.valorDiaria.mul(numDiarias));
    }

    // 4. Criar a Reserva
    const reserva = await tx.reserva.create({
      data: {
        usuarioTitularId: session.user.id,
        dataCheckin: checkin,
        dataCheckout: checkout,
        valorTotal,
        valorPago: 0,
        status: "CONFIRMADA",
        declaracaoGrupo: {
          create: {
            qtdAdultos: declaracaoGrupo.qtdAdultos,
            qtdCriancas: declaracaoGrupo.qtdCriancas,
            possuiPcd: declaracaoGrupo.possuiPcd,
            qtdPcd: declaracaoGrupo.qtdPcd,
            descricaoDeficiencias: declaracaoGrupo.descricaoDeficiencias,
          }
        }
      }
    });

    // 5. Vincular leitos e acompanhantes
    // Primeiro leito para o titular (se houver mais de um e não estiver nos acompanhantes)
    // Para simplificar o mapping, vamos usar uma lógica de fila.
    const acompanhantesRestantes = [...acompanhantes];

    for (const leitoId of leitosIds) {
      let hospedeOcupanteId = null;

      // Tenta encontrar acompanhante designado para este leito
      const idx = acompanhantesRestantes.findIndex(a => a.leitoId === leitoId);
      if (idx !== -1) {
        const a = acompanhantesRestantes.splice(idx, 1)[0];
        const hospede = await tx.hospedeAvulso.create({
          data: { nomeCompleto: a.nomeCompleto, documento: a.documento }
        });
        hospedeOcupanteId = hospede.id;
      }

      await tx.reservaLeito.create({
        data: {
          reservaId: reserva.id,
          leitoId,
          hospedeOcupanteId
        }
      });
    }

    // RF-027 / RN-039 (Contador de hóspedes) seria atualizado aqui via trigger ou revalidação se necessário

    return reserva;
  });
}
