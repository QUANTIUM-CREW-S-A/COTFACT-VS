# COTFACT-VS: Sistema de Gestión de Cotizaciones y Facturas

[ES] COTFACT-VS es una aplicación web moderna para la gestión de cotizaciones y facturas, desarrollada con React, Vite, TypeScript, Node.js (Express), Supabase y PostgreSQL. Permite crear, editar, exportar y administrar documentos comerciales, clientes y métodos de pago, con una interfaz adaptable y soporte PWA.

[EN] COTFACT-VS is a modern web application for managing quotes and invoices, developed with React, Vite, TypeScript, Node.js (Express), Supabase and PostgreSQL. It allows creating, editing, exporting and managing business documents, customers and payment methods, with a responsive interface and PWA support.

![Badge Version](https://img.shields.io/badge/version-1.0.0-blue)
![Badge License](https://img.shields.io/badge/license-MIT-green)
![Badge Status](https://img.shields.io/badge/status-stable-brightgreen)

---

## Tabla de Contenidos
- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Funcionamiento General](#funcionamiento-general)
- [APIs y Backend](#apis-y-backend)
- [Frontend y Flujos de Usuario](#frontend-y-flujos-de-usuario)
- [PWA y Mobile](#pwa-y-mobile)
- [Seguridad y Notificaciones](#seguridad-y-notificaciones)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características Principales 🚀
- Gestión completa de cotizaciones y facturas (CRUD)
- Exportación a PDF y CSV con plantillas personalizables
- Administración de clientes y métodos de pago
- Personalización de plantillas y datos de empresa
- Panel de control con métricas y visualizaciones en tiempo real
- Soporte para dispositivos móviles (responsive y PWA)
- Autenticación robusta con soporte para 2FA
- Sincronización en tiempo real con Supabase
- Sistema de notificaciones para eventos importantes
- Modo offline con sincronización automática

## Tecnologías
- **Frontend:** React, Vite, TypeScript, TailwindCSS, Shadcn UI, React Query, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Supabase
- **PWA:** Instalación en dispositivos móviles, modo offline, caché local
- **Seguridad:** Autenticación JWT, 2FA, verificación por correo electrónico
- **Otros:** ESLint, Prettier, Docker (opcional)

## Estructura del Proyecto

```
cotfact-vs/
├── backend/                # Backend Express/Node (API REST, PostgreSQL)
│   ├── src/
│   │   ├── app.ts
│   │   ├── controllers/
│   │   ├── db/
│   │   └── routes/
│   └── package.json
├── src/                    # Frontend React (Vite + TypeScript)
│   ├── components/         # Componentes UI y de negocio
│   ├── context/            # Contextos globales
│   ├── hooks/              # Hooks personalizados
│   ├── integrations/       # Integraciones externas (Supabase)
│   ├── lib/                # Utilidades y datos por defecto
│   ├── pages/              # Páginas principales
│   ├── services/           # Lógica de acceso a APIs
│   ├── types/              # Tipos TypeScript globales
│   ├── utils/              # Utilidades generales
│   └── ...
├── public/                 # Archivos estáticos y assets
├── index.html              # HTML principal (PWA, metadatos, etc)
├── package.json            # Configuración frontend
├── vite.config.ts          # Configuración Vite
└── README.md               # (Este archivo)
```

## Instalación y Puesta en Marcha

### Requisitos
- Node.js >= 18.x
- PostgreSQL >= 13
- (Opcional) Docker

### 1. Clonar el repositorio
```bash
git clone https://github.com/sharkstar03/cotfact-vs.git
cd cotfact-vs
```

### 2. Configurar el Backend
```bash
cd backend
npm install
# Configura .env según backend/src/db/index.ts
db/migrations/schema.sql # Ejecuta migraciones en tu PostgreSQL
npm run dev
```

### 3. Configurar el Frontend
```bash
cd ..
npm install
npm run dev
# Accede a http://localhost:5173
```

### 4. Configuración de Supabase
- Crea un proyecto en [Supabase](https://supabase.com/).
- Configura tablas y credenciales según los archivos de la carpeta `db/` y variables de entorno.
- Actualiza endpoints y claves en `src/integrations/supabase/`.

---

## Funcionamiento General

- **Inicio de sesión:** El usuario se autentica y se cargan documentos, clientes, métodos de pago y preferencias desde Supabase (o localStorage si está offline).
- **Gestión de documentos:** Crear, editar, eliminar, aprobar y convertir cotizaciones en facturas. Los cambios se reflejan en tiempo real y se sincronizan con Supabase.
- **Gestión de clientes:** CRUD completo, búsqueda y edición. Los clientes se asocian automáticamente a documentos.
- **Métodos de pago:** CRUD centralizado, propagación automática a todos los documentos.
- **Personalización:** Cambia colores, logos, formato de fecha, términos y condiciones, etc. Vista previa instantánea.
- **Panel de control:** Visualización de métricas, ingresos y estado de documentos.
- **Exportación:** Descarga de reportes en PDF y CSV generados en el frontend.
- **PWA:** Instalación en dispositivos móviles, modo offline y notificaciones.
- **Seguridad:** Autenticación robusta, 2FA, registro de actividades y protección contra ataques.

---

## APIs y Backend

### Documentos (`/api/documents`)
- **GET /**: Lista todos los documentos con detalles (cliente, items, términos, métodos de pago).
- **GET /:id**: Obtiene un documento específico por ID.
- **POST /**: Crea un nuevo documento y sus relaciones (cliente, items, términos, métodos de pago).
- **PUT /:id**: Actualiza un documento y todas sus relaciones.
- **DELETE /:id**: Elimina un documento y todas sus relaciones.

### Clientes (`/api/customers`)
- CRUD completo para clientes.

### Métodos de Pago (`/api/payment-methods`)
- CRUD para métodos de pago, asociables a documentos.

### Preferencias de Plantilla (`/api/template-preferences`)
- Guardar y recuperar preferencias de visualización de documentos.

### Información de Empresa (`/api/company-info`)
- Guardar y recuperar datos de la empresa.

### Autenticación (`/api/auth`)
- Registro, login y gestión de usuarios (Supabase Auth o lógica propia).

**Seguridad:** Todas las rutas protegidas requieren autenticación (token JWT o sesión de Supabase). Validaciones de datos y manejo de errores robusto.

---

## Frontend y Flujos de Usuario

- **Documentos:** Formulario para crear/editar cotizaciones y facturas, seleccionando cliente, productos/servicios, métodos de pago y términos. Permite aprobar cotizaciones y convertirlas en facturas.
- **Clientes:** Búsqueda, creación y edición desde formularios o diálogos modales.
- **Métodos de Pago:** Gestión centralizada y sincronización automática.
- **Preferencias:** Panel de configuración para personalizar la plantilla y datos de empresa.
- **Dashboard:** Métricas, ingresos, cotizaciones/facturas recientes y su estado.
- **Seguridad:** Login, registro, protección de rutas y gestión de sesión.

### Hooks y Contextos
- `useDocumentsContext`: Acceso global a documentos, clientes, preferencias y métodos de pago.
- `useDocumentOperations`: Lógica para crear, actualizar, eliminar, aprobar y convertir documentos.
- `useCustomerOperations`: CRUD de clientes y sincronización con documentos.
- `usePaymentMethods`: CRUD de métodos de pago y propagación global.
- `useInitialData`: Carga inicial y suscripción a cambios en tiempo real.
- `useSettingsOperations`: Actualización de preferencias y datos de empresa.

---

## PWA y Mobile
- **Instalable** en dispositivos móviles.
- **Modo offline** y sincronización automática al recuperar conexión.
- **Notificaciones** y experiencia nativa.

---

## Seguridad y Notificaciones

### Seguridad
- **Autenticación robusta:** Login seguro con JWT y Supabase Auth
- **Two-Factor Authentication (2FA):** Verificación adicional mediante aplicación authenticator
- **Verificación por correo:** Confirmación de cuentas por email
- **Registro de actividad:** Historial detallado de acciones de usuario
- **Protección contra ataques:** Bloqueo automático tras múltiples intentos fallidos
- **Roles de usuario:** Root, Admin y Audit con diferentes permisos

### Sistema de Notificaciones
- **Notificaciones del sistema (toast):** Éxito, error, advertencia e información
- **Notificaciones de actividad:** Seguimiento en logs con diferentes niveles (info, warning, error, critical)
- **Alertas por email:** Verificaciones y recuperación de contraseñas
- **Notificaciones PWA:** Alertas nativas en dispositivos móviles

---

## Contribución
¡Las contribuciones son bienvenidas! Abre un issue o pull request para sugerencias, mejoras o reportar bugs.

## Licencia
MIT. Ver archivo LICENSE.

---

