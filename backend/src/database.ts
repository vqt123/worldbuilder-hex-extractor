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

export interface HexContribution {
  id: string;
  imageId: string;
  q: number;
  r: number;
  description: string;
  contributedImageFilename?: string;
  contributorName?: string;
  contributedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  parentImageId?: string;
  zoomLevel: number;
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
          contributed_image_filename TEXT,
          contributor_name TEXT,
          contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending',
          parent_image_id TEXT,
          zoom_level INTEGER DEFAULT 1,
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

  // Hex contribution methods
  async saveHexContribution(contribution: HexContribution): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO hex_regions (
          id, image_id, q, r, description, contributed_image_filename,
          contributor_name, status, parent_image_id, zoom_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          contribution.id,
          contribution.imageId,
          contribution.q,
          contribution.r,
          contribution.description,
          contribution.contributedImageFilename,
          contribution.contributorName,
          contribution.status,
          contribution.parentImageId,
          contribution.zoomLevel
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getHexContribution(imageId: string, q: number, r: number): Promise<HexContribution | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM hex_regions WHERE image_id = ? AND q = ? AND r = ?',
        [imageId, q, r],
        (err, row: any) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else resolve({
            id: row.id,
            imageId: row.image_id,
            q: row.q,
            r: row.r,
            description: row.description,
            contributedImageFilename: row.contributed_image_filename,
            contributorName: row.contributor_name,
            contributedAt: new Date(row.contributed_at),
            status: row.status,
            parentImageId: row.parent_image_id,
            zoomLevel: row.zoom_level
          });
        }
      );
    });
  }

  async getHexContributionsByImage(imageId: string): Promise<HexContribution[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM hex_regions WHERE image_id = ? ORDER BY contributed_at DESC',
        [imageId],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            id: row.id,
            imageId: row.image_id,
            q: row.q,
            r: row.r,
            description: row.description,
            contributedImageFilename: row.contributed_image_filename,
            contributorName: row.contributor_name,
            contributedAt: new Date(row.contributed_at),
            status: row.status,
            parentImageId: row.parent_image_id,
            zoomLevel: row.zoom_level
          })));
        }
      );
    });
  }

  async updateHexContribution(id: string, updates: Partial<HexContribution>): Promise<void> {
    return new Promise((resolve, reject) => {
      const updateFields = [];
      const updateValues = [];

      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updates.description);
      }
      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.contributedImageFilename !== undefined) {
        updateFields.push('contributed_image_filename = ?');
        updateValues.push(updates.contributedImageFilename);
      }

      if (updateFields.length === 0) {
        resolve();
        return;
      }

      updateValues.push(id);

      this.db.run(
        `UPDATE hex_regions SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Context helper methods
  async getHexContext(imageId: string, q: number, r: number): Promise<any> {
    // For now, assume Level 1 hexes - in future this would calculate actual hierarchy
    const level = 1;
    
    // Get current hex
    const currentHex = await this.getHexContribution(imageId, q, r);
    
    // Get parent (the world/image description that this hex belongs to)
    const parentImage = await this.getImageById(imageId);
    const parent = parentImage ? {
      description: parentImage.description,
      type: 'world'
    } : null;
    
    // Get sibling hexes (surrounding hexes)
    const siblings = await this.getSiblingHexes(imageId, q, r);
    
    // Create formatted text summary
    const textSummary = this.formatContextSummary(q, r, level, parent, siblings);
    
    return {
      current: { q, r, level },
      parent,
      siblings,
      textSummary
    };
  }

  async getSiblingHexes(imageId: string, centerQ: number, centerR: number): Promise<any[]> {
    // Get surrounding hex coordinates (6 neighbors in hex grid)
    const neighborCoords = [
      { q: centerQ + 1, r: centerR },     // East
      { q: centerQ + 1, r: centerR - 1 }, // Northeast  
      { q: centerQ, r: centerR - 1 },     // Northwest
      { q: centerQ - 1, r: centerR },     // West
      { q: centerQ - 1, r: centerR + 1 }, // Southwest
      { q: centerQ, r: centerR + 1 }      // Southeast
    ];

    const siblings = [];
    for (const coord of neighborCoords) {
      const contribution = await this.getHexContribution(imageId, coord.q, coord.r);
      siblings.push({
        q: coord.q,
        r: coord.r,
        description: contribution ? contribution.description : null,
        hasContribution: !!contribution
      });
    }

    return siblings;
  }

  private formatContextSummary(q: number, r: number, level: number, parent: any, siblings: any[]): string {
    let summary = `Current Hex: Q=${q}, R=${r} (Level ${level})\n\n`;
    
    if (parent && parent.type === 'world') {
      summary += `World Context: ${parent.description}\n\n`;
    } else if (parent) {
      summary += `Parent: Q=${parent.q}, R=${parent.r} - "${parent.description}"\n\n`;
    } else {
      summary += `Parent: None (Top level hex)\n\n`;
    }
    
    summary += `Siblings:\n`;
    for (const sibling of siblings) {
      const desc = sibling.description || "No description yet";
      summary += `- Q=${sibling.q}, R=${sibling.r}: "${desc}"\n`;
    }
    
    return summary;
  }
}