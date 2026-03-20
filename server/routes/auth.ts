import { Router, Response } from 'express';
import { userRepository } from '../repositories/users';
import { authenticate, signToken, AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/logger';

const router = Router();

/**
 * POST /api/auth/login
 * Validate user credentials and return a JWT token with user data.
 * Body: { email: string, password: string }
 */
router.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    return;
  }

  const user = userRepository.findByEmail(email);

  if (!user) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  if (!userRepository.verifyPassword(user, password)) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  const token = signToken(user);

  logAudit(user, 'login', 'session');

  res.json({
    token,
    user: {
      uuid: user.uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user's data from the JWT.
 * Requires: Bearer token
 */
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  res.json({
    uuid: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  });
});

export default router;
