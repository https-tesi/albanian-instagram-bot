import { env } from "../config/env";
import { logger } from "../utils/logger";
export interface AiUsage { model: string; inputTokens: number; outputTokens: number; totalTokens: number; }
export interface UsageService { canSpend(): boolean; record(usage: AiUsage): void; }
export class InMemoryUsageService implements UsageService {
  private month = new Date().toISOString().slice(0, 7); private estimatedUsd = 0;
  canSpend(): boolean { this.resetMonth(); return env.monthlyAiBudgetUsd === 0 || this.estimatedUsd < env.monthlyAiBudgetUsd; }
  record(usage: AiUsage): void { this.resetMonth(); this.estimatedUsd += (usage.inputTokens * env.openAiInputPricePerMillion + usage.outputTokens * env.openAiOutputPricePerMillion) / 1_000_000; logger.info("OpenAI usage", { ...usage }); }
  private resetMonth(): void { const current = new Date().toISOString().slice(0, 7); if (current !== this.month) { this.month = current; this.estimatedUsd = 0; } }
}
