import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";
import { Button } from "@/components/ui/Button";
import { fetchConsultas } from "@/lib/queryHistoryService";
import { useAuth } from "@/hooks/useAuth";
import type { DiagnosticoEnvio } from "@/lib/types";

export function Dashboard() {
  const { user, profile } = useAuth();
  const [consultas, setConsultas] = useState<DiagnosticoEnvio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultas()
      .then(setConsultas)
      .finally(() => setLoading(false));
  }, []);

  const recientes = consultas.slice(0, 5);

  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "usuario";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Hola, {displayName}</h1>
      <p className="text-slate-500 mb-8">
        {loading ? "Cargando tus consultas..." : `Tienes ${consultas.length} consultas registradas.`}
      </p>

      <div className="rounded-xl border-2 border-brand-blue bg-brand-blue/5 p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">¿Nuevo envío?</p>
          <p className="text-sm text-slate-600">Obtén tu diagnóstico en menos de 1 minuto.</p>
        </div>
        <Link to="/consulta/nueva">
          <Button>Nueva consulta</Button>
        </Link>
      </div>

      <h2 className="font-semibold text-slate-900 mb-3">Consultas recientes</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : recientes.length === 0 ? (
        <p className="text-sm text-slate-400">Aún no tienes consultas.</p>
      ) : (
        <div className="space-y-2">
          {recientes.map((c) => (
            <Link
              key={c.id}
              to={`/consulta/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue transition-colors"
            >
              <div className="flex items-center gap-3">
                <VerdictBadge nivel={c.nivel} />
                <span className="text-sm text-slate-700 truncate max-w-xs">{c.input.descripcionItem}</span>
              </div>
              <span className="text-xs text-slate-400">{c.input.paisDestino}</span>
            </Link>
          ))}
        </div>
      )}

      <Link to="/dashboard/historial" className="inline-block mt-6 text-sm text-brand-blue font-medium">
        Ver todo el historial →
      </Link>
    </main>
  );
}