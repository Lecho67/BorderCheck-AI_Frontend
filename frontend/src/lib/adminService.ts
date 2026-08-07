import { supabase } from "./supabase";
import type { Profile } from "@/types/database.types";

export async function fetchTodosLosUsuarios(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function actualizarRol(userId: string, nuevoRol: Profile["role"]) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: nuevoRol })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function asignarGestor(clienteId: string, gestorId: string | null) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ gestor_id: gestorId })
    .eq("id", clienteId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}