import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { walletService } from "@application/services/wallet.service";
import { createWalletSchema, updateWalletSchema } from "@api/validators/wallet.validators";

export class WalletController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wallets = await walletService.listByUser(req.user!.sub);
      return res.status(200).json({
        success: true,
        data: wallets,
        message: "Carteiras encontradas.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createWalletSchema.parse(req.body);
      const wallet = await walletService.create({ userId: req.user!.sub, ...input });
      return res.status(201).json({
        success: true,
        data: wallet,
        message: "Carteira criada com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = updateWalletSchema.parse(req.body);
      const wallet = await walletService.update(req.user!.sub, req.params.id, input);
      return res.status(200).json({
        success: true,
        data: wallet,
        message: "Carteira atualizada com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await walletService.delete(req.user!.sub, req.params.id);
      return res.status(200).json({
        success: true,
        data: null,
        message: "Carteira removida com sucesso.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const walletController = new WalletController();
