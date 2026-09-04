import { describe, it, expect, vi, beforeEach } from "vitest";
import { revisarCaso } from "./agentService";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));

const rpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  rpc.mockReset();
});

describe("revisarCaso", () => {
  it("llama al RPC revisar_caso con los parámetros esperados", async () => {
    rpc.mockResolvedValue({ data: { id: "c1", ai_verdict: "APROBADO" }, error: null } as never);

    const fila = await revisarCaso("c1", "APROBADO", "Confirmado sin cambios por agente humano");

    expect(rpc).toHaveBeenCalledWith("revisar_caso", {
      p_caso_id: "c1",
      p_veredicto: "APROBADO",
      p_motivo: "Confirmado sin cambios por agente humano",
    });
    expect(fila).toMatchObject({ ai_verdict: "APROBADO" });
  });

  it("propaga el mensaje de error del RPC", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "Caso no encontrado o no asignado a vos" },
    } as never);

    await expect(revisarCaso("c1", "BLOQUEO", "motivo")).rejects.toThrow(
      "Caso no encontrado o no asignado a vos"
    );
  });
});
