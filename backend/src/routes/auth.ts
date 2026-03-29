import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  AuthedRequest,
  clearAuthCookie,
  setAuthCookie,
  signAccessToken,
} from "../auth";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import type { PublicUser, User } from "../types";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().trim().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type RegisterBody = z.infer<typeof registerSchema>;
type LoginBody = z.infer<typeof loginSchema>;
type ValidationDetails = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

type ErrorResponse = {
  error: string;
  details?: ValidationDetails;
};

type AuthSuccessResponse = {
  user: PublicUser;
};

type RegisterRequest = Request<Record<string, never>, AuthSuccessResponse | ErrorResponse, RegisterBody>;
type LoginRequest = Request<Record<string, never>, AuthSuccessResponse | ErrorResponse, LoginBody>;
type MeRequest = AuthedRequest &
  Request<Record<string, never>, AuthSuccessResponse | ErrorResponse, Record<string, never>>;

function serializeUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post(
  "/register",
  async (
    req: RegisterRequest,
    res: Response<AuthSuccessResponse | ErrorResponse>
  ): Promise<Response<AuthSuccessResponse | ErrorResponse>> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
    },
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  return res.status(201).json({ user: serializeUser(user) });
  }
);

router.post(
  "/login",
  async (
    req: LoginRequest,
    res: Response<AuthSuccessResponse | ErrorResponse>
  ): Promise<Response<AuthSuccessResponse | ErrorResponse>> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    clearAuthCookie(res);
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const token = signAccessToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  return res.json({ user: serializeUser(user) });
  }
);

router.get(
  "/me",
  requireAuth,
  async (
    req: MeRequest,
    res: Response<AuthSuccessResponse | ErrorResponse>
  ): Promise<Response<AuthSuccessResponse | ErrorResponse>> => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
  });

  if (!user) {
    clearAuthCookie(res);
    return res.status(404).json({ error: "USER_NOT_FOUND" });
  }

  return res.json({ user: serializeUser(user) });
  }
);

export default router;
