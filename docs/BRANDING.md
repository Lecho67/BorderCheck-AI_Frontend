# Identidad de marca — Easy CUSTOMS

Guía operativa para aplicar la marca en el frontend. El documento fuente es
"Easy Customs · Identidad de marca (propuesta)".

## Concepto

Un **avión de papel a 45°**, construido con tres planos rectos: sin curvas, sin
detalle superfluo. El papel es el material del trámite aduanero. La inclinación
ascendente lee como avance y agilidad. Tres **líneas de movimiento** en cian
sugieren aire desplazado y velocidad.

## Logotipo

- **"Easy"** — Jost, `font-weight: 300`, itálica. Fluidez, trato humano.
- **"CUSTOMS"** — Jost, `font-weight: 700`, mayúsculas, `letter-spacing` amplio
  (`tracking-[0.16em]`). Solidez legal e institucional.
- Componente: `src/components/BrandLogo.tsx`
  - `variant="full"` (isotipo + logotipo) · `variant="isotype"` (solo el avión, para
    espacios reducidos / anchos < 120 px, p. ej. el navbar en móvil).
  - `tone="light"` sobre fondo claro (logotipo en cobalto, cuerpo del avión en
    degradado cobalto).
  - `tone="dark"` sobre fondo cobalto/oscuro o sobre foto con overlay
    `rgba(15,44,89,0.7)` (logotipo en blanco, cuerpo del avión en papel).
- **Área de respeto:** margen libre equivalente a la altura del isotipo en los
  cuatro lados. Nada entra en ese espacio, tampoco las líneas de movimiento.
- **Tamaño mínimo:** 120 px de ancho para el lockup completo en pantalla. Por
  debajo, usar solo el isotipo.
- Assets estáticos: `public/favicon.svg` (isotipo sobre cuadrado cobalto),
  `public/easy-customs-logo.svg` (lockup — convertir los textos a curvas para
  entrega a producción).

## Paleta (`tailwind.config.ts`)

| Token | Hex | Uso |
|---|---|---|
| `cobalt` | `#0F2C59` | **Dominante.** Fondos oscuros, encabezados sobre fondo claro, botones primarios, estructura. **Es color de texto válido.** |
| `cobalt.600` | `#1B4488` | Hover de superficies cobalto, extremo claro del degradado del cuerpo. |
| `cobalt.900` | `#0A1F40` | Fondos cobalto muy oscuros. |
| `cian` | `#00A8E8` | **Solo acento.** Highlights, líneas de movimiento, indicadores, focus ring, degradados. |
| `cian.light` | `#4FCBF2` | Extremo claro del degradado del ala. |
| `papel` | `#F8F9FA` | Fondo claro de la app, superficies de tarjeta, texto claro sobre cobalto. |
| `papel.tint` | `#E8F9FA` | Variante con un dejo de cian para superficies. |

`brand-blue` y `ai-accent` son **alias de compatibilidad** → cobalto (había ~50
archivos usándolos). `ai-accent` apunta a cobalto y **no** a cian a propósito:
así `text-ai-accent`, que aparece en varios lados, nunca resuelve a cian.

`verdict-green` / `verdict-amber` / `verdict-red` no cambian — exclusivos para
estados de diagnóstico/veredicto.

## Tipografía

**Jost** (`@fontsource/jost`, self-hosted, pesos 300 / 300-italic / 400 / 500 /
700, importados en `src/main.tsx`). `font-sans` = Jost en toda la app. `font-mono`
sin cambios (JetBrains Mono / fallback del sistema).

## Reglas prohibidas (guardrails)

- ❌ Rotar el logotipo o cambiar el ángulo de 45° del avión.
- ❌ Aplicar cian a texto de cuerpo o descriptivo (etiquetas de píldora, párrafos,
  spans destacados). Cian solo en fondos, bordes, iconos/indicadores y degradados.
- ❌ Sombras externas realistas (`drop-shadow-*`, `shadow-lg`, `shadow-xl`,
  `shadow-2xl`). El volumen se logra con tonos papel/gris y cortes rectos. Se
  tolera `shadow-sm` / `shadow` como elevación sutil.
- ❌ Encerrar la marca en contenedores que no sean cuadrados (el favicon es un
  cuadrado con esquinas redondeadas — sigue siendo cuadrado).

## Estado de la migración

- ✅ **Base:** tokens, tipografía, `BrandLogo`, favicon, `Navbar`, `Footer`,
  `ui/Button` (focus ring cian), `index.html` (título/theme-color/OG), copy
  "BorderCheck AI" → "Easy CUSTOMS" en las páginas públicas.
- 🔷 **Pendiente (barrido fino):** revisar página por página los `shadow-lg/xl`,
  los degradados `from-brand-blue/... to-ai-accent/...` (un extremo debería ser
  cian), las píldoras `bg-ai-accent/10` que ganarían con fondo cian, encabezados
  `text-slate-900` que deberían ser `text-cobalt`, y migrar `brand-blue`/`ai-accent`
  a `cobalt`/`cian`. Docs (`README`, `DEPLOYMENT_READINESS`, `PORTFOLIO_BRIEF`).
