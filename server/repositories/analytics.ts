import db from '../db/index';
import crypto from 'crypto';

/** Database row shape for property_visits */
export interface VisitRow {
  id: number;
  property_uuid: string;
  page_path: string | null;
  visited_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

/** Database row shape for property_clicks */
export interface ClickRow {
  id: number;
  property_uuid: string;
  click_type: string;
  clicked_at: string;
  ip_hash: string | null;
}

/** Daily aggregate shape */
export interface DailyCount {
  date: string;
  count: number;
}

/**
 * Hash an IP address for privacy-preserving analytics.
 * Uses SHA-256 with a daily salt so hashes rotate each day.
 * @param ip - The raw IP address
 * @returns A hex-encoded hash string
 */
function hashIp(ip: string): string {
  const daySalt = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(`${ip}:${daySalt}`).digest('hex').slice(0, 16);
}

/**
 * Repository for anonymous visit and click analytics.
 * All IP addresses are hashed before storage for privacy.
 */
export class AnalyticsRepository {
  /**
   * Record a page visit for a property.
   * @param propertyUuid - The property being visited
   * @param pagePath - The page path (e.g. /emprendimientos/a487)
   * @param ip - The visitor's IP (will be hashed)
   * @param userAgent - The visitor's User-Agent string
   */
  recordVisit(propertyUuid: string, pagePath?: string, ip?: string, userAgent?: string): void {
    db.run(
      `INSERT INTO property_visits (property_uuid, page_path, ip_hash, user_agent)
       VALUES (?, ?, ?, ?)`,
      propertyUuid,
      pagePath || null,
      ip ? hashIp(ip) : null,
      userAgent || null
    );
  }

  /**
   * Record a click event for a property (e.g. WhatsApp, phone, email).
   * @param propertyUuid - The property that was clicked on
   * @param clickType - The type of click action
   * @param ip - The visitor's IP (will be hashed)
   */
  recordClick(propertyUuid: string, clickType: string, ip?: string): void {
    db.run(
      `INSERT INTO property_clicks (property_uuid, click_type, ip_hash)
       VALUES (?, ?, ?)`,
      propertyUuid,
      clickType,
      ip ? hashIp(ip) : null
    );
  }

  /**
   * Get total visit count for a property.
   * @param propertyUuid - The property UUID
   * @returns Total number of visits
   */
  getVisitsByProperty(propertyUuid: string): number {
    const result = db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM property_visits WHERE property_uuid = ?',
      propertyUuid
    );
    return result?.count ?? 0;
  }

  /**
   * Get total click count for a property, optionally by click type.
   * @param propertyUuid - The property UUID
   * @param clickType - Optional filter by click type
   * @returns Total number of clicks
   */
  getClicksByProperty(propertyUuid: string, clickType?: string): number {
    let sql = 'SELECT COUNT(*) as count FROM property_clicks WHERE property_uuid = ?';
    const params: unknown[] = [propertyUuid];

    if (clickType) {
      sql += ' AND click_type = ?';
      params.push(clickType);
    }

    const result = db.get<{ count: number }>(sql, ...params);
    return result?.count ?? 0;
  }

  /**
   * Get daily visit counts for the last N days.
   * @param days - Number of days to look back (default 30)
   * @returns Array of date/count pairs
   */
  getDailyVisits(days = 30): DailyCount[] {
    return db.all<DailyCount>(
      `SELECT DATE(visited_at) as date, COUNT(*) as count
       FROM property_visits
       WHERE visited_at >= datetime('now', ?)
       GROUP BY DATE(visited_at)
       ORDER BY date ASC`,
      `-${days} days`
    );
  }

  /**
   * Get daily click counts for the last N days.
   * @param days - Number of days to look back (default 30)
   * @returns Array of date/count pairs
   */
  getDailyClicks(days = 30): DailyCount[] {
    return db.all<DailyCount>(
      `SELECT DATE(clicked_at) as date, COUNT(*) as count
       FROM property_clicks
       WHERE clicked_at >= datetime('now', ?)
       GROUP BY DATE(clicked_at)
       ORDER BY date ASC`,
      `-${days} days`
    );
  }

  /**
   * Get total visits across all properties.
   * @returns Total visit count
   */
  getTotalVisits(): number {
    const result = db.get<{ count: number }>('SELECT COUNT(*) as count FROM property_visits');
    return result?.count ?? 0;
  }

  /**
   * Get total clicks across all properties.
   * @returns Total click count
   */
  getTotalClicks(): number {
    const result = db.get<{ count: number }>('SELECT COUNT(*) as count FROM property_clicks');
    return result?.count ?? 0;
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
