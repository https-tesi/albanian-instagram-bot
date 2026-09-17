import { HandoffReason } from "./conversation.service";
import { logger } from "../utils/logger";
export interface BusinessNotificationService { notifyHandoff(input: { instagramUserId: string; reason: HandoffReason; latestMessage?: string; timestamp: Date }): Promise<void>; }
export class LoggingBusinessNotificationService implements BusinessNotificationService { async notifyHandoff(input: { instagramUserId: string; reason: HandoffReason; latestMessage?: string; timestamp: Date }): Promise<void> { logger.warn("HUMAN HANDOFF REQUIRED", input); } }
