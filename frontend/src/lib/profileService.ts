import { supabase } from "./supabase";
import type { NotificationPreferences, Profile } from "@/types/database.types";

export interface DatosInformacionPersonal {
  full_name: string;
  phone: string;
}

export interface DatosDireccion {
  address_street: string;
  address_city: string;
  address_department: string;
  address_postal_code: string;
  address_country: string;
}

export async function actualizarInformacionPersonal(
  userId: string,
  datos: DatosInformacionPersonal
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: datos.full_name.trim(),
      phone: datos.phone.trim(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function actualizarDireccion(userId: string, direccion: DatosDireccion): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      address_street: direccion.address_street.trim(),
      address_city: direccion.address_city.trim(),
      address_department: direccion.address_department.trim(),
      address_postal_code: direccion.address_postal_code.trim(),
      address_country: direccion.address_country.trim(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function actualizarPreferenciasNotificaciones(
  userId: string,
  preferencias: NotificationPreferences
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ notification_preferences: preferencias })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function solicitarCambioContrasena(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/restablecer-contrasena`,
  });
  if (error) throw new Error(error.message);
}