// ULTIMATE CYBERPUNK FIX - Runs after everything else
// This is the nuclear option to force cyberpunk theme

(function() {
    function nukeLightTheme() {
        console.log('[Cyberpunk] Applying ultimate theme override...');
        
        // 1. Remove the landing-pages.css stylesheet entirely
        const landingPagesCSS = document.querySelector('link[href*="landing-pages.css"]');
        if (landingPagesCSS) {
            landingPagesCSS.remove();
            console.log('[Cyberpunk] Removed landing-pages.css');
        }
        
        // 2. Force styles on EVERYTHING
        const criticalStyles = `
            html, body {
                background: linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%) !important;
                background-attachment: fixed !important;
                color: #e0f2e7 !important;
                min-height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Kill ALL backgrounds */
            * {
                background-color: transparent !important;
            }
            
            /* Then add back cyberpunk backgrounds selectively */
            .landing-page {
                background: transparent !important;
                color: #e0f2e7 !important;
            }
            
            .hero-section {
                background: linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(20, 184, 166, 0.3) !important;
                color: #e0f2e7 !important;
            }
            
            .main-nav, .nav-container {
                background: rgba(10, 15, 10, 0.9) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
            }
            
            /* Cards and sections */
            .quick-comparison, .content-section, .analysis-section,
            .tool-review-card, .faq-container, .roi-calculator,
            .comparison-table, .tool-item, .feature-card,
            .faq-item, .calculator-wrapper {
                background: rgba(13, 148, 136, 0.06) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                border: 1px solid rgba(20, 184, 166, 0.3) !important;
                color: #e0f2e7 !important;
            }
            
            /* Force text colors */
            h1, h2, h3, h4, h5, h6 {
                color: #14b8a6 !important;
                text-shadow: 0 0 20px rgba(20, 184, 166, 0.5) !important;
            }
            
            p, span, div, li, td, th {
                color: #e0f2e7 !important;
            }
            
            a {
                color: #10b981 !important;
            }
            
            a:hover {
                color: #14b8a6 !important;
                text-shadow: 0 0 10px rgba(20, 184, 166, 0.5) !important;
            }
            
            /* Tables */
            table {
                background: rgba(13, 148, 136, 0.06) !important;
            }
            
            th {
                background: rgba(20, 184, 166, 0.15) !important;
                color: #14b8a6 !important;
            }
            
            /* Override any inline styles */
            [style*="background: white"] *,
            [style*="background: #fff"] *,
            [style*="background: #f5f5f5"] *,
            [style*="background-color: white"] *,
            [style*="background-color: #fff"] *,
            [style*="background-color: #f5f5f5"] * {
                background: transparent !important;
            }
        `;
        
        // 3. Inject critical styles with highest priority
        let styleElement = document.getElementById('cyberpunk-ultimate-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'cyberpunk-ultimate-styles';
            document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = criticalStyles;
        
        // 4. Force inline styles on body
        document.body.style.cssText = `
            background: linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%) !important;
            background-attachment: fixed !important;
            color: #e0f2e7 !important;
            min-height: 100vh !important;
        `;
        
        // 5. Remove any elements with inline white backgrounds
        document.querySelectorAll('[style*="background"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && (style.includes('white') || style.includes('#fff') || style.includes('#f5f5f5'))) {
                el.removeAttribute('style');
            }
        });
        
        console.log('[Cyberpunk] Ultimate theme override complete!');
    }
    
    // Run immediately
    nukeLightTheme();
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nukeLightTheme);
    }
    
    // Run after window loads (catches everything)
    window.addEventListener('load', nukeLightTheme);
    
    // Run periodically to catch any dynamic content
    setTimeout(nukeLightTheme, 100);
    setTimeout(nukeLightTheme, 500);
    setTimeout(nukeLightTheme, 1000);
    setTimeout(nukeLightTheme, 2000);
    
    // Watch for any new stylesheets being added and remove landing-pages.css if it reappears
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'LINK' && node.href && node.href.includes('landing-pages.css')) {
                        node.remove();
                        console.log('[Cyberpunk] Blocked landing-pages.css from loading');
                        nukeLightTheme();
                    }
                });
            }
        });
    });
    
    observer.observe(document.head, { childList: true, subtree: true });
})();