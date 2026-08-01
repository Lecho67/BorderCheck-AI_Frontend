export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  shipment: string;
  status: "aprobado" | "revision";
  date: string;
}

const STATUS_CONFIG = {
  aprobado: {
    label: "Aprobado por IA",
    dot: "bg-verdict-green",
    text: "text-verdict-green",
    bg: "bg-verdict-green/10",
  },
  revision: {
    label: "Requiere revisión",
    dot: "bg-verdict-yellow",
    text: "text-verdict-yellow",
    bg: "bg-verdict-yellow/10",
  },
} as const;

export function DocumentCard({ doc }: { doc: DocumentItem }) {
  const status = STATUS_CONFIG[doc.status];

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm
                    hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{doc.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{doc.type}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${status.bg} ${status.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="text-xs text-slate-500 flex items-center justify-between">
        <span>{doc.shipment}</span>
        <span>{doc.date}</span>
      </div>

      <button
        className="text-sm text-brand-blue font-medium self-start
                   hover:underline focus:outline-none focus:ring-2
                   focus:ring-brand-blue rounded"
      >
        Ver documento
      </button>
    </div>
  );
}