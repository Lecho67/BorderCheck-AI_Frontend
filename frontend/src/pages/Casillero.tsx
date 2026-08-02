import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { PreAlert } from '../types/database.types';

export default function Casillero() {
  const { user, profile } = useAuth();
  const [preAlerts, setPreAlerts] = useState<PreAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tracking_number: '',
    carrier: '',
    description: '',
    declared_value: '',
  });

  const fetchPreAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pre_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error.message);
    } else {
      setPreAlerts(data as PreAlert[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPreAlerts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('pre_alerts').insert({
      user_id: user.id,
      tracking_number: form.tracking_number,
      carrier: form.carrier,
      description: form.description,
      declared_value: parseFloat(form.declared_value) || 0,
    });

    if (error) {
      alert('Error al crear pre-alerta: ' + error.message);
      return;
    }

    setForm({ tracking_number: '', carrier: '', description: '', declared_value: '' });
    fetchPreAlerts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pre_alerts').delete().eq('id', id);
    if (!error) fetchPreAlerts();
  };

  return (
    <div>
      <h1>Mi Casillero</h1>
      <p>Código de casillero: {profile?.locker_code ?? 'Cargando...'}</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Número de tracking"
          value={form.tracking_number}
          onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
          required
        />
        <input
          placeholder="Transportista (DHL, FedEx...)"
          value={form.carrier}
          onChange={(e) => setForm({ ...form, carrier: e.target.value })}
          required
        />
        <input
          placeholder="Descripción del paquete"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Valor declarado (USD)"
          value={form.declared_value}
          onChange={(e) => setForm({ ...form, declared_value: e.target.value })}
          required
        />
        <button type="submit">Crear pre-alerta</button>
      </form>

      {loading ? (
        <p>Cargando pre-alertas...</p>
      ) : (
        <ul>
          {preAlerts.map((pa) => (
            <li key={pa.id}>
              {pa.tracking_number} - {pa.carrier} - {pa.description} - $
              {pa.declared_value} - {pa.status}
              <button onClick={() => handleDelete(pa.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}