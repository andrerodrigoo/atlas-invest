import { Router } from "express";
import { assetController } from "@api/controllers/asset.controller";

const router = Router();

// Consulta de ativos é pública (dados de mercado), conforme Parte 12
router.get("/search", (req, res, next) => assetController.search(req, res, next));
router.get("/:ticker/dividends", (req, res, next) => assetController.getDividends(req, res, next));
router.get("/:ticker", (req, res, next) => assetController.getByTicker(req, res, next));
router.get("/", (req, res, next) => assetController.list(req, res, next));

export default router;
