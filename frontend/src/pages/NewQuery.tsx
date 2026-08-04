// src/pages/NewQuery.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryStore } from "@/store/useQueryStore";
import { evaluarEnvio } from "@/lib/api";
import { declaracionesEspecialesVacias } from "@/lib/types";
import { StepCountrySelect } from "@/components/wizard/StepCountrySelect";
import { StepItemDescription } from "@/components/wizard/StepItemDescription";
import { StepDetails } from "@/components/wizard/StepDetails";
import { StepSpecialDeclarations } from "@/components/wizard/StepSpecialDeclarations";
import { LoadingSkeleton } from "@/components/wizard/LoadingSkeleton";

export function NewQuery() {
  const navigate = useNavigate();
  const {
    wizardStep,
    wizardData,
    setWizardStep,
    updateWizardData,
    resetWizard,
    addConsulta,
  } = useQueryStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const declaraciones = wizardData.declaracionesEspeciales ?? declaracionesEspecialesVacias();

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const diagnostico = await evaluarEnvio({
        paisDestino: wizardData.paisDestino ?? "",
        categoria: wizardData.categoria,
        descripcionItem: wizardData.descripcionItem ?? "",
        pesoKg: wizardData.pesoKg,
        valorDeclaradoUsd: wizardData.valorDeclaradoUsd,
        cantidadUnidades: wizardData.cantidadUnidades,
        partidaArancelariaTentativa: wizardData.partidaArancelariaTentativa,
        declaracionesEspeciales: declaraciones,
      });

      addConsulta(diagnostico);
      resetWizard();
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

      {wizardStep === 0 && (
        <StepCountrySelect
          value={wizardData.paisDestino ?? ""}
          onChange={(value) => updateWizardData({ paisDestino: value })}
          onNext={() => setWizardStep(1)}
        />
      )}

      {wizardStep === 1 && (
        <StepItemDescription
          value={wizardData.descripcionItem ?? ""}
          onChange={(value) => updateWizardData({ descripcionItem: value })}
          categoria={wizardData.categoria ?? ""}
          onChangeCategoria={(categoria) => updateWizardData({ categoria })}
          onNext={() => setWizardStep(2)}
          onBack={() => setWizardStep(0)}
        />
      )}

      {wizardStep === 2 && (
        <StepDetails
          pesoKg={wizardData.pesoKg}
          valorDeclaradoUsd={wizardData.valorDeclaradoUsd}
          cantidadUnidades={wizardData.cantidadUnidades}
          partidaArancelariaTentativa={wizardData.partidaArancelariaTentativa}
          onChangePeso={(pesoKg) => updateWizardData({ pesoKg })}
          onChangeValor={(valorDeclaradoUsd) => updateWizardData({ valorDeclaradoUsd })}
          onChangeCantidad={(cantidadUnidades) => updateWizardData({ cantidadUnidades })}
          onChangePartida={(partidaArancelariaTentativa) =>
            updateWizardData({ partidaArancelariaTentativa })
          }
          onNext={() => setWizardStep(3)}
          onBack={() => setWizardStep(1)}
        />
      )}

      {wizardStep === 3 && (
        <StepSpecialDeclarations
          value={declaraciones}
          onChange={(declaracionesEspeciales) => updateWizardData({ declaracionesEspeciales })}
          onSubmit={handleSubmit}
          onBack={() => setWizardStep(2)}
        />
      )}
    </div>
  );
}