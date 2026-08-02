import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { assetService } from "@application/services/asset.service";

interface CreateAlertInput {
  userId: string;
  ticker?: string;
  tipo: string;
  condicao: Record<string, unknown>;
}

export class AlertService {
  async list(userId: string) {
    return prisma.alert.findMany({
      where: { userId, deletedAt: null },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Alertas devem respeitar frequência, preferências e disponibilidade de dados (Parte 13)
  async create(input: CreateAlertInput) {
    const asset = input.ticker ? await assetService.getByTickerOrThrow(input.ticker) : null;

    return prisma.alert.create({
      data: {
        userId: input.userId,
        assetId: asset?.id,
        tipo: input.tipo,
        condicao: input.condicao,
      },
    });
  }

  async delete(userId: string, alertId: string) {
    const alert = await prisma.alert.findFirst({ where: { id: alertId, userId, deletedAt: null } });
    if (!alert) {
      throw new AppError("Alerta não encontrado.", 404, ["ALERT_NOT_FOUND"]);
    }

    await prisma.alert.update({ where: { id: alertId }, data: { deletedAt: new Date() } });
  }
}

export const alertService = new AlertService();
