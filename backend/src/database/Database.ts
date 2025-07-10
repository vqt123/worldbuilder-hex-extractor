import sqlite3 from 'sqlite3';
import path from 'path';

export class Database {
  protected db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../../database.sqlite');
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS images (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          description TEXT,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if hex_regions table exists and needs migration
      this.db.run(`
        CREATE TABLE IF NOT EXISTS hex_regions (
          id TEXT PRIMARY KEY,
          image_id TEXT NOT NULL,
          q INTEGER NOT NULL,
          r INTEGER NOT NULL,
          description TEXT,
          contributed_image_filename TEXT,
          contributor_name TEXT,
          user_id TEXT,
          contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending',
          parent_image_id TEXT,
          zoom_level INTEGER DEFAULT 1,
          FOREIGN KEY (image_id) REFERENCES images (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Migration: Remove UNIQUE constraint if it exists (SQLite doesn't support DROP CONSTRAINT)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS hex_regions_new (
          id TEXT PRIMARY KEY,
          image_id TEXT NOT NULL,
          q INTEGER NOT NULL,
          r INTEGER NOT NULL,
          description TEXT,
          contributed_image_filename TEXT,
          contributor_name TEXT,
          user_id TEXT,
          contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending',
          parent_image_id TEXT,
          zoom_level INTEGER DEFAULT 1,
          FOREIGN KEY (image_id) REFERENCES images (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Copy existing data to new table if migration needed
      this.db.run(`
        INSERT OR IGNORE INTO hex_regions_new 
        SELECT id, image_id, q, r, description, contributed_image_filename, 
               contributor_name, NULL as user_id, contributed_at, status, 
               parent_image_id, zoom_level 
        FROM hex_regions
      `);

      // Replace old table with new one
      this.db.run(`DROP TABLE IF EXISTS hex_regions_old`);
      this.db.run(`ALTER TABLE hex_regions RENAME TO hex_regions_old`);
      this.db.run(`ALTER TABLE hex_regions_new RENAME TO hex_regions`);
    });
  }

  protected query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  protected get<T>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row: any) => {
        if (err) reject(err);
        else resolve(row ? (row as T) : null);
      });
    });
  }

  protected run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}