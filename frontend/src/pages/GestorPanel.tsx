import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Profile, CustomsQuery } from "@/types/database.types";

export function GestorPanel() {
  const { profile } = useAuth();
  const [clientes, setClientes] = useState<Profile[]>([]);
  const [consultasPorCliente, setConsultasPorCliente] = useState<Record<string, CustomsQuery[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const cargarClientes = async () => {
      const { data: clientesData, error: errClientes } = await supabase
        .from("profiles")
        .select("*")
        .eq("gestor_id", profile.id);

      if (errClientes) {
        console.error("Error al cargar clientes:", errClientes.message);
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
          console.error("Error al cargar consultas:", errConsultas.message);
        } else {
          const agrupadas: Record<string, CustomsQuery[]> = {};
          (consultasData as CustomsQuery[]).forEach((q) => {
            if (!agrupadas[q.user_id]) agrupadas[q.user_id] = [];
            agrupadas[q.user_id].push(q);
          });
          setConsultasPorCliente(agrupadas);
        }
      }
      setLoading(false);
    };

    cargarClientes();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Panel de Asesor</h1>
      <p className="text-gray-600 mb-6">
        Bienvenido, {profile?.full_name || profile?.email}
      </p>

      {clientes.length === 0 ? (
        <div className="border rounded p-4 bg-gray-50 text-sm text-gray-500">
          Aún no tienes clientes asignados.
        </div>
      ) : (
        <div className="space-y-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="border rounded p-4">
              <h2 className="font-semibold mb-2">
                {cliente.full_name || cliente.email}
              </h2>
              {consultasPorCliente[cliente.id]?.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {consultasPorCliente[cliente.id].map((q) => (
                    <li key={q.id} className="flex justify-between border-b py-1">
                      <span>{q.product_description}</span>
                      <span className="font-medium">{q.ai_verdict}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Sin consultas todavía.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}