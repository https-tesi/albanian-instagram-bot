import { describe, expect, it, vi } from "vitest";
import { handoffReasonLabels } from "../constants/handoff-reasons";
import { HandoffReason } from "./conversation.service";
import { formatWhatsappHandoffNotification, WhatsAppBusinessNotificationService } from "./notification.service";
import { WhatsAppCloudApiClient } from "./whatsapp.service";

describe("WhatsApp handoff notifications", () => {
  const input = { instagramUserId: "123456789", reason: HandoffReason.HUMAN_REQUESTED, latestMessage: "do doja te flisja me nje person", timestamp: new Date("2026-09-17T13:45:00Z") };
  it("maps handoff reasons to readable Albanian", () => {
    expect(handoffReasonLabels[HandoffReason.HUMAN_REQUESTED]).toBe("Klienti kërkoi të flasë me një person");
    expect(handoffReasonLabels[HandoffReason.USER_RATE_LIMIT]).toBe("Klienti arriti kufirin e mesazheve automatike");
    expect(handoffReasonLabels[HandoffReason.BUSINESS_BUDGET_LIMIT]).toBe("U arrit kufiri i buxhetit të AI");
  });
  it("sends the official Cloud API text payload without exposing the token", async () => {
    const post = vi.fn(async () => undefined);
    const client = new WhatsAppCloudApiClient("v22.0", "phone-id", "secret-token", post);
    const notifier = new WhatsAppBusinessNotificationService(client, "355612345678");
    await notifier.notifyHandoff(input);
    expect(post).toHaveBeenCalledWith("https://graph.facebook.com/v22.0/phone-id/messages", expect.objectContaining({ messaging_product: "whatsapp", to: "355612345678", type: "text", text: { body: expect.stringContaining("Instagram User ID: 123456789") } }), expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) }));
    expect(formatWhatsappHandoffNotification(input)).toContain(input.latestMessage);
  });
});
