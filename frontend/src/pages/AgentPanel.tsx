import { useEffect, useState } from "react";
import { fetchColaDeRevision, type CasoEnCola } from "@/lib/agentService";
import { CasoRevisionCard } from "@/components/agent/CasoRevisionCard";

export function AgentPanel() {
  const [casos, setCasos] = useState<CasoEnCola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleResuelto = (id: string) => {
    setCasos((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Cola de Revisión</h1>
      <p className="text-gray-600 mb-6">
        {casos.length} caso{casos.length !== 1 && "s"} pendiente{casos.length !== 1 && "s"} de auditoría
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {casos.length === 0 ? (
        <div className="border rounded p-4 bg-gray-50 text-sm text-gray-500">
          No hay casos pendientes en este momento.
        </div>
      ) : (
        <div className="space-y-4">
          {casos.map((caso) => (
            <CasoRevisionCard key={caso.id} caso={caso} onResuelto={() => handleResuelto(caso.id)} />
          ))}
        </div>
      )}
    </div>
  );
}