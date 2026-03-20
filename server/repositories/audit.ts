import db from '../db/index';

/** Database row shape for the audit_log table */
export interface AuditLogRow {
  id: number;
  user_uuid: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_uuid: string | null;
  entity_name: string | null;
  details: string | null;
  created_at: string;
}

/** Filter options for audit log queries */
export interface AuditFilters {
  user_uuid?: string;
  entity_type?: string;
  entity_uuid?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Repository for audit log operations.
 * Records and queries backoffice user actions for accountability.
 */
export class AuditRepository {
  /**
   * Insert a new audit log entry.
   * @param entry - The audit log data
   */
  log(entry: {
    user_uuid: string;
    user_name: string;
    action: string;
    entity_type: string;
    entity_uuid?: string;
    entity_name?: string;
    details?: string;
  }): void {
    db.run(
      `INSERT INTO audit_log (user_uuid, user_name, action, entity_type, entity_uuid, entity_name, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      entry.user_uuid,
      entry.user_name,
      entry.action,
      entry.entity_type,
      entry.entity_uuid || null,
      entry.entity_name || null,
      entry.details || null
    );
  }

  /**
   * List audit log entries with optional filters and pagination.
   * @param filters - Filter and pagination options
   * @returns Paginated audit log entries with total count
   */
  list(filters: AuditFilters = {}): { entries: AuditLogRow[]; total: number } {
    const { user_uuid, entity_type, entity_uuid, action, from, to, limit = 50, offset = 0 } = filters;

    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (user_uuid) {
      whereClauses.push('user_uuid = ?');
      params.push(user_uuid);
    }
    if (entity_type) {
      whereClauses.push('entity_type = ?');
      params.push(entity_type);
    }
    if (entity_uuid) {
      whereClauses.push('entity_uuid = ?');
      params.push(entity_uuid);
    }
    if (action) {
      whereClauses.push('action = ?');
      params.push(action);
    }
    if (from) {
      whereClauses.push('created_at >= ?');
      params.push(from);
    }
    if (to) {
      whereClauses.push('created_at <= ?');
      params.push(to);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const total = db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_log ${where}`,
      ...params
    )?.count ?? 0;

    const entries = db.all<AuditLogRow>(
      `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    return { entries, total };
  }

  /**
   * Get all audit log entries for a specific entity.
   * @param entityType - The entity type (e.g. 'property', 'user')
   * @param entityUuid - The entity's UUID
   * @returns Array of audit log entries
   */
  getByEntity(entityType: string, entityUuid: string): AuditLogRow[] {
    return db.all<AuditLogRow>(
      'SELECT * FROM audit_log WHERE entity_type = ? AND entity_uuid = ? ORDER BY created_at DESC',
      entityType,
      entityUuid
    );
  }
}

export const auditRepository = new AuditRepository();
export default auditRepository;
