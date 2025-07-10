import sqlite3 from 'sqlite3';
import path from 'path';

export interface ImageRecord {
  id: string;
  filename: string;
  description: string;
  width: number;
  height: number;
  uploadedAt: Date;
}

export class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../database.sqlite');
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
        CREATE TABLE IF NOT EXISTS hex_regions (
          id TEXT PRIMARY KEY,
          image_id TEXT NOT NULL,
          q INTEGER NOT NULL,
          r INTEGER NOT NULL,
          description TEXT,
          FOREIGN KEY (image_id) REFERENCES images (id),
          UNIQUE(image_id, q, r)
        )
      `);
    });
  }

  async saveImage(image: ImageRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO images (id, filename, description, width, height) VALUES (?, ?, ?, ?, ?)',
        [image.id, image.filename, image.description, image.width, image.height],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getAllImages(): Promise<ImageRecord[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM images ORDER BY uploaded_at DESC',
        [],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            filename: row.filename,
            description: row.description,
            width: row.width,
            height: row.height,
            uploadedAt: new Date(row.uploaded_at)
          })));
        }
      );
    });
  }

  async getImageById(id: string): Promise<ImageRecord | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM images WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else resolve({
            id: row.id,
            filename: row.filename,
            description: row.description,
            width: row.width,
            height: row.height,
            uploadedAt: new Date(row.uploaded_at)
          });
        }
      );
    });
  }
}