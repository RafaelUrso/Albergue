'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { QuartoTipo, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, LeitoStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { roomSchema, bedSchema } from "@/lib/validations/admin";

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

export async function createRoom(input: unknown) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const data = roomSchema.parse(input);

  const room = await prisma.$transaction(async (tx) => {
    const newRoom = await tx.quarto.create({ data });

    // Audit Log
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "CREATE_ROOM",
        entidade: "Quarto",
        entidadeId: newRoom.id,
        dadosNovos: data as Prisma.InputJsonValue,
      }
    });

    return newRoom;
  });

  revalidatePath('/admin/rooms');
  return room;
}

export async function updateRoom(id: string, input: unknown) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const data = roomSchema.partial().parse(input);
  const oldRoom = await prisma.quarto.findUnique({ where: { id } });

  const room = await prisma.$transaction(async (tx) => {
    const updatedRoom = await tx.quarto.update({
      where: { id },
      data
    });

    // Audit Log
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "UPDATE_ROOM",
        entidade: "Quarto",
        entidadeId: id,
        dadosAnteriores: oldRoom as Prisma.InputJsonValue,
        dadosNovos: data as Prisma.InputJsonValue,
      }
    });

    return updatedRoom;
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

export async function createBed(input: unknown) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const data = bedSchema.parse(input);

  const bed = await prisma.$transaction(async (tx) => {
    const newBed = await tx.leito.create({ data });

    // Audit Log
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "CREATE_BED",
        entidade: "Leito",
        entidadeId: newBed.id,
        dadosNovos: data as Prisma.InputJsonValue,
      }
    });

    return newBed;
  });

  revalidatePath(`/admin/rooms/${data.quartoId}`);
  return bed;
}

export async function updateBed(id: string, quartoId: string, input: unknown) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const data = bedSchema.partial().parse(input);
  const oldBed = await prisma.leito.findUnique({ where: { id } });

  const bed = await prisma.$transaction(async (tx) => {
    const updatedBed = await tx.leito.update({
      where: { id },
      data
    });

    // Audit Log
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "UPDATE_BED",
        entidade: "Leito",
        entidadeId: id,
        dadosAnteriores: oldBed as Prisma.InputJsonValue,
        dadosNovos: data as Prisma.InputJsonValue,
      }
    });

    return updatedBed;
  });
  revalidatePath(`/admin/rooms/${quartoId}`);
  return bed;
}
