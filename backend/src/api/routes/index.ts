import { Router } from "express";
import authRoutes from "@api/routes/auth.routes";
import userRoutes from "@api/routes/user.routes";
import walletRoutes from "@api/routes/wallet.routes";
import assetRoutes from "@api/routes/asset.routes";
import transactionRoutes from "@api/routes/transaction.routes";
import atlasScoreRoutes from "@api/routes/atlas-score.routes";
import aiRoutes from "@api/routes/ai.routes";
import newsRoutes from "@api/routes/news.routes";
import notificationRoutes from "@api/routes/notification.routes";
import alertRoutes from "@api/routes/alert.routes";
import subscriptionRoutes from "@api/routes/subscription.routes";
import adminRoutes from "@api/routes/admin.routes";

const router = Router();

// Health check - usado por monitoramento e orquestração de deploy (Parte 8, 20)
router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" }, message: "Atlas Invest API", errors: [] });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/wallets", walletRoutes);
router.use("/assets", assetRoutes);
router.use("/transactions", transactionRoutes);
router.use("/atlas-score", atlasScoreRoutes);
router.use("/ai", aiRoutes);
router.use("/news", newsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/alerts", alertRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/admin", adminRoutes);

export default router;
