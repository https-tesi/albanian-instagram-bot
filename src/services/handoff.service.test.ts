import { describe, expect, it, vi } from "vitest";
import { ConversationStatus, HandoffReason, InMemoryConversationRepository } from "./conversation.service";
import { HumanHandoffService } from "./handoff.service";

describe("HumanHandoffService", () => {
  it("keeps the handoff state and customer message when notification delivery fails", async () => {
    const conversations = new InMemoryConversationRepository();
    const send = vi.fn(async () => undefined);
    const notifications = { notifyHandoff: vi.fn(async () => { throw new Error("WhatsApp unavailable"); }) };
    const handoff = new HumanHandoffService(conversations, notifications, send);
    await handoff.handoff("u1", HandoffReason.HUMAN_REQUESTED, "operator");
    expect((await conversations.get("u1")).status).toBe(ConversationStatus.HUMAN_REQUIRED);
    expect(send).toHaveBeenCalledOnce();
    expect(notifications.notifyHandoff).toHaveBeenCalledOnce();
  });
});
