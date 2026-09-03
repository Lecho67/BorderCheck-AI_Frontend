import { useContext } from "react";
import { AuthContext } from "@/context/auth";

/**
 * Acceso al contexto de autenticación (sesión, usuario, perfil, helpers).
 * Debe usarse dentro de un `<AuthProvider>`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
