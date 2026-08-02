import { Router } from "express";
import { userController } from "@api/controllers/user.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req, res, next) => userController.me(req, res, next));
router.put("/me", authMiddleware, (req, res, next) => userController.updateMe(req, res, next));
router.delete("/me", authMiddleware, (req, res, next) => userController.deleteMe(req, res, next));
router.post("/me/pin", authMiddleware, (req, res, next) => userController.setPin(req, res, next));
router.post("/me/pin/verify", authMiddleware, (req, res, next) =>
  userController.verifyPinEndpoint(req, res, next)
);

export default router;
