import { ImageData, HexContribution, User, HexContext } from '../types';

const API_BASE = 'http://localhost:3002';

export const imageService = {
  async getAllImages(): Promise<ImageData[]> {
    const response = await fetch(`${API_BASE}/api/images`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  async getImageById(id: string): Promise<ImageData> {
    const response = await fetch(`${API_BASE}/api/images/${id}`);
    if (!response.ok) throw new Error('Failed to fetch image');
    return response.json();
  },

  async extractHexRegion(imageId: string, q: number, r: number): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/images/${imageId}/hex/${q}/${r}`);
    if (!response.ok) throw new Error('Failed to extract hex region');
    return response.blob();
  },

  async getHexGridView(imageId: string, q: number, r: number): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/hex-grid-view/${imageId}/${q}/${r}`);
    if (!response.ok) throw new Error('Failed to generate hex grid view');
    return response.blob();
  }
};

export const authService = {
  async login(username: string): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async checkSession(): Promise<{ authenticated: boolean; user?: User }> {
    const response = await fetch(`${API_BASE}/api/auth/session`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Session check failed');
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Logout failed');
  }
};

export const hexService = {
  async getHexContributions(imageId: string): Promise<HexContribution[]> {
    const response = await fetch(`${API_BASE}/api/hex-contributions/${imageId}`);
    if (!response.ok) throw new Error('Failed to fetch hex contributions');
    return response.json();
  },

  async getHexContent(imageId: string, q: number, r: number): Promise<{ contributions: HexContribution[] }> {
    const response = await fetch(`${API_BASE}/api/hex-content/${imageId}/${q}/${r}`);
    if (!response.ok) throw new Error('No contributions found');
    return response.json();
  },

  async getUserHexContribution(imageId: string, q: number, r: number): Promise<HexContribution> {
    const response = await fetch(`${API_BASE}/api/hex-content/${imageId}/${q}/${r}/user`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('No user contribution found');
    return response.json();
  },

  async submitContribution(formData: FormData): Promise<{ success: boolean; contributionId: string }> {
    const response = await fetch(`${API_BASE}/api/hex-contributions`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to submit contribution');
    return response.json();
  },

  async getHexContext(imageId: string, q: number, r: number): Promise<HexContext> {
    const response = await fetch(`${API_BASE}/api/hex-context/${imageId}/${q}/${r}`);
    if (!response.ok) throw new Error('Failed to fetch hex context');
    return response.json();
  }
};