"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * RF-022 / RF-023 / RN-016 / RN-017 / RN-028 a RN-031
 */

export async function getConfiguracao(chave: string) {
  const config = await prisma.configuracao.findUnique({
    where: { chave }
  });
  return config?.valor || null;
}

export async function updateConfiguracao(chave: string, valor: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { perfil?: string }).perfil !== "ADMIN_GERAL") {
    throw new Error("Não autorizado");
  }

  const oldConfig = await prisma.configuracao.findUnique({ where: { chave } });

  const config = await prisma.configuracao.upsert({
    where: { chave },
    update: { valor },
    create: { chave, valor },
  });

  // Log de auditoria
  await prisma.auditLog.create({
    data: {
      usuarioId: session.user!.id!,
      acao: "UPDATE_CONFIG",
      entidade: "Configuracao",
      entidadeId: config.id,
      dadosAnteriores: oldConfig ? { valor: oldConfig.valor } : Prisma.JsonNull,
      dadosNovos: { valor: config.valor },
    },
  });

  revalidatePath("/admin/settings");
  return config;
}

export async function calculateRefund(reservaId: string) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: {
      leitos: {
        include: {
          leito: {
            include: { quarto: true }
          }
        }
      }
    }
  });

  if (!reserva) throw new Error("Reserva não encontrada");

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  const checkin = new Date(reserva.dataCheckin);
  checkin.setUTCHours(12, 0, 0, 0);

  const diffTime = checkin.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const valorTotal = Number(reserva.valorTotal);
  let valorEstornado = 0;
  let taxaRetida = 0;
  let politicaAplicada = "";

  if (diffDays >= 5) {
    // 5 dias ou mais: gratuito, estorno integral
    valorEstornado = valorTotal;
    taxaRetida = 0;
    politicaAplicada = "GRATUITO_5_DIAS_OU_MAIS";
  } else if (diffDays >= 1 && diffDays <= 4) {
    // 1 a 4 dias: aplica taxa de cancelamento
    const feeType = await getConfiguracao("CANCELLATION_FEE_TYPE") || "PERCENT";
    const feeValue = parseFloat(await getConfiguracao("CANCELLATION_FEE_VALUE") || "20");

    if (feeType === "FIXED") {
      taxaRetida = Math.min(feeValue, valorTotal);
    } else {
      taxaRetida = (valorTotal * feeValue) / 100;
    }
    valorEstornado = Math.max(0, valorTotal - taxaRetida);
    politicaAplicada = "TAXA_1_A_4_DIAS";
  } else {
    // No dia do check-in ou no-show: cobrança integral da primeira diária ou taxa máxima
    // Vamos calcular o valor da primeira diária
    // Simplificação: valorTotal / numDiarias (Assumindo que todas as diárias foram pagas e calculadas)
    const numDiarias = Math.ceil((reserva.dataCheckout.getTime() - reserva.dataCheckin.getTime()) / (1000 * 60 * 60 * 24));
    const valorPrimeiraDiaria = valorTotal / numDiarias;

    const maxFee = parseFloat(await getConfiguracao("CANCELLATION_MAX_FEE") || "100"); // Padrão 100 se não definido
    taxaRetida = Math.max(valorPrimeiraDiaria, (valorTotal * maxFee) / 100);
    taxaRetida = Math.min(taxaRetida, valorTotal);

    valorEstornado = Math.max(0, valorTotal - taxaRetida);
    politicaAplicada = "NO_DAY_OR_NOSHOW";
  }

  return {
    valorTotal,
    valorEstornado,
    taxaRetida,
    politicaAplicada,
    diffDays
  };
}

export async function cancelReservation(reservaId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  const refundDetails = await calculateRefund(reservaId);

  return await prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({
      where: { id: reservaId }
    });

    if (!reserva) throw new Error("Reserva não encontrada");
    if (reserva.status === "CANCELADA") throw new Error("Reserva já está cancelada");

    // Marcar reserva como CANCELADA
    await tx.reserva.update({
      where: { id: reservaId },
      data: { status: "CANCELADA" }
    });

    // Registrar cancelamento
    const cancelamento = await tx.cancelamento.create({
      data: {
        reservaId,
        valorEstornado: new Prisma.Decimal(refundDetails.valorEstornado),
        taxaRetida: new Prisma.Decimal(refundDetails.taxaRetida),
        politicaAplicada: refundDetails.politicaAplicada,
        confirmadoPorUsuario: true,
      }
    });

    // Registrar no AuditLog
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "CANCELAR_RESERVA",
        entidade: "Reserva",
        entidadeId: reservaId,
        dadosAnteriores: { status: reserva.status },
        dadosNovos: { status: "CANCELADA", cancelamentoId: cancelamento.id },
      }
    });

    // Mock estorno via gateway (PagamentoStatus -> ESTORNADO se houver pagamento concluído)
    const pagamentos = await tx.pagamento.findMany({
      where: { reservaId, status: "CONCLUIDO" }
    });

    for (const p of pagamentos) {
      await tx.pagamento.update({
        where: { id: p.id },
        data: { status: "ESTORNADO" }
      });
    }

    revalidatePath("/account/reservations");
    revalidatePath("/admin/dashboard");

    return cancelamento;
  });
}

export async function getUserReservations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  const reservas = await prisma.reserva.findMany({
    where: { usuarioTitularId: session.user.id },
    include: {
      leitos: {
        include: {
          leito: {
            include: { quarto: true }
          }
        }
      },
      cancelamento: true
    },
    orderBy: { dataCheckin: "desc" }
  });

  return reservas.map(r => ({
    ...r,
    valorTotal: Number(r.valorTotal),
    valorPago: Number(r.valorPago),
    cancelamento: r.cancelamento ? {
      ...r.cancelamento,
      valorEstornado: Number(r.cancelamento.valorEstornado),
      taxaRetida: Number(r.cancelamento.taxaRetida),
    } : null
  }));
}
