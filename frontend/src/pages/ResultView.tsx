import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import { VerdictCard } from "@/components/verdict/VerdictCard";
import { JustificationCard } from "@/components/verdict/JustificationCard";
import { DocumentChecklist } from "@/components/verdict/DocumentChecklist";
import { TaxBreakdownCard } from "@/components/verdict/TaxBreakdownCard";
import { Button } from "@/components/ui/Button";
import { useQueryStore } from "@/store/useQueryStore";

export function ResultView() {
  const { id } = useParams<{ id: string }>();
  const diagnostico = useQueryStore((s) => s.getConsultaById(id ?? ""));

  if (!diagnostico) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="text-slate-500 mb-4">No encontramos esa consulta.</p>
        <Link to="/consulta/nueva" className="text-brand-blue font-medium">
          Hacer una nueva consulta →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <VerdictCard diagnostico={diagnostico} />

      <div className="grid sm:grid-cols-2 gap-4 my-6">
        <JustificationCard
          justificacion={diagnostico.justificacion}
          fuenteNormativa={diagnostico.fuenteNormativa}
        />
        <DocumentChecklist documentos={diagnostico.documentosRequeridos} nivel={diagnostico.nivel} />
      </div>

      <div className="mb-6">
        <TaxBreakdownCard
          desglose={diagnostico.desgloseImpuestos}
          partidaArancelariaTentativa={diagnostico.partidaArancelariaTentativa}
        />
      </div>

      {diagnostico.accionesSugeridas.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">
            📋 Recomendaciones de cumplimiento aduanero
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {diagnostico.accionesSugeridas.map((a, i) => (
              <li key={i}>— {a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Guardado en tu historial
        </span>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Download className="w-4 h-4 inline mr-1" /> Exportar PDF
          </Button>
          <Link to="/dashboard/historial">
            <Button variant="secondary">Ver historial</Button>
          </Link>
          <Link to="/consulta/nueva">
            <Button>Nueva consulta</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}