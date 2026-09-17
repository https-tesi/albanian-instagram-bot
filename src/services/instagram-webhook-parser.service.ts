import { IncomingInstagramTextMessage, InstagramMessagingEvent, InstagramWebhookPayload } from "../types/instagram.types";
export const extractTextMessage = (event: InstagramMessagingEvent): IncomingInstagramTextMessage | null => {
  // TODO: verify a production Instagram webhook payload for the exact field/event that identifies
  // a manually sent business-agent message before transitioning HUMAN_REQUIRED to HUMAN_ACTIVE.
  const senderId = event.sender?.id; const messageId = event.message?.mid; const text = event.message?.text;
  if (!senderId || !text || event.message?.is_echo) return null;
  return { senderId, messageId, text };
};
export const extractTextMessages = (payload: InstagramWebhookPayload): IncomingInstagramTextMessage[] => {
  const messages: IncomingInstagramTextMessage[] = [];
  for (const entry of payload.entry ?? []) for (const event of entry.messaging ?? []) { const textMessage = extractTextMessage(event); if (textMessage) messages.push(textMessage); }
  return messages;
};
