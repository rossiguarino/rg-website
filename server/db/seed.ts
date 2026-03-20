import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Shape of an emprendimiento from properties.json */
interface EmprendimientoJson {
  id: string;
  slug: string;
  name: string;
  fullName?: string;
  address?: string;
  location?: string;
  developer?: string;
  totalUnits?: string;
  availableApartments?: number;
  priceFrom?: number;
  priceDisplay?: string;
  constructionStatus?: string;
  description?: string;
  features?: string[];
  images?: string[];
  destacada?: boolean;
  disponible?: boolean;
  isNew?: boolean;
  isComingSoon?: boolean;
  contactEnabled?: boolean;
  [key: string]: unknown;
}

/** Shape of an individual property from propiedades.json */
interface PropiedadJson {
  id: string;
  slug: string;
  title: string;
  operacion: string;
  tipoPropiedad?: string;
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  superficieTotal?: number;
  superficieCubierta?: number;
  address?: string;
  location?: string;
  price?: number;
  currency?: string;
  priceDisplay?: string;
  expensas?: number | null;
  expensasDisplay?: string | null;
  description?: string;
  features?: string[];
  images?: string[];
  destacada?: boolean;
  disponible?: boolean;
  [key: string]: unknown;
}

/**
 * Seed the database with the default admin user and existing property data.
 * Reads JSON files from src/data/ and inserts them into the database.
 * This function is idempotent: it skips seeding if the admin user already exists.
 */
export function seed(): void {
  // Check if already seeded
  const existing = db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', 'admin@rgpropiedades.com');
  if (existing) {
    console.log('[seed] Database already seeded, skipping.');
    return;
  }

  console.log('[seed] Seeding database...');

  db.transaction(() => {
    seedAdmin();
    seedEmprendimientos();
    seedPropiedades();
  });

  console.log('[seed] Seeding complete.');
}

/**
 * Create the default admin user with a hashed password.
 */
function seedAdmin(): void {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rgpropiedades.com';
  const adminPassword = process.env.ADMIN_PASSWORD || (() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[FATAL] ADMIN_PASSWORD environment variable is required in production.');
      process.exit(1);
    }
    console.warn('[seed] ⚠️  Using default dev admin password. Set ADMIN_PASSWORD env var for production.');
    return 'RGadmin2024!';
  })();

  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  const adminUuid = uuidv4();

  db.run(
    `INSERT INTO users (uuid, first_name, last_name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    adminUuid, 'Admin', 'RG', adminEmail, passwordHash, 'admin'
  );

  console.log(`[seed] Created admin user: ${adminEmail}`);
}

/**
 * Import emprendimientos from src/data/properties.json into the properties table.
 * Maps JSON field names to database column names.
 */
function seedEmprendimientos(): void {
  const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'properties.json');
  if (!fs.existsSync(filePath)) {
    console.log('[seed] No properties.json found, skipping emprendimientos.');
    return;
  }

  const data: EmprendimientoJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let count = 0;

  const insertProperty = db.prepare(
    `INSERT INTO properties (
      uuid, slug, title, operacion, tipo_propiedad,
      address, location, price, currency, price_display,
      description, is_emprendimiento, developer, total_units,
      available_apartments, construction_status, price_from,
      is_new, is_coming_soon, contact_enabled, destacada, disponible
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertFeature = db.prepare(
    `INSERT INTO property_features (property_uuid, feature, sort_order)
     VALUES (?, ?, ?)`
  );

  const insertImage = db.prepare(
    `INSERT INTO property_images (uuid, property_uuid, file_path, original_name, sort_order)
     VALUES (?, ?, ?, ?, ?)`
  );

  for (const emp of data) {
    const propUuid = uuidv4();

    insertProperty.run(
      propUuid,
      emp.slug,
      emp.name || emp.fullName || emp.slug,
      'venta',
      'departamento',
      emp.address || null,
      emp.location || null,
      emp.priceFrom || 0,
      'USD',
      emp.priceDisplay || null,
      emp.description || null,
      1, // is_emprendimiento
      emp.developer || null,
      emp.totalUnits || null,
      emp.availableApartments || 0,
      emp.constructionStatus || null,
      emp.priceFrom || null,
      emp.isNew ? 1 : 0,
      emp.isComingSoon ? 1 : 0,
      emp.contactEnabled !== false ? 1 : 0,
      emp.destacada ? 1 : 0,
      emp.disponible !== false ? 1 : 0
    );

    // Insert features
    if (emp.features && Array.isArray(emp.features)) {
      emp.features.forEach((feature, idx) => {
        insertFeature.run(propUuid, feature, idx);
      });
    }

    // Insert images
    if (emp.images && Array.isArray(emp.images)) {
      emp.images.forEach((imgPath, idx) => {
        const imgUuid = uuidv4();
        const originalName = path.basename(imgPath);
        insertImage.run(imgUuid, propUuid, imgPath, originalName, idx);
      });
    }

    count++;
  }

  console.log(`[seed] Inserted ${count} emprendimientos from properties.json`);
}

/**
 * Import individual properties from src/data/propiedades.json into the properties table.
 */
function seedPropiedades(): void {
  const filePath = path.join(__dirname, '..', '..', 'src', 'data', 'propiedades.json');
  if (!fs.existsSync(filePath)) {
    console.log('[seed] No propiedades.json found, skipping propiedades.');
    return;
  }

  const data: PropiedadJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let count = 0;

  const insertProperty = db.prepare(
    `INSERT INTO properties (
      uuid, slug, title, operacion, tipo_propiedad,
      ambientes, dormitorios, banos, superficie_total, superficie_cubierta,
      address, location, price, currency, price_display,
      expensas, expensas_display, description,
      is_emprendimiento, destacada, disponible
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertFeature = db.prepare(
    `INSERT INTO property_features (property_uuid, feature, sort_order)
     VALUES (?, ?, ?)`
  );

  const insertImage = db.prepare(
    `INSERT INTO property_images (uuid, property_uuid, file_path, original_name, sort_order)
     VALUES (?, ?, ?, ?, ?)`
  );

  for (const prop of data) {
    const propUuid = uuidv4();

    insertProperty.run(
      propUuid,
      prop.slug,
      prop.title,
      prop.operacion || 'venta',
      prop.tipoPropiedad || 'departamento',
      prop.ambientes || 0,
      prop.dormitorios || 0,
      prop.banos || 0,
      prop.superficieTotal || 0,
      prop.superficieCubierta || 0,
      prop.address || null,
      prop.location || null,
      prop.price || 0,
      prop.currency || 'USD',
      prop.priceDisplay || null,
      prop.expensas || null,
      prop.expensasDisplay || null,
      prop.description || null,
      0, // is_emprendimiento
      prop.destacada ? 1 : 0,
      prop.disponible !== false ? 1 : 0
    );

    // Insert features
    if (prop.features && Array.isArray(prop.features)) {
      prop.features.forEach((feature, idx) => {
        insertFeature.run(propUuid, feature, idx);
      });
    }

    // Insert images
    if (prop.images && Array.isArray(prop.images)) {
      prop.images.forEach((imgPath, idx) => {
        const imgUuid = uuidv4();
        const originalName = path.basename(imgPath);
        insertImage.run(imgUuid, propUuid, imgPath, originalName, idx);
      });
    }

    count++;
  }

  console.log(`[seed] Inserted ${count} propiedades from propiedades.json`);
}

export default seed;
