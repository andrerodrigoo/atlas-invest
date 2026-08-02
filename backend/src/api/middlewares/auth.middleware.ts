import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, AccessTokenPayload } from "@infrastructure/security/jwt";

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Token de autenticação ausente.",
      errors: ["UNAUTHORIZED"],
    });
  }

  const token = header.replace("Bearer ", "");

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Token inválido ou expirado.",
      errors: ["INVALID_TOKEN"],
    });
  }
}

// Autorização por papel (RBAC - Parte 16, 22)
export function requireRole(...roles: Array<AccessTokenPayload["role"]>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Acesso não autorizado para este recurso.",
        errors: ["FORBIDDEN"],
      });
    }
    return next();
  };
}
