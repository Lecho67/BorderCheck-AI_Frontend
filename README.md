# 📦 BorderCheck AI — Frontend Client

> **Interfaz Web para la Optimización Logística y Cumplimiento Aduanero mediante Inteligencia Artificial**

BorderCheck AI es una plataforma diseñada para simplificar y automatizar la gestión de trámites aduaneros, el análisis de documentación de importación/exportación y la verificación de cumplimiento normativo en procesos logísticos (restricciones Hazmat, baterías, perfumes, normativas de origen/destino).

---

## 🚀 Estado del Proyecto

Actualmente, el cliente web se encuentra en la **Fase Inicial de Desarrollo (Web MVP)**, preparado para conectarse con la API REST del backend y la orquestación de reglas aduaneras con la Gemini API.

---

## 🛠️ Tecnologías y Herramientas

* **Librería/Framework:** React.js (con TypeScript)
* **Build Tool:** Vite
* **Estilos:** Tailwind CSS / PostCSS
* **Contenedores:** Docker & Docker Compose
* **Control de Versiones:** Git & GitHub

---

## 📁 Estructura del Repositorio

```text
frontend/
├── src/                # Componentes, vistas y lógica del cliente
├── public/             # Archivos estáticos
├── .dockerignore       # Exclusiones para la imagen de Docker
├── .env                # Variables de entorno locales
├── .gitignore          # Archivos excluidos de Git
├── Dockerfile          # Configuración de contenedor Docker
├── docker-compose.yml  # Servicio para entorno de desarrollo
├── index.html          # Punto de entrada HTML
├── package.json        # Dependencias y scripts de Vite
├── tailwind.config.ts  # Configuración de Tailwind CSS
├── vite.config.ts      # Configuración del empaquetador Vite
└── README.md           # Documentación del cliente
