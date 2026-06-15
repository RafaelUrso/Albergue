"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { Perfil, Prisma } from '@prisma/client';

export async function updateUserProfile(data: {
  nomeCompleto?: string;
  telefone?: string;
  nacionalidade?: string;
  dataNascimento?: Date;
  documentoIdentificacao?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado');
  }

  const oldUser = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.usuario.update({
      where: { id: session.user!.id! },
      data: {
        ...data,
      },
    });

    // Log de auditoria
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "UPDATE_PROFILE",
        entidade: "Usuario",
        entidadeId: user.id,
        dadosAnteriores: oldUser ? JSON.parse(JSON.stringify(oldUser)) : Prisma.JsonNull,
        dadosNovos: JSON.parse(JSON.stringify(user)),
      },
    });

    return user;
  });

  revalidatePath('/account/profile');
  return updatedUser;
}
