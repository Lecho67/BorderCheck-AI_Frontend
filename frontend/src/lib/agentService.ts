import { supabase } from "./supabase";
import type { CustomsQuery, Profile } from "@/types/database.types";

export interface CasoEnCola extends CustomsQuery {
  cliente?: Profile;
}

export async function fetchColaDeRevision(): Promise<CasoEnCola[]> {
  const { data, error } = await supabase
    .from("customs_queries")
    .select("*, cliente:profiles!customs_queries_user_id_fkey(*)")
    .in("ai_verdict", ["REQUIERE_DOCUMENTACION", "PRECAUCION"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as CasoEnCola[];
}
export async function tomarCaso(shipmentId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const agenteId = sessionData.session?.user.id;

  const { data, error } = await supabase
    .from("customs_queries")
    .update({ assigned_agent_id: agenteId })
    .eq("id", shipmentId)
    .is("assigned_agent_id", null) // evita que dos agentes lo tomen a la vez
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Este caso ya fue tomado por otro agente");
  return data;
}

export async function overrideVerdict(
  shipmentId: string,
  nuevoVeredicto: string,
  motivo: string,
) {
  const { data: original, error: errOriginal } = await supabase
    .from("customs_queries")
    .select("ai_verdict")
    .eq("id", shipmentId)
    .single();

  if (errOriginal || !original) throw new Error("Caso no encontrado");

  const { data: sessionData } = await supabase.auth.getSession();
  const agenteId = sessionData.session?.user.id;

  const { data, error } = await supabase
    .from("customs_queries")
    .update({
      ai_verdict: nuevoVeredicto,
      original_ai_verdict: original.ai_verdict,
      overridden_by: agenteId,
      override_reason: motivo,
      overridden_at: new Date().toISOString(),
    })
    .eq("id", shipmentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}