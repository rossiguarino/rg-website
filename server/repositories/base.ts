import db from '../db/index';

/**
 * Base repository providing common CRUD operations.
 * All domain repositories extend this for consistent database access patterns.
 * Supports soft-delete via the `deleted_at` column.
 */
export class BaseRepository<T extends Record<string, unknown> = Record<string, unknown>> {
  protected tableName: string;

  /**
   * @param tableName - The database table this repository operates on
   */
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find a single record by its UUID.
   * @param uuid - The UUID to look up
   * @returns The matching record or undefined
   */
  findByUuid(uuid: string): T | undefined {
    return db.get<T>(`SELECT * FROM ${this.tableName} WHERE uuid = ?`, uuid);
  }

  /**
   * Find all records with optional filtering, ordering, and pagination.
   * By default, soft-deleted records are excluded.
   * @param options - Query options
   * @param options.includeDeleted - If true, include soft-deleted records
   * @param options.orderBy - SQL ORDER BY clause (e.g. 'created_at DESC')
   * @param options.limit - Maximum number of records to return
   * @param options.offset - Number of records to skip
   * @returns Array of matching records
   */
  findAll(options?: {
    includeDeleted?: boolean;
    orderBy?: string;
    limit?: number;
    offset?: number;
  }): T[] {
    const { includeDeleted = false, orderBy = 'created_at DESC', limit, offset } = options || {};

    let sql = `SELECT * FROM ${this.tableName}`;
    if (!includeDeleted) {
      sql += ` WHERE deleted_at IS NULL`;
    }
    sql += ` ORDER BY ${orderBy}`;
    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
    }
    if (offset !== undefined) {
      sql += ` OFFSET ${offset}`;
    }

    return db.all<T>(sql);
  }

  /**
   * Count records in the table, optionally with a WHERE clause.
   * @param where - Optional SQL WHERE clause (without the WHERE keyword)
   * @returns The count of matching records
   */
  count(where?: string): number {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    const result = db.get<{ count: number }>(sql);
    return result?.count ?? 0;
  }

  /**
   * Soft delete a record by setting its deleted_at timestamp.
   * @param uuid - The UUID of the record to soft delete
   */
  softDelete(uuid: string): void {
    db.run(
      `UPDATE ${this.tableName} SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE uuid = ?`,
      uuid
    );
  }

  /**
   * Restore a previously soft-deleted record by clearing deleted_at.
   * @param uuid - The UUID of the record to restore
   */
  restore(uuid: string): void {
    db.run(
      `UPDATE ${this.tableName} SET deleted_at = NULL, updated_at = datetime('now') WHERE uuid = ?`,
      uuid
    );
  }
}

export default BaseRepository;
