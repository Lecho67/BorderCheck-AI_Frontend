import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchMisPreAlertas,
  crearPreAlerta,
  eliminarPreAlerta,
} from "./preAlertService";
import { supabase } from "./supabase";
import { createQueryBuilderMock } from "@/test/supabaseQueryMock";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  },
}));

const fromMock = vi.mocked(supabase.from);
const getSessionMock = vi.mocked(supabase.auth.getSession);

beforeEach(() => {
  fromMock.mockReset();
  getSessionMock.mockReset();
});

describe("fetchMisPreAlertas", () => {
  it("devuelve las pre-alertas del usuario", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: [{ id: "p1" }], error: null }) as never
    );

    const data = await fetchMisPreAlertas();

    expect(fromMock).toHaveBeenCalledWith("pre_alerts");
    expect(data).toEqual([{ id: "p1" }]);
  });

  it("lanza el mensaje de error de Supabase", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: null, error: { message: "caído" } }) as never
    );

    await expect(fetchMisPreAlertas()).rejects.toThrow("caído");
  });
});

describe("crearPreAlerta", () => {
  const nueva = {
    tracking_number: "T1",
    carrier: "DHL",
    description: "prueba",
    declared_value: 10,
  };

  it("exige una sesión activa", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } } as never);

    await expect(crearPreAlerta(nueva)).rejects.toThrow("No hay sesión activa");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserta la pre-alerta con el user_id de la sesión", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    } as never);
    const builder = createQueryBuilderMock({ data: { id: "p1", ...nueva }, error: null });
    fromMock.mockReturnValue(builder as never);

    const data = await crearPreAlerta(nueva);

    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u1", status: "pendiente", ...nueva })
    );
    expect(data).toMatchObject({ id: "p1" });
  });
});

describe("eliminarPreAlerta", () => {
  it("lanza el mensaje de error de Supabase", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: null, error: { message: "no encontrada" } }) as never
    );

    await expect(eliminarPreAlerta("p1")).rejects.toThrow("no encontrada");
  });
});
