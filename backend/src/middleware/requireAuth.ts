import type { NextFunction, Response } from "express";
import { env } from "../env";
import type { AuthedRequest } from "../auth";
import { verifyAccessToken } from "../auth";

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "UNAUTHENTICATED" });

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
}

