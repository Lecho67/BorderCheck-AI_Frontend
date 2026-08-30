import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  IdCard,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setIsOpen(false);
    await signOut();
    navigate("/");
  }

  const role = profile?.role;

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

          {/* Cliente: solo enlaces operacionales de mayor frecuencia */}
            {user && (role === "cliente" || role === "admin") && (
              <>
                <Link to="/dashboard/historial" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                  Historial
                </Link>
                <Link to="/casillero" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                  Casillero
                </Link>
                <Link
                  to="/consulta/nueva"
                  className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                  Nueva consulta
                </Link>
              </>
            )}

          {/* Gestor: acceso a su cartera de clientes */}
          {user && (role === "gestor" || role === "admin") && (
            <>
              <Link to="/gestor" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Mis clientes
              </Link>
              <Link to="/reportes" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Reportes
              </Link>
            </>
          )}

          {/* Agente: cola de revisión + documentos */}
          {user && (role === "agente" || role === "admin") && (
            <>
              <Link to="/panel-agente" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Cola de revisión
              </Link>
              <Link to="/panel-agente/documentos" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
                Documentos
              </Link>
            </>
          )}

          {/* Admin: panel de administración */}
          {user && role === "admin" && (
            <Link to="/admin" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline font-medium">
              Administración
            </Link>
          )}

          <Link to="/herramientas" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline">
            Herramientas
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Mi Perfil{profile?.full_name ? ` · ${profile.full_name}` : role ? ` · ${role}` : ""}
                </span>
                <span className="sm:hidden">Perfil</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 shadow-lg rounded-xl bg-white border border-gray-100 py-2 text-sm z-20">
                  <div className="px-3 pb-1 pt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Mi cuenta
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <Link
                    to="/perfil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <IdCard className="w-4 h-4" />
                    Verificar Identidad
                  </Link>
                  <Link
                    to="/documentos"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Mis Documentos
                  </Link>

                  <div className="my-2 border-t border-slate-100" />

                  <div className="px-3 pb-1 pt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Ayuda &amp; soporte
                  </div>
                  <Link
                    to="/soporte"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4" />
                    Centro de Soporte
                  </Link>

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
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