export interface ImageData {
  id: string;
  filename: string;
  description: string;
  width: number;
  height: number;
  uploadedAt: string;
}

export interface HexCoordinates {
  q: number;
  r: number;
}

export interface User {
  id: string;
  username: string;
}

export interface HexContribution {
  id: string;
  imageId: string;
  q: number;
  r: number;
  description: string;
  contributedImageFilename?: string;
  contributorName?: string;
  userId: string;
  contributedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  parentImageId?: string;
  zoomLevel: number;
}

export interface HexContext {
  current: { q: number; r: number; level: number };
  parent?: {
    type: string;
    description: string;
    q?: number;
    r?: number;
  };
  siblings: Array<{
    q: number;
    r: number;
    description: string | null;
    hasContribution: boolean;
  }>;
  textSummary: string;
  imagePrompt?: string;
}