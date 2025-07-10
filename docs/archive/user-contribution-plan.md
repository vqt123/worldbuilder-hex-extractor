# User Hex Contribution System Implementation Plan

## 🎯 Overview
Transform the current admin-only system into a collaborative world-building platform where users can contribute content to individual hex cells, including zoomed-in images and descriptions.

## 📋 Core Features to Implement

### 1. **Hex Cell Contribution Interface**
- **Modal/Panel for Hex Contribution**: When user clicks a hex cell, show contribution form
- **Image Upload**: Allow users to upload zoomed-in images for specific hex coordinates
- **Description Input**: Rich text area for hex cell descriptions
- **Context Awareness**: Display parent/surrounding hex information for context

### 2. **Database Schema Enhancement**
- **Extend hex_regions table**: Add columns for user-contributed images and metadata
- **User tracking**: Add contributor information (can start simple without full auth)
- **Hierarchy support**: Track parent-child relationships between hex levels
- **Content moderation**: Status flags for contributed content

### 3. **Backend API Endpoints**
- **POST /api/hex-contributions**: Submit new hex cell content
- **GET /api/hex-content/:imageId/:q/:r**: Retrieve hex cell content
- **PUT /api/hex-content/:id**: Update existing hex content
- **GET /api/hex-context/:imageId/:q/:r**: Get surrounding hex context

### 4. **Frontend User Interface**
- **Contribution Modal**: Clean form interface triggered by hex click
- **Content Display**: Show existing contributions when clicking populated hex cells
- **Context Panel**: Display parent image and surrounding hex descriptions
- **Visual Indicators**: Different hex border colors for contributed vs empty cells

### 5. **Enhanced Hex Processing**
- **Multi-level Support**: Handle images contributed at different zoom levels
- **Image Validation**: Ensure contributed images fit hex boundaries properly
- **Thumbnail Generation**: Create preview images for hex grid display

## 🛠️ Implementation Steps

### Phase 1: Database & Backend Foundation
1. Extend `hex_regions` table schema
2. Add database methods for hex content CRUD operations
3. Create API endpoints for hex contributions
4. Implement hex content retrieval with context

### Phase 2: Frontend Contribution Interface
1. Create hex contribution modal component
2. Add form validation and image upload handling
3. Implement context display (parent/surrounding hex info)
4. Update hex grid to show contribution status

### Phase 3: Content Display & Management
1. Show existing contributions when clicking populated hex cells
2. Add visual indicators for contributed vs empty hex cells
3. Implement basic content moderation interface
4. Add edit/update functionality for contributions

### Phase 4: User Experience Enhancements
1. Add loading states and error handling
2. Implement image optimization for contributions
3. Add search/filter functionality for hex content
4. Improve responsive design for mobile contribution

## 📊 Database Schema Changes
```sql
-- Extend hex_regions table
ALTER TABLE hex_regions ADD COLUMN contributed_image_filename TEXT;
ALTER TABLE hex_regions ADD COLUMN contributor_name TEXT;
ALTER TABLE hex_regions ADD COLUMN contributed_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hex_regions ADD COLUMN status TEXT DEFAULT 'pending'; -- pending, approved, rejected
ALTER TABLE hex_regions ADD COLUMN parent_image_id TEXT; -- for hierarchy
ALTER TABLE hex_regions ADD COLUMN zoom_level INTEGER DEFAULT 1;
```

## 🔧 Technical Considerations
- **File Storage**: Organize contributed images in structured folders by image_id/q_r/
- **Image Processing**: Validate uploaded images fit hex shape requirements
- **Moderation**: Simple approval workflow for contributed content
- **Performance**: Lazy loading for hex content display
- **Mobile Support**: Touch-friendly contribution interface

## 🏗️ Current Architecture
The system builds on:
- ✅ Accurate hex coordinate system (Q,R axial coordinates)
- ✅ Hex extraction and image processing with Sharp
- ✅ SQLite database with images and hex_regions tables
- ✅ React frontend with canvas-based hex grid overlay
- ✅ Express/TypeScript backend with file upload support

## 📝 Implementation Status
- [x] Plan documentation
- [ ] Database schema extension
- [ ] Backend API endpoints
- [ ] Frontend contribution modal
- [ ] Visual hex status indicators
- [ ] Content display system
- [ ] Image validation and processing
- [ ] Testing and refinement

This plan transforms the current admin tool into a collaborative platform while building on the solid coordinate system foundation that's already working.