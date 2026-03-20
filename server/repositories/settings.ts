import db from '../db/index';

/** Database row shape for the settings table */
export interface SettingRow {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

/**
 * Repository for key-value application settings.
 * Used for configurable site-wide options stored in the database.
 */
export class SettingsRepository {
  /**
   * Get a single setting by its key.
   * @param key - The setting key
   * @returns The setting value or null if not found
   */
  get(key: string): string | null {
    const row = db.get<SettingRow>('SELECT * FROM settings WHERE key = ?', key);
    return row?.value ?? null;
  }

  /**
   * Set a setting value, creating it if it doesn't exist.
   * @param key - The setting key
   * @param value - The value to store
   */
  set(key: string, value: string | null): void {
    const existing = db.get<SettingRow>('SELECT id FROM settings WHERE key = ?', key);

    if (existing) {
      db.run(
        `UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?`,
        value,
        key
      );
    } else {
      db.run(
        `INSERT INTO settings (key, value) VALUES (?, ?)`,
        key,
        value
      );
    }
  }

  /**
   * Get all settings as an array of key-value rows.
   * @returns Array of all setting rows
   */
  getAll(): SettingRow[] {
    return db.all<SettingRow>('SELECT * FROM settings ORDER BY key');
  }

  /**
   * Get all settings as a simple key-value object.
   * @returns Object mapping setting keys to their values
   */
  getAllAsObject(): Record<string, string | null> {
    const rows = this.getAll();
    const result: Record<string, string | null> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }
}

export const settingsRepository = new SettingsRepository();
export default settingsRepository;
