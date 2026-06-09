import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../lib/crypto";

describe("Crypto Utility", () => {
  it("should encrypt and decrypt a string correctly", () => {
    const text = "ABC123456";
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted).toContain(":");

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it("should throw error for invalid format", () => {
    expect(() => decrypt("invalidformat")).toThrow("Invalid encrypted text format");
  });
});
