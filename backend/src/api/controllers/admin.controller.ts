import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { adminAuthService } from "@application/services/admin-auth.service";
import { adminService } from "@application/services/admin.service";
import { adminLoginSchema, broadcastNotificationSchema } from "@api/validators/admin.validators";

export class AdminController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = adminLoginSchema.parse(req.body);
      const data = await adminAuthService.login(email, senha);
      return res.status(200).json({ success: true, data, message: "Login administrativo realizado.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async dashboard(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.dashboard();
      return res.status(200).json({ success: true, data, message: "Resumo executivo.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async users(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const data = await adminService.listUsers(page, pageSize);
      return res.status(200).json({ success: true, data, message: "Usuários encontrados.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async metrics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.metrics();
      return res.status(200).json({ success: true, data, message: "Métricas encontradas.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async broadcastNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { titulo, mensagem, userIds } = broadcastNotificationSchema.parse(req.body);
      const data = await adminService.broadcastNotification(titulo, mensagem, userIds);
      return res.status(201).json({ success: true, data, message: "Notificações enviadas.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }
}

export const adminController = new AdminController();
