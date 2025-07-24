# Navigation Component Variations

## Basic HTML Implementation

### Standard Navigation
```html
<header class="unified-header">
    <div class="header-container">
        <div class="logo-section">
            <div class="logo-icon">📊</div>
            <div class="logo-text">AI Investment Command Center</div>
        </div>
        <nav class="nav-buttons">
            <a href="/dashboard" class="nav-button active">Unified Dashboard</a>
            <a href="/financial-analysis" class="nav-button">Financial Analysis</a>
            <a href="/best-practices" class="nav-button">Best Practices</a>
            <a href="/ai-news" class="nav-button">AI News</a>
        </nav>
        <div class="user-actions">
            <button class="theme-toggle" aria-label="Toggle theme">🌙</button>
            <button class="settings-toggle" aria-label="Settings">⚙️</button>
        </div>
    </div>
</header>
```

### With Skip Navigation (Accessibility)
```html
<a href="#main-content" class="skip-nav">Skip to main content</a>
<header class="unified-header">
    <!-- Navigation content -->
</header>
<main id="main-content">
    <!-- Page content -->
</main>
```

## React Component

```jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navigation-styles.css';

const UnifiedNavigation = () => {
    const location = useLocation();
    const [theme, setTheme] = useState('dark');
    
    const navItems = [
        { path: '/dashboard', label: 'Unified Dashboard' },
        { path: '/financial-analysis', label: 'Financial Analysis' },
        { path: '/best-practices', label: 'Best Practices' },
        { path: '/ai-news', label: 'AI News' }
    ];
    
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        document.body.classList.toggle('light-mode');
    };
    
    return (
        <header className={`unified-header ${theme}-mode`}>
            <div className="header-container">
                <div className="logo-section">
                    <div className="logo-icon">📊</div>
                    <div className="logo-text">AI Investment Command Center</div>
                </div>
                <nav className="nav-buttons">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="user-actions">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? '🌙' : '☀️'}
                    </button>
                    <button className="settings-toggle" aria-label="Settings">⚙️</button>
                </div>
            </div>
        </header>
    );
};

export default UnifiedNavigation;
```

## Vue Component

```vue
<template>
  <header class="unified-header">
    <div class="header-container">
      <div class="logo-section">
        <div class="logo-icon">📊</div>
        <div class="logo-text">AI Investment Command Center</div>
      </div>
      <nav class="nav-buttons">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-button', { active: $route.path === item.path }]"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <div class="user-actions">
        <button class="theme-toggle" @click="toggleTheme" aria-label="Toggle theme">
          {{ isDark ? '🌙' : '☀️' }}
        </button>
        <button class="settings-toggle" aria-label="Settings">⚙️</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'UnifiedNavigation',
  data() {
    return {
      isDark: true,
      navItems: [
        { path: '/dashboard', label: 'Unified Dashboard' },
        { path: '/financial-analysis', label: 'Financial Analysis' },
        { path: '/best-practices', label: 'Best Practices' },
        { path: '/ai-news', label: 'AI News' }
      ]
    };
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      document.body.classList.toggle('light-mode');
    }
  }
};
</script>

<style>
@import './navigation-styles.css';
</style>
```

## JavaScript Enhancement for Static Sites

```javascript
// navigation-enhance.js
document.addEventListener('DOMContentLoaded', function() {
    // Set active state based on current URL
    const currentPath = window.location.pathname;
    const navButtons = document.querySelectorAll('.nav-button');
    
    navButtons.forEach(button => {
        const href = button.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/dashboard')) {
            button.classList.add('active');
        }
    });
    
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            this.textContent = isLight ? '☀️' : '🌙';
        });
    }
    
    // Settings toggle functionality
    const settingsToggle = document.querySelector('.settings-toggle');
    if (settingsToggle) {
        settingsToggle.addEventListener('click', function() {
            // Implement settings panel logic here
            console.log('Settings clicked');
        });
    }
});
```

## Alternative Logo Variations

### For Different Pages/Contexts
```html
<!-- Financial Analysis Page -->
<div class="logo-icon">💰</div>

<!-- Best Practices Page -->
<div class="logo-icon">📚</div>

<!-- AI News Page -->
<div class="logo-icon">📰</div>

<!-- Alternative unified icon -->
<div class="logo-icon">🤖</div>
```

### With Image Logo
```html
<div class="logo-section">
    <img src="/assets/logo.svg" alt="AI Investment Command Center" class="logo-image">
    <div class="logo-text">AI Investment Command Center</div>
</div>

<style>
.logo-image {
    width: 48px;
    height: 48px;
    object-fit: contain;
}
</style>
```

## Mobile Menu Variation

```html
<!-- Add mobile menu button -->
<button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>

<!-- Mobile navigation overlay -->
<div class="mobile-nav-overlay">
    <nav class="mobile-nav">
        <a href="/dashboard" class="mobile-nav-link">Unified Dashboard</a>
        <a href="/financial-analysis" class="mobile-nav-link">Financial Analysis</a>
        <a href="/best-practices" class="mobile-nav-link">Best Practices</a>
        <a href="/ai-news" class="mobile-nav-link">AI News</a>
    </nav>
</div>

<style>
.mobile-menu-toggle {
    display: none;
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 24px;
    cursor: pointer;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-buttons {
        display: none;
    }
}

.mobile-nav-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: none;
    z-index: 9999;
}

.mobile-nav-overlay.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: center;
}

.mobile-nav-link {
    color: white;
    text-decoration: none;
    font-size: 18px;
    padding: 12px 24px;
    border-radius: 8px;
    transition: background 0.3s;
}

.mobile-nav-link:hover {
    background: rgba(74, 158, 255, 0.2);
}
</style>
```

## With Search Integration

```html
<header class="unified-header">
    <div class="header-container">
        <div class="logo-section">
            <div class="logo-icon">📊</div>
            <div class="logo-text">AI Investment Command Center</div>
        </div>
        <nav class="nav-buttons">
            <!-- Navigation buttons -->
        </nav>
        <div class="header-search">
            <input type="search" placeholder="Search tools..." class="header-search-input">
            <button class="header-search-button">🔍</button>
        </div>
        <div class="user-actions">
            <!-- User action buttons -->
        </div>
    </div>
</header>

<style>
.header-search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    margin-right: 16px;
}

.header-search-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 16px;
    color: white;
    font-size: 14px;
    width: 200px;
    transition: all 0.3s;
}

.header-search-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--nav-primary-color);
    width: 250px;
}

.header-search-button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
}
</style>
```