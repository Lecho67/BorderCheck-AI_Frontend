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

export interface MetricasGlobales {
  totalConsultas: number;
  aprobados: number;
  bloqueados: number;
  porcentajeAprobados: number;
  porcentajeBloqueados: number;
  casosPorAgente: { agentId: string; nombre: string; total: number }[];
}

interface MetricasGlobalesRpc {
  total_consultas: number;
  aprobados: number;
  bloqueados: number;
  casos_por_agente: { agent_id: string; nombre: string; total: number }[];
}

/**
 * Métricas globales para /admin. La agregación vive en Postgres (RPC
 * `metricas_globales`, `SECURITY DEFINER`, solo admin); el frontend solo
 * lee el resultado y calcula los porcentajes.
 *
 * `casos_por_agente` cuenta solo modificaciones reales
 * (`original_ai_verdict IS DISTINCT FROM ai_verdict`); una confirmación
 * "Confirmar IA" no infla el conteo (ver `revisarCaso` en agentService.ts).
 */
export async function fetchMetricasGlobales(): Promise<MetricasGlobales> {
  const { data, error } = await supabase.rpc("metricas_globales");
  if (error) throw new Error(error.message);

  const m = data as MetricasGlobalesRpc;
  const total = m.total_consultas ?? 0;

  return {
    totalConsultas: total,
    aprobados: m.aprobados ?? 0,
    bloqueados: m.bloqueados ?? 0,
    porcentajeAprobados: total ? Math.round(((m.aprobados ?? 0) / total) * 100) : 0,
    porcentajeBloqueados: total ? Math.round(((m.bloqueados ?? 0) / total) * 100) : 0,
    casosPorAgente: (m.casos_por_agente ?? []).map((a) => ({
      agentId: a.agent_id,
      nombre: a.nombre,
      total: a.total,
    })),
  };
}