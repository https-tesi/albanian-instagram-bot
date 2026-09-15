import { Request, Response } from "express";

import { env } from "../config/env";
import { instagramService } from "../services/instagram.service";
import {
  IncomingInstagramTextMessage,
  InstagramMessagingEvent,
  InstagramWebhookPayload
} from "../types/instagram.types";
import { logger } from "../utils/logger";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const extractTextMessages = (payload: InstagramWebhookPayload): IncomingInstagramTextMessage[] => {
  const messages: IncomingInstagramTextMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const textMessage = extractTextMessage(event);

      if (textMessage) {
        messages.push(textMessage);
      }
    }
  }

  return messages;
};

const extractTextMessage = (
  event: InstagramMessagingEvent
): IncomingInstagramTextMessage | null => {
  const senderId = event.sender?.id;
  const messageId = event.message?.mid;
  const text = event.message?.text;

  if (!senderId || !messageId || !text || event.message?.is_echo) {
    return null;
  }

  return {
    senderId,
    messageId,
    text
  };
};

export const instagramController = {
  verifyWebhook(req: Request, res: Response): void {
    const mode = req.query["hub.mode"];
    const verifyToken = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      verifyToken === env.instagramVerifyToken &&
      typeof challenge === "string"
    ) {
      res.status(200).send(challenge);
      return;
    }

    res.sendStatus(403);
  },

  receiveWebhook(req: Request, res: Response): void {
    logger.info("Received Instagram webhook payload", {
      object: isObject(req.body) ? req.body.object : undefined
    });

    res.sendStatus(200);

    if (!isObject(req.body)) {
      logger.warn("Ignoring malformed Instagram webhook payload");
      return;
    }

    const payload = req.body as InstagramWebhookPayload;
    const messages = extractTextMessages(payload);

    if (messages.length === 0) {
      logger.info("No text messages found in Instagram webhook payload");
      return;
    }

    void Promise.all(
      messages.map(async (message) => {
        logger.info("Processing Instagram text message", {
          senderId: message.senderId,
          messageId: message.messageId
        });

        await instagramService.sendTextMessage(
          message.senderId,
          `Pershendetje! Mesazhi juaj ishte: "${message.text}"`
        );
      })
    ).catch((error: unknown) => {
      logger.error("Instagram webhook processing failed after acknowledgement", {
        message: error instanceof Error ? error.message : "Unknown error"
      });
    });
  }
};
