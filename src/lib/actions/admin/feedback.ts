'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FeedbackStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getFeedbacks(status?: FeedbackStatus) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  return prisma.feedback.findMany({
    where: status ? { status } : {},
    include: {
      usuario: true,
      reserva: true,
      moderador: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function moderateFeedback(id: string, status: FeedbackStatus) {
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    throw new Error("Unauthorized");
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data: {
      status,
      moderadoPorId: session.user?.id
    }
  });

  revalidatePath('/admin/feedback');
  return feedback;
}

// Resposta de feedback não está no schema explicitamente como um campo 'resposta',
// mas RF-025 diz "responder". Vou assumir que por enquanto responder é apenas aprovar/rejeitar
// ou poderíamos adicionar um campo no futuro. Como não posso mudar o schema, vou apenas implementar o status por enquanto.
// Edit: Se precisar mesmo de resposta de texto, teria que alterar o schema.
// No AGENTS.md diz "aprovar, rejeitar e responder".
// No schema.prisma fornecido NÃO tem campo 'resposta'.
// Vou seguir o schema e deixar a "resposta" apenas como intenção se o schema mudar.
