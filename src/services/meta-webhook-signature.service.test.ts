import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

import { isValidMetaWebhookSignature } from "./meta-webhook-signature.service";

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
  });

  it("uses the original raw bytes rather than re-serialized JSON", () => {
    const signedBody = Buffer.from('{ "object": "instagram", "entry": [] }');
    const reserializedBody = Buffer.from('{"object":"instagram","entry":[]}');
    const signature = sign(signedBody);

    expect(isValidMetaWebhookSignature(signedBody, signature, appSecret)).toBe(true);
    expect(isValidMetaWebhookSignature(reserializedBody, signature, appSecret)).toBe(false);
  });
});
