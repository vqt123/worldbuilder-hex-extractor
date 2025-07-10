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
    // For now, assume Level 1 hexes - in future this would calculate actual hierarchy
    const level = 1;
    
    // Get current hex
    const currentHex = await this.getHexContribution(imageId, q, r);
    
    // Get parent (the world/image description that this hex belongs to)
    const parentImage = await this.getImageForContext(imageId);
    const parent = parentImage ? {
      description: parentImage.description,
      type: 'world'
    } : null;
    
    // Get sibling hexes (surrounding hexes)
    const siblings = await this.getSiblingHexes(imageId, q, r);
    
    // Create formatted text summary
    const textSummary = this.formatContextSummary(q, r, level, parent, siblings);
    
    // Format image generation prompt (if current hex has description)
    const imagePrompt = currentHex ? this.formatImagePrompt(q, r, level, parent, siblings, currentHex.description) : null;
    
    return {
      current: { q, r, level },
      parent,
      siblings,
      textSummary,
      imagePrompt
    };
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

  private formatContextSummary(q: number, r: number, level: number, parent: any, siblings: any[]): string {
    let summary = `Please write a detailed description for this hex grid cell based on the following context. Create a vivid, immersive description that:\n- Fits naturally within the established world\n- References or connects to neighboring areas when appropriate\n- Maintains consistency with the overall setting\n- Provides rich detail for worldbuilding purposes\n\n`;
    
    summary += `CURRENT LOCATION: Hex Q=${q}, R=${r} (Level ${level})\n\n`;
    
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
      summary += `- Hex Q=${sibling.q}, R=${sibling.r}: "${desc}"\n`;
    }
    
    return summary;
  }

  private formatImagePrompt(q: number, r: number, level: number, parent: any, siblings: any[], userDescription: string): string {
    let prompt = `Generate a detailed map image for this hex region that seamlessly integrates with the parent map.\n\n`;
    
    prompt += `HEX DESCRIPTION:\n${userDescription}\n\n`;
    
    prompt += `PARENT MAP STYLE:\n`;
    prompt += `- Art style: Fantasy map with aged parchment aesthetic\n`;
    prompt += `- Color palette: Earth tones with magical elements (match parent map)\n`;
    prompt += `- Level of detail: Zoomed-in view with 3-5x more detail than parent\n`;
    prompt += `- Perspective: Top-down map view, same angle as parent\n\n`;
    
    prompt += `VISUAL REQUIREMENTS:\n`;
    prompt += `- Dimensions: 1024x1024 pixels (same as parent hex size)\n`;
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