import { PrismaClient } from "@prisma/client";

// Singleton do Prisma Client - evita múltiplas instâncias em dev com hot-reload
// (Parte 22 - Persistência desacoplada da lógica de negócio)

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
