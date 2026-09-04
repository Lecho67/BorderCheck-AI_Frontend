import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl border border-slate-200 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}