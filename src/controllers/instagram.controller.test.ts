import { describe, expect, it } from "vitest";
import { extractTextMessages } from "../services/instagram-webhook-parser.service";
describe("Instagram webhook parser", () => {
  it("extracts normal text messages", () => expect(extractTextMessages({ entry: [{ messaging: [{ sender: { id: "sender" }, message: { mid: "mid", text: "Përshëndetje" } }] }] })).toEqual([{ senderId: "sender", messageId: "mid", text: "Përshëndetje" }]));
  it("ignores unsupported and echo events", () => expect(extractTextMessages({ entry: [{ messaging: [{ sender: { id: "sender" }, message: { is_echo: true, text: "sent" } }, { sender: { id: "sender" }, message: { mid: "no-text" } }] }] })).toEqual([]));
});
