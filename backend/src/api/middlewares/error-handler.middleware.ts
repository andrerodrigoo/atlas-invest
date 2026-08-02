import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors: string[] = []
  ) {
    super(message);
  }
}

// Padroniza todas as respostas de erro no formato { success, data, message, errors }
// (Parte 12 - Especificação das APIs) e nunca expõe detalhes sensíveis (Parte 16, 22).
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      errors: err.errors.length ? err.errors : [err.message],
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Dados inválidos.",
      errors: err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    });
  }

  console.error("[erro não tratado]", err);

  return res.status(500).json({
    success: false,
    data: null,
    message: "Erro interno do servidor.",
    errors: ["INTERNAL_SERVER_ERROR"],
  });
}
