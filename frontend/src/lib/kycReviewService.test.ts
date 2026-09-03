import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchKycPendientes, revisarKyc } from "./kycReviewService";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: { rpc: vi.fn() },
}));

const rpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  rpc.mockReset();
});

describe("fetchKycPendientes", () => {
  it("devuelve la lista que retorna el RPC", async () => {
    rpc.mockResolvedValue({ data: [{ id: "u1" }, { id: "u2" }], error: null } as never);
    const filas = await fetchKycPendientes();
    expect(rpc).toHaveBeenCalledWith("listar_kyc_pendientes");
    expect(filas).toHaveLength(2);
  });

  it("devuelve [] cuando el RPC no trae datos", async () => {
    rpc.mockResolvedValue({ data: null, error: null } as never);
    expect(await fetchKycPendientes()).toEqual([]);
  });

  it("lanza el mensaje de error del RPC", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "No autorizado" } } as never);
    await expect(fetchKycPendientes()).rejects.toThrow("No autorizado");
  });
});

describe("revisarKyc", () => {
  it("aprueba pasando motivo null", async () => {
    rpc.mockResolvedValue({ data: { id: "u1", kyc_status: "aprobado" }, error: null } as never);
    const fila = await revisarKyc("u1", "aprobado");
    expect(rpc).toHaveBeenCalledWith("revisar_kyc", {
      p_user_id: "u1",
      p_estado: "aprobado",
      p_motivo: null,
    });
    expect(fila).toMatchObject({ kyc_status: "aprobado" });
  });

  it("rechaza pasando el motivo", async () => {
    rpc.mockResolvedValue({ data: { id: "u1", kyc_status: "rechazado" }, error: null } as never);
    await revisarKyc("u1", "rechazado", "Foto ilegible");
    expect(rpc).toHaveBeenCalledWith("revisar_kyc", {
      p_user_id: "u1",
      p_estado: "rechazado",
      p_motivo: "Foto ilegible",
    });
  });

  it("propaga el error del RPC", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "El rechazo requiere un motivo" } } as never);
    await expect(revisarKyc("u1", "rechazado")).rejects.toThrow("El rechazo requiere un motivo");
  });
});
