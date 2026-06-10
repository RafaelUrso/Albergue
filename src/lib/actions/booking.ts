"use server";

import { prisma } from "@/lib/prisma";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";
import { auth } from "@/auth";
import { Prisma, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, PagamentoStatus, PagamentoMetodo } from "@prisma/client";
import { getTariffForDate } from "./tariff";

/**
 * RF-011 / RN-011: Motor de reservas com anti-double-booking
 */
export async function searchAvailableBeds(params: {
  checkIn: string;
  checkOut: string;
  adults?: number;
  gender?: QuartoGenero | 'ALL';
  banheiroPrivativo?: boolean;
  posicao?: LeitoPosicao;
  localizacao?: LeitoLocalizacao;
  incidenciaSol?: LeitoIncidenciaSol;
}) {
  const checkin = new Date(params.checkIn);
  const checkout = new Date(params.checkOut);

  if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
    return [];
  }

  checkin.setUTCHours(12, 0, 0, 0);
  checkout.setUTCHours(12, 0, 0, 0);

  // 1. Encontrar leitos ocupados no período (colisão de datas)
  const ocupados = await prisma.reservaLeito.findMany({
    where: {
      reserva: {
        status: { in: ["CONFIRMADA", "CHECKIN"] },
        AND: [
          { dataCheckin: { lt: checkout } },
          { dataCheckout: { gt: checkin } }
        ]
      }
    },
    select: { leitoId: true }
  });

  const ocupadosIds = ocupados.map(o => o.leitoId);

  // 2. Buscar leitos disponíveis com filtros
  const leitos = await prisma.leito.findMany({
    where: {
      id: { notIn: ocupadosIds },
      status: "DISPONIVEL",
      posicao: params.posicao,
      localizacao: params.localizacao,
      incidenciaSol: params.incidenciaSol,
      quarto: {
        ativo: true,
        ...(params.gender && params.gender !== 'ALL' ? { genero: params.gender } : {}),
        ...(params.banheiroPrivativo !== undefined ? { banheiroPrivativo: params.banheiroPrivativo } : {}),
      }
    },
    include: {
      quarto: true
    }
  });

  // Mapear leitos com suas respectivas tarifas para a DATA DE CHECKIN
  const leitosComTarifa = await Promise.all(leitos.map(async (leito) => {
    const tarifa = await getTariffForDate(leito.quarto.tipo, checkin);
    return {
      ...leito,
      valorDiaria: tarifa ? Number(tarifa.valorDiaria) : 0
    };
  }));

  return leitosComTarifa;
}

export async function createBooking(input: BookingInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  const validatedData = bookingSchema.parse(input);
  const { dataCheckin, dataCheckout, acompanhantes, declaracaoGrupo, quartoInteiroId } = validatedData;
  let { leitosIds } = validatedData;

  const checkin = new Date(dataCheckin);
  checkin.setUTCHours(12, 0, 0, 0);
  const checkout = new Date(dataCheckout);
  checkout.setUTCHours(12, 0, 0, 0);

  if (checkout <= checkin) {
    throw new Error("A data de check-out deve ser posterior ao check-in.");
  }

  if (quartoInteiroId) {
    const leitosDoQuarto = await prisma.leito.findMany({
      where: { quartoId: quartoInteiroId, status: "DISPONIVEL" },
      select: { id: true }
    });
    leitosIds = leitosDoQuarto.map(l => l.id);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT id FROM "Leito"
      WHERE id IN (${Prisma.join(leitosIds)})
      FOR UPDATE
    `;

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
      }
    });

    if (colisoes.length > 0) {
      throw new Error("Conflito de reserva detectado.");
    }

    const leitos = await tx.leito.findMany({
      where: { id: { in: leitosIds } },
      include: { quarto: true }
    });

    const numDiarias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    let valorTotal = new Prisma.Decimal(0);

    for (const leito of leitos) {
      for (let i = 0; i < numDiarias; i++) {
        const currentDay = new Date(checkin);
        currentDay.setUTCDate(checkin.getUTCDate() + i);
        const tarifa = await getTariffForDate(leito.quarto.tipo, currentDay);
        if (!tarifa) throw new Error(`Tarifa não definida para o tipo ${leito.quarto.tipo} em ${currentDay.toISOString()}`);
        valorTotal = valorTotal.add(tarifa.valorDiaria);
      }
    }

    const reserva = await tx.reserva.create({
      data: {
        usuarioTitularId: session.user!.id as string,
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

    for (const leitoId of leitosIds) {
      const acompanhante = acompanhantes.find(a => a.leitoId === leitoId);
      let hospedeOcupanteId = null;

      if (acompanhante) {
        const hospede = await tx.hospedeAvulso.create({
          data: { nomeCompleto: acompanhante.nomeCompleto, documento: acompanhante.documento }
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

    return {
      ...reserva,
      valorTotal: Number(reserva.valorTotal),
      valorPago: Number(reserva.valorPago)
    };
  });
}

export async function calculateEstimatedPrice(leitosIds: string[], checkIn: string, checkOut: string) {
  const checkin = new Date(checkIn);
  checkin.setUTCHours(12, 0, 0, 0);
  const checkout = new Date(checkOut);
  checkout.setUTCHours(12, 0, 0, 0);
  const numDiarias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

  const leitos = await prisma.leito.findMany({
    where: { id: { in: leitosIds } },
    include: { quarto: true }
  });

  let valorTotal = 0;

  for (const leito of leitos) {
    for (let i = 0; i < numDiarias; i++) {
      const currentDay = new Date(checkin);
      currentDay.setUTCDate(checkin.getUTCDate() + i);
      const tarifa = await getTariffForDate(leito.quarto.tipo, currentDay);
      if (tarifa) {
        valorTotal += Number(tarifa.valorDiaria);
      }
    }
  }

  return valorTotal;
}

export async function processPayment(reservaId: string, gatewayToken: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  return await prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) throw new Error("Reserva não encontrada");

    // Simulação de processamento de pagamento
    // Aceita tok_ ou o cartão de teste 4242 4242 4242 4242
    const normalizedToken = gatewayToken.replace(/\s/g, '');
    const isToken = normalizedToken.startsWith("tok_") || normalizedToken === "4242424242424242";

    const sanitizedToken = isToken ? normalizedToken : "masked_card_" + normalizedToken.slice(-4);
    const paymentSuccessful = isToken;

    if (!paymentSuccessful) {
      await tx.pagamento.create({
        data: {
          reservaId,
          gatewayTransactionId: "FAILED_" + sanitizedToken + "_" + Date.now(),
          valor: reserva.valorTotal,
          status: "FALHADO",
          metodo: "CARTAO_CREDITO",
        }
      });
      throw new Error("Pagamento recusado pelo gateway.");
    }

    const pagamento = await tx.pagamento.create({
      data: {
        reservaId,
        gatewayTransactionId: "MOCK_" + sanitizedToken + "_" + Date.now(),
        valor: reserva.valorTotal,
        status: "CONCLUIDO",
        metodo: "CARTAO_CREDITO",
      }
    });

    await tx.reserva.update({
      where: { id: reservaId },
      data: {
        valorPago: reserva.valorTotal,
      }
    });

    // Registrar Aceite de Termos de forma imutável (Requirement Phase 6 / LGPD)
    await tx.aceiteTermos.create({
      data: {
        usuarioId: session.user!.id!,
        versaoTermo: "v1-2026", // Versão atual
      }
    });

    return {
      ...pagamento,
      valor: Number(pagamento.valor)
    };
  });
}
