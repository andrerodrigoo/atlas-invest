import { z } from "zod";

export const createWalletSchema = z.object({
  nome: z.string().min(1, "Nome da carteira é obrigatório"),
  moedaBase: z.string().default("BRL").optional(),
});

export const updateWalletSchema = z.object({
  nome: z.string().min(1).optional(),
  moedaBase: z.string().optional(),
});

// Cadastro manual de ativo na carteira (Parte 13: usuário registra ativos manualmente)
export const createTransactionSchema = z.object({
  walletId: z.string().uuid("walletId inválido"),
  ticker: z.string().min(1, "Ticker é obrigatório"),
  tipo: z.enum(["COMPRA", "VENDA", "APORTE", "RETIRADA", "AJUSTE"]),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  preco: z.number().nonnegative("Preço não pode ser negativo"),
  data: z.string().datetime().optional(),
});

export const updateTransactionSchema = z.object({
  tipo: z.enum(["COMPRA", "VENDA", "APORTE", "RETIRADA", "AJUSTE"]).optional(),
  quantidade: z.number().positive().optional(),
  preco: z.number().nonnegative().optional(),
  data: z.string().datetime().optional(),
});
