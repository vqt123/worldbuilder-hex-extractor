import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseService } from '../database';
import { HexProcessor } from '../hex-processor';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

export const createHexRoutes = (database: DatabaseService, hexProcessor: HexProcessor) => {
  router.post('/hex-contributions', requireAuth, upload.single('contributedImage'), async (req, res) => {
    try {
      const { imageId, q, r, description, contributorName } = req.body;
      const contributedFile = req.file;

      if (!imageId || q === undefined || r === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get user information from session
      const user = await database.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const contributionId = crypto.randomUUID();
      let contributedImageFilename: string | undefined;

      // Handle contributed image if provided
      if (contributedFile) {
        const fileExtension = path.extname(contributedFile.originalname);
        contributedImageFilename = `${contributionId}_contribution${fileExtension}`;
        
        // Create contributions directory if it doesn't exist
        const contributionsDir = path.join(__dirname, '../../contributions');
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
        contributorName: contributorName || user.username,
        userId: user.id,
        contributedAt: new Date(),
        status: 'pending' as const,
        parentImageId: imageId, // For now, parent is the same as image
        zoomLevel: 1
      };

      await database.saveHexContribution(contribution);

      console.log(`✅ Hex contribution saved: Q=${q}, R=${r} for image ${imageId} by user ${user.username}`);
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

  router.get('/hex-content/:imageId/:q/:r', async (req, res) => {
    try {
      const { imageId, q, r } = req.params;
      const contributions = await database.getAllHexContributions(imageId, parseInt(q), parseInt(r));

      if (contributions.length === 0) {
        return res.status(404).json({ error: 'No contributions found for this hex' });
      }

      res.json({ contributions });
    } catch (error) {
      console.error('Error fetching hex content:', error);
      res.status(500).json({ error: 'Failed to fetch hex content' });
    }
  });

  router.get('/hex-content/:imageId/:q/:r/user', requireAuth, async (req, res) => {
    try {
      const { imageId, q, r } = req.params;
      const userId = req.session.userId!;
      const contribution = await database.getUserHexContribution(imageId, parseInt(q), parseInt(r), userId);

      if (!contribution) {
        return res.status(404).json({ error: 'No contribution found for this user' });
      }

      res.json(contribution);
    } catch (error) {
      console.error('Error fetching user hex contribution:', error);
      res.status(500).json({ error: 'Failed to fetch user hex contribution' });
    }
  });

  router.put('/hex-contributions/:contributionId', requireAuth, upload.single('contributedImage'), async (req, res) => {
    try {
      const { contributionId } = req.params;
      const { description } = req.body;
      const contributedFile = req.file;
      const userId = req.session.userId!;

      const updates: any = {};
      if (description !== undefined) {
        updates.description = description;
      }

      if (contributedFile) {
        const fileExtension = path.extname(contributedFile.originalname);
        const contributedImageFilename = `${contributionId}_contribution${fileExtension}`;
        
        const contributionsDir = path.join(__dirname, '../../contributions');
        if (!fs.existsSync(contributionsDir)) {
          fs.mkdirSync(contributionsDir, { recursive: true });
        }

        const contributionPath = path.join(contributionsDir, contributedImageFilename);
        fs.renameSync(contributedFile.path, contributionPath);
        
        updates.contributedImageFilename = contributedImageFilename;
      }

      await database.updateHexContribution(contributionId, updates);

      console.log(`✅ Hex contribution updated: ${contributionId} by user ${req.session.username}`);
      res.json({ 
        success: true, 
        message: 'Hex contribution updated successfully' 
      });

    } catch (error) {
      console.error('Update contribution error:', error);
      res.status(500).json({ error: 'Failed to update hex contribution' });
    }
  });

  router.get('/hex-contributions/:imageId', async (req, res) => {
    try {
      const { imageId } = req.params;
      const contributions = await database.getHexContributionsByImage(imageId);
      res.json(contributions);
    } catch (error) {
      console.error('Error fetching hex contributions:', error);
      res.status(500).json({ error: 'Failed to fetch hex contributions' });
    }
  });

  router.get('/contributions/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../contributions', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Contribution image not found' });
    }
    
    res.sendFile(filePath);
  });

  router.get('/hex-context/:imageId/:q/:r', async (req, res) => {
    try {
      const { imageId, q, r } = req.params;
      const context = await database.getHexContext(imageId, parseInt(q), parseInt(r));
      res.json(context);
    } catch (error) {
      console.error('Error fetching hex context:', error);
      res.status(500).json({ error: 'Failed to fetch hex context' });
    }
  });

  router.get('/hex-grid-view/:imageId/:q/:r', async (req, res) => {
    try {
      const { imageId, q, r } = req.params;
      const qCoord = parseInt(q);
      const rCoord = parseInt(r);
      
      const image = await database.getImageById(imageId);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const gridViewImage = await hexProcessor.generateHexGridView(
        image.filename,
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

  // New zoom-related endpoints
  router.get('/hex-zoomable/:imageId', async (req, res) => {
    try {
      const { imageId } = req.params;
      const zoomableHexes = await database.getZoomableHexes(imageId);
      res.json(zoomableHexes);
    } catch (error) {
      console.error('Error fetching zoomable hexes:', error);
      res.status(500).json({ error: 'Failed to fetch zoomable hexes' });
    }
  });

  router.get('/hex-zoom/:imageId/:q/:r', async (req, res) => {
    try {
      const { imageId, q, r } = req.params;
      const qCoord = parseInt(q);
      const rCoord = parseInt(r);
      
      const zoomData = await database.getZoomImageData(imageId, qCoord, rCoord);
      if (!zoomData) {
        return res.status(404).json({ error: 'No zoomable image found for this hex' });
      }

      // Create child hex level if it doesn't exist
      const childImageId = await database.createChildHexLevel(
        imageId, 
        qCoord, 
        rCoord, 
        zoomData.contributedImageFilename
      );

      res.json({
        success: true,
        childImageId,
        contributedImageFilename: zoomData.contributedImageFilename,
        contributionId: zoomData.contributionId
      });
    } catch (error) {
      console.error('Error processing hex zoom:', error);
      res.status(500).json({ error: 'Failed to process hex zoom' });
    }
  });

  router.get('/hex-breadcrumbs/:imageId', async (req, res) => {
    try {
      const { imageId } = req.params;
      const breadcrumbs = await database.getBreadcrumbPath(imageId);
      res.json(breadcrumbs);
    } catch (error) {
      console.error('Error fetching breadcrumbs:', error);
      res.status(500).json({ error: 'Failed to fetch breadcrumbs' });
    }
  });

  router.get('/hex-parent/:imageId', async (req, res) => {
    try {
      const { imageId } = req.params;
      const parentImageId = await database.getParentImageId(imageId);
      
      if (!parentImageId) {
        return res.status(404).json({ error: 'No parent image found' });
      }

      res.json({ parentImageId });
    } catch (error) {
      console.error('Error fetching parent image:', error);
      res.status(500).json({ error: 'Failed to fetch parent image' });
    }
  });

  return router;
};