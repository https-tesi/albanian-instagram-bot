export enum ConversationStatus { AI_ACTIVE = "AI_ACTIVE", HUMAN_REQUIRED = "HUMAN_REQUIRED", HUMAN_ACTIVE = "HUMAN_ACTIVE", RESOLVED = "RESOLVED" }
export enum HandoffReason { HUMAN_REQUESTED = "HUMAN_REQUESTED", AI_UNCERTAIN = "AI_UNCERTAIN", ACTION_FAILED = "ACTION_FAILED", COMPLAINT = "COMPLAINT", USER_RATE_LIMIT = "USER_RATE_LIMIT", BUSINESS_BUDGET_LIMIT = "BUSINESS_BUDGET_LIMIT" }
export interface Conversation { instagramUserId: string; latestMessage?: string; lastMessageAt?: Date; status: ConversationStatus; handoffReason?: HandoffReason; handoffAt?: Date; handoffMessageSent?: boolean; }
export interface ConversationRepository { get(userId: string): Promise<Conversation>; save(conversation: Conversation): Promise<void>; }
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly records = new Map<string, Conversation>();
  async get(instagramUserId: string): Promise<Conversation> { return this.records.get(instagramUserId) ?? { instagramUserId, status: ConversationStatus.AI_ACTIVE }; }
  async save(conversation: Conversation): Promise<void> { this.records.set(conversation.instagramUserId, conversation); }
}
