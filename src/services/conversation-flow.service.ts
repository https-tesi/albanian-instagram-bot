import { systemMessages } from "../constants/messages";
import { ConversationRepository, ConversationStatus, HandoffReason } from "./conversation.service";
import { EventDeduplicationService } from "./event-deduplication.service";
import { HumanHandoffService } from "./handoff.service";
import { OpenAiService } from "./openai.service";
import { UserRateLimitService } from "./rate-limit.service";
import { UsageService } from "./usage.service";
import { IncomingInstagramTextMessage } from "../types/instagram.types";
import { logger } from "../utils/logger";

/** Normalizes user text for small, deterministic intent rules; it is not used for AI prompts. */
export const normalizeIntentText = (text: string): string => {
  return text
    .toLocaleLowerCase("sq")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const humanRequestPatterns: readonly RegExp[] = [
  /\b(?:dua|mund) te flas me (?:nje person|dike|stafin|njeri)\b/,
  /\bdo doja te flisja me (?:nje person|dike|stafin|njeri)\b/,
  /\bme lidh me (?:nje person|stafin|njeri)\b/,
  /\bdua ndihme nga nje person\b/,
  /\bdua operator\b/,
  /\btalk to a human\b/,
  /\bspeak to a person\b/,
  /^(?:human|operator|agent)[.!?]*$/
];

export const isExplicitHumanRequest = (text: string): boolean => {
  const normalizedText = normalizeIntentText(text);
  return humanRequestPatterns.some((pattern) => pattern.test(normalizedText));
};
export class ConversationFlowService {
  constructor(private readonly conversations: ConversationRepository, private readonly events: EventDeduplicationService, private readonly rateLimits: UserRateLimitService, private readonly usage: UsageService, private readonly ai: OpenAiService, private readonly handoff: HumanHandoffService, private readonly sendMessage: (userId: string, text: string) => Promise<void>, private readonly humanRequiredTimeoutHours = 24, private readonly humanActiveTimeoutHours = 24) {}
  async process(message: IncomingInstagramTextMessage): Promise<void> {
    if (message.messageId && !this.events.claim(message.messageId)) { logger.info("Ignoring duplicate Instagram event", { messageId: message.messageId }); return; }
    const conversation = await this.conversations.get(message.senderId);
    const now = new Date();
    const isHumanRequested = isExplicitHumanRequest(message.text);
    const previousInteraction = conversation.lastHumanMessageAt ?? conversation.lastCustomerMessageAt;
    const hasElapsed = (date: Date | undefined, hours: number): boolean => Boolean(date && now.getTime() - date.getTime() >= hours * 60 * 60 * 1000);
    if (conversation.status === ConversationStatus.HUMAN_REQUIRED) {
      await this.conversations.save({ ...conversation, latestMessage: message.text, lastCustomerMessageAt: now, updatedAt: now });
      if (isHumanRequested) return;
      if (!conversation.aiReentryOfferedAt && hasElapsed(conversation.handoffAt, this.humanRequiredTimeoutHours)) {
        await this.conversations.save({ ...conversation, status: ConversationStatus.AI_ACTIVE, latestMessage: message.text, lastCustomerMessageAt: now, aiReentryOfferedAt: now, updatedAt: now });
        await this.sendMessage(message.senderId, systemMessages.aiReentry);
      }
      return;
    }
    if (conversation.status === ConversationStatus.HUMAN_ACTIVE && !hasElapsed(previousInteraction, this.humanActiveTimeoutHours)) {
      await this.conversations.save({ ...conversation, latestMessage: message.text, lastCustomerMessageAt: now, updatedAt: now });
      return;
    }
    const activeConversation = conversation.status === ConversationStatus.HUMAN_ACTIVE || conversation.status === ConversationStatus.RESOLVED ? { ...conversation, status: ConversationStatus.AI_ACTIVE } : conversation;
    await this.conversations.save({ ...activeConversation, latestMessage: message.text, lastCustomerMessageAt: now, updatedAt: now });
    if (isHumanRequested) { await this.handoff.handoff(message.senderId, HandoffReason.HUMAN_REQUESTED, message.text); return; }
    if (!this.rateLimits.canUse(message.senderId)) { await this.handoff.handoff(message.senderId, HandoffReason.USER_RATE_LIMIT, message.text); return; }
    if (!this.usage.canSpend()) { await this.handoff.handoff(message.senderId, HandoffReason.BUSINESS_BUDGET_LIMIT, message.text); return; }
    try { const result = await this.ai.reply(message.text); this.rateLimits.record(message.senderId); if (result.usage) this.usage.record(result.usage); if (result.requiresHuman) { await this.handoff.handoff(message.senderId, result.handoffReason ? HandoffReason[result.handoffReason] : HandoffReason.AI_UNCERTAIN, message.text); return; } if (result.replyText) await this.sendMessage(message.senderId, result.replyText); }
    catch (error) { logger.error("OpenAI response failed", { message: error instanceof Error ? error.message : "Unknown error" }); await this.sendMessage(message.senderId, systemMessages.aiUnavailable); }
  }
}
