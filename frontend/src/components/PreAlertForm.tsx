import { useState, FormEvent } from "react";

interface PreAlertFormProps {
  onClose: () => void;
}

export function PreAlertForm({ onClose }: PreAlertFormProps) {
  const [store, setStore] = useState("");
  const [tracking, setTracking] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: integrar con endpoint real de escaneo IA de pre-alerta
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pre-alertar paquete
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none
                       focus:ring-2 focus:ring-brand-blue rounded"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tienda de origen
            </label>
            <input
              type="text"
              required
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Ej. Amazon, Shein, eBay"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de rastreo de origen
            </label>
            <input
              type="text"
              required
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="1Z999AA10123456784"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor declarado (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factura adjunta o descripción
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3
                         file:rounded-lg file:border-0 file:bg-brand-blue/10
                         file:text-brand-blue file:font-medium hover:file:bg-brand-blue/20"
            />
            {file && (
              <p className="text-xs text-gray-500 mt-1">
                Archivo: {file.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 bg-ai-accent/10 text-ai-accent
                          text-xs rounded-lg px-3 py-2">
            <span>🤖</span>
            <span>
              La IA escaneará esta pre-alerta y estimará el arancel antes de
              que el paquete llegue a bodega.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium
                         hover:bg-brand-blue/90 focus:outline-none focus:ring-2
                         focus:ring-brand-blue focus:ring-offset-2 transition disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar pre-alerta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}