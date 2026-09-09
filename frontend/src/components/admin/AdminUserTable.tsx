import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { fetchTodosLosUsuarios, actualizarRol, asignarGestor } from "@/lib/adminService";
import type { Profile, UserRole } from "@/types/database.types";
import { toast } from "@/lib/toast";

const ROLES: UserRole[] = ["cliente", "gestor", "agente", "admin"];

type AccionPendiente =
  | { tipo: "rol"; userId: string; nombre: string; rolAnterior: Profile["role"]; rolNuevo: Profile["role"] }
  | {
      tipo: "gestor";
      userId: string;
      nombre: string;
      gestorAnteriorNombre: string;
      gestorNuevoId: string;
      gestorNuevoNombre: string;
    };

export function AdminUserTable() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await fetchTodosLosUsuarios();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const gestores = usuarios.filter((u) => u.role === "gestor");

  // --- Paso 1: el usuario elige un cambio en el <select>, no se aplica todavía ---

  const solicitarCambioRol = (u: Profile, nuevoRol: Profile["role"]) => {
    if (nuevoRol === u.role) return;
    setAccionPendiente({
      tipo: "rol",
      userId: u.id,
      nombre: u.full_name || u.email,
      rolAnterior: u.role,
      rolNuevo: nuevoRol,
    });
  };

  const solicitarCambioGestor = (u: Profile, nuevoGestorId: string) => {
    if ((u.gestor_id ?? "") === nuevoGestorId) return;
    const gestorAnterior = gestores.find((g) => g.id === u.gestor_id);
    const gestorNuevo = gestores.find((g) => g.id === nuevoGestorId);
    setAccionPendiente({
      tipo: "gestor",
      userId: u.id,
      nombre: u.full_name || u.email,
      gestorAnteriorNombre: gestorAnterior ? gestorAnterior.full_name || gestorAnterior.email : "Sin asignar",
      gestorNuevoId: nuevoGestorId,
      gestorNuevoNombre: gestorNuevo ? gestorNuevo.full_name || gestorNuevo.email : "Sin asignar",
    });
  };

  // --- Paso 2: solo al confirmar en el modal se aplica el cambio real ---

  const confirmarAccion = async () => {
    if (!accionPendiente) return;
    setGuardandoId(accionPendiente.userId);
    setError(null);
    try {
      if (accionPendiente.tipo === "rol") {
        await actualizarRol(accionPendiente.userId, accionPendiente.rolNuevo);
        setUsuarios((prev) =>
          prev.map((u) => (u.id === accionPendiente.userId ? { ...u, role: accionPendiente.rolNuevo } : u)),
        );
        toast.success(
          "Rol actualizado",
          `${accionPendiente.nombre} ahora tiene el rol ${accionPendiente.rolNuevo}.`
        );
      } else {
        const valor = accionPendiente.gestorNuevoId === "" ? null : accionPendiente.gestorNuevoId;
        await asignarGestor(accionPendiente.userId, valor);
        setUsuarios((prev) =>
          prev.map((u) => (u.id === accionPendiente.userId ? { ...u, gestor_id: valor } : u)),
        );
        toast.success(
          "Gestor asignado",
          `${accionPendiente.nombre} ahora tiene como gestor a ${accionPendiente.gestorNuevoNombre}.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al aplicar el cambio";
      setError(msg);
      toast.error("No se pudo aplicar el cambio", msg);
    } finally {
      setGuardandoId(null);
      setAccionPendiente(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Cargando usuarios...</p>;
  }

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt disabled:opacity-50";

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Gestor asignado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{u.full_name || "(sin nombre)"}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={guardandoId === u.id}
                    onChange={(e) => solicitarCambioRol(u, e.target.value as Profile["role"])}
                    className={selectClass}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {u.role === "cliente" ? (
                    <select
                      value={u.gestor_id ?? ""}
                      disabled={guardandoId === u.id}
                      onChange={(e) => solicitarCambioGestor(u, e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Sin asignar</option>
                      {gestores.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.full_name || g.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación */}
      {accionPendiente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Confirmar cambio</h2>

            {accionPendiente.tipo === "rol" ? (
              <p className="mb-5 text-sm text-slate-600">
                Vas a cambiar el rol de <span className="font-medium text-slate-900">{accionPendiente.nombre}</span>{" "}
                de <span className="font-medium text-slate-900">{accionPendiente.rolAnterior}</span> a{" "}
                <span className="font-medium text-slate-900">{accionPendiente.rolNuevo}</span>.
                {accionPendiente.rolNuevo === "admin" && (
                  <span className="mt-2 flex items-start gap-1.5 text-orange-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Le darás control total del sistema (usuarios, roles, todos los datos).
                  </span>
                )}
              </p>
            ) : (
              <p className="mb-5 text-sm text-slate-600">
                Vas a cambiar el gestor de <span className="font-medium text-slate-900">{accionPendiente.nombre}</span>{" "}
                de <span className="font-medium text-slate-900">{accionPendiente.gestorAnteriorNombre}</span> a{" "}
                <span className="font-medium text-slate-900">{accionPendiente.gestorNuevoNombre}</span>.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAccionPendiente(null)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={guardandoId !== null}
                className="rounded-lg bg-cobalt px-4 py-1.5 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
              >
                {guardandoId ? "Aplicando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}