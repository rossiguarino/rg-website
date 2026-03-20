import { v4 as uuidv4 } from 'uuid';
import db from '../db/index';
import { BaseRepository } from './base';

/** Database row shape for the properties table */
export interface PropertyRow {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  operacion: 'venta' | 'alquiler';
  tipo_propiedad: string;
  ambientes: number;
  dormitorios: number;
  banos: number;
  superficie_total: number;
  superficie_cubierta: number;
  address: string | null;
  location: string | null;
  price: number;
  currency: string;
  price_display: string | null;
  expensas: number | null;
  expensas_display: string | null;
  description: string | null;
  is_emprendimiento: number;
  developer: string | null;
  total_units: string | null;
  available_apartments: number;
  construction_status: string | null;
  price_from: number | null;
  is_new: number;
  is_coming_soon: number;
  contact_enabled: number;
  destacada: number;
  disponible: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Database row shape for property_features */
export interface FeatureRow {
  id: number;
  property_uuid: string;
  feature: string;
  sort_order: number;
}

/** Database row shape for property_images */
export interface ImageRow {
  id: number;
  uuid: string;
  property_uuid: string;
  file_path: string;
  original_name: string | null;
  sort_order: number;
  created_at: string;
}

/** Data for creating a property */
export interface CreatePropertyData {
  slug: string;
  title: string;
  operacion: 'venta' | 'alquiler';
  tipo_propiedad?: string;
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  superficie_total?: number;
  superficie_cubierta?: number;
  address?: string;
  location?: string;
  price?: number;
  currency?: string;
  price_display?: string;
  expensas?: number;
  expensas_display?: string;
  description?: string;
  is_emprendimiento?: boolean;
  developer?: string;
  total_units?: string;
  available_apartments?: number;
  construction_status?: string;
  price_from?: number;
  is_new?: boolean;
  is_coming_soon?: boolean;
  contact_enabled?: boolean;
  destacada?: boolean;
  disponible?: boolean;
}

/** Filter options for property listing */
export interface PropertyFilters {
  search?: string;
  operacion?: string;
  tipo_propiedad?: string;
  location?: string;
  ambientes?: number;
  ambientes_min?: number;
  is_emprendimiento?: boolean;
  disponible?: boolean;
  destacada?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

/**
 * Repository for property CRUD operations including features, images, and statistics.
 */
export class PropertyRepository extends BaseRepository<PropertyRow> {
  constructor() {
    super('properties');
  }

  /**
   * List properties with search, filter, and pagination.
   * @param filters - Filtering and pagination options
   * @returns Paginated property list with total count
   */
  search(filters: PropertyFilters): { properties: PropertyRow[]; total: number } {
    const {
      search, operacion, tipo_propiedad, location,
      ambientes, ambientes_min,
      is_emprendimiento, disponible, destacada,
      limit = 50, offset = 0, orderBy = 'created_at DESC'
    } = filters;

    const whereClauses: string[] = ['deleted_at IS NULL'];
    const params: unknown[] = [];

    if (search) {
      whereClauses.push('(title LIKE ? OR address LIKE ? OR location LIKE ? OR description LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (operacion) {
      whereClauses.push('operacion = ?');
      params.push(operacion);
    }
    if (tipo_propiedad) {
      whereClauses.push('tipo_propiedad = ?');
      params.push(tipo_propiedad);
    }
    if (location) {
      whereClauses.push('location LIKE ?');
      params.push(`%${location}%`);
    }
    if (ambientes !== undefined) {
      whereClauses.push('ambientes = ?');
      params.push(ambientes);
    }
    if (ambientes_min !== undefined) {
      whereClauses.push('ambientes >= ?');
      params.push(ambientes_min);
    }
    if (is_emprendimiento !== undefined) {
      whereClauses.push('is_emprendimiento = ?');
      params.push(is_emprendimiento ? 1 : 0);
    }
    if (disponible !== undefined) {
      whereClauses.push('disponible = ?');
      params.push(disponible ? 1 : 0);
    }
    if (destacada !== undefined) {
      whereClauses.push('destacada = ?');
      params.push(destacada ? 1 : 0);
    }

    const where = whereClauses.join(' AND ');

    const total = db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM properties WHERE ${where}`,
      ...params
    )?.count ?? 0;

    const properties = db.all<PropertyRow>(
      `SELECT * FROM properties WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    return { properties, total };
  }

  /**
   * Find a property by its slug.
   * @param slug - The URL-friendly slug
   * @returns The property record or undefined
   */
  findBySlug(slug: string): PropertyRow | undefined {
    return db.get<PropertyRow>(
      'SELECT * FROM properties WHERE slug = ? AND deleted_at IS NULL',
      slug
    );
  }

  /**
   * Create a new property.
   * @param data - Property creation data
   * @returns The newly created property record
   */
  create(data: CreatePropertyData): PropertyRow {
    const uuid = uuidv4();

    db.run(
      `INSERT INTO properties (
        uuid, slug, title, operacion, tipo_propiedad,
        ambientes, dormitorios, banos, superficie_total, superficie_cubierta,
        address, location, price, currency, price_display,
        expensas, expensas_display, description,
        is_emprendimiento, developer, total_units, available_apartments,
        construction_status, price_from, is_new, is_coming_soon,
        contact_enabled, destacada, disponible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      uuid,
      data.slug,
      data.title,
      data.operacion,
      data.tipo_propiedad || 'departamento',
      data.ambientes || 0,
      data.dormitorios || 0,
      data.banos || 0,
      data.superficie_total || 0,
      data.superficie_cubierta || 0,
      data.address || null,
      data.location || null,
      data.price || 0,
      data.currency || 'USD',
      data.price_display || null,
      data.expensas || null,
      data.expensas_display || null,
      data.description || null,
      data.is_emprendimiento ? 1 : 0,
      data.developer || null,
      data.total_units || null,
      data.available_apartments || 0,
      data.construction_status || null,
      data.price_from || null,
      data.is_new ? 1 : 0,
      data.is_coming_soon ? 1 : 0,
      data.contact_enabled !== false ? 1 : 0,
      data.destacada ? 1 : 0,
      data.disponible !== false ? 1 : 0
    );

    return this.findByUuid(uuid)!;
  }

  /**
   * Update a property's fields.
   * @param uuid - The property UUID
   * @param data - Partial property data to update
   * @returns The updated property record or undefined
   */
  update(uuid: string, data: Partial<CreatePropertyData>): PropertyRow | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      slug: 'slug', title: 'title', operacion: 'operacion',
      tipo_propiedad: 'tipo_propiedad', ambientes: 'ambientes',
      dormitorios: 'dormitorios', banos: 'banos',
      superficie_total: 'superficie_total', superficie_cubierta: 'superficie_cubierta',
      address: 'address', location: 'location', price: 'price',
      currency: 'currency', price_display: 'price_display',
      expensas: 'expensas', expensas_display: 'expensas_display',
      description: 'description', developer: 'developer',
      total_units: 'total_units', available_apartments: 'available_apartments',
      construction_status: 'construction_status', price_from: 'price_from',
    };

    const boolMap: Record<string, string> = {
      is_emprendimiento: 'is_emprendimiento', is_new: 'is_new',
      is_coming_soon: 'is_coming_soon', contact_enabled: 'contact_enabled',
      destacada: 'destacada', disponible: 'disponible',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push((data as Record<string, unknown>)[key]);
      }
    }

    for (const [key, col] of Object.entries(boolMap)) {
      if ((data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push((data as Record<string, unknown>)[key] ? 1 : 0);
      }
    }

    if (fields.length === 0) return this.findByUuid(uuid);

    fields.push("updated_at = datetime('now')");
    values.push(uuid);

    db.run(
      `UPDATE properties SET ${fields.join(', ')} WHERE uuid = ?`,
      ...values
    );

    return this.findByUuid(uuid);
  }

  /**
   * Toggle the disponible (available) flag on a property.
   * @param uuid - The property UUID
   * @param disponible - The new availability state
   */
  toggleDisponible(uuid: string, disponible: boolean): void {
    db.run(
      `UPDATE properties SET disponible = ?, updated_at = datetime('now') WHERE uuid = ?`,
      disponible ? 1 : 0,
      uuid
    );
  }

  /**
   * List soft-deleted properties.
   * @param limit - Max records
   * @param offset - Records to skip
   * @returns Array of deleted properties
   */
  findDeleted(limit = 50, offset = 0): { properties: PropertyRow[]; total: number } {
    const total = db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM properties WHERE deleted_at IS NOT NULL'
    )?.count ?? 0;

    const properties = db.all<PropertyRow>(
      'SELECT * FROM properties WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT ? OFFSET ?',
      limit,
      offset
    );

    return { properties, total };
  }

  // --- Features ---

  /**
   * Get all features for a property, ordered by sort_order.
   * @param propertyUuid - The property UUID
   * @returns Array of feature rows
   */
  getFeatures(propertyUuid: string): FeatureRow[] {
    return db.all<FeatureRow>(
      'SELECT * FROM property_features WHERE property_uuid = ? ORDER BY sort_order',
      propertyUuid
    );
  }

  /**
   * Replace all features for a property with a new list.
   * @param propertyUuid - The property UUID
   * @param features - Array of feature strings in display order
   */
  setFeatures(propertyUuid: string, features: string[]): void {
    db.transaction(() => {
      db.run('DELETE FROM property_features WHERE property_uuid = ?', propertyUuid);
      const stmt = db.prepare(
        'INSERT INTO property_features (property_uuid, feature, sort_order) VALUES (?, ?, ?)'
      );
      features.forEach((feature, idx) => {
        stmt.run(propertyUuid, feature, idx);
      });
    });
  }

  // --- Images ---

  /**
   * Get all images for a property, ordered by sort_order.
   * @param propertyUuid - The property UUID
   * @returns Array of image rows
   */
  getImages(propertyUuid: string): ImageRow[] {
    return db.all<ImageRow>(
      'SELECT * FROM property_images WHERE property_uuid = ? ORDER BY sort_order',
      propertyUuid
    );
  }

  /**
   * Add an image to a property.
   * @param propertyUuid - The property UUID
   * @param filePath - Path to the image file relative to public/
   * @param originalName - Original filename from upload
   * @returns The created image row
   */
  addImage(propertyUuid: string, filePath: string, originalName: string): ImageRow {
    const imgUuid = uuidv4();
    const maxOrder = db.get<{ max_order: number | null }>(
      'SELECT MAX(sort_order) as max_order FROM property_images WHERE property_uuid = ?',
      propertyUuid
    );
    const sortOrder = (maxOrder?.max_order ?? -1) + 1;

    db.run(
      `INSERT INTO property_images (uuid, property_uuid, file_path, original_name, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      imgUuid, propertyUuid, filePath, originalName, sortOrder
    );

    return db.get<ImageRow>('SELECT * FROM property_images WHERE uuid = ?', imgUuid)!;
  }

  /**
   * Remove an image by its UUID.
   * @param imageUuid - The image UUID
   */
  removeImage(imageUuid: string): void {
    db.run('DELETE FROM property_images WHERE uuid = ?', imageUuid);
  }

  /**
   * Reorder images for a property.
   * @param propertyUuid - The property UUID
   * @param imageUuids - Array of image UUIDs in the desired order
   */
  reorderImages(propertyUuid: string, imageUuids: string[]): void {
    db.transaction(() => {
      const stmt = db.prepare(
        'UPDATE property_images SET sort_order = ? WHERE uuid = ? AND property_uuid = ?'
      );
      imageUuids.forEach((imgUuid, idx) => {
        stmt.run(idx, imgUuid, propertyUuid);
      });
    });
  }

  // --- Stats ---

  /**
   * Get aggregate statistics for the dashboard.
   * @returns Object with counts of total, active, paused, emprendimientos
   */
  getStats(): {
    total: number;
    active: number;
    paused: number;
    emprendimientos: number;
    propiedades: number;
  } {
    const total = this.count('deleted_at IS NULL');
    const active = this.count('deleted_at IS NULL AND disponible = 1');
    const paused = this.count('deleted_at IS NULL AND disponible = 0');
    const emprendimientos = this.count('deleted_at IS NULL AND is_emprendimiento = 1');
    const propiedades = this.count('deleted_at IS NULL AND is_emprendimiento = 0');

    return { total, active, paused, emprendimientos, propiedades };
  }

  /**
   * Get the top N most visited properties.
   * @param limit - Number of properties to return (default 10)
   * @returns Array of properties with visit counts
   */
  getTopVisited(limit = 10): (PropertyRow & { visit_count: number })[] {
    return db.all<PropertyRow & { visit_count: number }>(
      `SELECT p.*, COUNT(v.id) as visit_count
       FROM properties p
       LEFT JOIN property_visits v ON v.property_uuid = p.uuid
       WHERE p.deleted_at IS NULL
       GROUP BY p.uuid
       ORDER BY visit_count DESC
       LIMIT ?`,
      limit
    );
  }

  /**
   * Get the top N most clicked properties.
   * @param limit - Number of properties to return (default 10)
   * @returns Array of properties with click counts
   */
  getTopClicked(limit = 10): (PropertyRow & { click_count: number })[] {
    return db.all<PropertyRow & { click_count: number }>(
      `SELECT p.*, COUNT(c.id) as click_count
       FROM properties p
       LEFT JOIN property_clicks c ON c.property_uuid = p.uuid
       WHERE p.deleted_at IS NULL
       GROUP BY p.uuid
       ORDER BY click_count DESC
       LIMIT ?`,
      limit
    );
  }
}

export const propertyRepository = new PropertyRepository();
export default propertyRepository;
