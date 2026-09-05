import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from "./notificationService";
import { supabase } from "./supabase";
import { createQueryBuilderMock } from "@/test/supabaseQueryMock";

vi.mock("./supabase", () => ({
  supabase: { from: vi.fn() },
}));

const fromMock = vi.mocked(supabase.from);

beforeEach(() => {
  fromMock.mockReset();
});

describe("fetchNotificaciones", () => {
  it("devuelve las notificaciones más recientes primero", async () => {
    const builder = createQueryBuilderMock({ data: [{ id: "n1" }, { id: "n2" }], error: null });
    fromMock.mockReturnValue(builder as never);

    const data = await fetchNotificaciones();

    expect(fromMock).toHaveBeenCalledWith("notifications");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(builder.limit).toHaveBeenCalledWith(50);
    expect(data).toHaveLength(2);
  });

  it("devuelve [] cuando no hay datos", async () => {
    fromMock.mockReturnValue(createQueryBuilderMock({ data: null, error: null }) as never);
    expect(await fetchNotificaciones()).toEqual([]);
  });

  it("lanza el mensaje de error de Supabase", async () => {
    fromMock.mockReturnValue(
      createQueryBuilderMock({ data: null, error: { message: "caído" } }) as never
    );
    await expect(fetchNotificaciones()).rejects.toThrow("caído");
  });
});

describe("marcarComoLeida", () => {
  it("marca una notificación puntual como leída", async () => {
    const builder = createQueryBuilderMock({ data: null, error: null });
    fromMock.mockReturnValue(builder as never);

    await marcarComoLeida("n1");

    expect(builder.update).toHaveBeenCalledWith({ leida: true });
    expect(builder.eq).toHaveBeenCalledWith("id", "n1");
  });
});

describe("marcarTodasComoLeidas", () => {
  it("marca como leídas solo las no leídas", async () => {
    const builder = createQueryBuilderMock({ data: null, error: null });
    fromMock.mockReturnValue(builder as never);

    await marcarTodasComoLeidas();

    expect(builder.update).toHaveBeenCalledWith({ leida: true });
    expect(builder.eq).toHaveBeenCalledWith("leida", false);
  });
});
