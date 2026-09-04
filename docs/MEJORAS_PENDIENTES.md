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

## 3b. Login: recuperar contraseña ✅ · login con Google ⏳ oculto

**Qué:** `Login.tsx` se rediseñó con el sistema de diseño y suma
"¿Olvidaste tu contraseña?" (reutiliza `solicitarCambioContrasena` /
`/restablecer-contrasena`, funcionando).

**Google:** `signInWithGoogle()` ya está implementado en `AuthContext` (y
probado que compila/lintea), pero el botón está **oculto** en `Login.tsx`
hasta activar el proveedor. Evaluamos usar Firebase para esto y se descartó:
duplicaría el sistema de identidad (Supabase Auth ya sostiene RLS, Storage y
Realtime vía `auth.uid()`). Para habilitarlo:
1. Google Cloud Console → OAuth consent screen + credencial "Web application".
2. Redirect URI: `https://<proyecto>.supabase.co/auth/v1/callback`.
3. Supabase Dashboard → Authentication → Providers → Google → pegar Client ID/Secret.
4. Supabase Dashboard → Authentication → URL Configuration → agregar las URLs de `redirectTo` (`/dashboard` en dev y prod).
5. Volver a agregar el botón en `Login.tsx` (se sacó pero el código de `AuthContext` sigue ahí).
6. Verificar que el primer login con Google cree la fila en `profiles` (debería, vía el mismo trigger que usa el signup por email).

**Dónde:** `frontend/src/pages/Login.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/context/auth.ts`.

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

## 5. `overrideVerdict` atómico + "Confirmar IA" ✅

**Qué:** `overrideVerdict` (SELECT + UPDATE sin transacción) se reemplazó por
`revisarCaso`, que llama al RPC `SECURITY DEFINER` `revisar_caso()`: una sola
operación atómica, con el mismo filtro de fila que tenía la política RLS
(admin, o agente sin caso asignado o asignado a él).

**Cómo distingue confirmar de sobrescribir:** sin columna nueva — el RPC usa
`original_ai_verdict = coalesce(original_ai_verdict, ai_verdict)`. Una
confirmación (mismo veredicto) deja `original_ai_verdict = ai_verdict`; un
cambio real los deja distintos. `metricas_globales` cuenta "modificado" solo
cuando son distintos, así que "Confirmar IA" ya no infla `casos_por_agente`.

**De paso:** `fetchColaDeRevision` filtra `overridden_by is null`, así que un
caso ya confirmado o sobrescrito sale de la cola de revisión.

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
