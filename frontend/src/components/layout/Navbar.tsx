import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

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
          {!user && (
            <Link to="/pitch" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
              Presentación
            </Link>
          )}

          {user && (
            <>
              <Link to="/dashboard/historial" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Historial
              </Link>
              <Link to="/casillero" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Casillero
              </Link>
              <Link to="/documentos" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Documentos
              </Link>
            </>
          )}

          <Link to="/herramientas" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Herramientas
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Mi Perfil{profile?.full_name ? ` · ${profile.full_name}` : ""}
                </span>
                <span className="sm:hidden">Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}