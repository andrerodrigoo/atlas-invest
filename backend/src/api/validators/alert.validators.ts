import { z } from "zod";

export const createAlertSchema = z.object({
  ticker: z.string().min(1, "Ticker é obrigatório").optional(),
  tipo: z.string().min(1, "Tipo do alerta é obrigatório"),
  condicao: z.record(z.string(), z.any()),
});
