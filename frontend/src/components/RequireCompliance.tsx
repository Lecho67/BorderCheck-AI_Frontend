import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function RequireCompliance({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  const cumplido = Boolean(profile?.terms_accepted_at && profile?.habeas_data_accepted_at);

  if (!cumplido) {
    return (
      <div className="max-w-lg mx-auto mt-24 p-6 text-center">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h1 className="text-lg font-semibold text-slate-900 mb-2">
          Necesitás aceptar los términos para usar el Casillero
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Por normativa (Ley 1581 de 2012), antes de habilitar tu casillero virtual debés aceptar
          los Términos y Condiciones y la Política de Tratamiento de Datos.
        </p>
        <Link
          to="/perfil"
          className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-blue-hover"
        >
          Ir a mi perfil
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}