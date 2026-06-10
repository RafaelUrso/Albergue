"use server";

import { prisma } from "@/lib/prisma";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";
import { auth } from "@/auth";
import { Prisma, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol } from "@prisma/client";

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
  checkin.setUTCHours(12, 0, 0, 0);
  const checkout = new Date(params.checkOut);
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

  return leitos;
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
      const tarifa = await tx.tarifa.findFirst({
        where: { quartoTipo: leito.quarto.tipo },
        orderBy: { createdAt: 'desc' }
      });
      if (!tarifa) throw new Error(`Tarifa não definida para o tipo ${leito.quarto.tipo}`);
      valorTotal = valorTotal.add(tarifa.valorDiaria.mul(numDiarias));
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

    return reserva;
  });
}

export async function calculateEstimatedPrice(leitosIds: string[], checkIn: string, checkOut: string) {
  const checkin = new Date(checkIn);
  const checkout = new Date(checkOut);
  const numDiarias = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

  const leitos = await prisma.leito.findMany({
    where: { id: { in: leitosIds } },
    include: { quarto: true }
  });

  let valorTotal = 0;

  for (const leito of leitos) {
    const tarifa = await prisma.tarifa.findFirst({
      where: { quartoTipo: leito.quarto.tipo },
      orderBy: { createdAt: 'desc' }
    });
    if (tarifa) {
      valorTotal += Number(tarifa.valorDiaria) * numDiarias;
    }
  }

  return valorTotal;
}
