import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SQLite database singleton using better-sqlite3.
 * Provides a thin wrapper around the database connection
 * with WAL mode enabled for optimal concurrent read performance.
 */
class Database {
  private static instance: Database;
  private db: BetterSqlite3.Database;

  private constructor() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'rg-propiedades.db');
    this.db = new BetterSqlite3(dbPath);

    // Enable WAL mode for better concurrent read performance
    this.db.pragma('journal_mode = WAL');
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * Returns the singleton Database instance.
   * Creates the instance and opens the DB file on first call.
   */
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Execute a SQL statement that returns a single row.
   * @param sql - The SQL query string
   * @param params - Bind parameters for the query
   * @returns The first matching row, or undefined if none
   */
  get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  /**
   * Execute a SQL statement that returns multiple rows.
   * @param sql - The SQL query string
   * @param params - Bind parameters for the query
   * @returns An array of matching rows
   */
  all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  /**
   * Execute a SQL statement that modifies data (INSERT, UPDATE, DELETE).
   * @param sql - The SQL query string
   * @param params - Bind parameters for the query
   * @returns An object with `changes` (rows affected) and `lastInsertRowid`
   */
  run(sql: string, ...params: unknown[]): BetterSqlite3.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  /**
   * Execute a raw SQL string directly (useful for multi-statement scripts like schema creation).
   * @param sql - The SQL string to execute
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Run multiple operations inside a single SQLite transaction.
   * If the callback throws, the transaction is rolled back automatically.
   * @param fn - A function containing database operations to execute atomically
   * @returns The return value of the callback function
   */
  transaction<T>(fn: () => T): T {
    const trx = this.db.transaction(fn);
    return trx();
  }

  /**
   * Prepare a SQL statement for repeated execution.
   * @param sql - The SQL query string
   * @returns A prepared Statement object
   */
  prepare(sql: string): BetterSqlite3.Statement {
    return this.db.prepare(sql);
  }

  /**
   * Close the database connection. Should be called on process exit.
   */
  close(): void {
    this.db.close();
  }
}

/** Default database singleton instance */
const db = Database.getInstance();
export default db;
export { Database };
