import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/types/database.types";

const singleMock = vi.fn();
const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn((..._args: unknown[]) => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));
const channelObj = { on: vi.fn(), subscribe: vi.fn() };
channelObj.on.mockReturnValue(channelObj);
channelObj.subscribe.mockReturnValue(channelObj);
const channelFnMock = vi.fn((..._args: unknown[]) => channelObj);
const removeChannelMock = vi.fn((..._args: unknown[]) => undefined);

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: () => getSessionMock(),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => singleMock() }),
      }),
    }),
    channel: (...args: unknown[]) => channelFnMock(...args),
    removeChannel: (...args: unknown[]) => removeChannelMock(...args),
  },
}));

const fakeUser = { id: "u1", email: "cliente@test.test" };
const fakeSession = { user: fakeUser };

function fakeProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    email: "cliente@test.test",
    full_name: "Sin nombre",
    locker_code: null,
    phone: null,
    role: "cliente",
    gestor_id: null,
    created_at: "",
    updated_at: "",
    document_type: null,
    document_number: null,
    kyc_status: "aprobado",
    kyc_document_path: null,
    kyc_rejection_reason: null,
    terms_accepted_at: null,
    habeas_data_accepted_at: null,
    notification_preferences: {
      paquete_recibido: false,
      aprobado_aduana: false,
      impuesto_pendiente: false,
      canal_whatsapp_sms: false,
    },
    address_street: null,
    address_city: null,
    address_department: null,
    address_postal_code: null,
    address_country: null,
    ...over,
  };
}

function Harness() {
  const { profile, loading, profileError, refreshProfile } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="profile-name">{profile?.full_name ?? "sin-perfil"}</span>
      <span data-testid="profile-error">{profileError ?? "sin-error"}</span>
      <button onClick={() => refreshProfile()}>refrescar</button>
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <Harness />
    </AuthProvider>
  );
}

beforeEach(() => {
  singleMock.mockReset();
  getSessionMock.mockReset().mockResolvedValue({ data: { session: fakeSession } });
  onAuthStateChangeMock
    .mockReset()
    .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  channelFnMock.mockClear();
  channelObj.on.mockClear().mockReturnValue(channelObj);
  channelObj.subscribe.mockClear().mockReturnValue(channelObj);
  removeChannelMock.mockClear();
});

describe("AuthContext — carga de perfil", () => {
  it("carga el perfil en el primer intento", async () => {
    singleMock.mockResolvedValue({ data: fakeProfile({ full_name: "Ana" }), error: null });

    renderHarness();

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("profile-name").textContent).toBe("Ana");
    expect(screen.getByTestId("profile-error").textContent).toBe("sin-error");
    expect(singleMock).toHaveBeenCalledTimes(1);
  });

  it("con PGRST116 (perfil inexistente) no reintenta", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116", message: "No existe" } });

    renderHarness();

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("profile-error").textContent).toBe("No existe");
    expect(singleMock).toHaveBeenCalledTimes(1);
  });

  it("reintenta ante un error transitorio y termina cargando el perfil", async () => {
    singleMock
      .mockResolvedValueOnce({ data: null, error: { code: "500", message: "network" } })
      .mockResolvedValueOnce({ data: fakeProfile({ full_name: "Beto" }), error: null });

    renderHarness();

    await waitFor(() => expect(screen.getByTestId("profile-name").textContent).toBe("Beto"), {
      timeout: 3000,
    });
    expect(singleMock).toHaveBeenCalledTimes(2);
  });

  it("si un refresh posterior falla, conserva el perfil ya cargado (no lo borra)", async () => {
    singleMock.mockResolvedValueOnce({ data: fakeProfile({ full_name: "Carla" }), error: null });

    renderHarness();
    await waitFor(() => expect(screen.getByTestId("profile-name").textContent).toBe("Carla"));

    singleMock.mockReset().mockResolvedValue({ data: null, error: { code: "500", message: "caído" } });

    await userEvent.click(screen.getByText("refrescar"));

    await waitFor(() => expect(screen.getByTestId("profile-error").textContent).toBe("caído"), {
      timeout: 3000,
    });
    expect(screen.getByTestId("profile-name").textContent).toBe("Carla");
  });

  it("abre un canal Realtime sobre la fila propia del perfil", async () => {
    singleMock.mockResolvedValue({ data: fakeProfile(), error: null });

    renderHarness();

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(channelFnMock).toHaveBeenCalledWith("perfil:u1");
    expect(channelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ event: "UPDATE", table: "profiles", filter: "id=eq.u1" }),
      expect.any(Function)
    );
  });
});
