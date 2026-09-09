import { Check, X, Minus } from "lucide-react";

interface Fila {
  criterio: string;
  tradicional: { texto: string; positivo: boolean | null };
  bordercheck: { texto: string; positivo: boolean | null };
}

const filas: Fila[] = [
  {
    criterio: "Liberación en aduana",
    tradicional: { texto: "Días (2 a 7 en promedio)", positivo: false },
    bordercheck: { texto: "Horas, con diagnóstico previo", positivo: true },
  },
  {
    criterio: "Pre-clasificación arancelaria",
    tradicional: { texto: "No disponible antes del envío", positivo: false },
    bordercheck: { texto: "Sí, antes de despachar", positivo: true },
  },
  {
    criterio: "Tasa de retenciones",
    tradicional: { texto: "Alta — se descubre en aduana", positivo: false },
    bordercheck: { texto: "Mínima — se anticipa con IA", positivo: true },
  },
  {
    criterio: "Visibilidad del envío",
    tradicional: { texto: "Tracking básico de ubicación", positivo: null },
    bordercheck: { texto: "Diagnóstico legal + ubicación", positivo: true },
  },
  {
    criterio: "Soporte ante dudas normativas",
    tradicional: { texto: "Línea de atención telefónica", positivo: null },
    bordercheck: { texto: "IA 24/7 + soporte humano", positivo: true },
  },
];

function Estado({ texto, positivo }: { texto: string; positivo: boolean | null }) {
  const Icon = positivo === true ? Check : positivo === false ? X : Minus;
  const color =
    positivo === true ? "text-verdict-green-text" : positivo === false ? "text-verdict-red-text" : "text-slate-400";

  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
      <span className="text-sm text-slate-600">{texto}</span>
    </div>
  );
}

export function ComparisonTable() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Encabezados (desktop) */}
      <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr] gap-4 mb-3 px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Criterio</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Paquetería tradicional
        </span>
        <span className="text-xs font-semibold text-cobalt uppercase tracking-wide">Easy CUSTOMS</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-200">
        {filas.map((fila) => (
          <div
            key={fila.criterio}
            className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr] gap-3 sm:gap-4 p-5"
          >
            <p className="font-medium text-slate-900 text-sm">{fila.criterio}</p>
            <Estado texto={fila.tradicional.texto} positivo={fila.tradicional.positivo} />
            <Estado texto={fila.bordercheck.texto} positivo={fila.bordercheck.positivo} />
          </div>
        ))}
      </div>
    </div>
  );
}