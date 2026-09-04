// src/context/AuthContext.tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import type { Profile } from '../types/database.types';
import { AuthContext } from './auth';

// El objeto de contexto y el hook `useAuth` viven fuera de este archivo
// (`./auth` y `@/hooks/useAuth`) para no romper su fast-refresh.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Cada llamada a fetchProfile toma un id; si llega una más nueva (login/logout
  // rápido), las respuestas viejas se descartan para no pisar el estado actual.
  const requestIdRef = useRef(0);

  const fetchProfile = useCallback(async (userId: string, intentos = 3) => {
    const reqId = ++requestIdRef.current;

    for (let intento = 1; intento <= intentos; intento++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (reqId !== requestIdRef.current) return; // respuesta obsoleta

      if (!error) {
        setProfile(data as Profile);
        setProfileError(null);
        return;
      }

      // PGRST116 = 0 filas: es un estado real, no un fallo transitorio
      if (error.code === 'PGRST116') {
        setProfile(null);
        setProfileError(error.message);
        return;
      }

      if (intento < intentos) {
        await new Promise((r) => setTimeout(r, 500 * intento));
        continue;
      }

      console.error('Error al cargar perfil:', error.message);
      setProfileError(error.message);
      toast.error(
        'No pudimos cargar tu perfil',
        'Revisá tu conexión y reintentá; no cerramos tu sesión.'
      );
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        requestIdRef.current++; // descarta cualquier fetchProfile en vuelo
        setProfile(null);
        setProfileError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Realtime: refleja en vivo los cambios sobre el propio perfil del usuario
  // (aprobación/rechazo de KYC, cambio de rol, asignación de gestor) sin recargar.
  // Requiere que la tabla `profiles` esté en la publicación `supabase_realtime`.
  // Si Realtime no está habilitado, simplemente no dispara (degradación limpia).
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`perfil:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => {
          fetchProfile(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProfile]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? '' } },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Redirige a Google y vuelve a /dashboard; la sesión la recoge
  // automáticamente el listener de arriba (detectSessionInUrl en supabase.ts).
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileError,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}