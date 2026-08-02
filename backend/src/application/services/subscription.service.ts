import { prisma } from "@infrastructure/database/prisma-client";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const TRIAL_DAYS = 7; // Parte 1: teste grátis de 7 dias

export class SubscriptionService {
  async getCurrent(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      throw new AppError("Assinatura não encontrada.", 404, ["SUBSCRIPTION_NOT_FOUND"]);
    }

    return subscription;
  }

  // Parte 13: "O teste gratuito pode ser utilizado uma única vez por conta."
  async startTrial(userId: string) {
    const subscription = await this.getCurrent(userId);

    if (subscription.trialUtilizado) {
      throw new AppError("O teste grátis já foi utilizado nesta conta.", 409, [
        "TRIAL_ALREADY_USED",
      ]);
    }

    const inicio = new Date();
    const renovacao = new Date();
    renovacao.setDate(renovacao.getDate() + TRIAL_DAYS);

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plano: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.TRIALING,
        trialUtilizado: true,
        inicio,
        renovacao,
      },
    });
  }

  // Cancelamento - Parte 13: benefícios Premium liberados apenas com assinatura ativa
  async cancel(userId: string) {
    const subscription = await this.getCurrent(userId);

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.CANCELED, plano: SubscriptionPlan.FREE },
    });
  }
}

export const subscriptionService = new SubscriptionService();
