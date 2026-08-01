import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/casillero", { replace: true });
    } catch {
      setError("No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-lg tracking-tight">BorderCheck AI</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Crea tu cuenta</h1>
          <p className="text-slate-500 text-sm mb-6">Obtén tu casillero y empieza a importar con IA.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Díaz"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-brand-blue font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}