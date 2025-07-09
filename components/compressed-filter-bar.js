/**
 * Compressed Filter Bar Component
 * Replaces the large metric cards with a single horizontal filter bar
 */

class CompressedFilterBar {
    constructor(tools, onFilterChange) {
        this.tools = tools;
        this.onFilterChange = onFilterChange;
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.categoryDropdownOpen = false;
        
        // Define primary filter badges with emojis
        this.primaryFilters = [
            { id: 'media-intelligence', label: 'Media', emoji: '📺', category: 'media-intelligence' },
            { id: 'ai-assistant', label: 'Assistants', emoji: '🤖', category: 'ai-assistant' },
            { id: 'google', label: 'Google', emoji: 'G', isTag: true, tag: 'Google' }
        ];
        
        this.init();
    }
    
    init() {
        this.calculateCounts();
        this.render();
        this.attachEventListeners();
    }
    
    calculateCounts() {
        // Calculate total count
        this.totalCount = this.tools.length;
        
        // Calculate counts for each filter
        this.filterCounts = {};
        
        this.primaryFilters.forEach(filter => {
            if (filter.isTag) {
                // Count tools with specific tag
                this.filterCounts[filter.id] = this.tools.filter(tool => 
                    tool.tags && tool.tags.some(tag => 
                        tag.toLowerCase().includes(filter.tag.toLowerCase())
                    )
                ).length;
            } else {
                // Count tools in specific category
                this.filterCounts[filter.id] = this.tools.filter(tool => 
                    tool.category === filter.category
                ).length;
            }
        });
        
        // Calculate all unique categories for dropdown
        this.categories = [...new Set(this.tools.map(tool => tool.category))]
            .filter(cat => cat)
            .sort();
        
        this.categoryCounts = {};
        this.categories.forEach(cat => {
            this.categoryCounts[cat] = this.tools.filter(tool => tool.category === cat).length;
        });
    }
    
    render() {
        const existingBar = document.querySelector('.compressed-filter-bar');
        if (existingBar) existingBar.remove();
        
        const filterBar = document.createElement('div');
        filterBar.className = 'compressed-filter-bar';
        
        filterBar.innerHTML = `
            <div class="filter-bar-content">
                <!-- Search Input Removed - Using Header Search Bar -->
                
                <!-- Category Dropdown -->
                <div class="filter-dropdown">
                    <button class="filter-dropdown-btn" id="categoryDropdownBtn">
                        <span class="dropdown-label">All ${this.getFilteredCount()}</span>
                        <i class="fas fa-chevron-down dropdown-icon"></i>
                    </button>
                    <div class="filter-dropdown-menu" id="categoryDropdownMenu" style="display: none;">
                        <div class="dropdown-item" data-category="all">
                            <span>All Tools</span>
                            <span class="dropdown-count">${this.totalCount}</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        ${this.categories.map(cat => `
                            <div class="dropdown-item" data-category="${cat}">
                                <span>${this.formatCategoryName(cat)}</span>
                                <span class="dropdown-count">${this.categoryCounts[cat]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Filter Badges -->
                <div class="filter-badges">
                    ${this.primaryFilters.map(filter => `
                        <button class="filter-badge ${this.activeFilters.has(filter.id) ? 'active' : ''}" 
                                data-filter="${filter.id}">
                            <span class="badge-emoji">${filter.emoji}</span>
                            <span class="badge-label">${filter.label}</span>
                            <span class="badge-count">${this.filterCounts[filter.id]}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Clear Filters (shown when filters active) -->
                ${this.activeFilters.size > 0 || this.searchTerm ? `
                    <button class="filter-clear-btn">
                        <i class="fas fa-times"></i> Clear
                    </button>
                ` : ''}
            </div>
        `;
        
        // Insert after header, before stats bar
        const statsBar = document.querySelector('.stats-bar');
        if (statsBar) {
            statsBar.parentNode.insertBefore(filterBar, statsBar);
        } else {
            // If no stats bar, insert after header
            const header = document.querySelector('.header');
            header.parentNode.insertBefore(filterBar, header.nextSibling);
        }
        
        // Add class to body for CSS fallback
        document.body.classList.add('using-compressed-filter');
    }
    
    attachEventListeners() {
        // Search input removed - using header search bar
        
        // Category dropdown
        const dropdownBtn = document.getElementById('categoryDropdownBtn');
        const dropdownMenu = document.getElementById('categoryDropdownMenu');
        
        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.addEventListener('click', () => {
                this.categoryDropdownOpen = !this.categoryDropdownOpen;
                dropdownMenu.style.display = this.categoryDropdownOpen ? 'block' : 'none';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.filter-dropdown')) {
                    this.categoryDropdownOpen = false;
                    dropdownMenu.style.display = 'none';
                }
            });
            
            // Category selection
            dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.dataset.category;
                    this.selectCategory(category);
                    this.categoryDropdownOpen = false;
                    dropdownMenu.style.display = 'none';
                });
            });
        }
        
        // Filter badges
        document.querySelectorAll('.filter-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                const filterId = badge.dataset.filter;
                if (this.activeFilters.has(filterId)) {
                    this.activeFilters.delete(filterId);
                } else {
                    this.activeFilters.add(filterId);
                }
                this.applyFilters();
            });
        });
        
        // Clear filters button
        const clearBtn = document.querySelector('.filter-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }
    
    selectCategory(category) {
        if (category === 'all') {
            this.selectedCategory = null;
        } else {
            this.selectedCategory = category;
        }
        this.applyFilters();
    }
    
    applyFilters() {
        let filtered = [...this.tools];
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(tool => 
                tool.tool_name?.toLowerCase().includes(searchLower) ||
                tool.brief_purpose_summary?.toLowerCase().includes(searchLower) ||
                tool.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply category filter
        if (this.selectedCategory) {
            filtered = filtered.filter(tool => tool.category === this.selectedCategory);
        }
        
        // Apply badge filters (AND logic)
        if (this.activeFilters.size > 0) {
            this.activeFilters.forEach(filterId => {
                const filter = this.primaryFilters.find(f => f.id === filterId);
                if (filter) {
                    if (filter.isTag) {
                        filtered = filtered.filter(tool => 
                            tool.tags && tool.tags.some(tag => 
                                tag.toLowerCase().includes(filter.tag.toLowerCase())
                            )
                        );
                    } else {
                        filtered = filtered.filter(tool => tool.category === filter.category);
                    }
                }
            });
        }
        
        // Update UI and trigger callback
        this.updateCounts(filtered);
        this.render();
        this.attachEventListeners();
        
        if (this.onFilterChange) {
            this.onFilterChange(filtered);
        }
    }
    
    updateCounts(filteredTools) {
        // Recalculate counts based on current filters
        this.primaryFilters.forEach(filter => {
            if (filter.isTag) {
                this.filterCounts[filter.id] = filteredTools.filter(tool => 
                    tool.tags && tool.tags.some(tag => 
                        tag.toLowerCase().includes(filter.tag.toLowerCase())
                    )
                ).length;
            } else {
                this.filterCounts[filter.id] = filteredTools.filter(tool => 
                    tool.category === filter.category
                ).length;
            }
        });
    }
    
    getFilteredCount() {
        if (this.activeFilters.size === 0 && !this.searchTerm && !this.selectedCategory) {
            return this.totalCount;
        }
        // This will be updated after filters are applied
        return this.onFilterChange ? filteredTools.length : this.totalCount;
    }
    
    clearAllFilters() {
        this.activeFilters.clear();
        this.searchTerm = '';
        this.selectedCategory = null;
        this.applyFilters();
    }
    
    formatCategoryName(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Export for use in main script
window.CompressedFilterBar = CompressedFilterBar;