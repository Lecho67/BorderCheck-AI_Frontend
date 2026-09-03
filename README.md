# 📦 BorderCheck AI — Frontend Client

> **Interfaz web para asesoría aduanera y evaluación de envíos internacionales con asistencia de IA**

BorderCheck AI es una plataforma B2C que ayuda a personas a importar mercancía: evalúa envíos internacionales, estima tributos de aduana, gestiona un casillero virtual y acompaña los trámites, con inferencia de códigos HS asistida por IA y auditoría humana de los veredictos.

Este repositorio contiene **solo el frontend**. El motor de reglas aduaneras y la integración con el modelo de IA viven en un repositorio de backend separado, mantenido por un colaborador.

---

## 🚀 Estado del proyecto

En desarrollo activo. Ya implementado:

- Autenticación y sesión con Supabase Auth.
- Control de acceso por roles (RBAC) con 4 roles: `cliente`, `gestor`, `agente`, `admin`.
- Asistente (wizard) de evaluación de envíos y vista de veredicto con desglose de tributos.
- Historial de consultas y panel de cliente.
- Casillero virtual con pre-alertas de paquetes.
- Flujo KYC completo: carga de documento de identidad por el cliente y panel de aprobación/rechazo para agentes y admin.
- Cumplimiento normativo (Ley 1581 de 2012): aceptación de Términos y Habeas Data, gating del casillero por verificación de identidad.
- Panel de agente: cola de revisión de casos, override de veredictos con justificación, revisión de documentos.
- Panel de admin: gestión de usuarios y roles, asignación de gestores, métricas globales.
- Reportes (nativos con Recharts y embebidos con Power BI).
- Centro de soporte con asistente conversacional.
- Actualización en vivo del perfil vía Supabase Realtime.

---

## 🛠️ Tecnologías

| Área | Herramienta |
|------|-------------|
| Framework | React 18 + TypeScript |
| Build / dev server | Vite 5 |
| Estilos | Tailwind CSS 3 + PostCSS |
| Ruteo | React Router 6 |
| Backend as a Service | Supabase (Auth, PostgreSQL con RLS, Storage, Realtime) |
| Iconos | `lucide-react` |
| Gráficos | `recharts`, `powerbi-client` |
| Animación | `framer-motion` |
| Estado puntual | `zustand` |
| Lint | ESLint 9 (flat config) + `typescript-eslint` |
| Contenedores | Docker & Docker Compose |

El motor de reglas se consume vía `POST {VITE_API_BASE_URL}/api/v1/shipments/evaluate`. Si `VITE_API_BASE_URL` no está definida, el frontend usa un **mock local** (`src/lib/mockData.ts`) y la app funciona sin backend.

---

## 📋 Requisitos

- Node.js 20+
- npm
- Un proyecto de Supabase (URL + anon/publishable key)
- (Opcional) El backend del motor de reglas corriendo en `:3000`
- (Opcional) Docker & Docker Compose

---

## ⚙️ Variables de entorno

Crear `frontend/.env` a partir de estas claves:

```env
# Obligatorias — sin ellas src/lib/supabase.ts lanza un error y la app no carga
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-o-publishable-key>

# Opcional — si se omite, el frontend usa el mock local
VITE_API_BASE_URL=http://localhost:3000
```

`.env` está en `.gitignore`; no se commitea.

---

## 🧑‍💻 Desarrollo local

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite, puerto 5173) |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run preview` | Sirve el build de producción |

---

## 🐳 Docker

```bash
cd frontend
docker compose up --build
```

El servicio expone el puerto `5173`. Notas:

- Dentro de un contenedor, `localhost` no resuelve al host: `VITE_API_BASE_URL` debe apuntar a `http://host.docker.internal:3000` si el motor de reglas corre fuera de Docker (ya configurado en `docker-compose.yml`).
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se toman del entorno del host (no escribirlas en texto plano en `docker-compose.yml` si se sube a un repo compartido).
- Imagen publicada: `lecho67/bordercheck-frontend:dev`.
- Al reiniciar, usar `-v` para evitar un volumen `node_modules` obsoleto.

---

## 📁 Estructura del repositorio

```text
.
├── CLAUDE.md               # Contexto y convenciones del proyecto (leer antes de tocar código)
├── README.md
└── frontend/
    ├── src/
    │   ├── components/     # Componentes de UI (ui/, layout/, wizard/, verdict/, agent/, admin/, kyc/, …)
    │   ├── context/        # AuthContext (sesión, perfil, realtime)
    │   ├── pages/          # Vistas enrutadas
    │   ├── lib/            # Servicios de datos, cliente Supabase, mapeos, toast bus, tipos
    │   └── types/          # Tipos de la base de datos
    ├── public/             # (si aplica) archivos estáticos
    ├── .env                # Variables de entorno locales (ignorado por Git)
    ├── .dockerignore
    ├── Dockerfile
    ├── docker-compose.yml
    ├── eslint.config.js    # ESLint 9 flat config
    ├── index.html          # Punto de entrada
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vite.config.ts      # Alias @/ → src/
```

---

## 🏛️ Arquitectura y convenciones

- Todo el copy de UI y los comentarios de código están en **español**.
- Alias de imports: `@/` apunta a `frontend/src/`.
- Iconos solo con `lucide-react` (nunca emojis en la UI).
- Neutrales con `slate-*` (nunca `gray-*`); colores de marca `brand-blue`, `ai-accent`, `verdict-*`.
- Notificaciones con un bus de toast propio (`src/lib/toast.ts`), no librerías externas.
- Autorización: `src/components/ProtectedRoute.tsx` con `allowedRoles`; la seguridad real vive en las políticas RLS de Supabase (`get_my_role()` como helper `SECURITY DEFINER` para evitar recursión).

Ver **`CLAUDE.md`** para el detalle de convenciones, decisiones de RLS y notas de implementación.
