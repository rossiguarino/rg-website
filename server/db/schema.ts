import type Database from './index';

/**
 * SQL statements to create all application tables.
 * Uses IF NOT EXISTS to be safely re-runnable.
 */
const CREATE_TABLES = `
-- Users table for backoffice authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'collaborator')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Properties table (both individual and emprendimientos)
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  operacion TEXT NOT NULL CHECK(operacion IN ('venta', 'alquiler')),
  tipo_propiedad TEXT NOT NULL DEFAULT 'departamento',
  ambientes INTEGER NOT NULL DEFAULT 0,
  dormitorios INTEGER NOT NULL DEFAULT 0,
  banos INTEGER NOT NULL DEFAULT 0,
  superficie_total REAL NOT NULL DEFAULT 0,
  superficie_cubierta REAL NOT NULL DEFAULT 0,
  address TEXT,
  location TEXT,
  price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_display TEXT,
  expensas REAL,
  expensas_display TEXT,
  description TEXT,
  is_emprendimiento INTEGER NOT NULL DEFAULT 0,
  developer TEXT,
  total_units TEXT,
  available_apartments INTEGER NOT NULL DEFAULT 0,
  construction_status TEXT,
  price_from REAL,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_coming_soon INTEGER NOT NULL DEFAULT 0,
  contact_enabled INTEGER NOT NULL DEFAULT 1,
  destacada INTEGER NOT NULL DEFAULT 0,
  disponible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Property features (amenities, characteristics)
CREATE TABLE IF NOT EXISTS property_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_uuid TEXT NOT NULL REFERENCES properties(uuid),
  feature TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Property images with ordering
CREATE TABLE IF NOT EXISTS property_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  property_uuid TEXT NOT NULL REFERENCES properties(uuid),
  file_path TEXT NOT NULL,
  original_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Anonymous page visit tracking
CREATE TABLE IF NOT EXISTS property_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_uuid TEXT NOT NULL REFERENCES properties(uuid),
  page_path TEXT,
  visited_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT,
  user_agent TEXT
);

-- Click tracking (WhatsApp, phone, email, etc.)
CREATE TABLE IF NOT EXISTS property_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_uuid TEXT NOT NULL REFERENCES properties(uuid),
  click_type TEXT NOT NULL,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT
);

-- Audit log for backoffice actions
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uuid TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_uuid TEXT,
  entity_name TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/**
 * SQL statements to create performance indexes.
 */
const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_uuid ON properties(uuid);
CREATE INDEX IF NOT EXISTS idx_properties_deleted ON properties(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_uuid);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_uuid);
CREATE INDEX IF NOT EXISTS idx_visits_property ON property_visits(property_uuid);
CREATE INDEX IF NOT EXISTS idx_clicks_property ON property_clicks(property_uuid);
`;

/**
 * Initialize the database schema by creating all tables and indexes.
 * Safe to call multiple times thanks to IF NOT EXISTS clauses.
 * @param db - The database instance to initialize
 */
export function initializeSchema(db: typeof Database extends new () => infer R ? R : never): void {
  // Use the raw db reference since we pass the singleton
  (db as any).exec ? (db as any).exec(CREATE_TABLES) : undefined;
  (db as any).exec ? (db as any).exec(CREATE_INDEXES) : undefined;
}

/**
 * Overload that accepts the default export directly.
 * Runs all CREATE TABLE and CREATE INDEX statements.
 * @param db - The database singleton
 */
export function initializeSchemaFromInstance(db: { exec: (sql: string) => void }): void {
  db.exec(CREATE_TABLES);
  db.exec(CREATE_INDEXES);
}

export { CREATE_TABLES, CREATE_INDEXES };
