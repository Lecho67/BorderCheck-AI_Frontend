import { useState } from "react";
import { Eye } from "lucide-react";
import {
  revisarDocumento,
  tomarDocumento,
  obtenerUrlDocumentoParaRevision,
  type DocumentoConCliente,
} from "@/lib/documentReviewService";

interface Props {
  doc: DocumentoConCliente;
  onResuelto: () => void;
}

export function DocumentReviewCard({ doc, onResuelto }: Props) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomado, setTomado] = useState(doc.assigned_agent_id != null);

  const handleTomar = async () => {
    setLoading(true);
    setError(null);
    try {
      await tomarDocumento(doc.id);
      setTomado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al tomar el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleVer = async () => {
    try {
      const url = await obtenerUrlDocumentoParaRevision(doc.file_path);
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir el documento");
    }
  };

  const handleRevisar = async (status: "aprobado" | "rechazado") => {
    if (status === "rechazado" && motivo.trim().length < 10) {
      setError("Para rechazar, escribe un motivo de al menos 10 caracteres");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await revisarDocumento(doc.id, status, motivo || "Aprobado sin observaciones");
      onResuelto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al revisar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{doc.cliente?.full_name || doc.cliente?.email || doc.user_id}</p>
          <p className="text-sm text-slate-500">{doc.file_name}</p>
        </div>
        <button
          onClick={handleVer}
          className="flex items-center gap-1 text-sm text-brand-blue hover:underline"
        >
          <Eye className="w-3.5 h-3.5" /> Ver
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!tomado ? (
        <button
          onClick={handleTomar}
          disabled={loading}
          className="text-sm bg-brand-blue text-white px-3 py-1.5 rounded"
        >
          {loading ? "Tomando..." : "Tomar documento"}
        </button>
      ) : (
        <>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (obligatorio si rechazas)"
            className="w-full border rounded px-2 py-1.5 text-sm mb-2"
            rows={2}
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleRevisar("aprobado")}
              disabled={loading}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded"
            >
              Aprobar
            </button>
            <button
              onClick={() => handleRevisar("rechazado")}
              disabled={loading}
              className="text-sm bg-red-600 text-white px-3 py-1.5 rounded"
            >
              Rechazar
            </button>
          </div>
        </>
      )}
    </div>
  );
}