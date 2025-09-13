// Fix for details panel close button
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Details Panel Fix] Initializing...');
    
    // Ensure close button works
    const closeBtn = document.getElementById('closeDetailPanel');
    const detailPanel = document.getElementById('detailPanel');
    
    if (closeBtn && detailPanel) {
        // Remove any existing listeners
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        const newCloseBtn = document.getElementById('closeDetailPanel');
        
        // Add new click listener
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Details Panel Fix] Close button clicked');
            
            // Hide the panel - remove BOTH 'open' and 'active' classes
            detailPanel.style.display = 'none';
            detailPanel.classList.remove('active');
            detailPanel.classList.remove('open');
            
            // Clear any inline styles that might keep it visible
            detailPanel.style.removeProperty('visibility');
            detailPanel.style.removeProperty('opacity');
            detailPanel.style.removeProperty('right');
            
            console.log('[Details Panel Fix] Panel closed');
        });
        
        // Also close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && (detailPanel.style.display === 'block' || detailPanel.classList.contains('active') || detailPanel.classList.contains('open'))) {
                newCloseBtn.click();
            }
        });
        
        console.log('[Details Panel Fix] Close button listener attached');
    } else {
        console.error('[Details Panel Fix] Close button or panel not found');
    }
    
    // Monitor for panel opening to ensure it has solid background
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const panel = mutation.target;
                if (panel.id === 'detailPanel' && panel.style.display === 'block') {
                    // Ensure solid background when opened
                    panel.style.background = '#0a0f0a';
                    panel.style.opacity = '1';
                    console.log('[Details Panel Fix] Ensured solid background on panel open');
                }
            }
        });
    });
    
    if (detailPanel) {
        observer.observe(detailPanel, { attributes: true });
    }
});