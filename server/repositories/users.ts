import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index';
import { BaseRepository } from './base';

/** Database row shape for the users table */
export interface UserRow {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: 'admin' | 'collaborator';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Data required to create a new user */
export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'admin' | 'collaborator';
}

/** Data allowed when updating a user */
export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'collaborator';
}

/**
 * Repository for user CRUD operations.
 * Handles password hashing and user search.
 */
export class UserRepository extends BaseRepository<UserRow> {
  constructor() {
    super('users');
  }

  /**
   * Find a user by their email address.
   * @param email - The email to look up
   * @returns The user record or undefined
   */
  findByEmail(email: string): UserRow | undefined {
    return db.get<UserRow>(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      email
    );
  }

  /**
   * Create a new user with a hashed password.
   * @param data - The user creation data
   * @returns The newly created user record
   */
  create(data: CreateUserData): UserRow {
    const uuid = uuidv4();
    const passwordHash = bcrypt.hashSync(data.password, 10);

    db.run(
      `INSERT INTO users (uuid, first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      uuid,
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      passwordHash,
      data.role
    );

    return this.findByUuid(uuid)!;
  }

  /**
   * Update an existing user's profile fields.
   * @param uuid - The user's UUID
   * @param data - The fields to update
   * @returns The updated user record or undefined if not found
   */
  update(uuid: string, data: UpdateUserData): UserRow | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.first_name !== undefined) { fields.push('first_name = ?'); values.push(data.first_name); }
    if (data.last_name !== undefined) { fields.push('last_name = ?'); values.push(data.last_name); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }

    if (fields.length === 0) return this.findByUuid(uuid);

    fields.push("updated_at = datetime('now')");
    values.push(uuid);

    db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE uuid = ?`,
      ...values
    );

    return this.findByUuid(uuid);
  }

  /**
   * Change a user's password.
   * @param uuid - The user's UUID
   * @param newPassword - The new plaintext password to hash and store
   */
  changePassword(uuid: string, newPassword: string): void {
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    db.run(
      `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE uuid = ?`,
      passwordHash,
      uuid
    );
  }

  /**
   * List users with optional search across name and email.
   * @param options - Search and pagination options
   * @param options.search - Text to search in first_name, last_name, or email
   * @param options.limit - Maximum records to return
   * @param options.offset - Records to skip
   * @returns Array of user records (excluding soft-deleted)
   */
  list(options?: { search?: string; limit?: number; offset?: number }): { users: UserRow[]; total: number } {
    const { search, limit = 50, offset = 0 } = options || {};

    let whereClauses = ['deleted_at IS NULL'];
    const params: unknown[] = [];

    if (search) {
      whereClauses.push(
        `(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`
      );
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const where = whereClauses.join(' AND ');

    const total = db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE ${where}`,
      ...params
    )?.count ?? 0;

    const users = db.all<UserRow>(
      `SELECT * FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    return { users, total };
  }

  /**
   * Verify a plaintext password against the stored hash.
   * @param user - The user record containing the hash
   * @param password - The plaintext password to check
   * @returns True if the password matches
   */
  verifyPassword(user: UserRow, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  }
}

export const userRepository = new UserRepository();
export default userRepository;
