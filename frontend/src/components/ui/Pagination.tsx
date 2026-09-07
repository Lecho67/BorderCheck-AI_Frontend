import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

/**
 * Controles de paginación (Anterior / Página X de Y / Siguiente). No renderiza
 * nada cuando hay una sola página. El estado lo maneja `usePagination`.
 */
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const btn =
    "flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="mt-4 flex items-center justify-between">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={btn}>
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>
      <span className="text-sm text-slate-500">
        Página {page} de {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className={btn}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
