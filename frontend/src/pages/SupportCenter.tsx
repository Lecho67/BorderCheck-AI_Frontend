import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { FAQ_ITEMS, CATEGORIAS, type FaqItem } from "@/lib/faqData";
import { AiSupportChat } from "@/components/support/AiSupportChat";

export function SupportCenter() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);

  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (categoriaActiva !== "todas" && item.categoria !== categoriaActiva) return false;
      if (!texto) return true;
      return item.pregunta.toLowerCase().includes(texto) || item.respuesta.toLowerCase().includes(texto);
    });
  }, [busqueda, categoriaActiva]);

  const agrupados = useMemo(() => {
    const grupos = new Map<string, FaqItem[]>();
    resultados.forEach((item) => {
      const lista = grupos.get(item.categoria) ?? [];
      lista.push(item);
      grupos.set(item.categoria, lista);
    });
    return grupos;
  }, [resultados]);

  return (
    <div className="max-w-3xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Centro de Ayuda</h1>
      <p className="text-slate-600 mb-6">
        Buscá respuestas sobre aduanas, tu casillero y el pago de tributos. Si no encontrás lo que
        necesitás, abrí el asistente en la esquina inferior derecha.
      </p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscá una pregunta, por ejemplo: 'tiempos de liberación'"
          className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoriaActiva("todas")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            categoriaActiva === "todas" ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoriaActiva === cat ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {resultados.length === 0 ? (
        <div className="border rounded-xl p-6 bg-slate-50 text-sm text-slate-500 text-center">
          No encontramos preguntas para "{busqueda}". Probá con otros términos o consultá al asistente.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(agrupados.entries()).map(([categoria, items]) => (
            <section key={categoria}>
              <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-3">
                {categoria}
              </h2>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {items.map((item) => {
                  const abierto = abiertoId === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setAbiertoId(abierto ? null : item.id)}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left"
                      >
                        <span className="text-sm font-medium text-slate-800">{item.pregunta}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                        />
                      </button>
                      {abierto && (
                        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{item.respuesta}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <AiSupportChat />
    </div>
  );
}