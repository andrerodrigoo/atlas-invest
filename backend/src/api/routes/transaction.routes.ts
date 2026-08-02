import { Router } from "express";
import { transactionController } from "@api/controllers/transaction.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res, next) => transactionController.list(req, res, next));
router.post("/", (req, res, next) => transactionController.create(req, res, next));
router.put("/:id", (req, res, next) => transactionController.update(req, res, next));
router.delete("/:id", (req, res, next) => transactionController.delete(req, res, next));

export default router;
