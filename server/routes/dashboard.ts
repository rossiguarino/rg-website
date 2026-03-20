import { Router, Response } from 'express';
import { propertyRepository } from '../repositories/properties';
import { analyticsRepository } from '../repositories/analytics';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * GET /api/dashboard/stats
 * Get aggregate counters and metrics for the dashboard overview.
 */
router.get('/stats', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const propertyStats = propertyRepository.getStats();
  const totalVisits = analyticsRepository.getTotalVisits();
  const totalClicks = analyticsRepository.getTotalClicks();

  res.json({
    properties: propertyStats,
    analytics: {
      total_visits: totalVisits,
      total_clicks: totalClicks,
    },
  });
});

/**
 * GET /api/dashboard/top-visited
 * Get the top 10 most visited properties.
 * Query: ?limit= (default 10)
 */
router.get('/top-visited', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  const properties = propertyRepository.getTopVisited(limit);

  res.json({
    properties: properties.map(p => ({
      uuid: p.uuid,
      title: p.title,
      slug: p.slug,
      location: p.location,
      is_emprendimiento: p.is_emprendimiento,
      visit_count: p.visit_count,
    })),
  });
});

/**
 * GET /api/dashboard/top-clicked
 * Get the top 10 most clicked properties.
 * Query: ?limit= (default 10)
 */
router.get('/top-clicked', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  const properties = propertyRepository.getTopClicked(limit);

  res.json({
    properties: properties.map(p => ({
      uuid: p.uuid,
      title: p.title,
      slug: p.slug,
      location: p.location,
      is_emprendimiento: p.is_emprendimiento,
      click_count: p.click_count,
    })),
  });
});

/**
 * GET /api/dashboard/daily-visits
 * Get daily visit counts for the last 30 days.
 * Query: ?days= (default 30)
 */
router.get('/daily-visits', authenticate, requireRole('admin', 'collaborator'), (req: AuthenticatedRequest, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;

  const visits = analyticsRepository.getDailyVisits(days);
  const clicks = analyticsRepository.getDailyClicks(days);

  res.json({ visits, clicks });
});

export default router;
