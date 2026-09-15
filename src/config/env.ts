import dotenv from "dotenv";

dotenv.config();

type RequiredEnvVar =
  | "INSTAGRAM_VERIFY_TOKEN"
  | "INSTAGRAM_ACCESS_TOKEN"
  | "INSTAGRAM_ACCOUNT_ID"
  | "META_API_VERSION";

const getRequiredEnv = (key: RequiredEnvVar): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 3000;
  }

  const parsedPort = Number(value);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return parsedPort;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  instagramVerifyToken: getRequiredEnv("INSTAGRAM_VERIFY_TOKEN"),
  instagramAccessToken: getRequiredEnv("INSTAGRAM_ACCESS_TOKEN"),
  instagramAccountId: getRequiredEnv("INSTAGRAM_ACCOUNT_ID"),
  metaApiVersion: getRequiredEnv("META_API_VERSION")
};
