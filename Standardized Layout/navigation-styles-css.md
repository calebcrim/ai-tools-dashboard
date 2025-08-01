# navigation-styles.css

```css
/**
 * Unified Navigation Styles
 * AI Investment Command Center
 * 
 * This file contains all styles needed for the standardized navigation
 * Import this file on all pages to ensure consistent navigation appearance
 */

/* CSS Custom Properties for Easy Customization */
:root {
    /* Color Palette */
    --nav-primary-color: #4a9eff;
    --nav-secondary-color: #00d4ff;
    --nav-bg-dark: #0f1629;
    --nav-bg-darker: #0a0e27;
    --nav-text-primary: #ffffff;
    --nav-text-secondary: #b8bcc8;
    --nav-border-color: rgba(74, 158, 255, 0.3);
    --nav-hover-bg: rgba(74, 158, 255, 0.2);
    --nav-hover-border: rgba(74, 158, 255, 0.5);
    
    /* Spacing */
    --nav-button-gap: 12px;
    --nav-header-padding: 20px 0;
    --nav-container-padding: 0 24px;
    --nav-button-padding: 10px 24px;
    
    /* Typography */
    --nav-logo-size: 20px;
    --nav-button-size: 14px;
    --nav-icon-size: 24px;
    
    /* Layout */
    --nav-max-width: 1200px;
    --nav-logo-icon-size: 48px;
    --nav-border-radius: 8px;
    
    /* Transitions */
    --nav-transition: all 0.3s ease;
}

/* Reset for navigation elements */
.unified-header * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Main Header Container */
.unified-header {
    background-color: var(--nav-bg-dark);
    padding: var(--nav-header-padding);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Container for centering content */
.header-container {
    max-width: var(--nav-max-width);
    margin: 0 auto;
    padding: var(--nav-container-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
}

/* Logo Section */
.logo-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.logo-icon {
    width: var(--nav-logo-icon-size);
    height: var(--nav-logo-icon-size);
    background: linear-gradient(135deg, var(--nav-primary-color) 0%, var(--nav-secondary-color) 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--nav-icon-size);
    flex-shrink: 0;
}

.logo-text {
    font-size: var(--nav-logo-size);
    font-weight: 600;
    color: var(--nav-secondary-color);
    white-space: nowrap;
}

/* Navigation Buttons Container */
.nav-buttons {
    display: flex;
    gap: var(--nav-button-gap);
    align-items: center;
}

/* Navigation Button Styles */
.nav-button {
    padding: var(--nav-button-padding);
    background-color: rgba(74, 158, 255, 0.1);
    border: 1px solid var(--nav-border-color);
    border-radius: var(--nav-border-radius);
    color: var(--nav-text-primary);
    text-decoration: none;
    font-size: var(--nav-button-size);
    font-weight: 500;
    transition: var(--nav-transition);
    cursor: pointer;
    white-space: nowrap;
    display: inline-block;
}

.nav-button:hover {
    background-color: var(--nav-hover-bg);
    border-color: var(--nav-hover-border);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.15);
}

.nav-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(74, 158, 255, 0.15);
}

.nav-button.active {
    background-color: var(--nav-primary-color);
    border-color: var(--nav-primary-color);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.nav-button.active:hover {
    background-color: var(--nav-primary-color);
    border-color: var(--nav-primary-color);
    transform: translateY(-1px);
}

/* User Actions Section */
.user-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.theme-toggle,
.settings-toggle {
    width: 40px;
    height: 40px;
    border-radius: var(--nav-border-radius);
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--nav-text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--nav-transition);
    font-size: 18px;
}

.theme-toggle:hover,
.settings-toggle:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

/* Mobile Responsive Design */
@media (max-width: 1024px) {
    .header-container {
        gap: 16px;
    }
    
    .logo-text {
        font-size: 18px;
    }
}

@media (max-width: 768px) {
    .header-container {
        flex-wrap: wrap;
        gap: 16px;
        padding: var(--nav-container-padding);
    }
    
    .logo-section {
        width: 100%;
        justify-content: center;
    }
    
    .nav-buttons {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
        order: 3;
    }
    
    .user-actions {
        width: 100%;
        justify-content: center;
        order: 2;
    }
    
    .nav-button {
        font-size: 13px;
        padding: 8px 20px;
    }
}

@media (max-width: 480px) {
    .unified-header {
        padding: 16px 0;
    }
    
    .logo-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
    }
    
    .logo-text {
        font-size: 16px;
    }
    
    .nav-buttons {
        gap: 8px;
    }
    
    .theme-toggle,
    .settings-toggle {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }
}

/* Dark Mode Support (if needed) */
@media (prefers-color-scheme: light) {
    .unified-header.light-mode {
        background-color: #ffffff;
        border-bottom-color: rgba(0, 0, 0, 0.1);
    }
    
    .unified-header.light-mode .nav-button {
        color: #1a1a1a;
        background-color: rgba(74, 158, 255, 0.05);
    }
    
    .unified-header.light-mode .logo-text {
        color: var(--nav-primary-color);
    }
}

/* Accessibility Improvements */
.nav-button:focus,
.theme-toggle:focus,
.settings-toggle:focus {
    outline: 2px solid var(--nav-primary-color);
    outline-offset: 2px;
}

/* Skip Navigation Link (for accessibility) */
.skip-nav {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--nav-primary-color);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
}

.skip-nav:focus {
    top: 0;
}

/* Loading State for Navigation */
.nav-button.loading {
    pointer-events: none;
    opacity: 0.6;
}

.nav-button.loading::after {
    content: '...';
    animation: loading 1s infinite;
}

@keyframes loading {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
}
```