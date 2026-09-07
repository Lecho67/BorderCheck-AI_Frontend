import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { badgeVerdictoClasses } from "@/lib/verdictBadge";
import type { Profile, CustomsQuery } from "@/types/database.types";

export function GestorPanel() {
  const { profile } = useAuth();
  const [clientes, setClientes] = useState<Profile[]>([]);
  const [consultasPorCliente, setConsultasPorCliente] = useState<Record<string, CustomsQuery[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    const cargar = async () => {
      const { data: clientesData, error: errClientes } = await supabase
        .from("profiles")
        .select("*")
        .eq("gestor_id", profile.id);

      if (errClientes) {
        setError(errClientes.message);
        setLoading(false);
        return;
      }
      setClientes(clientesData as Profile[]);

      if (clientesData && clientesData.length > 0) {
        const ids = clientesData.map((c) => c.id);
        const { data: consultasData, error: errConsultas } = await supabase
          .from("customs_queries")
          .select("*")
          .in("user_id", ids)
          .order("created_at", { ascending: false });

        if (errConsultas) {
          setError(errConsultas.message);
        } else {
          const agrupadas: Record<string, CustomsQuery[]> = {};
          (consultasData as CustomsQuery[]).forEach((q) => {
            (agrupadas[q.user_id] ??= []).push(q);
          });
          setConsultasPorCliente(agrupadas);
        }
      }
      setLoading(false);
    };

    cargar();
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mis clientes</h1>
      <p className="text-sm text-slate-500 mb-6">
        {clientes.length} cliente{clientes.length !== 1 && "s"} en tu cartera.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Todavía no tenés clientes asignados.
        </div>
      ) : (
        <div className="space-y-4">
          {clientes.map((cliente) => {
            const consultas = consultasPorCliente[cliente.id] ?? [];
            return (
              <section key={cliente.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900">{cliente.full_name || cliente.email}</h2>
                {cliente.full_name && <p className="text-xs text-slate-400">{cliente.email}</p>}

                {consultas.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">Sin consultas todavía.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {consultas.map((q) => (
                      <li key={q.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0 truncate text-slate-700">{q.product_description}</span>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${badgeVerdictoClasses(q.ai_verdict)}`}
                        >
                          {q.ai_verdict}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
