import { useState } from "react";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import type { NivelVeredicto } from "@/lib/types";

interface DocumentChecklistProps {
  documentos: string[];
  nivel: NivelVeredicto;
}

export function DocumentChecklist({ documentos, nivel }: DocumentChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Documentos requeridos
      </p>

      {documentos.length > 0 ? (
        <div className="space-y-2">
          {documentos.map((doc, i) => (
            <Checkbox key={i} label={doc} checked={!!checked[i]} onChange={() => toggle(i)} />
          ))}
          <Button variant="secondary" className="mt-3 w-full !bg-slate-900 !text-white !border-0 hover:!bg-slate-800">
            Descargar plantillas
          </Button>
        </div>
      ) : nivel === "verde" ? (
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-verdict-green-text">✓</span> Empaque resistente acorde al valor declarado
          </li>
          <li className="flex items-start gap-2">
            <span className="text-verdict-green-text">✓</span> Etiqueta con descripción precisa del contenido
          </li>
        </ul>
      ) : (
        <p className="text-sm text-slate-400">No aplica — el envío no puede procesarse.</p>
      )}
    </div>
  );
}
