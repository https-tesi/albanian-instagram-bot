import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

import {
  isValidMetaWebhookSignature,
  MetaWebhookSignatureValidationResult,
  validateMetaWebhookSignature
} from "./meta-webhook-signature.service";

const appSecret = "test-meta-app-secret";
const sign = (body: Buffer): string =>
  `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`;

describe("isValidMetaWebhookSignature", () => {
  it("accepts a valid Meta signature", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');

    expect(isValidMetaWebhookSignature(body, sign(body), appSecret)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');
    const invalidSignature = `${sign(body).slice(0, -1)}0`;

    expect(isValidMetaWebhookSignature(body, invalidSignature, appSecret)).toBe(false);
  });

  it("rejects a missing signature", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');

    expect(isValidMetaWebhookSignature(body, undefined, appSecret)).toBe(false);
    expect(validateMetaWebhookSignature(body, undefined, appSecret)).toBe(
      MetaWebhookSignatureValidationResult.MISSING_SIGNATURE
    );
  });

  it("uses the original raw bytes rather than re-serialized JSON", () => {
    const signedBody = Buffer.from('{ "object": "instagram", "entry": [] }');
    const reserializedBody = Buffer.from('{"object":"instagram","entry":[]}');
    const signature = sign(signedBody);

    expect(isValidMetaWebhookSignature(signedBody, signature, appSecret)).toBe(true);
    expect(isValidMetaWebhookSignature(reserializedBody, signature, appSecret)).toBe(false);
  });

  it("reports safe diagnostic categories without returning signature data", () => {
    const body = Buffer.from('{"object":"instagram","entry":[]}');

    expect(validateMetaWebhookSignature(undefined, sign(body), appSecret)).toBe(
      MetaWebhookSignatureValidationResult.MISSING_RAW_BODY
    );
    expect(validateMetaWebhookSignature(body, "not-a-meta-signature", appSecret)).toBe(
      MetaWebhookSignatureValidationResult.MALFORMED_SIGNATURE
    );
    expect(validateMetaWebhookSignature(body, `${sign(body).slice(0, -1)}0`, appSecret)).toBe(
      MetaWebhookSignatureValidationResult.SIGNATURE_MISMATCH
    );
  });
});
