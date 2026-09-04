import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchDocumentosPendientes,
  obtenerUrlDocumentoParaRevision,
  tomarDocumento,
} from "./documentReviewService";
import { supabase } from "./supabase";
import { createQueryBuilderMock } from "@/test/supabaseQueryMock";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
    storage: { from: vi.fn() },
  },
}));

const fromMock = vi.mocked(supabase.from);
const getSessionMock = vi.mocked(supabase.auth.getSession);
const storageFromMock = vi.mocked(supabase.storage.from);

beforeEach(() => {
  fromMock.mockReset();
  getSessionMock.mockReset();
  storageFromMock.mockReset();
});

describe("fetchDocumentosPendientes", () => {
  it("devuelve los documentos pendientes con el cliente", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: [{ id: "d1", status: "pendiente" }], error: null }) as never
    );

    const data = await fetchDocumentosPendientes();

    expect(fromMock).toHaveBeenCalledWith("documents");
    expect(data).toEqual([{ id: "d1", status: "pendiente" }]);
  });

  it("lanza el mensaje de error de Supabase", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: null, error: { message: "caído" } }) as never
    );

    await expect(fetchDocumentosPendientes()).rejects.toThrow("caído");
  });
});

describe("obtenerUrlDocumentoParaRevision", () => {
  it("devuelve la URL firmada", async () => {
    storageFromMock.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://x" }, error: null }),
    } as never);

    await expect(obtenerUrlDocumentoParaRevision("u1/doc.pdf")).resolves.toBe("https://x");
    expect(storageFromMock).toHaveBeenCalledWith("documents");
  });

  it("lanza el mensaje de error de Supabase", async () => {
    storageFromMock.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({ data: null, error: { message: "no existe" } }),
    } as never);

    await expect(obtenerUrlDocumentoParaRevision("u1/doc.pdf")).rejects.toThrow("no existe");
  });
});

describe("tomarDocumento", () => {
  it("lanza un error claro si ya fue tomado por otro agente", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { id: "a1" } } } } as never);
    fromMock.mockReturnValue(createQueryBuilderMock({ data: null, error: null }) as never);

    await expect(tomarDocumento("d1")).rejects.toThrow("Este documento ya fue tomado por otro agente");
  });

  it("asigna el documento al agente de la sesión", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { id: "a1" } } } } as never);
    const builder = createQueryBuilderMock({
      data: { id: "d1", assigned_agent_id: "a1" },
      error: null,
    });
    fromMock.mockReturnValue(builder as never);

    const data = await tomarDocumento("d1");

    expect(builder.update).toHaveBeenCalledWith({ assigned_agent_id: "a1" });
    expect(data).toMatchObject({ assigned_agent_id: "a1" });
  });
});
