import { systemMessages } from "../constants/messages";
import { ConversationRepository, ConversationStatus, HandoffReason } from "./conversation.service";
import { EventDeduplicationService } from "./event-deduplication.service";
import { HumanHandoffService } from "./handoff.service";
import { OpenAiService } from "./openai.service";
import { UserRateLimitService } from "./rate-limit.service";
import { UsageService } from "./usage.service";
import { IncomingInstagramTextMessage } from "../types/instagram.types";
import { logger } from "../utils/logger";

export const isExplicitHumanRequest = (text: string): boolean => /dua të flas me (dikë|një person)|mund të flas me stafin|\boperator\b|\bhuman\b|person real/i.test(text.toLocaleLowerCase("sq"));
export class ConversationFlowService {
  constructor(private readonly conversations: ConversationRepository, private readonly events: EventDeduplicationService, private readonly rateLimits: UserRateLimitService, private readonly usage: UsageService, private readonly ai: OpenAiService, private readonly handoff: HumanHandoffService, private readonly sendMessage: (userId: string, text: string) => Promise<void>) {}
  async process(message: IncomingInstagramTextMessage): Promise<void> {
    if (message.messageId && !this.events.claim(message.messageId)) { logger.info("Ignoring duplicate Instagram event", { messageId: message.messageId }); return; }
    const conversation = await this.conversations.get(message.senderId);
    if (conversation.status === ConversationStatus.HUMAN_REQUIRED || conversation.status === ConversationStatus.HUMAN_ACTIVE) return;
    await this.conversations.save({ ...conversation, latestMessage: message.text, lastMessageAt: new Date() });
    if (isExplicitHumanRequest(message.text)) { await this.handoff.handoff(message.senderId, HandoffReason.HUMAN_REQUESTED, message.text); return; }
    if (!this.rateLimits.canUse(message.senderId)) { await this.handoff.handoff(message.senderId, HandoffReason.USER_RATE_LIMIT, message.text); return; }
    if (!this.usage.canSpend()) { await this.handoff.handoff(message.senderId, HandoffReason.BUSINESS_BUDGET_LIMIT, message.text); return; }
    try { const result = await this.ai.reply(message.text); this.rateLimits.record(message.senderId); if (result.usage) this.usage.record(result.usage); if (result.requiresHuman) { await this.handoff.handoff(message.senderId, result.handoffReason ? HandoffReason[result.handoffReason] : HandoffReason.AI_UNCERTAIN, message.text); return; } if (result.replyText) await this.sendMessage(message.senderId, result.replyText); }
    catch (error) { logger.error("OpenAI response failed", { message: error instanceof Error ? error.message : "Unknown error" }); await this.sendMessage(message.senderId, systemMessages.aiUnavailable); }
  }
}
