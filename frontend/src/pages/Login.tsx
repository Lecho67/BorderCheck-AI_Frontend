import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Login() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    if (mode === 'signUp') {
      await signUp(email, password, fullName);
    } else {
      await signIn(email, password);
    }
    // En ambos casos, el useEffect se encarga de navegar
    // cuando "user" se actualice en el AuthContext.
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Ocurrió un error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">
        {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>

      <div className="flex mb-6 border rounded overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode('signIn'); setError(null); setInfo(null); }}
          className={`flex-1 py-2 text-sm ${mode === 'signIn' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => { setMode('signUp'); setError(null); setInfo(null); }}
          className={`flex-1 py-2 text-sm ${mode === 'signUp' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {info && <p className="text-green-600 text-sm">{info}</p>}

        {mode === 'signUp' && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full border rounded px-3 py-2"
          />
        )}

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
          placeholder="Contraseña"
          className="w-full border rounded px-3 py-2"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded px-3 py-2"
        >
          {loading
            ? mode === 'signIn' ? 'Ingresando...' : 'Creando cuenta...'
            : mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}