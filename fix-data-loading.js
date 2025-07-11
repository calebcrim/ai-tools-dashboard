// Quick fix to ensure data loads properly
(function() {
    console.log('Data loading fix script running...');
    
    // Function to check and fix data loading
    function ensureDataLoaded() {
        if (typeof unifiedToolsData !== 'undefined' && !window.unifiedToolsData) {
            window.unifiedToolsData = unifiedToolsData;
            console.log('✅ Fixed: Made unifiedToolsData available globally');
            window.dispatchEvent(new CustomEvent('unifiedToolsDataLoaded', { detail: unifiedToolsData }));
        }
    }
    
    // Try immediately
    ensureDataLoaded();
    
    // Try on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureDataLoaded);
    } else {
        ensureDataLoaded();
    }
    
    // Try after a delay
    setTimeout(ensureDataLoaded, 100);
})();