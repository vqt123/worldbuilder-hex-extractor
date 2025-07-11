import React, { useState, useRef } from 'react';
import { HexCoordinates, HexContribution, User, ImageData, HexContext } from '../types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHexCoords: HexCoordinates | null;
  selectedImage: ImageData | null;
  hexExtraction: string | null;
  allHexContributions: HexContribution[];
  userHexContribution: HexContribution | null;
  hexContext: HexContext | null;
  user: User | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  copySuccess: string;
  copyImageSuccess: string;
  onCopyToClipboard: () => void;
  onCopyImagePrompt: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  selectedHexCoords,
  selectedImage,
  hexExtraction,
  allHexContributions,
  userHexContribution,
  hexContext,
  user,
  isAuthenticated,
  onLogin,
  onSubmit,
  copySuccess,
  copyImageSuccess,
  onCopyToClipboard,
  onCopyImagePrompt
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    try {
      // Handle regular file drops first
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Regular file drop
        if (fileInputRef.current) {
          fileInputRef.current.files = files;
        }
        // Show preview for dropped file
        const file = files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setDraggedImage(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
        return;
      }

      // Handle image URLs dragged from websites
      const imageUrl = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
      
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
        // Create a preview of the dragged image
        setDraggedImage(imageUrl);
        
        try {
          // Try to fetch the image with mode: 'cors' to handle CORS properly
          const response = await fetch(imageUrl, { mode: 'cors' });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // Extract filename from URL or use default
          const urlPath = new URL(imageUrl).pathname;
          const filename = urlPath.split('/').pop() || 'dragged-image.png';
          
          const file = new File([blob], filename, { type: blob.type });
          
          // Create a new FileList-like object
          const fileList = {
            0: file,
            length: 1,
            item: (index: number) => index === 0 ? file : null
          };
          
          // Set the file input
          if (fileInputRef.current) {
            Object.defineProperty(fileInputRef.current, 'files', {
              value: fileList,
              writable: false
            });
          }
        } catch (fetchError) {
          console.warn('Unable to fetch image due to CORS or network restrictions:', fetchError);
          // Still show the preview URL, but user will need to manually save and upload
          alert('Image preview shown, but due to CORS restrictions, you may need to save the image locally and upload it manually.');
        }
      }
    } catch (error) {
      console.error('Error handling dropped content:', error);
      setDraggedImage(null);
    }
  };

  if (!isOpen || !selectedHexCoords) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Contribute to Hex {selectedHexCoords.q}, {selectedHexCoords.r}
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
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
                      src={`http://localhost:3002/api/hex-grid-view/${selectedImage.id}/${selectedHexCoords.q}/${selectedHexCoords.r}`} 
                      alt="Hex with surrounding grid" 
                    />
                  )}
                </div>
                <div className="context-image">
                  <h4>World Map</h4>
                  {selectedImage && (
                    <img 
                      src={`http://localhost:3002/uploads/${selectedImage.filename}`} 
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
                    onClick={onCopyToClipboard}
                    disabled={!hexContext?.textSummary}
                  >
                    {copySuccess || 'Copy'}
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={hexContext.textSummary}
                  rows={Math.min(Math.max(8, hexContext.textSummary.split('\n').length), 25)}
                  onClick={(e) => e.currentTarget.select()}
                  style={{ minHeight: '200px', maxHeight: '400px' }}
                />
              </div>

              {/* Image Generation Prompt - Only show if hex has description */}
              {hexContext?.imagePrompt && (
                <div className="copyable-context image-prompt">
                  <div className="copyable-header">
                    <h4>AI Image Generation Prompt:</h4>
                    <button 
                      className="copy-button image-copy"
                      onClick={onCopyImagePrompt}
                      disabled={!hexContext?.imagePrompt}
                    >
                      {copyImageSuccess || 'Copy'}
                    </button>
                  </div>
                  <textarea 
                    readOnly 
                    value={hexContext.imagePrompt}
                    rows={Math.min(Math.max(8, hexContext.imagePrompt.split('\n').length), 20)}
                    onClick={(e) => e.currentTarget.select()}
                    style={{ minHeight: '200px', maxHeight: '350px' }}
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

          {/* All User Contributions */}
          {allHexContributions.length > 0 && (
            <div className="all-contributions">
              <h3>All Contributions ({allHexContributions.length})</h3>
              {allHexContributions.map((contribution, index) => (
                <div key={contribution.id} className={`contribution-item ${contribution.userId === user?.id ? 'user-contribution' : ''}`}>
                  <div className="contribution-header">
                    <strong>{contribution.contributorName || 'Anonymous'}</strong>
                    <span className="contribution-date">
                      {new Date(contribution.contributedAt).toLocaleDateString()}
                    </span>
                    {contribution.userId === user?.id && (
                      <span className="user-badge">Your contribution</span>
                    )}
                  </div>
                  <p className="contribution-description">{contribution.description}</p>
                  {contribution.contributedImageFilename && (
                    <img 
                      src={`http://localhost:3002/api/contributions/${contribution.contributedImageFilename}`}
                      alt="Contributed content"
                      className="contribution-image"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Authentication Required Message */}
          {!isAuthenticated && (
            <div className="auth-required">
              <h3>Login Required</h3>
              <p>You must be logged in to contribute to hex regions.</p>
              <button onClick={onLogin} className="login-prompt-button">
                Login to Contribute
              </button>
            </div>
          )}

          {/* Contribution Form - Only for authenticated users */}
          {isAuthenticated && (
            <form onSubmit={onSubmit} className="contribution-form">
              <h3>{userHexContribution ? 'Edit Your Contribution' : 'Add Your Contribution'}</h3>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe what's in this hex region..."
                  defaultValue={userHexContribution?.description || ''}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contributedImage">Upload Zoomed Image (optional):</label>
                <div 
                  className={`drag-drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="contributedImage"
                    name="contributedImage"
                    accept="image/*"
                    className="file-input"
                  />
                  <div className="drag-drop-content">
                    <p>📁 Click to browse or drag & drop an image</p>
                    <p>🌐 You can drag images directly from websites!</p>
                  </div>
                </div>
                <small>Upload a more detailed image of this hex region</small>
                
                {draggedImage && (
                  <div className="dragged-image-preview">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p>Dragged image preview:</p>
                      <button 
                        type="button" 
                        onClick={() => setDraggedImage(null)}
                        style={{ 
                          background: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                    <img 
                      src={draggedImage} 
                      alt="Dragged content preview"
                      style={{ maxWidth: '200px', border: '2px solid #4CAF50' }}
                    />
                  </div>
                )}
                
                {userHexContribution?.contributedImageFilename && (
                  <div className="current-image">
                    <p>Current image:</p>
                    <img 
                      src={`http://localhost:3002/api/contributions/${userHexContribution.contributedImageFilename}`}
                      alt="Your current contribution"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit">
                  {userHexContribution ? 'Update Contribution' : 'Submit Contribution'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};