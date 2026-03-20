import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Express middleware factory that restricts access to users with specific roles.
 * Must be used after the `authenticate` middleware so that `req.user` is available.
 *
 * @param allowedRoles - One or more role strings that are permitted to access the route
 * @returns Express middleware that checks the user's role
 *
 * @example
 * // Admin-only route
 * router.get('/users', authenticate, requireRole('admin'), handler);
 *
 * @example
 * // Both admin and collaborator
 * router.get('/properties', authenticate, requireRole('admin', 'collaborator'), handler);
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tiene permisos para realizar esta acción.' });
      return;
    }

    next();
  };
}
