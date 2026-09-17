import { describe, expect, it } from "vitest";
import { parsePositiveFiniteNumber } from "./env-parsers";

describe("parsePositiveFiniteNumber", () => {
  it.each([["24", 24], ["1", 1], ["0.5", 0.5], ["0.01", 0.01]])("accepts %s", (value, expected) => {
    expect(parsePositiveFiniteNumber(value, 24, "TIMEOUT")).toBe(expected);
  });
  it.each(["0", "-1", "not-a-number", ""]) ("rejects invalid value %s", (value) => {
    expect(() => parsePositiveFiniteNumber(value, 24, "TIMEOUT")).toThrow("TIMEOUT must be a positive number");
  });
});
