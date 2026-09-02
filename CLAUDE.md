# CLAUDE.md — BorderCheck AI

Contexto persistente del proyecto para Claude Code. Leer este archivo antes de tocar cualquier código.

## Qué es el proyecto

BorderCheck AI es una plataforma B2C de asesoría aduanera y evaluación de envíos internacionales. Permite a usuarios importar mercancía, calcular impuestos de aduana y hacer seguimiento de envíos con asistencia de IA (inferencia de códigos HS vía Ollama).

Este repo es el **frontend**. El backend (Node/Express + Docker + integración Ollama) lo mantiene un colaborador en un repo separado.

## Stack tecnológico

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase (Auth, PostgreSQL, Storage, Realtime)
- Comunicación con motor de reglas stateless vía `POST /api/v1/shipments/evaluate` (Express/TypeScript)
- Librerías: `lucide-react` (iconos), `jsPDF`, `Recharts`, `powerbi-client`

## Arquitectura y convenciones clave

- Todo el copy de UI y los comentarios de código están en **español**.
- Alias de imports: `@/` apunta a `src/` (el frontend vive en `frontend/`).
- 4 roles RBAC: `cliente`, `gestor`, `agente`, `admin`.
- `ProtectedRoute.tsx` vive en `src/components/ProtectedRoute.tsx` (NO bajo `auth/`).
- `allowedRoles` debe incluir `admin` en casi todas las rutas protegidas — verificar siempre en rutas nuevas para evitar bloquear al admin.
- Colores de marca: `brand-blue` (CTAs), `ai-accent` (contenido generado por IA), `verdict-green` / `verdict-yellow` (exclusivos para estados de diagnóstico/veredicto — no usar para otra cosa).
- Neutrales: usar `slate-*`, nunca `gray-*`.
- Iconos: solo `lucide-react`, nunca emojis.
- Notificaciones: bus de toast propio (`src/lib/toast.ts`) con `toast.success` / `toast.error` — no usar librerías externas de toast.
- Otros módulos compartidos: `src/lib/api.ts`, `src/lib/queryHistoryService.ts`, `src/lib/shipmentMapping.ts`, `src/components/ui/`.
- `tailwindcss-animate` **no está instalado** — no asumir que existe.
- `get_my_role()` es una función `SECURITY DEFINER` usada en políticas RLS para evitar recursión infinita. Devuelve `select role from public.profiles where id = auth.uid()`.

## Bugs y decisiones ya resueltas (no repetir)

- **RLS en `profiles` nunca debe hacer subconsultas a `profiles` misma** — causa recursión infinita. Usar `get_my_role()` u otros helpers `SECURITY DEFINER`.
- **Escalación de privilegios (crítico, ya arreglado):** un usuario podía auto-asignarse `role: "admin"` o auto-aprobar su propio KYC. Se corrigió con un trigger `SECURITY DEFINER` (`prevent_self_privilege_escalation`) y un helper `SECURITY DEFINER` (`agente_tiene_caso_de`) para romper la recursión `profiles ↔ customs_queries`. El trigger solo bloquea cuando `auth.uid() = OLD.id` y el rol no es `admin` (auto-edición): impide cambiar el propio `role`, `gestor_id`, o poner `kyc_status` en algo distinto de `pendiente`. No afecta a un revisor editando el perfil de otro usuario. Verificado con pruebas `fetch` PATCH que devuelven `400` con mensajes explícitos del trigger.
- **Política SELECT de agente sobre `profiles` demasiado amplia** — ya corregida.
- **Pendiente:** Política 3 del audit de RLS — el UPDATE de agente sobre `customs_queries` y `documents` no tiene filtrado a nivel de fila. Aún no aplicada.
- Después de un override de veredicto, hay que ampliar el SELECT de agente/admin para evitar errores "row violates RLS" cuando `.update().select()` saca la fila del scope visible.
- **Regex en Zod para Ollama Structured Outputs:** `\d` causa fallos de gramática en `llama.cpp`. Usar `[0-9]` explícito (ya aplicado en `hsCodeMapper.ts` con `/^[0-9]{6}$/`). Pendiente confirmación del colaborador de que produce códigos HS reales en logs del backend.
- **Docker:** `localhost` no resuelve dentro de contenedores — usar `host.docker.internal`. `VITE_API_BASE_URL` debe apuntar a `host.docker.internal:3000` en contenedores. Imagen publicada: `lecho67/bordercheck-frontend:dev`. Usar `-v` al reiniciar para evitar volúmenes `node_modules` obsoletos.
- **KYC — UI de aprobación: implementada y probada.**
  - Los agentes/admin revisan en `/panel-agente/kyc` (`src/pages/AgentKycPanel.tsx` + `src/components/kyc/KycReviewCard.tsx`), enlace "Verificación KYC" en `Navbar` (escritorio + drawer). Servicio: `src/lib/kycReviewService.ts`.
  - Backend: RPCs `SECURITY DEFINER` `listar_kyc_pendientes()` y `revisar_kyc(p_user_id, p_estado, p_motivo)`. El guard usa `coalesce(get_my_role(), '') not in ('agente','admin')` porque un `NULL not in (...)` evalúa a `NULL` y no lanzaba (fallo abierto).
  - `revisar_kyc` valida `p_estado in ('aprobado','rechazado')`, exige motivo para rechazar, y solo actúa sobre filas con `kyc_status = 'pendiente'`. Limpia `kyc_rejection_reason` al aprobar.
  - No se abrió política RLS de UPDATE de agente sobre `profiles` (se hace todo por RPC). La política de storage `kyc_own_folder_select` ya incluía `agente`/`admin` para el bucket `kyc-documents`.
  - El documento KYC del cliente vive en `profiles.kyc_document_path` (bucket `kyc-documents`), NO en la tabla `documents` ni en el panel `/panel-agente/documentos` (ese es otro flujo, documentos de envíos). KYC no tiene paso de "tomar caso".
  - Verificado con `fetch`/rpc: agente lista/aprueba/rechaza; cliente recibe `400 No autorizado`.

## Preferencias de trabajo (Simon)

- **Regla dura:** nunca modificar un archivo sin antes ver su contenido actual (viene de un incidente de sobrescritura).
- Comunicación tersa y directa — confirmaciones de una palabra, sin preámbulos ni introducciones innecesarias.
- Espera que Claude Code lea los archivos reales del proyecto antes de escribir código, no que asuma.
- Errores se comparten como capturas de pantalla sin comentarios — diagnosticar y arreglar directamente.
- Sin archivos ZIP; código en bloques directos con la ruta exacta del archivo.
- Trabajo iterativo y secuencial: una tarea a la vez, con confirmación de Simon (pruebas en navegador o consultas en consola de Supabase) antes de avanzar.
- Cambios de SQL: ejecutar y verificar en el SQL Editor de Supabase antes de tocar el frontend.
- Testing de RLS: pruebas `fetch` desde consola contra la API REST de Supabase. El cliente `supabase` no está expuesto en `window`; usar `fetch` con `apikey` (anon key de `frontend/.env`) y `Authorization: Bearer <access_token>` sacado de `localStorage['sb-jdngmlwutcltdfmkwsag-auth-token']`. Existen 4 cuentas QA permanentes (una por rol, dos de agente para pruebas de aislamiento); la de cliente es `cliente.prueba@bordercheck.test`.

## Próximos pasos pendientes

1. Completar la Política 3 del audit de RLS (filtrado de UPDATE de agente sobre `customs_queries` y `documents`).
2. Confirmar con el colaborador que el fix de HS code en Ollama produce códigos reales en producción.
