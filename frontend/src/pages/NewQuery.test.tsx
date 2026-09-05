import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewQuery } from "./NewQuery";
import { evaluarEnvio } from "@/lib/api";
import type { DiagnosticoEnvio, WizardFormData } from "@/lib/types";

const navigate = vi.fn();
const addConsulta = vi.fn();

vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
vi.mock("@/lib/api", () => ({ evaluarEnvio: vi.fn() }));
vi.mock("@/store/useQueryStore", () => ({
  useQueryStore: (selector: (s: { addConsulta: typeof addConsulta }) => unknown) =>
    selector({ addConsulta }),
}));
vi.mock("@/components/ShipmentForm", () => ({
  ShipmentForm: ({ onSubmit }: { onSubmit: (d: WizardFormData) => void }) => (
    <button onClick={() => onSubmit({ descripcionItem: "algo" } as WizardFormData)}>
      enviar-wizard
    </button>
  ),
}));

const evaluarMock = vi.mocked(evaluarEnvio);

beforeEach(() => {
  navigate.mockReset();
  addConsulta.mockReset();
  evaluarMock.mockReset();
});

describe("NewQuery", () => {
  it("con éxito: guarda el diagnóstico y navega a /consulta/:id", async () => {
    evaluarMock.mockResolvedValue({ id: "diag-1" } as DiagnosticoEnvio);
    const user = userEvent.setup();

    render(<NewQuery />);
    await user.click(screen.getByText("enviar-wizard"));

    await waitFor(() => expect(addConsulta).toHaveBeenCalledWith({ id: "diag-1" }));
    expect(navigate).toHaveBeenCalledWith("/consulta/diag-1");
  });

  it("con error: muestra el banner y no navega", async () => {
    evaluarMock.mockRejectedValue(new Error("motor caído"));
    const user = userEvent.setup();

    render(<NewQuery />);
    await user.click(screen.getByText("enviar-wizard"));

    expect(await screen.findByText(/motor caído/)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("mientras evalúa muestra el esqueleto de carga", async () => {
    let resolver: (d: DiagnosticoEnvio) => void = () => {};
    evaluarMock.mockReturnValue(new Promise((r) => { resolver = r; }));
    const user = userEvent.setup();

    render(<NewQuery />);
    await user.click(screen.getByText("enviar-wizard"));

    await waitFor(() => expect(screen.queryByText("enviar-wizard")).not.toBeInTheDocument());
    resolver({ id: "diag-2" } as DiagnosticoEnvio);
  });
});
