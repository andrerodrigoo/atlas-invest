import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { notificationService } from "@application/services/notification.service";

export class NotificationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.list(req.user!.sub);
      return res.status(200).json({
        success: true,
        data: notifications,
        message: "Notificações encontradas.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ids: string[] | undefined = req.body?.ids;
      await notificationService.markAsRead(req.user!.sub, ids);
      return res.status(200).json({
        success: true,
        data: null,
        message: "Notificações marcadas como lidas.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const notificationController = new NotificationController();
