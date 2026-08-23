// src/pages/NewQuery.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryStore } from "@/store/useQueryStore";
import { evaluarEnvio } from "@/lib/api";
import type { WizardFormData } from "@/lib/types";
import { ShipmentForm } from "@/components/ShipmentForm";
import { LoadingSkeleton } from "@/components/wizard/LoadingSkeleton";

export function NewQuery() {
  const navigate = useNavigate();
  const addConsulta = useQueryStore((s) => s.addConsulta);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: WizardFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const diagnostico = await evaluarEnvio(data);
      addConsulta(diagnostico);
      navigate(`/consulta/${diagnostico.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar el análisis. Inténtalo de nuevo."
      );
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>⚠ Error:</strong> {error}
        </div>
      )}

      <ShipmentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}