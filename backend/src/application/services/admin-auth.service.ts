import { prisma } from "@infrastructure/database/prisma-client";
import { verifyPassword } from "@infrastructure/security/password";
import { signAccessToken } from "@infrastructure/security/jwt";
import { AppError } from "@api/middlewares/error-handler.middleware";

// Login administrativo é separado do login de usuários comuns (Parte 14: "Login
// administrativo → Painel"). Usa a tabela admin_users e papéis próprios (RBAC - Parte 16).
export class AdminAuthService {
  async login(email: string, senha: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !admin.ativo || admin.deletedAt) {
      throw new AppError("Credenciais administrativas inválidas.", 401, ["INVALID_ADMIN_CREDENTIALS"]);
    }

    const senhaValida = await verifyPassword(senha, admin.senhaHash);
    if (!senhaValida) {
      throw new AppError("Credenciais administrativas inválidas.", 401, ["INVALID_ADMIN_CREDENTIALS"]);
    }

    const role = admin.role === "ADMINISTRADOR" ? "administrador" : "suporte";
    const accessToken = signAccessToken({ sub: admin.id, email: admin.email, role });

    await prisma.auditLog.create({
      data: { userId: null, acao: "LOGIN_ADMIN_REALIZADO", detalhes: { adminId: admin.id } },
    });

    return { accessToken, admin: { id: admin.id, email: admin.email, role: admin.role } };
  }
}

export const adminAuthService = new AdminAuthService();
