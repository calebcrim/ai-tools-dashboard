// ABSOLUTE FORCE DARK THEME - Runs immediately and continuously
// This will override EVERYTHING including computed styles

(function() {
    'use strict';
    
    // Function to force dark theme
    function forceDarkTheme() {
        // 1. Force body and html backgrounds
        const html = document.documentElement;
        const body = document.body;
        
        // Remove any existing background styles
        html.style.removeProperty('background');
        html.style.removeProperty('background-color');
        html.style.removeProperty('backgroundColor');
        
        body.style.removeProperty('background');
        body.style.removeProperty('background-color');
        body.style.removeProperty('backgroundColor');
        
        // Set dark background with highest specificity
        html.style.setProperty('background', '#0a0f0a', 'important');
        body.style.setProperty('background', 'linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%)', 'important');
        body.style.setProperty('background-attachment', 'fixed', 'important');
        body.style.setProperty('min-height', '100vh', 'important');
        body.style.setProperty('color', '#e0f2e7', 'important');
        
        // 2. Fix landing-page div
        const landingPage = document.querySelector('.landing-page');
        if (landingPage) {
            landingPage.style.setProperty('background', 'transparent', 'important');
            landingPage.style.setProperty('background-color', 'transparent', 'important');
            landingPage.style.setProperty('color', '#e0f2e7', 'important');
        }
        
        // 3. Remove any elements with inline white/light backgrounds
        const elementsWithBg = document.querySelectorAll('[style*="background"]');
        elementsWithBg.forEach(el => {
            const style = el.getAttribute('style');
            if (style && (
                style.includes('rgb(245') || 
                style.includes('#f5f5f5') || 
                style.includes('white') ||
                style.includes('#fff')
            )) {
                // Get computed styles
                const computed = window.getComputedStyle(el);
                const bgColor = computed.backgroundColor;
                
                // If it's a light color, override it
                if (bgColor && (
                    bgColor.includes('245') || 
                    bgColor === 'rgb(255, 255, 255)' ||
                    bgColor === 'white'
                )) {
                    el.style.setProperty('background', 'transparent', 'important');
                    el.style.setProperty('background-color', 'transparent', 'important');
                }
            }
        });
        
        // 4. Inject critical CSS if not present
        let criticalStyles = document.getElementById('force-dark-theme-styles');
        if (!criticalStyles) {
            criticalStyles = document.createElement('style');
            criticalStyles.id = 'force-dark-theme-styles';
            criticalStyles.innerHTML = `
                /* FORCE DARK THEME - HIGHEST PRIORITY */
                html {
                    background: #0a0f0a !important;
                }
                
                body {
                    background: linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%) !important;
                    background-attachment: fixed !important;
                    min-height: 100vh !important;
                    color: #e0f2e7 !important;
                }
                
                .landing-page {
                    background: transparent !important;
                    background-color: transparent !important;
                    color: #e0f2e7 !important;
                }
                
                /* Override computed styles */
                body[style*="background-color: rgb(245"] {
                    background-color: transparent !important;
                }
                
                .landing-page[style*="background-color: rgb(245"] {
                    background-color: transparent !important;
                }
                
                /* Force all divs with light backgrounds to transparent */
                div[style*="background-color: rgb(245"],
                div[style*="background: rgb(245"],
                div[style*="background-color: #f5f5f5"],
                div[style*="background: #f5f5f5"] {
                    background: transparent !important;
                    background-color: transparent !important;
                }
            `;
            
            // Add to head with highest priority
            if (document.head.firstChild) {
                document.head.insertBefore(criticalStyles, document.head.firstChild);
            } else {
                document.head.appendChild(criticalStyles);
            }
        }
        
        // 5. Override computed styles on landing-page
        const allLandingPages = document.querySelectorAll('.landing-page');
        allLandingPages.forEach(page => {
            const computed = window.getComputedStyle(page);
            if (computed.backgroundColor === 'rgb(245, 245, 245)') {
                page.style.cssText = 'background: transparent !important; background-color: transparent !important; color: #e0f2e7 !important;';
            }
        });
    }
    
    // Run immediately
    forceDarkTheme();
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceDarkTheme);
    } else {
        forceDarkTheme();
    }
    
    // Run on window load
    window.addEventListener('load', forceDarkTheme);
    
    // Run periodically to catch any changes
    setInterval(forceDarkTheme, 500);
    
    // Watch for style changes and override them
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target === document.body || target.classList.contains('landing-page')) {
                    const style = target.getAttribute('style');
                    if (style && (style.includes('245') || style.includes('#f5f5f5'))) {
                        forceDarkTheme();
                    }
                }
            }
        });
    });
    
    // Observe body and landing-page for style changes
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    
    const landingPages = document.querySelectorAll('.landing-page');
    landingPages.forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['style'] });
    });
    
    console.log('[Force Dark Theme] Active and monitoring for changes');
})();