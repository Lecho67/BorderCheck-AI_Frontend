import { useAuth } from "@/context/AuthContext";
import { MetricsOverview } from "@/components/admin/MetricsOverview";
import { AdminUserTable } from "@/components/admin/AdminUserTable";

export function AdminPanel() {
  const { profile } = useAuth();

  return (
    <div className="max-w-5xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
      <p className="text-gray-600 mb-6">
        Bienvenido, {profile?.full_name || profile?.email}.
      </p>

      <MetricsOverview />

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Usuarios</h2>
      <AdminUserTable />
    </div>
  );
}