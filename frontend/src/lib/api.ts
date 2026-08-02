import type { DiagnosticoEnvio, WizardFormData } from "./types";
import { evaluarEnvioMock } from "./mockData";
import { supabase } from "./supabase";
import {
  buildShipmentEvaluationRequest,
  mapDecisionResultToDiagnostico,
  type DecisionEngineResult,
} from "./shipmentMapping";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = !API_BASE_URL;

/**
 * Único punto de intercambio con el backend real (motor de reglas de
 * BorderCheck-AI_Backend, repo de mi compañero).
 *
 * Contrato REAL confirmado leyendo su código fuente (no coincide con el
 * `WizardFormData` -> `DiagnosticoEnvio` original que se documentó antes de
 * tener acceso al repo):
 *
 *   POST {VITE_API_BASE_URL}/api/v1/shipments/evaluate
 *   Body: ShipmentEvaluationRequest (ver src/lib/shipmentMapping.ts)
 *   Response 200: DecisionEngineResult (ver src/lib/shipmentMapping.ts)
 *   Response 400: { error, message, details: [{ field, message }] } (Zod)
 *   Response 500: { error, message, detail? }
 *
 * El backend NO valida el JWT de Supabase (no tiene auth ni persistencia
 * propia), así que seguimos siendo nosotros quienes:
 *   1. Adjuntamos el JWT igual, por si en el futuro agregan validación.
 *   2. Guardamos el resultado en `customs_queries` desde el cliente.
 */
export async function evaluarEnvio(data: WizardFormData): Promise<DiagnosticoEnvio> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return evaluarEnvioMock(data);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const shipmentRequest = buildShipmentEvaluationRequest(data, user?.id ?? null);

  const response = await fetch(`${API_BASE_URL}/api/v1/shipments/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(shipmentRequest),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.details?.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join(" | ");
    throw new Error(
      detail || body?.message || "No se pudo completar el análisis. Inténtalo de nuevo."
    );
  }

  const decisionResult: DecisionEngineResult = await response.json();
  const diagnostico = mapDecisionResultToDiagnostico(
    shipmentRequest.id,
    shipmentRequest,
    decisionResult,
    data
  );

  await guardarConsultaEnHistorial(diagnostico, user?.id);

  return diagnostico;
}

/**
 * Guarda el veredicto en `customs_queries` para que aparezca en
 * `/dashboard/historial` (que ya lee de Supabase). Si falla, no rompemos el
 * flujo del usuario — solo lo registramos en consola, ya que el veredicto
 * igual se muestra en `/consulta/:id` a partir del store local.
 */
async function guardarConsultaEnHistorial(
  diagnostico: DiagnosticoEnvio,
  userId: string | undefined
): Promise<void> {
  if (!userId) return;

  const { error } = await supabase.from("customs_queries").insert({
    id: diagnostico.id,
    user_id: userId,
    product_description: diagnostico.input.descripcionItem,
    hs_code:
      diagnostico.partidaArancelariaTentativa === "Sin partida tentativa declarada"
        ? null
        : diagnostico.partidaArancelariaTentativa,
    ai_verdict: diagnostico.nivel,
    ai_confidence: null,
    // Guardamos el DiagnosticoEnvio completo (no solo la respuesta cruda del
    // motor) para poder reconstruir /consulta/:id y /dashboard/historial
    // leyendo únicamente de Supabase, sin depender del store en memoria.
    raw_response: diagnostico as unknown as Record<string, unknown>,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("No se pudo guardar la consulta en customs_queries:", error);
  }
}
