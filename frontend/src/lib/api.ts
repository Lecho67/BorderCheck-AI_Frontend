import type { DiagnosticoEnvio, WizardFormData } from "./types";
import { evaluarEnvioMock } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = !API_BASE_URL;

/**
 * Único punto de intercambio con el backend real.
 * Cuando el backend esté listo, setea VITE_API_BASE_URL en .env
 * y esta función empezará a llamar a la API real sin tocar
 * ningún componente de la UI.
 */
export async function evaluarEnvio(data: WizardFormData): Promise<DiagnosticoEnvio> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return evaluarEnvioMock(data);
  }

  const response = await fetch(`${API_BASE_URL}/api/consultas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("No se pudo completar el análisis. Inténtalo de nuevo.");
  }

  return response.json();
}
