import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepCountrySelect } from "@/components/wizard/StepCountrySelect";
import { StepItemDescription } from "@/components/wizard/StepItemDescription";
import { StepDetails } from "@/components/wizard/StepDetails";
import { LoadingSkeleton } from "@/components/wizard/LoadingSkeleton";
import { useQueryStore } from "@/store/useQueryStore";
import { evaluarEnvio } from "@/lib/api";

const STEPS = ["Destino", "Descripción", "Detalles"];

export function NewQuery() {
  const navigate = useNavigate();
  const { wizardStep, wizardData, setWizardStep, updateWizardData, resetWizard, addConsulta } = useQueryStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const diagnostico = await evaluarEnvio({
        paisDestino: wizardData.paisDestino ?? "",
        descripcionItem: wizardData.descripcionItem ?? "",
        pesoKg: wizardData.pesoKg,
        valorDeclaradoUsd: wizardData.valorDeclaradoUsd,
      });
      addConsulta(diagnostico);
      resetWizard();
      navigate(`/consulta/${diagnostico.id}`);
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
          onNext={() => setWizardStep(2)}
          onBack={() => setWizardStep(0)}
        />
      )}

      {wizardStep === 2 && (
        <StepDetails
  pesoKg={wizardData.pesoKg}
  valorDeclaradoUsd={wizardData.valorDeclaradoUsd}
  partidaArancelariaTentativa={wizardData.partidaArancelariaTentativa}
  onChangePeso={(v) => updateWizardData({ pesoKg: v })}
  onChangeValor={(v) => updateWizardData({ valorDeclaradoUsd: v })}
  onChangePartida={(v) => updateWizardData({ partidaArancelariaTentativa: v })}
  onSubmit={handleSubmit}
  onBack={() => setWizardStep(1)}
/>
      )}
    </main>
  );
}
