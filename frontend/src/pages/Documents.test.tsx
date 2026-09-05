import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Documents from "./Documents";
import { useAuth } from "@/hooks/useAuth";
import { fetchMisDocumentos } from "@/lib/documentService";
import type { DocumentRecord, Profile } from "@/types/database.types";

vi.mock("@/hooks/useAuth");
vi.mock("@/lib/documentService", () => ({
  fetchMisDocumentos: vi.fn(),
  subirDocumento: vi.fn(),
  obtenerUrlDocumento: vi.fn(),
  eliminarDocumento: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const fetchMock = vi.mocked(fetchMisDocumentos);

function setKyc(kyc_status: Profile["kyc_status"]) {
  mockUseAuth.mockReturnValue({
    profile: { kyc_status } as Profile,
  } as unknown as ReturnType<typeof useAuth>);
}

function doc(over: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id: "d1",
    user_id: "u1",
    file_name: "factura.pdf",
    file_path: "u1/factura.pdf",
    file_type: "application/pdf",
    related_pre_alert_id: null,
    created_at: "2026-01-01",
    status: "pendiente",
    reviewed_by: null,
    review_reason: null,
    reviewed_at: null,
    assigned_agent_id: null,
    ...over,
  };
}

beforeEach(() => {
  mockUseAuth.mockReset();
  fetchMock.mockReset().mockResolvedValue([]);
});

describe("Documents — modo lectura por KYC", () => {
  it("con KYC pendiente: banner, subida deshabilitada, sin botón de eliminar", async () => {
    setKyc("pendiente");
    fetchMock.mockResolvedValue([doc()]);
    render(<Documents />);

    await screen.findByText("factura.pdf");
    expect(screen.getByText(/verificación de identidad está en revisión/i)).toBeInTheDocument();
    expect(screen.getByText("Subir documento").closest("label")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it("con KYC aprobado: sin banner, subida activa, botón de eliminar visible", async () => {
    setKyc("aprobado");
    fetchMock.mockResolvedValue([doc()]);
    render(<Documents />);

    await screen.findByText("factura.pdf");
    expect(
      screen.queryByText(/verificación de identidad está en revisión/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Subir documento").closest("label")).toHaveAttribute(
      "for",
      "upload-doc"
    );
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
  });
});

describe("Documents — lista", () => {
  it("muestra el estado vacío", async () => {
    setKyc("aprobado");
    fetchMock.mockResolvedValue([]);
    render(<Documents />);
    expect(await screen.findByText(/No has subido ningún documento/i)).toBeInTheDocument();
  });
});
