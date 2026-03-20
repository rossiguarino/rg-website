import { Router, Response } from 'express';
import { propertyRepository } from '../repositories/properties';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { logAudit } from '../utils/logger';

const router = Router();

/**
 * GET /api/properties
 * List properties with search, filtering, and pagination.
 * Query: ?search=&operacion=&tipo_propiedad=&location=&is_emprendimiento=&disponible=&destacada=&limit=&offset=&orderBy=
 */
router.get('/', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const {
    search, operacion, tipo_propiedad, location,
    is_emprendimiento, disponible, destacada,
    limit, offset, orderBy
  } = req.query;

  const result = propertyRepository.search({
    search: search as string | undefined,
    operacion: operacion as string | undefined,
    tipo_propiedad: tipo_propiedad as string | undefined,
    location: location as string | undefined,
    is_emprendimiento: is_emprendimiento !== undefined ? is_emprendimiento === 'true' : undefined,
    disponible: disponible !== undefined ? disponible === 'true' : undefined,
    destacada: destacada !== undefined ? destacada === 'true' : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined,
    orderBy: orderBy as string | undefined,
  });

  // Attach images to each property for thumbnail display in the list
  const propertiesWithImages = result.properties.map((prop) => {
    const images = propertyRepository.getImages(prop.uuid);
    return { ...prop, images };
  });

  res.json({
    properties: propertiesWithImages,
    total: result.total,
  });
});

/**
 * GET /api/properties/deleted
 * List soft-deleted properties. Admin only.
 * Query: ?limit=&offset=
 */
router.get('/deleted', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset } = req.query;

  const result = propertyRepository.findDeleted(
    limit ? parseInt(limit as string, 10) : undefined,
    offset ? parseInt(offset as string, 10) : undefined
  );

  const propertiesWithImages = result.properties.map((prop) => {
    const images = propertyRepository.getImages(prop.uuid);
    return { ...prop, images };
  });

  res.json({
    properties: propertiesWithImages,
    total: result.total,
  });
});

/**
 * GET /api/properties/:uuid
 * Get a single property with its features and images.
 */
router.get('/:uuid', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;

  const property = propertyRepository.findByUuid(uuid);
  if (!property) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  const features = propertyRepository.getFeatures(uuid);
  const images = propertyRepository.getImages(uuid);

  res.json({
    ...property,
    features: features.map(f => f.feature),
    images,
  });
});

/**
 * POST /api/properties
 * Create a new property.
 * Body: all property fields + optional features array
 */
router.post('/', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { features, ...data } = req.body;

  if (!data.slug || !data.title || !data.operacion) {
    res.status(400).json({ error: 'slug, title y operacion son obligatorios.' });
    return;
  }

  // Check slug uniqueness
  const existingSlug = propertyRepository.findBySlug(data.slug);
  if (existingSlug) {
    res.status(409).json({ error: 'Ya existe una propiedad con ese slug.' });
    return;
  }

  const property = propertyRepository.create(data);

  if (features && Array.isArray(features)) {
    propertyRepository.setFeatures(property.uuid, features);
  }

  logAudit(req.user!, 'create', 'property', property.uuid, property.title);

  const createdFeatures = propertyRepository.getFeatures(property.uuid);
  const images = propertyRepository.getImages(property.uuid);

  res.status(201).json({
    ...property,
    features: createdFeatures.map(f => f.feature),
    images,
  });
});

/**
 * PUT /api/properties/:uuid
 * Update all fields of a property.
 * Body: partial property fields + optional features array
 */
router.put('/:uuid', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;
  const { features, ...data } = req.body;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = propertyRepository.findBySlug(data.slug);
    if (slugTaken) {
      res.status(409).json({ error: 'Ya existe una propiedad con ese slug.' });
      return;
    }
  }

  const updated = propertyRepository.update(uuid, data);

  if (features && Array.isArray(features)) {
    propertyRepository.setFeatures(uuid, features);
  }

  logAudit(req.user!, 'update', 'property', uuid, updated!.title);

  const updatedFeatures = propertyRepository.getFeatures(uuid);
  const images = propertyRepository.getImages(uuid);

  res.json({
    ...updated,
    features: updatedFeatures.map(f => f.feature),
    images,
  });
});

/**
 * DELETE /api/properties/:uuid
 * Soft delete a property.
 */
router.delete('/:uuid', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  propertyRepository.softDelete(uuid);
  logAudit(req.user!, 'delete', 'property', uuid, existing.title);

  res.json({ message: 'Propiedad eliminada correctamente.' });
});

/**
 * POST /api/properties/:uuid/restore
 * Restore a soft-deleted property.
 */
router.post('/:uuid/restore', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  if (!existing.deleted_at) {
    res.status(400).json({ error: 'La propiedad no está eliminada.' });
    return;
  }

  propertyRepository.restore(uuid);
  logAudit(req.user!, 'restore', 'property', uuid, existing.title);

  res.json({ message: 'Propiedad restaurada correctamente.' });
});

/**
 * PUT /api/properties/:uuid/pause
 * Toggle the disponible flag (pause/unpause a listing).
 * Body: { disponible: boolean }
 */
router.put('/:uuid/pause', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;
  const { disponible } = req.body;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  if (typeof disponible !== 'boolean') {
    res.status(400).json({ error: 'El campo disponible debe ser boolean.' });
    return;
  }

  propertyRepository.toggleDisponible(uuid, disponible);
  logAudit(req.user!, disponible ? 'unpause' : 'pause', 'property', uuid, existing.title);

  res.json({ message: disponible ? 'Propiedad activada.' : 'Propiedad pausada.' });
});

/**
 * PUT /api/properties/:uuid/features
 * Replace all features for a property.
 * Body: { features: string[] }
 */
router.put('/:uuid/features', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;
  const { features } = req.body;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  if (!Array.isArray(features)) {
    res.status(400).json({ error: 'features debe ser un array de strings.' });
    return;
  }

  propertyRepository.setFeatures(uuid, features);
  logAudit(req.user!, 'update_features', 'property', uuid, existing.title);

  res.json({ features });
});

/**
 * PUT /api/properties/:uuid/images/reorder
 * Reorder images for a property.
 * Body: { image_uuids: string[] }
 */
router.put('/:uuid/images/reorder', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;
  const { image_uuids } = req.body;

  const existing = propertyRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  if (!Array.isArray(image_uuids)) {
    res.status(400).json({ error: 'image_uuids debe ser un array de strings.' });
    return;
  }

  propertyRepository.reorderImages(uuid, image_uuids);
  logAudit(req.user!, 'reorder_images', 'property', uuid, existing.title);

  const images = propertyRepository.getImages(uuid);
  res.json({ images });
});

export default router;
