import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMetricasGlobales } from "./adminService";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));

const rpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  rpc.mockReset();
});

describe("fetchMetricasGlobales", () => {
  it("mapea la respuesta del RPC y calcula porcentajes", async () => {
    rpc.mockResolvedValue({
      data: {
        total_consultas: 50,
        aprobados: 30,
        bloqueados: 5,
        casos_por_agente: [{ agent_id: "a1", nombre: "Ana", total: 4 }],
      },
      error: null,
    } as never);

    const m = await fetchMetricasGlobales();

    expect(rpc).toHaveBeenCalledWith("metricas_globales");
    expect(m.totalConsultas).toBe(50);
    expect(m.porcentajeAprobados).toBe(60);
    expect(m.porcentajeBloqueados).toBe(10);
    expect(m.casosPorAgente).toEqual([{ agentId: "a1", nombre: "Ana", total: 4 }]);
  });

  it("no divide por cero cuando no hay consultas", async () => {
    rpc.mockResolvedValue({
      data: { total_consultas: 0, aprobados: 0, bloqueados: 0, casos_por_agente: [] },
      error: null,
    } as never);

    const m = await fetchMetricasGlobales();
    expect(m.porcentajeAprobados).toBe(0);
    expect(m.porcentajeBloqueados).toBe(0);
    expect(m.casosPorAgente).toEqual([]);
  });

  it("propaga el error del RPC", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "No autorizado" } } as never);
    await expect(fetchMetricasGlobales()).rejects.toThrow("No autorizado");
  });
});
