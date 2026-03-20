import { Router, Response } from 'express';
import { auditRepository } from '../repositories/audit';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * GET /api/audit-log
 * List audit log entries with optional filters. Admin only.
 * Query: ?user_uuid=&entity_type=&entity_uuid=&action=&from=&to=&limit=&offset=
 */
router.get('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { user_uuid, entity_type, entity_uuid, action, from, to, limit, offset } = req.query;

  const result = auditRepository.list({
    user_uuid: user_uuid as string | undefined,
    entity_type: entity_type as string | undefined,
    entity_uuid: entity_uuid as string | undefined,
    action: action as string | undefined,
    from: from as string | undefined,
    to: to as string | undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined,
  });

  res.json({
    entries: result.entries,
    total: result.total,
  });
});

/**
 * GET /api/audit-log/property/:uuid
 * Get audit history for a specific property.
 */
router.get('/property/:uuid', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;

  const entries = auditRepository.getByEntity('property', uuid);

  res.json({ entries });
});

export default router;
