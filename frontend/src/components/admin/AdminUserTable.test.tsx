import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminUserTable } from "./AdminUserTable";
import { fetchTodosLosUsuarios, actualizarRol } from "@/lib/adminService";
import type { Profile } from "@/types/database.types";

vi.mock("@/lib/adminService", () => ({
  fetchTodosLosUsuarios: vi.fn(),
  actualizarRol: vi.fn().mockResolvedValue({}),
  asignarGestor: vi.fn().mockResolvedValue({}),
}));

const fetchMock = vi.mocked(fetchTodosLosUsuarios);
const actualizarRolMock = vi.mocked(actualizarRol);

function usuario(over: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    email: "juan@test.test",
    full_name: "Juan Pérez",
    locker_code: null,
    phone: null,
    role: "cliente",
    gestor_id: null,
    created_at: "",
    updated_at: "",
    document_type: null,
    document_number: null,
    kyc_status: "no_iniciado",
    kyc_document_path: null,
    kyc_rejection_reason: null,
    terms_accepted_at: null,
    habeas_data_accepted_at: null,
    notification_preferences: {
      paquete_recibido: true,
      aprobado_aduana: true,
      impuesto_pendiente: true,
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
  fetchMock.mockReset().mockResolvedValue([usuario()]);
  actualizarRolMock.mockClear().mockResolvedValue({} as never);
});

describe("AdminUserTable", () => {
  it("carga y muestra los usuarios", async () => {
    render(<AdminUserTable />);
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan@test.test")).toBeInTheDocument();
  });

  it("cambiar el rol abre el modal de confirmación sin aplicar el cambio todavía", async () => {
    const user = userEvent.setup();
    render(<AdminUserTable />);
    await screen.findByText("Juan Pérez");

    const [selectRol] = screen.getAllByRole("combobox");
    await user.selectOptions(selectRol, "agente");

    expect(screen.getByText("Confirmar cambio")).toBeInTheDocument();
    expect(actualizarRolMock).not.toHaveBeenCalled();
  });

  it("muestra la advertencia al ascender a admin", async () => {
    const user = userEvent.setup();
    render(<AdminUserTable />);
    await screen.findByText("Juan Pérez");

    const [selectRol] = screen.getAllByRole("combobox");
    await user.selectOptions(selectRol, "admin");

    expect(screen.getByText(/control total del sistema/i)).toBeInTheDocument();
  });

  it("'Cancelar' cierra el modal sin llamar al servicio", async () => {
    const user = userEvent.setup();
    render(<AdminUserTable />);
    await screen.findByText("Juan Pérez");

    await user.selectOptions(screen.getAllByRole("combobox")[0], "agente");
    await user.click(screen.getByText("Cancelar"));

    expect(screen.queryByText("Confirmar cambio")).not.toBeInTheDocument();
    expect(actualizarRolMock).not.toHaveBeenCalled();
  });

  it("'Confirmar' aplica el cambio de rol", async () => {
    const user = userEvent.setup();
    render(<AdminUserTable />);
    await screen.findByText("Juan Pérez");

    await user.selectOptions(screen.getAllByRole("combobox")[0], "agente");
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(actualizarRolMock).toHaveBeenCalledWith("u1", "agente"));
    await waitFor(() => expect(screen.queryByText("Confirmar cambio")).not.toBeInTheDocument());
  });

  it("pagina cuando hay más de 8 usuarios", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) =>
        usuario({ id: `u${i + 1}`, full_name: `Usuario ${i + 1}`, email: `u${i + 1}@test.test`, role: "agente" }),
      ),
    );
    render(<AdminUserTable />);
    await screen.findByText("Usuario 1");

    expect(screen.queryByText("Usuario 9")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.queryByText("Usuario 1")).not.toBeInTheDocument();
    expect(screen.getByText("Usuario 9")).toBeInTheDocument();
  });

  it("filtra por nombre o correo", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) =>
        usuario({ id: `u${i + 1}`, full_name: `Usuario ${i + 1}`, email: `u${i + 1}@test.test`, role: "agente" }),
      ),
    );
    render(<AdminUserTable />);
    await screen.findByText("Usuario 1");

    await user.type(screen.getByLabelText("Buscar usuario"), "Usuario 9");

    expect(screen.getByText("Usuario 9")).toBeInTheDocument();
    expect(screen.queryByText("Usuario 1")).not.toBeInTheDocument();
  });
});
