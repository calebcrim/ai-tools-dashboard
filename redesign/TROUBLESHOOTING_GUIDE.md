# Troubleshooting & Performance Guide

## 🚨 Common Issues & Solutions

This guide helps Claude Code handle potential problems during the cyberpunk redesign implementation.

## ⚡ Performance Optimization

### Animation Performance
```css
/* OPTIMIZE animations for 60fps performance */

/* Use transform and opacity for animations (GPU accelerated) */
.tool-card {
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform, opacity; /* Hint to browser */
}

/* Avoid animating these properties (CPU expensive): */
/* ❌ width, height, top, left, margin, padding */
/* ✅ transform, opacity, filter */

/* Efficient hover effects */
.tool-card:hover {
  transform: translateY(-8px) scale(1.02) translateZ(0);
  /* NOT: margin-top: -8px; width: 102%; */
}
```

### Backdrop Filter Performance
```css
/* LIMIT backdrop-filter usage to prevent lag */

/* ✅ GOOD: Selective use */
.main-panel {
  backdrop-filter: blur(20px);
}

/* ❌ AVOID: Too many blur elements */
.every-small-element {
  backdrop-filter: blur(10px); /* Don't do this */
}

/* FALLBACK for older browsers */
@supports not (backdrop-filter: blur(20px)) {
  .glass-effect {
    background: rgba(13, 148, 136, 0.2); /* Solid fallback */
  }
}
```

### Particle System Optimization
```javascript
// EFFICIENT particle management
class OptimizedParticles {
  constructor() {
    this.maxParticles = 20; // Limit total particles
    this.particlePool = []; // Reuse particles
    this.isVisible = true;
    
    // Pause on mobile or low-end devices
    if (window.innerWidth < 768 || this.isLowEndDevice()) {
      this.maxParticles = 5;
    }
    
    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
    });
  }
  
  isLowEndDevice() {
    // Simple performance detection
    return navigator.hardwareConcurrency < 4 || 
           navigator.deviceMemory < 4;
  }
  
  createParticle() {
    if (!this.isVisible || this.particlePool.length >= this.maxParticles) {
      return;
    }
    
    // Implementation...
  }
}
```

## 🐛 Common Problems & Fixes

### Issue 1: Blurry Text with Backdrop Filter
**Problem:** Text becomes hard to read with glassmorphism
```css
/* ❌ PROBLEM */
.card {
  backdrop-filter: blur(20px);
  color: #ffffff; /* Too low contrast */
}

/* ✅ SOLUTION */
.card {
  backdrop-filter: blur(20px);
  color: #e0f2e7; /* Better contrast */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* Improve readability */
  -webkit-font-smoothing: antialiased; /* Sharper text */
}
```

### Issue 2: Animation Lag on Mobile
**Problem:** Smooth animations on desktop, choppy on mobile
```css
/* ❌ PROBLEM */
.tool-card {
  transition: all 0.3s ease;
}

/* ✅ SOLUTION */
.tool-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
  /* Only animate GPU-accelerated properties */
}

@media (max-width: 768px) {
  .tool-card {
    transition: none; /* Disable on mobile if needed */
  }
}
```

### Issue 3: Particle System Memory Leak
**Problem:** Particles accumulate and slow down browser
```javascript
// ❌ PROBLEM
function createParticle() {
  const particle = document.createElement('div');
  container.appendChild(particle);
  // No cleanup!
}

// ✅ SOLUTION
function createParticle() {
  const particle = document.createElement('div');
  container.appendChild(particle);
  
  // Auto-cleanup with timeout
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  }, 8000);
  
  // Also clean up on animation end
  particle.addEventListener('animationend', () => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  });
}
```

### Issue 4: Filter Lag with Large Datasets
**Problem:** Real-time search becomes slow with many tools
```javascript
// ❌ PROBLEM
searchInput.addEventListener('input', (e) => {
  filterTools(e.target.value); // Immediate filtering
});

// ✅ SOLUTION - Debounced search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterTools(e.target.value);
  }, 300); // 300ms delay
});
```

### Issue 5: Z-Index Conflicts
**Problem:** Particles or effects appearing over modals
```css
/* ESTABLISH clear z-index hierarchy */
:root {
  --z-particles: 1;
  --z-content: 10;
  --z-header: 100;
  --z-modal: 1000;
  --z-tooltip: 2000;
}

.cyber-particles { z-index: var(--z-particles); }
.header { z-index: var(--z-header); }
.modal { z-index: var(--z-modal); }
```

## 🔧 Browser Compatibility Fixes

### Safari-Specific Issues
```css
/* Safari backdrop-filter support */
.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px); /* Safari prefix */
}

/* Safari border-radius with overflow */
.tool-card {
  transform: translateZ(0); /* Fix border-radius clipping */
}
```

### Firefox-Specific Issues
```css
/* Firefox scrollbar styling */
.scrollable-container {
  scrollbar-width: thin;
  scrollbar-color: var(--cyber-primary) transparent;
}
```

### Internet Explorer / Edge Legacy
```css
/* Graceful degradation for old browsers */
@supports not (backdrop-filter: blur(10px)) {
  .glass-effect {
    background: rgba(13, 148, 136, 0.2);
    border: 1px solid rgba(20, 184, 166, 0.3);
  }
}
```

## 📊 Performance Monitoring

### Key Metrics to Watch
```javascript
// Monitor performance during development
function monitorPerformance() {
  // FPS monitoring
  let lastTime = performance.now();
  let frames = 0;
  
  function checkFPS() {
    frames++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frames;
      console.log(`FPS: ${fps}`);
      
      if (fps < 30) {
        console.warn('Performance issue detected!');
        // Reduce particle count or disable effects
      }
      
      frames = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFPS);
  }
  
  requestAnimationFrame(checkFPS);
}

// Memory usage monitoring
function monitorMemory() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log({
      used: Math.round(memory.usedJSHeapSize / 1048576),
      total: Math.round(memory.totalJSHeapSize / 1048576),
      limit: Math.round(memory.jsHeapSizeLimit / 1048576)
    });
  }
}
```

### Performance Budgets
```
Target Performance Metrics:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
- Animation Frame Rate: 60fps
- Memory Usage: < 50MB increase
```

## 🔄 Rollback Procedures

### Quick Disable of Effects
```css
/* EMERGENCY: Disable all effects quickly */
:root {
  --disable-effects: 1; /* Set to 1 to disable */
}

.cyber-particles {
  display: calc(1 - var(--disable-effects, 0)); /* Hides if disabled */
}

.glass-effect {
  backdrop-filter: calc(var(--disable-effects, 0) * blur(0px) + (1 - var(--disable-effects, 0)) * blur(20px));
}
```

### Feature Flags in JavaScript
```javascript
// Feature toggles for problematic effects
const FEATURES = {
  particles: true,
  glassEffects: true,
  animations: true,
  scanning: true
};

// Disable features on low-end devices
if (navigator.hardwareConcurrency < 4) {
  FEATURES.particles = false;
  FEATURES.glassEffects = false;
}

// Use throughout code
if (FEATURES.particles) {
  new CyberParticles();
}
```

### CSS Fallbacks
```css
/* Progressive enhancement approach */

/* Base styles (no effects) */
.tool-card {
  background: #1a1f2e;
  border: 1px solid #2f3336;
}

/* Enhanced styles (with feature detection) */
@supports (backdrop-filter: blur(10px)) {
  .tool-card {
    background: rgba(13, 148, 136, 0.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
}
```

## ⚠️ Critical Performance Rules

### DO:
✅ Use `transform` and `opacity` for animations
✅ Limit backdrop-filter to major containers only
✅ Implement particle cleanup mechanisms
✅ Test on actual mobile devices
✅ Monitor memory usage during development
✅ Provide fallbacks for older browsers
✅ Use feature detection over browser detection

### DON'T:
❌ Animate `width`, `height`, `top`, `left`
❌ Add backdrop-filter to many small elements
❌ Create unlimited particles
❌ Ignore mobile performance
❌ Assume all devices support modern CSS
❌ Block the main thread with heavy calculations
❌ Forget to clean up event listeners

## 🎯 Testing Scenarios

### Performance Testing Checklist
```markdown
- [ ] Test on low-end mobile device
- [ ] Test with 500+ tool cards
- [ ] Test with DevTools CPU throttling (4x slowdown)
- [ ] Test with network throttling (Slow 3G)
- [ ] Test in private/incognito mode
- [ ] Test with multiple tabs open
- [ ] Test after 30 minutes of usage (memory leaks)
- [ ] Test on battery-powered devices
```

### Browser Testing Matrix
```markdown
Desktop:
- [ ] Chrome 90+ (Windows/Mac/Linux)
- [ ] Firefox 85+ (Windows/Mac/Linux)  
- [ ] Safari 14+ (Mac)
- [ ] Edge 90+ (Windows)

Mobile:
- [ ] iOS Safari 14+
- [ ] Chrome Mobile 90+
- [ ] Samsung Internet
- [ ] Firefox Mobile
```

## 📞 Emergency Contacts

### If Performance Issues Arise:
1. **Immediately disable effects** using feature flags
2. **Revert to previous commit** if necessary
3. **Document the issue** with device specs and browser
4. **Test with minimal subset** of changes
5. **Implement graceful degradation**

### Performance Recovery Steps:
1. Reduce particle count to <10
2. Disable backdrop-filter on mobile
3. Simplify animations to opacity/transform only
4. Remove scanning line effect if needed
5. Fall back to solid colors instead of gradients

---

**Remember: Visual effects should enhance, not hinder the user experience! 🚀⚡**
