import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './database/forms.db';
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Forms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      redirect_url TEXT,
      success_message TEXT DEFAULT 'Thank you for your submission!',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      active INTEGER DEFAULT 1
    )
  `);

  // Submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
    CREATE INDEX IF NOT EXISTS idx_forms_api_key ON forms(api_key);
  `);

  console.log('✅ Database initialized successfully');
}

export default db;