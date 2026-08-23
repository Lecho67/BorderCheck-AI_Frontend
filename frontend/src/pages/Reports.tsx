import { useState } from "react";
import { NativeReportsView } from "@/components/reports/NativeReportsView";
import { PowerBiEmbed } from "@/components/reports/PowerBiEmbed";

type Tab = "nativa" | "powerbi";

export function Reports() {
  const [tab, setTab] = useState<Tab>("nativa");

  return (
    <div className="max-w-5xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Reportes</h1>
      <p className="text-gray-600 mb-6">
        Analítica de tus importaciones: volumen, tasa de aprobación e incidencias.
      </p>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("nativa")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "nativa"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Vista Nativa (Gráficas)
        </button>
        <button
          onClick={() => setTab("powerbi")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "powerbi"
              ? "border-brand-blue text-brand-blue"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Power BI Dashboard
        </button>
      </div>

      {tab === "nativa" ? <NativeReportsView /> : <PowerBiEmbed />}
    </div>
  );
}