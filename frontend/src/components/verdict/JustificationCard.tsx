import { BookOpen } from "lucide-react";

interface JustificationCardProps {
  justificacion: string;
  fuenteNormativa: string;
}

export function JustificationCard({ justificacion, fuenteNormativa }: JustificationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> Justificación legal (IA)
      </p>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{justificacion}</p>
      <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-ai-accent text-xs font-medium">
        Fuente: {fuenteNormativa}
      </span>
    </div>
  );
}
