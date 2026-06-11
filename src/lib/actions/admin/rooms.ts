'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { QuartoTipo, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, LeitoStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Rooms
export async function getRooms() {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  return prisma.quarto.findMany({
    include: {
      _count: {
        select: { leitos: true }
      }
    },
    orderBy: { nome: 'asc' }
  });
}

export async function createRoom(data: {
  nome: string;
  tipo: QuartoTipo;
  banheiroPrivativo: boolean;
  genero: QuartoGenero;
}) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const room = await prisma.quarto.create({ data });
  revalidatePath('/admin/rooms');
  return room;
}

export async function updateRoom(id: string, data: {
  nome?: string;
  tipo?: QuartoTipo;
  banheiroPrivativo?: boolean;
  genero?: QuartoGenero;
  ativo?: boolean;
}) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const room = await prisma.quarto.update({
    where: { id },
    data
  });
  revalidatePath('/admin/rooms');
  return room;
}

// Beds
export async function getBeds(quartoId: string) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  return prisma.leito.findMany({
    where: { quartoId },
    orderBy: { codigo: 'asc' }
  });
}

export async function createBed(data: {
  quartoId: string;
  codigo: string;
  posicao: LeitoPosicao;
  localizacao: LeitoLocalizacao;
  incidenciaSol: LeitoIncidenciaSol;
  status: LeitoStatus;
}) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const bed = await prisma.leito.create({ data });
  revalidatePath(`/admin/rooms/${data.quartoId}`);
  return bed;
}

export async function updateBed(id: string, quartoId: string, data: {
  codigo?: string;
  posicao?: LeitoPosicao;
  localizacao?: LeitoLocalizacao;
  incidenciaSol?: LeitoIncidenciaSol;
  status?: LeitoStatus;
}) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const bed = await prisma.leito.update({
    where: { id },
    data
  });
  revalidatePath(`/admin/rooms/${quartoId}`);
  return bed;
}
