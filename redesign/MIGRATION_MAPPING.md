# Component Migration Mapping

## 🗺️ File-by-File Migration Guide

This document maps your existing components to the new cyberpunk styling requirements, providing Claude Code with specific targets for transformation.

## 📁 Project Structure Analysis

### Likely File Locations to Update:
```
src/
├── styles/
│   ├── globals.css ← Add cyberpunk variables
│   ├── components/
│   │   ├── Header.module.css ← Navigation redesign
│   │   ├── Search.module.css ← Search interface
│   │   ├── ToolCard.module.css ← Card components
│   │   ├── Filters.module.css ← Filter sidebar
│   │   └── Dashboard.module.css ← Main layout
│   └── themes/
│       └── cyberpunk.css ← New theme file
├── components/
│   ├── Header/ ← JavaScript enhancements
│   ├── Search/ ← Interaction improvements
│   ├── ToolCard/ ← Hover effects
│   └── Dashboard/ ← Particle system
└── public/
    └── index.html ← Meta tags update
```

## 🎯 Component-Specific Migration Maps

### 1. Header/Navigation Component

**Target Selectors:**
```css
/* These selectors likely exist and need updating: */
.header, .navbar, .navigation-bar, .site-header
.nav-tabs, .tab-list, .navigation-tabs
.nav-tab, .tab-item, .nav-link
.logo, .brand-logo, .site-logo
.stats, .stat-pill, .metric-badge
```

**Current Styles to Replace:**
```css
/* FIND these patterns and REPLACE with cyberpunk equivalents */

/* Background colors */
background: #1a1f2e; → background: linear-gradient(135deg, rgba(13, 148, 136, 0.15)...);
background: #1d9bf0; → background: linear-gradient(135deg, #14b8a6, #10b981);

/* Border colors */
border: 1px solid #2f3336; → border: 1px solid rgba(34, 197, 94, 0.2);
border-color: #1d9bf0; → border-color: #14b8a6;

/* Text colors */
color: #e7e9ea; → color: #e0f2e7;
color: #8b98a5; → color: #8bb89a;
color: #1d9bf0; → color: #14b8a6;
```

### 2. Search Interface

**Target Selectors:**
```css
.search-section, .search-container, .search-wrapper
.search-input, input[type="search"], .search-field
.search-icon, .search-button
.quick-filters, .filter-chips, .tag-list
.quick-filter, .filter-chip, .tag
.filter-dropdown, .dropdown-menu
```

**JavaScript Targets:**
```javascript
// Look for these element queries:
document.querySelector('.search-input')
document.querySelectorAll('.quick-filter')
// Add glow effects and interactions
```

### 3. Tool Cards/Grid

**Target Selectors:**
```css
.tool-card, .card, .item-card, .result-item
.tool-header, .card-header
.tool-icon, .card-icon, .item-icon
.tool-info, .card-content, .item-details
.tool-name, .card-title, .item-title
.tool-category, .card-category, .item-category
.tool-description, .card-description, .item-summary
.tool-footer, .card-footer
.tool-rating, .rating, .stars
.tool-pricing, .pricing-badge, .price-tag
```

**Hover Effect Targets:**
```javascript
// Find card hover handlers:
.addEventListener('mouseenter', ...)
.addEventListener('mouseleave', ...)
// Enhance with cyberpunk glow effects
```

### 4. Filter Components

**Target Selectors:**
```css
.filter-bar, .filter-panel, .sidebar-filters
.filter-button, .filter-option, .filter-item
.filter-dropdown, .dropdown
.filter-count, .count-badge, .filter-badge
.view-toggle, .view-switcher
.view-option, .view-button
.sort-select, .sort-dropdown
input[type="range"], .slider, .range-input
```

### 5. Layout/Dashboard

**Target Selectors:**
```css
.main-container, .dashboard, .content-wrapper
.results-container, .grid-container, .tool-grid
.command-hint, .tooltip, .helper-text
.floating-particles ← NEW element to add
```

## 🔄 Color Migration Map

### Systematic Color Replacement

**Primary Blue/Purple → Teal/Green:**
```css
/* FIND & REPLACE these exact color values: */

/* Blues */
#1d9bf0 → #14b8a6  (Primary button, active states)
#00b4d8 → #10b981  (Secondary accents)
#0099cc → #0d9488  (Darker variants)

/* Purples (if any) */
#8b5cf6 → #22c55e  (Success states)
#a855f7 → #10b981  (Secondary purple)

/* Backgrounds */
#1a1f2e → rgba(13, 148, 136, 0.08)  (Card backgrounds)
#0f1419 → rgba(10, 15, 10, 0.7)     (Input backgrounds)
#2f3336 → rgba(34, 197, 94, 0.2)    (Borders)

/* Text */
#e7e9ea → #e0f2e7  (Primary text)
#8b98a5 → #8bb89a  (Secondary text)
#536471 → #6b7c6f  (Muted text)
```

## 🎨 CSS Properties to Update

### Box Shadows
```css
/* FIND these shadow patterns: */
box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
/* REPLACE with: */
box-shadow: 0 20px 40px rgba(13, 148, 136, 0.2), 0 0 30px rgba(20, 184, 166, 0.1);

/* FIND these glow patterns: */
box-shadow: 0 0 20px #1d9bf0;
/* REPLACE with: */
box-shadow: 0 0 20px rgba(20, 184, 166, 0.4);
```

### Gradients
```css
/* FIND these gradient patterns: */
background: linear-gradient(135deg, #1d9bf0, #00b4d8);
/* REPLACE with: */
background: linear-gradient(135deg, #14b8a6, #10b981);
```

### Backdrop Filters (NEW)
```css
/* ADD these glassmorphism effects: */
backdrop-filter: blur(20px);  /* For major containers */
backdrop-filter: blur(10px);  /* For smaller elements */
```

## 🚀 Animation Additions

### New Keyframes to Add
```css
/* Add these new animations to your CSS: */

@keyframes gridPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.1; }
}

@keyframes scanLine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% {
    transform: translateY(-100vh) translateX(100px) rotate(180deg);
    opacity: 0;
  }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes titleShimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## 📱 Responsive Breakpoints

### Mobile Adaptations Needed
```css
@media (max-width: 768px) {
  /* Reduce particle density */
  .cyber-particles { display: none; }
  
  /* Simplify glass effects */
  .glass-effect { backdrop-filter: blur(10px); }
  
  /* Convert hover to touch-friendly */
  .tool-card:hover { /* Convert to :active or :focus */ }
}

@media (max-width: 480px) {
  /* Further simplifications for small screens */
  body::after { display: none; } /* Hide grid overlay */
  
  /* Simplify shadows */
  .tool-card {
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
  }
}
```

## 🔧 JavaScript Enhancements

### Files Likely Needing Updates:
```javascript
// Search for these files and add enhancements:
src/components/Search/Search.js
src/components/ToolCard/ToolCard.js
src/components/Header/Header.js
src/components/Dashboard/Dashboard.js

// Add these event listeners:
- Search input focus/blur glow effects
- Card hover enhanced shadows
- Button click ripple effects
- Particle system initialization
```

### Event Handlers to Enhance:
```javascript
// FIND existing handlers like:
onClick={(e) => handleCardClick(e)}
onMouseEnter={() => setHovered(true)}
onFocus={() => setFocused(true)}

// ENHANCE with:
onMouseEnter={(e) => {
  setHovered(true);
  e.target.style.boxShadow = 'cyberpunk glow effect';
}}
```

## ✅ Migration Checklist by Priority

### Phase 1: Critical (Do First)
- [ ] Update CSS variables/root colors
- [ ] Change body background to cyberpunk gradient
- [ ] Update header/navigation styling
- [ ] Transform tool card colors
- [ ] Fix search interface colors

### Phase 2: Important (Do Second)  
- [ ] Add glassmorphism effects
- [ ] Implement card hover animations
- [ ] Update filter component styling
- [ ] Add grid overlay background
- [ ] Enhance button interactions

### Phase 3: Enhanced (Do Third)
- [ ] Implement particle system
- [ ] Add scanning line animations
- [ ] Create title shimmer effect
- [ ] Add ripple click effects
- [ ] Optimize for mobile

### Phase 4: Polish (Do Last)
- [ ] Fine-tune animation timing
- [ ] Optimize performance
- [ ] Test cross-browser compatibility
- [ ] Validate accessibility
- [ ] Update meta tags/favicons

## 🎯 Success Validation

### Visual Checkpoints:
1. **No blue/purple colors remain** in the interface
2. **Teal/green palette** consistently applied
3. **Glass effects** visible on panels and cards
4. **Smooth animations** running at 60fps
5. **Mobile responsive** design maintained

### Functional Checkpoints:
1. **All existing features work** exactly as before
2. **Search and filtering** functionality preserved
3. **Navigation** between pages working
4. **Performance** not degraded
5. **Accessibility** maintained

---

**This mapping provides Claude Code with specific, actionable targets for the cyberpunk transformation! 🤖⚡**
