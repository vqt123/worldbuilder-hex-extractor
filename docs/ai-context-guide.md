# AI Agent Context Guide

## Quick Navigation for AI Agents

This guide helps AI agents quickly understand and navigate the worldbuilder codebase for efficient development.

## Core File Locations

### 🎯 Most Frequently Modified Files

| Task Type | Primary Files | Secondary Files |
|-----------|---------------|-----------------|
| **UI Changes** | `frontend/src/App.tsx`<br>`frontend/src/components/*.tsx` | `frontend/src/App.css` |
| **API Changes** | `backend/src/routes/*.ts` | `backend/src/middleware/*.ts` |
| **Database Changes** | `backend/src/database/*.ts` | `backend/src/types/index.ts` |
| **Business Logic** | `frontend/src/services/api.ts`<br>`backend/src/hex-processor.ts` | `frontend/src/hooks/*.ts` |

### 📋 Configuration & Setup Files

- `frontend/package.json` - Frontend dependencies and scripts
- `backend/package.json` - Backend dependencies and scripts  
- `backend/src/server.ts` - Main server configuration (43 lines)
- `CLAUDE.md` - AI agent operational guidelines ⚠️ **MANDATORY READ**

## Task-Specific Quick Reference

### Adding New UI Features
1. **Check**: `frontend/src/components/` for existing components
2. **Modify**: `frontend/src/App.tsx` for main app logic
3. **Add Types**: `frontend/src/types/index.ts` for new interfaces
4. **Update API**: `frontend/src/services/api.ts` for new endpoints

### Adding New API Endpoints
1. **Route File**: Choose appropriate file in `backend/src/routes/`
2. **Database**: Add methods to relevant repository in `backend/src/database/`
3. **Types**: Update `backend/src/types/index.ts` if needed
4. **Frontend**: Update `frontend/src/services/api.ts` to call new endpoint

### Database Schema Changes
1. **Repository**: Modify relevant repository in `backend/src/database/`
2. **Migration**: Update `Database.ts` initialization if schema changes
3. **Types**: Update interfaces in `backend/src/types/index.ts`

### Authentication Changes
1. **Backend**: `backend/src/routes/auth.ts` and `backend/src/middleware/auth.ts`
2. **Frontend**: `frontend/src/components/AuthComponents.tsx`
3. **Types**: Session interfaces in `backend/src/middleware/auth.ts`

## Common Development Patterns

### 🔄 Standard Workflow
1. Read `CLAUDE.md` for operational guidelines
2. Create todo list with all requirements
3. Identify affected files using this guide
4. Make changes following established patterns
5. Test with screenshots (stored in `/screenshots/`)
6. Update `project-notes.md` with changes

### 🚨 Critical Rules
- **Screenshots**: ALWAYS go in `/screenshots/` folder
- **File Size**: Keep files under 250 lines when possible
- **Testing**: Take screenshots for all UI changes
- **Documentation**: Update project-notes.md after major changes

## Code Patterns by Use Case

### React Component Pattern
```typescript
// frontend/src/components/NewComponent.tsx
import React from 'react';
import { SharedTypes } from '../types';

interface Props {
  // Define props with strong typing
}

export const NewComponent: React.FC<Props> = ({ ...props }) => {
  // Component logic
  return <div>...</div>;
};
```

### API Service Pattern
```typescript
// frontend/src/services/api.ts
export const newService = {
  async operation(params: Type): Promise<ReturnType> {
    const response = await fetch(`${API_BASE}/api/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      credentials: 'include' // For auth
    });
    if (!response.ok) throw new Error('Operation failed');
    return response.json();
  }
};
```

### Backend Route Pattern
```typescript
// backend/src/routes/new-routes.ts
import express from 'express';
import { DatabaseService } from '../database';

const router = express.Router();

export const createNewRoutes = (database: DatabaseService) => {
  router.post('/endpoint', async (req, res) => {
    try {
      const result = await database.operation(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Operation error:', error);
      res.status(500).json({ error: 'Failed to perform operation' });
    }
  });

  return router;
};
```

### Database Repository Pattern
```typescript
// backend/src/database/NewRepository.ts
import { Database } from './Database';
import { EntityType } from '../types';

export class NewRepository extends Database {
  async createEntity(data: Partial<EntityType>): Promise<EntityType> {
    await this.run(
      'INSERT INTO table (columns) VALUES (?)',
      [data.values]
    );
    return this.mapRowToEntity(data);
  }

  private mapRowToEntity(row: any): EntityType {
    return {
      // Map database row to typed entity
    };
  }
}
```

## Testing Guidelines

### Screenshot Requirements
- Take BEFORE and AFTER screenshots for UI changes
- Store in `/screenshots/` with descriptive names
- Include date/time in filename for tracking

### Manual Testing Checklist
1. Start both frontend and backend servers
2. Test authentication flow
3. Test hex grid interaction
4. Test contribution submission
5. Verify no console errors

## Debugging Common Issues

### Frontend Issues
- Check browser console for errors
- Verify API calls in Network tab
- Check React component props/state

### Backend Issues  
- Check server console for errors
- Verify database connections
- Test API endpoints individually

### Integration Issues
- Check CORS configuration in `server.ts`
- Verify authentication middleware
- Check API endpoint paths match frontend calls

## Performance Considerations

### File Size Monitoring
```bash
# Check current file sizes
wc -l frontend/src/App.tsx backend/src/server.ts backend/src/database/*.ts frontend/src/components/*.tsx
```

### Code Organization
- Split large files when approaching 250 lines
- Extract reusable logic into hooks/services
- Group related functionality in modules

## Emergency Fixes

### Quick File Location
- **App won't start**: Check `server.ts` and `App.tsx`
- **Database errors**: Check `database/` folder
- **Authentication broken**: Check `routes/auth.ts` and `AuthComponents.tsx`
- **UI broken**: Check components and `App.css`

### Recovery Commands
```bash
# Restart development servers
cd frontend && npm start
cd backend && npm run dev

# Check file structure
find . -name "*.ts*" -not -path "./node_modules/*" | head -20
```

## AI Agent Success Metrics

✅ **Good Session Indicators:**
- All files under 250 lines (except App.tsx which is acceptable at 308)
- Screenshots in correct folder
- Documentation updated
- No broken functionality
- Clean git history

❌ **Session Issues to Avoid:**
- Screenshots in project root
- Files over 250 lines without splitting
- Broken authentication/navigation
- Missing documentation updates
- Uncommitted changes