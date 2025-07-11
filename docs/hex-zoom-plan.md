# Hex Zoom-In Feature Implementation Plan

## Overview
Implement hierarchical hex exploration where clicking on a hex with a contributed image replaces the main image and overlays a new hex grid for deeper exploration.

## Core Requirements Analysis
- **Current State**: System has foundation with `zoom_level` and `parent_image_id` fields but only operates at zoom level 1
- **Goal**: Enable contributed images to become new "main images" with their own hex grids
- **User Flow**: Click hex → if has image contribution → zoom in → new hex grid overlaid

## Implementation Strategy

### Phase 1: Backend Hierarchy System
1. **Database Enhancements**
   - Modify `HexRepository.ts` to support true parent-child relationships
   - Add methods for getting child contributions and navigating hierarchy
   - Update zoom level logic to handle dynamic levels (2, 3, 4, etc.)

2. **API Endpoints**
   - New endpoint: `GET /api/hex-zoom/:imageId/:q/:r` - Get contributed image for zoom-in
   - Modify existing endpoints to be zoom-level aware
   - Add breadcrumb navigation endpoint for zoom hierarchy

3. **Image Processing Updates**
   - Modify `HexProcessor.ts` to handle contributed images as new base images
   - Add zoom-level aware hex size calculations
   - Ensure contributed images can serve as parent images for new hex grids

### Phase 2: Frontend Zoom Interface
1. **HexGrid Component Enhancement**
   - Add click handler for zoom-in functionality
   - Implement zoom level state management
   - Add visual indicators for "zoomable" hexes (those with image contributions)
   - Handle image switching when zooming in

2. **Navigation System**
   - Add breadcrumb navigation for zoom hierarchy
   - "Zoom out" functionality to return to parent levels
   - Visual hierarchy indicators

3. **State Management**
   - Track current zoom level and parent chain
   - Manage image transitions during zoom operations
   - Handle loading states during zoom transitions

### Phase 3: Integration & Polish
1. **UI/UX Improvements**
   - Loading animations for zoom transitions
   - Visual feedback for zoomable hexes
   - Breadcrumb navigation styling
   - Zoom level indicators

2. **Context System Updates**
   - Update AI context generation for multi-level hexes
   - Include parent and grandparent context in prompts
   - Handle sibling relationships across zoom levels

3. **Testing & Validation**
   - E2E tests for zoom functionality
   - Multi-level navigation testing
   - Performance testing with nested hierarchies

## Technical Implementation Details

### Key Changes Required:
1. **Database**: Add recursive parent-child queries and zoom-level aware operations
2. **Backend**: New zoom endpoints and modified context generation
3. **Frontend**: Zoom state management and image switching logic
4. **UI**: Visual indicators and navigation controls

### Files to Modify:
- `backend/src/database/HexRepository.ts` - Hierarchy operations
- `backend/src/routes/hex.ts` - Zoom endpoints
- `frontend/src/components/HexGrid.tsx` - Zoom functionality
- `frontend/src/App.tsx` - State management
- `frontend/src/services/api.ts` - New API calls

## Success Criteria
- Users can click on hexes with image contributions to zoom in
- Contributed images become new base images with hex grids
- Multi-level navigation works smoothly
- Context system remains functional across zoom levels
- Performance remains acceptable with nested hierarchies

## Current System Analysis

### Existing Foundation
- **Database Schema**: Already has `zoom_level` and `parent_image_id` fields
- **Coordinate System**: Solid axial (q,r) coordinate system with 50px hex size
- **File Storage**: Contribution images stored in `/backend/contributions/`
- **Multi-user Support**: Multiple contributions per hex supported

### Key Limitations to Address
- **Fixed Zoom Level**: Currently hardcoded to level 1
- **No Hierarchy Navigation**: Parent-child relationships not implemented
- **Static Image Display**: No dynamic image switching based on zoom
- **Missing Context**: AI context doesn't handle multi-level hierarchies

## Implementation Timeline
1. **Phase 1**: Backend foundation (~2-3 development sessions)
2. **Phase 2**: Frontend interface (~2-3 development sessions)  
3. **Phase 3**: Polish and testing (~1-2 development sessions)

This plan leverages the existing solid foundation while adding the hierarchical zoom functionality needed for deep world exploration.