import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { alertService } from "@application/services/alert.service";
import { createAlertSchema } from "@api/validators/alert.validators";

export class AlertController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await alertService.list(req.user!.sub);
      return res.status(200).json({ success: true, data: alerts, message: "Alertas encontrados.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createAlertSchema.parse(req.body);
      const alert = await alertService.create({ userId: req.user!.sub, ...input });
      return res.status(201).json({ success: true, data: alert, message: "Alerta criado com sucesso.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await alertService.delete(req.user!.sub, req.params.id);
      return res.status(200).json({ success: true, data: null, message: "Alerta removido.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }
}

export const alertController = new AlertController();
