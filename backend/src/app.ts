import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "@config/env";
import routes from "@api/routes";
import { errorHandlerMiddleware } from "@api/middlewares/error-handler.middleware";

export function createApp() {
  const app = express();

  // Segurança básica - Parte 16: HTTPS (garantido pelo proxy/load balancer em produção),
  // headers de segurança e CORS restrito.
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  // Rate limiting global - Parte 16/22: proteção contra brute force e abuso de API
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        data: null,
        message: "Muitas requisições. Tente novamente mais tarde.",
        errors: ["RATE_LIMIT_EXCEEDED"],
      },
    })
  );

  app.use(`/api/${env.apiVersion}`, routes);

  // Rota não encontrada
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      data: null,
      message: "Recurso não encontrado.",
      errors: ["NOT_FOUND"],
    });
  });

  app.use(errorHandlerMiddleware);

  return app;
}
