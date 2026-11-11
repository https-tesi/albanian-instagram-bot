import { createHmac, timingSafeEqual } from "crypto";

/** Verifies Meta's X-Hub-Signature-256 against the exact received request bytes. */
export const isValidMetaWebhookSignature = (
  rawBody: Buffer | undefined,
  receivedSignature: string | undefined,
  appSecret: string
): boolean => {
  if (!rawBody || !receivedSignature) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(receivedSignature, "utf8");

  return received.length === expected.length && timingSafeEqual(received, expected);
};
