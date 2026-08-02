import { z } from "zod";

// Regras de negócio (Parte 13): senha forte, e-mail obrigatório, aceite de termos.
export const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos um número"),
  aceiteTermos: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar os termos de uso" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const confirmEmailSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  novaSenha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos um número"),
});

export const setPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/, "PIN deve conter 4 dígitos numéricos"),
});
