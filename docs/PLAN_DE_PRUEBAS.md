# Plan de Pruebas — BorderCheck AI (Frontend)

| | |
|---|---|
| **Proyecto** | BorderCheck AI — cliente web |
| **Componente** | `frontend/` (React + TypeScript + Vite) |
| **Backend bajo prueba** | Supabase (Auth, PostgreSQL con RLS, Storage, Realtime). El motor de reglas aduaneras es un servicio externo y queda fuera de alcance salvo por el contrato de `POST /api/v1/shipments/evaluate`. |
| **Versión del documento** | 1.0 |

---

## 1. Objetivos

- Verificar que la lógica de control de acceso (autenticación, roles, cumplimiento normativo) se comporta según lo especificado.
- Verificar que las reglas de seguridad a nivel de fila (RLS) de Supabase impiden accesos y modificaciones no autorizadas.
- Verificar la traducción de datos entre el asistente de consulta y el contrato del motor de reglas.
- Dejar una base de pruebas automatizadas que corra en cada cambio y detecte regresiones.

## 2. Alcance

### Dentro de alcance

- Guardas de ruta y de cumplimiento (`ProtectedRoute`, `RequireCompliance`).
- Flujo KYC: carga por el cliente, revisión por agente/admin, gating del casillero.
- Aislamiento entre agentes sobre `customs_queries` y `documents` (RLS "Política 3").
- Escalación de privilegios sobre `profiles` (trigger `prevent_self_privilege_escalation`).
- Mapeo `WizardFormData → ShipmentEvaluationRequest` y `DecisionEngineResult → DiagnosticoEnvio`.
- Utilidades puras (`verdictBadge`, `countryCodes`).
- Resiliencia de la carga de perfil ante fallos de red.
- Actualización en vivo del perfil vía Realtime.

### Fuera de alcance

- El motor de reglas aduaneras (repositorio de backend separado).
- Inferencia de códigos HS por IA (Ollama).
- Integración con Power BI (solo se verifica que la ruta carga).
- Pruebas de carga / rendimiento.
- Pruebas de compatibilidad entre navegadores.

## 3. Estrategia y niveles de prueba

| Nivel | Descripción | Herramienta | Estado |
|---|---|---|---|
| Unitarias | Funciones puras: mapeos, utilidades. | Vitest | Automatizado |
| Componente | Componentes React con dependencias mockeadas (`useAuth`). | Vitest + Testing Library | Automatizado |
| Servicios | Servicios de datos con el cliente Supabase mockeado. | Vitest | Automatizado |
| Integración / seguridad (RLS) | Peticiones REST reales contra la API de Supabase con distintas cuentas. | `fetch` desde consola del navegador | Manual, registrado |
| Extremo a extremo (E2E) | Flujos completos en navegador real. | Playwright / Cypress | **Pendiente** |

## 4. Entorno y herramientas

- **Node.js** 20+, **npm**.
- **Vitest 2** + **jsdom** + **@testing-library/react** + **@testing-library/jest-dom**.
  - Configuración: bloque `test` en `frontend/vite.config.ts`.
  - Setup: `frontend/src/test/setup.ts` (matchers de jest-dom, `cleanup` tras cada test).
  - Los tests usan imports explícitos de `vitest` (sin globals).
- **Cuentas QA permanentes en Supabase** (una por rol, dos de agente para aislamiento):
  - `cliente.prueba@bordercheck.test`
  - un gestor, un admin
  - `agente.prueba@bordercheck.test`, `agente2.prueba@bordercheck.test`
- **Pruebas de RLS:** `fetch` contra `https://<proyecto>.supabase.co/rest/v1/...` con cabeceras `apikey` (anon key de `frontend/.env`) y `Authorization: Bearer <access_token>` tomado de `localStorage['sb-<ref>-auth-token']`.

## 5. Criterios

- **Entrada:** el código compila (`npm run build`), sin errores de ESLint (`npm run lint`).
- **Salida:** el 100 % de los casos automatizados pasa (`npm run test:run`); los casos manuales de seguridad tienen resultado registrado.
- **Aceptación de un cambio:** no introduce regresiones en la suite automatizada; todo caso nuevo de seguridad relevante queda cubierto por un test o registrado como caso manual.

## 6. Casos de prueba automatizados

Ejecutar con `npm run test:run` desde `frontend/`. Total: **47 casos en 10 archivos**.

### 6.1 `src/lib/countryCodes.test.ts` — 2 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| CC-01 | Etiqueta de país conocida | Devuelve `{ alpha2, alpha3 }` correctos |
| CC-02 | Etiqueta sin configurar | Lanza error explícito |

### 6.2 `src/lib/verdictBadge.test.ts` — 2 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| VB-01 | Veredictos conocidos (APROBADO/BLOQUEO/PRECAUCION/REQUIERE_DOCUMENTACION) | Cada uno mapea a su paleta |
| VB-02 | Valor desconocido | Usa `slate` como fallback |

### 6.3 `src/lib/shipmentMapping.test.ts` — 11 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| SM-01 | Mapeo base de países y valores por defecto | `origin_country`/`destination_country` en ISO alpha-2; moneda USD; `has_hazmat_content=false` |
| SM-02 | Peso ≤ 0 | Lanza error de peso |
| SM-03 | Sin valor declarado | Lanza error de valor declarado |
| SM-04 | HS code con formato válido | Se incluye y `hs_code_confidence = "declared_by_user"` |
| SM-05 | HS code con formato inválido | `hs_code` indefinido, `hs_code_confidence = null` |
| SM-06 | Batería de litio declarada | `has_hazmat_content=true` y `lithium_battery` poblado |
| SM-07 | `final_status: APROBADO` | Nivel `verde`, título "Apto para envío", resumen menciona el país |
| SM-08 | `final_status: BLOQUEO` con alerta crítica | Nivel `rojo`, justificación = descripción de la alerta |
| SM-09 | Impuestos con porcentaje estimado (valor 100, 10 %) | `arancel=10`, `flete=8`, `total=18` |
| SM-10 | Valor declarado 0 | `desgloseImpuestos = null` |
| SM-11 | Alerta con texto "certificado fitosanitario" | `documentosRequeridos` incluye "Certificado fitosanitario" |

### 6.4 `src/lib/kycReviewService.test.ts` — 6 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| KS-01 | `fetchKycPendientes` con datos | Llama al RPC `listar_kyc_pendientes` y devuelve las filas |
| KS-02 | `fetchKycPendientes` sin datos | Devuelve `[]` |
| KS-03 | `fetchKycPendientes` con error | Lanza el mensaje del RPC |
| KS-04 | `revisarKyc` aprobar | Llama `revisar_kyc` con `p_motivo: null` |
| KS-05 | `revisarKyc` rechazar con motivo | Llama `revisar_kyc` con el motivo |
| KS-06 | `revisarKyc` con error | Propaga el mensaje del RPC |

### 6.5 `src/components/RequireCompliance.test.tsx` — 5 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| RC-01 | Términos aceptados + KYC aprobado | Renderiza el contenido del casillero |
| RC-02 | Faltan los términos | Bloquea con encabezado "aceptar los términos" |
| RC-03 | KYC `no_iniciado` | Bloquea con encabezado "verificá tu identidad" |
| RC-04 | KYC `rechazado` | Bloquea con encabezado "fue rechazada" |
| RC-05 | KYC `pendiente` | Deja pasar (el modo lectura lo aplica `Locker`) |

### 6.6 `src/components/ProtectedRoute.test.tsx` — 6 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| PR-01 | `loading = true` | Muestra spinner |
| PR-02 | Sin usuario | Redirige a `/login` |
| PR-03 | Usuario + perfil válidos | Renderiza el contenido protegido |
| PR-04 | Usuario sin perfil + `profileError` | Muestra pantalla "Reintentar", **no** redirige a login |
| PR-05 | Rol no permitido | Redirige a la home del rol |
| PR-06 | Rol permitido | Renderiza el contenido protegido |

### 6.7 `src/lib/adminService.test.ts` — 3 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| AD-01 | RPC `metricas_globales` con datos | Mapea el resultado y calcula los porcentajes |
| AD-02 | Sin consultas (`total_consultas: 0`) | No divide por cero; porcentajes en `0` |
| AD-03 | RPC con error | Propaga el mensaje |

### 6.8 `src/lib/agentService.test.ts` — 2 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| AG-01 | `revisarCaso` | Llama al RPC `revisar_caso` con `p_caso_id`/`p_veredicto`/`p_motivo` |
| AG-02 | `revisarCaso` con error | Propaga el mensaje del RPC |

### 6.9 `src/context/AuthContext.test.tsx` — 5 casos

Monta el `AuthProvider` real con Supabase mockeado (sesión, `profiles`, canal Realtime) y un componente de arnés que expone `profile`/`loading`/`profileError`/`refreshProfile`.

| ID | Descripción | Resultado esperado |
|---|---|---|
| AC-01 | Carga exitosa en el primer intento | `profile` con los datos; `single()` llamado 1 vez |
| AC-02 | `PGRST116` (perfil inexistente) | `profileError` seteado; **no** reintenta (`single()` 1 vez) |
| AC-03 | Error transitorio en el 1er intento, éxito en el 2do | Termina con el perfil cargado; `single()` llamado 2 veces |
| AC-04 | Un `refreshProfile()` posterior agota los 3 reintentos | `profileError` seteado, pero el perfil previo **se conserva** (no se borra) |
| AC-05 | Sesión activa | Abre un canal `perfil:<uid>` con `postgres_changes` filtrado por `id=eq.<uid>` |

### 6.10 `src/hooks/useFocusTrap.test.tsx` — 4 casos

| ID | Descripción | Resultado esperado |
|---|---|---|
| FT-01 | Se activa | Enfoca el primer elemento focuseable del contenedor |
| FT-02 | Tab desde el último elemento | Vuelve al primero (no escapa del contenedor) |
| FT-03 | Shift+Tab desde el primero | Va al último |
| FT-04 | Se desactiva | Devuelve el foco a lo que estaba activo antes de abrir |

## 7. Casos de prueba manuales (seguridad / integración)

Registrados durante el desarrollo. Reproducibles con las cuentas QA y `fetch` desde consola.

| ID | Área | Pasos | Resultado esperado | Resultado |
|---|---|---|---|---|
| M-KYC-01 | KYC RPC | Como agente: `rpc('listar_kyc_pendientes')` | 200 con los clientes en estado `pendiente` | ✅ |
| M-KYC-02 | KYC RPC | Como agente: `rpc('revisar_kyc', { p_estado: 'aprobado' })` | 200, fila con `kyc_status = 'aprobado'` | ✅ |
| M-KYC-03 | KYC RPC | Como agente: rechazar sin `p_motivo` | 400 "El rechazo requiere un motivo" | ✅ |
| M-KYC-04 | KYC RPC | Como cliente: cualquiera de los dos RPC | 400 "No autorizado" | ✅ |
| M-KYC-05 | Storage | Como agente: `createSignedUrl` sobre `kyc-documents` | Devuelve URL firmada | ✅ |
| M-KYC-06 | Gating UI | Cliente con KYC `no_iniciado`/`rechazado` entra a `/casillero` | Pantalla de bloqueo, redirige a `/perfil` | ✅ |
| M-KYC-07 | Gating UI | Cliente con KYC `pendiente` entra a `/casillero` | Casillero en modo lectura (banner ámbar, sin pre-alertar/editar/eliminar) | ✅ |
| M-KYC-08 | Gating RLS | Cliente con KYC `pendiente`: `POST /pre_alerts` | 403 "violates row-level security policy" | ✅ |
| M-KYC-09 | Gating RLS | Cliente con KYC `aprobado`: `POST /pre_alerts` | 201, crea la fila | ✅ |
| M-RLS-01 | Aislamiento de agentes | Agente A toma un caso; agente B hace `PATCH` sobre ese caso | 200 `[]` (cero filas modificadas) | ✅ |
| M-RLS-02 | Aislamiento de agentes | Agente B hace `GET` del caso asignado a A | `[]` (no lo ve) | ✅ |
| M-RLS-03 | Escalación de privilegios | Cliente hace `PATCH /profiles` sobre su fila poniendo `role: 'admin'` | 400 con mensaje del trigger | ✅ |
| M-RLS-04 | Escalación de privilegios | Cliente hace `PATCH /profiles` sobre su fila poniendo `kyc_status: 'aprobado'` | 400 con mensaje del trigger | ✅ |
| M-AUTH-01 | Resiliencia de perfil | Con sesión activa, bloquear el dominio de Supabase y navegar a una ruta con rol | Pantalla "No pudimos cargar tu perfil / Reintentar"; **no** expulsa a `/login` | ✅ |
| M-AUTH-02 | Resiliencia de perfil | Desbloquear y pulsar "Reintentar" | Carga el perfil y la ruta | ✅ |
| M-RT-01 | Realtime | Pestaña A: cliente en `/perfil`. Pestaña B: agente aprueba/rechaza su KYC | El badge de KYC en la pestaña A cambia sin recargar (~1 s) | ✅ |

## 8. Pruebas de seguridad (RLS) — resumen

| Superficie | Regla verificada | Método |
|---|---|---|
| `profiles` (UPDATE propio) | Un no-admin no puede cambiar su `role`, `gestor_id`, ni poner `kyc_status` distinto de `pendiente` (trigger `prevent_self_privilege_escalation`). | `fetch` PATCH → 400 |
| `profiles` (revisión KYC) | Solo `agente`/`admin` pueden aprobar/rechazar, y solo vía los RPC `SECURITY DEFINER` (`listar_kyc_pendientes`, `revisar_kyc`). El guard usa `coalesce(get_my_role(), '')` para no fallar abierto ante `NULL`. | `rpc` con cada rol |
| `customs_queries` / `documents` (UPDATE de agente) | `get_my_role() = 'admin' OR (get_my_role() = 'agente' AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid()))`. | `fetch` PATCH con 2 cuentas agente |
| `pre_alerts` (INSERT) | `auth.uid() = user_id AND public.kyc_aprobado()`. | `fetch` POST con KYC aprobado / pendiente |
| Storage `kyc-documents` | `agente`/`admin` incluidos en `kyc_own_folder_select`; el resto solo su propia carpeta. | `createSignedUrl` con cada rol |

## 9. Resumen de ejecución

| Suite | Casos | Estado |
|---|---|---|
| Automatizados (Vitest) | 47 | ✅ 47/47 |
| Manuales de seguridad | 17 | ✅ 17/17 |

Comando: `cd frontend && npm run test:run`.

## 10. Riesgos y deuda de pruebas

- **Sin E2E.** Ningún flujo se prueba de punta a punta en un navegador real (login → consulta → veredicto → historial; carga de KYC → aprobación → casillero). Prioridad alta si el proyecto sigue creciendo.
- **Cobertura de páginas y wizard.** `NewQuery`, `ResultView`, `Locker`, `Documents`, los paneles de agente/admin y los pasos del wizard no tienen tests de componente.
- **Servicios parcialmente cubiertos.** `kycReviewService`, `adminService` y `revisarCaso` de `agentService` tienen test; faltan `tomarCaso`, `fetchColaDeRevision`, `documentReviewService`, `preAlertService`.
- **RLS sin automatizar.** Las pruebas de seguridad son manuales; un cambio de política podría regresionar sin que la suite lo note. Automatizarlas requiere un runner que autentique cada cuenta QA contra la API REST.
- **`buildShipmentEvaluationRequest`:** la validación `!wizardData.paisOrigen` es inalcanzable porque `getCountryInfo("")` lanza antes con otro mensaje. No es un defecto funcional pero conviene limpiarlo.

## 11. Procedimiento de ejecución

```bash
cd frontend
npm install
npm run lint        # 0 errores, 0 warnings
npm run test:run    # 32/32
npm run build       # compila; el warning de tamaño es el chunk aislado de /reportes
```

Pruebas manuales de RLS: ver `CLAUDE.md` → "Preferencias de trabajo (Simon)" y "Bugs y decisiones ya resueltas" para el detalle de cuentas y helpers de consola.
