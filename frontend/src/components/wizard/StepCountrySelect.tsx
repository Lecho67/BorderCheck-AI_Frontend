import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { paisesDisponibles } from "@/lib/mockData";

interface StepCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function StepCountrySelect({ value, onChange, onNext }: StepCountrySelectProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2">Paso 1 de 3</p>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">¿A qué país envías tu paquete?</h2>
      <p className="text-sm text-slate-500 mb-6">Las restricciones aéreas varían según el país de destino.</p>

      <Select options={paisesDisponibles} value={value} onChange={onChange} placeholder="Selecciona un país..." />

      <Button disabled={!value} onClick={onNext} className="mt-6 w-full sm:w-auto">
        Continuar →
      </Button>
    </div>
  );
}
