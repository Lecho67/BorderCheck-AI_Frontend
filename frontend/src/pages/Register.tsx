import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

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
      <div className="max-w-md mx-auto mt-16 p-6 text-center">
        <p>Registro exitoso. Serás redirigido al login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mínimo 6 caracteres)"
          className="w-full border rounded px-3 py-2"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded px-3 py-2"
        >
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}