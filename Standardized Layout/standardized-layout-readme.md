# Standardized Layout Implementation Guide

## Overview
This folder contains the implementation files for standardizing the navigation and layout across the AI Investment Command Center website. The goal is to create a consistent user experience across all four pages.

## Current Issues
- Navigation buttons are positioned differently on each page
- Inconsistent button styling and spacing
- Different header designs and colors
- Lack of visual unity across the site

## Solution
Implement a unified navigation header with:
- Consistent positioning (logo left, nav center, actions right)
- Standardized button styling
- Uniform spacing and layout
- Responsive design for mobile devices

## Files in This Folder

### 1. `unified-navigation.html`
Complete HTML template with CSS for the standardized navigation header.

### 2. `navigation-styles.css`
Extracted CSS styles for easy integration into existing stylesheets.

### 3. `implementation-instructions.md`
Step-by-step instructions for implementing the standardized navigation.

### 4. `component-variations.md`
Different variations of the navigation for different page contexts.

### 5. `migration-checklist.md`
Checklist for updating each page to use the new navigation.

## Quick Start
1. Review the `unified-navigation.html` file to see the complete implementation
2. Follow the steps in `implementation-instructions.md`
3. Use `migration-checklist.md` to ensure all pages are updated
4. Test responsive behavior on different screen sizes

## Design Specifications

### Colors
- Primary: `#4a9eff` (Blue)
- Secondary: `#00d4ff` (Cyan)
- Background Dark: `#0f1629`
- Background Darker: `#0a0e27`
- Text: `#ffffff`

### Spacing
- Header padding: 20px vertical
- Button gap: 12px
- Container max-width: 1200px
- Container padding: 24px horizontal

### Typography
- Font: System font stack
- Logo text: 20px, weight 600
- Navigation: 14px, weight 500

## Pages to Update
1. **Unified Dashboard** (`/` or `/dashboard`)
2. **Financial Analysis** (`/financial-analysis`)
3. **Best Practices** (`/best-practices`)
4. **AI News** (`/ai-news`)

## Support
If you encounter any issues during implementation, refer to the troubleshooting section in `implementation-instructions.md`.