import { createHmac, timingSafeEqual } from "crypto";

export enum MetaWebhookSignatureValidationResult {
  VALID = "valid",
  MISSING_RAW_BODY = "missing_raw_body",
  MISSING_SIGNATURE = "missing_signature",
  MALFORMED_SIGNATURE = "malformed_signature",
  SIGNATURE_MISMATCH = "signature_mismatch"
}

/** Verifies Meta's X-Hub-Signature-256 against the exact received request bytes. */
export const validateMetaWebhookSignature = (
  rawBody: Buffer | undefined,
  receivedSignature: string | undefined,
  appSecret: string
): MetaWebhookSignatureValidationResult => {
  if (!rawBody) {
    return MetaWebhookSignatureValidationResult.MISSING_RAW_BODY;
  }

  if (!receivedSignature) {
    return MetaWebhookSignatureValidationResult.MISSING_SIGNATURE;
  }

  if (!/^sha256=[a-f0-9]{64}$/.test(receivedSignature)) {
    return MetaWebhookSignatureValidationResult.MALFORMED_SIGNATURE;
  }

  const expectedSignature = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(receivedSignature, "utf8");

  return received.length === expected.length && timingSafeEqual(received, expected)
    ? MetaWebhookSignatureValidationResult.VALID
    : MetaWebhookSignatureValidationResult.SIGNATURE_MISMATCH;
};

export const isValidMetaWebhookSignature = (
  rawBody: Buffer | undefined,
  receivedSignature: string | undefined,
  appSecret: string
): boolean =>
  validateMetaWebhookSignature(rawBody, receivedSignature, appSecret) ===
  MetaWebhookSignatureValidationResult.VALID;
