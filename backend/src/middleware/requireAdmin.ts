import type { NextFunction, Response } from "express";
import type { AuthedRequest } from "../auth";

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.auth) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  if (req.auth.role !== "ADMIN") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  return next();
}
