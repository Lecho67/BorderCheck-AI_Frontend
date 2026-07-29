import { create } from "zustand";
import type { DiagnosticoEnvio, WizardFormData } from "@/lib/types";

interface QueryState {
  wizardStep: number;
  wizardData: Partial<WizardFormData>;
  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardFormData>) => void;
  resetWizard: () => void;

  consultas: DiagnosticoEnvio[];
  addConsulta: (consulta: DiagnosticoEnvio) => void;
  getConsultaById: (id: string) => DiagnosticoEnvio | undefined;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  wizardStep: 0,
  wizardData: {},
  setWizardStep: (step) => set({ wizardStep: step }),
  updateWizardData: (data) =>
    set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  resetWizard: () => set({ wizardStep: 0, wizardData: {} }),

  consultas: [],
  addConsulta: (consulta) =>
    set((state) => ({ consultas: [consulta, ...state.consultas] })),
  getConsultaById: (id) => get().consultas.find((c) => c.id === id),
}));
