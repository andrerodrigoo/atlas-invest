import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@api/middlewares/auth.middleware";
import { transactionService } from "@application/services/transaction.service";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@api/validators/wallet.validators";
import { AppError } from "@api/middlewares/error-handler.middleware";

export class TransactionController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const walletId = String(req.query.walletId ?? "");
      if (!walletId) {
        throw new AppError("Parâmetro walletId é obrigatório.", 400, ["WALLET_ID_REQUIRED"]);
      }
      const transactions = await transactionService.list(req.user!.sub, walletId);
      return res.status(200).json({
        success: true,
        data: transactions,
        message: "Transações encontradas.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.create({ userId: req.user!.sub, ...input });
      return res.status(201).json({
        success: true,
        data: transaction,
        message: "Transação registrada e indicadores recalculados.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.update(req.user!.sub, req.params.id, input);
      return res.status(200).json({
        success: true,
        data: transaction,
        message: "Transação atualizada e indicadores recalculados.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await transactionService.delete(req.user!.sub, req.params.id);
      return res.status(200).json({
        success: true,
        data: null,
        message: "Transação removida e indicadores recalculados.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const transactionController = new TransactionController();
