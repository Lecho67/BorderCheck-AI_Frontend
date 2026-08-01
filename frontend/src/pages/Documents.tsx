import { useState } from "react";
import { DocumentCard, DocumentItem } from "../components/DocumentCard";
import { Chip } from "@/components/ui/Chip";

const MOCK_DOCS: DocumentItem[] = [
  {
    id: "1",
    name: "Factura Comercial - Pedido #4521",
    type: "Factura Comercial",
    shipment: "Envío #BC-1029",
    status: "aprobado",
    date: "2026-07-20",
  },
  {
    id: "2",
    name: "Certificado de Origen - TLC",
    type: "Certificado de Origen",
    shipment: "Envío #BC-1029",
    status: "revision",
    date: "2026-07-21",
  },
  {
    id: "3",
    name: "Registro de Importación",
    type: "Registro de Importación",
    shipment: "Envío #BC-0998",
    status: "aprobado",
    date: "2026-07-15",
  },
];

type FilterType = "todos" | "aprobado" | "revision";

export default function Documents() {
  const [filter, setFilter] = useState<FilterType>("todos");

  const filtered = MOCK_DOCS.filter((d) =>
    filter === "todos" ? true : d.status === filter
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Centro de Documentación Aduanera
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organiza facturas, certificados de origen y registros de
          importación por envío.
        </p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "todos", label: "Todos" },
            { key: "aprobado", label: "Aprobado por IA" },
            { key: "revision", label: "Requiere revisión" },
          ] as { key: FilterType; label: string }[]
        ).map((f) => (
          <Chip key={f.key} label={f.label} active={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-sm">
          No hay documentos en esta categoría.
        </div>
      )}
    </div>
  );
}