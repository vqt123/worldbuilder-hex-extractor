"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const database_1 = require("./database");
const hex_processor_1 = require("./hex-processor");
const auth_1 = require("./routes/auth");
const images_1 = require("./routes/images");
const hex_1 = require("./routes/hex");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: 'worldbuilder-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Initialize services
const database = new database_1.Database();
const hexProcessor = new hex_processor_1.HexProcessor();
// Routes
app.use('/api/auth', (0, auth_1.createAuthRoutes)(database));
app.use('/api/images', (0, images_1.createImageRoutes)(database, hexProcessor));
app.use('/api', (0, hex_1.createHexRoutes)(database, hexProcessor));
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map