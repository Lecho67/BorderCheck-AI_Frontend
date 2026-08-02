import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CustomsQuery } from '../types/database.types';

export default function DashboardHistorial() {
  const [queries, setQueries] = useState<CustomsQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      const { data, error } = await supabase
        .from('customs_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setQueries(data as CustomsQuery[]);
      setLoading(false);
    };
    fetchQueries();
  }, []);

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div>
      <h1>Historial de Consultas</h1>
      {queries.length === 0 ? (
        <p>Aún no tienes consultas registradas.</p>
      ) : (
        <ul>
          {queries.map((q) => (
            <li key={q.id}>
              <strong>{q.product_description}</strong> — {q.ai_verdict}
              {q.hs_code && <span> (HS: {q.hs_code})</span>}
              <br />
              <small>{new Date(q.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}