import { useState } from "react";
import { Link } from "react-router-dom";
import { Chip } from "@/components/ui/Chip";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";
import { useQueryStore } from "@/store/useQueryStore";
import type { NivelVeredicto } from "@/lib/types";

const filtros: { label: string; value: NivelVeredicto | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Verde", value: "verde" },
  { label: "Amarillo", value: "amarillo" },
  { label: "Rojo", value: "rojo" },
];

export function History() {
  const consultas = useQueryStore((s) => s.consultas);
  const [filtro, setFiltro] = useState<NivelVeredicto | "todos">("todos");

  const filtradas = filtro === "todos" ? consultas : consultas.filter((c) => c.nivel === filtro);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Historial de consultas</h1>

      <div className="flex gap-2 mb-6">
        {filtros.map((f) => (
          <Chip key={f.value} label={f.label} active={filtro === f.value} onClick={() => setFiltro(f.value)} />
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">
            {consultas.length === 0 ? "Aún no tienes consultas." : "No hay resultados con ese filtro."}
          </p>
          <Link to="/consulta/nueva" className="text-brand-blue font-medium">
            Hacer una nueva consulta →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((c) => (
            <Link
              key={c.id}
              to={`/consulta/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue transition-colors"
            >
              <div className="flex items-center gap-3">
                <VerdictBadge nivel={c.nivel} />
                <span className="text-sm text-slate-700 truncate max-w-xs">{c.input.descripcionItem}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{c.input.paisDestino}</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
