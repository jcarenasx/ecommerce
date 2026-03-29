/* eslint-disable no-console */
import type { PublicUser } from "./src/types";

type AuthSuccessResponse = {
  user: PublicUser;
};

type RequestPayload = {
  name: string;
  email: string;
  password: string;
};

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
const cookieName = process.env.COOKIE_NAME ?? "ecom_access";
const testUser: RequestPayload = {
  name: "Smoke Tester",
  email: `smoke-test-${Date.now()}@example.com`,
  password: "SmokeTest123!",
};

async function main() {
  try {
    const registeredUser = await runStep("register user", registerUser);
    const loginResult = await runStep("login user", () => loginUser(testUser));
    const authCookie = extractAuthCookie(loginResult.response.headers);
    const meUser = await runStep("auth/me", () => getAuthMe(authCookie));

    console.log("Registered user:", registeredUser.id);
    console.log("Logged in as:", loginResult.body.user.email);
    console.log("Auth/me returned user:", meUser.email);
    console.log("[PASS] Smoke test finished");
  } catch {
    console.error("[FAIL] Smoke test aborted");
    process.exitCode = 1;
  }
}

async function registerUser() {
  const { response, body } = await sendJson<AuthSuccessResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(testUser),
  });

  assertStatus(response, [201], "register");
  assertPublicUser(body.user, "register");

  return body.user;
}

async function loginUser(payload: Pick<RequestPayload, "email" | "password">) {
  const { response, body } = await sendJson<AuthSuccessResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  assertStatus(response, [200], "login");
  assertPublicUser(body.user, "login");

  return { response, body };
}

async function getAuthMe(authCookie: string) {
  const { response, body } = await sendJson<AuthSuccessResponse>("/auth/me", {
    method: "GET",
    headers: { Cookie: authCookie },
  });

  assertStatus(response, [200], "auth/me");
  assertPublicUser(body.user, "auth/me");

  return body.user;
}

async function sendJson<T>(path: string, init: RequestInit) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init.headers ?? {}) as Record<string, string>),
    },
    credentials: "include",
  });

  const body = (await response.json()) as T;
  return { response, body };
}

function assertStatus(response: Response, allowed: number[], label: string) {
  if (!allowed.includes(response.status)) {
    throw new Error(`${label} returned ${response.status}`);
  }
}

function assertPublicUser(user: PublicUser, context: string) {
  if (typeof user.id !== "string" || user.id.length === 0) {
    throw new Error(`${context} user missing id`);
  }
  if (typeof user.email !== "string" || user.email.length === 0) {
    throw new Error(`${context} user missing email`);
  }
  if (typeof user.name !== "string" || user.name.length === 0) {
    throw new Error(`${context} user missing name`);
  }
}

function extractAuthCookie(headers: Headers) {
  const raw = headers.get("set-cookie");
  if (raw === null) {
    throw new Error("Login response did not include set-cookie header");
  }

  const cookiePair = raw.split(";")[0];
  if (cookiePair.length === 0) {
    throw new Error("Login response contained empty cookie");
  }
  if (!cookiePair.startsWith(`${cookieName}=`)) {
    throw new Error(`Unexpected cookie name: ${cookiePair}`);
  }

  return cookiePair;
}

async function runStep<T>(name: string, fn: () => Promise<T>) {
  try {
    const value = await fn();
    console.log(`[PASS] ${name}`);
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`[FAIL] ${name}: ${message}`);
    throw error;
  }
}

void main();
