# Mejoras pendientes — BorderCheck AI (Frontend)

Registro vivo de mejoras identificadas, priorizadas. Cada entrada indica **qué es**,
**por qué importa**, **dónde toca** y si **necesita SQL** en Supabase.

> Convención de estado: ✅ hecho · 🔷 listo para tomar · ⏳ requiere decisión previa

---

## 0. Contexto — hecho recientemente

- UI de aprobación de KYC (`/panel-agente/kyc`) con RPCs `SECURITY DEFINER`.
- Gating del casillero por KYC (frontend + RLS en `pre_alerts`).
- Verificación de la "Política 3" del audit de RLS (aislamiento entre agentes).
- Limpieza de código muerto, ESLint 9, infra de tests (Vitest, 32 casos).
- `AuthContext`: reintento de carga de perfil, no expulsa al usuario ante fallo de red, canal Realtime sobre el perfil propio.
- Code-split de rutas con `React.lazy`.
- Integración continua (GitHub Actions) — ver punto 1.
- Bug de la dirección del casillero — ver punto 2.

---

## 1. Integración continua ✅

**Qué:** workflow de GitHub Actions (`.github/workflows/ci.yml`) que corre
`lint` + `test:run` + `build` en cada push a `main` y en cada pull request.

**Por qué:** hay 32 tests automatizados; sin CI nada garantiza que sigan
verdes tras un merge. Es la pieza que hace que la inversión en pruebas valga.

**Dónde:** `.github/workflows/ci.yml`. **SQL:** no.

---

## 2. Bug — dirección del casillero mostraba un literal ✅

**Qué:** `Locker.tsx` renderizaba el string literal `"Suite BC-{USER_ID}"`
(nunca se interpolaba) y lo copiaba roto al portapapeles. Ahora usa
`profile.locker_code` (`Suite <código>`), con fallback
"Suite pendiente de asignación" si el usuario aún no tiene código.

**Dónde:** `src/pages/Locker.tsx`. **SQL:** no.

---

## 3. `git push` 🔷

Los commits de la sesión están solo en local (`main`). Falta `git push`
(y, si el equipo trabaja con PRs, moverlos a una rama).

---

## 4. Métricas de admin a una vista/RPC de Postgres ✅

**Qué:** la agregación se movió a la RPC `metricas_globales()`
(`SECURITY DEFINER`, solo admin) que devuelve `total_consultas`,
`aprobados`, `bloqueados` y `casos_por_agente`. `fetchMetricasGlobales`
ahora hace una sola llamada y solo calcula los porcentajes.

**Pendiente relacionado:** `casos_por_agente` sigue contando por
`overridden_by`, así que incluye las confirmaciones "Confirmar IA" hasta
que se aplique el § 5.

---

## 5. `overrideVerdict` atómico + "Confirmar IA" 🔷 · requiere SQL

**Qué:** `overrideVerdict` (`src/lib/agentService.ts`) hace un `SELECT`
seguido de un `UPDATE` sin transacción. Además, "Confirmar IA" llama a
`overrideVerdict` con el mismo veredicto, así que queda registrado como un
override (`overridden_by`, `overridden_at`) y **ensucia las métricas**
("casos por agente" cuenta confirmaciones como si fueran cambios).

**Cómo:**
- RPC `SECURITY DEFINER` que lea y escriba en una sola operación.
- Separar "confirmar" de "sobrescribir": un flag o un campo
  `confirmado_sin_cambios` para no contarlo como override.

**Dónde:** SQL en Supabase + `src/lib/agentService.ts` + `CasoRevisionCard.tsx`.

---

## 6. Gating de KYC para `/documentos` ✅

**Qué:** el "Centro de Documentación Aduanera" (`/documentos`) ahora tiene el
mismo gate que el casillero: `RequireCompliance` en la ruta + política
`insert_own_documents` con `AND public.kyc_aprobado()`. En estado `pendiente`,
`Documents.tsx` entra en modo lectura (banner, sin subir ni eliminar).

**De paso:** `RequireCompliance` ya no aplica a roles internos
(`agente`/`gestor`/`admin` pasan siempre) — evita bloquear al admin en
`/casillero` y `/documentos`.

---

## 7. Pruebas extremo a extremo (E2E) 🔷

**Qué:** ningún flujo se prueba de punta a punta en un navegador real.

**Candidatos (Playwright):**
- Registro → login → aceptar términos → subir KYC.
- Agente aprueba KYC → el cliente entra al casillero.
- Wizard de consulta → veredicto → aparece en el historial.
- Agente audita un caso y sobrescribe el veredicto.

**Dónde:** nuevo `frontend/e2e/` + `@playwright/test`. Requiere cuentas QA y
un entorno de Supabase de pruebas.

---

## 8. Ampliar cobertura de tests unitarios/componente 🔷

Falta cubrir:
- Servicios: `agentService`, `documentReviewService`, `preAlertService`, `adminService`.
- `AuthContext`: reintento con backoff y descarte de respuestas obsoletas (hoy solo manual).
- Componentes: `NewQuery`, `ResultView`, `Locker`, paneles de agente/admin, pasos del wizard.
- Automatizar las pruebas de RLS (runner que autentique cada cuenta QA contra la API REST).

Ver `docs/PLAN_DE_PRUEBAS.md` § 10 para el detalle.

---

## 9. Centro de notificaciones 🔷

**Qué:** `profiles.notification_preferences` es un campo muerto — sin UI para
configurarlo y sin entrega de notificaciones.

**Oportunidad:** el canal Realtime ya está montado en `AuthContext`. Se puede
construir un panel de notificaciones in-app: paquete recibido en bodega,
KYC resuelto, veredicto de un caso cambiado por un agente.

**Dónde:** tabla `notifications` en Supabase (o reutilizar Realtime sobre
`pre_alerts`/`customs_queries`) + componente de campana en `Navbar` + UI de
preferencias en `Profile.tsx`.

---

## 10. Deuda técnica

| Ítem | Detalle |
|---|---|
| `react-router` 6.30.6 | Vulnerabilidad de open-redirect (moderada); el parche está en react-router 7 (migración major). Ver `docs/PLAN_DE_PRUEBAS.md` no aplica; correr como tarea propia. |
| `vite` 5 / `vitest` 2 | La advisory del dev-server de esbuild solo se resuelve subiendo a vite 8 + vitest 5 (majors). Sin superficie en producción; hacerlo deliberadamente, no con `npm audit fix --force`. |
| `frontend/dist/assets/Reports-*.js` (~622 kB) | El chunk de `/reportes` sigue pesado (`powerbi-client` + `recharts`). Ya está aislado de la carga inicial; se puede reducir cargando Power BI solo al abrir esa pestaña. |
| `frontend/tsconfig.tsbuildinfo` versionado | Artefacto de build; debería estar en `.gitignore`. |
| Warning de lint en `AuthContext` | Resuelto — `useAuth` se movió a `src/hooks/useAuth.ts`. |

---

## 11. UX / accesibilidad

- **Foco en modales y drawers:** `Modal`, `CasoRevisionCard`, `KycModal` y el
  drawer móvil del `Navbar` no atrapan el foco ni lo devuelven al cerrar.
- **`AgentKycPanel`:** sin filtros, orden ni paginación (a diferencia de la
  cola de casos y el panel de documentos). Tampoco se actualiza en vivo
  cuando entra un KYC nuevo.
- **Estados vacío/carga/error** poco pulidos en varios paneles.
