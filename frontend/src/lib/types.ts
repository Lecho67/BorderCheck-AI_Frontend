export type NivelVeredicto = "verde" | "amarillo" | "rojo";

export interface DiagnosticoEnvio {
  id: string;
  nivel: NivelVeredicto;
  titulo: string;
  resumen: string;
  justificacion: string;
  fuenteNormativa: string;
  documentosRequeridos: string[];
  accionesSugeridas: string[];
  createdAt: string;
  input: {
    paisDestino: string;
    descripcionItem: string;
    pesoKg?: number;
    valorDeclaradoUsd?: number;
  };
}

export interface WizardFormData {
  paisDestino: string;
  descripcionItem: string;
  pesoKg?: number;
  valorDeclaradoUsd?: number;
}
