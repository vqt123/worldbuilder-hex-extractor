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

const API_BASE = 'http://localhost:3002';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hexExtraction, setHexExtraction] = useState<string | null>(null);
  const [selectedHexCoords, setSelectedHexCoords] = useState<HexCoordinates | null>(null);
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
  }, [selectedImage]);

  const drawHexGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    const hexSize = 50 * scale;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    // Draw hex grid
    for (let q = -Math.ceil(width / (hexWidth * 0.75)); q <= Math.ceil(width / (hexWidth * 0.75)); q++) {
      for (let r = -Math.ceil(height / hexHeight); r <= Math.ceil(height / hexHeight); r++) {
        const center = hexToPixel(q, r, hexSize);
        
        // Check if hex is within canvas bounds
        if (center.x >= -hexSize && center.x <= width + hexSize &&
            center.y >= -hexSize && center.y <= height + hexSize) {
          drawHexagon(ctx, center.x, center.y, hexSize);
        }
      }
    }
  };

  const hexToPixel = (q: number, r: number, hexSize: number) => {
    const x = hexSize * (3/2 * q);
    const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const pixelToHex = (x: number, y: number, hexSize: number): HexCoordinates => {
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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to hex coordinates
    const scale = Math.min(800 / selectedImage.width, 600 / selectedImage.height);
    const hexSize = 50 * scale;
    const hexCoords = pixelToHex(x, y, hexSize);

    // Convert back to original image coordinates
    const originalHexCoords = {
      q: Math.round(hexCoords.q / scale),
      r: Math.round(hexCoords.r / scale)
    };

    console.log('Clicked hex coordinates:', originalHexCoords);
    setSelectedHexCoords(originalHexCoords);

    try {
      const response = await fetch(
        `${API_BASE}/api/images/${selectedImage.id}/hex/${originalHexCoords.q}/${originalHexCoords.r}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setHexExtraction(url);
      }
    } catch (error) {
      console.error('Failed to extract hex:', error);
    }
  };

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
              <p>Click on a hex cell to extract that region</p>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
