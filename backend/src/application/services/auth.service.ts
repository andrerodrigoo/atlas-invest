import { prisma } from "@infrastructure/database/prisma-client";
import { hashPassword, verifyPassword } from "@infrastructure/security/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  signPurposeToken,
  verifyPurposeToken,
} from "@infrastructure/security/jwt";
import { AppError } from "@api/middlewares/error-handler.middleware";
import { AccountStatus } from "@prisma/client";

interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
}

interface LoginInput {
  email: string;
  senha: string;
}

const REFRESH_TOKEN_TTL_DAYS = 30;

export class AuthService {
  // Cadastro - Parte 13: usuário deve confirmar e-mail antes de acessar
  // funcionalidades protegidas. Aqui criamos a conta como PENDING_VERIFICATION.
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError("Este e-mail já está cadastrado.", 409, ["EMAIL_ALREADY_EXISTS"]);
    }

    const senhaHash = await hashPassword(input.senha);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        senhaHash,
        status: AccountStatus.PENDING_VERIFICATION,
        profile: { create: { nomeCompleto: input.nome } },
        subscriptions: { create: {} }, // plano FREE por padrão
      },
      include: { profile: true },
    });

    await this.registrarAuditoria(user.id, "CADASTRO_REALIZADO");

    // Token de confirmação de e-mail (Parte 13: confirmar e-mail antes de
    // acessar funcionalidades protegidas). Como o envio real de e-mail
    // (Parte 18) ainda não está integrado, o token é retornado na resposta
    // apenas para viabilizar testes - remover isso quando o provedor de
    // e-mail estiver configurado.
    const verificationToken = signPurposeToken(user.id, "email_confirmation", "1d");

    return {
      id: user.id,
      email: user.email,
      nome: user.profile?.nomeCompleto,
      verificationToken,
    };
  }

  // Confirmação de e-mail - Parte 13
  async confirmEmail(token: string) {
    let userId: string;
    try {
      userId = verifyPurposeToken(token, "email_confirmation");
    } catch {
      throw new AppError("Token de confirmação inválido ou expirado.", 400, [
        "INVALID_CONFIRMATION_TOKEN",
      ]);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new AppError("Usuário não encontrado.", 404, ["USER_NOT_FOUND"]);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.ACTIVE, emailVerificadoEm: new Date() },
    });

    await this.registrarAuditoria(userId, "EMAIL_CONFIRMADO");
  }

  // Login - Parte 13/16: sessões expiram automaticamente; alteração de senha
  // invalida sessões anteriores (revogação de refresh tokens é feita à parte).
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || user.deletedAt) {
      throw new AppError("E-mail ou senha inválidos.", 401, ["INVALID_CREDENTIALS"]);
    }

    const senhaValida = await verifyPassword(input.senha, user.senhaHash);
    if (!senhaValida) {
      throw new AppError("E-mail ou senha inválidos.", 401, ["INVALID_CREDENTIALS"]);
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new AppError("Conta suspensa. Entre em contato com o suporte.", 403, [
        "ACCOUNT_SUSPENDED",
      ]);
    }

    if (user.status === AccountStatus.PENDING_VERIFICATION) {
      throw new AppError("Confirme seu e-mail antes de acessar sua conta.", 403, [
        "EMAIL_NOT_VERIFIED",
      ]);
    }

    const tokens = await this.emitirTokens(user.id, user.email);
    await this.registrarAuditoria(user.id, "LOGIN_REALIZADO");

    return {
      user: { id: user.id, email: user.email, status: user.status },
      ...tokens,
    };
  }

  // Refresh - emite novo access token a partir de um refresh token válido e não revogado
  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Refresh token inválido ou expirado.", 401, ["INVALID_REFRESH_TOKEN"]);
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revokedAt: null },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Refresh token inválido ou expirado.", 401, ["INVALID_REFRESH_TOKEN"]);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AppError("Usuário não encontrado.", 401, ["USER_NOT_FOUND"]);
    }

    // Rotaciona o refresh token (revoga o antigo, emite um novo)
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.emitirTokens(user.id, user.email);
  }

  // Logout - revoga o refresh token informado
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Esqueci minha senha - por segurança, resposta é sempre genérica,
  // independentemente de o e-mail existir ou não.
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    await this.registrarAuditoria(user.id, "SOLICITACAO_RESET_SENHA");

    // Mesma observação do token de confirmação de e-mail: retornado aqui
    // apenas para permitir testes sem provedor de e-mail configurado.
    return signPurposeToken(user.id, "password_reset", "1h");
  }

  // Redefinição efetiva de senha - invalida todas as sessões ativas (Parte 13)
  async resetPassword(token: string, novaSenha: string) {
    let userId: string;
    try {
      userId = verifyPurposeToken(token, "password_reset");
    } catch {
      throw new AppError("Token de redefinição inválido ou expirado.", 400, [
        "INVALID_RESET_TOKEN",
      ]);
    }

    const senhaHash = await hashPassword(novaSenha);

    await prisma.user.update({ where: { id: userId }, data: { senhaHash } });

    // Alteração de senha invalida sessões anteriores (Parte 13)
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.registrarAuditoria(userId, "SENHA_REDEFINIDA");
  }

  private async emitirTokens(userId: string, email: string) {
    const accessToken = signAccessToken({ sub: userId, email, role: "user" });
    const refreshToken = signRefreshToken(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // Auditoria - Parte 11/16: login, alteração de senha/PIN, ações críticas
  private async registrarAuditoria(userId: string, acao: string, detalhes?: object) {
    await prisma.auditLog.create({
      data: { userId, acao, detalhes: detalhes ?? undefined },
    });
  }
}

export const authService = new AuthService();
