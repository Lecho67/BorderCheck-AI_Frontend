import { performance } from "node:perf_hooks";
import type { ShipmentEvaluationRequest, DecisionEngineResult } from "../request.types";
import { getCacheService, generateShipmentHash } from "./cacheService";
// Ajustar este import a la función/servicio real que hoy ejecuta el motor
// de reglas (por ejemplo tu llamada a Ollama con Structured Outputs).
import { runDecisionEngine } from "./decisionEngine";

const cache = getCacheService();

export interface EvaluationOutcome {
  result: DecisionEngineResult;
  cacheHit: boolean;
  elapsedMs: number;
}

/**
 * Punto único de evaluación: consulta la caché primero y solo llama al
 * motor real si hay un miss (o el TTL expiró). En un hit, responde sin
 * tocar el motor de reglas — normalmente en <5ms con Redis local y
 * <1ms con la implementación en memoria, muy por debajo de los 50ms pedidos.
 */
export async function evaluateShipment(
  request: ShipmentEvaluationRequest
): Promise<EvaluationOutcome> {
  const inicio = performance.now();
  const hash = generateShipmentHash(request);

  const cacheado = await cache.get(hash);
  if (cacheado) {
    return {
      result: cacheado,
      cacheHit: true,
      elapsedMs: Number((performance.now() - inicio).toFixed(2)),
    };
  }

  const result = await runDecisionEngine(request);

  // No cacheamos resultados que quedan marcados para revisión manual: son
  // casos límite que un agente humano puede resolver distinto (override), y
  // no queremos servir una decisión "congelada" mientras el caso sigue vivo.
  if (!result.requires_manual_review) {
    await cache.set(hash, result);
  }

  return {
    result,
    cacheHit: false,
    elapsedMs: Number((performance.now() - inicio).toFixed(2)),
  };
}