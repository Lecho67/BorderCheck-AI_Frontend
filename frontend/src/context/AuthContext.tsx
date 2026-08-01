import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  lockerCode: string; // ej. "CL-89421"
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "bordercheck_session";

function generateLockerCode(): string {
  const num = Math.floor(10000 + Math.random() * 89999);
  return `CL-${num}`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  function persist(u: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  // --- Simulación de red. Reemplazar por llamadas a Supabase/Clerk/API real ---
  async function login(email: string, _password: string) {
    await new Promise((r) => setTimeout(r, 500));
    const mockUser: User = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      avatarInitials: getInitials(email.split("@")[0]),
      lockerCode: generateLockerCode(),
    };
    persist(mockUser);
  }

  async function loginWithGoogle() {
    await new Promise((r) => setTimeout(r, 500));
    const mockUser: User = {
      id: crypto.randomUUID(),
      name: "Usuario Google",
      email: "usuario@gmail.com",
      avatarInitials: "UG",
      lockerCode: generateLockerCode(),
    };
    persist(mockUser);
  }

  async function register(name: string, email: string, _password: string) {
    await new Promise((r) => setTimeout(r, 500));
    const mockUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      avatarInitials: getInitials(name),
      lockerCode: generateLockerCode(),
    };
    persist(mockUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}