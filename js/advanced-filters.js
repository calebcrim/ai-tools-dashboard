/**
 * Advanced Filters Implementation
 * Comprehensive filtering system for AI Tools Database
 */

// Global state for filters
let activeFilters = {
    search: '',
    category: 'all',
    source: 'all',
    price: [],
    learning: [],
    integration: [],
    tags: []
};

// Price parsing utility
function parsePriceRange(priceText) {
    if (!priceText) return null;
    
    const text = priceText.toLowerCase();
    
    // Check for free
    if (text.includes('free') && !text.includes('freemium')) {
        return { min: 0, max: 0, type: 'free' };
    }
    
    // Check for enterprise
    if (text.includes('enterprise') || text.includes('custom') || text.includes('contact')) {
        return { type: 'enterprise' };
    }
    
    // Extract numeric values
    const matches = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (matches && matches.length > 0) {
        const values = matches.map(m => parseFloat(m.replace(/[$,]/g, '')));
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        // Check if it's per month
        if (text.includes('/mo') || text.includes('month')) {
            return { min, max, type: 'monthly' };
        }
        // Check if it's per year
        if (text.includes('/year') || text.includes('annual')) {
            return { min: min/12, max: max/12, type: 'yearly_converted' };
        }
        
        // Default to monthly if not specified
        return { min, max, type: 'assumed_monthly' };
    }
    
    return null;
}

// Learning curve parsing
function parseLearningCurve(learningText) {
    if (!learningText) return 'unknown';
    
    const text = learningText.toLowerCase();
    
    if (text.includes('easy') || text.includes('simple') || text.includes('beginner') || text.includes('low')) {
        return 'easy';
    }
    if (text.includes('moderate') || text.includes('medium') || text.includes('intermediate')) {
        return 'moderate';
    }
    if (text.includes('steep') || text.includes('difficult') || text.includes('complex') || text.includes('high') || text.includes('advanced')) {
        return 'steep';
    }
    
    return 'unknown';
}

// Integration parsing
function parseIntegrations(tool) {
    const integrations = [];
    const searchText = `${tool.integration_potential || ''} ${tool.feature_breakdown || ''}`.toLowerCase();
    
    if (searchText.includes('api')) integrations.push('api');
    if (searchText.includes('zapier')) integrations.push('zapier');
    if (searchText.includes('slack')) integrations.push('slack');
    if (searchText.includes('google') || searchText.includes('gmail') || searchText.includes('drive')) integrations.push('google');
    if (searchText.includes('microsoft') || searchText.includes('office') || searchText.includes('teams')) integrations.push('microsoft');
    
    return integrations;
}

// Initialize feature tags
function initializeFeatureTags() {
    const allTags = new Set();
    
    if (typeof allTools === 'undefined' || !allTools) {
        console.warn('allTools not available yet, retrying...');
        setTimeout(initializeFeatureTags, 500);
        return;
    }
    
    allTools.forEach(tool => {
        if (tool.tags && Array.isArray(tool.tags)) {
            tool.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const featureTagsContainer = document.getElementById('featureTags');
    if (!featureTagsContainer) return;
    
    const sortedTags = Array.from(allTags).sort();
    
    featureTagsContainer.innerHTML = sortedTags.map(tag => `
        <button class="filter-tag" data-tag="${escapeHtml(tag)}" onclick="toggleTag('${escapeHtml(tag)}')">
            ${escapeHtml(tag)}
        </button>
    `).join('');
}

// Enhance the toggle button behavior
function enhanceToggleButton() {
    const toggle = document.querySelector('.filter-toggle');
    const panel = document.getElementById('advancedFilters');
    
    if (!toggle || !panel) return;
    
    // Create a MutationObserver to watch for class changes on the panel
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (panel.classList.contains('active')) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }
        });
    });
    
    // Start observing the panel for class attribute changes
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    
    // Set initial state
    if (panel.classList.contains('active')) {
        toggle.classList.add('active');
    }
}

// Toggle tag selection
window.toggleTag = function(tag) {
    const index = activeFilters.tags.indexOf(tag);
    
    if (index > -1) {
        activeFilters.tags.splice(index, 1);
    } else {
        activeFilters.tags.push(tag);
    }
    
    // Update UI
    const tagButton = document.querySelector(`[data-tag="${tag}"]`);
    if (tagButton) {
        tagButton.classList.toggle('active');
    }
    
    applyFilters();
}

// Apply all filters
window.applyFilters = function() {
    // Update filter state from checkboxes
    activeFilters.price = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(cb => cb.value);
    activeFilters.learning = Array.from(document.querySelectorAll('input[name="learning"]:checked')).map(cb => cb.value);
    activeFilters.integration = Array.from(document.querySelectorAll('input[name="integration"]:checked')).map(cb => cb.value);
    
    // Get search and category values
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        activeFilters.search = searchInput.value.toLowerCase();
    }
    
    // Apply filters
    advancedFilterTools();
    
    // Update filter count
    updateFilterCount();
    
    // Close the panel after applying
    const panel = document.getElementById('advancedFilters');
    if (panel) {
        panel.classList.remove('active');
    }
}

// Clear all filters
window.clearAllFilters = function() {
    // Reset state
    activeFilters = {
        search: activeFilters.search, // Keep search
        category: 'all',
        source: 'all',
        price: [],
        learning: [],
        integration: [],
        tags: []
    };
    
    // Clear checkboxes
    document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
    
    // Clear tags
    document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
    
    // Reset category filters if they exist
    const categoryChips = document.querySelectorAll('#categoryFilters .filter-chip');
    categoryChips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === 'all');
    });
    
    // Apply filters
    advancedFilterTools();
    updateFilterCount();
    
    // Don't close the panel, just update the display
    return false;
}

// Update filter count badge
function updateFilterCount() {
    const count = activeFilters.price.length + 
                  activeFilters.learning.length + 
                  activeFilters.integration.length + 
                  activeFilters.tags.length +
                  (activeFilters.category !== 'all' ? 1 : 0) +
                  (activeFilters.source !== 'all' ? 1 : 0);
    
    const filterCount = document.getElementById('filterCount');
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    
    if (filterCount) {
        if (count > 0) {
            filterCount.textContent = count;
            filterCount.style.display = 'inline-block';
        } else {
            filterCount.style.display = 'none';
        }
    }
    
    // Show/hide clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// Enhanced filter function
function advancedFilterTools() {
    if (typeof allTools === 'undefined' || !allTools) {
        console.warn('allTools not available');
        return;
    }
    
    const filtered = allTools.filter(tool => {
        // Search filter
        if (activeFilters.search && !matchesSearch(tool, activeFilters.search)) {
            return false;
        }
        
        // Category filter (from existing chips)
        const activeCategory = document.querySelector('#categoryFilters .filter-chip.active');
        if (activeCategory && activeCategory.dataset.category !== 'all') {
            if (tool.category !== activeCategory.dataset.category) {
                return false;
            }
        }
        
        // Price filter
        if (activeFilters.price.length > 0) {
            const priceData = parsePriceRange(tool.pricing_model);
            let matchesPrice = false;
            
            activeFilters.price.forEach(priceFilter => {
                if (priceFilter === 'free' && priceData?.type === 'free') {
                    matchesPrice = true;
                } else if (priceFilter === 'enterprise' && priceData?.type === 'enterprise') {
                    matchesPrice = true;
                } else if (priceFilter === 'unknown' && !priceData) {
                    matchesPrice = true;
                } else if (priceData && priceData.min !== undefined) {
                    if (priceFilter.endsWith('+')) {
                        // Handle "100+" case
                        const min = parseFloat(priceFilter.replace('+', ''));
                        if (priceData.min >= min) {
                            matchesPrice = true;
                        }
                    } else {
                        // Handle range like "20-50"
                        const [min, max] = priceFilter.split('-').map(p => parseFloat(p));
                        if (priceData.min <= max && (priceData.max || priceData.min) >= (min || 0)) {
                            matchesPrice = true;
                        }
                    }
                }
            });
            
            if (!matchesPrice) return false;
        }
        
        // Learning curve filter
        if (activeFilters.learning.length > 0) {
            const curve = parseLearningCurve(tool.learning_curve);
            if (!activeFilters.learning.includes(curve)) {
                return false;
            }
        }
        
        // Integration filter
        if (activeFilters.integration.length > 0) {
            const integrations = parseIntegrations(tool);
            const hasRequiredIntegration = activeFilters.integration.some(req => integrations.includes(req));
            if (!hasRequiredIntegration) return false;
        }
        
        // Tag filter
        if (activeFilters.tags.length > 0) {
            if (!tool.tags || !activeFilters.tags.every(tag => tool.tags.includes(tag))) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update display
    filteredTools = filtered;
    updateStatistics();
    
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
    
    // Update results count
    const filteredCount = document.getElementById('filteredCount');
    if (filteredCount) {
        filteredCount.textContent = filtered.length;
    }
    
    // Show notification if function exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(`Showing ${filtered.length} tools`, 'info');
    }
}

// Helper function for search matching
function matchesSearch(tool, searchTerm) {
    const searchableText = `
        ${tool.tool_name || tool.name || ''}
        ${tool.brief_purpose_summary || tool.description || ''}
        ${tool.feature_breakdown || ''}
        ${tool.use_cases_in_pr?.join(' ') || ''}
        ${tool.tags?.join(' ') || ''}
        ${tool.category || ''}
    `.toLowerCase();
    
    return searchableText.includes(searchTerm);
}

// Escape HTML for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Override existing filterTools to use advanced filtering
if (typeof window.filterTools !== 'undefined') {
    window.originalFilterTools = window.filterTools;
    window.filterTools = advancedFilterTools;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Advanced filters initializing...');
    
    // Check if elements exist
    const panel = document.getElementById('advancedFilters');
    const toggle = document.querySelector('.filter-toggle');
    console.log('Panel found:', !!panel);
    console.log('Toggle button found:', !!toggle);
    
    // Initialize feature tags after tools are loaded
    setTimeout(() => {
        initializeFeatureTags();
        
        // Enhance the toggle button
        enhanceToggleButton();
        
        // Add event listener to existing search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Remove existing listeners and add new one
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            newSearchInput.addEventListener('input', function() {
                activeFilters.search = this.value.toLowerCase();
                applyFilters();
            });
        }
        
        // Add listeners to existing category filters
        const categoryChips = document.querySelectorAll('#categoryFilters .filter-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', function() {
                categoryChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                activeFilters.category = this.dataset.category;
                applyFilters();
            });
        });
        
    }, 1000);
});