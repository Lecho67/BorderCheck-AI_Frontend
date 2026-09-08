import { useId } from "react";

interface BrandLogoProps {
  /** `full` = isotipo + logotipo · `isotype` = solo el avión (espacios reducidos, < 120 px). */
  variant?: "full" | "isotype";
  /** `light` sobre fondo claro (logotipo cobalto) · `dark` sobre fondo cobalto/oscuro o foto con overlay (logotipo blanco, cuerpo del avión en papel). */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Marca **Easy CUSTOMS**.
 *
 * El isotipo es un avión de papel a 45° — el ángulo es fijo, nunca se rota.
 * El volumen del avión se logra con el degradado cian (ala) y cobalto/papel
 * (cuerpo), sin sombras. "Easy" en Jost 300 itálica, "CUSTOMS" en Jost 700
 * mayúsculas con tracking amplio.
 *
 * Área de respeto: dejar un margen libre equivalente a la altura del isotipo.
 */
export function BrandLogo({ variant = "full", tone = "light", className = "" }: BrandLogoProps) {
  const dark = tone === "dark";
  const uid = useId().replace(/:/g, "");
  const wing = `${uid}-wing`;
  const body = `${uid}-body`;
  const wordmark = dark ? "text-white" : "text-cobalt";

  return (
    <span className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="h-7 w-7 shrink-0"
        role="img"
        aria-label="Easy CUSTOMS"
      >
        <defs>
          <linearGradient id={wing} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4FCBF2" />
            <stop offset="1" stopColor="#00A8E8" />
          </linearGradient>
          <linearGradient id={body} x1="1" y1="0" x2="0" y2="1">
            {dark ? (
              <>
                <stop offset="0" stopColor="#F8F9FA" />
                <stop offset="1" stopColor="#D6DEE8" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#1B4488" />
                <stop offset="1" stopColor="#0F2C59" />
              </>
            )}
          </linearGradient>
        </defs>
        <g transform="translate(23.97,8.03) scale(0.88)">
          {/* Líneas de movimiento — cian, abanico ascendente */}
          <g stroke="#00A8E8" strokeWidth="5.5" strokeLinecap="round">
            <line x1="1" y1="77" x2="12" y2="73" opacity="0.5" />
            <line x1="2" y1="98" x2="22" y2="78" />
            <line x1="22" y1="99" x2="26" y2="89" opacity="0.5" />
          </g>
          {/* Avión de papel — ángulo fijo a 45° */}
          <g transform="rotate(-45 50 50)">
            <polygon points="95,50 10,20 35,50" fill={`url(#${wing})`} />
            <polygon points="95,50 35,50 10,80" fill={`url(#${body})`} />
          </g>
        </g>
      </svg>

      {variant === "full" && (
        <span className="whitespace-nowrap leading-none">
          <span className={`text-[1.35rem] font-light italic ${wordmark}`}>Easy</span>
          <span className={`ml-1.5 text-[0.9rem] font-bold uppercase tracking-[0.16em] ${wordmark}`}>
            Customs
          </span>
        </span>
      )}
    </span>
  );
}
