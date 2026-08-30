import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";
import { fetchConsultas } from "@/lib/queryHistoryService";
import type { DiagnosticoEnvio, NivelVeredicto } from "@/lib/types";

const filtros: { label: string; value: NivelVeredicto | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Aprobado", value: "verde" },
  { label: "Requiere Documentación", value: "amarillo" },
  { label: "Retenido", value: "rojo" },
];

export function History() {
  const [consultas, setConsultas] = useState<DiagnosticoEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<NivelVeredicto | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<DiagnosticoEnvio | null>(null);

  useEffect(() => {
    fetchConsultas()
      .then(setConsultas)
      .finally(() => setLoading(false));
  }, []);

  const filtradas = consultas
    .filter((c) => filtro === "todos" || c.nivel === filtro)
    .filter((c) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        c.input.descripcionItem.toLowerCase().includes(q) ||
        c.input.paisDestino.toLowerCase().includes(q)
      );
    });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Historial de consultas</h1>
        <Link to="/consulta/nueva">
          <Button className="whitespace-nowrap">+ Nueva consulta</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ítem o país destino..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filtros.map((f) => (
          <Chip key={f.value} label={f.label} active={filtro === f.value} onClick={() => setFiltro(f.value)} />
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando historial...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">
            {consultas.length === 0 ? "Aún no tienes consultas." : "No hay resultados con ese filtro o búsqueda."}
          </p>
          <Link to="/consulta/nueva" className="text-brand-blue font-medium">
            Hacer una nueva consulta →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSeleccionada(c)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <VerdictBadge nivel={c.nivel} />
                <span className="text-sm text-slate-700 truncate max-w-xs">{c.input.descripcionItem}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                <span>{c.input.paisDestino}</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Vista rápida en modal */}
      <Modal open={!!seleccionada} onClose={() => setSeleccionada(null)}>
        {seleccionada && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <VerdictBadge nivel={seleccionada.nivel} />
              <span className="text-xs text-slate-400">
                {new Date(seleccionada.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">{seleccionada.titulo}</h2>
            <p className="text-sm text-slate-600 mb-4">{seleccionada.resumen}</p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4 text-sm">
              <p className="text-slate-500 mb-1">Ítem consultado</p>
              <p className="text-slate-800 font-medium mb-3">{seleccionada.input.descripcionItem}</p>
              <p className="text-slate-500 mb-1">Destino</p>
              <p className="text-slate-800 font-medium">{seleccionada.input.paisDestino}</p>
            </div>

            <div className="flex gap-3">
              <Link to={`/consulta/${seleccionada.id}`} className="flex-1">
                <Button className="w-full">Ver diagnóstico completo</Button>
              </Link>
              <Button variant="secondary" onClick={() => setSeleccionada(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
