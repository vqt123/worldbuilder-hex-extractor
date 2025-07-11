import { ImageRepository } from './ImageRepository';
import { UserRepository } from './UserRepository';
import { HexRepository } from './HexRepository';

export class DatabaseService {
  private imageRepo: ImageRepository;
  private userRepo: UserRepository;
  private hexRepo: HexRepository;

  constructor() {
    this.imageRepo = new ImageRepository();
    this.userRepo = new UserRepository();
    this.hexRepo = new HexRepository();
  }

  // Image operations
  async saveImage(image: any) {
    return this.imageRepo.saveImage(image);
  }

  async getAllImages() {
    return this.imageRepo.getAllImages();
  }

  async getImageById(id: string) {
    return this.imageRepo.getImageById(id);
  }

  // User operations
  async createUser(username: string) {
    return this.userRepo.createUser(username);
  }

  async getUserByUsername(username: string) {
    return this.userRepo.getUserByUsername(username);
  }

  async getUserById(id: string) {
    return this.userRepo.getUserById(id);
  }

  // Hex operations
  async saveHexContribution(contribution: any) {
    return this.hexRepo.saveHexContribution(contribution);
  }

  async getHexContribution(imageId: string, q: number, r: number) {
    return this.hexRepo.getHexContribution(imageId, q, r);
  }

  async getHexContributionsByImage(imageId: string) {
    return this.hexRepo.getHexContributionsByImage(imageId);
  }

  async getAllHexContributions(imageId: string, q: number, r: number) {
    return this.hexRepo.getAllHexContributions(imageId, q, r);
  }

  async getUserHexContribution(imageId: string, q: number, r: number, userId: string) {
    return this.hexRepo.getUserHexContribution(imageId, q, r, userId);
  }

  async updateHexContribution(id: string, updates: any) {
    return this.hexRepo.updateHexContribution(id, updates);
  }

  async getHexContext(imageId: string, q: number, r: number) {
    return this.hexRepo.getHexContext(imageId, q, r);
  }

  async getSiblingHexes(imageId: string, centerQ: number, centerR: number) {
    return this.hexRepo.getSiblingHexes(imageId, centerQ, centerR);
  }

  // Zoom-related methods
  async getZoomableHexes(imageId: string) {
    return this.hexRepo.getZoomableHexes(imageId);
  }

  async getZoomImageData(imageId: string, q: number, r: number) {
    return this.hexRepo.getZoomImageData(imageId, q, r);
  }

  async createChildHexLevel(parentImageId: string, parentQ: number, parentR: number, contributedImageFilename: string) {
    return this.hexRepo.createChildHexLevel(parentImageId, parentQ, parentR, contributedImageFilename);
  }

  async getParentImageId(childImageId: string) {
    return this.hexRepo.getParentImageId(childImageId);
  }

  async getBreadcrumbPath(imageId: string) {
    return this.hexRepo.getBreadcrumbPath(imageId);
  }
}

// Export types
export * from '../types';
export { Database } from './Database';