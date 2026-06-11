'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: {
      nomeCompleto: true,
      email: true,
      telefone: true,
      nacionalidade: true,
      dataNascimento: true,
      documentoIdentificacao: true,
      perfil: true,
    }
  });
}
