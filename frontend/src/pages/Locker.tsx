import { useState } from "react";
import { PreAlertForm } from "../components/PreAlertForm";

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

export default function Locker() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Casillero</h1>
          <p className="text-sm text-gray-500 mt-1">
            Direcciones asignadas y pre-alertas de paquetes en tránsito.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-blue text-white px-5 py-2.5 rounded-lg font-medium
                     hover:bg-brand-blue/90 focus:outline-none focus:ring-2
                     focus:ring-brand-blue focus:ring-offset-2 transition"
        >
          + Pre-alertar paquete
        </button>
      </header>

      {/* Direcciones asignadas */}
      <section className="grid sm:grid-cols-2 gap-4">
        {ADDRESSES.map((addr) => (
          <div
            key={addr.id}
            className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide
                               bg-ai-accent/10 text-ai-accent px-2 py-1 rounded-full">
                {addr.country}
              </span>
            </div>
            <p className="font-medium text-gray-900">{addr.suite}</p>
            <p className="text-sm text-gray-600 mt-1">{addr.addressLine}</p>
            <p className="text-sm text-gray-600">{addr.city}</p>
            <button
              className="text-sm text-brand-blue font-medium mt-3
                         hover:underline focus:outline-none focus:ring-2
                         focus:ring-brand-blue rounded"
              onClick={() =>
                navigator.clipboard.writeText(
                  `${addr.suite}, ${addr.addressLine}, ${addr.city}`
                )
              }
            >
              Copiar dirección
            </button>
          </div>
        ))}
      </section>

      {/* Listado de pre-alertas (placeholder para conectar a data real) */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Pre-alertas activas
        </h2>
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 text-sm">
          Aún no tienes paquetes pre-alertados. Usa el botón "Pre-alertar
          paquete" para que la IA escanee tu factura antes de que llegue a
          bodega.
        </div>
      </section>

      {showForm && <PreAlertForm onClose={() => setShowForm(false)} />}
    </div>
  );
}