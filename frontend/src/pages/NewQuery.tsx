import React, { useState } from 'react';
import { evaluateShipment, ShipmentServiceError } from '../services/shipmentService';
import { ShipmentFormData, ShipmentEvaluationResponse } from '../types/shipment';
import { ResultView } from './ResultView';

export function NewQuery() {
  const [formData, setFormData] = useState<ShipmentFormData>({
    category: '',
    subcategory: '',
    originCountry: '',
    destinationCountry: '',
    transportType: 'air',
    shipmentModality: 'commercial_shipment',
    declaredValue: 0,
    currency: 'USD',
    grossWeight: 0,
    weightUnit: 'kg',
    unitQuantity: 1,
    hsCode: '',
    hasHazmat: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [result, setResult] = useState<ShipmentEvaluationResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setConnectionError(null);
    setResult(null);

    try {
      const data = await evaluateShipment(formData);
      setResult(data);
    } catch (err) {
      setConnectionError(
        err instanceof ShipmentServiceError
          ? err.message
          : 'Ocurrió un error inesperado al evaluar el envío.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* ...inputs existentes de StepDetails.tsx conectados a formData/setFormData... */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Evaluando...' : 'Evaluar envío'}
        </button>
      </form>

      {isLoading && (
        <div className="loading-skeleton" role="status" aria-live="polite">
          <p>Analizando normativa y calculando impuestos...</p>
        </div>
      )}

      {connectionError && (
        <div className="error-banner" role="alert">
          <strong>⚠ Error de conexión:</strong> {connectionError}
        </div>
      )}

      {result && !isLoading && <ResultView data={result} />}
    </div>
  );
}