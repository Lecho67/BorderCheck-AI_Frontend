import { useState, FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { crearPreAlerta, actualizarPreAlerta } from "@/lib/preAlertService";
import type { PreAlert } from "@/types/database.types";

interface PreAlertFormProps {
  onClose: () => void;
  onSaved: () => void;
  preAlertaExistente?: PreAlert | null;
}

export function PreAlertForm({ onClose, onSaved, preAlertaExistente }: PreAlertFormProps) {
  const esEdicion = !!preAlertaExistente;

  const [carrier, setCarrier] = useState(preAlertaExistente?.carrier ?? "");
  const [tracking, setTracking] = useState(preAlertaExistente?.tracking_number ?? "");
  const [description, setDescription] = useState(preAlertaExistente?.description ?? "");
  const [value, setValue] = useState(
    preAlertaExistente ? String(preAlertaExistente.declared_value) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        carrier,
        tracking_number: tracking,
        description,
        declared_value: parseFloat(value),
      };
      if (esEdicion && preAlertaExistente) {
        await actualizarPreAlerta(preAlertaExistente.id, payload);
      } else {
        await crearPreAlerta(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la pre-alerta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4 pr-6">
        {esEdicion ? "Editar pre-alerta" : "Pre-alertar paquete"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Input
          label="Tienda de origen / Transportista"
          type="text"
          required
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder="Ej. Amazon, Shein, eBay, DHL"
        />

        <Input
          label="Número de rastreo de origen"
          type="text"
          required
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="1Z999AA10123456784"
        />

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Descripción del contenido
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Zapatos deportivos, 1 par"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            rows={2}
          />
        </div>

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

        <div className="flex items-center gap-2 bg-ai-accent/10 text-ai-accent text-xs rounded-lg px-3 py-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            La IA escaneará esta pre-alerta y estimará el arancel antes de que el paquete llegue a bodega.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="px-4 py-2">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting} className="px-4 py-2">
            {submitting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Enviar pre-alerta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}