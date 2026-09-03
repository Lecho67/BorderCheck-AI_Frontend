import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchColaDeRevision, type CasoEnCola } from "@/lib/agentService";
import { CasoRevisionCard } from "@/components/agent/CasoRevisionCard";
import type { DiagnosticoEnvio } from "@/lib/types";
import { badgeVerdictoClasses } from "@/lib/verdictBadge";

function paisDeCaso(caso: CasoEnCola): string {
  const input = (caso.raw_response as Partial<DiagnosticoEnvio> | null)?.input;
  return input?.paisDestino || "—";
}



function estadoDeCaso(caso: CasoEnCola, currentUserId?: string): { label: string; classes: string } {
  if (!caso.assigned_agent_id) return { label: "Sin asignar", classes: "bg-slate-100 text-slate-600" };
  if (caso.assigned_agent_id === currentUserId)
    return { label: "Asignado a mí", classes: "bg-brand-blue/10 text-brand-blue" };
  return { label: "Asignado a otro agente", classes: "bg-slate-100 text-slate-500" };
}

export function AgentPanel() {
  const { user } = useAuth();
  const [casos, setCasos] = useState<CasoEnCola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroPais, setFiltroPais] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [casoSeleccionadoId, setCasoSeleccionadoId] = useState<string | null>(null);

  const cargarCola = async () => {
    setLoading(true);
    try {
      const data = await fetchColaDeRevision();
      setCasos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la cola");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCola();
  }, []);

  const paisesDisponibles = useMemo(() => {
    const set = new Set(casos.map(paisDeCaso).filter((p) => p !== "—"));
    return Array.from(set).sort();
  }, [casos]);

  const casosFiltrados = useMemo(() => {
    return casos.filter((caso) => {
      if (filtroPais !== "todos" && paisDeCaso(caso) !== filtroPais) return false;
      const fechaCaso = caso.created_at.slice(0, 10);
      if (fechaDesde && fechaCaso < fechaDesde) return false;
      if (fechaHasta && fechaCaso > fechaHasta) return false;
      return true;
    });
  }, [casos, filtroPais, fechaDesde, fechaHasta]);

  const casoSeleccionado = casos.find((c) => c.id === casoSeleccionadoId) ?? null;

  const handleResuelto = (id: string) => {
    setCasos((prev) => prev.filter((c) => c.id !== id));
    setCasoSeleccionadoId(null);
  };

  const limpiarFiltros = () => {
    setFiltroPais("todos");
    setFechaDesde("");
    setFechaHasta("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Cola de Revisión</h1>
      <p className="text-gray-600 mb-6">
        {casosFiltrados.length} de {casos.length} caso{casos.length !== 1 && "s"} pendiente
        {casos.length !== 1 && "s"} de auditoría
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4 mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">País destino</label>
          <select
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="todos">Todos</option>
            {paisesDisponibles.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        {(filtroPais !== "todos" || fechaDesde || fechaHasta) && (
          <button onClick={limpiarFiltros} className="text-sm text-brand-blue hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      {casosFiltrados.length === 0 ? (
        <div className="border rounded p-4 bg-gray-50 text-sm text-gray-500">
          {casos.length === 0
            ? "No hay casos pendientes en este momento."
            : "Ningún caso coincide con los filtros aplicados."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">País</th>
                <th className="px-4 py-3 font-medium">Veredicto IA</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {casosFiltrados.map((caso) => {
                const estado = estadoDeCaso(caso, user?.id);
                return (
                  <tr key={caso.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {caso.cliente?.full_name || caso.cliente?.email || caso.user_id}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {caso.product_description}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{paisDeCaso(caso)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${badgeVerdictoClasses(caso.ai_verdict)}`}
                      >
                        {caso.ai_verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(caso.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${estado.classes}`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setCasoSeleccionadoId(caso.id)}
                        className="text-sm font-medium text-brand-blue hover:underline"
                      >
                        Auditar caso
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {casoSeleccionado && (
        <CasoRevisionCard
          caso={casoSeleccionado}
          currentUserId={user?.id}
          onClose={() => setCasoSeleccionadoId(null)}
          onResuelto={() => handleResuelto(casoSeleccionado.id)}
        />
      )}
    </div>
  );
}