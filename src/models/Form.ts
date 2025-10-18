import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface Form {
  id: string;
  name: string;
  api_key: string;
  email: string;
  redirect_url?: string;
  success_message: string;
  created_at: number;
  updated_at: number;
  active: number;
}

export class FormModel {
  static create(data: {
    name: string;
    email: string;
    redirect_url?: string;
    success_message?: string;
  }): Form {
    const id = uuidv4();
    const api_key = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO forms (id, name, api_key, email, redirect_url, success_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      api_key,
      data.email,
      data.redirect_url || null,
      data.success_message || 'Thank you for your submission!',
      now,
      now
    );

    return this.findById(id)!;
  }

  static findById(id: string): Form | undefined {
    const stmt = db.prepare('SELECT * FROM forms WHERE id = ?');
    return stmt.get(id) as Form | undefined;
  }

  static findByApiKey(api_key: string): Form | undefined {
    const stmt = db.prepare('SELECT * FROM forms WHERE api_key = ? AND active = 1');
    return stmt.get(api_key) as Form | undefined;
  }

  static findAll(): Form[] {
    const stmt = db.prepare('SELECT * FROM forms ORDER BY created_at DESC');
    return stmt.all() as Form[];
  }

  static update(id: string, data: Partial<Form>): boolean {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.redirect_url !== undefined) {
      updates.push('redirect_url = ?');
      values.push(data.redirect_url);
    }
    if (data.success_message !== undefined) {
      updates.push('success_message = ?');
      values.push(data.success_message);
    }
    if (data.active !== undefined) {
      updates.push('active = ?');
      values.push(data.active);
    }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = db.prepare(`UPDATE forms SET ${updates.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM forms WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static regenerateApiKey(id: string): string {
    const api_key = crypto.randomBytes(32).toString('hex');
    const stmt = db.prepare('UPDATE forms SET api_key = ?, updated_at = ? WHERE id = ?');
    stmt.run(api_key, Date.now(), id);
    return api_key;
  }
}