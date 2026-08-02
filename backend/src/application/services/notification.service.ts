import { prisma } from "@infrastructure/database/prisma-client";

export class NotificationService {
  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // Marca notificações específicas (ou todas, se nenhum id for informado) como lidas
  async markAsRead(userId: string, ids?: string[]) {
    await prisma.notification.updateMany({
      where: { userId, ...(ids && ids.length ? { id: { in: ids } } : {}) },
      data: { lida: true },
    });
  }
}

export const notificationService = new NotificationService();
