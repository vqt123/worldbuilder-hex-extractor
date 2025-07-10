import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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
    const qCoord = parseInt(q);
    const rCoord = parseInt(r);
    
    console.log(`🎯 Backend received hex extraction request: Q=${qCoord}, R=${rCoord} for image ${id}`);
    
    const image = await database.getImageById(id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    console.log(`📏 Image dimensions: ${image.width}x${image.height}`);

    const hexImage = await hexProcessor.extractHexRegion(
      path.join(__dirname, '../uploads', image.filename),
      qCoord,
      rCoord,
      image.width,
      image.height
    );

    console.log(`✅ Hex extraction completed for Q=${qCoord}, R=${rCoord}`);
    res.setHeader('Content-Type', 'image/png');
    res.send(hexImage);
  } catch (error) {
    console.error('Hex extraction error:', error);
    res.status(500).json({ error: 'Failed to extract hex region' });
  }
});

// Hex contribution endpoints
app.post('/api/hex-contributions', upload.single('contributedImage'), async (req, res) => {
  try {
    const { imageId, q, r, description, contributorName } = req.body;
    const contributedFile = req.file;

    if (!imageId || q === undefined || r === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contributionId = crypto.randomUUID();
    let contributedImageFilename: string | undefined;

    // Handle contributed image if provided
    if (contributedFile) {
      const fileExtension = path.extname(contributedFile.originalname);
      contributedImageFilename = `${contributionId}_contribution${fileExtension}`;
      
      // Create contributions directory if it doesn't exist
      const contributionsDir = path.join(__dirname, '../contributions');
      if (!fs.existsSync(contributionsDir)) {
        fs.mkdirSync(contributionsDir, { recursive: true });
      }

      // Move file to contributions directory
      const contributionPath = path.join(contributionsDir, contributedImageFilename);
      fs.renameSync(contributedFile.path, contributionPath);
    }

    const contribution = {
      id: contributionId,
      imageId,
      q: parseInt(q),
      r: parseInt(r),
      description: description || '',
      contributedImageFilename,
      contributorName: contributorName || 'Anonymous',
      contributedAt: new Date(),
      status: 'pending' as const,
      parentImageId: imageId, // For now, parent is the same as image
      zoomLevel: 1
    };

    await database.saveHexContribution(contribution);

    console.log(`✅ Hex contribution saved: Q=${q}, R=${r} for image ${imageId}`);
    res.json({ 
      success: true, 
      contributionId,
      message: 'Hex contribution submitted successfully' 
    });

  } catch (error) {
    console.error('Hex contribution error:', error);
    res.status(500).json({ error: 'Failed to save hex contribution' });
  }
});

app.get('/api/hex-content/:imageId/:q/:r', async (req, res) => {
  try {
    const { imageId, q, r } = req.params;
    const contribution = await database.getHexContribution(imageId, parseInt(q), parseInt(r));

    if (!contribution) {
      return res.status(404).json({ error: 'No contribution found for this hex' });
    }

    res.json(contribution);
  } catch (error) {
    console.error('Error fetching hex content:', error);
    res.status(500).json({ error: 'Failed to fetch hex content' });
  }
});

app.get('/api/hex-contributions/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const contributions = await database.getHexContributionsByImage(imageId);
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching hex contributions:', error);
    res.status(500).json({ error: 'Failed to fetch hex contributions' });
  }
});

app.get('/api/contributions/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../contributions', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Contribution image not found' });
  }
  
  res.sendFile(filePath);
});

app.get('/api/hex-context/:imageId/:q/:r', async (req, res) => {
  try {
    const { imageId, q, r } = req.params;
    const context = await database.getHexContext(imageId, parseInt(q), parseInt(r));
    res.json(context);
  } catch (error) {
    console.error('Error fetching hex context:', error);
    res.status(500).json({ error: 'Failed to fetch hex context' });
  }
});

app.get('/api/hex-grid-view/:imageId/:q/:r', async (req, res) => {
  try {
    const { imageId, q, r } = req.params;
    const qCoord = parseInt(q);
    const rCoord = parseInt(r);
    
    const image = await database.getImageById(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const gridViewImage = await hexProcessor.generateHexGridView(
      path.join(__dirname, '../uploads', image.filename),
      qCoord,
      rCoord,
      image.width,
      image.height
    );

    res.setHeader('Content-Type', 'image/png');
    res.send(gridViewImage);
  } catch (error) {
    console.error('Error generating hex grid view:', error);
    res.status(500).json({ error: 'Failed to generate hex grid view' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});