'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ReservaStatus, QuartoTipo } from "@prisma/client";

export async function getDashboardStats() {
  const session = await auth();
  if (!session || !['ADMIN_GERAL', 'ADMIN_FINANCEIRO'].includes((session.user as { perfil?: string }).perfil || '')) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 1. Total de reservas ativas (CONFIRMADA ou CHECKIN)
  const activeReservationsCount = await prisma.reserva.count({
    where: {
      status: { in: [ReservaStatus.CONFIRMADA, ReservaStatus.CHECKIN] }
    }
  });

  // 2. Hóspedes presentes no momento (CHECKIN)
  // Contamos os leitos ocupados em reservas com status CHECKIN
  const presentGuestsCount = await prisma.reservaLeito.count({
    where: {
      reserva: {
        status: ReservaStatus.CHECKIN
      }
    }
  });

  // 3. Ocupação por tipo de quarto (%)
  const roomTypes = Object.values(QuartoTipo);
  const occupancyByType = await Promise.all(roomTypes.map(async (tipo) => {
    const totalBeds = await prisma.leito.count({
      where: { quarto: { tipo } }
    });

    const occupiedBeds = await prisma.reservaLeito.count({
      where: {
        leito: { quarto: { tipo } },
        reserva: { status: ReservaStatus.CHECKIN }
      }
    });

    return {
      tipo,
      percentage: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
    };
  }));

  // 4. Receita do dia/semana/mês (Pagamentos CONCLUIDOS)
  const [revenueDay, revenueWeek, revenueMonth] = await Promise.all([
    prisma.pagamento.aggregate({
      where: { status: 'CONCLUIDO', createdAt: { gte: today, lt: tomorrow } },
      _sum: { valor: true }
    }),
    prisma.pagamento.aggregate({
      where: { status: 'CONCLUIDO', createdAt: { gte: startOfWeek } },
      _sum: { valor: true }
    }),
    prisma.pagamento.aggregate({
      where: { status: 'CONCLUIDO', createdAt: { gte: startOfMonth } },
      _sum: { valor: true }
    })
  ]);

  return {
    activeReservationsCount,
    presentGuestsCount,
    occupancyByType,
    revenue: {
      day: Number(revenueDay._sum.valor || 0),
      week: Number(revenueWeek._sum.valor || 0),
      month: Number(revenueMonth._sum.valor || 0)
    }
  };
}
