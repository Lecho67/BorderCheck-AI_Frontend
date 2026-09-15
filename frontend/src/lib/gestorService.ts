import { supabase } from "./supabase";
import type { Profile, CustomsQuery } from "@/types/database.types";

export interface ClienteConCartera {
  cliente: Profile;
  consultas: CustomsQuery[];
  /** Conteo de consultas por `ai_verdict` (clave = veredicto crudo). */
  resumen: Record<string, number>;
}

function contarVeredictos(consultas: CustomsQuery[]): Record<string, number> {
  const resumen: Record<string, number> = {};
  for (const q of consultas) {
    resumen[q.ai_verdict] = (resumen[q.ai_verdict] ?? 0) + 1;
  }
  return resumen;
}

/**
 * Solo los IDs de los clientes en la cartera de un gestor (sin sus
 * consultas) — usado para filtrar reportes/métricas sin traer de más.
 */
export async function fetchClienteIdsDelGestor(gestorId: string): Promise<string[]> {
  const { data, error } = await supabase.from("profiles").select("id").eq("gestor_id", gestorId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.id as string);
}

/**
 * Clientes de la cartera de un gestor con sus consultas aduaneras.
 *
 * Dos consultas: primero los perfiles con `gestor_id = <gestor>`, después
 * todas las `customs_queries` de esos clientes en una sola query (`in`), que
 * se agrupan en memoria. Devuelve la lista ordenada por nombre y, por cliente,
 * las consultas de más reciente a más antigua + un conteo por veredicto para
 * el resumen colapsado del panel.
 */
export async function fetchClientesDelGestor(gestorId: string): Promise<ClienteConCartera[]> {
  const { data: clientesData, error: errClientes } = await supabase
    .from("profiles")
    .select("*")
    .eq("gestor_id", gestorId)
    .order("full_name", { ascending: true });

  if (errClientes) throw new Error(errClientes.message);

  const clientes = (clientesData ?? []) as Profile[];
  if (clientes.length === 0) return [];

  const { data: consultasData, error: errConsultas } = await supabase
    .from("customs_queries")
    .select("*")
    .in(
      "user_id",
      clientes.map((c) => c.id),
    )
    .order("created_at", { ascending: false });

  if (errConsultas) throw new Error(errConsultas.message);

  const porCliente: Record<string, CustomsQuery[]> = {};
  for (const q of (consultasData ?? []) as CustomsQuery[]) {
    (porCliente[q.user_id] ??= []).push(q);
  }

  return clientes.map((cliente) => {
    const consultas = porCliente[cliente.id] ?? [];
    return { cliente, consultas, resumen: contarVeredictos(consultas) };
  });
}
