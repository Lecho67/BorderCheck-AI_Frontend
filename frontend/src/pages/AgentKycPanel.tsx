import { useEffect, useState } from "react";
import { fetchKycPendientes } from "@/lib/kycReviewService";
import { KycReviewCard } from "@/components/kyc/KycReviewCard";
import type { Profile } from "@/types/database.types";

export function AgentKycPanel() {
  const [perfiles, setPerfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await fetchKycPendientes();
      setPerfiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las verificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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
      <h1 className="text-2xl font-bold mb-2">Verificación de Identidad (KYC)</h1>
      <p className="text-gray-600 mb-6">
        {perfiles.length} verificación{perfiles.length !== 1 && "es"} pendiente
        {perfiles.length !== 1 && "s"} de revisión
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
