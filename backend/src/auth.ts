import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "./env";

export type JwtPayload = {
  sub: string;
  role: "USER" | "ADMIN";
};

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== "object" || value === null) return false;
  const payloadCandidate = value as Record<string, unknown>;
  const sub = payloadCandidate.sub;
  const role = payloadCandidate.role;
  return (
    typeof sub === "string" &&
    (role === "USER" || role === "ADMIN")
  );
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (!isJwtPayload(decoded)) throw new Error("Invalid token");
  return { sub: decoded.sub, role: decoded.role };
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/",
  });
}

export type AuthedRequest = Request & {
  auth?: { userId: string; role: "USER" | "ADMIN" };
};
