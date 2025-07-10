import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database';
import { HexProcessor } from '../hex-processor';
import { upload } from '../middleware/upload';

const router = express.Router();

export const createImageRoutes = (database: DatabaseService, hexProcessor: HexProcessor) => {
  router.post('/admin/upload', upload.single('image'), async (req, res) => {
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

  router.get('/', async (req, res) => {
    try {
      const images = await database.getAllImages();
      res.json(images);
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ error: 'Failed to get images' });
    }
  });

  router.get('/:id/hex/:q/:r', async (req, res) => {
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
        image.filename,
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

  return router;
};