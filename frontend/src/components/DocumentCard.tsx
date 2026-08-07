import { FileText, Trash2, Eye } from "lucide-react";
import type { DocumentRecord } from "@/types/database.types";

interface DocumentCardProps {
  doc: DocumentRecord;
  onVer: (doc: DocumentRecord) => void;
  onEliminar: (doc: DocumentRecord) => void;
}

export function DocumentCard({ doc, onVer, onEliminar }: DocumentCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{doc.file_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{doc.file_type}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {new Date(doc.created_at).toLocaleDateString()}
      </p>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onVer(doc)}
          className="flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue rounded"
        >
          <Eye className="w-3.5 h-3.5" /> Ver documento
        </button>
        <button
          onClick={() => onEliminar(doc)}
          className="flex items-center gap-1.5 text-sm text-red-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </div>
  );
}