import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchColaDeRevision, revisarCaso, tomarCaso } from "./agentService";
import { supabase } from "./supabase";
import { createQueryBuilderMock } from "@/test/supabaseQueryMock";

vi.mock("./supabase", () => ({
  supabase: { rpc: vi.fn(), from: vi.fn(), auth: { getSession: vi.fn() } },
}));

const rpc = vi.mocked(supabase.rpc);
const fromMock = vi.mocked(supabase.from);
const getSessionMock = vi.mocked(supabase.auth.getSession);

beforeEach(() => {
  rpc.mockReset();
  fromMock.mockReset();
  getSessionMock.mockReset();
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

describe("fetchColaDeRevision", () => {
  it("excluye los casos ya revisados (overridden_by is null)", async () => {
    const builder = createQueryBuilderMock({ data: [{ id: "c1" }], error: null });
    fromMock.mockReturnValue(builder as never);

    const data = await fetchColaDeRevision();

    expect(builder.in).toHaveBeenCalledWith("ai_verdict", [
      "REQUIERE_DOCUMENTACION",
      "PRECAUCION",
    ]);
    expect(builder.is).toHaveBeenCalledWith("overridden_by", null);
    expect(data).toEqual([{ id: "c1" }]);
  });
});

describe("tomarCaso", () => {
  it("lanza un error claro si ya fue tomado por otro agente", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { id: "a1" } } } } as never);
    fromMock.mockReturnValue(createQueryBuilderMock({ data: null, error: null }) as never);

    await expect(tomarCaso("c1")).rejects.toThrow("Este caso ya fue tomado por otro agente");
  });

  it("asigna el caso al agente de la sesión", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { id: "a1" } } } } as never);
    const builder = createQueryBuilderMock({ data: { id: "c1", assigned_agent_id: "a1" }, error: null });
    fromMock.mockReturnValue(builder as never);

    const data = await tomarCaso("c1");

    expect(builder.update).toHaveBeenCalledWith({ assigned_agent_id: "a1" });
    expect(data).toMatchObject({ assigned_agent_id: "a1" });
  });
});
