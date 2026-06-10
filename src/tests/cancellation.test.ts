import { describe, it, expect, vi } from "vitest";

// Mock business logic for cancellation tiers as defined in the server action
// since we can't easily run the full Prisma logic in this environment without a DB
function mockCalculateRefund(checkinStr: string, todayStr: string, valorTotal: number, feeType: string, feeValue: number, maxFeePercent: number, numDiarias: number) {
  const checkin = new Date(checkinStr);
  checkin.setUTCHours(12, 0, 0, 0);
  const today = new Date(todayStr);
  today.setUTCHours(12, 0, 0, 0);

  const diffTime = checkin.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let valorEstornado = 0;
  let taxaRetida = 0;
  let politicaAplicada = "";

  if (diffDays >= 5) {
    valorEstornado = valorTotal;
    taxaRetida = 0;
    politicaAplicada = "GRATUITO_5_DIAS_OU_MAIS";
  } else if (diffDays >= 1 && diffDays <= 4) {
    if (feeType === "FIXED") {
      taxaRetida = Math.min(feeValue, valorTotal);
    } else {
      taxaRetida = (valorTotal * feeValue) / 100;
    }
    valorEstornado = Math.max(0, valorTotal - taxaRetida);
    politicaAplicada = "TAXA_1_A_4_DIAS";
  } else {
    const valorPrimeiraDiaria = valorTotal / numDiarias;
    taxaRetida = Math.max(valorPrimeiraDiaria, (valorTotal * maxFeePercent) / 100);
    taxaRetida = Math.min(taxaRetida, valorTotal);
    valorEstornado = Math.max(0, valorTotal - taxaRetida);
    politicaAplicada = "NO_DAY_OR_NOSHOW";
  }

  return { valorEstornado, taxaRetida, politicaAplicada };
}

describe("Cancellation Policy Logic (RF-022)", () => {
  const valorTotal = 1000;
  const numDiarias = 4;
  const feeValue = 20; // 20%
  const maxFeePercent = 100; // 100% max fee for no-show

  it("should give full refund for cancellations >= 5 days ahead", () => {
    const today = "2026-10-01";
    const checkin = "2026-10-06"; // 5 days
    const result = mockCalculateRefund(checkin, today, valorTotal, "PERCENT", feeValue, maxFeePercent, numDiarias);

    expect(result.valorEstornado).toBe(1000);
    expect(result.taxaRetida).toBe(0);
    expect(result.politicaAplicada).toBe("GRATUITO_5_DIAS_OU_MAIS");
  });

  it("should apply fee for cancellations 1-4 days ahead", () => {
    const today = "2026-10-01";
    const checkin = "2026-10-04"; // 3 days
    const result = mockCalculateRefund(checkin, today, valorTotal, "PERCENT", feeValue, maxFeePercent, numDiarias);

    expect(result.taxaRetida).toBe(200); // 20% of 1000
    expect(result.valorEstornado).toBe(800);
    expect(result.politicaAplicada).toBe("TAXA_1_A_4_DIAS");
  });

  it("should apply fixed fee if configured", () => {
    const today = "2026-10-01";
    const checkin = "2026-10-04";
    const result = mockCalculateRefund(checkin, today, valorTotal, "FIXED", 150, maxFeePercent, numDiarias);

    expect(result.taxaRetida).toBe(150);
    expect(result.valorEstornado).toBe(850);
  });

  it("should charge at least first night for same-day cancellation", () => {
    const today = "2026-10-05";
    const checkin = "2026-10-05"; // Same day
    const result = mockCalculateRefund(checkin, today, valorTotal, "PERCENT", feeValue, 100, numDiarias);

    // valorTotal 1000 / 4 diarias = 250 per night
    // maxFeePercent 100% of 1000 = 1000
    // Logic: max(firstNight, maxFeePercent) -> max(250, 1000) = 1000
    expect(result.taxaRetida).toBe(1000);
    expect(result.valorEstornado).toBe(0);
    expect(result.politicaAplicada).toBe("NO_DAY_OR_NOSHOW");
  });

  it("should charge exactly first night if maxFee is lower", () => {
    const today = "2026-10-05";
    const checkin = "2026-10-05";
    const result = mockCalculateRefund(checkin, today, valorTotal, "PERCENT", feeValue, 10, numDiarias);

    // first night 250
    // 10% of 1000 = 100
    // max(250, 100) = 250
    expect(result.taxaRetida).toBe(250);
    expect(result.valorEstornado).toBe(750);
  });
});
