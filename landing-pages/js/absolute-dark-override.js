// ABSOLUTE DARK OVERRIDE - The nuclear option
console.log('[DARK OVERRIDE] Initializing absolute dark theme enforcement...');

(function() {
    'use strict';
    
    // Critical dark theme CSS
    const darkCSS = `
        * {
            transition: none !important;
        }
        
        html, html * {
            background-color: transparent !important;
            background-image: none !important;
        }
        
        html {
            background: #0a0f0a !important;
        }
        
        body {
            background: linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%) !important;
            background-attachment: fixed !important;
            color: #e0f2e7 !important;
            min-height: 100vh !important;
        }
        
        .landing-page {
            background: transparent !important;
            background-color: transparent !important;
        }
        
        /* Override ALL elements that might have backgrounds */
        div, section, article, aside, header, footer, nav, main {
            background: transparent !important;
            background-color: transparent !important;
        }
        
        /* Specific overrides for common problem classes */
        .hero-section {
            background: linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .tool-review-card, .quick-start-card, .budget-calculator,
        .comparison-card, .feature-card, .faq-item, .card {
            background: rgba(13, 148, 136, 0.06) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(20, 184, 166, 0.3) !important;
        }
        
        /* Force text colors */
        * {
            color: #e0f2e7 !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #14b8a6 !important;
            text-shadow: 0 0 20px rgba(20, 184, 166, 0.5) !important;
        }
        
        a {
            color: #10b981 !important;
        }
    `;
    
    // Function to inject styles
    function injectDarkStyles() {
        // Remove any existing override
        const existing = document.getElementById('absolute-dark-override');
        if (existing) {
            existing.remove();
        }
        
        // Create new style element
        const style = document.createElement('style');
        style.id = 'absolute-dark-override';
        style.innerHTML = darkCSS;
        
        // Add to head with highest priority
        if (document.head) {
            document.head.appendChild(style);
        } else {
            document.documentElement.appendChild(style);
        }
        
        console.log('[DARK OVERRIDE] Styles injected');
    }
    
    // Function to remove all stylesheets except ours
    function removeConflictingStyles() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(sheet => {
            const href = sheet.getAttribute('href');
            if (href && !href.includes('dark-theme-only') && !href.includes('font-awesome')) {
                sheet.remove();
                console.log('[DARK OVERRIDE] Removed stylesheet:', href);
            }
        });
        
        // Remove inline style tags except ours
        const inlineStyles = document.querySelectorAll('style:not(#absolute-dark-override):not(#critical-dark-theme)');
        inlineStyles.forEach(style => {
            style.remove();
            console.log('[DARK OVERRIDE] Removed inline style block');
        });
    }
    
    // Function to clean element styles
    function cleanElementStyles() {
        // Get all elements
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            const style = el.getAttribute('style');
            if (style) {
                // Check if it has background styles
                if (style.includes('background') && 
                    (style.includes('white') || 
                     style.includes('#fff') || 
                     style.includes('#f5f5f5') || 
                     style.includes('rgb(245') ||
                     style.includes('rgb(255'))) {
                    
                    // Remove the style attribute entirely
                    el.removeAttribute('style');
                    console.log('[DARK OVERRIDE] Removed inline style from:', el.className || el.tagName);
                }
            }
        });
    }
    
    // Function to force dark theme on body
    function forceBodyDark() {
        if (document.body) {
            document.body.style.cssText = `
                background: linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%) !important;
                background-attachment: fixed !important;
                min-height: 100vh !important;
                color: #e0f2e7 !important;
            `;
        }
        
        if (document.documentElement) {
            document.documentElement.style.cssText = 'background: #0a0f0a !important;';
        }
    }
    
    // Main enforcement function
    function enforceAbsoluteDark() {
        injectDarkStyles();
        removeConflictingStyles();
        cleanElementStyles();
        forceBodyDark();
    }
    
    // Initial enforcement
    enforceAbsoluteDark();
    
    // Enforce on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enforceAbsoluteDark);
    } else {
        enforceAbsoluteDark();
    }
    
    // Enforce on window load
    window.addEventListener('load', enforceAbsoluteDark);
    
    // Continuous enforcement
    setInterval(enforceAbsoluteDark, 500);
    
    // Watch for ANY changes and re-enforce
    const observer = new MutationObserver((mutations) => {
        let needsEnforcement = false;
        
        mutations.forEach(mutation => {
            // Check if stylesheets were added
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'LINK' || node.tagName === 'STYLE') {
                        needsEnforcement = true;
                    }
                });
            }
            
            // Check if styles were changed
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                needsEnforcement = true;
            }
        });
        
        if (needsEnforcement) {
            console.log('[DARK OVERRIDE] Change detected, re-enforcing...');
            enforceAbsoluteDark();
        }
    });
    
    // Observe everything
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    console.log('[DARK OVERRIDE] Absolute dark theme enforcement active!');
})();