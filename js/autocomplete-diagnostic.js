/**
 * Autocomplete Diagnostic Tool
 * Helps identify why autocomplete appears below dropdowns
 */

function diagnoseAutocompleteStacking() {
    console.log('=== Autocomplete Stacking Diagnostic ===');
    
    // Find key elements
    const autocomplete = document.querySelector('.search-autocomplete');
    const sortSelect = document.getElementById('sortCriteria');
    const viewControls = document.querySelector('.view-controls');
    const filtersSection = document.querySelector('.filters-section');
    const searchContainer = document.querySelector('.enhanced-search-bar, .search-container');
    
    // Check if elements exist
    console.log('\n1. Element Detection:');
    console.log('- Autocomplete:', autocomplete ? 'Found' : 'Not found');
    console.log('- Sort Select:', sortSelect ? 'Found' : 'Not found');
    console.log('- View Controls:', viewControls ? 'Found' : 'Not found');
    console.log('- Search Container:', searchContainer ? 'Found' : 'Not found');
    
    if (!autocomplete) {
        console.error('Autocomplete not found! Make sure to trigger it first.');
        return;
    }
    
    // Get computed styles
    console.log('\n2. Z-Index Values:');
    const elements = [
        { name: 'Autocomplete', el: autocomplete },
        { name: 'Sort Select', el: sortSelect },
        { name: 'View Controls', el: viewControls },
        { name: 'Filters Section', el: filtersSection },
        { name: 'Search Container', el: searchContainer }
    ];
    
    elements.forEach(({ name, el }) => {
        if (el) {
            const computed = window.getComputedStyle(el);
            console.log(`- ${name}:`, {
                zIndex: computed.zIndex,
                position: computed.position,
                display: computed.display
            });
        }
    });
    
    // Check stacking contexts
    console.log('\n3. Stacking Context Analysis:');
    
    function createsStackingContext(element) {
        const style = window.getComputedStyle(element);
        const contexts = [];
        
        // Check all properties that create stacking contexts
        if (style.opacity !== '1') contexts.push(`opacity: ${style.opacity}`);
        if (style.transform !== 'none') contexts.push(`transform: ${style.transform}`);
        if (style.filter !== 'none') contexts.push(`filter: ${style.filter}`);
        if (style.perspective !== 'none') contexts.push(`perspective: ${style.perspective}`);
        if (style.clipPath !== 'none') contexts.push(`clip-path: ${style.clipPath}`);
        if (style.mask !== 'none') contexts.push(`mask: ${style.mask}`);
        if (style.isolation === 'isolate') contexts.push('isolation: isolate');
        if (style.mixBlendMode !== 'normal') contexts.push(`mix-blend-mode: ${style.mixBlendMode}`);
        if (style.position === 'fixed' || style.position === 'sticky') {
            contexts.push(`position: ${style.position}`);
        }
        if (style.willChange && style.willChange !== 'auto') {
            contexts.push(`will-change: ${style.willChange}`);
        }
        
        return contexts;
    }
    
    // Check each element and its parents
    elements.forEach(({ name, el }) => {
        if (el) {
            console.log(`\n${name} stacking contexts:`);
            let current = el;
            let level = 0;
            
            while (current && current !== document.body) {
                const contexts = createsStackingContext(current);
                if (contexts.length > 0) {
                    console.log(`  ${'  '.repeat(level)}${current.className || current.tagName}: ${contexts.join(', ')}`);
                }
                current = current.parentElement;
                level++;
            }
        }
    });
    
    // Check actual positions
    console.log('\n4. Element Positions:');
    if (autocomplete && sortSelect) {
        const autoRect = autocomplete.getBoundingClientRect();
        const selectRect = sortSelect.getBoundingClientRect();
        
        console.log('- Autocomplete:', {
            top: autoRect.top,
            left: autoRect.left,
            width: autoRect.width,
            height: autoRect.height
        });
        
        console.log('- Sort Select:', {
            top: selectRect.top,
            left: selectRect.left,
            width: selectRect.width,
            height: selectRect.height
        });
        
        // Check overlap
        const horizontalOverlap = !(autoRect.right < selectRect.left || autoRect.left > selectRect.right);
        const verticalOverlap = !(autoRect.bottom < selectRect.top || autoRect.top > selectRect.bottom);
        
        if (horizontalOverlap && verticalOverlap) {
            console.warn('⚠️ Elements are overlapping!');
        }
    }
    
    // Provide recommendations
    console.log('\n5. Recommendations:');
    console.log('- Try adding: .search-autocomplete { z-index: 99999 !important; position: fixed !important; }');
    console.log('- Check if any parent has overflow: hidden');
    console.log('- Consider using isolation: isolate on the search container');
    console.log('- Native select dropdowns cannot be z-indexed below other elements');
}

// Auto-run diagnostic when autocomplete becomes visible
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.classList && mutation.target.classList.contains('search-autocomplete')) {
            if (mutation.target.classList.contains('visible')) {
                setTimeout(() => {
                    console.log('Autocomplete became visible, running diagnostic...');
                    diagnoseAutocompleteStacking();
                }, 100);
            }
        }
    });
});

// Start observing
setTimeout(() => {
    const autocomplete = document.querySelector('.search-autocomplete');
    if (autocomplete) {
        observer.observe(autocomplete, {
            attributes: true,
            attributeFilter: ['class']
        });
        console.log('Diagnostic observer attached. Type in search to trigger autocomplete.');
    }
}, 1000);

// Export for manual use
window.diagnoseAutocomplete = diagnoseAutocompleteStacking;