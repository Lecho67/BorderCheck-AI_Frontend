export interface ShipmentPayload {
  id: string;
  metadata: {
    created_at: string;
    updated_at: string;
    status: string;
    rules_engine_version: string;
  };
  logistics: {
    origin_country: string;
    destination_country: string;
    transport_type: string;
    shipment_modality: string;
  };
  financial_dimensional: {
    declared_value: number;
    currency: string;
    gross_weight: number;
    weight_unit: string;
    unit_quantity: number;
  };
  product_classification: {
    category: string;
    subcategory: string;
    hs_code: string;
    has_hazmat_content: boolean;
  };
}

export interface ShipmentFormData {
  category: string;
  subcategory: string;
  originCountry: string;
  destinationCountry: string;
  transportType: 'air' | 'sea' | 'land';
  shipmentModality: 'commercial_shipment' | 'personal_shipment' | 'sample';
  declaredValue: number;
  currency: string;
  grossWeight: number;
  weightUnit: 'kg' | 'lb';
  unitQuantity: number;
  hsCode: string;
  hasHazmat: boolean;
}

// AJUSTAR según lo que realmente devuelva el backend
export interface ShipmentEvaluationResponse {
  id: string;
  verdict: {
    status: 'approved' | 'rejected' | 'review_required' | string;
    title: string;
    description: string;
    tags?: string[];
  };
  legal_justification: {
    summary: string;
    source: string;
  };
  required_documents: Array<{
    label: string;
    fulfilled: boolean;
  }>;
  tax_breakdown: {
    tariff_heading?: string;
    estimated_freight: number;
    estimated_duty: number;
    duty_rate_percentage: number;
    total_estimated: number;
    currency: string;
    disclaimer?: string;
  };
}