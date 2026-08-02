import { Camera, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepDetailsProps {
  pesoKg?: number;
  valorDeclaradoUsd?: number;
  cantidadUnidades?: number;
  partidaArancelariaTentativa?: string;
  onChangePeso: (value: number | undefined) => void;
  onChangeValor: (value: number | undefined) => void;
  onChangeCantidad: (value: number | undefined) => void;
  onChangePartida: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepDetails({
  pesoKg,
  valorDeclaradoUsd,
  cantidadUnidades,
  partidaArancelariaTentativa,
  onChangePeso,
  onChangeValor,
  onChangeCantidad,
  onChangePartida,
  onNext,
  onBack,
}: StepDetailsProps) {
  const esValido = !!pesoKg && pesoKg > 0 && valorDeclaradoUsd != null && valorDeclaradoUsd >= 0;

  return (
    <div>
      <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2">Paso 3 de 4</p>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Agrega los detalles del envío</h2>
      <p className="text-sm text-slate-500 mb-6">
        Peso y valor son obligatorios: el motor de reglas los necesita para calcular impuestos y validar restricciones.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="Peso aproximado (kg) *"
          type="number"
          min={0.01}
          step={0.01}
          value={pesoKg ?? ""}
          onChange={(e) => onChangePeso(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="0.5"
        />
        <Input
          label="Valor declarado (USD) *"
          type="number"
          min={0}
          value={valorDeclaradoUsd ?? ""}
          onChange={(e) => onChangeValor(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="50"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="Cantidad de unidades"
          type="number"
          min={1}
          step={1}
          value={cantidadUnidades ?? 1}
          onChange={(e) => onChangeCantidad(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="1"
        />
        <Input
          label="Partida arancelaria tentativa (HS Code) — opcional"
          value={partidaArancelariaTentativa ?? ""}
          onChange={(e) => onChangePartida(e.target.value)}
          placeholder="Ej: 8517.70.00"
        />
      </div>
      <p className="text-xs text-slate-400 -mt-2 mb-4">
        Si no conoces el HS Code, déjalo vacío — la IA propondrá uno tentativo.
      </p>

      <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-400 mb-6 cursor-not-allowed">
        <Camera className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Agregar foto del ítem (opcional)</p>
        <p className="text-xs mt-1 text-slate-300">Preparado para auditoría visual — Fase 2</p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>← Atrás</Button>
        <Button disabled={!esValido} onClick={onNext} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Continuar →
        </Button>
      </div>
    </div>
  );
}
