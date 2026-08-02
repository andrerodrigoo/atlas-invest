import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { assetService } from "@application/services/asset.service";
import { TransactionType } from "@prisma/client";

interface CreateTransactionInput {
  userId: string;
  walletId: string;
  ticker: string;
  tipo: TransactionType;
  quantidade: number;
  preco: number;
  data?: string;
}

interface UpdateTransactionInput {
  tipo?: TransactionType;
  quantidade?: number;
  preco?: number;
  data?: string;
}

export class TransactionService {
  // Garante que a carteira pertence ao usuário autenticado antes de qualquer operação
  private async getWalletOrThrow(userId: string, walletId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId, deletedAt: null },
    });
    if (!wallet) {
      throw new AppError("Carteira não encontrada.", 404, ["WALLET_NOT_FOUND"]);
    }
    return wallet;
  }

  private async getOrCreateWalletAsset(walletId: string, ticker: string) {
    const asset = await assetService.findOrCreateByTicker(ticker);

    let walletAsset = await prisma.walletAsset.findUnique({
      where: { walletId_assetId: { walletId, assetId: asset.id } },
    });

    if (!walletAsset) {
      walletAsset = await prisma.walletAsset.create({
        data: { walletId, assetId: asset.id, quantidade: 0, precoMedio: 0 },
      });
    }

    return walletAsset;
  }

  async list(userId: string, walletId: string) {
    await this.getWalletOrThrow(userId, walletId);

    return prisma.transaction.findMany({
      where: {
        deletedAt: null,
        walletAsset: { walletId },
      },
      include: { walletAsset: { include: { asset: true } } },
      orderBy: { data: "desc" },
    });
  }

  async create(input: CreateTransactionInput) {
    await this.getWalletOrThrow(input.userId, input.walletId);
    const walletAsset = await this.getOrCreateWalletAsset(input.walletId, input.ticker);

    const transaction = await prisma.transaction.create({
      data: {
        walletAssetId: walletAsset.id,
        tipo: input.tipo,
        quantidade: input.quantidade,
        preco: input.preco,
        data: input.data ? new Date(input.data) : new Date(),
      },
    });

    await this.recalcularIndicadores(walletAsset.id);

    return prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { walletAsset: { include: { asset: true } } },
    });
  }

  async update(userId: string, transactionId: string, input: UpdateTransactionInput) {
    const transaction = await this.getOwnedTransactionOrThrow(userId, transactionId);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        tipo: input.tipo,
        quantidade: input.quantidade,
        preco: input.preco,
        data: input.data ? new Date(input.data) : undefined,
      },
    });

    await this.recalcularIndicadores(transaction.walletAssetId);

    return prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { walletAsset: { include: { asset: true } } },
    });
  }

  // Soft delete + recálculo (Parte 13: recalcular indicadores após cada alteração)
  async delete(userId: string, transactionId: string) {
    const transaction = await this.getOwnedTransactionOrThrow(userId, transactionId);

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { deletedAt: new Date() },
    });

    await this.recalcularIndicadores(transaction.walletAssetId);
  }

  private async getOwnedTransactionOrThrow(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, deletedAt: null },
      include: { walletAsset: { include: { wallet: true } } },
    });

    if (!transaction || transaction.walletAsset.wallet.userId !== userId) {
      throw new AppError("Transação não encontrada.", 404, ["TRANSACTION_NOT_FOUND"]);
    }

    return transaction;
  }

  // Recalcula quantidade e preço médio a partir do zero, reprocessando todo o
  // histórico não excluído da posição. Essa abordagem evita divergência por
  // atualizações/edições/exclusões incrementais (Parte 13: "recalcular
  // indicadores após cada alteração").
  //
  // Regras de cálculo (custo médio ponderado):
  // - COMPRA/APORTE: aumenta quantidade e recalcula o preço médio ponderado.
  // - VENDA/RETIRADA: reduz a quantidade, mantendo o preço médio da posição.
  // - AJUSTE: sobrepõe quantidade e preço médio diretamente (correção manual).
  private async recalcularIndicadores(walletAssetId: string) {
    const transacoes = await prisma.transaction.findMany({
      where: { walletAssetId, deletedAt: null },
      orderBy: [{ data: "asc" }, { createdAt: "asc" }],
    });

    let quantidade = 0;
    let precoMedio = 0;

    for (const t of transacoes) {
      const qtd = Number(t.quantidade);
      const preco = Number(t.preco);

      if (t.tipo === TransactionType.COMPRA || t.tipo === TransactionType.APORTE) {
        const novaQuantidade = quantidade + qtd;
        precoMedio =
          novaQuantidade === 0
            ? 0
            : (quantidade * precoMedio + qtd * preco) / novaQuantidade;
        quantidade = novaQuantidade;
      } else if (t.tipo === TransactionType.VENDA || t.tipo === TransactionType.RETIRADA) {
        quantidade = Math.max(0, quantidade - qtd);
      } else if (t.tipo === TransactionType.AJUSTE) {
        quantidade = qtd;
        precoMedio = preco;
      }
    }

    await prisma.walletAsset.update({
      where: { id: walletAssetId },
      data: { quantidade, precoMedio },
    });
  }
}

export const transactionService = new TransactionService();
