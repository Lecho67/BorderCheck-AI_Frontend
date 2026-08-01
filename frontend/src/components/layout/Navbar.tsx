import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
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

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-semibold text-brand-blue">
                  {user.avatarInitials}
                </div>
                <span className="hidden md:inline text-xs font-medium text-slate-600">
                  {user.lockerCode}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <p className="text-xs text-brand-blue font-medium mt-1">Casillero: {user.lockerCode}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
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