import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
      
      // Initialize root data if database is empty
      this.initializeRootData();
    });
  }

  private initializeRootData(): void {
    // Check if we already have images (skip if database has data)
    this.db.get('SELECT COUNT(*) as count FROM images', [], (err, row: any) => {
      if (err) {
        console.error('Error checking image count:', err);
        return;
      }
      
      if (row.count === 0) {
        // Database is empty, initialize with root data
        this.loadRootData();
      }
    });
  }

  private loadRootData(): void {
    try {
      // Load root description
      const rootDescriptionPath = path.join(__dirname, '../../../rootDescription.txt');
      const rootImagePath = path.join(__dirname, '../../../rootImage.png');
      
      if (!fs.existsSync(rootDescriptionPath) || !fs.existsSync(rootImagePath)) {
        console.warn('Root files not found, skipping root data initialization');
        return;
      }
      
      const rootDescription = fs.readFileSync(rootDescriptionPath, 'utf-8');
      const rootImageStats = fs.statSync(rootImagePath);
      
      // Generate root image ID
      const rootImageId = uuidv4();
      const rootImageFilename = `${rootImageId}-rootImage.png`;
      
      // Copy root image to uploads directory
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const targetImagePath = path.join(uploadsDir, rootImageFilename);
      fs.copyFileSync(rootImagePath, targetImagePath);
      
      // Get image dimensions (assuming it's 1024x1024, could use image library if needed)
      const imageWidth = 1024;
      const imageHeight = 1024;
      
      // Insert root image into database
      this.db.run(`
        INSERT INTO images (id, filename, description, width, height, uploaded_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        rootImageId,
        rootImageFilename,
        rootDescription,
        imageWidth,
        imageHeight,
        new Date().toISOString()
      ], (err) => {
        if (err) {
          console.error('Error inserting root image:', err);
        } else {
          console.log('✅ Root image and description initialized successfully');
        }
      });
      
    } catch (error) {
      console.error('Error loading root data:', error);
    }
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