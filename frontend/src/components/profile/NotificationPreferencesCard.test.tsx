import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { useAuth } from "@/hooks/useAuth";
import { actualizarPreferenciasNotificaciones } from "@/lib/profileService";
import type { NotificationPreferences, Profile } from "@/types/database.types";

vi.mock("@/hooks/useAuth");
vi.mock("@/lib/profileService", () => ({
  actualizarPreferenciasNotificaciones: vi.fn().mockResolvedValue(undefined),
}));

const mockUseAuth = vi.mocked(useAuth);
const actualizarMock = vi.mocked(actualizarPreferenciasNotificaciones);
const refreshProfile = vi.fn();

function conPrefs(prefs: Partial<NotificationPreferences> | null) {
  mockUseAuth.mockReturnValue({
    user: { id: "u1" },
    profile: { notification_preferences: prefs } as Profile,
    refreshProfile,
  } as unknown as ReturnType<typeof useAuth>);
}

beforeEach(() => {
  mockUseAuth.mockReset();
  actualizarMock.mockClear().mockResolvedValue({} as never);
  refreshProfile.mockReset();
});

describe("NotificationPreferencesCard", () => {
  it("no renderiza nada sin perfil", () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null } as ReturnType<typeof useAuth>);
    const { container } = render(<NotificationPreferencesCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("refleja las preferencias guardadas", () => {
    conPrefs({ paquete_recibido: true, aprobado_aduana: false, impuesto_pendiente: true });
    render(<NotificationPreferencesCard />);

    const checks = screen.getAllByRole("checkbox");
    expect(checks[0]).toBeChecked(); // paquete_recibido
    expect(checks[1]).not.toBeChecked(); // aprobado_aduana
    expect(checks[2]).toBeChecked(); // impuesto_pendiente
  });

  it("usa defaults (todo activo) cuando no hay preferencias guardadas", () => {
    conPrefs(null);
    render(<NotificationPreferencesCard />);
    screen.getAllByRole("checkbox").forEach((c) => expect(c).toBeChecked());
  });

  it("al destildar una opción guarda el valor invertido y refresca el perfil", async () => {
    conPrefs({ paquete_recibido: true, aprobado_aduana: true, impuesto_pendiente: true });
    const user = userEvent.setup();
    render(<NotificationPreferencesCard />);

    await user.click(screen.getAllByRole("checkbox")[0]);

    expect(actualizarMock).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ paquete_recibido: false, aprobado_aduana: true })
    );
    await waitFor(() => expect(refreshProfile).toHaveBeenCalled());
  });
});
