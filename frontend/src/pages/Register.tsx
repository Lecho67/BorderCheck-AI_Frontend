import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
        <h1 className="mb-2 text-lg font-semibold text-cobalt">Registro exitoso</h1>
        <p className="text-sm text-slate-500">Te estamos redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="mb-1 text-2xl font-bold text-cobalt">Crear cuenta</h1>
      <p className="mb-6 text-sm text-slate-500">
        Creá tu cuenta para empezar a importar con Easy CUSTOMS.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Input
          type="text"
          label="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ej: Juan Pérez"
          required
        />
        <Input
          type="email"
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
        />
        <Input
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-brand-blue hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
