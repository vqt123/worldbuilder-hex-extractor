import { Database } from './Database';
import { ImageRecord } from '../types';

export class ImageRepository extends Database {
  async saveImage(image: ImageRecord): Promise<void> {
    await this.run(
      'INSERT INTO images (id, filename, description, width, height) VALUES (?, ?, ?, ?, ?)',
      [image.id, image.filename, image.description, image.width, image.height]
    );
  }

  async getAllImages(): Promise<ImageRecord[]> {
    const rows = await this.query<any>(
      'SELECT * FROM images ORDER BY uploaded_at DESC'
    );
    
    return rows.map(row => ({
      id: row.id,
      filename: row.filename,
      description: row.description,
      width: row.width,
      height: row.height,
      uploadedAt: new Date(row.uploaded_at)
    }));
  }

  async getImageById(id: string): Promise<ImageRecord | null> {
    const row = await this.get<any>(
      'SELECT * FROM images WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    
    return {
      id: row.id,
      filename: row.filename,
      description: row.description,
      width: row.width,
      height: row.height,
      uploadedAt: new Date(row.uploaded_at)
    };
  }
}