import { createHash } from "node:crypto";
import Redis from "ioredis";
import type { ShipmentEvaluationRequest, DecisionEngineResult } from "../request.types";

const NAMESPACE = "bordercheck:eval:";
const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hora

export interface CacheService {
  get(hash: string): Promise<DecisionEngineResult | null>;
  set(hash: string, result: DecisionEngineResult, ttlSeconds?: number): Promise<void>;
  invalidate(hash: string): Promise<void>;
}

// ----------------------------------------------------------------------------
// Hash determinista
// ----------------------------------------------------------------------------

/**
 * Ordena recursivamente las claves de un objeto para que dos payloads
 * semánticamente idénticos (pero con distinto orden de propiedades en el
 * JSON de entrada) produzcan el mismo hash.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Genera una clave determinista a partir de los campos que realmente
 * afectan el veredicto del motor de reglas.
 *
 * EXCLUYE deliberadamente: `id`, `metadata.created_at/updated_at`,
 * `metadata.user_id`, `metadata.locale/channel` — dos envíos con los mismos
 * datos de producto pero distinto usuario/canal deben compartir resultado.
 *
 * INCLUYE, además de categoría/país/valor/peso (pedido explícito), los
 * bloques hazmat/organic/medical y el hs_code: dos ítems con la misma
 * categoría, peso y valor pero distinta declaración de batería de litio o
 * líquidos NO pueden compartir caché, porque eso cambia el veredicto real.
 * También incluye `rules_engine_version`, así un cambio de versión del motor
 * invalida la caché automáticamente sin lógica extra.
 */
export function generateShipmentHash(request: ShipmentEvaluationRequest): string {
  const camposRelevantes = {
    category: request.product_classification.category,
    hs_code: request.product_classification.hs_code ?? null,
    hazmat: request.product_classification.has_hazmat_content
      ? request.product_classification.hazmat_attributes ?? null
      : null,
    organic: request.product_classification.organic_phytosanitary ?? null,
    medical: request.product_classification.medical_regulation ?? null,
    origin_country: request.logistics.origin_country,
    destination_country: request.logistics.destination_country,
    transport_type: request.logistics.transport_type,
    shipment_modality: request.logistics.shipment_modality,
    declared_value: request.financial_dimensional.declared_value,
    currency: request.financial_dimensional.currency,
    gross_weight: request.financial_dimensional.gross_weight,
    weight_unit: request.financial_dimensional.weight_unit,
    unit_quantity: request.financial_dimensional.unit_quantity,
    rules_engine_version: request.metadata.rules_engine_version,
  };

  const canonical = JSON.stringify(canonicalize(camposRelevantes));
  const digest = createHash("sha256").update(canonical).digest("hex");
  return `${NAMESPACE}${digest}`;
}

// ----------------------------------------------------------------------------
// Implementación en memoria (Map) — fallback sin infraestructura extra.
// No se comparte entre instancias/procesos: en producción con más de un
// worker, preferir Redis para que todas las instancias compartan hits.
// ----------------------------------------------------------------------------

interface EntradaCache {
  value: DecisionEngineResult;
  expiresAt: number;
}

export class InMemoryCacheService implements CacheService {
  private store = new Map<string, EntradaCache>();

  constructor(limpiezaIntervaloMs = 5 * 60 * 1000) {
    setInterval(() => this.limpiarExpirados(), limpiezaIntervaloMs).unref();
  }

  async get(hash: string): Promise<DecisionEngineResult | null> {
    const entrada = this.store.get(hash);
    if (!entrada) return null;
    if (Date.now() > entrada.expiresAt) {
      this.store.delete(hash);
      return null;
    }
    return entrada.value;
  }

  async set(
    hash: string,
    result: DecisionEngineResult,
    ttlSeconds = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    this.store.set(hash, { value: result, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async invalidate(hash: string): Promise<void> {
    this.store.delete(hash);
  }

  private limpiarExpirados() {
    const ahora = Date.now();
    for (const [key, entrada] of this.store.entries()) {
      if (ahora > entrada.expiresAt) this.store.delete(key);
    }
  }
}

// ----------------------------------------------------------------------------
// Implementación Redis
// ----------------------------------------------------------------------------

export class RedisCacheService implements CacheService {
  constructor(private redis: Redis) {}

  async get(hash: string): Promise<DecisionEngineResult | null> {
    const raw = await this.redis.get(hash);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DecisionEngineResult;
    } catch {
      // Valor corrupto: lo tratamos como miss y lo limpiamos.
      await this.redis.del(hash);
      return null;
    }
  }

  async set(
    hash: string,
    result: DecisionEngineResult,
    ttlSeconds = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    await this.redis.set(hash, JSON.stringify(result), "EX", ttlSeconds);
  }

  async invalidate(hash: string): Promise<void> {
    await this.redis.del(hash);
  }
}

// ----------------------------------------------------------------------------
// Factory: usa Redis si REDIS_URL está definido, si no cae a memoria.
// ----------------------------------------------------------------------------

let instancia: CacheService | null = null;

export function getCacheService(): CacheService {
  if (instancia) return instancia;

  if (process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL);
    client.on("error", (err) => console.error("[cacheService] Error de Redis:", err.message));
    instancia = new RedisCacheService(client);
    console.info("[cacheService] Backend de caché: Redis.");
  } else {
    instancia = new InMemoryCacheService();
    console.info(
      "[cacheService] REDIS_URL no configurado; usando caché en memoria (no compartida entre instancias)."
    );
  }

  return instancia;
}