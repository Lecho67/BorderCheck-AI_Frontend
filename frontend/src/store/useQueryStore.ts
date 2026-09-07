import { create } from "zustand";
import type { DiagnosticoEnvio } from "@/lib/types";

interface QueryState {
  /** Cache en memoria de los diagnósticos vistos en esta sesión.
   *  El historial persistente vive en `customs_queries` (ver
   *  `queryHistoryService`); esto solo evita un fetch al volver a
   *  `/consulta/:id` justo después de crear la consulta. */
  consultas: DiagnosticoEnvio[];
  addConsulta: (consulta: DiagnosticoEnvio) => void;
  getConsultaById: (id: string) => DiagnosticoEnvio | undefined;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  consultas: [],
  addConsulta: (consulta) =>
    set((state) => ({ consultas: [consulta, ...state.consultas] })),
  getConsultaById: (id) => get().consultas.find((c) => c.id === id),
}));
