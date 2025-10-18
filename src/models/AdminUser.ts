import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
}

export class AdminUserModel {
  static async create(email: string, password: string): Promise<AdminUser> {
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, email, password_hash, now);
    return this.findById(id)!;
  }

  static findById(id: string): AdminUser | undefined {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE id = ?');
    return stmt.get(id) as AdminUser | undefined;
  }

  static findByEmail(email: string): AdminUser | undefined {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
    return stmt.get(email) as AdminUser | undefined;
  }

  static async verifyPassword(email: string, password: string): Promise<AdminUser | null> {
    const user = this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const stmt = db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
    const result = stmt.run(password_hash, id);
    return result.changes > 0;
  }

  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM admin_users');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}