import { describe, it, expect, vi } from "vitest";
import { parseDateUTC, formatDateToISO, formatDisplayDate } from "../lib/date-utils";

describe("Date Bug Fix Verification", () => {
  it("should parse 'YYYY-MM-DD' correctly without day shift", () => {
    const input = "2026-10-02";
    const parsed = parseDateUTC(input);

    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(9); // Oct is index 9
    expect(parsed.getUTCDate()).toBe(2);
    expect(parsed.getUTCHours()).toBe(12);
  });

  it("should format Date back to ISO string correctly", () => {
    const date = new Date(Date.UTC(2026, 9, 2, 12, 0, 0));
    const iso = formatDateToISO(date);
    expect(iso).toBe("2026-10-02");
  });

  it("should format display date for pt-BR locale correctly", () => {
    const input = "2026-10-02";
    const display = formatDisplayDate(input, "pt-BR");
    expect(display).toBe("02/10/2026");
  });

  it("should not shift day when using system local timezone", () => {
    // Simulando um ambiente em que o fuso local seja UTC-3 (como Brasil)
    // Se tratarmos a data como local, 2026-10-02T00:00:00Z em UTC-3 vira 2026-10-01T21:00:00.
    // Nossa utilidade DEVE ignorar isso e sempre usar componentes UTC.

    const input = "2026-05-15";
    const parsed = parseDateUTC(input);

    // Independente do fuso do sistema onde o teste roda, o componente UTC deve ser 15.
    expect(parsed.getUTCDate()).toBe(15);
    expect(formatDateToISO(parsed)).toBe("2026-05-15");
  });
});
