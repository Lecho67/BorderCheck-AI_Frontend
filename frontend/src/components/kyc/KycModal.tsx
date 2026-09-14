import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CONTENIDO_LEGAL, type TipoLegal } from "@/lib/legalContent";

interface Props {
  tipo: TipoLegal;
  onClose: () => void;
}

export function KycModal({ tipo, onClose }: Props) {
  const contenido = CONTENIDO_LEGAL[tipo];
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">{contenido.titulo}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed text-slate-600">
          {contenido.cuerpo.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-cobalt px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}