"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
class Database {
    constructor() {
        const dbPath = path_1.default.join(__dirname, '../database.sqlite');
        this.db = new sqlite3_1.default.Database(dbPath);
        this.initializeDatabase();
    }
    initializeDatabase() {
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
    async saveImage(image) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO images (id, filename, description, width, height) VALUES (?, ?, ?, ?, ?)', [image.id, image.filename, image.description, image.width, image.height], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getAllImages() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM images ORDER BY uploaded_at DESC', [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => ({
                        id: row.id,
                        filename: row.filename,
                        description: row.description,
                        width: row.width,
                        height: row.height,
                        uploadedAt: new Date(row.uploaded_at)
                    })));
            });
        });
    }
    async getImageById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve({
                        id: row.id,
                        filename: row.filename,
                        description: row.description,
                        width: row.width,
                        height: row.height,
                        uploadedAt: new Date(row.uploaded_at)
                    });
            });
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map