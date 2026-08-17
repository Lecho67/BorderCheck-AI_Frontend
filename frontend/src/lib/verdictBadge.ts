/**
 * Paleta semántica compartida para los veredictos de `customs_queries.ai_verdict`
 * (APROBADO / BLOQUEO / PRECAUCION / REQUIERE_DOCUMENTACION). Se usa en la
 * cola de revisión (`AgentPanel.tsx`) y en la línea de tiempo del caso
 * (`ShipmentTimeline.tsx`), para que un veredicto se vea siempre igual.
 */
export function badgeVerdictoClasses(v: string): string {
  switch (v) {
    case "PRECAUCION":
      return "bg-amber-100 text-amber-800";
    case "REQUIERE_DOCUMENTACION":
      return "bg-orange-100 text-orange-800";
    case "BLOQUEO":
      return "bg-red-100 text-red-700";
    case "APROBADO":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

/** Variante de fondo sólido, para los puntos de la línea de tiempo. */
export function dotVerdictoClasses(v: string): string {
  switch (v) {
    case "PRECAUCION":
      return "bg-amber-500";
    case "REQUIERE_DOCUMENTACION":
      return "bg-orange-500";
    case "BLOQUEO":
      return "bg-red-500";
    case "APROBADO":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
}