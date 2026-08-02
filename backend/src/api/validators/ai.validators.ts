import { z } from "zod";

export const aiChatSchema = z.object({
  mensagem: z.string().min(1, "Mensagem é obrigatória"),
  conversationId: z.string().uuid().optional(),
});
