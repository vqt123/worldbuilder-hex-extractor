import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface ImageData {
  id: string;
  filename: string;
  description: string;
  width: number;
  height: number;
  uploadedAt: string;
}

interface HexCoordinates {
  q: number;
  r: number;
}

interface HexContribution {
  id: string;
  imageId: string;
  q: number;
  r: number;
  description: string;
  contributedImageFilename?: string;
  contributorName?: string;
  contributedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  parentImageId?: string;
  zoomLevel: number;
}

const API_BASE = 'http://localhost:3002';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hexExtraction, setHexExtraction] = useState<string | null>(null);
  const [selectedHexCoords, setSelectedHexCoords] = useState<HexCoordinates | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [existingContribution, setExistingContribution] = useState<HexContribution | null>(null);
  const [hexContributions, setHexContributions] = useState<HexContribution[]>([]);
  const [hexContext, setHexContext] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [copyImageSuccess, setCopyImageSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/images`);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (!fileInputRef.current?.files?.[0]) return;

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchImages();
        event.currentTarget.reset();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const loadImageWithHexOverlay = (image: ImageData) => {
    console.log('Setting selected image:', image);
    setSelectedImage(image);
    setHexExtraction(null);
    setSelectedHexCoords(null);
  };

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
          
          // Set hex border color based on contribution status
          if (hasContribution) {
            ctx.strokeStyle = '#61dafb'; // Blue for contributed hexes
            ctx.lineWidth = 3;
          } else {
            ctx.strokeStyle = '#00ff00'; // Green for empty hexes
            ctx.lineWidth = 2;
          }
          
          drawHexagon(ctx, displayCenter.x, displayCenter.y, displayHexSize);
          
          // Draw small dot at center - different colors for different states
          if (hasContribution) {
            ctx.fillStyle = '#61dafb'; // Blue dot for contributed
          } else {
            ctx.fillStyle = '#ff0000'; // Red dot for empty (debugging)
          }
          ctx.beginPath();
          ctx.arc(displayCenter.x, displayCenter.y, 3, 0, 2 * Math.PI);
          ctx.fill();
          
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
        console.error('Image src:', `${API_BASE}/uploads/${selectedImage.filename}`);
      };
      
      const imageSrc = `${API_BASE}/uploads/${selectedImage.filename}`;
      console.log('Setting image src:', imageSrc);
      img.src = imageSrc;
    }, 100); // Small delay to ensure canvas is rendered
  }, [selectedImage, hexContributions]);

  const hexToPixel = (q: number, r: number, hexSize: number) => {
    // Use exact same formula as backend
    const x = hexSize * (3/2 * q);
    const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const pixelToHex = (x: number, y: number, hexSize: number): HexCoordinates => {
    // Use exact same formula as backend
    const q = (2/3 * x) / hexSize;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
    return roundHex(q, r);
  };

  const roundHex = (q: number, r: number): HexCoordinates => {
    const s = -q - r;
    const rq = Math.round(q);
    const rr = Math.round(r);
    const rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      return { q: -rr - rs, r: rr };
    } else if (rDiff > sDiff) {
      return { q: rq, r: -rq - rs };
    } else {
      return { q: rq, r: rr };
    }
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      // Match backend hex orientation - flat top hexagon
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  };

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
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
    
    setSelectedHexCoords(hexCoords);

    // Check if there's an existing contribution for this hex
    try {
      const response = await fetch(
        `${API_BASE}/api/hex-content/${selectedImage.id}/${hexCoords.q}/${hexCoords.r}`
      );
      
      if (response.ok) {
        const contribution = await response.json();
        setExistingContribution(contribution);
      } else {
        setExistingContribution(null);
      }
    } catch (error) {
      console.log('No existing contribution found for this hex');
      setExistingContribution(null);
    }

    // Fetch hex context (parent/sibling info)
    try {
      const contextResponse = await fetch(
        `${API_BASE}/api/hex-context/${selectedImage.id}/${hexCoords.q}/${hexCoords.r}`
      );
      
      if (contextResponse.ok) {
        const context = await contextResponse.json();
        setHexContext(context);
      } else {
        setHexContext(null);
      }
    } catch (error) {
      console.log('Error fetching hex context:', error);
      setHexContext(null);
    }

    // Extract hex region for preview
    try {
      const response = await fetch(
        `${API_BASE}/api/images/${selectedImage.id}/hex/${hexCoords.q}/${hexCoords.r}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setHexExtraction(url);
      } else {
        console.error('Backend response error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to extract hex:', error);
    }

    // Show contribution modal
    setShowContributionModal(true);
  };

  const handleContributionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedImage || !selectedHexCoords) return;

    const formData = new FormData(event.currentTarget);
    formData.append('imageId', selectedImage.id);
    formData.append('q', selectedHexCoords.q.toString());
    formData.append('r', selectedHexCoords.r.toString());

    try {
      const response = await fetch(`${API_BASE}/api/hex-contributions`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Contribution submitted successfully');
        setShowContributionModal(false);
        // Refresh contributions for this image
        fetchHexContributions(selectedImage.id);
      } else {
        console.error('Failed to submit contribution');
      }
    } catch (error) {
      console.error('Error submitting contribution:', error);
    }
  };

  const fetchHexContributions = async (imageId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/hex-contributions/${imageId}`);
      if (response.ok) {
        const contributions = await response.json();
        setHexContributions(contributions);
      }
    } catch (error) {
      console.error('Error fetching hex contributions:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!hexContext?.textSummary) return;
    
    try {
      await navigator.clipboard.writeText(hexContext.textSummary);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleCopyImagePrompt = async () => {
    if (!hexContext?.imagePrompt) return;
    
    try {
      await navigator.clipboard.writeText(hexContext.imagePrompt);
      setCopyImageSuccess('Copied!');
      setTimeout(() => setCopyImageSuccess(''), 2000);
    } catch (err) {
      setCopyImageSuccess('Failed to copy');
      setTimeout(() => setCopyImageSuccess(''), 2000);
    }
  };

  // Load contributions when image is selected
  useEffect(() => {
    if (selectedImage) {
      fetchHexContributions(selectedImage.id);
    }
  }, [selectedImage]);

  return (
    <div className="App">
      <h1>Worldbuilder Admin</h1>
      
      <div className="main-container">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Upload Form */}
          <form onSubmit={handleImageUpload} className="upload-form">
            <div>
              <label htmlFor="image">Select Image:</label>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                required
              />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Describe this world region..."
              />
            </div>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>

          {/* Image List */}
          <div className="image-list">
            <h2>Uploaded Images</h2>
            {images.map((image) => (
              <div key={image.id} className="image-item">
                <img
                  src={`${API_BASE}/uploads/${image.filename}`}
                  alt={image.description}
                  onError={(e) => {
                    console.error('Image failed to load:', `${API_BASE}/uploads/${image.filename}`);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', `${API_BASE}/uploads/${image.filename}`)}
                />
                <div className="image-info">
                  <p><strong>Dimensions:</strong> {image.width}x{image.height}</p>
                  <div className="image-description">
                    <strong>Description:</strong> {image.description}
                  </div>
                  <button onClick={() => loadImageWithHexOverlay(image)}>
                    View with Hex Grid
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Hex Extraction Result */}
          {hexExtraction && selectedHexCoords && (
            <div className="hex-extraction">
              <h3>Extracted Hex Region</h3>
              <div className="hex-coordinates">
                <strong>Coordinates:</strong> Q: {selectedHexCoords.q}, R: {selectedHexCoords.r}
              </div>
              <img src={hexExtraction} alt="Extracted hex region" />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Hex Grid Viewer */}
          {selectedImage && (
            <div className="hex-viewer">
              <h2>Hex Grid Viewer</h2>
              <p>Click on a hex cell to contribute content. Blue hexes already have contributions.</p>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hex Contribution Modal */}
      {showContributionModal && selectedHexCoords && (
        <div className="modal-overlay" onClick={() => setShowContributionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Contribute to Hex {selectedHexCoords.q}, {selectedHexCoords.r}
              </h2>
              <button 
                className="close-button"
                onClick={() => setShowContributionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Context Information */}
              {hexContext && (
                <div className="hex-context">
                  <h3>Context Information</h3>
                  <div className="context-info">
                    <p><strong>Current Hex:</strong> Q={hexContext.current.q}, R={hexContext.current.r} (Level {hexContext.current.level})</p>
                    {hexContext.parent && hexContext.parent.type === 'world' ? (
                      <div>
                        <p><strong>World Context:</strong></p>
                        <div className="world-context">{hexContext.parent.description}</div>
                      </div>
                    ) : hexContext.parent ? (
                      <p><strong>Parent:</strong> Q={hexContext.parent.q}, R={hexContext.parent.r} - "{hexContext.parent.description}"</p>
                    ) : (
                      <p><strong>Parent:</strong> None (Top level hex)</p>
                    )}
                  </div>
                  
                  {/* Context Images */}
                  <div className="context-images">
                    <div className="context-image">
                      <h4>Current Hex</h4>
                      {hexExtraction && <img src={hexExtraction} alt="Current hex region" />}
                    </div>
                    <div className="context-image">
                      <h4>Hex with Grid</h4>
                      {selectedImage && (
                        <img 
                          src={`${API_BASE}/api/hex-grid-view/${selectedImage.id}/${selectedHexCoords.q}/${selectedHexCoords.r}`} 
                          alt="Hex with surrounding grid" 
                        />
                      )}
                    </div>
                    <div className="context-image">
                      <h4>World Map</h4>
                      {selectedImage && (
                        <img 
                          src={`${API_BASE}/uploads/${selectedImage.filename}`} 
                          alt="Parent world map" 
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Copyable Context */}
                  <div className="copyable-context">
                    <div className="copyable-header">
                      <h4>AI Context Prompt:</h4>
                      <button 
                        className="copy-button"
                        onClick={handleCopyToClipboard}
                        disabled={!hexContext?.textSummary}
                      >
                        {copySuccess || 'Copy'}
                      </button>
                    </div>
                    <textarea 
                      readOnly 
                      value={hexContext.textSummary}
                      rows={8}
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>

                  {/* Image Generation Prompt - Only show if hex has description */}
                  {hexContext?.imagePrompt && (
                    <div className="copyable-context image-prompt">
                      <div className="copyable-header">
                        <h4>AI Image Generation Prompt:</h4>
                        <button 
                          className="copy-button image-copy"
                          onClick={handleCopyImagePrompt}
                          disabled={!hexContext?.imagePrompt}
                        >
                          {copyImageSuccess || 'Copy'}
                        </button>
                      </div>
                      <textarea 
                        readOnly 
                        value={hexContext.imagePrompt}
                        rows={8}
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hex Preview */}
              {hexExtraction && !hexContext && (
                <div className="hex-preview">
                  <h3>Current Hex Region</h3>
                  <img src={hexExtraction} alt="Hex region preview" />
                </div>
              )}

              {/* Existing Contribution */}
              {existingContribution && (
                <div className="existing-contribution">
                  <h3>Existing Contribution</h3>
                  <p><strong>Description:</strong> {existingContribution.description}</p>
                  <p><strong>Contributor:</strong> {existingContribution.contributorName}</p>
                  <p><strong>Status:</strong> {existingContribution.status}</p>
                  {existingContribution.contributedImageFilename && (
                    <img 
                      src={`${API_BASE}/api/contributions/${existingContribution.contributedImageFilename}`}
                      alt="Contributed content"
                      style={{ maxWidth: '200px' }}
                    />
                  )}
                </div>
              )}

              {/* Contribution Form */}
              <form onSubmit={handleContributionSubmit} className="contribution-form">
                <div className="form-group">
                  <label htmlFor="contributorName">Your Name:</label>
                  <input
                    type="text"
                    id="contributorName"
                    name="contributorName"
                    placeholder="Enter your name (optional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Describe what's in this hex region..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contributedImage">Upload Zoomed Image (optional):</label>
                  <input
                    type="file"
                    id="contributedImage"
                    name="contributedImage"
                    accept="image/*"
                  />
                  <small>Upload a more detailed image of this hex region</small>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowContributionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">
                    Submit Contribution
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
