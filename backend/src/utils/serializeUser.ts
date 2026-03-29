import type { PublicUser, User } from "../types";

export function serializeUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  void passwordHash;
  return publicUser;
}
