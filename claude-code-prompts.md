# Claude Code Implementation Prompts

## 🚀 Master Prompt for Design System Implementation

Copy this to Claude Code to implement the unified design system:

```
I need to implement a unified design system across my AI Tools Intelligence Hub. The project has:
- Best Practices Hub page
- Dual View page (Executive/Technical views)
- Enterprise Report page
- 317 AI tools in a searchable database

Current issues:
- Inconsistent blue colors (#007bff, #3B82F6, #1e40af)
- Varying card styles and spacing
- Small, hard-to-read text
- Different hover effects

Please implement:
1. Create /css/design-tokens.css with the unified color palette, typography scale, and spacing system I'll provide
2. Create /css/components.css with unified card, button, badge, and navigation styles
3. Update existing CSS files to use the new design tokens
4. Ensure all text is readable (min 14px for body text)
5. Apply consistent hover effects and transitions

Use these design tokens:
--color-primary: #3B82F6;
--color-gray-900: #0F172A; (main background)
--color-gray-800: #1E293B; (card backgrounds)
--text-sm: 0.875rem; (14px)
--text-base: 1rem; (16px)
--text-lg: 1.25rem; (20px)
--space-6: 1.5rem; (24px for card padding)
--radius-lg: 0.75rem; (12px for cards)

Make all tool cards more spacious and readable with proper visual hierarchy.
```

## 📝 Step-by-Step Implementation Prompts

### Prompt 1: Create Design Tokens
```
Create a new file /css/design-tokens.css that defines a comprehensive CSS variable system for our dark-themed AI tools database. Include:

1. Color palette with primary (#3B82F6), success (#10B981), warning (#F59E0B), danger (#EF4444)
2. Gray scale from 900 (darkest #0F172A) to 100 (lightest #F1F5F9)
3. Typography scale using Major Third (1.25) ratio from 0.75rem to 2.75rem
4. Spacing scale using base-8 grid (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px)
5. Border radius options (6px, 8px, 12px, 16px, full)
6. Shadow definitions for dark theme
7. Z-index scale for layering
8. Transition timing values

Make it comprehensive but maintainable.
```

### Prompt 2: Create Unified Components
```
Create /css/components.css with these unified component styles using our design tokens:

1. .unified-card - Spacious cards with 24px padding, hover effects, consistent borders
2. .btn (primary, secondary, ghost variants) - Clear, clickable buttons
3. .badge (primary, success, warning, danger variants) - Status indicators
4. .unified-header - Sticky navigation with proper spacing
5. .metric-display - For showing numbers/scores consistently
6. .tool-grid - Responsive grid layout for tool cards

Ensure all components have:
- Proper hover states
- Smooth transitions
- Accessible contrast ratios
- Consistent spacing using our tokens
```

### Prompt 3: Update Best Practices Hub
```
Update the Best Practices Hub page (/best-practices/index.html and related CSS):

1. Replace the blue color #007bff with var(--color-primary)
2. Update all cards to use .unified-card styling
3. Apply consistent spacing using design tokens
4. Ensure all text uses our typography scale (minimum 14px)
5. Update badges to use .badge component styles
6. Fix the search bar to match other pages
7. Apply hover effects to interactive elements

Keep the learning path layout but make it consistent with our design system.
```

### Prompt 4: Update Dual View Page
```
Update the Dual View page to use our unified design system:

1. Apply .unified-card to both Executive and Technical view cards
2. Standardize the toggle button using .btn styles
3. Update metric displays (the circular progress indicators) to be consistent
4. Use .badge for technology tags
5. Increase font sizes for better readability
6. Apply consistent spacing between cards
7. Ensure the view toggle animation is smooth

Maintain the dual-view functionality but unify the visual design.
```

### Prompt 5: Enhance Enterprise Report
```
Refactor the Enterprise Report page for better readability and consistency:

1. Increase tool card size and padding significantly (use --space-6)
2. Make tool names at least 18px font size
3. Improve visual hierarchy with proper heading sizes
4. Apply .unified-card styling to all tool cards
5. Update filter panel with consistent spacing
6. Make impact scores visually prominent (24px, bold)
7. Add proper hover effects with elevation
8. Ensure comfortable spacing in the grid layout

Focus on making it easy to scan 317 tools quickly.
```

### Prompt 6: Create Style Guide Page
```
Create a new page /style-guide.html that documents our design system:

1. Display all color swatches with hex values
2. Show typography scale with examples
3. Demonstrate all button variants
4. Show card component variations
5. Display badge styles
6. Include spacing visualization
7. Show grid layout examples
8. Add code snippets for each component

Make it a living documentation that developers can reference.
```

## 🔧 Utility Prompts

### Fix Specific Issues
```
Find and fix all instances where:
1. Font size is less than 14px - update to use our typography scale
2. Padding is less than 16px on interactive elements
3. Colors are hardcoded instead of using CSS variables
4. Hover effects are missing on clickable elements
```

### Accessibility Check
```
Review all pages and ensure:
1. Color contrast meets WCAG AA standards
2. All interactive elements have focus states
3. Font sizes are readable (min 14px)
4. Clickable areas are at least 44x44px
5. Hover states are clearly visible
```

### Performance Optimization
```
Optimize the CSS by:
1. Combining duplicate styles into shared classes
2. Using CSS variables to reduce repetition
3. Organizing styles in a logical hierarchy
4. Removing unused styles
5. Ensuring efficient selector usage
```

## 📋 Testing Checklist

After implementation, verify:
- [ ] All pages use the same primary blue (#3B82F6)
- [ ] Cards have consistent padding and borders
- [ ] Text is readable (minimum 14px)
- [ ] Hover effects work on all interactive elements
- [ ] Navigation is consistent across pages
- [ ] Tool cards in Enterprise Report are scannable
- [ ] Design tokens are used throughout
- [ ] No hardcoded colors or spacing values