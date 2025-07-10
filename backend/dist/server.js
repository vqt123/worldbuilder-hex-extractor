"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const database_1 = require("./database");
const hex_processor_1 = require("./hex-processor");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// File upload configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only JPEG and PNG images are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Initialize database and hex processor
const database = new database_1.Database();
const hexProcessor = new hex_processor_1.HexProcessor();
// Routes
app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const { description } = req.body;
        const imageId = (0, uuid_1.v4)();
        const imagePath = req.file.filename;
        // Get image dimensions
        const dimensions = await hexProcessor.getImageDimensions(req.file.path);
        // Save to database
        await database.saveImage({
            id: imageId,
            filename: imagePath,
            description: description || '',
            width: dimensions.width,
            height: dimensions.height,
            uploadedAt: new Date()
        });
        res.json({
            success: true,
            imageId,
            imagePath: `/uploads/${imagePath}`,
            dimensions
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});
app.get('/api/images', async (req, res) => {
    try {
        const images = await database.getAllImages();
        res.json(images);
    }
    catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({ error: 'Failed to get images' });
    }
});
app.get('/api/images/:id/hex/:q/:r', async (req, res) => {
    try {
        const { id, q, r } = req.params;
        const image = await database.getImageById(id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const hexImage = await hexProcessor.extractHexRegion(path_1.default.join(__dirname, '../uploads', image.filename), parseInt(q), parseInt(r), image.width, image.height);
        res.setHeader('Content-Type', 'image/png');
        res.send(hexImage);
    }
    catch (error) {
        console.error('Hex extraction error:', error);
        res.status(500).json({ error: 'Failed to extract hex region' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map