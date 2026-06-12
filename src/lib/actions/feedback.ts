"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { FeedbackStatus } from '@prisma/client';

export async function submitFeedback(data: {
  reservaId: string;
  nota: number;
  comentario?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Não autorizado');
  }

  // Verifica se a reserva pertence ao usuário e está CHECKOUT (concluída)
  const reserva = await prisma.reserva.findFirst({
    where: {
      id: data.reservaId,
      usuarioTitularId: session.user.id,
      status: 'CHECKOUT',
    },
  });

  if (!reserva) {
    throw new Error('Reserva não encontrada ou não concluída.');
  }

  const feedback = await prisma.feedback.create({
    data: {
      usuarioId: session.user.id,
      reservaId: data.reservaId,
      nota: data.nota,
      comentario: data.comentario,
      status: FeedbackStatus.PENDENTE,
    },
  });

  revalidatePath('/feedback');
  revalidatePath('/account/reservations');
  return {
    ...feedback,
    nota: Number(feedback.nota)
  };
}

export async function getApprovedFeedbacks() {
  const feedbacks = await prisma.feedback.findMany({
    where: {
      status: FeedbackStatus.APROVADO,
    },
    include: {
      usuario: {
        select: {
          nomeCompleto: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return feedbacks.map(fb => ({
    ...fb,
    nota: Number(fb.nota)
  }));
}
