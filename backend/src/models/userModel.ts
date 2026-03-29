import { prisma } from "../prisma";
import type { User } from "../types";

type CreateUserInput = {
  email: string;
  passwordHash: string;
  name?: string | null;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({ data: input });
}
