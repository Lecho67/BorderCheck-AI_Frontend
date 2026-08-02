import type { DiagnosticoEnvio, WizardFormData } from "./types";
import { evaluarEnvioMock } from "./mockData";
import { supabase } from "./supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = !API_BASE_URL;

/**
 * Único punto de intercambio con el backend real.
 * Cuando el backend esté listo, setea VITE_API_BASE_URL en .env
 * y esta función empezará a llamar a la API real sin tocar
 * ningún componente de la UI.
 *
 * Contrato esperado del backend:
 *   POST {VITE_API_BASE_URL}/api/consultas
 *   Headers: Authorization: Bearer <supabase_access_token>
 *   Body: WizardFormData (ver src/lib/types.ts)
 *   Response 200: DiagnosticoEnvio (ver src/lib/types.ts)
 *   Response !2xx: { "error": "mensaje" } (opcional)
 */
export async function evaluarEnvio(data: WizardFormData): Promise<DiagnosticoEnvio> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return evaluarEnvioMock(data);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_BASE_URL}/api/consultas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo completar el análisis. Inténtalo de nuevo.");
  }

  return response.json();
}