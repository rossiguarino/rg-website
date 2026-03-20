import { Router, Request, Response } from 'express';
import db from '../db/index';
import { propertyRepository } from '../repositories/properties';

const router = Router();

/**
 * GET /api/public/filter-options
 * Returns available filter values (locations, property types) for the search bar.
 */
router.get('/filter-options', (_req: Request, res: Response) => {
  const locations = db.all<{ location: string }>(
    `SELECT DISTINCT location FROM properties
     WHERE deleted_at IS NULL AND disponible = 1 AND location IS NOT NULL AND location != ''
     ORDER BY location`
  ).map((r) => r.location);

  const tiposPropiedad = db.all<{ tipo_propiedad: string }>(
    `SELECT DISTINCT tipo_propiedad FROM properties
     WHERE deleted_at IS NULL AND disponible = 1 AND tipo_propiedad IS NOT NULL AND tipo_propiedad != ''
     ORDER BY tipo_propiedad`
  ).map((r) => r.tipo_propiedad);

  const ambientes = db.all<{ ambientes: number }>(
    `SELECT DISTINCT ambientes FROM properties
     WHERE deleted_at IS NULL AND disponible = 1 AND is_emprendimiento = 0 AND ambientes > 0
     ORDER BY ambientes`
  ).map((r) => r.ambientes);

  res.json({ locations, tiposPropiedad, ambientes });
});

/**
 * GET /api/public/properties
 * List available properties for the public site.
 * Query: ?operacion=venta|alquiler&is_emprendimiento=true|false
 * No auth required. Only returns active (disponible=true, not deleted) properties.
 */
router.get('/properties', (_req: Request, res: Response) => {
  const { operacion, is_emprendimiento, tipo_propiedad, location, ambientes } = _req.query;

  const ambientesNum = ambientes ? parseInt(ambientes as string, 10) : undefined;

  const result = propertyRepository.search({
    disponible: true,
    operacion: operacion as string | undefined,
    tipo_propiedad: tipo_propiedad as string | undefined,
    location: location as string | undefined,
    ambientes: ambientesNum && ambientesNum < 4 ? ambientesNum : undefined,
    ambientes_min: ambientesNum && ambientesNum >= 4 ? ambientesNum : undefined,
    is_emprendimiento: is_emprendimiento !== undefined ? is_emprendimiento === 'true' : undefined,
    limit: 100,
    offset: 0,
  });

  // Attach images and features to each property
  const properties = result.properties.map((prop) => {
    const images = propertyRepository.getImages(prop.uuid);
    const features = propertyRepository.getFeatures(prop.uuid);
    return {
      ...prop,
      images: images.map((img) => img.file_path),
      features: features.map((f) => f.feature),
    };
  });

  res.json({ properties });
});

/**
 * GET /api/public/properties/:slug
 * Get a single property by slug for the public detail page.
 * No auth required. Only returns active properties.
 */
router.get('/properties/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;

  const property = propertyRepository.findBySlug(slug);
  if (!property || property.deleted_at || !property.disponible) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  const images = propertyRepository.getImages(property.uuid);
  const features = propertyRepository.getFeatures(property.uuid);

  res.json({
    ...property,
    images: images.map((img) => img.file_path),
    features: features.map((f) => f.feature),
  });
});

/**
 * GET /api/public/emprendimientos
 * List emprendimientos (is_emprendimiento=true) for the public site.
 * No auth required.
 */
router.get('/emprendimientos', (_req: Request, res: Response) => {
  const result = propertyRepository.search({
    disponible: true,
    is_emprendimiento: true,
    limit: 100,
    offset: 0,
  });

  const properties = result.properties.map((prop) => {
    const images = propertyRepository.getImages(prop.uuid);
    const features = propertyRepository.getFeatures(prop.uuid);
    return {
      ...prop,
      images: images.map((img) => img.file_path),
      features: features.map((f) => f.feature),
    };
  });

  res.json({ properties });
});

export default router;
