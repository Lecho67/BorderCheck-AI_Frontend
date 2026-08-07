export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  locker_code: string | null;
  phone: string | null;
  role: 'admin' | 'gestor' | 'agente' | 'cliente';
  gestor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreAlert {
  id: string;
  user_id: string;
  tracking_number: string;
  carrier: string;
  description: string;
  declared_value: number;
  status: 'pendiente' | 'recibido' | 'en_transito' | 'entregado';
  created_at: string;
}

export interface CustomsQuery {
  id: string;
  user_id: string;
  product_description: string;
  hs_code: string | null;
  ai_verdict: string;
  ai_confidence: number | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  overridden_by: string | null;
  override_reason: string | null;
  overridden_at: string | null;
  original_ai_verdict: string | null;
  assigned_agent_id: string | null;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  related_pre_alert_id: string | null;
  created_at: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  reviewed_by: string | null;
  review_reason: string | null;
  reviewed_at: string | null;
  assigned_agent_id: string | null;
}