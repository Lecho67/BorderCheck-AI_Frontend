import { Package, Sparkles, FileUp, FileCheck2, RefreshCw } from "lucide-react";
import type { CasoEnCola } from "@/lib/agentService";
import type { DocumentRecord } from "@/types/database.types";
import { dotVerdictoClasses, badgeVerdictoClasses } from "@/lib/verdictBadge";

interface Props {
  caso: CasoEnCola;
  docs?: DocumentRecord[];
}

type TipoHito =
  | "consulta"
  | "veredicto_ia"
  | "documento_cargado"
  | "documento_revisado"
  | "override";

interface Hito {
  id: string;
  tipo: TipoHito;
  fecha: string;
  titulo: string;
  detalle?: string;
  veredicto?: string;
}

const ICONS: Record<TipoHito, typeof Package> = {
  consulta: Package,
  veredicto_ia: Sparkles,
  documento_cargado: FileUp,
  documento_revisado: FileCheck2,
  override: RefreshCw,
};

const ICON_BG: Record<TipoHito, string> = {
  consulta: "bg-brand-blue",
  veredicto_ia: "bg-brand-blue",
  documento_cargado: "bg-slate-400",
  documento_revisado: "bg-slate-400",
  override: "bg-orange-500",
};

function construirHitos(caso: CasoEnCola, docs: DocumentRecord[]): Hito[] {
  const hitos: Hito[] = [];

  // 1. Consulta iniciada
  hitos.push({
    id: `consulta-${caso.id}`,
    tipo: "consulta",
    fecha: caso.created_at,
    titulo: "Consulta iniciada",
    detalle: caso.product_description,
  });

  // 2. Veredicto inicial de la IA (el veredicto "original" si hubo override, si no el actual)
  const veredictoInicial = caso.original_ai_verdict ?? caso.ai_verdict;
  hitos.push({
    id: `veredicto-ia-${caso.id}`,
    tipo: "veredicto_ia",
    fecha: caso.created_at,
    titulo: "Veredicto inicial de la IA",
    veredicto: veredictoInicial,
  });

  // 3. Documentos cargados por el cliente
  docs.forEach((doc) => {
    hitos.push({
      id: `doc-cargado-${doc.id}`,
      tipo: "documento_cargado",
      fecha: doc.created_at,
      titulo: "Documento cargado",
      detalle: doc.file_name,
    });

    // 4. Documento aprobado/rechazado por un agente
    if (doc.reviewed_at) {
      hitos.push({
        id: `doc-revisado-${doc.id}`,
        tipo: "documento_revisado",
        fecha: doc.reviewed_at,
        titulo: doc.status === "aprobado" ? "Documento aprobado por agente" : "Documento rechazado por agente",
        detalle: doc.file_name + (doc.review_reason ? ` — ${doc.review_reason}` : ""),
      });
    }
  });

  // 5. Override / confirmación del veredicto por un agente humano
  if (caso.overridden_at) {
    const huboCambio = caso.original_ai_verdict != null && caso.original_ai_verdict !== caso.ai_verdict;
    hitos.push({
      id: `override-${caso.id}`,
      tipo: "override",
      fecha: caso.overridden_at,
      titulo: huboCambio ? "Veredicto sobreescrito por agente" : "Veredicto confirmado por agente",
      detalle: caso.override_reason ?? undefined,
      veredicto: caso.ai_verdict,
    });
  }

  return hitos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
}

export function ShipmentTimeline({ caso, docs = [] }: Props) {
  const hitos = construirHitos(caso, docs);

  if (hitos.length === 0) {
    return <p className="text-sm text-slate-400">Sin eventos registrados para este caso.</p>;
  }

  return (
    <ol className="relative border-l border-slate-200 pl-6">
      {hitos.map((hito) => {
        const Icon = ICONS[hito.tipo];
        return (
          <li key={hito.id} className="mb-6 last:mb-0">
            <span
              className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ${ICON_BG[hito.tipo]} ring-4 ring-white`}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-800">{hito.titulo}</p>
              {hito.veredicto && (
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeVerdictoClasses(hito.veredicto)}`}>
                  {hito.veredicto}
                </span>
              )}
              <span className={`h-1.5 w-1.5 rounded-full ${hito.veredicto ? dotVerdictoClasses(hito.veredicto) : "hidden"}`} />
            </div>

            {hito.detalle && <p className="mt-0.5 text-xs text-slate-500">{hito.detalle}</p>}

            <time className="mt-0.5 block text-xs text-slate-400">
              {new Date(hito.fecha).toLocaleString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </li>
        );
      })}
    </ol>
  );
}