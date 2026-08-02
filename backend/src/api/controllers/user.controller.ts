import { Response, NextFunction } from "express";
import { prisma } from "@infrastructure/database/prisma-client";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { setPinSchema } from "@api/validators/auth.validators";
import { hashPin, verifyPin } from "@infrastructure/security/password";

export class UserController {
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.sub },
        include: { profile: true, subscriptions: true },
      });

      if (!user || user.deletedAt) {
        throw new AppError("Usuário não encontrado.", 404, ["USER_NOT_FOUND"]);
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          status: user.status,
          idioma: user.idioma,
          profile: user.profile,
          subscriptions: user.subscriptions,
        },
        message: "Usuário encontrado.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { nomeCompleto, objetivoFinanceiro, perfilRisco } = req.body ?? {};

      const profile = await prisma.profile.update({
        where: { userId: req.user!.sub },
        data: { nomeCompleto, objetivoFinanceiro, perfilRisco },
      });

      return res.status(200).json({
        success: true,
        data: profile,
        message: "Perfil atualizado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  // Exclusão lógica (soft delete) - Parte 13/16: LGPD, usuário pode solicitar exclusão
  async deleteMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.user.update({
        where: { id: req.user!.sub },
        data: { deletedAt: new Date(), status: "DELETED" },
      });

      return res.status(200).json({
        success: true,
        data: null,
        message: "Conta marcada para exclusão conforme solicitado.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
  // PIN protege o acesso ao app após a configuração inicial (Parte 13, 16)
  async setPin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { pin } = setPinSchema.parse(req.body);
      const pinHash = await hashPin(pin);

      await prisma.user.update({ where: { id: req.user!.sub }, data: { pinHash } });
      await prisma.auditLog.create({
        data: { userId: req.user!.sub, acao: "PIN_CONFIGURADO" },
      });

      return res.status(200).json({
        success: true,
        data: null,
        message: "PIN configurado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async verifyPinEndpoint(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { pin } = setPinSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });

      if (!user?.pinHash) {
        throw new AppError("PIN ainda não configurado.", 400, ["PIN_NOT_SET"]);
      }

      const valido = await verifyPin(pin, user.pinHash);
      if (!valido) {
        throw new AppError("PIN incorreto.", 401, ["INVALID_PIN"]);
      }

      return res.status(200).json({
        success: true,
        data: { valido: true },
        message: "PIN válido.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const userController = new UserController();
