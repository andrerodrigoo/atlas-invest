import { Request, Response, NextFunction } from "express";
import { authService } from "@application/services/auth.service";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  confirmEmailSchema,
  resetPasswordSchema,
} from "@api/validators/auth.validators";
import { env } from "@config/env";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const data = await authService.register(input);
      return res.status(201).json({
        success: true,
        data: env.nodeEnv !== "production" ? data : { id: data.id, email: data.email, nome: data.nome },
        message: "Cadastro realizado. Verifique seu e-mail para confirmar a conta.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const data = await authService.login(input);
      return res.status(200).json({
        success: true,
        data,
        message: "Login realizado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const data = await authService.refresh(refreshToken);
      return res.status(200).json({
        success: true,
        data,
        message: "Token renovado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      await authService.logout(refreshToken);
      return res.status(200).json({
        success: true,
        data: null,
        message: "Logout realizado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const resetToken = await authService.forgotPassword(email);
      return res.status(200).json({
        success: true,
        // resetToken só é incluído fora de produção (sem provedor de e-mail configurado ainda)
        data: env.nodeEnv !== "production" ? { resetToken } : null,
        message: "Se o e-mail existir em nossa base, enviaremos instruções de redefinição.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = confirmEmailSchema.parse(req.body);
      await authService.confirmEmail(token);
      return res.status(200).json({
        success: true,
        data: null,
        message: "E-mail confirmado com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, novaSenha } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, novaSenha);
      return res.status(200).json({
        success: true,
        data: null,
        message: "Senha redefinida com sucesso. Faça login novamente.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const authController = new AuthController();
