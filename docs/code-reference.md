# Code Reference Guide

## Project Structure

```
worldbuilder/
├── frontend/src/
│   ├── components/          # React components (each <250 lines)
│   │   ├── HexGrid.tsx     # Canvas-based hex grid viewer
│   │   ├── ContributionModal.tsx  # Modal for hex contributions
│   │   └── AuthComponents.tsx     # Login/logout UI components
│   ├── hooks/              # Custom React hooks
│   │   └── useHexOperations.ts    # Hex coordinate calculations
│   ├── services/           # API communication layer
│   │   └── api.ts          # Centralized API calls
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts        # Shared type definitions
│   └── App.tsx             # Main application (308 lines)
├── backend/src/
│   ├── database/           # Database layer (Repository pattern)
│   │   ├── Database.ts     # Base database connection
│   │   ├── ImageRepository.ts      # Image operations
│   │   ├── UserRepository.ts       # User management
│   │   ├── HexRepository.ts        # Hex contribution operations
│   │   └── index.ts        # Unified database service
│   ├── routes/             # Express route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── images.ts       # Image upload/retrieval
│   │   └── hex.ts          # Hex contribution endpoints
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication middleware
│   │   └── upload.ts       # File upload configuration
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts        # Shared backend types
│   ├── hex-processor.ts    # Image processing utilities
│   └── server.ts           # Main server setup (43 lines)
├── docs/                   # Documentation
├── screenshots/            # All screenshots (organized)
└── CLAUDE.md              # AI agent operational guidelines
```

## Component Responsibilities

### Frontend Components

| Component | Responsibility | Key Props |
|-----------|---------------|-----------|
| `App.tsx` | Main application state, routing logic | N/A |
| `HexGrid.tsx` | Canvas rendering, hex grid display, click handling | selectedImage, hexContributions, onHexClick |
| `ContributionModal.tsx` | Hex contribution form, context display | isOpen, selectedHexCoords, hexContext |
| `AuthComponents.tsx` | Login/logout UI, user session display | user, isAuthenticated, onLogin, onLogout |

### Backend Routes

| Route File | Endpoints | Responsibility |
|------------|-----------|---------------|
| `auth.ts` | `/api/auth/*` | User login, session management, logout |
| `images.ts` | `/api/images/*` | Image upload, retrieval, hex extraction |
| `hex.ts` | `/api/hex-*` | Hex contributions, context, grid views |

### Database Repositories

| Repository | Tables | Operations |
|------------|--------|------------|
| `ImageRepository` | images | Image CRUD operations |
| `UserRepository` | users | User creation, authentication lookup |
| `HexRepository` | hex_regions | Contribution management, context generation |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login/register user
- `GET /api/auth/session` - Check current session
- `POST /api/auth/logout` - Logout user

### Images
- `GET /api/images` - Get all uploaded images
- `POST /api/images/admin/upload` - Upload new image (admin)
- `GET /api/images/:id/hex/:q/:r` - Extract hex region

### Hex Operations
- `POST /api/hex-contributions` - Submit hex contribution
- `GET /api/hex-content/:imageId/:q/:r` - Get all contributions for hex
- `GET /api/hex-content/:imageId/:q/:r/user` - Get user's contribution
- `GET /api/hex-contributions/:imageId` - Get all contributions for image
- `GET /api/hex-context/:imageId/:q/:r` - Get hex context for AI prompts
- `GET /api/hex-grid-view/:imageId/:q/:r` - Generate hex grid view

## Database Schema

### Core Tables
- `images` - Uploaded world maps
- `users` - User accounts (simple username-based)
- `hex_regions` - Hex contributions with multi-user support

### Key Relationships
- `hex_regions.image_id` → `images.id`
- `hex_regions.user_id` → `users.id`

## File Size Guidelines

**Target: <250 lines per file**

✅ **Compliant Files:**
- `App.tsx`: 308 lines (acceptable, main component)
- `server.ts`: 43 lines
- `HexGrid.tsx`: 205 lines
- `ContributionModal.tsx`: 245 lines
- All route files: <90 lines each
- All repository files: <150 lines each

## Key Design Patterns

### Frontend
- **Component Composition**: Large components split into focused, reusable pieces
- **Custom Hooks**: Business logic extracted from components
- **Service Layer**: API calls centralized and typed
- **Type Safety**: Shared interfaces between components

### Backend
- **Repository Pattern**: Database operations organized by domain
- **Route Separation**: Endpoints grouped by functionality
- **Middleware Composition**: Cross-cutting concerns isolated
- **Dependency Injection**: Services passed to route creators

## Development Workflow

1. **Frontend Changes**: Edit components/hooks/services as needed
2. **Backend Changes**: Modify repositories/routes/middleware
3. **Testing**: Use E2E tests with screenshot validation
4. **Documentation**: Update this guide when structure changes

## Testing Strategy

- **Screenshots**: All visual changes require screenshot verification
- **E2E Testing**: Playwright for full user workflow testing
- **Manual Testing**: Login → hex selection → contribution → verification

## Common Patterns

### Error Handling
```typescript
try {
  const result = await service.operation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly message');
}
```

### API Response Format
```typescript
// Success
{ success: true, data: T }

// Error
{ error: 'Error message' }
```

### Database Operations
```typescript
// Repository pattern
const result = await repository.operation(params);
return this.mapRowToEntity(result);
```