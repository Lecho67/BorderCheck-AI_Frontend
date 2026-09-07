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

  it("filtra por búsqueda de nombre o correo", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakePerfil({ id: "u1", email: "ana@test.test", full_name: "Ana" }),
      fakePerfil({ id: "u2", email: "beto@test.test", full_name: "Beto" }),
    ]);

    render(<AgentKycPanel />);
    await screen.findByText("ana@test.test");

    await user.type(screen.getByLabelText("Buscar"), "beto");

    expect(screen.queryByText("ana@test.test")).not.toBeInTheDocument();
    expect(screen.getByText("beto@test.test")).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 verificaciones/i)).toBeInTheDocument();
  });

  it("filtra por tipo de documento", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakePerfil({ id: "u1", email: "cc@test.test", document_type: "CC" }),
      fakePerfil({ id: "u2", email: "nit@test.test", document_type: "NIT" }),
    ]);

    render(<AgentKycPanel />);
    await screen.findByText("cc@test.test");

    await user.selectOptions(screen.getByLabelText("Tipo de documento"), "NIT");

    expect(screen.queryByText("cc@test.test")).not.toBeInTheDocument();
    expect(screen.getByText("nit@test.test")).toBeInTheDocument();
  });

  it("ordena por más recientes primero", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakePerfil({ id: "u1", email: "vieja@test.test", updated_at: "2026-01-01" }),
      fakePerfil({ id: "u2", email: "nueva@test.test", updated_at: "2026-03-01" }),
    ]);

    render(<AgentKycPanel />);
    await screen.findByText("vieja@test.test");

    const porDefecto = screen.getAllByText(/^\S+@test\.test$/).map((el) => el.textContent);
    expect(porDefecto).toEqual(["vieja@test.test", "nueva@test.test"]);

    await user.selectOptions(screen.getByLabelText("Orden"), "Más recientes primero");

    const invertido = screen.getAllByText(/^\S+@test\.test$/).map((el) => el.textContent);
    expect(invertido).toEqual(["nueva@test.test", "vieja@test.test"]);
  });

  it("pagina cuando hay más de 8 verificaciones", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) =>
        fakePerfil({
          id: `u${i + 1}`,
          email: `cliente-${i + 1}@test.test`,
          updated_at: `2026-01-${String(i + 1).padStart(2, "0")}`,
        }),
      ),
    );

    render(<AgentKycPanel />);
    await screen.findByText("cliente-1@test.test");

    expect(screen.queryByText("cliente-9@test.test")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.queryByText("cliente-1@test.test")).not.toBeInTheDocument();
    expect(screen.getByText("cliente-9@test.test")).toBeInTheDocument();
    expect(screen.getByText("cliente-10@test.test")).toBeInTheDocument();
  });

  it("'Limpiar filtros' restaura la lista completa", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakePerfil({ id: "u1", email: "ana@test.test" }),
      fakePerfil({ id: "u2", email: "beto@test.test" }),
    ]);

    render(<AgentKycPanel />);
    await screen.findByText("ana@test.test");

    await user.type(screen.getByLabelText("Buscar"), "ana");
    expect(screen.queryByText("beto@test.test")).not.toBeInTheDocument();

    await user.click(screen.getByText("Limpiar filtros"));

    expect(screen.getByText("ana@test.test")).toBeInTheDocument();
    expect(screen.getByText("beto@test.test")).toBeInTheDocument();
  });
});
