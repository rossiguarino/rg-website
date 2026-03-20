import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { propertyRepository } from '../repositories/properties';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { logAudit } from '../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Base directory for uploaded images. */
const UPLOADS_BASE = path.join(__dirname, '..', '..', 'uploads', 'properties');

/**
 * Multer storage configuration.
 * Files are saved to: uploads/properties/{property_uuid}/{uuid}{ext}
 * This structure is S3-ready: the path becomes the object key.
 */
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const propertyUuid = req.params.uuid;
    const dir = path.join(UPLOADS_BASE, propertyUuid);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const imageUuid = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${imageUuid}${ext}`);
  },
});

/** Allowed image MIME types. */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

/** Max file size: 10MB. */
const MAX_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Usar JPEG, PNG, WebP, AVIF o GIF.`));
    }
  },
});

const router = Router();

/**
 * POST /api/properties/:uuid/images
 * Upload one or more images for a property.
 * Accepts multipart/form-data with field name "images".
 * Max 10 files per request.
 */
router.post(
  '/:uuid/images',
  authenticate,
  requireRole('admin', 'collaborator'),
  (req: AuthenticatedRequest, res: Response) => {
    const { uuid } = req.params;

    // Verify property exists
    const property = propertyRepository.findByUuid(uuid);
    if (!property || property.deleted_at) {
      res.status(404).json({ error: 'Propiedad no encontrada.' });
      return;
    }

    // Handle upload with multer
    const uploadMiddleware = upload.array('images', 10);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'El archivo excede el tamaño máximo de 10MB.' });
            return;
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({ error: 'Máximo 10 imágenes por solicitud.' });
            return;
          }
        }
        res.status(400).json({ error: err.message || 'Error al subir imágenes.' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No se enviaron imágenes.' });
        return;
      }

      // Save each file reference in the database
      const savedImages = files.map((file) => {
        // Store path relative to uploads/ — S3-ready (becomes the object key)
        const relativePath = `uploads/properties/${uuid}/${file.filename}`;
        return propertyRepository.addImage(uuid, relativePath, file.originalname);
      });

      logAudit(
        req.user!,
        'upload_images',
        'property',
        uuid,
        property.title,
        JSON.stringify({ count: files.length, files: files.map((f) => f.originalname) })
      );

      res.status(201).json({ images: savedImages });
    });
  }
);

/**
 * DELETE /api/properties/:uuid/images/:imageUuid
 * Delete a single image (file + database record).
 */
router.delete(
  '/:uuid/images/:imageUuid',
  authenticate,
  requireRole('admin', 'collaborator'),
  (req: AuthenticatedRequest, res: Response) => {
    const { uuid, imageUuid } = req.params;

    const property = propertyRepository.findByUuid(uuid);
    if (!property || property.deleted_at) {
      res.status(404).json({ error: 'Propiedad no encontrada.' });
      return;
    }

    // Find the image in DB
    const images = propertyRepository.getImages(uuid);
    const image = images.find((img) => img.uuid === imageUuid);
    if (!image) {
      res.status(404).json({ error: 'Imagen no encontrada.' });
      return;
    }

    // Delete the physical file
    const absolutePath = path.join(__dirname, '..', '..', image.file_path);
    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (fsErr) {
      console.error(`[images] Error deleting file ${absolutePath}:`, fsErr);
      // Continue even if file delete fails — still remove DB record
    }

    // Remove from database
    propertyRepository.removeImage(imageUuid);

    logAudit(
      req.user!,
      'delete_image',
      'property',
      uuid,
      property.title,
      JSON.stringify({ imageUuid, originalName: image.original_name })
    );

    res.json({ message: 'Imagen eliminada correctamente.' });
  }
);

export default router;
