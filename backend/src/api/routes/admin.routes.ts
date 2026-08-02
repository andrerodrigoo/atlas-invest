import { Router } from "express";
import { adminController } from "@api/controllers/admin.controller";
import { authMiddleware, requireRole } from "@api/middlewares/auth.middleware";

const router = Router();

// Login administrativo é público (é o próprio mecanismo de autenticação)
router.post("/auth/login", (req, res, next) => adminController.login(req, res, next));

// Demais rotas exigem token administrativo válido com papel autorizado
router.use(authMiddleware, requireRole("suporte", "administrador"));

router.get("/dashboard", (req, res, next) => adminController.dashboard(req, res, next));
router.get("/users", (req, res, next) => adminController.users(req, res, next));
router.get("/metrics", (req, res, next) => adminController.metrics(req, res, next));
router.post("/notifications", (req, res, next) => adminController.broadcastNotification(req, res, next));

export default router;
