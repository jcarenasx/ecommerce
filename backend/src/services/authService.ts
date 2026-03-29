import bcrypt from "bcryptjs";
import { ServiceError } from "../utils/errors";
import { createUser, findUserByEmail, findUserById } from "../models/userModel";
import type { User } from "../types";

export type RegisterInput = {
  email: string;
  password: string;
  name?: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput): Promise<User> {
  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ServiceError("EMAIL_ALREADY_EXISTS", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  return createUser({
    email: normalizedEmail,
    name: input.name ?? null,
    passwordHash,
  });
}

export async function loginUser(input: LoginInput): Promise<User> {
  const normalizedEmail = input.email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new ServiceError("INVALID_CREDENTIALS", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ServiceError("INVALID_CREDENTIALS", 401);
  }

  return user;
}

export async function getUserById(userId: string): Promise<User> {
  const user = await findUserById(userId);

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", 404);
  }

  return user;
}
