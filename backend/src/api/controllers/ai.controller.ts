import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { aiService } from "@application/services/ai.service";
import { aiChatSchema } from "@api/validators/ai.validators";

export class AiController {
  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { mensagem, conversationId } = aiChatSchema.parse(req.body);
      const resposta = await aiService.chat(req.user!.sub, mensagem, conversationId);
      return res.status(200).json({
        success: true,
        data: resposta,
        message: "Resposta gerada. Conteúdo educativo, não constitui recomendação de investimento.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.query.conversationId as string | undefined;

      const data = conversationId
        ? await aiService.getConversation(req.user!.sub, conversationId)
        : await aiService.listConversations(req.user!.sub);

      return res.status(200).json({
        success: true,
        data,
        message: "Histórico encontrado.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const aiController = new AiController();
