import type { Request, Response } from "express";
import { z } from "zod";
import { clearAuthCookie, setAuthCookie, signAccessToken } from "../auth";
import type { AuthedRequest } from "../auth";
import { ServiceError } from "../utils/errors";
import { serializeUser } from "../utils/serializeUser";
import { getUserById, loginUser, registerUser } from "../services/authService";
import type { PublicUser } from "../types";

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

function handleServiceError<SuccessType>(
  res: Response<ErrorResponse | SuccessType>,
  error: unknown
): Response<ErrorResponse | SuccessType> | undefined {
  if (error instanceof ServiceError) {
    return res.status(error.statusCode).json({ error: error.code });
  }
  return undefined;
}

export async function register(
  req: RegisterRequest,
  res: Response<AuthSuccessResponse | ErrorResponse>
): Promise<Response<AuthSuccessResponse | ErrorResponse>> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  try {
    const user = await registerUser(parsed.data);
    const token = signAccessToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    const handled = handleServiceError<AuthSuccessResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}

export async function login(
  req: LoginRequest,
  res: Response<AuthSuccessResponse | ErrorResponse>
): Promise<Response<AuthSuccessResponse | ErrorResponse>> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    clearAuthCookie(res);
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  try {
    const user = await loginUser(parsed.data);
    const token = signAccessToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    clearAuthCookie(res);
    const handled = handleServiceError<AuthSuccessResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}

export async function me(
  req: MeRequest,
  res: Response<AuthSuccessResponse | ErrorResponse>
): Promise<Response<AuthSuccessResponse | ErrorResponse>> {
  try {
    const user = await getUserById(req.auth!.userId);
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    clearAuthCookie(res);
    const handled = handleServiceError<AuthSuccessResponse>(res, error);
    if (handled) return handled;
    throw error;
  }
}
