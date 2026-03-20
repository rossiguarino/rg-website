import express from 'express';
import cors from 'cors';
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
const app = express();

// --- Database initialization ---
console.log('[server] Initializing database schema...');
initializeSchemaFromInstance(db);

console.log('[server] Running seed...');
seed();

// --- Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/properties', imageRoutes);
app.use('/api/audit-log', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

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
