import { Router } from "express";
import { subscriptionController } from "@api/controllers/subscription.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res, next) => subscriptionController.getCurrent(req, res, next));
router.post("/start-trial", (req, res, next) => subscriptionController.startTrial(req, res, next));
router.post("/cancel", (req, res, next) => subscriptionController.cancel(req, res, next));

export default router;
