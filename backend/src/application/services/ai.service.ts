import { prisma } from "@infrastructure/database/prisma-client";
import { aiProvider } from "@infrastructure/ai/mock-ai-provider";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { MessageRole } from "@prisma/client";

export class AiService {
  // Fluxo (Parte 17): validação -> recuperação de contexto -> geração -> histórico
  async chat(userId: string, mensagem: string, conversationId?: string) {
    const conversation = conversationId
      ? await this.getOwnedConversationOrThrow(userId, conversationId)
      : await prisma.aiConversation.create({
          data: { userId, titulo: mensagem.slice(0, 60) },
        });

    await prisma.aiMessage.create({
      data: { conversationId: conversation.id, papel: MessageRole.USER, mensagem },
    });

    const historicoAnterior = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: "asc" },
      take: 20, // janela de contexto simples
    });

    const resposta = await aiProvider.gerarResposta({
      historico: historicoAnterior
        .filter((m: { papel: MessageRole }) => m.papel !== MessageRole.SYSTEM)
        .map((m: { papel: MessageRole; mensagem: string }) => ({
          papel: m.papel as "USER" | "ASSISTANT",
          mensagem: m.mensagem,
        })),
      novaMensagem: mensagem,
    });

    const assistantMessage = await prisma.aiMessage.create({
      data: { conversationId: conversation.id, papel: MessageRole.ASSISTANT, mensagem: resposta },
    });

    return {
      conversationId: conversation.id,
      resposta: assistantMessage.mensagem,
      timestamp: assistantMessage.timestamp,
    };
  }

  // Histórico por usuário (Parte 17: memória respeitando privacidade)
  async listConversations(userId: string) {
    return prisma.aiConversation.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { timestamp: "desc" }, take: 1 },
      },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.getOwnedConversationOrThrow(userId, conversationId);
    return prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: "asc" },
    });
  }

  private async getOwnedConversationOrThrow(userId: string, conversationId: string) {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });
    if (!conversation) {
      throw new AppError("Conversa não encontrada.", 404, ["CONVERSATION_NOT_FOUND"]);
    }
    return conversation;
  }
}

export const aiService = new AiService();
