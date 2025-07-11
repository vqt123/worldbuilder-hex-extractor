export interface HexCoordinates {
    q: number;
    r: number;
}
export interface Point {
    x: number;
    y: number;
}
export declare class HexProcessor {
    private readonly hexSize;
    private readonly hexWidth;
    private readonly hexHeight;
    getImageDimensions(imagePath: string): Promise<{
        width: number;
        height: number;
    }>;
    private getImagePath;
    getImageDimensionsFromFilename(filename: string): Promise<{
        width: number;
        height: number;
    }>;
    hexToPixel(q: number, r: number): Point;
    pixelToHex(x: number, y: number): HexCoordinates;
    private roundHex;
    private getHexVertices;
    extractHexRegion(filename: string, q: number, r: number, imageWidth: number, imageHeight: number): Promise<Buffer>;
    private createHexMask;
    getHexGridDimensions(imageWidth: number, imageHeight: number): {
        cols: number;
        rows: number;
    };
    generateHexGridView(filename: string, centerQ: number, centerR: number, imageWidth: number, imageHeight: number): Promise<Buffer>;
    private createGridOverlay;
}
//# sourceMappingURL=hex-processor.d.ts.map