import { Router } from "express";
import { walletController } from "@api/controllers/wallet.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware); // todas as rotas de carteira exigem autenticação

router.get("/", (req, res, next) => walletController.list(req, res, next));
router.post("/", (req, res, next) => walletController.create(req, res, next));
router.put("/:id", (req, res, next) => walletController.update(req, res, next));
router.delete("/:id", (req, res, next) => walletController.delete(req, res, next));

export default router;
