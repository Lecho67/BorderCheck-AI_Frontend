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
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Gestor asignado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  <p className="font-medium">{u.full_name || "(sin nombre)"}</p>
                  <p className="text-slate-500 text-xs">{u.email}</p>
                </td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={guardandoId === u.id}
                    onChange={(e) => solicitarCambioRol(u, e.target.value as Profile["role"])}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  {u.role === "cliente" ? (
                    <select
                      value={u.gestor_id ?? ""}
                      disabled={guardandoId === u.id}
                      onChange={(e) => solicitarCambioGestor(u, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Sin asignar</option>
                      {gestores.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.full_name || g.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-400 text-xs">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación */}
      {accionPendiente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="font-semibold text-lg mb-3">Confirmar cambio</h2>

            {accionPendiente.tipo === "rol" ? (
              <p className="text-sm text-slate-700 mb-5">
                Vas a cambiar el rol de <span className="font-medium">{accionPendiente.nombre}</span>{" "}
                de <span className="font-medium">{accionPendiente.rolAnterior}</span> a{" "}
                <span className="font-medium">{accionPendiente.rolNuevo}</span>.
                {accionPendiente.rolNuevo === "admin" && (
                  <span className="mt-2 flex items-start gap-1.5 text-orange-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Le darás control total del sistema (usuarios, roles, todos los datos).
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-700 mb-5">
                Vas a cambiar el gestor de <span className="font-medium">{accionPendiente.nombre}</span>{" "}
                de <span className="font-medium">{accionPendiente.gestorAnteriorNombre}</span> a{" "}
                <span className="font-medium">{accionPendiente.gestorNuevoNombre}</span>.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAccionPendiente(null)}
                className="text-sm text-slate-500 px-3 py-1.5"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={guardandoId !== null}
                className="text-sm bg-brand-blue text-white px-4 py-1.5 rounded"
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