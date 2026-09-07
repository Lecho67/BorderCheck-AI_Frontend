import { useEffect, useState } from "react";
import { fetchDocumentosPendientes, type DocumentoConCliente } from "@/lib/documentReviewService";
import { DocumentReviewCard } from "@/components/documents/DocumentReviewCard";

export function AgentDocumentsPanel() {
  const [docs, setDocs] = useState<DocumentoConCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await fetchDocumentosPendientes();
      setDocs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleResuelto = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Revisión de Documentos</h1>
      <p className="text-sm text-slate-500 mb-6">
        {docs.length} documento{docs.length !== 1 && "s"} pendiente{docs.length !== 1 && "s"} de revisión
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No hay documentos pendientes de revisión.
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <DocumentReviewCard key={doc.id} doc={doc} onResuelto={() => handleResuelto(doc.id)} />
          ))}
        </div>
      )}
    </div>
  );
}