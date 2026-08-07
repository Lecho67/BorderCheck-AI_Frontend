import { useState } from "react";
import { overrideVerdict, tomarCaso, type CasoEnCola } from "@/lib/agentService";

interface Props {
  caso: CasoEnCola;
  onResuelto: () => void;
}

export function CasoRevisionCard({ caso, onResuelto }: Props) {
  const [modoOverride, setModoOverride] = useState(false);
  const [nuevoVeredicto, setNuevoVeredicto] = useState("APROBADO");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomado, setTomado] = useState(caso.assigned_agent_id != null);

  const handleTomarCaso = async () => {
    setLoading(true);
    setError(null);
    try {
      await tomarCaso(caso.id);
      setTomado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al tomar el caso");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarIA = async () => {
    setLoading(true);
    setError(null);
    try {
      await overrideVerdict(caso.id, caso.ai_verdict, "Confirmado sin cambios por agente humano");
      onResuelto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSobreescribir = async () => {
    if (motivo.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await overrideVerdict(caso.id, nuevoVeredicto, motivo);
      onResuelto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarDocumentos = async () => {
    setLoading(true);
    setError(null);
    try {
      await overrideVerdict(
        caso.id,
        "REQUIERE_DOCUMENTACION",
        motivo || "Se solicitan documentos adicionales al cliente",
      );
      onResuelto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{caso.cliente?.full_name || caso.cliente?.email || caso.user_id}</p>
          <p className="text-sm text-gray-500">{caso.product_description}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800">
          {caso.ai_verdict}
        </span>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!tomado ? (
        <button
          onClick={handleTomarCaso}
          disabled={loading}
          className="text-sm bg-brand-blue text-white px-3 py-1.5 rounded"
        >
          {loading ? "Tomando..." : "Tomar caso"}
        </button>
      ) : !modoOverride ? (
        <div className="flex gap-2 mt-3">
          <button onClick={handleConfirmarIA} disabled={loading} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded">
            Confirmar IA
          </button>
          <button onClick={() => setModoOverride(true)} disabled={loading} className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded">
            Sobreescribir Veredicto
          </button>
          <button onClick={handleSolicitarDocumentos} disabled={loading} className="text-sm border border-gray-400 px-3 py-1.5 rounded">
            Solicitar Documentos
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <select value={nuevoVeredicto} onChange={(e) => setNuevoVeredicto(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="APROBADO">APROBADO</option>
            <option value="BLOQUEO">BLOQUEO</option>
            <option value="PRECAUCION">PRECAUCION</option>
          </select>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Justificación del cambio (mínimo 10 caracteres)" className="w-full border rounded px-2 py-1.5 text-sm" rows={2} />
          <div className="flex gap-2">
            <button onClick={handleSobreescribir} disabled={loading} className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded">
              Confirmar cambio
            </button>
            <button onClick={() => setModoOverride(false)} disabled={loading} className="text-sm text-gray-500">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}