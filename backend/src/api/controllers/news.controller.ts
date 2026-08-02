import { Request, Response, NextFunction } from "express";
import { newsService } from "@application/services/news.service";

export class NewsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const result = await newsService.list(page, pageSize);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Notícias encontradas. Resumos gerados a partir de fontes públicas.",
        errors: [],
      });
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const news = await newsService.getByIdOrThrow(req.params.id);
      return res.status(200).json({ success: true, data: news, message: "Notícia encontrada.", errors: [] });
    } catch (err) {
      return next(err);
    }
  }
}

export const newsController = new NewsController();
