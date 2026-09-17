import { Request, Response } from "express";

import { env } from "../config/env";
import { chatbotService } from "../services/chatbot.service";
import { InstagramWebhookPayload } from "../types/instagram.types";
import { extractTextMessages } from "../services/instagram-webhook-parser.service";
import { logger } from "../utils/logger";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
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

        await chatbotService.process(message);
      })
    ).catch((error: unknown) => {
      logger.error("Instagram webhook processing failed after acknowledgement", {
        message: error instanceof Error ? error.message : "Unknown error"
      });
    });
  }
};
