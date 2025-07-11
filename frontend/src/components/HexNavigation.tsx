import React from 'react';

interface BreadcrumbItem {
  imageId: string;
  q?: number;
  r?: number;
  level: number;
}

interface HexNavigationProps {
  breadcrumbs: BreadcrumbItem[];
  currentImageId: string;
  onNavigate: (imageId: string) => void;
}

export const HexNavigation: React.FC<HexNavigationProps> = ({
  breadcrumbs,
  currentImageId,
  onNavigate
}) => {
  if (breadcrumbs.length <= 1) {
    return null; // Don't show navigation for root level
  }

  return (
    <div className="hex-navigation">
      <div className="breadcrumb-container">
        <span className="breadcrumb-label">Navigation: </span>
        {breadcrumbs.map((item, index) => (
          <span key={item.imageId} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}
            <button
              className={`breadcrumb-button ${item.imageId === currentImageId ? 'active' : ''}`}
              onClick={() => onNavigate(item.imageId)}
              disabled={item.imageId === currentImageId}
            >
              {item.level === 1 ? 'World' : `Hex ${item.q},${item.r}`}
              <span className="breadcrumb-level">L{item.level}</span>
            </button>
          </span>
        ))}
      </div>
      <div className="zoom-info">
        <span className="zoom-level">Current Level: {breadcrumbs.find(b => b.imageId === currentImageId)?.level || 1}</span>
      </div>
    </div>
  );
};