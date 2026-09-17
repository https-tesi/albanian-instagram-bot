import { systemMessages } from "../constants/messages";
import { ConversationRepository, ConversationStatus, HandoffReason } from "./conversation.service";
import { BusinessNotificationService } from "./notification.service";
import { logger } from "../utils/logger";

export class HumanHandoffService {
  constructor(private readonly conversations: ConversationRepository, private readonly notifications: BusinessNotificationService, private readonly sendMessage: (userId: string, text: string) => Promise<void>) {}
  async handoff(userId: string, reason: HandoffReason, latestMessage?: string): Promise<void> {
    const existing = await this.conversations.get(userId);
    if (existing.status === ConversationStatus.HUMAN_REQUIRED || existing.status === ConversationStatus.HUMAN_ACTIVE) return;
    const now = new Date();
    const conversation = { ...existing, latestMessage, lastMessageAt: now, status: ConversationStatus.HUMAN_REQUIRED, handoffReason: reason, handoffAt: now, handoffMessageSent: true };
    await this.conversations.save(conversation);
    await this.sendMessage(userId, systemMessages.humanHandoff);
    try { await this.notifications.notifyHandoff({ instagramUserId: userId, reason, latestMessage, timestamp: now }); }
    catch (error) { logger.error("Business handoff notification failed", { message: error instanceof Error ? error.message : "Unknown error", instagramUserId: userId, reason }); }
  }
}
