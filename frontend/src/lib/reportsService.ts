import { supabase } from "./supabase";

export interface PuntoVolumenMensual {
  mes: string; // "2026-03"
  mesLabel: string; // "mar 2026"
  aprobados: number;
  retenidos: number;
}

const MESES_A_MOSTRAR = 6;

/**
 * Volumen de envíos por mes, Aprobados vs. Retenidos (todo lo que no sea
 * APROBADO: PRECAUCION, REQUIERE_DOCUMENTACION, BLOQUEO). Si se pasa
 * `userIds`, se filtra a las consultas de esos clientes (cartera de un
 * gestor); si no, es el agregado global (uso pensado para admin).
 *
 * `userIds` es un array (no un solo id) porque un gestor no tiene
 * `customs_queries` propias — las de su cartera son las de sus clientes.
 */
export async function fetchVolumenMensual(userIds?: string[]): Promise<PuntoVolumenMensual[]> {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - (MESES_A_MOSTRAR - 1));
  desde.setDate(1);
  desde.setHours(0, 0, 0, 0);

  let query = supabase
    .from("customs_queries")
    .select("ai_verdict, created_at")
    .gte("created_at", desde.toISOString());

  if (userIds) query = query.in("user_id", userIds);

  const { data, error } = userIds && userIds.length === 0 ? { data: [], error: null } : await query;
  if (error) throw new Error(error.message);

  const buckets = new Map<string, { aprobados: number; retenidos: number }>();
  for (let i = 0; i < MESES_A_MOSTRAR; i++) {
    const fecha = new Date(desde);
    fecha.setMonth(fecha.getMonth() + i);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { aprobados: 0, retenidos: 0 });
  }

  (data ?? []).forEach((row) => {
    const fecha = new Date(row.created_at);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) return;
    if (row.ai_verdict === "APROBADO") bucket.aprobados += 1;
    else bucket.retenidos += 1;
  });

  return Array.from(buckets.entries()).map(([mes, valores]) => {
    const [anio, mesNum] = mes.split("-").map(Number);
    const fecha = new Date(anio, mesNum - 1, 1);
    return {
      mes,
      mesLabel: fecha.toLocaleDateString("es-CO", { month: "short", year: "numeric" }),
      ...valores,
    };
  });
}