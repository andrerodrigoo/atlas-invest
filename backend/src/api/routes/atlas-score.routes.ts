import { Router } from "express";
import { assetController } from "@api/controllers/asset.controller";

const router = Router();

// GET /atlas-score/{ticker} - conforme especificação da Parte 12
router.get("/:ticker", (req, res, next) => assetController.getAtlasScore(req, res, next));

export default router;
