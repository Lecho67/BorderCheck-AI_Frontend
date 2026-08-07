import { supabase } from "./supabase";
import type { DocumentRecord, Profile } from "@/types/database.types";

export interface DocumentoConCliente extends DocumentRecord {
  cliente?: Profile;
}

export async function fetchDocumentosPendientes(): Promise<DocumentoConCliente[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*, cliente:profiles!documents_user_id_fkey(*)")
    .eq("status", "pendiente")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as DocumentoConCliente[];
}

export async function revisarDocumento(
  docId: string,
  nuevoStatus: "aprobado" | "rechazado",
  motivo: string,
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const reviewerId = sessionData.session?.user.id;

  const { data, error } = await supabase
    .from("documents")
    .update({
      status: nuevoStatus,
      reviewed_by: reviewerId,
      review_reason: motivo,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", docId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerUrlDocumentoParaRevision(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60 * 5);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
export async function tomarDocumento(docId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const agenteId = sessionData.session?.user.id;

  const { data, error } = await supabase
    .from("documents")
    .update({ assigned_agent_id: agenteId })
    .eq("id", docId)
    .is("assigned_agent_id", null)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Este documento ya fue tomado por otro agente");
  return data;
}