import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Mensaje {
  id: string;
  autor: "bot" | "user";
  texto: string;
}

const SUGERENCIAS = [
  "¿Qué productos están restringidos?",
  "¿Cuánto tarda la liberación en aduana?",
  "¿Cómo se calculan los tributos?",
];

const MENSAJE_BIENVENIDA: Mensaje = {
  id: "bienvenida",
  autor: "bot",
  texto:
    "Hola 👋 Soy el asistente de BorderCheck AI. Puedo orientarte sobre restricciones de envío, tiempos de liberación y tributos. Doy información general — para un dictamen oficial de tu envío usá 'Nueva consulta'.",
};

const RESPUESTAS_SIMULADAS: { keywords: string[]; respuesta: string }[] = [
  {
    keywords: ["restriccion", "restringid", "prohibid", "no puedo enviar", "que no puedo importar"],
    respuesta:
      "Los principales productos restringidos son: armas y municiones, sustancias controladas, medicamentos sin registro INVIMA, baterías de litio sueltas y productos de origen animal o vegetal sin permiso del ICA. Para tu producto puntual, usá 'Nueva consulta' para una evaluación oficial.",
  },
  {
    keywords: ["tiempo de liberacion", "cuanto tarda", "liberacion", "libera", "cuanto demora"],
    respuesta:
      "Un envío sin observaciones (veredicto Aprobado) suele liberarse en 1 a 3 días hábiles tras llegar a aduana. Si queda en 'Precaución' el tiempo depende de qué tan rápido entregues los documentos solicitados; en 'Bloqueo' no hay liberación hasta resolver la causa con un agente.",
  },
  {
    keywords: ["arancel", "impuesto", "tributo", "cuanto pago", "cuanto debo pagar"],
    respuesta:
      "Los tributos se calculan sobre el valor CIF (costo + seguro + flete) según la partida arancelaria de tu producto, más IVA si aplica. Podés ver el desglose estimado en el resultado de cada consulta.",
  },
  {
    keywords: ["casillero", "direccion en estados unidos", "consolidar"],
    respuesta:
      "Tu casillero es una dirección física asignada para tus compras en el exterior; al llegar el paquete, lo consolidamos y enviamos a tu país. Revisá el estado de tus paquetes en la sección Casillero de tu panel.",
  },
  {
    keywords: ["documento", "factura", "permiso", "que necesito"],
    respuesta:
      "Los documentos más comunes son: factura comercial, packing list y, según el producto, permisos específicos (INVIMA, ICA, etc.). El wizard de 'Nueva consulta' te indica exactamente qué documentos necesitás para tu envío puntual.",
  },
];

const RESPUESTA_FALLBACK =
  "No tengo una respuesta exacta para eso todavía. Revisá las preguntas frecuentes de esta página o iniciá una 'Nueva consulta' para una evaluación oficial. Si tu caso ya está en revisión, un agente humano te va a contactar.";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generarRespuesta(pregunta: string): string {
  const texto = normalizar(pregunta);
  const match = RESPUESTAS_SIMULADAS.find((r) => r.keywords.some((k) => texto.includes(k)));
  return match ? match.respuesta : RESPUESTA_FALLBACK;
}

export function AiSupportChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_BIENVENIDA]);
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, pensando]);

  const enviarPregunta = (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || pensando) return;

    setMensajes((prev) => [...prev, { id: `${Date.now()}-user`, autor: "user", texto: limpio }]);
    setInput("");
    setPensando(true);

    window.setTimeout(() => {
      setMensajes((prev) => [
        ...prev,
        { id: `${Date.now()}-bot`, autor: "bot", texto: generarRespuesta(limpio) },
      ]);
      setPensando(false);
    }, 700);
  };

  return (
    <>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de ayuda"}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition-transform hover:scale-105"
      >
        {abierto ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-brand-blue px-4 py-3 text-white">
            <Bot className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Asistente de Aduanas</p>
              <p className="text-xs text-white/80">Respuestas orientativas, no oficiales</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.autor === "bot" ? "bg-slate-100 text-slate-700" : "ml-auto bg-brand-blue text-white"
                }`}
              >
                {m.texto}
              </div>
            ))}
            {pensando && (
              <div className="max-w-[60%] rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">
                Escribiendo…
              </div>
            )}
          </div>

          {mensajes.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 p-3">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviarPregunta(s)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviarPregunta(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta..."
              className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || pensando}
              aria-label="Enviar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}