import { Router } from "express";
import { alertController } from "@api/controllers/alert.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res, next) => alertController.list(req, res, next));
router.post("/", (req, res, next) => alertController.create(req, res, next));
router.delete("/:id", (req, res, next) => alertController.delete(req, res, next));

export default router;
