import React, { useState, useEffect } from 'react';
import './App.css';
import { HexGrid } from './components/HexGrid';
import { ContributionModal } from './components/ContributionModal';
import { AuthHeader, LoginModal } from './components/AuthComponents';
import { imageService, authService, hexService } from './services/api';
import { ImageData, HexCoordinates, HexContribution, User, HexContext } from './types';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [hexExtraction, setHexExtraction] = useState<string | null>(null);
  const [selectedHexCoords, setSelectedHexCoords] = useState<HexCoordinates | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [existingContribution, setExistingContribution] = useState<HexContribution | null>(null);
  const [allHexContributions, setAllHexContributions] = useState<HexContribution[]>([]);
  const [userHexContribution, setUserHexContribution] = useState<HexContribution | null>(null);
  const [hexContributions, setHexContributions] = useState<HexContribution[]>([]);
  const [hexContext, setHexContext] = useState<HexContext | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [copyImageSuccess, setCopyImageSuccess] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    fetchImages();
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const data = await authService.checkSession();
      if (data.authenticated) {
        setUser(data.user!);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoggingIn(true);
    try {
      const data = await authService.login(username);
      setUser(data.user);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setUsername('');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const data = await imageService.getAllImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const loadImageWithHexOverlay = (image: ImageData) => {
    console.log('Setting selected image:', image);
    setSelectedImage(image);
    setHexExtraction(null);
    setSelectedHexCoords(null);
  };

  const handleHexClick = async (hexCoords: HexCoordinates) => {
    if (!selectedImage) return;

    setSelectedHexCoords(hexCoords);

    // Check if there are existing contributions for this hex
    try {
      const data = await hexService.getHexContent(selectedImage.id, hexCoords.q, hexCoords.r);
      setAllHexContributions(data.contributions);
      setExistingContribution(data.contributions[0] || null); // For backward compatibility
    } catch (error) {
      console.log('No existing contributions found for this hex');
      setAllHexContributions([]);
      setExistingContribution(null);
    }

    // If user is authenticated, check for their specific contribution
    if (isAuthenticated) {
      try {
        const userContribution = await hexService.getUserHexContribution(selectedImage.id, hexCoords.q, hexCoords.r);
        setUserHexContribution(userContribution);
      } catch (error) {
        console.log('No user contribution found for this hex');
        setUserHexContribution(null);
      }
    }

    // Fetch hex context (parent/sibling info)
    try {
      const context = await hexService.getHexContext(selectedImage.id, hexCoords.q, hexCoords.r);
      setHexContext(context);
    } catch (error) {
      console.log('Error fetching hex context:', error);
      setHexContext(null);
    }

    // Extract hex region for preview
    try {
      const blob = await imageService.extractHexRegion(selectedImage.id, hexCoords.q, hexCoords.r);
      const url = URL.createObjectURL(blob);
      setHexExtraction(url);
    } catch (error) {
      console.error('Failed to extract hex:', error);
    }

    // Show contribution modal
    setShowContributionModal(true);
  };

  const handleContributionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedImage || !selectedHexCoords) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append('imageId', selectedImage.id);
    formData.append('q', selectedHexCoords.q.toString());
    formData.append('r', selectedHexCoords.r.toString());

    try {
      await hexService.submitContribution(formData);
      console.log('Contribution submitted successfully');
      setShowContributionModal(false);
      // Refresh contributions for this image
      fetchHexContributions(selectedImage.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        setShowLoginModal(true);
      } else {
        console.error('Failed to submit contribution');
      }
    }
  };

  const fetchHexContributions = async (imageId: string) => {
    try {
      const contributions = await hexService.getHexContributions(imageId);
      setHexContributions(contributions);
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
      <header className="app-header">
        <h1>Worldbuilder Admin</h1>
        <AuthHeader
          user={user}
          isAuthenticated={isAuthenticated}
          onLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
        />
      </header>
      
      <div className="main-container">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Image List */}
          <div className="image-list">
            <h2>Uploaded Images</h2>
            {images.map((image) => (
              <div key={image.id} className="image-item">
                <img
                  src={`http://localhost:3002/uploads/${image.filename}`}
                  alt={image.description}
                  onError={(e) => {
                    console.error('Image failed to load:', `http://localhost:3002/uploads/${image.filename}`);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', `http://localhost:3002/uploads/${image.filename}`)}
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
            <HexGrid
              selectedImage={selectedImage}
              hexContributions={hexContributions}
              onHexClick={handleHexClick}
            />
          )}
        </div>
      </div>

      {/* Hex Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        selectedHexCoords={selectedHexCoords}
        selectedImage={selectedImage}
        hexExtraction={hexExtraction}
        allHexContributions={allHexContributions}
        userHexContribution={userHexContribution}
        hexContext={hexContext}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowLoginModal(true)}
        onSubmit={handleContributionSubmit}
        copySuccess={copySuccess}
        copyImageSuccess={copyImageSuccess}
        onCopyToClipboard={handleCopyToClipboard}
        onCopyImagePrompt={handleCopyImagePrompt}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSubmit={handleLogin}
        username={username}
        onUsernameChange={setUsername}
        isLoggingIn={isLoggingIn}
      />
    </div>
  );
}

export default App;