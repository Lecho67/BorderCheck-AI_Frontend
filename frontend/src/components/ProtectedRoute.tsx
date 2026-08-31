import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "@/types/database.types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const RUTA_POR_DEFECTO: Record<UserRole, string> = {
  cliente: "/dashboard",
  gestor: "/gestor",
  agente: "/panel-agente",
  admin: "/admin",
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    const destino = profile ? RUTA_POR_DEFECTO[profile.role] : "/login";
    return <Navigate to={destino} replace />;
  }

  return <>{children}</>;
}