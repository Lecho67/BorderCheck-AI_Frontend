import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PackageSearch,
  ScanSearch,
  ShieldCheck,
  Truck,
  Clock,
  BadgeDollarSign,
  Radar,
} from "lucide-react";
import { FaqItem } from "@/components/pitch/FaqItem";

const valores = [
  {
    numero: "01",
    titulo: "Elimina la incertidumbre",
    texto: "Evita que paquetes sean retenidos o destruidos en aduana por desconocer restricciones de transporte aéreo.",
  },
  {
    numero: "02",
    titulo: "IA con guardrails reales",
    texto: "El modelo consulta una base de reglas normativas antes de responder — cada diagnóstico cita su fuente legal.",
  },
  {
    numero: "03",
    titulo: "Arquitectura escalable",
    texto: "MVP web independiente de la futura visión por computadora (Fase 2), sin bloquear el desarrollo actual.",
  },
];

const pasos = [
  {
    icon: PackageSearch,
    titulo: "Registro del paquete",
    texto: "El operador logístico o el cliente final ingresa el destino y describe el contenido del envío.",
  },
  {
    icon: ScanSearch,
    titulo: "Validación aduanera con IA",
    texto: "El motor cruza la descripción contra la normativa IATA y aduanera vigente para el país de destino.",
  },
  {
    icon: ShieldCheck,
    titulo: "Diagnóstico clasificado",
    texto: "Se genera un veredicto Verde/Amarillo/Rojo con justificación legal y documentos requeridos.",
  },
  {
    icon: Truck,
    titulo: "Despacho final",
    texto: "El envío avanza a despacho ya validado, o se corrige antes de generar costos y demoras evitables.",
  },
];

const beneficios = [
  {
    icon: Clock,
    titulo: "Reduce tiempos en aduana",
    texto: "Detecta restricciones antes del despacho, evitando retenciones que hoy toman días en resolverse manualmente.",
  },
  {
    icon: BadgeDollarSign,
    titulo: "Elimina multas evitables",
    texto: "Menos devoluciones y decomisos por documentación faltante o ítems no declarados correctamente.",
  },
  {
    icon: Radar,
    titulo: "Rastreo y verificación en tiempo real",
    texto: "Cada consulta queda registrada con su diagnóstico, trazable en el historial de la operación.",
  },
];

const faqs = [
  {
    pregunta: "¿Cómo se integra BorderCheck AI con mi operación de paquetería o e-commerce actual?",
    respuesta:
      "A través de una API REST: envías el destino y la descripción del ítem, y recibes el diagnóstico clasificado. No requiere cambiar tu sistema de gestión de envíos, solo consumir el endpoint antes del despacho.",
  },
  {
    pregunta: "¿En qué se basa el motor de IA para clasificar un envío?",
    respuesta:
      "El modelo consulta una base de datos interna de restricciones (normativa IATA y aduanera) antes de responder. No genera respuestas libres: cada diagnóstico está anclado a una regla real y cita su fuente normativa.",
  },
  {
    pregunta: "¿Qué pasa si el motor no tiene información suficiente sobre un ítem?",
    respuesta:
      "El sistema está diseñado para no forzar un veredicto \"verde\" por defecto ante la duda. Si falta información, se marca para revisión manual en vez de arriesgar una clasificación incorrecta.",
  },
  {
    pregunta: "¿Cuándo estará disponible la auditoría visual por cámara?",
    respuesta:
      "Es parte de la Fase 2 del roadmap (visión por computadora con YOLO/Cloud Vision). El MVP actual ya deja el punto de integración preparado en el formulario de consulta.",
  },
];

export function Pitch() {
  return (
    <main>
      {/* Hero */}
      <header className="max-w-2xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-ai-accent text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-ai-accent"></span>
          Validación de IA aplicada a reglas de negocio críticas
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-5 leading-tight">
          Sabe si tu envío pasará la aduana, antes de despacharlo.
        </h1>
        <p className="text-lg text-slate-600 mb-9">
          BorderCheck AI analiza cualquier envío internacional y determina, en segundos, si puede
          transportarse por vía aérea — evitando retenciones, devoluciones o destrucciones en aduana.
        </p>
        <Link
          to="/consulta/nueva"
          className="inline-block bg-brand-blue text-white px-8 py-4 rounded-xl font-medium hover:bg-brand-blue-hover transition-colors"
        >
          Ver el proyecto en acción
        </Link>
        <p className="text-xs text-slate-400 mt-4">MVP funcional — Fase 1 del roadmap</p>

        <div className="flex justify-center gap-3 max-w-sm mx-auto mt-12">
          <div className="flex-1 py-3 rounded-xl bg-verdict-green-bg text-verdict-green-text text-xs font-medium flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Apto
          </div>
          <div className="flex-1 py-3 rounded-xl bg-verdict-amber-bg text-verdict-amber-text text-xs font-medium flex flex-col items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Advertencia
          </div>
          <div className="flex-1 py-3 rounded-xl bg-verdict-red-bg text-verdict-red-text text-xs font-medium flex flex-col items-center gap-1">
            <XCircle className="w-4 h-4" /> Bloqueado
          </div>
        </div>
      </header>

      {/* Diferenciadores */}
      <section className="max-w-4xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-5">
        {valores.map((v) => (
          <div key={v.numero} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm mb-4">
              {v.numero}
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{v.titulo}</h3>
            <p className="text-sm text-slate-600">{v.texto}</p>
          </div>
        ))}
      </section>

      {/* Cómo funciona */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2 text-center">
            Cómo funciona
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center mb-4">
            De la recepción del paquete al despacho, sin sorpresas en aduana
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-14">
            Un flujo diseñado para integrarse antes del despacho — no reemplaza tu operación logística,
            la protege.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pasos.map((paso, i) => {
              const Icon = paso.icon;
              return (
                <div key={paso.titulo} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {i + 1}
                    </div>
                    <Icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">{paso.titulo}</h3>
                  <p className="text-sm text-slate-600">{paso.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beneficios / Casos de uso */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2 text-center">
          Beneficios para paquetería y e-commerce
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center mb-4">
          Pensado para operaciones logísticas reales
        </h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-14">
          Ya sea un casillero virtual, una tienda de e-commerce transfronterizo o un operador de envíos,
          el impacto se mide en tiempo y dinero.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {beneficios.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.titulo} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-ai-accent flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{b.titulo}</h3>
                <p className="text-sm text-slate-600">{b.texto}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cita / posicionamiento */}
      <section className="bg-white border-y border-slate-200 py-14 text-center">
        <p className="text-xl italic text-slate-600 max-w-xl mx-auto px-6">
          "No es una app de ocio — resuelve un problema real de dinero y legalidad en la logística
          internacional."
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2 text-center">
          Preguntas frecuentes
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center mb-12">
          Dudas comunes sobre la integración y el motor de IA
        </h2>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.pregunta} pregunta={faq.pregunta} respuesta={faq.respuesta} />
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section id="cta" className="text-center py-24 px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-8">
          ¿Listos para ver el diagnóstico en vivo?
        </h2>
        <Link
          to="/consulta/nueva"
          className="inline-block bg-brand-blue text-white px-8 py-4 rounded-xl font-medium hover:bg-brand-blue-hover transition-colors"
        >
          Solicitar una demo
        </Link>
      </section>
    </main>
  );
}