import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  pregunta: string;
  respuesta: string;
}

export function FaqItem({ pregunta, respuesta }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-slate-900 text-sm sm:text-base">{pregunta}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
          {respuesta}
        </div>
      )}
    </div>
  );
}