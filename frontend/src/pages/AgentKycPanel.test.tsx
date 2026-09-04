import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentKycPanel } from "./AgentKycPanel";
import { fetchKycPendientes } from "@/lib/kycReviewService";
import type { Profile } from "@/types/database.types";

vi.mock("@/lib/kycReviewService", () => ({
  fetchKycPendientes: vi.fn(),
}));

// La página solo orquesta lista/carga/refresco; KycReviewCard se prueba aparte.
vi.mock("@/components/kyc/KycReviewCard", () => ({
  KycReviewCard: ({ perfil, onResuelto }: { perfil: Profile; onResuelto: () => void }) => (
    <div>
      <span>{perfil.email}</span>
      <button onClick={onResuelto}>resolver {perfil.email}</button>
    </div>
  ),
}));

const fetchMock = vi.mocked(fetchKycPendientes);

function fakePerfil(over: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    email: "cliente@test.test",
    full_name: "Cliente",
    locker_code: null,
    phone: null,
    role: "cliente",
    gestor_id: null,
    created_at: "",
    updated_at: "",
    document_type: null,
    document_number: null,
    kyc_status: "pendiente",
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

beforeEach(() => {
  fetchMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AgentKycPanel", () => {
  it("carga y muestra las verificaciones pendientes", async () => {
    fetchMock.mockResolvedValue([fakePerfil()]);

    render(<AgentKycPanel />);

    expect(await screen.findByText("cliente@test.test")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no hay pendientes", async () => {
    fetchMock.mockResolvedValue([]);

    render(<AgentKycPanel />);

    expect(
      await screen.findByText("No hay verificaciones de identidad pendientes.")
    ).toBeInTheDocument();
  });

  it("muestra el error si falla la carga", async () => {
    fetchMock.mockRejectedValue(new Error("caído"));

    render(<AgentKycPanel />);

    expect(await screen.findByText("caído")).toBeInTheDocument();
  });

  it("el botón Actualizar vuelve a pedir la lista", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([fakePerfil()]);

    render(<AgentKycPanel />);
    await screen.findByText("cliente@test.test");

    await user.click(screen.getByText("Actualizar"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("resolver una tarjeta la saca de la lista", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([fakePerfil()]);

    render(<AgentKycPanel />);
    await screen.findByText("cliente@test.test");

    await user.click(screen.getByText("resolver cliente@test.test"));

    expect(screen.queryByText("cliente@test.test")).not.toBeInTheDocument();
  });

  it("se auto-refresca por polling cada 30s (sin RPC de Realtime disponible para KYC)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockResolvedValue([fakePerfil()]);

    render(<AgentKycPanel />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await vi.advanceTimersByTimeAsync(30_000);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
