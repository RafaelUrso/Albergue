import { z } from "zod";

export const acompanhanteSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome do acompanhante deve ter pelo menos 3 caracteres"),
  documento: z.string().min(5, "Documento do acompanhante inválido"),
  leitoId: z.string().uuid("ID do leito inválido"),
});

export const declaracaoGrupoSchema = z.object({
  qtdAdultos: z.number().min(1, "Mínimo de 1 adulto"),
  qtdCriancas: z.number().min(0).max(4, "Máximo de 4 crianças"),
  possuiPcd: z.boolean().default(false),
  qtdPcd: z.number().min(0).default(0),
  descricaoDeficiencias: z.string().optional(),
});

export const bookingSchema = z.object({
  dataCheckin: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de check-in inválida"),
  dataCheckout: z.string().refine((date) => !isNaN(Date.parse(date)), "Data de check-out inválida"),
  leitosIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos um leito"),
  acompanhantes: z.array(acompanhanteSchema),
  declaracaoGrupo: declaracaoGrupoSchema,
  quartoInteiroId: z.string().uuid().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
