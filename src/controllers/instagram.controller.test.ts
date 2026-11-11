import { createHmac } from "crypto";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../config/env", () => ({
  env: {
    instagramVerifyToken: "test-verify-token",
    metaAppSecret: "test-meta-app-secret"
  }
}));

vi.mock("../services/chatbot.service", () => ({
  chatbotService: {
    process: vi.fn(async () => undefined)
  }
}));

import { instagramController } from "./instagram.controller";
import { chatbotService } from "../services/chatbot.service";
import { extractTextMessages } from "../services/instagram-webhook-parser.service";

const appSecret = "test-meta-app-secret";
const sign = (body: Buffer): string =>
  `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`;

const response = (): Response =>
  ({
    sendStatus: vi.fn()
  }) as unknown as Response;

const webhookRequest = (body: Buffer, signature?: string): Request =>
  ({
    rawBody: body,
    body: JSON.parse(body.toString("utf8")),
    get: vi.fn((name: string) => (name === "X-Hub-Signature-256" ? signature : undefined))
  }) as unknown as Request;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Instagram webhook parser", () => {
  it("extracts normal text messages", () => expect(extractTextMessages({ entry: [{ messaging: [{ sender: { id: "sender" }, message: { mid: "mid", text: "Përshëndetje" } }] }] })).toEqual([{ senderId: "sender", messageId: "mid", text: "Përshëndetje" }]));
  it("ignores unsupported and echo events", () => expect(extractTextMessages({ entry: [{ messaging: [{ sender: { id: "sender" }, message: { is_echo: true, text: "sent" } }, { sender: { id: "sender" }, message: { mid: "no-text" } }] }] })).toEqual([]));
});

describe("Instagram webhook signature verification", () => {
  it("acknowledges and processes a webhook with a valid signature", async () => {
    const body = Buffer.from('{"object":"instagram","entry":[{"messaging":[{"sender":{"id":"sender"},"message":{"mid":"mid","text":"Përshëndetje"}}]}]}');
    const req = webhookRequest(body, sign(body));
    const res = response();

    instagramController.receiveWebhook(req, res);
    await Promise.resolve();

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(chatbotService.process).toHaveBeenCalledWith({
      senderId: "sender",
      messageId: "mid",
      text: "Përshëndetje"
    });
  });

  it("rejects an invalid signature before processing messages", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');
    const req = webhookRequest(body, `${sign(body).slice(0, -1)}0`);
    const res = response();

    instagramController.receiveWebhook(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(chatbotService.process).not.toHaveBeenCalled();
  });

  it("rejects a missing signature before processing messages", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');
    const req = webhookRequest(body);
    const res = response();

    instagramController.receiveWebhook(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(chatbotService.process).not.toHaveBeenCalled();
  });
});
