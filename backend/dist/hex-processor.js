"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HexProcessor = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
class HexProcessor {
    constructor() {
        this.hexSize = 50; // Size of each hex in pixels
        this.hexWidth = this.hexSize * 2;
        this.hexHeight = Math.sqrt(3) * this.hexSize;
    }
    async getImageDimensions(imagePath) {
        const metadata = await (0, sharp_1.default)(imagePath).metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0
        };
    }
    // Get the correct file path for an image (uploads or contributions)
    getImagePath(filename) {
        // Check if it's a contribution image (ends with _contribution.ext)
        if (filename.includes('_contribution')) {
            return path_1.default.join(__dirname, '../contributions', filename);
        }
        // Otherwise it's a regular upload
        return path_1.default.join(__dirname, '../uploads', filename);
    }
    // Get dimensions from filename (checks both uploads and contributions)
    async getImageDimensionsFromFilename(filename) {
        const imagePath = this.getImagePath(filename);
        return this.getImageDimensions(imagePath);
    }
    // Convert hex coordinates to pixel coordinates
    hexToPixel(q, r) {
        const x = this.hexSize * (3 / 2 * q);
        const y = this.hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
        return { x, y };
    }
    // Convert pixel coordinates to hex coordinates
    pixelToHex(x, y) {
        const q = (2 / 3 * x) / this.hexSize;
        const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / this.hexSize;
        return this.roundHex(q, r);
    }
    // Round fractional hex coordinates to nearest hex
    roundHex(q, r) {
        const s = -q - r;
        const rq = Math.round(q);
        const rr = Math.round(r);
        const rs = Math.round(s);
        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);
        if (qDiff > rDiff && qDiff > sDiff) {
            return { q: -rr - rs, r: rr };
        }
        else if (rDiff > sDiff) {
            return { q: rq, r: -rq - rs };
        }
        else {
            return { q: rq, r: rr };
        }
    }
    // Get the vertices of a hex at given coordinates
    getHexVertices(q, r) {
        const center = this.hexToPixel(q, r);
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            vertices.push({
                x: center.x + this.hexSize * Math.cos(angle),
                y: center.y + this.hexSize * Math.sin(angle)
            });
        }
        return vertices;
    }
    // Extract a hex-shaped region from an image
    async extractHexRegion(filename, q, r, imageWidth, imageHeight) {
        const imagePath = this.getImagePath(filename);
        const vertices = this.getHexVertices(q, r);
        // Find bounding box of the hex
        const minX = Math.max(0, Math.floor(Math.min(...vertices.map(v => v.x))));
        const maxX = Math.min(imageWidth, Math.ceil(Math.max(...vertices.map(v => v.x))));
        const minY = Math.max(0, Math.floor(Math.min(...vertices.map(v => v.y))));
        const maxY = Math.min(imageHeight, Math.ceil(Math.max(...vertices.map(v => v.y))));
        const width = maxX - minX;
        const height = maxY - minY;
        if (width <= 0 || height <= 0) {
            // Return empty transparent image if hex is outside bounds
            return await (0, sharp_1.default)({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            }).png().toBuffer();
        }
        // Extract the rectangular region containing the hex
        const extractedImage = await (0, sharp_1.default)(imagePath)
            .extract({
            left: minX,
            top: minY,
            width: width,
            height: height
        })
            .png()
            .toBuffer();
        // Create a hex mask
        const maskSvg = this.createHexMask(width, height, vertices, minX, minY);
        // Apply the mask to create hex-shaped cutout
        const maskedImage = await (0, sharp_1.default)(extractedImage)
            .composite([{
                input: Buffer.from(maskSvg),
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();
        return maskedImage;
    }
    createHexMask(width, height, vertices, offsetX, offsetY) {
        const adjustedVertices = vertices.map(v => ({
            x: v.x - offsetX,
            y: v.y - offsetY
        }));
        const pathData = adjustedVertices
            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`)
            .join(' ') + ' Z';
        return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${pathData}" fill="white"/>
      </svg>
    `;
    }
    // Calculate how many hex tiles fit in an image
    getHexGridDimensions(imageWidth, imageHeight) {
        const cols = Math.ceil(imageWidth / (this.hexWidth * 0.75));
        const rows = Math.ceil(imageHeight / this.hexHeight);
        return { cols, rows };
    }
    // Generate an image showing the hex within a surrounding grid context
    async generateHexGridView(filename, centerQ, centerR, imageWidth, imageHeight) {
        const imagePath = this.getImagePath(filename);
        const gridSize = 3; // 3x3 grid around the center hex
        const halfGrid = Math.floor(gridSize / 2);
        // Calculate the bounds for the grid view
        const centerPixel = this.hexToPixel(centerQ, centerR);
        const gridExtent = this.hexSize * 2.5; // Extend beyond just the hex
        const minX = Math.max(0, centerPixel.x - gridExtent);
        const maxX = Math.min(imageWidth, centerPixel.x + gridExtent);
        const minY = Math.max(0, centerPixel.y - gridExtent);
        const maxY = Math.min(imageHeight, centerPixel.y + gridExtent);
        const width = maxX - minX;
        const height = maxY - minY;
        if (width <= 0 || height <= 0) {
            // Return empty image if invalid bounds
            return await (0, sharp_1.default)({
                create: {
                    width: 300,
                    height: 300,
                    channels: 4,
                    background: { r: 100, g: 100, b: 100, alpha: 1 }
                }
            }).png().toBuffer();
        }
        // Extract the base image region
        const baseImage = await (0, sharp_1.default)(imagePath)
            .extract({
            left: Math.floor(minX),
            top: Math.floor(minY),
            width: Math.floor(width),
            height: Math.floor(height)
        })
            .png()
            .toBuffer();
        // Create grid overlay with highlighted center hex
        const gridOverlaySvg = this.createGridOverlay(width, height, centerQ, centerR, minX, minY, gridSize);
        // Composite the grid overlay onto the base image
        const finalImage = await (0, sharp_1.default)(baseImage)
            .composite([{
                input: Buffer.from(gridOverlaySvg),
                blend: 'over'
            }])
            .png()
            .toBuffer();
        return finalImage;
    }
    createGridOverlay(width, height, centerQ, centerR, offsetX, offsetY, gridSize) {
        const halfGrid = Math.floor(gridSize / 2);
        let pathElements = '';
        // Draw grid hexagons
        for (let qOffset = -halfGrid; qOffset <= halfGrid; qOffset++) {
            for (let rOffset = -halfGrid; rOffset <= halfGrid; rOffset++) {
                const q = centerQ + qOffset;
                const r = centerR + rOffset;
                const center = this.hexToPixel(q, r);
                // Adjust coordinates relative to the extracted region
                const adjustedX = center.x - offsetX;
                const adjustedY = center.y - offsetY;
                // Check if this hex is within the extracted region
                if (adjustedX >= -this.hexSize && adjustedX <= width + this.hexSize &&
                    adjustedY >= -this.hexSize && adjustedY <= height + this.hexSize) {
                    const vertices = [];
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i;
                        const x = adjustedX + this.hexSize * Math.cos(angle);
                        const y = adjustedY + this.hexSize * Math.sin(angle);
                        vertices.push(`${x},${y}`);
                    }
                    const isCenter = (qOffset === 0 && rOffset === 0);
                    const strokeColor = isCenter ? '#ff0000' : '#00ff00';
                    const strokeWidth = isCenter ? '4' : '2';
                    const fillOpacity = isCenter ? '0.2' : '0';
                    pathElements += `
            <polygon points="${vertices.join(' ')}" 
                     fill="red" 
                     fill-opacity="${fillOpacity}"
                     stroke="${strokeColor}" 
                     stroke-width="${strokeWidth}"/>`;
                    if (isCenter) {
                        // Add center dot for highlighted hex
                        pathElements += `
              <circle cx="${adjustedX}" cy="${adjustedY}" r="5" 
                      fill="#ff0000" stroke="#ffffff" stroke-width="2"/>`;
                    }
                }
            }
        }
        return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${pathElements}
      </svg>
    `;
    }
}
exports.HexProcessor = HexProcessor;
//# sourceMappingURL=hex-processor.js.map