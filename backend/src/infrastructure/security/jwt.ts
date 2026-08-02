import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@config/env";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: "user" | "suporte" | "administrador";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  const options: jwt.SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId }, env.jwt.refreshSecret, options);
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string };
}

// Tokens de propósito único (confirmação de e-mail, redefinição de senha).
// Reaproveitam o segredo de access token, mas carregam um claim "purpose"
// para impedir uso cruzado entre finalidades distintas.
export type TokenPurpose = "email_confirmation" | "password_reset";

export function signPurposeToken(
  userId: string,
  purpose: TokenPurpose,
  expiresIn: string = "1d"
): string {
  return jwt.sign({ sub: userId, purpose }, env.jwt.secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyPurposeToken(token: string, expectedPurpose: TokenPurpose): string {
  const payload = jwt.verify(token, env.jwt.secret) as { sub: string; purpose?: TokenPurpose };
  if (payload.purpose !== expectedPurpose) {
    throw new Error("Token com finalidade incorreta.");
  }
  return payload.sub;
}

// Guardamos apenas o hash do refresh token no banco (nunca o valor puro),
// permitindo revogação e detecção de reuso indevido.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
