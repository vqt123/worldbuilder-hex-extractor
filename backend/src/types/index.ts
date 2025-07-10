export interface ImageRecord {
  id: string;
  filename: string;
  description: string;
  width: number;
  height: number;
  uploadedAt: Date;
}

export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface HexContribution {
  id: string;
  imageId: string;
  q: number;
  r: number;
  description: string;
  contributedImageFilename?: string;
  contributorName?: string; // Keep for backward compatibility
  userId: string;
  contributedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  parentImageId?: string;
  zoomLevel: number;
}