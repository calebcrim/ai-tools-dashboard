/**
 * Filter System Component
 * Handles advanced filtering for the enterprise dashboard
 */

class FilterSystem {
    constructor(container, dataProcessor, onFiltersChange) {
        this.container = container;
        this.dataProcessor = dataProcessor;
        this.onFiltersChange = onFiltersChange || (() => {});
        
        this.activeFilters = {
            search: '',
            categories: [],
            complexityLevels: [],
            impactRange: [0, 100],
            quickFilter: null
        };
        
        this.filterOptions = null;
        this.debounceTimer = null;
        
        console.log('FilterSystem initialized');
    }
    
    init() {
        console.log('Initializing filter system...');
        
        // Get available filter options from data processor
        this.filterOptions = this.dataProcessor.getFilterOptions();
        
        // Build the filter UI
        this.buildFilterUI();
        
        // Set up event listeners
        this.attachEventListeners();
        
        // Apply initial filters
        this.applyFilters();
    }
    
    buildFilterUI() {
        const existingSearch = this.container.querySelector('#filter-search');
        const existingCategories = this.container.querySelector('.filter-categories');
        
        // If basic structure exists, enhance it
        if (existingSearch || existingCategories) {
            console.log('Enhancing existing filter UI');
            return;
        }
        
        // Otherwise build from scratch
        this.container.innerHTML = `
            <div class="filter-panel-content">
                <!-- Search Filter -->
                <div class="filter-section">
                    <h3 class="filter-title">Search</h3>
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            id="filter-search" 
                            class="filter-search-input" 
                            placeholder="Search tools..."
                            autocomplete="off"
                        >
                        <i class="fas fa-search search-icon"></i>
                    </div>
                </div>
                
                <!-- Quick Filters -->
                <div class="filter-section">
                    <h3 class="filter-title">Quick Filters</h3>
                    <div class="quick-filter-buttons">
                        <button class="quick-filter-btn" data-filter="quick-wins">
                            🚀 Quick Wins
                        </button>
                        <button class="quick-filter-btn" data-filter="strategic">
                            ♔ Strategic
                        </button>
                        <button class="quick-filter-btn" data-filter="high-roi">
                            📈 High ROI
                        </button>
                    </div>
                </div>
                
                <!-- Business Impact Range -->
                <div class="filter-section">
                    <h3 class="filter-title">Business Impact</h3>
                    <div class="range-slider-container">
                        <div class="range-values">
                            <span class="range-min">${this.activeFilters.impactRange[0]}</span>
                            <span class="range-max">${this.activeFilters.impactRange[1]}</span>
                        </div>
                        <div class="range-slider-wrapper">
                            <input 
                                type="range" 
                                id="impact-min" 
                                class="range-slider" 
                                min="0" 
                                max="100" 
                                value="${this.activeFilters.impactRange[0]}"
                            >
                            <input 
                                type="range" 
                                id="impact-max" 
                                class="range-slider" 
                                min="0" 
                                max="100" 
                                value="${this.activeFilters.impactRange[1]}"
                            >
                        </div>
                    </div>
                </div>
                
                <!-- Complexity Levels -->
                <div class="filter-section">
                    <h3 class="filter-title">Complexity</h3>
                    <div class="complexity-levels">
                        ${[1, 2, 3, 4, 5].map(level => `
                            <label class="complexity-label">
                                <input 
                                    type="checkbox" 
                                    class="complexity-checkbox" 
                                    value="${level}"
                                >
                                <span class="complexity-indicator level-${level}">
                                    ${'⭐'.repeat(level)}
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Categories -->
                <div class="filter-section">
                    <h3 class="filter-title">Categories</h3>
                    <div class="filter-categories">
                        ${this.filterOptions.categories.slice(0, 10).map(category => `
                            <label class="category-checkbox-label">
                                <input 
                                    type="checkbox" 
                                    class="category-checkbox" 
                                    value="${category}"
                                >
                                <span>${category}</span>
                            </label>
                        `).join('')}
                        ${this.filterOptions.categories.length > 10 ? `
                            <button class="show-more-categories">
                                Show ${this.filterOptions.categories.length - 10} more...
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Filter Actions -->
                <div class="filter-actions">
                    <button class="btn btn-secondary reset-filters">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    <div class="active-filter-count">
                        <span class="filter-count">0</span> active filters
                    </div>
                </div>
            </div>
        `;
        
        // Add custom styles if needed
        this.addFilterStyles();
    }
    
    addFilterStyles() {
        // Check if styles already exist
        if (document.getElementById('filter-system-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'filter-system-styles';
        styles.textContent = `
            .filter-search-input {
                width: 100%;
                padding: 8px 12px 8px 36px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 14px;
            }
            
            .search-input-wrapper {
                position: relative;
            }
            
            .search-input-wrapper .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
                pointer-events: none;
            }
            
            .quick-filter-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .quick-filter-btn {
                padding: 6px 12px;
                border: 1px solid var(--border-color);
                border-radius: 20px;
                background: white;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }
            
            .quick-filter-btn:hover {
                border-color: var(--color-primary);
                color: var(--color-primary);
            }
            
            .quick-filter-btn.active {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }
            
            .range-slider-container {
                margin-top: 10px;
            }
            
            .range-values {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .range-slider-wrapper {
                position: relative;
                height: 20px;
            }
            
            .range-slider {
                position: absolute;
                width: 100%;
                -webkit-appearance: none;
                appearance: none;
                height: 4px;
                background: #ddd;
                outline: none;
                pointer-events: none;
            }
            
            .range-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--color-primary);
                border-radius: 50%;
                cursor: pointer;
                pointer-events: all;
            }
            
            .complexity-levels {
                display: flex;
                gap: 12px;
            }
            
            .complexity-label {
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .complexity-indicator {
                font-size: 12px;
                opacity: 0.3;
                transition: opacity 0.2s;
            }
            
            .complexity-checkbox:checked + .complexity-indicator {
                opacity: 1;
            }
            
            .category-checkbox-label {
                display: block;
                padding: 4px 0;
                cursor: pointer;
                font-size: 14px;
            }
            
            .category-checkbox {
                margin-right: 8px;
            }
            
            .show-more-categories {
                margin-top: 8px;
                color: var(--color-primary);
                background: none;
                border: none;
                cursor: pointer;
                font-size: 13px;
                text-decoration: underline;
            }
            
            .filter-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
            }
            
            .active-filter-count {
                font-size: 13px;
                color: #666;
            }
            
            .filter-count {
                font-weight: bold;
                color: var(--color-primary);
            }
        `;
        document.head.appendChild(styles);
    }
    
    attachEventListeners() {
        // Search input
        const searchInput = this.container.querySelector('#filter-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
        
        // Quick filter buttons
        this.container.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickFilter(e.target.dataset.filter);
            });
        });
        
        // Impact range sliders
        const impactMin = this.container.querySelector('#impact-min');
        const impactMax = this.container.querySelector('#impact-max');
        if (impactMin && impactMax) {
            impactMin.addEventListener('input', () => this.handleRangeChange());
            impactMax.addEventListener('input', () => this.handleRangeChange());
        }
        
        // Complexity checkboxes
        this.container.querySelectorAll('.complexity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleComplexityChange());
        });
        
        // Category checkboxes
        this.container.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleCategoryChange());
        });
        
        // Reset button
        const resetBtn = this.container.querySelector('.reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Show more categories
        const showMoreBtn = this.container.querySelector('.show-more-categories');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => this.showAllCategories());
        }
    }
    
    handleSearchInput(value) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.activeFilters.search = value;
            this.applyFilters();
        }, 300);
    }
    
    handleQuickFilter(filterType) {
        const btn = this.container.querySelector(`[data-filter="${filterType}"]`);
        
        // Toggle active state
        if (this.activeFilters.quickFilter === filterType) {
            this.activeFilters.quickFilter = null;
            btn.classList.remove('active');
        } else {
            // Remove active from all buttons
            this.container.querySelectorAll('.quick-filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            this.activeFilters.quickFilter = filterType;
            btn.classList.add('active');
        }
        
        this.applyFilters();
    }
    
    handleRangeChange() {
        const min = parseInt(this.container.querySelector('#impact-min').value);
        const max = parseInt(this.container.querySelector('#impact-max').value);
        
        // Ensure min doesn't exceed max
        if (min <= max) {
            this.activeFilters.impactRange = [min, max];
            
            // Update displayed values
            this.container.querySelector('.range-min').textContent = min;
            this.container.querySelector('.range-max').textContent = max;
            
            this.applyFilters();
        }
    }
    
    handleComplexityChange() {
        const selected = [];
        this.container.querySelectorAll('.complexity-checkbox:checked').forEach(checkbox => {
            selected.push(parseInt(checkbox.value));
        });
        
        this.activeFilters.complexityLevels = selected;
        this.applyFilters();
    }
    
    handleCategoryChange() {
        const selected = [];
        this.container.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
            selected.push(checkbox.value);
        });
        
        this.activeFilters.categories = selected;
        this.applyFilters();
    }
    
    showAllCategories() {
        const categoriesDiv = this.container.querySelector('.filter-categories');
        
        // Show all categories
        const allCategoriesHtml = this.filterOptions.categories.map(category => `
            <label class="category-checkbox-label">
                <input 
                    type="checkbox" 
                    class="category-checkbox" 
                    value="${category}"
                    ${this.activeFilters.categories.includes(category) ? 'checked' : ''}
                >
                <span>${category}</span>
            </label>
        `).join('');
        
        categoriesDiv.innerHTML = allCategoriesHtml;
        
        // Re-attach listeners
        categoriesDiv.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleCategoryChange());
        });
    }
    
    applyFilters() {
        console.log('Applying filters:', this.activeFilters);
        
        // Get filtered tools from data processor
        const filteredTools = this.dataProcessor.applyFilters(this.activeFilters);
        
        // Update filter count
        this.updateFilterCount();
        
        // Notify parent component
        this.onFiltersChange(filteredTools, this.activeFilters);
    }
    
    updateFilterCount() {
        let count = 0;
        
        if (this.activeFilters.search) count++;
        if (this.activeFilters.quickFilter) count++;
        if (this.activeFilters.categories.length > 0) count++;
        if (this.activeFilters.complexityLevels.length > 0) count++;
        if (this.activeFilters.impactRange[0] > 0 || this.activeFilters.impactRange[1] < 100) count++;
        
        const countEl = this.container.querySelector('.filter-count');
        if (countEl) {
            countEl.textContent = count;
        }
    }
    
    reset() {
        console.log('Resetting filters');
        
        // Reset filter state
        this.activeFilters = {
            search: '',
            categories: [],
            complexityLevels: [],
            impactRange: [0, 100],
            quickFilter: null
        };
        
        // Reset UI
        const searchInput = this.container.querySelector('#filter-search');
        if (searchInput) searchInput.value = '';
        
        this.container.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const impactMin = this.container.querySelector('#impact-min');
        const impactMax = this.container.querySelector('#impact-max');
        if (impactMin) impactMin.value = 0;
        if (impactMax) impactMax.value = 100;
        
        this.container.querySelector('.range-min').textContent = '0';
        this.container.querySelector('.range-max').textContent = '100';
        
        // Apply filters
        this.applyFilters();
    }
    
    getActiveFilters() {
        return this.activeFilters;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterSystem;
}

// Make available globally
window.FilterSystem = FilterSystem;