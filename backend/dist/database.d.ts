export declare class Database {
    private imageRepo;
    private userRepo;
    private hexRepo;
    constructor();
    saveImage(image: any): Promise<void>;
    getAllImages(): Promise<import("./types").ImageRecord[]>;
    getImageById(id: string): Promise<import("./types").ImageRecord | null>;
    createUser(username: string): Promise<import("./types").User>;
    getUserByUsername(username: string): Promise<import("./types").User | null>;
    getUserById(id: string): Promise<import("./types").User | null>;
    saveHexContribution(contribution: any): Promise<void>;
    getHexContribution(imageId: string, q: number, r: number): Promise<import("./types").HexContribution | null>;
    getHexContributionsByImage(imageId: string): Promise<import("./types").HexContribution[]>;
    getAllHexContributions(imageId: string, q: number, r: number): Promise<import("./types").HexContribution[]>;
    getUserHexContribution(imageId: string, q: number, r: number, userId: string): Promise<import("./types").HexContribution | null>;
    updateHexContribution(id: string, updates: any): Promise<void>;
    getHexContext(imageId: string, q: number, r: number): Promise<any>;
    getSiblingHexes(imageId: string, centerQ: number, centerR: number): Promise<any[]>;
    getZoomableHexes(imageId: string): Promise<{
        q: number;
        r: number;
        contributedImageFilename: string;
    }[]>;
    getZoomImageData(imageId: string, q: number, r: number): Promise<{
        contributedImageFilename: string;
        contributionId: string;
    } | null>;
    createChildHexLevel(parentImageId: string, parentQ: number, parentR: number, contributedImageFilename: string): Promise<string>;
    getParentImageId(childImageId: string): Promise<string | null>;
    getBreadcrumbPath(imageId: string): Promise<{
        imageId: string;
        q?: number;
        r?: number;
        level: number;
    }[]>;
}
//# sourceMappingURL=database.d.ts.map