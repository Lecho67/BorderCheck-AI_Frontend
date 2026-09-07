import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentDocumentsPanel } from "./AgentDocumentsPanel";
import { fetchDocumentosPendientes, type DocumentoConCliente } from "@/lib/documentReviewService";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "agente-1" } }) }));
vi.mock("@/lib/documentReviewService", () => ({ fetchDocumentosPendientes: vi.fn() }));

// La página solo orquesta lista/filtros/paginación; DocumentReviewCard se prueba aparte.
vi.mock("@/components/documents/DocumentReviewCard", () => ({
  DocumentReviewCard: ({ doc }: { doc: DocumentoConCliente }) => (
    <div>
      <span>{doc.file_name}</span>
      <span>{doc.cliente?.full_name}</span>
    </div>
  ),
}));

const fetchMock = vi.mocked(fetchDocumentosPendientes);

function fakeDoc(over: Partial<DocumentoConCliente> = {}): DocumentoConCliente {
  return {
    id: "d1",
    user_id: "u1",
    file_name: "factura.pdf",
    file_path: "u1/factura.pdf",
    file_type: "application/pdf",
    related_pre_alert_id: null,
    created_at: "2026-01-10T10:00:00Z",
    status: "pendiente",
    reviewed_by: null,
    review_reason: null,
    reviewed_at: null,
    assigned_agent_id: null,
    cliente: { full_name: "Cliente Uno", email: "uno@test.test" } as DocumentoConCliente["cliente"],
    ...over,
  };
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue([]);
});

describe("AgentDocumentsPanel", () => {
  it("carga y muestra los documentos pendientes", async () => {
    fetchMock.mockResolvedValue([
      fakeDoc({ id: "d1", file_name: "a.pdf" }),
      fakeDoc({ id: "d2", file_name: "b.pdf" }),
    ]);

    render(<AgentDocumentsPanel />);

    expect(await screen.findByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
    expect(screen.getByText(/2 de 2 documentos/i)).toBeInTheDocument();
  });

  it("muestra el estado vacío", async () => {
    render(<AgentDocumentsPanel />);
    expect(
      await screen.findByText("No hay documentos pendientes de revisión."),
    ).toBeInTheDocument();
  });

  it("muestra el error si falla la carga", async () => {
    fetchMock.mockRejectedValue(new Error("sin conexión"));
    render(<AgentDocumentsPanel />);
    expect(await screen.findByText("sin conexión")).toBeInTheDocument();
  });

  it("filtra por búsqueda de cliente o archivo", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakeDoc({ id: "d1", file_name: "recibo.pdf" }),
      fakeDoc({
        id: "d2",
        file_name: "contrato.pdf",
        cliente: { full_name: "Otra Persona" } as DocumentoConCliente["cliente"],
      }),
    ]);

    render(<AgentDocumentsPanel />);
    await screen.findByText("recibo.pdf");

    await user.type(screen.getByLabelText("Buscar"), "contrato");

    expect(screen.queryByText("recibo.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("contrato.pdf")).toBeInTheDocument();
  });

  it("filtra las asignadas al agente actual", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakeDoc({ id: "d1", file_name: "libre.pdf", assigned_agent_id: null }),
      fakeDoc({ id: "d2", file_name: "mia.pdf", assigned_agent_id: "agente-1" }),
      fakeDoc({ id: "d3", file_name: "ajena.pdf", assigned_agent_id: "agente-9" }),
    ]);

    render(<AgentDocumentsPanel />);
    await screen.findByText("libre.pdf");

    await user.selectOptions(screen.getByLabelText("Asignación"), "Asignadas a mí");

    expect(screen.getByText("mia.pdf")).toBeInTheDocument();
    expect(screen.queryByText("libre.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("ajena.pdf")).not.toBeInTheDocument();
  });

  it("ordena por más recientes primero", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakeDoc({ id: "d1", file_name: "viejo.pdf", created_at: "2026-01-01T00:00:00Z" }),
      fakeDoc({ id: "d2", file_name: "nuevo.pdf", created_at: "2026-03-01T00:00:00Z" }),
    ]);

    render(<AgentDocumentsPanel />);
    await screen.findByText("viejo.pdf");

    const porDefecto = screen.getAllByText(/\.pdf$/).map((el) => el.textContent);
    expect(porDefecto).toEqual(["viejo.pdf", "nuevo.pdf"]);

    await user.selectOptions(screen.getByLabelText("Orden"), "Más recientes primero");

    const invertido = screen.getAllByText(/\.pdf$/).map((el) => el.textContent);
    expect(invertido).toEqual(["nuevo.pdf", "viejo.pdf"]);
  });

  it("pagina cuando hay más de 8 documentos", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) =>
        fakeDoc({
          id: `d${i + 1}`,
          file_name: `doc-${i + 1}.pdf`,
          created_at: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
        }),
      ),
    );

    render(<AgentDocumentsPanel />);
    await screen.findByText("doc-1.pdf");

    expect(screen.queryByText("doc-9.pdf")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.queryByText("doc-1.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("doc-9.pdf")).toBeInTheDocument();
  });

  it("'Limpiar filtros' restaura la lista completa", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue([
      fakeDoc({ id: "d1", file_name: "a.pdf" }),
      fakeDoc({ id: "d2", file_name: "b.pdf" }),
    ]);

    render(<AgentDocumentsPanel />);
    await screen.findByText("a.pdf");

    await user.type(screen.getByLabelText("Buscar"), "a.pdf");
    expect(screen.queryByText("b.pdf")).not.toBeInTheDocument();

    await user.click(screen.getByText("Limpiar filtros"));

    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
  });
});
