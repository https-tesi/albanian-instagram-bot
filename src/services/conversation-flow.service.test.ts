import { describe, expect, it, vi } from "vitest";
import { ConversationFlowService, isExplicitHumanRequest, normalizeIntentText } from "./conversation-flow.service";
import { InMemoryConversationRepository, ConversationStatus, HandoffReason } from "./conversation.service";
import { InMemoryEventDeduplicationService } from "./event-deduplication.service";
import { HumanHandoffService } from "./handoff.service";

const build = (options?: { status?: ConversationStatus; rateAllowed?: boolean; budgetAllowed?: boolean; aiFails?: boolean }) => {
  const conversations = new InMemoryConversationRepository();
  const send = vi.fn(async () => undefined);
  const notify = { notifyHandoff: vi.fn(async () => undefined) };
  const handoff = new HumanHandoffService(conversations, notify, send);
  const ai = { reply: vi.fn(async () => { if (options?.aiFails) throw new Error("temporary failure"); return { replyText: "Përshëndetje!", requiresHuman: false }; }) };
  const flow = new ConversationFlowService(conversations, new InMemoryEventDeduplicationService(), { canUse: vi.fn(() => options?.rateAllowed ?? true), record: vi.fn() }, { canSpend: vi.fn(() => options?.budgetAllowed ?? true), record: vi.fn() }, ai, handoff, send);
  return { conversations, send, notify, ai, flow };
};
describe("ConversationFlowService", () => {
  it("processes a normal AI_ACTIVE message and sends the answer", async () => { const x = build(); await x.flow.process({ senderId: "u1", messageId: "m1", text: "Përshëndetje" }); expect(x.ai.reply).toHaveBeenCalledOnce(); expect(x.send).toHaveBeenCalledWith("u1", "Përshëndetje!"); });
  it("does not process duplicate events twice", async () => { const x = build(); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); expect(x.ai.reply).toHaveBeenCalledOnce(); });
  it.each([ConversationStatus.HUMAN_REQUIRED, ConversationStatus.HUMAN_ACTIVE])("keeps %s conversations silent", async (status) => { const x = build(); await x.conversations.save({ instagramUserId: "u1", status }); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); expect(x.ai.reply).not.toHaveBeenCalled(); });
  it("hands off explicit human requests once", async () => { const x = build(); await x.flow.process({ senderId: "u1", messageId: "m1", text: "dua të flas me një person" }); await x.flow.process({ senderId: "u1", messageId: "m2", text: "operator" }); expect(x.ai.reply).not.toHaveBeenCalled(); expect(x.send).toHaveBeenCalledOnce(); expect(x.notify.notifyHandoff).toHaveBeenCalledOnce(); expect((await x.conversations.get("u1")).handoffReason).toBe(HandoffReason.HUMAN_REQUESTED); });
  it("hands off users beyond the daily limit", async () => { const x = build({ rateAllowed: false }); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); expect((await x.conversations.get("u1")).handoffReason).toBe(HandoffReason.USER_RATE_LIMIT); });
  it("hands off when the monthly guard is reached", async () => { const x = build({ budgetAllowed: false }); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); expect((await x.conversations.get("u1")).handoffReason).toBe(HandoffReason.BUSINESS_BUDGET_LIMIT); });
  it("uses the unavailable fallback after OpenAI failure", async () => { const x = build({ aiFails: true }); await x.flow.process({ senderId: "u1", messageId: "m1", text: "hi" }); expect(x.send).toHaveBeenCalledWith("u1", expect.stringContaining("nuk është i disponueshëm")); });
  it.each(["do doja te flisja me nje person", "dua të flas me dikë", "mund te flas me stafin", "me lidh me nje person", "operator", "talk to a human"])("recognises the human request %s", (text) => { expect(isExplicitHumanRequest(text)).toBe(true); });
  it.each(["A ka ndonjë person që punon sot?", "Ky person më ndihmoi dje.", "Personi përgjegjës është shumë i sjellshëm."])("does not hand off ordinary person references: %s", (text) => { expect(isExplicitHumanRequest(text)).toBe(false); });
  it("normalizes Albanian diacritics and repeated whitespace", () => { expect(normalizeIntentText("  DUA   TË  FLAS  ME NJË PERSON ")).toBe("dua te flas me nje person"); });
});
