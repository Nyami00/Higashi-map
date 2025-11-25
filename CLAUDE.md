# Higashi-map - AI Assistant Guide

## Project Overview

**Higashi-map** is an interactive web-based mapping application for Sapporo City's Higashi Ward (札幌市東区), Japan. The application visualizes urban facilities with customizable radius overlays to help users understand facility accessibility and coverage areas.

**Primary Language**: Japanese (UI text and facility data)
**Application Type**: Static single-page web application
**Target Use Case**: Urban planning, facility accessibility analysis, location visualization

## Technology Stack

### Core Technologies
- **HTML5** - Semantic structure with mobile viewport optimization
- **CSS3** - Modern styling with CSS variables, glassmorphism effects, responsive design
- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **Leaflet.js v1.9.4** - Interactive mapping library
- **OpenStreetMap** - Tile provider for base map

### External Dependencies
```html
<!-- Loaded via CDN -->
- Leaflet.js 1.9.4 (CSS + JS)
- Google Fonts: Inter, Noto Sans JP
```

### Browser Requirements
- Modern browsers with ES6+ support
- CSS backdrop-filter support (webkit prefix for Safari)
- Clipboard API (with fallback to execCommand)

## File Structure

```
Higashi-map/
├── index.html          # Main HTML structure with UI controls
├── script.js           # Application logic and event handling
├── data.js             # Facility data store (array of objects)
├── style.css           # Styling with responsive design
└── CLAUDE.md           # This file (AI assistant guide)
```

### File Responsibilities

**index.html** (`index.html:1-122`)
- Document structure and meta tags
- Map container (`<div id="map">`)
- Control panel UI with toggles and sliders
- Modal overlay for user interactions
- Script loading order: `data.js` → `script.js`

**script.js** (`script.js:1-286`)
- Map initialization centered on Higashi Ward (`script.js:2`)
- State management object (`script.js:10-17`)
- Marker and circle rendering logic (`script.js:38-75`)
- Event listeners for controls (`script.js:81-101`)
- Modal helper system (`script.js:118-159`)
- Add/delete/export facility functions (`script.js:162-284`)

**data.js** (`data.js:1-79`)
- Facility data array (`facilities`)
- 6 categories: subway, aeon, maxvalu, tsuruha, junior_high, elementary
- Each facility has: id, name, category, lat, lng, address, note

**style.css** (`style.css:1-701`)
- CSS custom properties for theming (`style.css:1-21`)
- Glassmorphism panel styles (`style.css:38-45`)
- Responsive layout with mobile breakpoints (`style.css:59-68`)
- Category color indicators (`style.css:131-153`)
- Modal and button styles (`style.css:599-701`)

## Architecture & Design Patterns

### State Management
The application uses a centralized state object with per-category configuration:

```javascript
const state = {
    [category]: {
        visible: boolean,      // Toggle visibility
        radius: number,        // Circle radius in meters
        color: string,         // Hex color code
        layerGroup: L.LayerGroup  // Leaflet layer container
    }
}
```

**Categories**: `subway`, `aeon`, `maxvalu`, `tsuruha`, `junior_high`, `elementary`

### Rendering System
- **Reactive rendering**: Each category re-renders completely on state change
- **Layer groups**: Leaflet layer groups manage markers/circles per category
- **Clear-and-redraw**: `layerGroup.clearLayers()` before re-rendering

### UI Patterns
- **Mobile-first responsive**: Bottom-positioned collapsible panel on mobile, top-right fixed on desktop
- **Glassmorphism**: Semi-transparent panels with backdrop blur
- **Event-driven**: DOM event listeners trigger state updates and re-renders

### Data Flow
```
User Interaction → Event Listener → State Update → renderCategory() → Leaflet Layer Update
```

## Key Conventions

### Naming Conventions
- **Variables**: camelCase (`layerGroup`, `maxvalu`, `junior_high`)
- **Functions**: camelCase with descriptive verbs (`renderCategory`, `createCustomIcon`)
- **IDs**: Category-based prefixes (e.g., `subway-check`, `aeon-radius`)
- **CSS classes**: kebab-case (`.glass-panel`, `.control-item`)
- **Data IDs**: Prefix patterns (H01 for subway, AEON01, MV01, TS01, JH01, ES01, NEW_timestamp)

### Code Style
- **Function placement**: Helper functions defined before usage
- **Global functions**: Window-scoped for HTML onclick handlers (`window.addFacility`)
- **Comments**: Minimal inline comments, descriptive function names preferred
- **Error handling**: Try-catch for clipboard operations with fallbacks

### Color Scheme
```javascript
subway: '#ef4444'      // Red
aeon: '#8b5cf6'        // Purple
maxvalu: '#ec4899'     // Pink
tsuruha: '#f59e0b'     // Orange
junior_high: '#10b981' // Green
elementary: '#059669'  // Darker Green
```

### Marker Shapes
- **Circle markers**: Default for most categories
- **Square markers**: Elementary schools only (`script.js:55`)

## Development Workflows

### Adding a New Facility Category

1. **Update data.js**: Add facilities with new category name
2. **Update script.js state object** (`script.js:10-17`):
   ```javascript
   newcategory: { visible: true, radius: 500, color: '#hexcode', layerGroup: L.layerGroup().addTo(map) }
   ```
3. **Update style.css**: Add color variable and indicator class
4. **Update index.html**: Add control-item div with checkbox, range slider, and label
5. **Update modal select** (`index.html:227-234`): Add option for new category

### Modifying Facility Data

**Method 1: Direct editing**
- Edit `data.js` facility array
- Follow object structure: `{ id, name, category, lat, lng, address, note }`

**Method 2: Using the UI**
- Add facilities via "施設を追加" button
- Drag markers to adjust positions
- Click "保存（コピー）" to export updated data
- Replace `data.js` content with exported data

### Adjusting Default Radius Values

Modify both locations:
1. **State object** (`script.js:10-17`): Change `radius` property
2. **HTML range input** (`index.html:34-86`): Change `value` attribute

### Styling Changes

**CSS Variables** (`style.css:1-21`):
- Change colors, shadows, spacing via root variables
- Affects entire application consistently

**Responsive Breakpoints** (`style.css:59-68`):
- Mobile: < 768px (bottom panel, collapsible)
- Desktop: ≥ 768px (top-right panel, always visible)

### Map Configuration

**Initial view** (`script.js:2`):
```javascript
const map = L.map('map').setView([lat, lng], zoom);
```
- Current: `[43.090000, 141.380000]` at zoom 13
- Centered on Higashi Ward

**Tile provider** (`script.js:5-7`):
- OpenStreetMap (can be swapped for other providers)

## Important Considerations for AI Assistants

### When Making Changes

1. **Language sensitivity**: All UI text is in Japanese. Maintain language consistency.

2. **Data integrity**:
   - Preserve facility ID uniqueness
   - Maintain category consistency across files
   - Keep lat/lng precision to 6 decimal places

3. **State synchronization**:
   - Always update both state object and HTML controls
   - Ensure category names match exactly across all files
   - Call `renderCategory()` after state changes

4. **Mobile responsiveness**:
   - Test changes at 768px breakpoint
   - Ensure controls remain accessible on small screens
   - Maintain glassmorphism readability on various backgrounds

5. **Performance**:
   - Large datasets: Consider layer group optimization
   - Avoid re-rendering all categories when only one changes
   - Draggable markers: Current implementation updates data on dragend

6. **Browser compatibility**:
   - Clipboard API has fallbacks (`script.js:192-214`)
   - Backdrop-filter requires webkit prefix
   - ES6 features (const, let, arrow functions, template literals)

### Common Pitfalls to Avoid

❌ **Don't** modify facility coordinates manually without understanding precision requirements
❌ **Don't** add frameworks/build tools without discussing impact on deployment
❌ **Don't** remove fallback mechanisms (clipboard, execCommand)
❌ **Don't** break mobile collapse functionality
❌ **Don't** change category names without updating all 4 files consistently

✅ **Do** preserve existing code patterns and conventions
✅ **Do** test responsive behavior after UI changes
✅ **Do** maintain color consistency via CSS variables
✅ **Do** keep facility data exportable via the UI
✅ **Do** follow the established state management pattern

### Testing Checklist

After making changes, verify:
- [ ] Map loads and displays correctly
- [ ] All category toggles work
- [ ] Radius sliders update circles in real-time
- [ ] Markers are draggable
- [ ] Add facility modal works
- [ ] Delete facility works (with confirmation)
- [ ] Export copies data to clipboard
- [ ] Mobile collapse/expand works
- [ ] No console errors
- [ ] Responsive layout intact (test at 768px breakpoint)

## Common Tasks & Solutions

### Task: Add a new facility programmatically
```javascript
const newFacility = {
    id: 'UNIQUE_ID',
    name: '施設名',
    category: 'existing_category',
    lat: 43.0000,
    lng: 141.0000,
    address: '住所',
    note: '備考'
};
facilities.push(newFacility);
renderCategory(newFacility.category);
```

### Task: Change a category's default color
1. Update `style.css` CSS variable (`:root`)
2. Update `script.js` state object color property
3. Colors will update automatically via CSS variable references

### Task: Adjust map zoom level or center
```javascript
// In script.js:2
const map = L.map('map').setView([new_lat, new_lng], new_zoom);
```

### Task: Add a custom tile provider
```javascript
// Replace script.js:5-7
L.tileLayer('https://your-tile-provider/{z}/{x}/{y}.png', {
    attribution: 'Your attribution',
    maxZoom: 19
}).addTo(map);
```

### Task: Export facility data structure
The export function (`script.js:162-190`) generates formatted JavaScript with:
- Grouped by category
- Proper spacing and comments
- 6 decimal precision for coordinates
- Ready to paste into `data.js`

## Git Workflow

### Branch Strategy
- Feature branches with `claude/` prefix for AI-generated changes
- Branch naming: `claude/claude-md-[session-id]-[random-id]`
- Push to origin requires branch name match with session ID

### Commit Messages
- Recent pattern: Descriptive, imperative mood
- Examples: "Adjust radius values...", "Refactor map initialization..."
- Keep commits atomic and focused

### Making Changes
1. Develop on assigned feature branch
2. Commit with descriptive messages
3. Push with: `git push -u origin <branch-name>`
4. DO NOT force push or amend others' commits

## Project Context & Domain Knowledge

### Geographic Context
- **Higashi Ward** (東区): One of 10 wards in Sapporo City, Hokkaido
- **Subway Line**: Toho Line (東豊線) runs through the ward
- **Urban fabric**: Mix of residential, commercial, and institutional uses

### Facility Categories Explained
- **地下鉄 (Subway)**: Stations on the Toho Line (H01-H06 station codes)
- **イオン (AEON)**: Major supermarket/mall chain, regional shopping centers
- **MaxValu**: AEON's supermarket brand, daily shopping
- **ツルハ (Tsuruha)**: Drugstore chain, household/health products
- **中学校 (Junior High Schools)**: Ages 12-15, enrollment catchment areas important
- **小学校 (Elementary Schools)**: Ages 6-12, walkability crucial (hence smaller default radius)

### Use Cases
- **Real estate analysis**: Which areas have good facility access?
- **Urban planning**: Identify service gaps or overlaps
- **School district planning**: Visualize catchment coverage
- **Accessibility studies**: Understand walkability to services

## Future Enhancement Considerations

### Potential Features
- Search functionality for facilities
- Filter by multiple criteria simultaneously
- Custom facility categories (user-defined)
- Distance calculation between facilities
- Population density overlay
- Save/load custom configurations
- Print/PDF export of map views
- Address geocoding for new facilities

### Technical Improvements
- Add TypeScript for type safety
- Implement proper state management (Redux/Zustand)
- Add unit tests for core functions
- Bundle with Vite/Webpack for better performance
- Add service worker for offline support
- Implement proper routing for shareable URLs

### Data Enhancements
- Integrate with official geographic APIs
- Add more facility attributes (hours, capacity, etc.)
- Historical data tracking (facility changes over time)
- Link to external databases (school enrollment, store info)

---

## Quick Reference

### File Load Order
1. `data.js` - Defines `facilities` array
2. `script.js` - References `facilities`, initializes map

### Key Functions
- `createCustomIcon(color, shape)` - Generate marker icons
- `renderCategory(category)` - Render markers and circles for a category
- `setupListeners(category)` - Attach event listeners for controls
- `toggleControls()` - Collapse/expand control panel
- `addFacility()` - Modal for adding new facility
- `deleteFacility(id)` - Remove facility with confirmation
- `exportData()` - Copy facilities array to clipboard

### State Access
```javascript
// Check if category is visible
state.subway.visible

// Get current radius
state.aeon.radius

// Access layer group
state.tsuruha.layerGroup.clearLayers()
```

### Category List (in order)
1. subway (地下鉄)
2. aeon (イオン)
3. maxvalu (MaxValu)
4. tsuruha (ツルハ)
5. junior_high (中学校)
6. elementary (小学校)

---

**Last Updated**: 2025-11-25
**Application Version**: Based on commit `2b3924e`
