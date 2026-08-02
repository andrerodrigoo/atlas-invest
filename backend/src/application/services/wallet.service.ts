import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";

interface CreateWalletInput {
  userId: string;
  nome: string;
  moedaBase?: string;
}

interface UpdateWalletInput {
  nome?: string;
  moedaBase?: string;
}

export class WalletService {
  // Parte 13: o usuário pode criar várias carteiras
  async listByUser(userId: string) {
    return prisma.wallet.findMany({
      where: { userId, deletedAt: null },
      include: {
        walletAssets: {
          include: { asset: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async getByIdOrThrow(userId: string, walletId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId, deletedAt: null },
      include: { walletAssets: { include: { asset: true } } },
    });

    if (!wallet) {
      throw new AppError("Carteira não encontrada.", 404, ["WALLET_NOT_FOUND"]);
    }

    return wallet;
  }

  async create(input: CreateWalletInput) {
    return prisma.wallet.create({
      data: {
        userId: input.userId,
        nome: input.nome,
        moedaBase: input.moedaBase ?? "BRL",
      },
    });
  }

  async update(userId: string, walletId: string, input: UpdateWalletInput) {
    await this.getByIdOrThrow(userId, walletId); // garante posse da carteira

    return prisma.wallet.update({
      where: { id: walletId },
      data: input,
    });
  }

  // Soft delete - preserva histórico para auditoria (Parte 11)
  async delete(userId: string, walletId: string) {
    await this.getByIdOrThrow(userId, walletId);

    return prisma.wallet.update({
      where: { id: walletId },
      data: { deletedAt: new Date() },
    });
  }
}

export const walletService = new WalletService();
