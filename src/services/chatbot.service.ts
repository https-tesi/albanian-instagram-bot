import { env } from "../config/env";
import { InMemoryConversationRepository } from "./conversation.service";
import { InMemoryEventDeduplicationService } from "./event-deduplication.service";
import { HumanHandoffService } from "./handoff.service";
import { instagramService } from "./instagram.service";
import { BusinessNotificationService, LoggingBusinessNotificationService, WhatsAppBusinessNotificationService } from "./notification.service";
import { OfficialOpenAiService } from "./openai.service";
import { InMemoryUserRateLimitService } from "./rate-limit.service";
import { InMemoryUsageService } from "./usage.service";
import { ConversationFlowService } from "./conversation-flow.service";
import { WhatsAppCloudApiClient } from "./whatsapp.service";
const conversations = new InMemoryConversationRepository();
const send = instagramService.sendTextMessage.bind(instagramService);
const notificationService: BusinessNotificationService = env.whatsappEnabled
  ? new WhatsAppBusinessNotificationService(new WhatsAppCloudApiClient(env.whatsappApiVersion, env.whatsappPhoneNumberId!, env.whatsappAccessToken!), env.whatsappRecipientPhone!)
  : new LoggingBusinessNotificationService();
const handoff = new HumanHandoffService(conversations, notificationService, send);
export const chatbotService = new ConversationFlowService(conversations, new InMemoryEventDeduplicationService(), new InMemoryUserRateLimitService(env.maxAiMessagesPerUserPerDay), new InMemoryUsageService(), new OfficialOpenAiService(), handoff, send);
