"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
// Temporary compatibility layer during refactoring
const ImageRepository_1 = require("./database/ImageRepository");
const UserRepository_1 = require("./database/UserRepository");
const HexRepository_1 = require("./database/HexRepository");
class Database {
    constructor() {
        this.imageRepo = new ImageRepository_1.ImageRepository();
        this.userRepo = new UserRepository_1.UserRepository();
        this.hexRepo = new HexRepository_1.HexRepository();
    }
    // Image operations
    async saveImage(image) {
        return this.imageRepo.saveImage(image);
    }
    async getAllImages() {
        return this.imageRepo.getAllImages();
    }
    async getImageById(id) {
        return this.imageRepo.getImageById(id);
    }
    // User operations
    async createUser(username) {
        return this.userRepo.createUser(username);
    }
    async getUserByUsername(username) {
        return this.userRepo.getUserByUsername(username);
    }
    async getUserById(id) {
        return this.userRepo.getUserById(id);
    }
    // Hex operations
    async saveHexContribution(contribution) {
        return this.hexRepo.saveHexContribution(contribution);
    }
    async getHexContribution(imageId, q, r) {
        return this.hexRepo.getHexContribution(imageId, q, r);
    }
    async getHexContributionsByImage(imageId) {
        return this.hexRepo.getHexContributionsByImage(imageId);
    }
    async getAllHexContributions(imageId, q, r) {
        return this.hexRepo.getAllHexContributions(imageId, q, r);
    }
    async getUserHexContribution(imageId, q, r, userId) {
        return this.hexRepo.getUserHexContribution(imageId, q, r, userId);
    }
    async updateHexContribution(id, updates) {
        return this.hexRepo.updateHexContribution(id, updates);
    }
    async getHexContext(imageId, q, r) {
        return this.hexRepo.getHexContext(imageId, q, r);
    }
    async getSiblingHexes(imageId, centerQ, centerR) {
        return this.hexRepo.getSiblingHexes(imageId, centerQ, centerR);
    }
    // New zoom methods
    async getZoomableHexes(imageId) {
        return this.hexRepo.getZoomableHexes(imageId);
    }
    async getZoomImageData(imageId, q, r) {
        return this.hexRepo.getZoomImageData(imageId, q, r);
    }
    async createChildHexLevel(parentImageId, parentQ, parentR, contributedImageFilename) {
        return this.hexRepo.createChildHexLevel(parentImageId, parentQ, parentR, contributedImageFilename);
    }
    async getParentImageId(childImageId) {
        return this.hexRepo.getParentImageId(childImageId);
    }
    async getBreadcrumbPath(imageId) {
        return this.hexRepo.getBreadcrumbPath(imageId);
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map