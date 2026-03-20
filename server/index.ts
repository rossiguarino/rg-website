import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from './db/index';
import { initializeSchemaFromInstance } from './db/schema';
import { seed } from './db/seed';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import propertyRoutes from './routes/properties';
import imageRoutes from './routes/images';
import auditRoutes from './routes/audit';
import dashboardRoutes from './routes/dashboard';
import analyticsRoutes from './routes/analytics';
import publicRoutes from './routes/public';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const app = express();

// --- Database initialization ---
console.log('[server] Initializing database schema...');
initializeSchemaFromInstance(db);

// Seed only if SEED_DB=true or in development (first time)
if (process.env.SEED_DB === 'true' || !IS_PRODUCTION) {
  console.log('[server] Running seed...');
  seed();
}

// --- Security middleware ---
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for SPA
  crossOriginEmbedderPolicy: false, // Allow loading images from various sources
}));

// --- CORS ---
const corsOrigin = process.env.CORS_ORIGIN || (IS_PRODUCTION ? undefined : '*');
if (IS_PRODUCTION && !process.env.CORS_ORIGIN) {
  console.warn('[server] ⚠️  CORS_ORIGIN not set in production. CORS will be restrictive by default.');
}
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// --- Rate limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en unos minutos.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Stricter limit for auth endpoints (brute force protection)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes (with rate limiting) ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/properties', apiLimiter, propertyRoutes);
app.use('/api/properties', apiLimiter, imageRoutes);
app.use('/api/audit-log', apiLimiter, auditRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/public', apiLimiter, publicRoutes);

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Serve uploaded images (S3-ready path: /uploads/properties/{uuid}/{file}) ---
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- Serve static public site files ---
const publicDir = path.join(__dirname, '..', '..', 'website');
app.use(express.static(publicDir));

// SPA fallback: serve index.html for any non-API route
app.get('/{*splat}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
    return;
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`[server] RG Propiedades API running on http://localhost:${PORT}`);
  console.log(`[server] API endpoints available at http://localhost:${PORT}/api`);
  if (IS_PRODUCTION) {
    console.log('[server] Running in PRODUCTION mode.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[server] Shutting down...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[server] Received SIGTERM, shutting down...');
  db.close();
  process.exit(0);
});

export default app;
