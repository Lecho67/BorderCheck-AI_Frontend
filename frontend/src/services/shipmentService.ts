import {
  ShipmentFormData,
  ShipmentPayload,
  ShipmentEvaluationResponse,
} from '../types/shipment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const RULES_ENGINE_VERSION = '1.0.0';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Sanitizadores explícitos — nunca dejan pasar undefined/NaN/strings al backend
function toSafeNumber(val: unknown, fallback = 0): number {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInt(val: unknown, fallback = 1): number {
  const n = typeof val === 'string' ? parseInt(val, 10) : Math.trunc(Number(val));
  return Number.isFinite(n) ? n : fallback;
}

function toSafeBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return Boolean(val);
}

function toSafeString(val: unknown, fallback = ''): string {
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  return fallback;
}

export function mapFormDataToPayload(formData: ShipmentFormData): ShipmentPayload {
  const now = new Date().toISOString(); // ISO 8601 exacto, ej: 2026-08-02T10:00:00.000Z

  return {
    id: generateUUID(),
    metadata: {
      created_at: now,
      updated_at: now,
      status: 'pending_evaluation',
      rules_engine_version: RULES_ENGINE_VERSION,
    },
    logistics: {
      origin_country: toSafeString(formData.originCountry),
      destination_country: toSafeString(formData.destinationCountry),
      transport_type: toSafeString(formData.transportType, 'air'),
      shipment_modality: toSafeString(formData.shipmentModality, 'commercial_shipment'),
    },
    financial_dimensional: {
      declared_value: toSafeNumber(formData.declaredValue, 0),
      currency: toSafeString(formData.currency, 'USD'),
      gross_weight: toSafeNumber(formData.grossWeight, 0),
      weight_unit: toSafeString(formData.weightUnit, 'kg'),
      unit_quantity: toSafeInt(formData.unitQuantity, 1),
    },
    product_classification: {
      category: toSafeString(formData.category),
      subcategory: toSafeString(formData.subcategory), // '' si viene vacío, nunca undefined
      hs_code: toSafeString(formData.hsCode),           // '' si viene vacío, nunca undefined
      has_hazmat_content: toSafeBoolean(formData.hasHazmat), // booleano explícito, nunca string
    },
  };
}

export class ShipmentServiceError extends Error {
  constructor(message: string, public isConnectionError: boolean = false) {
    super(message);
    this.name = 'ShipmentServiceError';
  }
}

export async function evaluateShipment(
  formData: ShipmentFormData
): Promise<ShipmentEvaluationResponse> {
  const payload = mapFormDataToPayload(formData);

  // Depuración: inspeccionar el payload exacto antes de enviarlo
  console.log('Payload enviado:', JSON.stringify(payload, null, 2));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/shipments/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ShipmentServiceError(
      'No se pudo conectar con el motor de evaluación (Backend). Asegúrate de que el servidor en localhost:3000 esté encendido.',
      true
    );
  }

  if (!response.ok) {
    let errorResponse: unknown = null;
    let message = `Error del servidor (status ${response.status}).`;
    try {
      errorResponse = await response.json();
      // @ts-expect-error -- forma de error no tipada, viene del backend
      message = errorResponse?.message ?? message;
    } catch {
      /* respuesta sin body JSON válido */
    }
    // Depuración: ver el mensaje exacto del DTO/validador del backend
    console.error('Respuesta del servidor:', errorResponse);
    throw new ShipmentServiceError(
      Array.isArray(message) ? message.join(', ') : String(message),
      false
    );
  }

  return response.json() as Promise<ShipmentEvaluationResponse>;
}