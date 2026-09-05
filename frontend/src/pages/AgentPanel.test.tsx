import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentPanel } from "./AgentPanel";
import { fetchColaDeRevision, type CasoEnCola } from "@/lib/agentService";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "agente-1" } }) }));
vi.mock("@/lib/agentService", () => ({ fetchColaDeRevision: vi.fn() }));
vi.mock("@/components/agent/CasoRevisionCard", () => ({
  CasoRevisionCard: ({ caso }: { caso: CasoEnCola }) => <div>drawer:{caso.id}</div>,
}));

const fetchMock = vi.mocked(fetchColaDeRevision);

function caso(id: string, paisDestino: string, over: Partial<CasoEnCola> = {}): CasoEnCola {
  return {
    id,
    user_id: "u1",
    product_description: `producto ${id}`,
    hs_code: null,
    ai_verdict: "PRECAUCION",
    ai_confidence: null,
    raw_response: { input: { paisDestino } } as Record<string, unknown>,
    created_at: "2026-01-15T10:00:00Z",
    overridden_by: null,
    override_reason: null,
    overridden_at: null,
    original_ai_verdict: null,
    assigned_agent_id: null,
    cliente: { full_name: `Cliente ${id}` } as CasoEnCola["cliente"],
    ...over,
  };
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue([]);
});

describe("AgentPanel", () => {
  it("carga y muestra los casos de la cola", async () => {
    fetchMock.mockResolvedValue([caso("c1", "Colombia"), caso("c2", "México")]);
    render(<AgentPanel />);

    expect(await screen.findByText("Cliente c1")).toBeInTheDocument();
    expect(screen.getByText("Cliente c2")).toBeInTheDocument();
    expect(screen.getByText(/2 de 2 casos/i)).toBeInTheDocument();
  });

  it("muestra el estado vacío", async () => {
    fetchMock.mockResolvedValue([]);
    render(<AgentPanel />);
    expect(await screen.findByText("No hay casos pendientes en este momento.")).toBeInTheDocument();
  });

  it("filtra por país y actualiza el contador", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([caso("c1", "Colombia"), caso("c2", "México")]);
    render(<AgentPanel />);
    await screen.findByText("Cliente c1");

    await user.selectOptions(screen.getByLabelText("País destino"), "México");

    expect(screen.queryByText("Cliente c1")).not.toBeInTheDocument();
    expect(screen.getByText("Cliente c2")).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 casos/i)).toBeInTheDocument();
  });

  it("'Limpiar filtros' restaura la lista completa", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([caso("c1", "Colombia"), caso("c2", "México")]);
    render(<AgentPanel />);
    await screen.findByText("Cliente c1");

    await user.selectOptions(screen.getByLabelText("País destino"), "México");
    await user.click(screen.getByText("Limpiar filtros"));

    expect(screen.getByText("Cliente c1")).toBeInTheDocument();
    expect(screen.getByText("Cliente c2")).toBeInTheDocument();
  });

  it("'Auditar caso' abre el drawer de revisión", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([caso("c1", "Colombia")]);
    render(<AgentPanel />);
    await screen.findByText("Cliente c1");

    await user.click(screen.getByText("Auditar caso"));

    expect(screen.getByText("drawer:c1")).toBeInTheDocument();
  });
});
