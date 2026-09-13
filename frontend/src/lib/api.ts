import type { DiagnosticoEnvio, WizardFormData } from "./types";
import { evaluarEnvioMock } from "./mockData";
import { supabase } from "./supabase";
import { toast } from "./toast";
import {
  buildShipmentEvaluationRequest,
  mapDecisionResultToDiagnostico,
  type DecisionEngineResult,
} from "./shipmentMapping";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = !API_BASE_URL;
const API_KEY = import.meta.env.VITE_X_API_KEY ?? "";

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
 * propia) — la sesión de Supabase se sigue usando solo para guardar el
 * historial desde el cliente. La autenticación ante el motor de reglas es
 * por API key (`X-API-Key`, ver `VITE_X_API_KEY`): su CORS ya no permite el
 * header `Authorization` (no está en `allowedHeaders`), así que enviarlo
 * rompería el preflight y el fetch fallaría antes de llegar al backend.
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
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify(shipmentRequest),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.details
      ?.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
      .join(" | ");
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

  await guardarConsultaEnHistorial(diagnostico, decisionResult.final_status, user?.id);

  return diagnostico;
}

/**
 * Guarda el veredicto en `customs_queries` para que aparezca en
 * `/dashboard/historial` (que ya lee de Supabase). Si falla, no rompemos el
 * flujo del usuario — el veredicto igual se muestra en `/consulta/:id` a
 * partir del store local — pero SÍ lo notificamos con un toast, ya que antes
 * este fallo era completamente silencioso (solo console.error).
 *
 * `ai_verdict` guarda el veredicto del motor (`APROBADO` / `PRECAUCION` /
 * `BLOQUEO`), NO el `nivel` de color — la cola de revisión de agentes, las
 * métricas de admin, los reportes y los triggers de notificación filtran
 * por ese valor.
 */
async function guardarConsultaEnHistorial(
  diagnostico: DiagnosticoEnvio,
  aiVerdict: DecisionEngineResult["final_status"],
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
    ai_verdict: aiVerdict,
    ai_confidence: null,
    // Guardamos el DiagnosticoEnvio completo (no solo la respuesta cruda del
    // motor) para poder reconstruir /consulta/:id y /dashboard/historial
    // leyendo únicamente de Supabase, sin depender del store en memoria.
    raw_response: diagnostico as unknown as Record<string, unknown>,
  });

  if (error) {
    console.error("No se pudo guardar la consulta en customs_queries:", error);
    toast.error(
      "No se pudo guardar en tu historial",
      "Tu resultado sigue disponible en esta pantalla, pero revisá tu conexión e intentá desde /dashboard/historial más tarde."
    );
  }
}