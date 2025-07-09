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
        if (window.virtualScroll && window.virtualScroll.updateItems) {
            window.virtualScroll.updateItems(filteredTools);
            window.virtualScroll.scrollToTop();
        }
        
        // Use the proper rendering function if available
        if (typeof renderEnhancedToolCard === 'function') {
            const container = document.querySelector('.tools-grid') || 
                             document.querySelector('.virtual-scroll-content') ||
                             document.querySelector('#toolsContainer');
            
            if (container) {
                if (filteredTools.length === 0) {
                    container.innerHTML = '<div class="no-results">No tools found</div>';
                } else if (filteredTools.length <= 100) {
                    // Clear container and render tool cards properly
                    container.innerHTML = '';
                    filteredTools.forEach(tool => {
                        const card = renderEnhancedToolCard(tool);
                        container.appendChild(card);
                    });
                } else {
                    // For large sets, render first 100
                    container.innerHTML = '';
                    filteredTools.slice(0, 100).forEach(tool => {
                        const card = renderEnhancedToolCard(tool);
                        container.appendChild(card);
                    });
                    const moreDiv = document.createElement('div');
                    moreDiv.className = 'more-results';
                    moreDiv.textContent = `Showing first 100 of ${filteredTools.length} results...`;
                    container.appendChild(moreDiv);
                }
            }
        } else {
            // Fallback to simple rendering if renderEnhancedToolCard is not available
            console.warn('renderEnhancedToolCard not found, using simple rendering');
            const container = document.querySelector('.tools-grid') || 
                             document.querySelector('.virtual-scroll-content') ||
                             document.querySelector('.tools-container');
            
            if (container) {
                if (filteredTools.length === 0) {
                    container.innerHTML = '<div class="no-results">No tools found</div>';
                } else {
                    container.innerHTML = filteredTools.slice(0, 100).map(tool => `
                        <div class="tool-card" data-tool="${tool.tool_name}">
                            <h3>${tool.tool_name}</h3>
                            <p class="category">${tool.category || 'Uncategorized'}</p>
                            <p>${tool.brief_purpose_summary || ''}</p>
                        </div>
                    `).join('');
                }
            }
        }
        
        // Compressed filter bar removed - no need to update badges
        
        // Trigger any other filter update callbacks
        if (window.onFilterChange) {
            window.onFilterChange(filteredTools);
        }
    };
    
    // Don't create a new search bar - use the existing header search
    // Connect the header search input to the search functionality
    const headerSearchInput = document.getElementById('headerSearchInput');
    if (headerSearchInput) {
        // Store search functionality globally
        window.performToolSearch = (searchTerm) => {
            let filtered = [...tools];
            
            if (searchTerm && searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                const searchWords = searchLower.split(/\s+/);
                
                filtered = filtered.filter(tool => {
                    const searchableText = [
                        tool.tool_name || '',
                        tool.brief_purpose_summary || '',
                        tool.feature_breakdown || '',
                        tool.category || '',
                        ...(tool.use_cases_in_pr || []),
                        ...(tool.tags || [])
                    ].join(' ').toLowerCase();
                    
                    // All words must match (AND logic)
                    return searchWords.every(word => searchableText.includes(word));
                });
                
                // Sort by relevance
                filtered.sort((a, b) => {
                    const aNameMatch = (a.tool_name || '').toLowerCase().includes(searchLower);
                    const bNameMatch = (b.tool_name || '').toLowerCase().includes(searchLower);
                    
                    if (aNameMatch && !bNameMatch) return -1;
                    if (!aNameMatch && bNameMatch) return 1;
                    
                    return 0;
                });
            }
            
            handleSearchChange(filtered);
        };
        
        // Remove existing listeners and add new one
        const newInput = headerSearchInput.cloneNode(true);
        headerSearchInput.parentNode.replaceChild(newInput, headerSearchInput);
        
        newInput.addEventListener('input', (e) => {
            window.performToolSearch(e.target.value);
        });
        
        // Perform initial search if there's a value
        if (newInput.value) {
            window.performToolSearch(newInput.value);
        }
    }
    
    // Compressed filter bar removed - no patching needed
    
    // The header search is already connected above, no need for additional handlers
    
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