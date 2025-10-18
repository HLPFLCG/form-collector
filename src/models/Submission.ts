import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Submission {
  id: string;
  form_id: string;
  data: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: number;
}

export interface SubmissionData {
  [key: string]: any;
}

export class SubmissionModel {
  static create(data: {
    form_id: string;
    data: SubmissionData;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
  }): Submission {
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO submissions (id, form_id, data, ip_address, user_agent, referrer, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.form_id,
      JSON.stringify(data.data),
      data.ip_address || null,
      data.user_agent || null,
      data.referrer || null,
      now
    );

    return this.findById(id)!;
  }

  static findById(id: string): Submission | undefined {
    const stmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
    return stmt.get(id) as Submission | undefined;
  }

  static findByFormId(form_id: string, limit: number = 100, offset: number = 0): Submission[] {
    const stmt = db.prepare(`
      SELECT * FROM submissions 
      WHERE form_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(form_id, limit, offset) as Submission[];
  }

  static countByFormId(form_id: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM submissions WHERE form_id = ?');
    const result = stmt.get(form_id) as { count: number };
    return result.count;
  }

  static findAll(limit: number = 100, offset: number = 0): Submission[] {
    const stmt = db.prepare(`
      SELECT * FROM submissions 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Submission[];
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM submissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByFormId(form_id: string): number {
    const stmt = db.prepare('DELETE FROM submissions WHERE form_id = ?');
    const result = stmt.run(form_id);
    return result.changes;
  }

  static getRecentSubmissions(days: number = 7): Submission[] {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const stmt = db.prepare(`
      SELECT * FROM submissions 
      WHERE created_at > ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(cutoffTime) as Submission[];
  }
}