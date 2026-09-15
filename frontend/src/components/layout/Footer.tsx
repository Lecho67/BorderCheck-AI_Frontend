import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="border-cobalt border-slate-200 bg-cobalt-900 py-8">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <BrandLogo variant="isotype" className="[&_svg]:h-5 [&_svg]:w-5" />
          © 2026 Easy CUSTOMS
        </span>
        <div className="flex gap-4">
          <Link to="/soporte" className="hover:text-slate-600 transition-colors">
            Centro de ayuda
          </Link>
          <Link to="/privacidad" className="hover:text-slate-600 transition-colors">
            Privacidad
          </Link>
          <Link to="/terminos" className="hover:text-slate-600 transition-colors">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}
