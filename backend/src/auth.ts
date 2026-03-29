import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "./env";

type JwtPayload = {
  sub: string;
  role: "USER" | "ADMIN";
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  if (typeof decoded.sub !== "string") throw new Error("Invalid token");
  const role = decoded.role;
  if (role !== "USER" && role !== "ADMIN") throw new Error("Invalid role");
  return { sub: decoded.sub, role };
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

