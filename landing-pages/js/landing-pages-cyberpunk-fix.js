// Force cyberpunk styles on landing pages
document.addEventListener('DOMContentLoaded', function() {
    // Remove any inline styles that might be overriding our CSS
    const elementsWithWhiteBg = document.querySelectorAll('[style*="background"]');
    elementsWithWhiteBg.forEach(el => {
        const style = el.getAttribute('style');
        if (style && (style.includes('white') || style.includes('#fff') || style.includes('#f5f5f5'))) {
            el.style.background = 'transparent';
        }
    });
    
    // Force body background
    document.body.style.background = 'linear-gradient(135deg, #0a0f0a 0%, #0f1b14 50%, #0a1a0f 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    document.body.style.color = '#e0f2e7';
    
    // Force landing-page background to transparent
    const landingPage = document.querySelector('.landing-page');
    if (landingPage) {
        landingPage.style.background = 'transparent';
    }
    
    // Apply glassmorphism to all white background elements
    const whiteElements = [
        '.tool-review-card',
        '.faq-container',
        '.calculator-wrapper',
        '.comparison-table',
        '.content-section',
        '.analysis-section'
    ];
    
    whiteElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.background = 'rgba(13, 148, 136, 0.06)';
            el.style.backdropFilter = 'blur(20px)';
            el.style.webkitBackdropFilter = 'blur(20px)';
            el.style.border = '1px solid rgba(20, 184, 166, 0.3)';
        });
    });
});