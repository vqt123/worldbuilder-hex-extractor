import { Database } from './Database';
import { HexContribution, ImageRecord } from '../types';

export class HexRepository extends Database {
  async saveHexContribution(contribution: HexContribution): Promise<void> {
    await this.run(
      `INSERT INTO hex_regions (
        id, image_id, q, r, description, contributed_image_filename,
        contributor_name, user_id, status, parent_image_id, zoom_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contribution.id,
        contribution.imageId,
        contribution.q,
        contribution.r,
        contribution.description,
        contribution.contributedImageFilename,
        contribution.contributorName,
        contribution.userId,
        contribution.status,
        contribution.parentImageId,
        contribution.zoomLevel
      ]
    );
  }

  async getHexContribution(imageId: string, q: number, r: number): Promise<HexContribution | null> {
    const row = await this.get<any>(
      'SELECT * FROM hex_regions WHERE image_id = ? AND q = ? AND r = ? LIMIT 1',
      [imageId, q, r]
    );
    
    if (!row) return null;
    
    return this.mapRowToContribution(row);
  }

  async getHexContributionsByImage(imageId: string): Promise<HexContribution[]> {
    const rows = await this.query<any>(
      'SELECT * FROM hex_regions WHERE image_id = ? ORDER BY contributed_at DESC',
      [imageId]
    );
    
    return rows.map(row => this.mapRowToContribution(row));
  }

  async getAllHexContributions(imageId: string, q: number, r: number): Promise<HexContribution[]> {
    const rows = await this.query<any>(
      'SELECT * FROM hex_regions WHERE image_id = ? AND q = ? AND r = ? ORDER BY contributed_at DESC',
      [imageId, q, r]
    );
    
    return rows.map(row => this.mapRowToContribution(row));
  }

  async getUserHexContribution(imageId: string, q: number, r: number, userId: string): Promise<HexContribution | null> {
    const row = await this.get<any>(
      'SELECT * FROM hex_regions WHERE image_id = ? AND q = ? AND r = ? AND user_id = ?',
      [imageId, q, r, userId]
    );
    
    if (!row) return null;
    
    return this.mapRowToContribution(row);
  }

  async updateHexContribution(id: string, updates: Partial<HexContribution>): Promise<void> {
    const updateFields = [];
    const updateValues = [];

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
    }
    if (updates.contributedImageFilename !== undefined) {
      updateFields.push('contributed_image_filename = ?');
      updateValues.push(updates.contributedImageFilename);
    }
    if (updates.userId !== undefined) {
      updateFields.push('user_id = ?');
      updateValues.push(updates.userId);
    }

    if (updateFields.length === 0) return;

    updateValues.push(id);

    await this.run(
      `UPDATE hex_regions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }

  async getSiblingHexes(imageId: string, centerQ: number, centerR: number): Promise<any[]> {
    // Get surrounding hex coordinates (6 neighbors in hex grid)
    const neighborCoords = [
      { q: centerQ + 1, r: centerR },     // East
      { q: centerQ + 1, r: centerR - 1 }, // Northeast  
      { q: centerQ, r: centerR - 1 },     // Northwest
      { q: centerQ - 1, r: centerR },     // West
      { q: centerQ - 1, r: centerR + 1 }, // Southwest
      { q: centerQ, r: centerR + 1 }      // Southeast
    ];
    
    console.log(`🔍 Getting siblings for center Q=${centerQ}, R=${centerR}:`);
    console.log('📍 Neighbor coordinates:', neighborCoords);

    const siblings = [];
    for (const coord of neighborCoords) {
      const contribution = await this.getHexContribution(imageId, coord.q, coord.r);
      siblings.push({
        q: coord.q,
        r: coord.r,
        description: contribution ? contribution.description : null,
        hasContribution: !!contribution
      });
    }

    return siblings;
  }

  async getHexContext(imageId: string, q: number, r: number): Promise<any> {
    // Calculate actual hierarchy level based on image chain
    const level = await this.calculateHexLevel(imageId);
    
    // Get current hex
    const currentHex = await this.getHexContribution(imageId, q, r);
    
    // Get parent context (either world or parent hex)
    const parent = await this.getParentContext(imageId, level);
    
    // Get sibling hexes (surrounding hexes)
    const siblings = await this.getSiblingHexes(imageId, q, r);
    
    // Get grid dimensions and boundaries for scale context
    const gridInfo = await this.getGridDimensions(imageId);
    
    // Create formatted text summary
    const textSummary = this.formatContextSummary(q, r, level, parent, siblings, gridInfo);
    
    // Format image generation prompt (if current hex has description)
    const imagePrompt = currentHex ? this.formatImagePrompt(q, r, level, parent, siblings, currentHex.description, gridInfo) : null;
    
    return {
      current: { q, r, level },
      parent,
      siblings,
      gridInfo,
      textSummary,
      imagePrompt
    };
  }

  async getZoomableHexes(imageId: string): Promise<Array<{q: number, r: number, contributedImageFilename: string}>> {
    const rows = await this.query<any>(
      'SELECT q, r, contributed_image_filename FROM hex_regions WHERE image_id = ? AND contributed_image_filename IS NOT NULL',
      [imageId]
    );
    
    return rows.map(row => ({
      q: row.q,
      r: row.r,
      contributedImageFilename: row.contributed_image_filename
    }));
  }

  async getZoomImageData(imageId: string, q: number, r: number): Promise<{contributedImageFilename: string, contributionId: string} | null> {
    const row = await this.get<any>(
      'SELECT contributed_image_filename, id FROM hex_regions WHERE image_id = ? AND q = ? AND r = ? AND contributed_image_filename IS NOT NULL LIMIT 1',
      [imageId, q, r]
    );
    
    if (!row) return null;
    
    return {
      contributedImageFilename: row.contributed_image_filename,
      contributionId: row.id
    };
  }

  async createChildHexLevel(parentImageId: string, parentQ: number, parentR: number, contributedImageFilename: string): Promise<string> {
    // Create a new "virtual" image entry for the contributed image as a new zoom level
    const childImageId = `${parentImageId}_${parentQ}_${parentR}`;
    
    // Check if child level already exists
    const existing = await this.get<any>(
      'SELECT id FROM images WHERE id = ?',
      [childImageId]
    );
    
    if (existing) return childImageId;
    
    // Create new image entry for the contributed image
    await this.run(
      'INSERT INTO images (id, filename, description, width, height, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        childImageId,
        contributedImageFilename,
        `Zoomed view of hex Q=${parentQ}, R=${parentR} from ${parentImageId}`,
        1024, // Standard contributed image size
        1024,
        new Date().toISOString()
      ]
    );
    
    return childImageId;
  }

  async getParentImageId(childImageId: string): Promise<string | null> {
    // Extract parent image ID from child image ID pattern
    const match = childImageId.match(/^(.+)_(-?\d+)_(-?\d+)$/);
    if (!match) return null;
    
    return match[1];
  }

  async getBreadcrumbPath(imageId: string): Promise<Array<{imageId: string, q?: number, r?: number, level: number}>> {
    const path = [];
    let currentImageId = imageId;
    let level = await this.calculateHexLevel(currentImageId);
    
    while (currentImageId) {
      const match = currentImageId.match(/^(.+)_(-?\d+)_(-?\d+)$/);
      if (match) {
        const parentImageId = match[1];
        const q = parseInt(match[2]);
        const r = parseInt(match[3]);
        
        path.unshift({
          imageId: currentImageId,
          q,
          r,
          level
        });
        
        currentImageId = parentImageId;
        level--;
      } else {
        // Root level
        path.unshift({
          imageId: currentImageId,
          level
        });
        break;
      }
    }
    
    return path;
  }

  async getGridDimensions(imageId: string): Promise<{minQ: number, maxQ: number, minR: number, maxR: number, totalHexes: number, imageWidth: number, imageHeight: number}> {
    // Get the image dimensions first
    const image = await this.getImageForContext(imageId);
    if (!image) {
      return { minQ: 0, maxQ: 0, minR: 0, maxR: 0, totalHexes: 0, imageWidth: 1024, imageHeight: 1024 };
    }
    
    // Calculate hex grid bounds based on image dimensions and hex size (50px)
    const hexSize = 50;
    const imageWidth = image.width;
    const imageHeight = image.height;
    
    // Calculate reasonable grid bounds using the same logic as frontend
    const maxQ = Math.ceil(imageWidth / (hexSize * 1.5)) + 2;
    const maxR = Math.ceil(imageHeight / (hexSize * Math.sqrt(3))) + 2;
    const minQ = -2;
    const minR = -2;
    
    const totalHexes = (maxQ - minQ + 1) * (maxR - minR + 1);
    
    return {
      minQ,
      maxQ, 
      minR,
      maxR,
      totalHexes,
      imageWidth,
      imageHeight
    };
  }

  private async calculateHexLevel(imageId: string): Promise<number> {
    // Count the number of parent levels by parsing the image ID
    const matches = imageId.match(/_(-?\d+)_(-?\d+)/g);
    return matches ? matches.length + 1 : 1;
  }

  private async getParentContext(imageId: string, level: number): Promise<any> {
    if (level === 1) {
      // Root level - get world/image description
      const parentImage = await this.getImageForContext(imageId);
      return parentImage ? {
        description: parentImage.description,
        type: 'world'
      } : null;
    } else {
      // Child level - get parent hex context
      const parentImageId = await this.getParentImageId(imageId);
      if (!parentImageId) return null;
      
      const match = imageId.match(/^.+_(-?\d+)_(-?\d+)$/);
      if (!match) return null;
      
      const parentQ = parseInt(match[1]);
      const parentR = parseInt(match[2]);
      
      const parentHex = await this.getHexContribution(parentImageId, parentQ, parentR);
      return parentHex ? {
        q: parentQ,
        r: parentR,
        description: parentHex.description,
        type: 'hex'
      } : null;
    }
  }

  private async getImageForContext(imageId: string): Promise<ImageRecord | null> {
    const row = await this.get<any>(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
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

  private mapRowToContribution(row: any): HexContribution {
    return {
      id: row.id,
      imageId: row.image_id,
      q: row.q,
      r: row.r,
      description: row.description,
      contributedImageFilename: row.contributed_image_filename,
      contributorName: row.contributor_name,
      userId: row.user_id,
      contributedAt: new Date(row.contributed_at),
      status: row.status,
      parentImageId: row.parent_image_id,
      zoomLevel: row.zoom_level
    };
  }

  private formatContextSummary(q: number, r: number, level: number, parent: any, siblings: any[], gridInfo: any): string {
    let summary = `Please write a detailed description for this hex grid cell based on the following context. Create a vivid, immersive description that:\n- Fits naturally within the established world\n- References or connects to neighboring areas when appropriate\n- Maintains consistency with the overall setting\n- Provides rich detail for worldbuilding purposes\n\n`;
    
    summary += `CURRENT LOCATION: Hex Q=${q}, R=${r} (Level ${level})\n\n`;
    
    // Add grid scale information
    summary += `GRID SCALE: This hex is at coordinates Q=${q}, R=${r} within a grid spanning Q=${gridInfo.minQ} to Q=${gridInfo.maxQ}, R=${gridInfo.minR} to R=${gridInfo.maxR} (total ~${gridInfo.totalHexes} hexes covering ${gridInfo.imageWidth}x${gridInfo.imageHeight} pixels)\n\n`;
    
    if (parent && parent.type === 'world') {
      summary += `WORLD CONTEXT:\n${parent.description}\n\n`;
    } else if (parent) {
      summary += `PARENT HEX: Q=${parent.q}, R=${parent.r} - "${parent.description}"\n\n`;
    } else {
      summary += `PARENT: None (Top level hex)\n\n`;
    }
    
    summary += `SURROUNDING AREAS:\n`;
    for (const sibling of siblings) {
      const desc = sibling.description || "No description yet";
      // Show full descriptions for complete context
      summary += `- Hex Q=${sibling.q}, R=${sibling.r}: "${desc}"\n`;
    }
    
    return summary;
  }

  private formatImagePrompt(q: number, r: number, level: number, parent: any, siblings: any[], userDescription: string, gridInfo: any): string {
    let prompt = `Generate a detailed map image for this hex region that seamlessly integrates with the parent map.\n\n`;
    
    prompt += `HEX DESCRIPTION:\n${userDescription}\n\n`;
    
    prompt += `SPATIAL CONTEXT & SCALE:\n`;
    prompt += `- This hex is at coordinates Q=${q}, R=${r} within a grid spanning Q=${gridInfo.minQ} to Q=${gridInfo.maxQ}, R=${gridInfo.minR} to R=${gridInfo.maxR}\n`;
    prompt += `- Total grid size: ~${gridInfo.totalHexes} hexes covering ${gridInfo.imageWidth}x${gridInfo.imageHeight} pixels\n`;
    prompt += `- Zoom level: ${level} (higher numbers = more detailed view)\n`;
    prompt += `- Scale context: This represents 1/${gridInfo.totalHexes} of the total world area\n`;
    prompt += `- Area coverage: Each hex represents approximately ${Math.round(gridInfo.imageWidth * gridInfo.imageHeight / gridInfo.totalHexes)} square pixels of world area\n\n`;
    
    prompt += `IMAGE SCALE REQUIREMENTS:\n`;
    prompt += `- Generate a 1024x1024 pixel image that represents this single hex region\n`;
    prompt += `- The image should show ${level === 1 ? 'regional-scale' : 'local-scale'} detail appropriate for ${gridInfo.totalHexes < 100 ? 'a small area' : gridInfo.totalHexes < 500 ? 'a medium region' : 'a large continent'}\n`;
    prompt += `- Detail level: ${level === 1 ? 'Show major landmarks, districts, or biome features' : 'Show detailed terrain, buildings, or specific locations'}\n`;
    prompt += `- Geographic scope: ${gridInfo.totalHexes < 100 ? 'Detailed local area (city district, small valley)' : gridInfo.totalHexes < 500 ? 'Regional area (city, large forest, mountain range)' : 'Continental area (kingdoms, major biomes, large geographic features)'}\n\n`;
    
    prompt += `PARENT MAP STYLE:\n`;
    prompt += `- Art style: Fantasy map with aged parchment aesthetic\n`;
    prompt += `- Color palette: Earth tones with magical elements (match parent map)\n`;
    prompt += `- Level of detail: Zoomed-in view with 3-5x more detail than parent\n`;
    prompt += `- Perspective: Top-down map view, same angle as parent\n\n`;
    
    prompt += `VISUAL REQUIREMENTS:\n`;
    prompt += `- Dimensions: 1024x1024 pixels (covering this single hex's area)\n`;
    prompt += `- Seamless edges that blend with surrounding hexes\n`;
    prompt += `- Consistent lighting and artistic style with parent map\n`;
    prompt += `- Include geographic features mentioned in description\n`;
    prompt += `- Maintain world aesthetic: Fantasy/Sci-fi/Mixed from world context\n`;
    prompt += `- No text labels or hex grid overlay (keep clean for integration)\n\n`;
    
    if (siblings && siblings.length > 0) {
      prompt += `SURROUNDING CONTEXT (for edge consistency):\n`;
      for (const sibling of siblings) {
        if (sibling.description && sibling.description !== "No description yet") {
          prompt += `- Adjacent area: ${sibling.description.split('.')[0]}...\n`;
        }
      }
      prompt += `\n`;
    }
    
    prompt += `Create a map section that looks like a natural zoom-in of the parent hex region, maintaining visual continuity with the overall world map.`;
    
    return prompt;
  }
}