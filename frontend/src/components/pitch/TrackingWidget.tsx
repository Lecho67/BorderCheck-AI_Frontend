import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";
import type { NivelVeredicto } from "@/lib/types";

interface TrackingResult {
  numeroGuia: string;
  estadoEnvio: string;
  ubicacion: string;
  verdict: NivelVeredicto;
  mensaje: string;
}

const escenarios: Omit<TrackingResult, "numeroGuia">[] = [
  {
    estadoEnvio: "En tránsito internacional",
    ubicacion: "Miami, FL — Hub de conexión",
    verdict: "verde",
    mensaje: "Sin restricciones detectadas para el país de destino. Envío avanza con normalidad.",
  },
  {
    estadoEnvio: "En revisión aduanera",
    ubicacion: "Bogotá — Aduana El Dorado",
    verdict: "amarillo",
    mensaje: "Falta un documento: declaración de batería de litio. El envío no está bloqueado, solo pendiente.",
  },
  {
    estadoEnvio: "Envío retenido",
    ubicacion: "Origen — Centro de clasificación",
    verdict: "rojo",
    mensaje: "El ítem contiene un componente restringido para transporte aéreo hacia el destino declarado.",
  },
];

// Distribuye el resultado de forma determinística según el texto ingresado,
// para que la misma guía siempre muestre el mismo resultado en la demo.
function simularConsulta(numeroGuia: string): TrackingResult {
  const hash = numeroGuia
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const escenario = escenarios[hash % escenarios.length];
  return { numeroGuia, ...escenario };
}

export function TrackingWidget() {
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState<TrackingResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setResultado(simularConsulta(input.trim()));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-xl mx-auto">
      <p className="text-xs font-semibold text-cobalt uppercase tracking-wide mb-2 text-center">
        Rastreador &amp; verificador inteligente
      </p>
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-1">
        No solo sabe dónde está tu paquete — sabe si va a pasar la aduana
      </h3>
      <p className="text-sm text-slate-500 text-center mb-6">
        Ingresa un número de guía de ejemplo para ver el estado logístico junto al diagnóstico de IA.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: BC123456789"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-3 rounded-xl bg-cobalt text-white hover:bg-cobalt-600 transition-colors shrink-0"
          aria-label="Rastrear envío"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
      <p className="text-xs text-slate-400 text-center mb-4">
        Prueba con cualquier texto — es una simulación de demostración.
      </p>

      {resultado && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono-data text-slate-500">{resultado.numeroGuia}</span>
            <VerdictBadge nivel={resultado.verdict} />
          </div>
          <p className="font-medium text-slate-900 text-sm mb-1">{resultado.estadoEnvio}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5" /> {resultado.ubicacion}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{resultado.mensaje}</p>
        </div>
      )}
    </div>
  );
}