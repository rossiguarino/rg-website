import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository, UserRow } from '../repositories/users';

/** The JWT secret used for signing and verifying tokens */
const JWT_SECRET = process.env.JWT_SECRET || 'rg-propiedades-dev-secret-2024';

/** JWT payload shape after verification */
export interface JwtPayload {
  uuid: string;
  email: string;
  role: string;
}

/** Extended Request type that includes the authenticated user */
export interface AuthenticatedRequest extends Request {
  user?: UserRow;
}

/**
 * Express middleware that verifies a JWT Bearer token from the Authorization header.
 * On success, attaches the full user record to `req.user`.
 * On failure, responds with 401 Unauthorized.
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No se proporcionó token de autenticación.' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = userRepository.findByUuid(payload.uuid);

    if (!user || user.deleted_at) {
      res.status(401).json({ error: 'Usuario no encontrado o desactivado.' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

/**
 * Sign a JWT token for a user.
 * @param user - The user record to encode in the token
 * @returns A signed JWT string valid for 24 hours
 */
export function signToken(user: UserRow): string {
  const payload: JwtPayload = {
    uuid: user.uuid,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export { JWT_SECRET };
