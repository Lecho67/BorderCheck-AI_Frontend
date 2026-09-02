import { supabase } from "./supabase";
import type { KycStatus, Profile } from "@/types/database.types";

/**
 * Revisión de KYC para agentes/admin. Las dos operaciones pasan por RPCs
 * `SECURITY DEFINER` (`listar_kyc_pendientes` / `revisar_kyc`) que validan el
 * rol del llamador — no hay política RLS de UPDATE de agente sobre `profiles`,
 * así se evita abrir esa superficie. El trigger `prevent_self_privilege_escalation`
 * no interfiere porque el agente edita el perfil de otro usuario.
 */

export type RevisionKyc = Extract<KycStatus, "aprobado" | "rechazado">;

export async function fetchKycPendientes(): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("listar_kyc_pendientes");
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function revisarKyc(
  userId: string,
  estado: RevisionKyc,
  motivo?: string
): Promise<Profile> {
  const { data, error } = await supabase.rpc("revisar_kyc", {
    p_user_id: userId,
    p_estado: estado,
    p_motivo: motivo ?? null,
  });
  if (error) throw new Error(error.message);
  return data as Profile;
}
