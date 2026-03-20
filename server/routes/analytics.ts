import { Router, Request, Response } from 'express';
import { analyticsRepository } from '../repositories/analytics';
import db from '../db/index';

const router = Router();

/**
 * Extract the client IP address from the request,
 * considering common proxy headers.
 * @param req - The Express request
 * @returns The client IP string
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * POST /api/analytics/visit
 * Record a page visit for a property. Public endpoint, no auth required.
 * Body: { property_uuid: string, page_path?: string }
 */
router.post('/visit', (req: Request, res: Response) => {
  const { property_uuid, page_path } = req.body;

  if (!property_uuid) {
    res.status(400).json({ error: 'property_uuid es obligatorio.' });
    return;
  }

  // Verify the property exists
  const property = db.get<{ uuid: string }>('SELECT uuid FROM properties WHERE uuid = ?', property_uuid);
  if (!property) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  analyticsRepository.recordVisit(property_uuid, page_path, ip, userAgent);

  res.status(201).json({ ok: true });
});

/**
 * POST /api/analytics/click
 * Record a click event for a property. Public endpoint, no auth required.
 * Body: { property_uuid: string, click_type: string }
 */
router.post('/click', (req: Request, res: Response) => {
  const { property_uuid, click_type } = req.body;

  if (!property_uuid || !click_type) {
    res.status(400).json({ error: 'property_uuid y click_type son obligatorios.' });
    return;
  }

  // Verify the property exists
  const property = db.get<{ uuid: string }>('SELECT uuid FROM properties WHERE uuid = ?', property_uuid);
  if (!property) {
    res.status(404).json({ error: 'Propiedad no encontrada.' });
    return;
  }

  const ip = getClientIp(req);

  analyticsRepository.recordClick(property_uuid, click_type, ip);

  res.status(201).json({ ok: true });
});

export default router;
