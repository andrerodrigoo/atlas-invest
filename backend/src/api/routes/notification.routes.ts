import { Router } from "express";
import { notificationController } from "@api/controllers/notification.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res, next) => notificationController.list(req, res, next));
router.put("/read", (req, res, next) => notificationController.markAsRead(req, res, next));

export default router;
