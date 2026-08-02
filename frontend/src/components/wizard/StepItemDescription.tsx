import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { chipsSugeridos } from "@/lib/mockData";

interface StepItemDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  categoria: string;
  onChangeCategoria: (categoria: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepItemDescription({
  value,
  onChange,
  categoria,
  onChangeCategoria,
  onNext,
  onBack,
}: StepItemDescriptionProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2">Paso 2 de 4</p>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Describe qué estás enviando</h2>
      <p className="text-sm text-slate-500 mb-6">
        Sé específico: marca, cantidad y tipo de producto ayudan a la precisión del análisis.
      </p>

      <Textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Perfume Chanel 100ml, 2 unidades..."
      />

      <p className="text-xs font-medium text-slate-500 mt-4 mb-2">
        Categoría del producto <span className="text-red-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {chipsSugeridos.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            active={categoria === chip}
            onClick={() => onChangeCategoria(chip)}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>← Atrás</Button>
        <Button disabled={!value.trim() || !categoria} onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  );
}
