"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { Perfil } from '@prisma/client';

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

  const updatedUser = await prisma.usuario.update({
    where: { id: session.user.id },
    data: {
      ...data,
    },
  });

  revalidatePath('/account/profile');
  return updatedUser;
}
