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
- Librerías instaladas: `lucide-react` (iconos), `recharts`, `powerbi-client`, `framer-motion`, `zustand`. (`jsPDF` NO está instalado aunque se mencionaba antes; no hay export a PDF.)

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
- Lint: `npm run lint` (ESLint 9 flat config en `frontend/eslint.config.js`, con `@typescript-eslint/no-unused-expressions` para cazar JSX suelto). Requiere `npm install` tras traer los cambios que lo agregaron.
- Tests: `npm run test` (watch) / `npm run test:run` (una pasada). Vitest + jsdom + Testing Library; setup en `src/test/setup.ts`; config `test` dentro de `vite.config.ts`. Los tests usan imports explícitos de `vitest` (sin globals) y mockean `@/hooks/useAuth` con `vi.mock`. Cobertura: `verdictBadge`, `countryCodes`, `shipmentMapping`, todos los servicios de datos (`kycReviewService`, `adminService`, `agentService` completo, `documentReviewService`, `preAlertService` — con el helper compartido `src/test/supabaseQueryMock.ts` para el query builder encadenable de supabase-js), `RequireCompliance` (gating KYC + bypass de roles internos), `ProtectedRoute` (auth/rol/reintento), `AuthContext` (reintento con backoff, descarte de respuestas obsoletas, no borra el perfil ante un refresh fallido, canal Realtime), `useFocusTrap`. **61 tests en 12 archivos.**
- Páginas prototipo `pages/Casillero.tsx` y `pages/Documentos.tsx` fueron borradas (superadas por `Locker.tsx` / `Documents.tsx`). El código de backend filtrado en `src/services/` (`cacheService.ts`, `shipmentService.ts`, dep `ioredis`) también fue borrado.
- `get_my_role()` es una función `SECURITY DEFINER` usada en políticas RLS para evitar recursión infinita. Devuelve `select role from public.profiles where id = auth.uid()`.
- `AuthContext` mantiene un canal Realtime (`perfil:<uid>`) sobre la fila propia de `profiles`: cualquier UPDATE (KYC, rol, gestor) refresca el perfil en vivo. Requiere `profiles` en la publicación `supabase_realtime` (`alter publication supabase_realtime add table public.profiles;`).

## Bugs y decisiones ya resueltas (no repetir)

- **RLS en `profiles` nunca debe hacer subconsultas a `profiles` misma** — causa recursión infinita. Usar `get_my_role()` u otros helpers `SECURITY DEFINER`.
- **Escalación de privilegios (crítico, ya arreglado):** un usuario podía auto-asignarse `role: "admin"` o auto-aprobar su propio KYC. Se corrigió con un trigger `SECURITY DEFINER` (`prevent_self_privilege_escalation`) y un helper `SECURITY DEFINER` (`agente_tiene_caso_de`) para romper la recursión `profiles ↔ customs_queries`. El trigger solo bloquea cuando `auth.uid() = OLD.id` y el rol no es `admin` (auto-edición): impide cambiar el propio `role`, `gestor_id`, o poner `kyc_status` en algo distinto de `pendiente`. No afecta a un revisor editando el perfil de otro usuario. Verificado con pruebas `fetch` PATCH que devuelven `400` con mensajes explícitos del trigger.
- **Política SELECT de agente sobre `profiles` demasiado amplia** — ya corregida.
- **Política 3 del audit de RLS — ya implementada y verificada.** El UPDATE (y SELECT) de agente sobre `customs_queries` y `documents` filtra por fila: `get_my_role() = 'admin' OR (get_my_role() = 'agente' AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid()))`. Verificado con las 2 cuentas agente QA (`agente.prueba@` y `agente2.prueba@`): el agente B no puede modificar ni ver un caso asignado al agente A (`PATCH` devuelve `200 []`). Matiz abierto: un agente todavía puede sobrescribir un caso `assigned_agent_id IS NULL` sin "tomarlo" antes; si se quiere forzar "tomar antes de decidir", sacar el `IS NULL` del USING de UPDATE.
- **`overrideVerdict` → `revisarCaso` (RPC atómico), ya implementado.** El SELECT+UPDATE original tenía dos problemas: no era atómico, y "Confirmar IA" (llamaba `overrideVerdict` con el mismo veredicto) quedaba registrado como override y ensuciaba `casos_por_agente`. El RPC `revisar_caso()` (`SECURITY DEFINER`) hace la operación en un solo `UPDATE`, aplica el mismo filtro de fila que tenía la política RLS (admin, o agente sin caso asignado o asignado a él), exige motivo no vacío, y usa `original_ai_verdict = coalesce(original_ai_verdict, ai_verdict)` para preservar el veredicto original real aunque el caso se revise más de una vez. Al devolver la fila desde el propio RPC (bypass de RLS), ya no hace falta ampliar el SELECT de agente/admin tras el update. `fetchColaDeRevision` ahora filtra `overridden_by is null` para que un caso confirmado/sobrescrito salga de la cola. `metricas_globales` solo cuenta como "modificado" cuando `original_ai_verdict IS DISTINCT FROM ai_verdict` (una confirmación no infla `casos_por_agente`).
- **Regex en Zod para Ollama Structured Outputs:** `\d` causa fallos de gramática en `llama.cpp`. Usar `[0-9]` explícito (ya aplicado en `hsCodeMapper.ts` con `/^[0-9]{6}$/`). Pendiente confirmación del colaborador de que produce códigos HS reales en logs del backend.
- **Docker:** `localhost` no resuelve dentro de contenedores — usar `host.docker.internal`. `VITE_API_BASE_URL` debe apuntar a `host.docker.internal:3000` en contenedores. Imagen publicada: `lecho67/bordercheck-frontend:dev`. Usar `-v` al reiniciar para evitar volúmenes `node_modules` obsoletos.
- **KYC — UI de aprobación: implementada y probada.**
  - Los agentes/admin revisan en `/panel-agente/kyc` (`src/pages/AgentKycPanel.tsx` + `src/components/kyc/KycReviewCard.tsx`), enlace "Verificación KYC" en `Navbar` (escritorio + drawer). Servicio: `src/lib/kycReviewService.ts`.
  - Backend: RPCs `SECURITY DEFINER` `listar_kyc_pendientes()` y `revisar_kyc(p_user_id, p_estado, p_motivo)`. El guard usa `coalesce(get_my_role(), '') not in ('agente','admin')` porque un `NULL not in (...)` evalúa a `NULL` y no lanzaba (fallo abierto).
  - `revisar_kyc` valida `p_estado in ('aprobado','rechazado')`, exige motivo para rechazar, y solo actúa sobre filas con `kyc_status = 'pendiente'`. Limpia `kyc_rejection_reason` al aprobar.
  - No se abrió política RLS de UPDATE de agente sobre `profiles` (se hace todo por RPC). La política de storage `kyc_own_folder_select` ya incluía `agente`/`admin` para el bucket `kyc-documents`.
  - El documento KYC del cliente vive en `profiles.kyc_document_path` (bucket `kyc-documents`), NO en la tabla `documents` ni en el panel `/panel-agente/documentos` (ese es otro flujo, documentos de envíos). KYC no tiene paso de "tomar caso".
  - Verificado con `fetch`/rpc: agente lista/aprueba/rechaza; cliente recibe `400 No autorizado`.
  - **Gating del Casillero y de Documentos por KYC:** `RequireCompliance` (usado en `/casillero` y `/documentos`) bloquea si falta términos/habeas o si `kyc_status` es `no_iniciado`/`rechazado`. Si es `pendiente`, `Locker.tsx` y `Documents.tsx` entran en modo lectura (banner ámbar, sin crear/subir/editar/eliminar). `RequireCompliance` **no aplica a roles internos** (`agente`/`gestor`/`admin` pasan siempre — evita bloquear al admin). Refuerzo en backend: helper `kyc_aprobado()` (`SECURITY DEFINER`, `coalesce(..., false)`); `insert_own_pre_alerts` e `insert_own_documents` exigen `auth.uid() = user_id AND public.kyc_aprobado()`. Verificado: `POST /pre_alerts` da `201` con KYC aprobado y `403` con KYC pendiente. UPDATE/DELETE quedaron permisivos a propósito.

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

Ver `docs/MEJORAS_PENDIENTES.md` para el roadmap completo. En corto:

1. `overrideVerdict` atómico (RPC) + que "Confirmar IA" no cuente como override en métricas (`casos_por_agente` de la RPC `metricas_globales` hoy lo incluye).
2. Confirmar con el colaborador que el fix de HS code en Ollama produce códigos reales en producción.
3. `git push` de los commits de la sesión.

## Métricas de admin

`fetchMetricasGlobales` (`src/lib/adminService.ts`) llama a la RPC `metricas_globales()` (`SECURITY DEFINER`, guard `coalesce(get_my_role(),'') <> 'admin'`), que devuelve `jsonb` con `total_consultas`, `aprobados`, `bloqueados` y `casos_por_agente` (agregado por `overridden_by`, join a `profiles` para el nombre). El frontend solo calcula porcentajes.

## Historial reciente de esta sesión

- Bug arreglado: `CasoRevisionCard.tsx` tenía un bloque `<section>` con `<ShipmentTimeline>` incrustado como sentencia dentro de un `useEffect` (merge roto) — la línea de tiempo "Trazabilidad del caso" no se renderizaba. Movida al `return`.
- `AdminUserTable.tsx`: emoji `⚠️` reemplazado por `<AlertTriangle>` de lucide (convención "solo lucide-react").
- `AuthContext.tsx`: `fetchProfile` ahora reintenta 3 veces con backoff ante fallos transitorios, descarta respuestas obsoletas (guard con `requestIdRef` para login/logout rápidos), y **no borra un perfil ya cargado** si un refresh posterior falla. `ProtectedRoute` ya no expulsa a `/login` cuando la sesión es válida pero el perfil no cargó: muestra pantalla de "Reintentar" (`profileError`). Verificado bloqueando el dominio de Supabase en DevTools.
- `AuthContext.tsx`: canal Realtime sobre `profiles` (ver Arquitectura). Verificado: aprobar/rechazar KYC desde el panel de agente actualiza el badge del cliente en otra pestaña sin recargar.
- `StepSpecialDeclarations.tsx`: 4 `as any` → casts a los tipos union de `@/lib/types`.
- `useAuth` movido a `src/hooks/useAuth.ts` y el objeto de contexto + tipo a `src/context/auth.ts`; `AuthContext.tsx` ahora solo exporta `AuthProvider`. `npm run lint` queda 100% limpio (0 warnings). 13 imports actualizados a `@/hooks/useAuth`.
- `App.tsx`: todas las vistas por ruta con `React.lazy` + `<Suspense>` (Pitch queda eager por ser la home). Bundle inicial de ~1.3 MB (348 kB gz) a ~434 kB (123 kB gz); `powerbi-client`+`recharts` quedan en el chunk de `/reportes`, fuera de la carga inicial.
- Infra de tests agregada (Vitest + Testing Library). Ver sección "Lint/Tests" en Arquitectura.
- CI en `.github/workflows/ci.yml`: `lint` + `test:run` + `build` en push a `main` y en PRs.
- Bug arreglado: `Locker.tsx` mostraba el literal `"Suite BC-{USER_ID}"` (nunca interpolado) como dirección del casillero. Ahora deriva `Suite <profile.locker_code>` con fallback.
- `docs/PLAN_DE_PRUEBAS.md` (plan de pruebas formal) y `docs/MEJORAS_PENDIENTES.md` (roadmap de mejoras priorizado) creados.
- `Login.tsx` rediseñado al sistema de diseño (`Button`/`Input`) + flujo "¿Olvidaste tu contraseña?" funcionando. `signInWithGoogle()` implementado en `AuthContext` pero el botón queda oculto en `Login.tsx` hasta habilitar el proveedor Google en Supabase (se evaluó Firebase y se descartó: duplicaría el sistema de identidad que hoy sostiene `auth.uid()` en RLS/Storage/Realtime). Detalle de activación en `docs/MEJORAS_PENDIENTES.md` § 3b.
- `Register.tsx` rediseñado igual que `Login.tsx` (quedaba con el estilo viejo, inconsistente).
- `frontend/.env.example` agregado; `*.tsbuildinfo` ahora en `.gitignore` (se destrackeó `tsconfig.tsbuildinfo`).
- `AuthContext.test.tsx`: 5 tests nuevos (reintento con backoff, `PGRST116` sin reintento, no borra el perfil ante un refresh fallido, canal Realtime).
- Foco atrapado en modales/drawers: hook `useFocusTrap` (con test propio) aplicado en `Modal`, `KycModal`, `CasoRevisionCard` y el drawer móvil del `Navbar`. `KycModal`/`CasoRevisionCard` ahora cierran con Escape; el `✕` de `CasoRevisionCard` pasó a `<X>` de lucide. 47 tests en 10 archivos.
- `Reports.tsx`: `NativeReportsView` y `PowerBiEmbed` pasan a `React.lazy` (antes se cargaban juntos aunque solo una pestaña se ve). Ya no queda ningún chunk de build sobre 500 kB.
