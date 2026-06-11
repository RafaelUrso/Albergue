import { prisma } from "@/lib/prisma";
import { getTariffForDate } from "@/lib/actions/tariff";

export async function getPublicRooms() {
  const rooms = await prisma.quarto.findMany({
    where: { ativo: true },
    include: {
      leitos: true
    },
    orderBy: { nome: 'asc' }
  });

  const today = new Date();

  const roomsWithTariffs = await Promise.all(rooms.map(async (room) => {
    const tariff = await getTariffForDate(room.tipo, today);
    return {
      ...room,
      valorDiaria: tariff ? Number(tariff.valorDiaria) : 0
    };
  }));

  return roomsWithTariffs;
}
