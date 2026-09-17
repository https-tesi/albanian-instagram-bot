import dotenv from "dotenv";

dotenv.config();

type RequiredEnvVar =
  | "INSTAGRAM_VERIFY_TOKEN"
  | "INSTAGRAM_ACCESS_TOKEN"
  | "INSTAGRAM_ACCOUNT_ID"
  | "META_API_VERSION"
  | "DATABASE_URL";

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

const parsePositiveInteger = (value: string | undefined, fallback: number, key: string): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${key} must be a positive integer`);
  return parsed;
};

const parseNonNegativeNumber = (value: string | undefined, fallback: number, key: string): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${key} must be a non-negative number`);
  return parsed;
};

const parseBoolean = (value: string | undefined, fallback: boolean, key: string): boolean => {
  if (!value) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${key} must be true or false`);
};

const whatsappEnabled = parseBoolean(process.env.WHATSAPP_ENABLED, false, "WHATSAPP_ENABLED");
const getWhatsappRequired = (key: "WHATSAPP_ACCESS_TOKEN" | "WHATSAPP_PHONE_NUMBER_ID" | "WHATSAPP_RECIPIENT_PHONE"): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable when WHATSAPP_ENABLED=true: ${key}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  instagramVerifyToken: getRequiredEnv("INSTAGRAM_VERIFY_TOKEN"),
  instagramAccessToken: getRequiredEnv("INSTAGRAM_ACCESS_TOKEN"),
  instagramAccountId: getRequiredEnv("INSTAGRAM_ACCOUNT_ID"),
  metaApiVersion: getRequiredEnv("META_API_VERSION"),
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  openAiMaxOutputTokens: parsePositiveInteger(process.env.OPENAI_MAX_OUTPUT_TOKENS, 250, "OPENAI_MAX_OUTPUT_TOKENS"),
  maxAiMessagesPerUserPerDay: parsePositiveInteger(process.env.MAX_AI_MESSAGES_PER_USER_PER_DAY, 30, "MAX_AI_MESSAGES_PER_USER_PER_DAY"),
  maxConversationHistoryMessages: parsePositiveInteger(process.env.MAX_CONVERSATION_HISTORY_MESSAGES, 6, "MAX_CONVERSATION_HISTORY_MESSAGES"),
  monthlyAiBudgetUsd: parseNonNegativeNumber(process.env.MONTHLY_AI_BUDGET_USD, 0, "MONTHLY_AI_BUDGET_USD"),
  openAiInputPricePerMillion: parseNonNegativeNumber(process.env.OPENAI_INPUT_PRICE_PER_MILLION, 0, "OPENAI_INPUT_PRICE_PER_MILLION"),
  openAiOutputPricePerMillion: parseNonNegativeNumber(process.env.OPENAI_OUTPUT_PRICE_PER_MILLION, 0, "OPENAI_OUTPUT_PRICE_PER_MILLION"),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  humanRequiredTimeoutHours: parsePositiveInteger(process.env.HUMAN_REQUIRED_TIMEOUT_HOURS, 24, "HUMAN_REQUIRED_TIMEOUT_HOURS"),
  humanActiveTimeoutHours: parsePositiveInteger(process.env.HUMAN_ACTIVE_TIMEOUT_HOURS, 24, "HUMAN_ACTIVE_TIMEOUT_HOURS"),
  whatsappEnabled,
  whatsappAccessToken: whatsappEnabled ? getWhatsappRequired("WHATSAPP_ACCESS_TOKEN") : undefined,
  whatsappPhoneNumberId: whatsappEnabled ? getWhatsappRequired("WHATSAPP_PHONE_NUMBER_ID") : undefined,
  whatsappRecipientPhone: whatsappEnabled ? getWhatsappRequired("WHATSAPP_RECIPIENT_PHONE") : undefined,
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION ?? getRequiredEnv("META_API_VERSION")
};
