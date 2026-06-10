"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveGuestCount() {
  const now = new Date();

  const count = await prisma.reservaLeito.count({
    where: {
      reserva: {
        status: "CHECKIN",
        dataCheckin: { lte: now },
        dataCheckout: { gte: now }
      }
    }
  });

  return count;
}
