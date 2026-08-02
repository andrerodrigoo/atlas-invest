import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { subscriptionService } from "@application/services/subscription.service";

export class SubscriptionController {
  async getCurrent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionService.getCurrent(req.user!.sub);
      return res.status(200).json({ success: true, data: subscription, message: "Assinatura encontrada.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async startTrial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionService.startTrial(req.user!.sub);
      return res.status(200).json({
        success: true,
        data: subscription,
        message: "Teste grátis iniciado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionService.cancel(req.user!.sub);
      return res.status(200).json({
        success: true,
        data: subscription,
        message: "Assinatura cancelada.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const subscriptionController = new SubscriptionController();
