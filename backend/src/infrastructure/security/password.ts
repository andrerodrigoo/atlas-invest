import bcrypt from "bcryptjs";
import { env } from "@config/env";

const SALT_ROUNDS = 12;

// Senhas: hash direto com bcrypt (nunca texto puro - Parte 16)
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// PIN: aplica um "pepper" adicional (segredo do servidor) antes do hash,
// já que é uma credencial curta (4 dígitos) e mais suscetível a força bruta offline.
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(`${pin}:${env.pinHashPepper}`, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(`${pin}:${env.pinHashPepper}`, hash);
}
