import { supabase } from "./supabase";
import type { NotificationRecord } from "@/types/database.types";

/**
 * Notificaciones in-app. La tabla `notifications` y sus triggers
 * (`notify_paquete_recibido`, `notify_veredicto_aduana`) ya viven en la base
 * — el frontend solo lee, marca como leídas y escucha por Realtime. RLS
 * restringe todo a `user_id = auth.uid()`, así que no hace falta filtrar acá.
 */

const LIMITE = 50;

export async function fetchNotificaciones(): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  if (error) throw new Error(error.message);
  return (data ?? []) as NotificationRecord[];
}

export async function marcarComoLeida(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ leida: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function marcarTodasComoLeidas(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ leida: true })
    .eq("leida", false);
  if (error) throw new Error(error.message);
}
