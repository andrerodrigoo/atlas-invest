import { prisma } from "@infrastructure/database/prisma-client";

export class AdminService {
  // Resumo executivo (Parte 10: "Painel Admin - Resumo executivo")
  async dashboard() {
    const [totalUsuarios, usuariosAtivos, assinaturasAtivas, carteiras, conversasIA] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
        prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
        prisma.wallet.count({ where: { deletedAt: null } }),
        prisma.aiConversation.count({ where: { deletedAt: null } }),
      ]);

    return { totalUsuarios, usuariosAtivos, assinaturasAtivas, carteiras, conversasIA };
  }

  async listUsers(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        include: { profile: true, subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { items, total, page, pageSize };
  }

  async metrics() {
    const [porStatus, planos] = await Promise.all([
      prisma.user.groupBy({ by: ["status"], _count: true, where: { deletedAt: null } }),
      prisma.subscription.groupBy({ by: ["plano", "status"], _count: true }),
    ]);

    return { usuariosPorStatus: porStatus, assinaturasPorPlano: planos };
  }

  // Broadcast administrativo de notificações (Parte 12: POST /admin/notifications)
  async broadcastNotification(titulo: string, mensagem: string, userIds?: string[]) {
    let targets: string[];

    if (userIds?.length) {
      targets = userIds;
    } else {
      const usuarios = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });
      targets = usuarios.map((u: { id: string }) => u.id);
    }

    await prisma.notification.createMany({
      data: targets.map((userId: string) => ({ userId, titulo, mensagem })),
    });

    return { enviadas: targets.length };
  }
}

export const adminService = new AdminService();
