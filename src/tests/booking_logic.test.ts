import { describe, it, expect, vi } from "vitest";

// Mock do algoritmo de colisão de datas (RF-011 / RN-011)
function checkCollision(requestedCheckin: Date, requestedCheckout: Date, existingCheckin: Date, existingCheckout: Date): boolean {
  // Regra: check_in_solicitado < check_out_existente AND check_out_solicitado > check_in_existente
  return requestedCheckin < existingCheckout && requestedCheckout > existingCheckin;
}

describe("Booking Engine Algorithm", () => {
  it("should detect collisions correctly (RF-011)", () => {
    const existingStart = new Date("2026-10-05T12:00:00Z");
    const existingEnd = new Date("2026-10-10T12:00:00Z");

    // Total overlap
    expect(checkCollision(new Date("2026-10-05T12:00:00Z"), new Date("2026-10-10T12:00:00Z"), existingStart, existingEnd)).toBe(true);

    // Partial overlap (start)
    expect(checkCollision(new Date("2026-10-01T12:00:00Z"), new Date("2026-10-06T12:00:00Z"), existingStart, existingEnd)).toBe(true);

    // Partial overlap (end)
    expect(checkCollision(new Date("2026-10-09T12:00:00Z"), new Date("2026-10-15T12:00:00Z"), existingStart, existingEnd)).toBe(true);

    // Inside
    expect(checkCollision(new Date("2026-10-06T12:00:00Z"), new Date("2026-10-08T12:00:00Z"), existingStart, existingEnd)).toBe(true);

    // No collision (before) - Check-out exactly at check-in of existing
    expect(checkCollision(new Date("2026-10-01T12:00:00Z"), new Date("2026-10-05T12:00:00Z"), existingStart, existingEnd)).toBe(false);

    // No collision (after) - Check-in exactly at check-out of existing
    expect(checkCollision(new Date("2026-10-10T12:00:00Z"), new Date("2026-10-15T12:00:00Z"), existingStart, existingEnd)).toBe(false);
  });
});
