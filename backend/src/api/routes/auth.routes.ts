import { Router } from "express";
import { authController } from "@api/controllers/auth.controller";

const router = Router();

// Conforme Parte 12 - Especificação das APIs
router.post("/register", (req, res, next) => authController.register(req, res, next));
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/refresh", (req, res, next) => authController.refresh(req, res, next));
router.post("/logout", (req, res, next) => authController.logout(req, res, next));
router.post("/forgot-password", (req, res, next) => authController.forgotPassword(req, res, next));
router.post("/confirm-email", (req, res, next) => authController.confirmEmail(req, res, next));
router.post("/reset-password", (req, res, next) => authController.resetPassword(req, res, next));

export default router;
