import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { AssetType } from "@prisma/client";

export class AssetService {
  async search(termo: string) {
    return prisma.asset.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ticker: { contains: termo, mode: "insensitive" } },
          { nome: { contains: termo, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { ticker: "asc" },
    });
  }

  async list() {
    return prisma.asset.findMany({
      where: { deletedAt: null },
      orderBy: { ticker: "asc" },
    });
  }

  async getByTickerOrThrow(ticker: string) {
    const asset = await prisma.asset.findFirst({
      where: { ticker: ticker.toUpperCase(), deletedAt: null },
    });

    if (!asset) {
      throw new AppError("Ativo não encontrado.", 404, ["ASSET_NOT_FOUND"]);
    }

    return asset;
  }

  // Cadastro manual de ativo (Parte 13) - reaproveita se o ticker já existir
  async findOrCreateByTicker(ticker: string, tipo: AssetType = AssetType.OUTRO) {
    const tickerUpper = ticker.toUpperCase();
    const existing = await prisma.asset.findUnique({ where: { ticker: tickerUpper } });
    if (existing) return existing;

    return prisma.asset.create({
      data: { ticker: tickerUpper, nome: tickerUpper, tipo },
    });
  }

  async getDividendsByTicker(ticker: string) {
    const asset = await this.getByTickerOrThrow(ticker);
    return prisma.dividend.findMany({
      where: { assetId: asset.id },
      orderBy: { dataPagamento: "desc" },
    });
  }

  // Parte 17: Atlas Score nunca representa recomendação de compra/venda
  async getAtlasScoreByTicker(ticker: string) {
    const asset = await this.getByTickerOrThrow(ticker);
    const score = await prisma.atlasScore.findFirst({
      where: { assetId: asset.id },
      orderBy: { ultimaAtualizacao: "desc" },
    });

    if (!score) {
      throw new AppError(
        "Atlas Score ainda não calculado para este ativo.",
        404,
        ["ATLAS_SCORE_NOT_FOUND"]
      );
    }

    return score;
  }
}

export const assetService = new AssetService();
