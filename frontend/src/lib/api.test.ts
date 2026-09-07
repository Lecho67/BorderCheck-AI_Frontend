import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { evaluarEnvio } from "./api";
import { supabase } from "./supabase";
import { declaracionesEspecialesVacias, type WizardFormData } from "./types";

// El .env.test define VITE_API_BASE_URL, así que evaluarEnvio toma el
// camino "backend real" (no el mock) y llega a guardar en customs_queries.

const insertMock = vi.fn();

vi.mock("./supabase", () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    from: vi.fn(() => ({ insert: (...args: unknown[]) => insertMock(...args) })),
  },
}));
vi.mock("./toast", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const getSessionMock = vi.mocked(supabase.auth.getSession);

function wizard(): WizardFormData {
  return {
    paisOrigen: "🇺🇸 Estados Unidos",
    transportType: "air",
    shipmentModality: "personal_shipment_gift",
    paisDestino: "🇨🇴 Colombia",
    descripcionItem: "auriculares",
    pesoKg: 1,
    valorDeclaradoUsd: 50,
    declaracionesEspeciales: declaracionesEspecialesVacias(),
  };
}

beforeEach(() => {
  getSessionMock.mockReset().mockResolvedValue({
    data: { session: { user: { id: "u1" }, access_token: "tok" } },
  } as never);
  insertMock.mockReset().mockResolvedValue({ error: null });
  vi.stubGlobal("fetch", vi.fn());
});

describe("evaluarEnvio — guardado en el historial", () => {
  it("guarda ai_verdict con el final_status del motor, no el nivel de color", async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        final_status: "BLOQUEO",
        evaluated_at: "2026-01-01T00:00:00Z",
        alerts: [],
        tax_estimation: { requires_taxes: false },
      }),
    });

    const diagnostico = await evaluarEnvio(wizard());

    expect(diagnostico.nivel).toBe("rojo");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ai_verdict: "BLOQUEO", user_id: "u1" })
    );
  });

  it("propaga el mensaje de error del motor de reglas", async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Datos inválidos" }),
    });

    await expect(evaluarEnvio(wizard())).rejects.toThrow("Datos inválidos");
    expect(insertMock).not.toHaveBeenCalled();
  });
});
