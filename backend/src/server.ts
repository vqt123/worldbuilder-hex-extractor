import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './database';
import { HexProcessor } from './hex-processor';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize database and hex processor
const database = new Database();
const hexProcessor = new HexProcessor();

// Routes
app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { description } = req.body;
    const imageId = uuidv4();
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
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const images = await database.getAllImages();
    res.json(images);
  } catch (error) {
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

    const hexImage = await hexProcessor.extractHexRegion(
      path.join(__dirname, '../uploads', image.filename),
      parseInt(q),
      parseInt(r),
      image.width,
      image.height
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(hexImage);
  } catch (error) {
    console.error('Hex extraction error:', error);
    res.status(500).json({ error: 'Failed to extract hex region' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});