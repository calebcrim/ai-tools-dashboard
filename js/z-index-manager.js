/**
 * Z-Index Manager
 * Handles dynamic z-index adjustments for autocomplete visibility
 */

class ZIndexManager {
    constructor() {
        this.autocompleteSelector = '.search-autocomplete';
        this.dropdownSelectors = [
            '.filter-dropdown-menu',
            '.sort-controls select',
            '.view-controls'
        ];
        this.init();
    }
    
    init() {
        // Monitor autocomplete visibility
        this.observeAutocomplete();
        
        // Add class to body when autocomplete is active
        this.setupAutocompleteActiveClass();
    }
    
    observeAutocomplete() {
        const autocomplete = document.querySelector(this.autocompleteSelector);
        if (!autocomplete) return;
        
        // Use MutationObserver to watch for visibility changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.handleAutocompleteVisibility(autocomplete);
                }
            });
        });
        
        observer.observe(autocomplete, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    handleAutocompleteVisibility(autocomplete) {
        const isVisible = autocomplete.classList.contains('visible');
        
        if (isVisible) {
            // Ensure autocomplete is on top
            this.elevateAutocomplete();
            
            // Optionally lower other dropdowns
            this.lowerOtherDropdowns();
            
            // Add active class to body
            document.body.classList.add('autocomplete-active');
        } else {
            // Restore normal z-index values
            this.restoreZIndexes();
            
            // Remove active class
            document.body.classList.remove('autocomplete-active');
        }
    }
    
    elevateAutocomplete() {
        const autocomplete = document.querySelector(this.autocompleteSelector);
        if (autocomplete) {
            // Force highest z-index
            autocomplete.style.zIndex = '1001';
            
            // Ensure parent has proper stacking context
            const parent = autocomplete.closest('.enhanced-search-bar, .search-container');
            if (parent) {
                parent.style.position = 'relative';
                parent.style.zIndex = '102';
            }
        }
    }
    
    lowerOtherDropdowns() {
        // Temporarily lower other dropdowns if they're in the way
        this.dropdownSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.style.zIndex && parseInt(el.style.zIndex) >= 100) {
                    el.dataset.originalZIndex = el.style.zIndex;
                    el.style.zIndex = '98';
                }
            });
        });
    }
    
    restoreZIndexes() {
        // Restore original z-index values
        document.querySelectorAll('[data-original-z-index]').forEach(el => {
            el.style.zIndex = el.dataset.originalZIndex;
            delete el.dataset.originalZIndex;
        });
    }
    
    setupAutocompleteActiveClass() {
        // Listen for focus on search input
        const searchInput = document.getElementById('enhancedSearchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('focus', () => {
            // Small delay to ensure autocomplete is rendered
            setTimeout(() => {
                const autocomplete = document.querySelector(this.autocompleteSelector);
                if (autocomplete && autocomplete.classList.contains('visible')) {
                    this.handleAutocompleteVisibility(autocomplete);
                }
            }, 50);
        });
    }
    
    // Debug method to check current z-indexes
    debugZIndexes() {
        const elements = [
            { name: 'Autocomplete', selector: this.autocompleteSelector },
            { name: 'Filter Dropdown', selector: '.filter-dropdown-menu' },
            { name: 'View Controls', selector: '.view-controls' },
            { name: 'Compressed Filter Bar', selector: '.compressed-filter-bar' }
        ];
        
        console.log('Current Z-Index Values:');
        elements.forEach(({ name, selector }) => {
            const el = document.querySelector(selector);
            if (el) {
                const computed = window.getComputedStyle(el);
                console.log(`${name}: ${computed.zIndex} (position: ${computed.position})`);
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.zIndexManager = new ZIndexManager();
    });
} else {
    window.zIndexManager = new ZIndexManager();
}

// Export for debugging
window.ZIndexManager = ZIndexManager;