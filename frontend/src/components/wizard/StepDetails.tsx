import { Camera, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StepDetailsProps {
  pesoKg?: number;
  valorDeclaradoUsd?: number;
  partidaArancelariaTentativa?: string;
  onChangePeso: (value: number | undefined) => void;
  onChangeValor: (value: number | undefined) => void;
  onChangePartida: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function StepDetails({
  pesoKg,
  valorDeclaradoUsd,
  partidaArancelariaTentativa,
  
  onChangePeso,
  onChangeValor,
  onChangePartida,
  onSubmit,
  onBack,
}: StepDetailsProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2">Paso 3 de 3 · Recomendado</p>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Agrega detalles para mayor precisión</h2>
      <p className="text-sm text-slate-500 mb-6">Este paso es opcional, pero mejora la exactitud del diagnóstico.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Input
          label="Peso aproximado (kg)"
          type="number"
          value={pesoKg ?? ""}
          onChange={(e) => onChangePeso(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="0.5"
        />
        <Input
          label="Valor declarado (USD)"
          type="number"
          value={valorDeclaradoUsd ?? ""}
          onChange={(e) => onChangeValor(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="50"
        />
      </div>

      <div className="mb-4">
        <Input
          label="Partida arancelaria tentativa (HS Code) — opcional"
          value={partidaArancelariaTentativa ?? ""}
          onChange={(e) => onChangePartida(e.target.value)}
          placeholder="Ej: 8517.70.00"
        />
        <p className="text-xs text-slate-400 mt-1">
          Si no la conoces, la IA propondrá una tentativa según la descripción del ítem.
        </p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-400 mb-6 cursor-not-allowed">
        <Camera className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Agregar foto del ítem (opcional)</p>
        <p className="text-xs mt-1 text-slate-300">Preparado para auditoría visual — Fase 2</p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>← Atrás</Button>
        <Button onClick={onSubmit} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Verificar envío
        </Button>
      </div>
    </div>
  );
}