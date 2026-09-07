import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/database.types";

vi.mock("@/hooks/useAuth");
const mockUseAuth = vi.mocked(useAuth);

type AuthValue = ReturnType<typeof useAuth>;

function renderRoute(auth: Partial<AuthValue>, allowedRoles?: UserRole[]) {
  mockUseAuth.mockReturnValue({
    user: null,
    session: null,
    profile: null,
    loading: false,
    profileError: null,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
    ...auth,
  } as AuthValue);

  return render(
    <MemoryRouter initialEntries={["/privado"]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN</div>} />
        <Route path="/dashboard" element={<div>HOME CLIENTE</div>} />
        <Route
          path="/privado"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>PRIVADO</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

const user = { id: "u1" } as AuthValue["user"];

describe("ProtectedRoute", () => {
  it("muestra un spinner mientras carga la sesión", () => {
    const { container } = renderRoute({ loading: true });
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("redirige a /login si no hay usuario", () => {
    renderRoute({ user: null });
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
  });

  it("renderiza el contenido con sesión y perfil válidos", () => {
    renderRoute({ user, profile: { role: "cliente" } as AuthValue["profile"] });
    expect(screen.getByText("PRIVADO")).toBeInTheDocument();
  });

  it("no expulsa: muestra 'Reintentar' si hay sesión pero el perfil no cargó", () => {
    renderRoute({ user, profile: null, profileError: "network error" });
    expect(screen.getByText(/No pudimos cargar tu perfil/i)).toBeInTheDocument();
    expect(screen.queryByText("PRIVADO")).not.toBeInTheDocument();
    expect(screen.queryByText("LOGIN")).not.toBeInTheDocument();
  });

  it("con allowedRoles y el perfil todavía cargando (sin error): espera, no redirige", () => {
    const { container } = renderRoute({ user, profile: null, profileError: null }, ["admin"]);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("HOME CLIENTE")).not.toBeInTheDocument();
    expect(screen.queryByText("LOGIN")).not.toBeInTheDocument();
    expect(screen.queryByText("PRIVADO")).not.toBeInTheDocument();
  });

  it("redirige a la home del rol si el rol no está permitido", () => {
    renderRoute(
      { user, profile: { role: "cliente" } as AuthValue["profile"] },
      ["admin"]
    );
    expect(screen.getByText("HOME CLIENTE")).toBeInTheDocument();
    expect(screen.queryByText("PRIVADO")).not.toBeInTheDocument();
  });

  it("permite el acceso si el rol está en allowedRoles", () => {
    renderRoute(
      { user, profile: { role: "admin" } as AuthValue["profile"] },
      ["admin"]
    );
    expect(screen.getByText("PRIVADO")).toBeInTheDocument();
  });
});
