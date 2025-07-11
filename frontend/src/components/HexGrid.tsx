import React, { useRef, useEffect } from 'react';
import { ImageData, HexCoordinates, HexContribution } from '../types';
import { useHexOperations } from '../hooks/useHexOperations';

interface HexGridProps {
  selectedImage: ImageData;
  hexContributions: HexContribution[];
  onHexClick: (coords: HexCoordinates) => void;
  onHexZoom?: (coords: HexCoordinates) => void;
  zoomableHexes?: Array<{q: number, r: number, contributedImageFilename: string}>;
}

export const HexGrid: React.FC<HexGridProps> = ({ 
  selectedImage, 
  hexContributions, 
  onHexClick,
  onHexZoom,
  zoomableHexes = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hexToPixel, pixelToHex, drawHexagon } = useHexOperations();

  const drawHexGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    const backendHexSize = 50; // Use same hex size as backend
    const displayHexSize = backendHexSize * scale; // Scale for display
    
    // Calculate original image dimensions
    const originalWidth = width / scale;
    const originalHeight = height / scale;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    console.log('Drawing hex grid with backend hexSize:', backendHexSize, 'display hexSize:', displayHexSize);

    // Draw hex grid using same logic as backend - start from 0,0 and go in positive directions
    // Calculate reasonable grid bounds
    const maxQ = Math.ceil(originalWidth / (backendHexSize * 1.5)) + 2;
    const maxR = Math.ceil(originalHeight / (backendHexSize * Math.sqrt(3))) + 2;
    
    for (let q = -2; q <= maxQ; q++) {
      for (let r = -2; r <= maxR; r++) {
        // Calculate center in original image coordinates using backend formula
        const originalCenter = hexToPixel(q, r, backendHexSize);
        
        // Scale to display coordinates
        const displayCenter = {
          x: originalCenter.x * scale,
          y: originalCenter.y * scale
        };
        
        // Check if hex is within canvas bounds (with some margin)
        if (displayCenter.x >= -displayHexSize && displayCenter.x <= width + displayHexSize &&
            displayCenter.y >= -displayHexSize && displayCenter.y <= height + displayHexSize) {
          
          // Check if this hex has a contribution
          const hasContribution = hexContributions.some(contrib => contrib.q === q && contrib.r === r);
          const isZoomable = zoomableHexes.some(hex => hex.q === q && hex.r === r);
          
          // Set hex border color based on contribution status
          if (isZoomable) {
            ctx.strokeStyle = '#ffd700'; // Gold for zoomable hexes
            ctx.lineWidth = 4;
          } else if (hasContribution) {
            ctx.strokeStyle = '#61dafb'; // Blue for contributed hexes
            ctx.lineWidth = 3;
          } else {
            ctx.strokeStyle = '#00ff00'; // Green for empty hexes
            ctx.lineWidth = 2;
          }
          
          drawHexagon(ctx, displayCenter.x, displayCenter.y, displayHexSize);
          
          // Draw small dot at center - different colors for different states
          if (isZoomable) {
            ctx.fillStyle = '#ffd700'; // Gold dot for zoomable
            ctx.beginPath();
            ctx.arc(displayCenter.x, displayCenter.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            // Add zoom icon (small plus)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(displayCenter.x - 3, displayCenter.y);
            ctx.lineTo(displayCenter.x + 3, displayCenter.y);
            ctx.moveTo(displayCenter.x, displayCenter.y - 3);
            ctx.lineTo(displayCenter.x, displayCenter.y + 3);
            ctx.stroke();
          } else if (hasContribution) {
            ctx.fillStyle = '#61dafb'; // Blue dot for contributed
            ctx.beginPath();
            ctx.arc(displayCenter.x, displayCenter.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            ctx.fillStyle = '#ff0000'; // Red dot for empty (debugging)
            ctx.beginPath();
            ctx.arc(displayCenter.x, displayCenter.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          // Draw coordinate label for debugging (only for a few hexes)
          if (q >= 6 && q <= 8 && r >= 1 && r <= 3) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText(`${q},${r}`, displayCenter.x - 10, displayCenter.y + 3);
          }
        }
      }
    }
    
    console.log('Hex grid drawing completed');
  };

  // Use effect to load image into canvas after selectedImage changes
  useEffect(() => {
    if (!selectedImage) return;
    
    // Wait for next tick to ensure canvas is rendered
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref is null');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Cannot get 2D context');
        return;
      }

      console.log('Canvas and context ready, loading image...');
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS for canvas
      
      img.onload = () => {
        console.log('✅ Image loaded for canvas:', img.width, 'x', img.height);
        
        // Scale image to fit canvas while maintaining aspect ratio
        const scale = Math.min(800 / img.width, 600 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        console.log('Canvas scaling:', { scale, scaledWidth, scaledHeight });
        
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        // Clear canvas first
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        
        // Draw image
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        console.log('✅ Image drawn to canvas');
        
        // Draw hex grid overlay
        drawHexGrid(ctx, scaledWidth, scaledHeight, scale);
        console.log('✅ Hex grid drawn');
      };
      
      img.onerror = (error) => {
        console.error('❌ Failed to load image for canvas:', error);
        console.error('Image src:', `http://localhost:3002/uploads/${selectedImage.filename}`);
      };
      
      // Determine the correct image source based on filename
      let imageSrc: string;
      if (selectedImage.filename.includes('_contribution')) {
        imageSrc = `http://localhost:3002/api/contributions/${selectedImage.filename}`;
      } else {
        imageSrc = `http://localhost:3002/uploads/${selectedImage.filename}`;
      }
      console.log('Setting image src:', imageSrc);
      img.src = imageSrc;
    }, 100); // Small delay to ensure canvas is rendered
  }, [selectedImage, hexContributions, zoomableHexes]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get canvas coordinates relative to the actual canvas pixels (not CSS pixels)
    const canvasX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    console.log('Raw click event:', { clientX: event.clientX, clientY: event.clientY });
    console.log('Canvas rect size:', { width: rect.width, height: rect.height });
    console.log('Canvas actual size:', { width: canvas.width, height: canvas.height });
    console.log('Canvas scaling factors:', { 
      xScale: canvas.width / rect.width, 
      yScale: canvas.height / rect.height 
    });
    console.log('Corrected canvas coords:', { canvasX, canvasY });

    // Get the scale used to display the image
    const scale = Math.min(800 / selectedImage.width, 600 / selectedImage.height);
    
    // Convert canvas coordinates to original image coordinates
    const originalImageX = canvasX / scale;
    const originalImageY = canvasY / scale;
    
    console.log('Canvas click:', { canvasX, canvasY });
    console.log('Scale:', scale);
    console.log('Original image coords:', { originalImageX, originalImageY });

    // Use backend's hex size (50) to calculate hex coordinates on original image
    const backendHexSize = 50;
    const hexCoords = pixelToHex(originalImageX, originalImageY, backendHexSize);

    // Debug: Calculate what pixel position this hex coordinate represents
    const hexCenterPixels = hexToPixel(hexCoords.q, hexCoords.r, backendHexSize);
    console.log('Calculated hex coordinates:', hexCoords);
    console.log('Hex center should be at pixels:', hexCenterPixels);
    console.log('Clicked pixels:', { originalImageX, originalImageY });
    console.log('Difference from center:', { 
      deltaX: originalImageX - hexCenterPixels.x, 
      deltaY: originalImageY - hexCenterPixels.y 
    });
    
    // Check if this hex is zoomable
    const isZoomable = zoomableHexes.some(hex => hex.q === hexCoords.q && hex.r === hexCoords.r);
    
    if (isZoomable && onHexZoom) {
      console.log('Zooming into hex:', hexCoords);
      onHexZoom(hexCoords);
    } else {
      console.log('Opening contribution modal for hex:', hexCoords);
      onHexClick(hexCoords);
    }
  };

  return (
    <div className="hex-viewer">
      <h2>Hex Grid Viewer</h2>
      <p>Click on a hex cell to contribute content. Blue hexes have contributions. Gold hexes with + icons can be zoomed into.</p>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
};