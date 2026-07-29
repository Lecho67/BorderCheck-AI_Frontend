import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";

export function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate("/dashboard");
  };

  return (
    <main className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Crea tu cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" placeholder="Tu nombre" required />
        <Input type="email" label="Email" placeholder="tu@email.com" required />
        <Input type="password" label="Contraseña" placeholder="••••••••" required />
        <Button type="submit" className="w-full">Crear cuenta</Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-brand-blue font-medium">Inicia sesión</Link>
      </p>
    </main>
  );
}
