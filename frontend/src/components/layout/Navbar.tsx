import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">BorderCheck AI</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/pitch" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Presentación
          </Link>
          <Link to="/dashboard/historial" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Historial
          </Link>
          <Link to="/casillero" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Casillero
          </Link>
          <Link to="/documentos" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Documentos
          </Link>
          <Link to="/herramientas" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Herramientas
          </Link>
          <Link to="/dashboard" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            JD
          </Link>
        </div>
      </div>
    </nav>
  );
}