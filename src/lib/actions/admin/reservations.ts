'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ReservaStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getFilteredReservations(filters: {
  status?: ReservaStatus;
  guestName?: string;
  startDate?: string;
  endDate?: string;
  room?: string;
}) {
  const session = await auth();
  if (!session || !['ADMIN_GERAL', 'ADMIN_FINANCEIRO'].includes((session.user as { perfil?: string }).perfil || '')) {
    throw new Error("Unauthorized");
  }

  const where: {
    status?: ReservaStatus;
    usuarioTitular?: {
      nomeCompleto: { contains: string; mode: 'insensitive' };
    };
    dataCheckin?: {
      gte?: Date;
      lte?: Date;
    };
    leitos?: {
      some: {
        leito: {
          quarto: {
            nome: { contains: string; mode: 'insensitive' };
          };
        };
      };
    };
  } = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.guestName) {
    where.usuarioTitular = {
      nomeCompleto: { contains: filters.guestName, mode: 'insensitive' }
    };
  }

  if (filters.startDate || filters.endDate) {
    where.dataCheckin = {};
    if (filters.startDate) {
      where.dataCheckin.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.dataCheckin.lte = new Date(filters.endDate);
    }
  }

  if (filters.room) {
    where.leitos = {
      some: {
        leito: {
          quarto: {
            nome: { contains: filters.room, mode: 'insensitive' }
          }
        }
      }
    };
  }

  const reservations = await prisma.reserva.findMany({
    where,
    include: {
      usuarioTitular: true,
      leitos: {
        include: {
          leito: {
            include: {
              quarto: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Decimal to Number for client
  return reservations.map(r => ({
    ...r,
    valorTotal: Number(r.valorTotal),
    valorPago: Number(r.valorPago)
  }));
}

export async function updateReservationStatus(id: string, status: ReservaStatus) {
  const session = await auth();
  const perfil = (session?.user as { perfil?: string })?.perfil;
  if (!session || !['ADMIN_GERAL', 'ADMIN_FINANCEIRO', 'RECEPCIONISTA'].includes(perfil || '')) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.reserva.update({
    where: { id },
    data: { status }
  });

  revalidatePath('/admin/reservations');
  revalidatePath('/reception');

  return updated;
}
