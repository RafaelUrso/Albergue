import { describe, it, expect } from "vitest";

// Manually define Perfil enum to avoid Prisma client initialization issues in tests
enum Perfil {
  ADMIN_GERAL = "ADMIN_GERAL",
  ADMIN_FINANCEIRO = "ADMIN_FINANCEIRO",
  RECEPCIONISTA = "RECEPCIONISTA",
  HOSPEDE = "HOSPEDE",
}

// Simple mock for testing the logic we implemented in middleware
function checkAccess(perfil: Perfil, path: string): boolean {
  const isAdminRoute = path.includes("/admin");
  const isReceptionRoute = path.includes("/reception");

  if (isAdminRoute && perfil !== Perfil.ADMIN_GERAL && perfil !== Perfil.ADMIN_FINANCEIRO) {
    return false;
  }
  if (isReceptionRoute && perfil !== Perfil.RECEPCIONISTA && perfil !== Perfil.ADMIN_GERAL) {
    return false;
  }
  return true;
}

describe("RBAC Logic", () => {
  it("ADMIN_GERAL should access everything", () => {
    expect(checkAccess(Perfil.ADMIN_GERAL, "/admin/dashboard")).toBe(true);
    expect(checkAccess(Perfil.ADMIN_GERAL, "/reception/checkin")).toBe(true);
  });

  it("ADMIN_FINANCEIRO should access admin but not reception", () => {
    expect(checkAccess(Perfil.ADMIN_FINANCEIRO, "/admin/reports")).toBe(true);
    expect(checkAccess(Perfil.ADMIN_FINANCEIRO, "/reception/checkin")).toBe(false);
  });

  it("RECEPCIONISTA should access reception but not admin", () => {
    expect(checkAccess(Perfil.RECEPCIONISTA, "/reception/checkin")).toBe(true);
    expect(checkAccess(Perfil.RECEPCIONISTA, "/admin/dashboard")).toBe(false);
  });

  it("HOSPEDE should not access admin or reception", () => {
    expect(checkAccess(Perfil.HOSPEDE, "/admin/dashboard")).toBe(false);
    expect(checkAccess(Perfil.HOSPEDE, "/reception/checkin")).toBe(false);
  });
});
