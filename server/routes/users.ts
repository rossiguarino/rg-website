import { Router, Response } from 'express';
import { userRepository } from '../repositories/users';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { logAudit } from '../utils/logger';

const router = Router();

/**
 * GET /api/users
 * List all users with optional search. Admin only.
 * Query: ?search=&limit=&offset=
 */
router.get('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { search, limit, offset } = req.query;

  const result = userRepository.list({
    search: search as string | undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined,
  });

  res.json({
    users: result.users.map(u => ({
      uuid: u.uuid,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
    })),
    total: result.total,
  });
});

/**
 * POST /api/users
 * Create a new user. Admin only.
 * Body: { first_name, last_name, email, password, role, phone? }
 */
router.post('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { first_name, last_name, email, password, role, phone } = req.body;

  if (!first_name || !last_name || !email || !password || !role) {
    res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos.' });
    return;
  }

  if (!['admin', 'collaborator'].includes(role)) {
    res.status(400).json({ error: 'Rol inválido. Debe ser admin o collaborator.' });
    return;
  }

  const existing = userRepository.findByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    return;
  }

  const user = userRepository.create({ first_name, last_name, email, password, role, phone });

  logAudit(req.user!, 'create', 'user', user.uuid, `${user.first_name} ${user.last_name}`);

  res.status(201).json({
    uuid: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  });
});

/**
 * PUT /api/users/:uuid
 * Update a user's profile. Admin only.
 * Body: { first_name?, last_name?, email?, phone?, role? }
 */
router.put('/:uuid', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;
  const { first_name, last_name, email, phone, role } = req.body;

  const existing = userRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }

  if (email && email !== existing.email) {
    const emailTaken = userRepository.findByEmail(email);
    if (emailTaken) {
      res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
      return;
    }
  }

  if (role && !['admin', 'collaborator'].includes(role)) {
    res.status(400).json({ error: 'Rol inválido.' });
    return;
  }

  const updated = userRepository.update(uuid, { first_name, last_name, email, phone, role });

  logAudit(req.user!, 'update', 'user', uuid, `${updated!.first_name} ${updated!.last_name}`);

  res.json({
    uuid: updated!.uuid,
    first_name: updated!.first_name,
    last_name: updated!.last_name,
    email: updated!.email,
    phone: updated!.phone,
    role: updated!.role,
    updated_at: updated!.updated_at,
  });
});

/**
 * DELETE /api/users/:uuid
 * Soft delete a user. Admin only.
 */
router.delete('/:uuid', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { uuid } = req.params;

  const existing = userRepository.findByUuid(uuid);
  if (!existing || existing.deleted_at) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }

  // Prevent deleting yourself
  if (existing.uuid === req.user!.uuid) {
    res.status(400).json({ error: 'No puede eliminar su propio usuario.' });
    return;
  }

  userRepository.softDelete(uuid);
  logAudit(req.user!, 'delete', 'user', uuid, `${existing.first_name} ${existing.last_name}`);

  res.json({ message: 'Usuario eliminado correctamente.' });
});

export default router;
