import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const mensajes = [
  "Consultando normativa IATA vigente...",
  "Cruzando restricciones para el destino...",
  "Verificando clasificación arancelaria...",
  "Redactando tu diagnóstico...",
];

export function LoadingSkeleton() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % mensajes.length), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="rounded-xl border-l-4 border-ai-accent bg-white p-6 mb-6">
        <div className="h-6 w-2/3 rounded bg-slate-100 animate-pulse mb-3"></div>
        <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse"></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
          <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse"></div>
          <div className="h-3 w-full rounded bg-slate-100 animate-pulse"></div>
          <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse"></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
          <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse"></div>
          <div className="h-3 w-full rounded bg-slate-100 animate-pulse"></div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-ai-accent" />
        <span>{mensajes[index]}</span>
      </div>
    </div>
  );
}
