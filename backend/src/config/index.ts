import { env } from "../env";

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  webOrigin: env.WEB_ORIGIN,
  databaseUrl: env.DATABASE_URL,
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  cookieName: env.COOKIE_NAME,
  cookieSecure: env.COOKIE_SECURE,
  apiBaseUrl: env.WEB_ORIGIN,
};

export type AppConfig = typeof config;
