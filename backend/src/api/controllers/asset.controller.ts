import { Request, Response, NextFunction } from "express";
import { assetService } from "@application/services/asset.service";

export class AssetController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await assetService.list();
      return res.status(200).json({ success: true, data: assets, message: "Ativos encontrados.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const termo = String(req.query.q ?? "");
      const assets = await assetService.search(termo);
      return res.status(200).json({ success: true, data: assets, message: "Busca realizada.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async getByTicker(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.getByTickerOrThrow(req.params.ticker);
      return res.status(200).json({ success: true, data: asset, message: "Ativo encontrado.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }

  async getDividends(req: Request, res: Response, next: NextFunction) {
    try {
      const dividends = await assetService.getDividendsByTicker(req.params.ticker);
      return res.status(200).json({
        success: true,
        data: dividends,
        message: "Histórico de dividendos encontrado.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async getAtlasScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await assetService.getAtlasScoreByTicker(req.params.ticker);
      return res.status(200).json({
        success: true,
        data: score,
        message: "Atlas Score é educativo e não representa recomendação de investimento.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const assetController = new AssetController();
