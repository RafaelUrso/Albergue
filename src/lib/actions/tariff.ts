"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { QuartoTipo, TarifaTipo, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * RF-019 / RF-020 / RN-014 / RN-023 / RN-024
 */

export async function getTariffForDate(quartoTipo: QuartoTipo, date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(12, 0, 0, 0);

  // Precedência: PROMOCIONAL > SAZONAL > PADRAO

  // 1. PROMOCIONAL
  const promocional = await prisma.tarifa.findFirst({
    where: {
      quartoTipo,
      tipo: "PROMOCIONAL",
      dataInicio: { lte: normalizedDate },
      dataFim: { gte: normalizedDate },
    },
    orderBy: { createdAt: "desc" },
  });
  if (promocional) return promocional;

  // 2. SAZONAL
  const sazonal = await prisma.tarifa.findFirst({
    where: {
      quartoTipo,
      tipo: "SAZONAL",
      dataInicio: { lte: normalizedDate },
      dataFim: { gte: normalizedDate },
    },
    orderBy: { createdAt: "desc" },
  });
  if (sazonal) return sazonal;

  // 3. PADRAO
  const padrao = await prisma.tarifa.findFirst({
    where: {
      quartoTipo,
      tipo: "PADRAO",
    },
    orderBy: { createdAt: "desc" },
  });

  return padrao;
}

export async function getAllTariffs() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN_GERAL", "ADMIN_FINANCEIRO"].includes((session.user as { perfil?: string }).perfil || "")) {
    throw new Error("Não autorizado");
  }
  return await prisma.tarifa.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function saveTariff(data: {
  id?: string;
  quartoTipo: QuartoTipo;
  valorDiaria: number;
  tipo: TarifaTipo;
  dataInicio?: Date | null;
  dataFim?: Date | null;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { perfil?: string }).perfil !== "ADMIN_GERAL") {
    throw new Error("Não autorizado");
  }

  const { id, quartoTipo, valorDiaria, tipo, dataInicio, dataFim } = data;

  return await prisma.$transaction(async (tx) => {
    let oldTariff = null;
    if (id) {
      oldTariff = await tx.tarifa.findUnique({ where: { id } });
    } else if (tipo === "PADRAO") {
      // Se for padrão, verifica se já existe um para esse tipo de quarto
      oldTariff = await tx.tarifa.findFirst({
        where: { quartoTipo, tipo: "PADRAO" },
      });
    }

    const tariff = await tx.tarifa.upsert({
      where: { id: id || oldTariff?.id || "new-id" },
      update: {
        valorDiaria: new Prisma.Decimal(valorDiaria),
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        criadoPorId: session.user!.id!,
      },
      create: {
        quartoTipo,
        valorDiaria: new Prisma.Decimal(valorDiaria),
        tipo,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        criadoPorId: session.user!.id!,
      },
    });

    // Log de auditoria
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: id || oldTariff ? "UPDATE_TARIFA" : "CREATE_TARIFA",
        entidade: "Tarifa",
        entidadeId: tariff.id,
        dadosAnteriores: oldTariff ? JSON.parse(JSON.stringify(oldTariff)) : Prisma.JsonNull,
        dadosNovos: JSON.parse(JSON.stringify(tariff)),
      },
    });

    revalidatePath("/admin/tariffs");
    return tariff;
  });
}

export async function deleteTariff(id: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { perfil?: string }).perfil !== "ADMIN_GERAL") {
    throw new Error("Não autorizado");
  }

  return await prisma.$transaction(async (tx) => {
    const oldTariff = await tx.tarifa.findUnique({ where: { id } });
    if (!oldTariff) throw new Error("Tarifa não encontrada");

    await tx.tarifa.delete({ where: { id } });

    // Log de auditoria
    await tx.auditLog.create({
      data: {
        usuarioId: session.user!.id!,
        acao: "DELETE_TARIFA",
        entidade: "Tarifa",
        entidadeId: id,
        dadosAnteriores: JSON.parse(JSON.stringify(oldTariff)),
        dadosNovos: Prisma.JsonNull,
      },
    });

    revalidatePath("/admin/tariffs");
  });
}
