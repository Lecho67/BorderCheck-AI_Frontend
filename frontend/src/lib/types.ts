export type NivelVeredicto = "verde" | "amarillo" | "rojo";

export interface DesgloseImpuestos {
  flete: number;
  arancel: number;
  total: number;
  tasaArancelAplicada: number;
}

export interface DiagnosticoEnvio {
  id: string;
  nivel: NivelVeredicto;
  titulo: string;
  resumen: string;
  justificacion: string;
  fuenteNormativa: string;
  documentosRequeridos: string[];
  accionesSugeridas: string[];
  partidaArancelariaTentativa: string;
  desgloseImpuestos: DesgloseImpuestos | null;
  createdAt: string;
  input: {
    paisDestino: string;
    descripcionItem: string;
    pesoKg?: number;
    valorDeclaradoUsd?: number;
    partidaArancelariaTentativa?: string;
  };
}

// ----------------------------------------------------------------------------
// Declaraciones especiales — solo se llenan si el usuario marca que aplican.
// Estas formas se mapean 1:1 a los sub-objetos de hazmat/organic/medical que
// espera el motor de reglas (ver src/lib/shipmentMapping.ts).
// ----------------------------------------------------------------------------

export type TipoBateriaLitio =
  | "lithium_ion"
  | "lithium_metal"
  | "installed_in_equipment"
  | "packed_with_equipment";

export interface DeclaracionBateria {
  tipo?: TipoBateriaLitio;
  wattHora?: number;
  gramosLitio?: number;
  cantidad?: number;
}

export type CategoriaLiquido =
  | "cosmetic"
  | "alcoholic_beverage"
  | "perfume"
  | "cleaning_product"
  | "medicinal"
  | "food_liquid"
  | "other";

export interface DeclaracionLiquido {
  categoria?: CategoriaLiquido;
  volumenTotalMl?: number;
  esInflamable?: boolean;
}

export type OtraMercanciaPeligrosa =
  | "compressed_gas"
  | "corrosive"
  | "magnetic_material"
  | "flammable_solid"
  | "oxidizer"
  | "radioactive"
  | "explosive"
  | "other";

export type TipoProductoOrganico =
  | "fresh_food"
  | "processed_food"
  | "untreated_wood"
  | "treated_wood"
  | "live_plant"
  | "seeds"
  | "animal_origin_product"
  | "vegetal_origin_product"
  | "other";

export interface DeclaracionOrganica {
  tipo?: TipoProductoOrganico;
  esPerecedero?: boolean;
  tieneCertificadoFitosanitario?: boolean;
}

export type TipoRegulacionMedica =
  | "otc_medication"
  | "prescription_medication"
  | "cosmetic"
  | "medical_device"
  | "controlled_substance"
  | "supplement";

export interface DeclaracionMedica {
  tipo?: TipoRegulacionMedica;
  esSustanciaControlada?: boolean;
}

export interface DeclaracionesEspeciales {
  contieneBateriaLitio: boolean;
  bateria?: DeclaracionBateria;

  contieneLiquidos: boolean;
  liquido?: DeclaracionLiquido;

  otrasMercanciasPeligrosas: OtraMercanciaPeligrosa[];

  esOrganicoOBiologico: boolean;
  organico?: DeclaracionOrganica;

  esMedicamentoRegulado: boolean;
  medico?: DeclaracionMedica;
}

export function declaracionesEspecialesVacias(): DeclaracionesEspeciales {
  return {
    contieneBateriaLitio: false,
    contieneLiquidos: false,
    otrasMercanciasPeligrosas: [],
    esOrganicoOBiologico: false,
    esMedicamentoRegulado: false,
  };
}

export type TransportType = "air" | "sea" | "land" | "postal_courier";

export type ShipmentModality =
  | "carry_on_baggage"
  | "checked_baggage"
  | "commercial_shipment"
  | "personal_shipment_gift";

export interface WizardFormData {
  // Logística — antes fija por el modelo de casillero, ahora editable
  paisOrigen: string;
  transportType: TransportType | "";
  shipmentModality: ShipmentModality | "";

  // Paso 1 — Destino
  paisDestino: string;

  // Paso 2 — Categoría y descripción
  categoria?: string;
  descripcionItem: string;

  // Paso 3 — Detalles (peso y valor son obligatorios para el motor real)
  pesoKg?: number;
  valorDeclaradoUsd?: number;
  cantidadUnidades?: number;
  partidaArancelariaTentativa?: string;

  // Paso 4 — Declaraciones especiales (opcional, solo si aplica)
  declaracionesEspeciales?: DeclaracionesEspeciales;
}