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

Los alias viejos `brand-blue` y `ai-accent` **ya no existen** — se renombraron a
`cobalt` en todo `src/` (`brand-blue-hover` → `cobalt-600`). No reintroducirlos.

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

- ✅ **Fase 1 — base:** tokens, tipografía Jost, `BrandLogo`, favicon,
  `Navbar`/`Footer`, `ui/Button` (focus ring cian), `index.html`
  (título/theme-color/OG). Copy "BorderCheck AI" → "Easy CUSTOMS" en la UI y
  en todos los `docs/*.md` (los comentarios que citan `BorderCheck-AI_Backend`
  quedan — es el repo real del backend).
- ✅ **Fase 2 — barrido fino:** `shadow-lg`/`shadow-xl` → `shadow` (+ borde en
  overlays); CTA del pitch sin sombra ni `hover:-translate`; degradado del
  pitch a `from-cobalt/5 via-papel to-cian/10`; encabezados `<h1>` de página
  → `text-cobalt`; `ai-accent` eliminado de `src/` — las píldoras/bordes/iconos
  de "contenido IA" pasaron a `cian` (fondo `bg-cian/10`, borde/icono `cian`,
  **texto siempre `cobalt`**); `DashboardHistorial.tsx` (prototipo muerto) borrado.
- ✅ **Fase 3 — cierre de tokens:** los alias `brand-blue`/`ai-accent` se
  renombraron a `cobalt` en los ~47 archivos que los usaban
  (`brand-blue-hover` → `cobalt-600`) y se borraron de `tailwind.config.ts`.
  La paleta queda en `cobalt` / `cian` / `papel` / `verdict-*`.
- ✅ **Fase 3 — glifos → lucide:** `ErrorBoundary` (`⚠` → `AlertTriangle`),
  `ToastContainer` (`✓`/`⚠`/`ℹ`/`✕` → `CheckCircle2`/`AlertTriangle`/`Info`/`X`),
  `DocumentChecklist` (`✓` → `Check`). `ui/ProgressBar.tsx` (código muerto del
  wizard multi-paso, ya no se importa) borrado. Quedan `→` como afordancia de
  enlace en `History`/`Dashboard`/`Profile` — glifo tipográfico, no emoji.
- 🔷 **Pendiente:** `public/og-image.png` (1200×630) con la marca.
