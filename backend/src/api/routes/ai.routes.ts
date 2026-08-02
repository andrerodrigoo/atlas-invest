import { Router } from "express";
import { aiController } from "@api/controllers/ai.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/chat", (req, res, next) => aiController.chat(req, res, next));
router.get("/history", (req, res, next) => aiController.history(req, res, next));

export default router;
