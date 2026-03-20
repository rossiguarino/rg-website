# Plan de Backoffice — RG Propiedades

## Arquitectura General

- **Frontend**: React + TypeScript + Vite (mismo proyecto, ruta oculta `/#/admin`)
- **Backend**: Express.js + better-sqlite3
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod (validación)
- **Gráficos**: Chart.js + react-chartjs-2
- **Base de datos**: SQLite (singleton, abstracción semántica)

---

## Fases de Implementación

### FASE 1: Infraestructura Backend + Base de Datos
- [x] Instalar dependencias (express, better-sqlite3, jsonwebtoken, bcryptjs, cors, uuid)
- [x] Crear estructura de carpetas `server/`
- [x] Crear singleton de SQLite (`server/db/index.ts`)
- [x] Crear schema SQL con todas las tablas
- [x] Crear capa de abstracción de DB (repositories)
- [x] Crear seed con usuario admin default
- [x] Crear seed con propiedades existentes (migrar JSON → DB)

### FASE 2: API REST + Autenticación
- [x] Middleware de autenticación JWT
- [x] Middleware de autorización por roles
- [x] POST /api/auth/login
- [x] GET /api/auth/me
- [x] CRUD /api/users (admin only crear/editar/eliminar, collaborator ver perfil)
- [x] CRUD /api/properties (ambos roles)
- [x] GET /api/properties/:uuid/history (audit log por propiedad)
- [x] GET /api/audit-log (historial global, admin only)
- [x] GET /api/dashboard/stats (métricas)
- [x] POST /api/analytics/visit (tracking público)
- [x] POST /api/analytics/click (tracking público)
- [ ] POST /api/properties/:uuid/images (upload de imágenes)

### FASE 3: Frontend Backoffice - Core
- [x] Ruta oculta `/#/admin` con layout propio
- [x] Página de Login con React Hook Form
- [x] AuthContext + ProtectedRoute
- [x] Layout del backoffice (sidebar, header, contenido)
- [x] Navegación: Dashboard, Propiedades, Usuarios, Historial

### FASE 4: Dashboard
- [x] Contadores: total propiedades, en venta, en alquiler, pausadas
- [x] Gráfico de visitas (últimos 30 días)
- [x] Ranking de propiedades más visitadas
- [x] Ranking de propiedades más clickeadas
- [x] Métricas de conversión (clicks en contacto vs visitas)

### FASE 5: Gestión de Propiedades
- [x] Tabla con búsqueda y ordenamiento por columnas
- [x] Botones de acción: editar, pausar/activar, eliminar (soft delete)
- [x] Lista de propiedades eliminadas con opción de recuperar
- [x] Página de edición completa:
  - Datos básicos (título, slug, dirección, localidad, descripción)
  - Operación (venta/alquiler) y tipo de propiedad
  - Números (ambientes, dormitorios, baños, superficies)
  - Precios (precio, moneda, expensas)
  - Características (agregar/quitar/reordenar)
  - Imágenes (subir, reordenar, eliminar)
  - Configuraciones (nuevo, próximamente, contacto habilitado, destacada)
  - Datos de emprendimiento (developer, unidades, estado construcción)
- [x] Historial de cambios al pie de la página de edición

### FASE 6: Gestión de Usuarios
- [x] Tabla de usuarios
- [x] Crear usuario (admin only)
- [x] Editar usuario y cambiar rol (admin only)
- [x] Eliminar usuario (admin only)

### FASE 7: Historial de Cambios (Audit Log)
- [x] Página global con tabla paginada
- [x] Filtros por usuario, tipo de acción, entidad
- [x] Detalle expandible de cada acción

### FASE 8: Tracking Público
- [ ] Componente de tracking en páginas públicas (visitas)
- [ ] Tracking de clicks en botones de contacto
- [ ] Envío asíncrono al backend

---

## Schema de Base de Datos

### users
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK autoincrement |
| uuid | TEXT | UNIQUE, NOT NULL |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| phone | TEXT | nullable |
| password_hash | TEXT | NOT NULL |
| role | TEXT | 'admin' o 'collaborator' |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |
| deleted_at | TEXT | nullable (soft delete) |

### properties
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK autoincrement |
| uuid | TEXT | UNIQUE, NOT NULL |
| slug | TEXT | UNIQUE, NOT NULL |
| title | TEXT | NOT NULL |
| operacion | TEXT | 'venta' o 'alquiler' |
| tipo_propiedad | TEXT | 'departamento', 'local', 'casa', etc. |
| ambientes | INTEGER | default 0 |
| dormitorios | INTEGER | default 0 |
| banos | INTEGER | default 0 |
| superficie_total | REAL | default 0 |
| superficie_cubierta | REAL | default 0 |
| address | TEXT | |
| location | TEXT | localidad |
| price | REAL | |
| currency | TEXT | 'USD', 'ARS' |
| price_display | TEXT | formateado |
| expensas | REAL | nullable |
| expensas_display | TEXT | nullable |
| description | TEXT | |
| is_emprendimiento | INTEGER | boolean 0/1 |
| developer | TEXT | nullable, solo emprendimientos |
| total_units | TEXT | nullable, solo emprendimientos |
| available_apartments | INTEGER | default 0 |
| construction_status | TEXT | nullable |
| price_from | REAL | nullable, para emprendimientos |
| is_new | INTEGER | boolean, badge "Nuevo" |
| is_coming_soon | INTEGER | boolean, estado "Próximamente" |
| contact_enabled | INTEGER | boolean, habilitar contacto |
| destacada | INTEGER | boolean |
| disponible | INTEGER | boolean (pausar = false) |
| created_at | TEXT | |
| updated_at | TEXT | |
| deleted_at | TEXT | nullable (soft delete) |

### property_features
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| property_uuid | TEXT | FK → properties.uuid |
| feature | TEXT | NOT NULL |
| sort_order | INTEGER | default 0 |

### property_images
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| uuid | TEXT | UNIQUE |
| property_uuid | TEXT | FK → properties.uuid |
| file_path | TEXT | ruta relativa |
| original_name | TEXT | nombre original |
| sort_order | INTEGER | default 0 |
| created_at | TEXT | |

### property_visits
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| property_uuid | TEXT | FK |
| page_path | TEXT | ruta visitada |
| visited_at | TEXT | ISO timestamp |
| ip_hash | TEXT | hash del IP (privacidad) |
| user_agent | TEXT | nullable |

### property_clicks
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| property_uuid | TEXT | FK |
| click_type | TEXT | 'contacto', 'whatsapp', 'telefono', 'galeria' |
| clicked_at | TEXT | ISO timestamp |
| ip_hash | TEXT | |

### audit_log
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| user_uuid | TEXT | FK → users.uuid |
| user_name | TEXT | snapshot del nombre |
| action | TEXT | 'create', 'update', 'delete', 'restore', 'pause', 'login' |
| entity_type | TEXT | 'property', 'user', 'setting' |
| entity_uuid | TEXT | nullable |
| entity_name | TEXT | snapshot del nombre/título |
| details | TEXT | JSON con cambios |
| created_at | TEXT | |

### settings
| Campo | Tipo | Notas |
|-------|------|-------|
| id | INTEGER | PK |
| key | TEXT | UNIQUE |
| value | TEXT | |
| updated_at | TEXT | |

---

## Credenciales Default

- **URL**: `/#/admin`
- **Email**: admin@rgpropiedades.com
- **Password**: RGadmin2024!

---

## Historial de Cambios

| Fecha | Fase | Descripción |
|-------|------|-------------|
| 2026-03-19 | 1 | Creación del plan, setup inicial del backend |
| 2026-03-19 | 1 | Backend completo: Express + SQLite + JWT auth + repositories + routes |
| 2026-03-19 | 1 | Seed: admin default + 9 emprendimientos + 1 propiedad migrados desde JSON |
| 2026-03-19 | 2 | API REST completa: auth, users, properties, audit, dashboard, analytics |
| 2026-03-19 | 3 | Frontend backoffice core: login, layout, sidebar, protected routes |
| 2026-03-19 | 4 | Dashboard con stat cards, gráfico visitas, top visited/clicked |
| 2026-03-19 | 5 | Tabla propiedades con búsqueda, sort, paginación, tabs activas/eliminadas |
| 2026-03-19 | 5 | Fix: alineación campos API ↔ frontend (title/location/price vs titulo/localidad/precio) |
| 2026-03-19 | 5-7 | Páginas creadas: PropertyEdit, PropertyCreate, Users, AuditLog |
