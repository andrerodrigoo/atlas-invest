import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const broadcastNotificationSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  mensagem: z.string().min(1, "Mensagem é obrigatória"),
  userIds: z.array(z.string().uuid()).optional(),
});
