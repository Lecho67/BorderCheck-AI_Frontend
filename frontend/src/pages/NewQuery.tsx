import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepCountrySelect } from "@/components/wizard/StepCountrySelect";
import { StepItemDescription } from "@/components/wizard/StepItemDescription";
import { StepDetails } from "@/components/wizard/StepDetails";
import { StepSpecialDeclarations } from "@/components/wizard/StepSpecialDeclarations";
import { LoadingSkeleton } from "@/components/wizard/LoadingSkeleton";
import { useQueryStore } from "@/store/useQueryStore";
import { evaluarEnvio } from "@/lib/api";
import { declaracionesEspecialesVacias } from "@/lib/types";

const STEPS = ["Destino", "Descripción", "Detalles", "Declaraciones"];

export function NewQuery() {
  const navigate = useNavigate();
  const { wizardStep, wizardData, setWizardStep, updateWizardData, resetWizard, addConsulta } = useQueryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const declaraciones = wizardData.declaracionesEspeciales ?? declaracionesEspecialesVacias();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const diagnostico = await evaluarEnvio({
        paisDestino: wizardData.paisDestino ?? "",
        categoria: wizardData.categoria,
        descripcionItem: wizardData.descripcionItem ?? "",
        pesoKg: wizardData.pesoKg,
        valorDeclaradoUsd: wizardData.valorDeclaradoUsd,
        cantidadUnidades: wizardData.cantidadUnidades ?? 1,
        partidaArancelariaTentativa: wizardData.partidaArancelariaTentativa,
        declaracionesEspeciales: declaraciones,
      });
      addConsulta(diagnostico);
      resetWizard();
      navigate(`/consulta/${diagnostico.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el análisis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <LoadingSkeleton />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <ProgressBar step={wizardStep} steps={STEPS} />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {wizardStep === 0 && (
        <StepCountrySelect
          value={wizardData.paisDestino ?? ""}
          onChange={(v) => updateWizardData({ paisDestino: v })}
          onNext={() => setWizardStep(1)}
        />
      )}

      {wizardStep === 1 && (
        <StepItemDescription
          value={wizardData.descripcionItem ?? ""}
          onChange={(v) => updateWizardData({ descripcionItem: v })}
          categoria={wizardData.categoria ?? ""}
          onChangeCategoria={(v) => updateWizardData({ categoria: v })}
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
          onChangePeso={(v) => updateWizardData({ pesoKg: v })}
          onChangeValor={(v) => updateWizardData({ valorDeclaradoUsd: v })}
          onChangeCantidad={(v) => updateWizardData({ cantidadUnidades: v })}
          onChangePartida={(v) => updateWizardData({ partidaArancelariaTentativa: v })}
          onNext={() => setWizardStep(3)}
          onBack={() => setWizardStep(1)}
        />
      )}

      {wizardStep === 3 && (
        <StepSpecialDeclarations
          value={declaraciones}
          onChange={(v) => updateWizardData({ declaracionesEspeciales: v })}
          onSubmit={handleSubmit}
          onBack={() => setWizardStep(2)}
        />
      )}
    </main>
  );
}
