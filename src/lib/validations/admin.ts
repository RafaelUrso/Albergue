import { z } from "zod";
import { QuartoTipo, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, LeitoStatus, ReservaStatus } from "@prisma/client";

export const roomSchema = z.object({
  nome: z.string().min(1),
  tipo: z.nativeEnum(QuartoTipo),
  banheiroPrivativo: z.boolean(),
  genero: z.nativeEnum(QuartoGenero),
  ativo: z.boolean().optional(),
});

export const bedSchema = z.object({
  quartoId: z.string().uuid(),
  codigo: z.string().min(1),
  posicao: z.nativeEnum(LeitoPosicao),
  localizacao: z.nativeEnum(LeitoLocalizacao),
  incidenciaSol: z.nativeEnum(LeitoIncidenciaSol),
  status: z.nativeEnum(LeitoStatus),
});

export const reservationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ReservaStatus),
});
