import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchKycPendientes } from "@/lib/kycReviewService";
import { KycReviewCard } from "@/components/kyc/KycReviewCard";
import type { Profile } from "@/types/database.types";

const INTERVALO_REFRESCO_MS = 30_000;

/**
 * Sin Realtime: la política RLS de SELECT de agente sobre `profiles` solo
 * cubre clientes con un caso (`customs_queries`) asignado o sin asignar —
 * un cliente que recién sube su KYC y todavía no hizo ninguna consulta no
 * entraría por esa vía. Los RPC (`listar_kyc_pendientes`) sí lo ven porque
 * son `SECURITY DEFINER` y bypasean RLS, así que actualizamos por polling
 * en vez de suscribirnos a `postgres_changes`.
 */
export function AgentKycPanel() {
  const [perfiles, setPerfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (mostrarSpinner = true) => {
    if (mostrarSpinner) setLoading(true);
    try {
      const data = await fetchKycPendientes();
      setPerfiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las verificaciones");
    } finally {
      if (mostrarSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();

    const intervalo = setInterval(() => cargar(false), INTERVALO_REFRESCO_MS);
    const alVolverElFoco = () => cargar(false);
    window.addEventListener("focus", alVolverElFoco);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", alVolverElFoco);
    };
  }, [cargar]);

  const handleResuelto = (id: string) => {
    setPerfiles((prev) => prev.filter((p) => p.id !== id));
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Verificación de Identidad (KYC)</h1>
        <button
          type="button"
          onClick={() => cargar(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        {perfiles.length} verificación{perfiles.length !== 1 && "es"} pendiente
        {perfiles.length !== 1 && "s"} de revisión — se actualiza solo cada 30 s
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {perfiles.length === 0 ? (
        <div className="border rounded p-4 bg-gray-50 text-sm text-gray-500">
          No hay verificaciones de identidad pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {perfiles.map((perfil) => (
            <KycReviewCard
              key={perfil.id}
              perfil={perfil}
              onResuelto={() => handleResuelto(perfil.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
