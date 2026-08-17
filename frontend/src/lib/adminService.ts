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

/**
 * Métricas globales para /admin. Se calculan client-side sobre
 * `customs_queries` (sin RPC/vista propia todavía) — para volúmenes grandes
 * conviene mover esto a una vista de Postgres o a un RPC agregado.
 */
export async function fetchMetricasGlobales(): Promise<MetricasGlobales> {
  const [{ data: consultas, error: errConsultas }, { data: agentes, error: errAgentes }] =
    await Promise.all([
      supabase.from("customs_queries").select("id, ai_verdict, overridden_by"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "agente"),
    ]);

  if (errConsultas) throw new Error(errConsultas.message);
  if (errAgentes) throw new Error(errAgentes.message);

  const totalConsultas = consultas?.length ?? 0;
  const aprobados = consultas?.filter((c) => c.ai_verdict === "APROBADO").length ?? 0;
  const bloqueados = consultas?.filter((c) => c.ai_verdict === "BLOQUEO").length ?? 0;

  const nombrePorId = new Map((agentes ?? []).map((a) => [a.id, a.full_name || a.email]));

  const conteoPorAgente = new Map<string, number>();
  (consultas ?? []).forEach((c) => {
    if (c.overridden_by) {
      conteoPorAgente.set(c.overridden_by, (conteoPorAgente.get(c.overridden_by) ?? 0) + 1);
    }
  });

  const casosPorAgente = Array.from(conteoPorAgente.entries())
    .map(([agentId, total]) => ({
      agentId,
      nombre: nombrePorId.get(agentId) ?? "Agente desconocido",
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalConsultas,
    aprobados,
    bloqueados,
    porcentajeAprobados: totalConsultas ? Math.round((aprobados / totalConsultas) * 100) : 0,
    porcentajeBloqueados: totalConsultas ? Math.round((bloqueados / totalConsultas) * 100) : 0,
    casosPorAgente,
  };
}