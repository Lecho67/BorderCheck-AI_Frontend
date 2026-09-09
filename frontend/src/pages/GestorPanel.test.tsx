import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GestorPanel } from "./GestorPanel";
import { fetchClientesDelGestor, type ClienteConCartera } from "@/lib/gestorService";
import type { CustomsQuery, Profile } from "@/types/database.types";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ profile: { id: "g1", role: "gestor" } }) }));
vi.mock("@/lib/gestorService", () => ({ fetchClientesDelGestor: vi.fn() }));

const fetchMock = vi.mocked(fetchClientesDelGestor);

function consulta(id: string, ai_verdict = "APROBADO"): CustomsQuery {
  return { id, ai_verdict, product_description: `producto ${id}` } as CustomsQuery;
}

function entrada(id: string, consultas: CustomsQuery[] = []): ClienteConCartera {
  const resumen: Record<string, number> = {};
  for (const q of consultas) resumen[q.ai_verdict] = (resumen[q.ai_verdict] ?? 0) + 1;
  return {
    cliente: { id, email: `${id}@test.test`, full_name: `Cliente ${id}` } as Profile,
    consultas,
    resumen,
  };
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue([]);
});

describe("GestorPanel", () => {
  it("lista los clientes de la cartera con su contador", async () => {
    fetchMock.mockResolvedValue([entrada("c1"), entrada("c2")]);
    render(<GestorPanel />);

    expect(await screen.findByText("Cliente c1")).toBeInTheDocument();
    expect(screen.getByText("Cliente c2")).toBeInTheDocument();
    expect(screen.getByText("2 clientes en tu cartera.")).toBeInTheDocument();
  });

  it("con un solo cliente lo muestra ya expandido", async () => {
    fetchMock.mockResolvedValue([entrada("c1", [consulta("q1")])]);
    render(<GestorPanel />);

    expect(await screen.findByText("producto q1")).toBeInTheDocument();
  });

  it("con varios clientes arranca colapsado y expande al hacer clic", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      entrada("c1", [consulta("q1")]),
      entrada("c2", [consulta("q2")]),
    ]);
    render(<GestorPanel />);
    await screen.findByText("Cliente c1");

    expect(screen.queryByText("producto q1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Cliente c1/ }));

    expect(screen.getByText("producto q1")).toBeInTheDocument();
    expect(screen.queryByText("producto q2")).not.toBeInTheDocument();
  });

  it("filtra por nombre cuando la cartera supera los 4 clientes", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(Array.from({ length: 5 }, (_, i) => entrada(`c${i + 1}`)));
    render(<GestorPanel />);
    await screen.findByText("Cliente c1");

    await user.type(screen.getByLabelText("Buscar cliente"), "c3");

    expect(screen.getByText("Cliente c3")).toBeInTheDocument();
    expect(screen.queryByText("Cliente c1")).not.toBeInTheDocument();
  });

  it("pagina cuando hay más de 8 clientes", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(Array.from({ length: 10 }, (_, i) => entrada(`c${i + 1}`)));
    render(<GestorPanel />);
    await screen.findByText("Cliente c1");

    expect(screen.queryByText("Cliente c9")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.queryByText("Cliente c1")).not.toBeInTheDocument();
    expect(screen.getByText("Cliente c9")).toBeInTheDocument();
  });
});
