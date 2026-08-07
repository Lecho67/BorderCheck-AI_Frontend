import { useEffect, useState } from "react";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { PreAlertForm } from "../components/PreAlertForm";
import { fetchMisPreAlertas, eliminarPreAlerta } from "@/lib/preAlertService";
import type { PreAlert } from "@/types/database.types";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface LockerAddress {
  id: string;
  country: string;
  city: string;
  code: string;
  addressLine: string;
  suite: string;
}

const ADDRESSES: LockerAddress[] = [
  {
    id: "us-miami",
    country: "Estados Unidos",
    city: "Miami, FL",
    code: "US",
    addressLine: "8548 NW 72nd St",
    suite: "Suite BC-{USER_ID}",
  },
];

const STATUS_LABEL: Record<PreAlert["status"], string> = {
  pendiente: "Pendiente",
  recibido: "Recibido en bodega",
  en_transito: "En tránsito",
  entregado: "Entregado",
};

export default function Locker() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PreAlert | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [preAlertas, setPreAlertas] = useState<PreAlert[]>([]);
  const [eliminando, setEliminando] = useState<PreAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await fetchMisPreAlertas();
      setPreAlertas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pre-alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  function handleCopy(addr: LockerAddress) {
    navigator.clipboard.writeText(`${addr.suite}, ${addr.addressLine}, ${addr.city}`);
    setCopiedId(addr.id);
    setTimeout(() => setCopiedId((current) => (current === addr.id ? null : current)), 2000);
  }

  const solicitarEliminar = (p: PreAlert) => {
  setEliminando(p);
};

  const confirmarEliminar = async () => {
    if (!eliminando) return;
    try {
      await eliminarPreAlerta(eliminando.id);
      setPreAlertas((prev) => prev.filter((p) => p.id !== eliminando.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi Casillero</h1>
          <p className="text-sm text-slate-500 mt-1">
            Direcciones asignadas y pre-alertas de paquetes en tránsito.
          </p>
        </div>
        <button
          onClick={() => {
            setEditando(null);
            setShowForm(true);
          }}
          className="bg-brand-blue text-white px-5 py-2.5 rounded-lg font-medium
                     hover:bg-brand-blue/90 focus:outline-none focus:ring-2
                     focus:ring-brand-blue focus:ring-offset-2 transition"
        >
          + Pre-alertar paquete
        </button>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        {ADDRESSES.map((addr) => (
          <div key={addr.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide bg-ai-accent/10 text-ai-accent px-2 py-1 rounded-full">
                {addr.country}
              </span>
            </div>
            <p className="font-medium text-slate-900">{addr.suite}</p>
            <p className="text-sm text-slate-600 mt-1">{addr.addressLine}</p>
            <p className="text-sm text-slate-600">{addr.city}</p>
            <button
              className={`flex items-center gap-1.5 text-sm font-medium mt-3 focus:outline-none focus:ring-2 focus:ring-brand-blue rounded transition-colors ${
                copiedId === addr.id ? "text-verdict-green-text" : "text-brand-blue hover:underline"
              }`}
              onClick={() => handleCopy(addr)}
            >
              {copiedId === addr.id ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar dirección
                </>
              )}
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Pre-alertas activas</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : preAlertas.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-sm">
            Aún no tienes paquetes pre-alertados. Usa el botón "Pre-alertar paquete" para que la IA escanee tu factura antes de que llegue a bodega.
          </div>
        ) : (
          <div className="space-y-3">
            {preAlertas.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{p.carrier} — {p.tracking_number}</p>
                  <p className="text-sm text-slate-600 truncate">{p.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>${p.declared_value.toFixed(2)} USD</span>
                    <span>{STATUS_LABEL[p.status]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditando(p);
                      setShowForm(true);
                    }}
                    className="p-2 text-slate-500 hover:text-brand-blue rounded-lg hover:bg-slate-50"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => solicitarEliminar(p)}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
{eliminando && (
  <Modal open onClose={() => setEliminando(null)}>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Eliminar pre-alerta</h3>
    <p className="text-sm text-slate-600 mb-6">
      ¿Seguro que quieres eliminar la pre-alerta de{" "}
      <span className="font-medium text-slate-900">{eliminando.carrier} — {eliminando.tracking_number}</span>?
      Esta acción no se puede deshacer.
    </p>
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={() => setEliminando(null)} className="px-4 py-2">
        Cancelar
      </Button>
      <Button
        onClick={confirmarEliminar}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
      >
        Eliminar
      </Button>
    </div>
  </Modal>
)}
      {showForm && (
        <PreAlertForm
          onClose={() => setShowForm(false)}
          onSaved={cargar}
          preAlertaExistente={editando}
        />
      )}
    </div>
  );
}