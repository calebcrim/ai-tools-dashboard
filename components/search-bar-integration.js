/**
 * Search Bar Integration Script
 * Patches the existing implementation with the enhanced search bar
 */

// Integration function to replace existing search with enhanced version
function integrateEnhancedSearchBar() {
    // Check if EnhancedSearchBar is available
    if (typeof EnhancedSearchBar === 'undefined') {
        console.error('EnhancedSearchBar not loaded');
        return;
    }
    
    // Get the tools data
    const tools = window.allTools || window.unifiedToolsData?.tools || [];
    
    // Create callback for search changes
    const handleSearchChange = (filteredTools) => {
        // Update global filtered tools
        window.filteredTools = filteredTools;
        
        // Update statistics
        if (window.updateStatistics) {
            window.updateStatistics();
        }
        
        // Update virtual scroll if available
        if (window.virtualScroll) {
            window.virtualScroll.updateItems(filteredTools);
            window.virtualScroll.scrollToTop();
        }
        
        // Update compressed filter bar if it exists
        if (window.compressedFilterBar) {
            // Sync the search term without triggering another search
            window.compressedFilterBar.searchTerm = window.enhancedSearchBar.searchTerm;
        }
        
        // Trigger any other filter update callbacks
        if (window.onFilterChange) {
            window.onFilterChange(filteredTools);
        }
    };
    
    // Create the enhanced search bar
    window.enhancedSearchBar = new EnhancedSearchBar(tools, handleSearchChange);
    
    // Patch the compressed filter bar to prevent re-rendering
    if (window.CompressedFilterBar) {
        const originalRender = window.CompressedFilterBar.prototype.render;
        window.CompressedFilterBar.prototype.render = function() {
            // Only render if enhanced search bar doesn't exist
            if (!document.querySelector('.enhanced-search-bar')) {
                originalRender.call(this);
            } else {
                // Update other parts without touching the search
                const existingBar = document.querySelector('.compressed-filter-bar');
                if (existingBar) {
                    // Update only the non-search elements
                    this.updateBadges();
                    this.updateDropdown();
                }
            }
        };
        
        // Add update methods that don't re-render everything
        window.CompressedFilterBar.prototype.updateBadges = function() {
            // Update badge counts without re-rendering
            this.primaryFilters.forEach(filter => {
                const badge = document.querySelector(`.filter-badge[data-filter="${filter.id}"] .badge-count`);
                if (badge) {
                    badge.textContent = this.filterCounts[filter.id];
                }
            });
        };
        
        window.CompressedFilterBar.prototype.updateDropdown = function() {
            const dropdownLabel = document.querySelector('.dropdown-label');
            if (dropdownLabel) {
                dropdownLabel.textContent = `All ${this.getFilteredCount()}`;
            }
        };
    }
    
    // Override the original search handlers
    const originalSearchInput = document.getElementById('searchInput');
    if (originalSearchInput) {
        // Remove old event listeners by cloning
        const newSearchInput = originalSearchInput.cloneNode(true);
        originalSearchInput.parentNode.replaceChild(newSearchInput, originalSearchInput);
        
        // Add redirect to enhanced search
        newSearchInput.addEventListener('focus', () => {
            const enhancedInput = document.getElementById('enhancedSearchInput');
            if (enhancedInput) {
                enhancedInput.focus();
            }
        });
    }
    
    console.log('✅ Enhanced search bar integrated successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for other components to load
        setTimeout(integrateEnhancedSearchBar, 100);
    });
} else {
    // DOM already loaded
    setTimeout(integrateEnhancedSearchBar, 100);
}

// Export for manual initialization
window.integrateEnhancedSearchBar = integrateEnhancedSearchBar;