# Simple Context Helper for Hex Contributions

## 🎯 Overview
Enhance the contribution modal to display actual user-submitted descriptions and context images that users can easily copy/paste to AI tools.

## 📋 Context Display

### 1. **Context Information Section**
Display actual database content:
- **Current Hex**: Q=7, R=2, Level=1
- **Parent Description**: Full user-submitted description from database (if exists)
- **Sibling Hexes**: Q,R coordinates with their full user-submitted descriptions
- **Hierarchy Info**: "This is a Level 1 hex within parent hex Q=1, R=0"

### 2. **Context Images (Rendered On-Demand)**
Simple images in modal:
- **Parent Image**: Full parent hex region
- **Current Hex**: Extracted hex region (already exists)
- **Hex with Grid**: Current hex highlighted within surrounding grid
- All rendered via existing backend image processing

### 3. **Copy-Friendly Text Block**
Readonly textarea with actual descriptions:
```
Current Hex: Q=7, R=2 (Level 1)
Parent: Q=1, R=0 - "[Full user description from database]"
Siblings:
- Q=6, R=2: "[Full user description from database]" 
- Q=8, R=2: "[Full user description from database]"
- Q=7, R=1: "No description yet"
- Q=7, R=3: "[Full user description from database]"
```

## 🛠️ Implementation

### Backend: Query Real User Descriptions
- Get parent hex description from `hex_regions` table
- Get sibling hex descriptions from `hex_regions` table  
- Return empty/null for hexes with no contributions yet
- No AI processing - just database lookups

### Frontend: Display Real Data
- Show actual user-submitted descriptions
- Display "No description yet" for empty hexes
- Keep all text copyable for external AI use
- Simple layout with existing form below

This provides users with real context from actual contributions, not generated summaries.