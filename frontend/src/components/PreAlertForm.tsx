import { useState, FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <Modal open onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4 pr-6">Pre-alertar paquete</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tienda de origen"
          type="text"
          required
          value={store}
          onChange={(e) => setStore(e.target.value)}
          placeholder="Ej. Amazon, Shein, eBay"
        />

        <Input
          label="Número de rastreo de origen"
          type="text"
          required
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="1Z999AA10123456784"
        />

        <Input
          label="Valor declarado (USD)"
          type="number"
          min="0"
          step="0.01"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
        />

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Factura adjunta o descripción
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3
                       file:rounded-xl file:border-0 file:bg-brand-blue/10
                       file:text-brand-blue file:font-medium hover:file:bg-brand-blue/20"
          />
          {file && (
            <p className="text-xs text-slate-500 mt-1">
              Archivo: {file.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 bg-ai-accent/10 text-ai-accent
                        text-xs rounded-lg px-3 py-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            La IA escaneará esta pre-alerta y estimará el arancel antes de
            que el paquete llegue a bodega.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="px-4 py-2">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting} className="px-4 py-2">
            {submitting ? "Enviando..." : "Enviar pre-alerta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
