import { supabase } from "./supabase";
import type { PreAlert } from "@/types/database.types";

export async function fetchMisPreAlertas(): Promise<PreAlert[]> {
  const { data, error } = await supabase
    .from("pre_alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as PreAlert[];
}

export interface NuevaPreAlerta {
  tracking_number: string;
  carrier: string;
  description: string;
  declared_value: number;
}

export async function crearPreAlerta(input: NuevaPreAlerta) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("pre_alerts")
    .insert({
      user_id: userId,
      tracking_number: input.tracking_number,
      carrier: input.carrier,
      description: input.description,
      declared_value: input.declared_value,
      status: "pendiente",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PreAlert;
}

export async function actualizarPreAlerta(id: string, input: NuevaPreAlerta) {
  const { data, error } = await supabase
    .from("pre_alerts")
    .update({
      tracking_number: input.tracking_number,
      carrier: input.carrier,
      description: input.description,
      declared_value: input.declared_value,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PreAlert;
}

export async function eliminarPreAlerta(id: string) {
  const { error } = await supabase.from("pre_alerts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}