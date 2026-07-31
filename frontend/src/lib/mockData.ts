import type { DiagnosticoEnvio, DesgloseImpuestos, WizardFormData } from "./types";

// Tasas de arancel estimadas por categoría — solo para fines demostrativos del mock.
const categorias: { patron: RegExp; partida: string; tasaArancel: number }[] = [
  { patron: /(perfume|colonia|aerosol|encendedor|explosivo|arma)/, partida: "3303.00.00 (tentativa)", tasaArancel: 0.2 },
  { patron: /(bateria|batería|litio|power bank|celular|electronico|electrónica)/, partida: "8507.60.00 (tentativa)", tasaArancel: 0.15 },
  { patron: /(ropa|camiseta|textil|prenda)/, partida: "6109.10.00 (tentativa)", tasaArancel: 0.1 },
  { patron: /(documento|papel|carta)/, partida: "4901.99.00 (tentativa)", tasaArancel: 0 },
];

function calcularDesglose(valorUsd: number | undefined, tasaArancel: number): DesgloseImpuestos | null {
  if (!valorUsd || valorUsd <= 0) return null;
  const flete = Math.max(8, valorUsd * 0.08);
  const arancel = valorUsd * tasaArancel;
  return {
    flete: Number(flete.toFixed(2)),
    arancel: Number(arancel.toFixed(2)),
    total: Number((flete + arancel).toFixed(2)),
    tasaArancelAplicada: tasaArancel,
  };
}

/**
 * Motor de clasificación simulado (mock).
 * Reemplazar por una llamada real a `api.ts` -> backend -> Gemini
 * cuando el backend esté disponible. La forma del objeto devuelto
 * NO debe cambiar: es el contrato compartido con el backend.
 */
export function evaluarEnvioMock(data: WizardFormData): DiagnosticoEnvio {
  const texto = data.descripcionItem.toLowerCase();
  const categoria = categorias.find((c) => c.patron.test(texto));
  const partidaArancelariaTentativa =
    data.partidaArancelariaTentativa?.trim() || categoria?.partida || "8517.70.00 (tentativa — sin categoría clara)";
  const desgloseImpuestos = calcularDesglose(data.valorDeclaradoUsd, categoria?.tasaArancel ?? 0.12);

  const base = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    partidaArancelariaTentativa,
    desgloseImpuestos,
    input: { ...data },
  };

  if (/(perfume|colonia|aerosol|encendedor|explosivo|arma)/.test(texto)) {
    return {
      ...base,
      nivel: "rojo",
      titulo: "Envío bloqueado / prohibido",
      resumen: `Este ítem no puede transportarse por vía aérea hacia ${data.paisDestino}.`,
      justificacion:
        "Según la normativa IATA vigente sobre mercancías peligrosas (Dangerous Goods Regulations), los líquidos inflamables y aerosoles con alcohol por encima de cierto umbral no pueden transportarse en bodega de carga aérea comercial sin certificación especial de la aerolínea.",
      fuenteNormativa: "Normativa IATA — Sección de Mercancías Peligrosas",
      documentosRequeridos: [],
      accionesSugeridas: [
        "Modifica el envío retirando el ítem restringido.",
        "Consulta si existe una alternativa de transporte marítimo.",
      ],
    };
  }

  if (/(bateria|batería|litio|power bank|celular|electronico|electrónica)/.test(texto)) {
    return {
      ...base,
      nivel: "amarillo",
      titulo: "Requiere documentación adicional",
      resumen: "El envío es viable, pero necesitas presentar documentación específica antes de despacharlo.",
      justificacion:
        "Los dispositivos con baterías de litio requieren una ficha de seguridad (MSDS) y una declaración de mercancía peligrosa limitada, según el peso Watt-hora declarado del componente.",
      fuenteNormativa: "Normativa IATA — Baterías de Litio (Sección II)",
      documentosRequeridos: [
        "Ficha de seguridad del producto (MSDS)",
        "Declaración de batería de litio (Watt-hora)",
      ],
      accionesSugeridas: [
        "Adjunta la ficha de seguridad (MSDS) antes de despachar.",
        "Verifica el peso Watt-hora declarado por el fabricante.",
      ],
    };
  }

  return {
    ...base,
    nivel: "verde",
    titulo: "Apto para envío",
    resumen: `Tu envío cumple con la normativa de transporte aéreo hacia ${data.paisDestino}.`,
    justificacion:
      "El ítem descrito no figura en las listas de restricciones ni de mercancías peligrosas para transporte aéreo comercial. Se recomienda un empaque estándar acorde al valor declarado.",
    fuenteNormativa: "Normativa aduanera general — Sin restricciones aplicables",
    documentosRequeridos: [],
    accionesSugeridas: [
      "Conserva la factura comercial junto al paquete.",
      "Verifica que la partida arancelaria declarada coincida con el contenido real.",
    ],
  };
}

export const paisesDisponibles = [
  "🇺🇸 Estados Unidos",
  "🇲🇽 México",
  "🇨🇴 Colombia",
  "🇪🇸 España",
  "🇦🇷 Argentina",
  "🇨🇱 Chile",
  "🇧🇷 Brasil",
  "🇵🇪 Perú",
];

export const chipsSugeridos = ["Electrónica", "Cosméticos", "Baterías", "Ropa", "Documentos"];