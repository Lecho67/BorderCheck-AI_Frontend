import React from 'react';
import { ShipmentEvaluationResponse } from '../types/shipment';

interface ResultViewProps {
  data: ShipmentEvaluationResponse;
}

export  function ResultView({ data }: ResultViewProps) {
  const isApproved = data.verdict.status === 'approved';

  return (
    <div className={`result-banner ${isApproved ? 'success' : 'warning'}`}>
      <h2>{data.verdict.title}</h2>
      <p>{data.verdict.description}</p>

      <section className="legal-justification">
        <h3>Justificación legal (IA)</h3>
        <p>{data.legal_justification.summary}</p>
        <span className="source-tag">Fuente: {data.legal_justification.source}</span>
      </section>

      <section className="required-documents">
        <h3>Documentos requeridos</h3>
        <ul>
          {data.required_documents.map((doc, idx) => (
            <li key={idx}>{doc.fulfilled ? '✓' : '✗'} {doc.label}</li>
          ))}
        </ul>
      </section>

      <section className="tax-breakdown">
        <h3>Desglose de impuestos estimados</h3>
        <div className="row">
          <span>Partida arancelaria tentativa</span>
          <span>{data.tax_breakdown.tariff_heading ?? 'Sin partida tentativa declarada'}</span>
        </div>
        <div className="row">
          <span>Flete estimado</span>
          <span>${data.tax_breakdown.estimated_freight.toFixed(2)}</span>
        </div>
        <div className="row">
          <span>Arancel estimado ({data.tax_breakdown.duty_rate_percentage}%)</span>
          <span>${data.tax_breakdown.estimated_duty.toFixed(2)}</span>
        </div>
        <div className="row total">
          <strong>Total estimado</strong>
          <strong>${data.tax_breakdown.total_estimated.toFixed(2)}</strong>
        </div>
        {data.tax_breakdown.disclaimer && (
          <p className="disclaimer">{data.tax_breakdown.disclaimer}</p>
        )}
      </section>
    </div>
  );
}