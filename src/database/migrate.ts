import { Pool } from "pg";
import { env } from "../config/env";
const pool = new Pool({ connectionString: env.databaseUrl });
const migrate = async (): Promise<void> => {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  await pool.query(`CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), instagram_user_id TEXT NOT NULL UNIQUE, status TEXT NOT NULL, handoff_reason TEXT, handoff_at TIMESTAMPTZ, last_customer_message_at TIMESTAMPTZ, last_human_message_at TIMESTAMPTZ, last_message TEXT, ai_reentry_offered_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.end();
};
void migrate().catch(async (error: unknown) => { console.error("Database migration failed", error instanceof Error ? error.message : "Unknown error"); await pool.end(); process.exitCode = 1; });
