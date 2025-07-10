export interface ImageRecord {
    id: string;
    filename: string;
    description: string;
    width: number;
    height: number;
    uploadedAt: Date;
}
export declare class Database {
    private db;
    constructor();
    private initializeDatabase;
    saveImage(image: ImageRecord): Promise<void>;
    getAllImages(): Promise<ImageRecord[]>;
    getImageById(id: string): Promise<ImageRecord | null>;
}
//# sourceMappingURL=database.d.ts.map