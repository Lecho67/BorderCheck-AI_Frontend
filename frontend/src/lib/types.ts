export type NivelVeredicto = "verde" | "amarillo" | "rojo";

export interface DesgloseImpuestos {
  flete: number;
  arancel: number;
  total: number;
  tasaArancelAplicada: number;
}

export interface DiagnosticoEnvio {
  id: string;
  nivel: NivelVeredicto;
  titulo: string;
  resumen: string;
  justificacion: string;
  fuenteNormativa: string;
  documentosRequeridos: string[];
  accionesSugeridas: string[];
  partidaArancelariaTentativa: string;
  desgloseImpuestos: DesgloseImpuestos | null;
  createdAt: string;
  input: {
    paisDestino: string;
    descripcionItem: string;
    pesoKg?: number;
    valorDeclaradoUsd?: number;
    partidaArancelariaTentativa?: string;
  };
}

export interface WizardFormData {
  paisDestino: string;
  descripcionItem: string;
  pesoKg?: number;
  valorDeclaradoUsd?: number;
  partidaArancelariaTentativa?: string;
}