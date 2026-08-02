import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";

export class NewsService {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.news.findMany({
        orderBy: { publicadoEm: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.news.count(),
    ]);

    return { items, total, page, pageSize };
  }

  async getByIdOrThrow(id: string) {
    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      throw new AppError("Notícia não encontrada.", 404, ["NEWS_NOT_FOUND"]);
    }
    return news;
  }
}

export const newsService = new NewsService();
