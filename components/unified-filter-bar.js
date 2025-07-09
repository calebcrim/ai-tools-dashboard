/**
 * Unified Filter Bar Component
 * Implements the optimized filter design from the specification
 */

class UnifiedFilterBar {
    constructor(tools, onFilterChange) {
        this.tools = tools;
        this.onFilterChange = onFilterChange;
        
        // Filter state management
        this.filterState = {
            categories: [],
            source: [],
            features: [],
            price: [],
            advanced: {
                learningCurve: [],
                integrations: [],
                compliance: [],
                geographic: []
            }
        };
        
        // Quick filters configuration
        this.quickFilters = [
            { id: 'free-tier', label: 'Free Tier', filterType: 'features' },
            { id: 'api-available', label: 'API Available', filterType: 'features' },
            { id: 'enterprise', label: 'Enterprise', filterType: 'features' }
        ];
        
        // State management
        this.activeDropdown = null;
        this.moreFiltersExpanded = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
        this.syncWithURL();
        this.updateFilterCounts();
        
        // Trigger initial filter to display all tools
        this.applyFilters();
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'unified-filter-bar';
        container.innerHTML = `
            <div class="filter-bar-container">
                <div class="filter-row">
                    <!-- Filter Dropdowns -->
                    <div class="filter-dropdowns">
                        ${this.renderDropdown('categories', 'Categories')}
                        ${this.renderDropdown('source', 'Source')}
                        ${this.renderDropdown('features', 'Features')}
                        ${this.renderDropdown('price', 'Price')}
                    </div>
                    
                    <!-- Quick Filters -->
                    <div class="quick-filters">
                        ${this.quickFilters.map(filter => `
                            <button class="quick-filter-chip" data-filter-id="${filter.id}">
                                ${filter.label}
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- More Filters Button -->
                    <button class="more-filters-btn" id="moreFiltersBtn">
                        <i class="fas fa-sliders-h"></i>
                        More Filters
                        <span class="more-filters-count" style="display: none;">0</span>
                    </button>
                </div>
                
                <!-- Active Filters Bar -->
                <div class="active-filters-bar" id="activeFiltersBar" style="display: none;">
                    <div class="active-filter-tags" id="activeFilterTags"></div>
                    <button class="clear-all-link">Clear all filters</button>
                </div>
                
                <!-- More Filters Expanded Section -->
                <div class="more-filters-expanded" id="moreFiltersExpanded" style="display: none;">
                    <div class="advanced-filters-grid">
                        <div class="filter-section">
                            <h4>Learning Curve</h4>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="learningCurve" value="easy">
                                    <span>Easy</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="learningCurve" value="moderate">
                                    <span>Moderate</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="learningCurve" value="steep">
                                    <span>Steep</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Integration Capabilities</h4>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="integrations" value="zapier">
                                    <span>Zapier</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="integrations" value="slack">
                                    <span>Slack</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="integrations" value="google">
                                    <span>Google Workspace</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="integrations" value="microsoft">
                                    <span>Microsoft</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Compliance</h4>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="compliance" value="soc2">
                                    <span>SOC2</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="compliance" value="gdpr">
                                    <span>GDPR</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="compliance" value="hipaa">
                                    <span>HIPAA</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Geographic Restrictions</h4>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="geographic" value="no-restrictions">
                                    <span>No Restrictions</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="geographic" value="us-only">
                                    <span>US Only</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" name="geographic" value="eu-available">
                                    <span>EU Available</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after header or at the beginning of main container
        const header = document.querySelector('.header');
        const mainContainer = document.querySelector('.main-container');
        const contentWrapper = document.querySelector('.content-wrapper');
        
        if (mainContainer) {
            // Remove any existing unified filter bar to prevent duplicates
            const existingUnifiedBar = mainContainer.querySelector('.unified-filter-bar');
            if (existingUnifiedBar) {
                existingUnifiedBar.remove();
            }
            
            // Remove existing filter sections
            const existingFilters = mainContainer.querySelector('.filters-section');
            if (existingFilters) {
                existingFilters.remove();
            }
            
            // Insert unified filter bar BEFORE content-wrapper if it exists, otherwise at beginning
            if (contentWrapper && contentWrapper.parentElement === mainContainer) {
                mainContainer.insertBefore(container, contentWrapper);
            } else {
                mainContainer.insertBefore(container, mainContainer.firstChild);
            }
        }
        
        this.container = container;
    }
    
    renderDropdown(type, label) {
        return `
            <div class="filter-dropdown" data-dropdown-type="${type}">
                <button class="filter-button" data-dropdown-trigger="${type}">
                    <span class="filter-label">${label}</span>
                    <span class="filter-count" data-count-for="${type}">0</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-panel" data-dropdown-panel="${type}">
                    <div class="dropdown-header">
                        <input type="text" class="dropdown-search" placeholder="Search ${label.toLowerCase()}...">
                        <div class="dropdown-actions">
                            <button class="select-all-btn">Select All</button>
                            <button class="clear-all-btn">Clear All</button>
                        </div>
                    </div>
                    <div class="dropdown-options" data-options-for="${type}">
                        <!-- Options will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Dropdown triggers
        document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = trigger.dataset.dropdownTrigger;
                this.toggleDropdown(type);
            });
        });
        
        // Quick filter chips
        document.querySelectorAll('.quick-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const filterId = chip.dataset.filterId;
                this.toggleQuickFilter(filterId);
            });
        });
        
        // More filters button
        const moreFiltersBtn = document.getElementById('moreFiltersBtn');
        if (moreFiltersBtn) {
            moreFiltersBtn.addEventListener('click', () => {
                this.toggleMoreFilters();
            });
        }
        
        // Clear all filters
        document.querySelector('.clear-all-link')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        // Advanced filter checkboxes
        document.querySelectorAll('.more-filters-expanded input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateAdvancedFilters();
            });
        });
        
        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                this.closeAllDropdowns();
            }
        });
        
        // Populate dropdown options
        this.populateDropdownOptions();
    }
    
    populateDropdownOptions() {
        // Categories
        const categories = this.getUniqueCategories();
        this.renderDropdownOptions('categories', categories);
        
        // Sources
        const sources = this.getUniqueSources();
        this.renderDropdownOptions('source', sources);
        
        // Features
        const features = this.getUniqueFeatures();
        this.renderDropdownOptions('features', features);
        
        // Price ranges
        const priceRanges = [
            { id: 'free', label: 'Free', count: 0 },
            { id: 'under-20', label: 'Under $20/mo', count: 0 },
            { id: '20-50', label: '$20-50/mo', count: 0 },
            { id: '50-100', label: '$50-100/mo', count: 0 },
            { id: '100-plus', label: '$100+/mo', count: 0 },
            { id: 'enterprise', label: 'Enterprise', count: 0 },
            { id: 'unknown', label: 'Price Unknown', count: 0 }
        ];
        this.renderDropdownOptions('price', priceRanges);
    }
    
    renderDropdownOptions(type, options) {
        const container = document.querySelector(`[data-options-for="${type}"]`);
        if (!container) return;
        
        container.innerHTML = options.map(option => `
            <label class="dropdown-option">
                <input type="checkbox" 
                       name="${type}" 
                       value="${option.id}"
                       ${this.filterState[type].includes(option.id) ? 'checked' : ''}>
                <span class="option-label">${option.label}</span>
                <span class="option-count">${option.count}</span>
            </label>
        `).join('');
        
        // Attach change listeners
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilterState(type);
                this.applyFilters();
            });
        });
        
        // Add search functionality to dropdown
        const searchInput = document.querySelector(`[data-dropdown-panel="${type}"] .dropdown-search`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                container.querySelectorAll('.dropdown-option').forEach(option => {
                    const label = option.querySelector('.option-label').textContent.toLowerCase();
                    option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
                });
            });
        }
        
        // Select All / Clear All functionality
        const selectAllBtn = document.querySelector(`[data-dropdown-panel="${type}"] .select-all-btn`);
        const clearAllBtn = document.querySelector(`[data-dropdown-panel="${type}"] .clear-all-btn`);
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = true;
                });
                this.updateFilterState(type);
                this.applyFilters();
            });
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                });
                this.updateFilterState(type);
                this.applyFilters();
            });
        }
    }
    
    getUniqueCategories() {
        const categoryMap = new Map();
        this.tools.forEach(tool => {
            if (tool.category) {
                if (!categoryMap.has(tool.category)) {
                    categoryMap.set(tool.category, { 
                        id: tool.category, 
                        label: this.formatCategoryName(tool.category), 
                        count: 0 
                    });
                }
                categoryMap.get(tool.category).count++;
            }
        });
        return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }
    
    getUniqueSources() {
        return [
            { id: 'all-sources', label: 'All Sources', count: this.tools.length },
            { id: 'ai-tools-list', label: 'AI Tools List', count: this.countBySource('ai-list') },
            { id: 'google-tools', label: 'Google Tools', count: this.countBySource('google') },
            { id: 'pdf', label: 'Featured Tools', count: this.countBySource('pdf') }
        ];
    }
    
    getUniqueFeatures() {
        return [
            { id: 'api-available', label: 'API Available', count: this.countByFeature('api') },
            { id: 'free-tier', label: 'Free Tier', count: this.countByFeature('free') },
            { id: 'enterprise', label: 'Enterprise', count: this.countByFeature('enterprise') },
            { id: 'easy-integration', label: 'Easy Integration', count: this.countByFeature('integration') }
        ];
    }
    
    countBySource(source) {
        return this.tools.filter(tool => {
            const toolSource = (tool.source || '').toLowerCase();
            return toolSource.includes(source);
        }).length;
    }
    
    countByFeature(feature) {
        return this.tools.filter(tool => {
            const searchText = `${tool.feature_breakdown || ''} ${tool.pricing_model || ''} ${tool.integration_potential || ''}`.toLowerCase();
            return searchText.includes(feature);
        }).length;
    }
    
    formatCategoryName(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    toggleDropdown(type) {
        const panel = document.querySelector(`[data-dropdown-panel="${type}"]`);
        const trigger = document.querySelector(`[data-dropdown-trigger="${type}"]`);
        
        if (this.activeDropdown === type) {
            this.closeAllDropdowns();
        } else {
            this.closeAllDropdowns();
            panel?.classList.add('active');
            trigger?.classList.add('active');
            this.activeDropdown = type;
            
            // Focus search input in dropdown
            const searchInput = panel?.querySelector('.dropdown-search');
            searchInput?.focus();
        }
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
            trigger.classList.remove('active');
        });
        this.activeDropdown = null;
    }
    
    toggleQuickFilter(filterId) {
        const chip = document.querySelector(`[data-filter-id="${filterId}"]`);
        if (!chip) return;
        
        const filter = this.quickFilters.find(f => f.id === filterId);
        if (!filter) return;
        
        // Toggle the filter state
        const isActive = chip.classList.contains('active');
        if (isActive) {
            // Remove from features array
            const index = this.filterState.features.indexOf(filterId);
            if (index > -1) {
                this.filterState.features.splice(index, 1);
            }
            chip.classList.remove('active');
        } else {
            // Add to features array
            this.filterState.features.push(filterId);
            chip.classList.add('active');
        }
        
        this.applyFilters();
    }
    
    toggleMoreFilters() {
        const expanded = document.getElementById('moreFiltersExpanded');
        const btn = document.getElementById('moreFiltersBtn');
        
        this.moreFiltersExpanded = !this.moreFiltersExpanded;
        
        if (this.moreFiltersExpanded) {
            expanded.style.display = 'block';
            btn.classList.add('active');
        } else {
            expanded.style.display = 'none';
            btn.classList.remove('active');
        }
    }
    
    updateAdvancedFilters() {
        // Update advanced filter state
        ['learningCurve', 'integrations', 'compliance', 'geographic'].forEach(filterType => {
            this.filterState.advanced[filterType] = Array.from(
                document.querySelectorAll(`input[name="${filterType}"]:checked`)
            ).map(cb => cb.value);
        });
        
        this.applyFilters();
        this.updateMoreFiltersCount();
    }
    
    updateFilterState(type) {
        this.filterState[type] = Array.from(
            document.querySelectorAll(`input[name="${type}"]:checked`)
        ).map(cb => cb.value);
        
        this.updateFilterCounts();
        this.updateActiveFiltersBar();
    }
    
    
    updateFilterCounts() {
        // Update dropdown counts
        Object.keys(this.filterState).forEach(type => {
            if (Array.isArray(this.filterState[type])) {
                const count = this.filterState[type].length;
                const countElement = document.querySelector(`[data-count-for="${type}"]`);
                if (countElement) {
                    countElement.textContent = count;
                    countElement.style.display = count > 0 ? 'inline-block' : 'none';
                }
                
                // Update button active state
                const button = document.querySelector(`[data-dropdown-trigger="${type}"]`);
                if (button) {
                    button.classList.toggle('has-filters', count > 0);
                }
            }
        });
        
        this.updateMoreFiltersCount();
    }
    
    updateMoreFiltersCount() {
        const count = Object.values(this.filterState.advanced).reduce((sum, arr) => sum + arr.length, 0);
        const countElement = document.querySelector('.more-filters-count');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
    
    updateActiveFiltersBar() {
        const activeFilters = this.getActiveFiltersList();
        const bar = document.getElementById('activeFiltersBar');
        const tagsContainer = document.getElementById('activeFilterTags');
        
        if (activeFilters.length === 0) {
            bar.style.display = 'none';
            return;
        }
        
        bar.style.display = 'flex';
        tagsContainer.innerHTML = activeFilters.map(filter => `
            <div class="active-filter-tag" data-filter-type="${filter.type}" data-filter-value="${filter.value}">
                ${filter.label}
                <span class="remove-filter">&times;</span>
            </div>
        `).join('');
        
        // Attach remove handlers
        tagsContainer.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.closest('.active-filter-tag');
                const type = tag.dataset.filterType;
                const value = tag.dataset.filterValue;
                this.removeFilter(type, value);
            });
        });
    }
    
    getActiveFiltersList() {
        const filters = [];
        
        // Regular filters
        Object.entries(this.filterState).forEach(([type, values]) => {
            if (Array.isArray(values) && type !== 'advanced') {
                values.forEach(value => {
                    filters.push({
                        type,
                        value,
                        label: this.getFilterLabel(type, value)
                    });
                });
            }
        });
        
        // Advanced filters
        Object.entries(this.filterState.advanced).forEach(([type, values]) => {
            values.forEach(value => {
                filters.push({
                    type: `advanced.${type}`,
                    value,
                    label: this.getFilterLabel(type, value)
                });
            });
        });
        
        return filters;
    }
    
    getFilterLabel(type, value) {
        // Convert filter values to readable labels
        const labelMaps = {
            categories: () => this.formatCategoryName(value),
            price: {
                'free': 'Free',
                'under-20': 'Under $20/mo',
                '20-50': '$20-50/mo',
                '50-100': '$50-100/mo',
                '100-plus': '$100+/mo',
                'enterprise': 'Enterprise',
                'unknown': 'Price Unknown'
            },
            learningCurve: {
                'easy': 'Easy Learning',
                'moderate': 'Moderate Learning',
                'steep': 'Steep Learning'
            }
        };
        
        if (typeof labelMaps[type] === 'function') {
            return labelMaps[type](value);
        } else if (labelMaps[type] && labelMaps[type][value]) {
            return labelMaps[type][value];
        }
        
        return value;
    }
    
    removeFilter(type, value) {
        if (type.startsWith('advanced.')) {
            const advancedType = type.split('.')[1];
            const index = this.filterState.advanced[advancedType].indexOf(value);
            if (index > -1) {
                this.filterState.advanced[advancedType].splice(index, 1);
            }
        } else {
            const index = this.filterState[type].indexOf(value);
            if (index > -1) {
                this.filterState[type].splice(index, 1);
            }
        }
        
        // Update UI
        const checkbox = document.querySelector(`input[name="${type}"][value="${value}"]`);
        if (checkbox) checkbox.checked = false;
        
        // Update quick filter chips
        if (type === 'features') {
            const chip = document.querySelector(`[data-filter-id="${value}"]`);
            if (chip) chip.classList.remove('active');
        }
        
        this.applyFilters();
    }
    
    clearAllFilters() {
        // Reset filter state
        this.filterState = {
            categories: [],
            source: [],
            features: [],
            price: [],
            advanced: {
                learningCurve: [],
                integrations: [],
                compliance: [],
                geographic: []
            }
        };
        
        // Clear all checkboxes
        document.querySelectorAll('.unified-filter-bar input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Clear quick filters
        document.querySelectorAll('.quick-filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        
        this.applyFilters();
    }
    
    applyFilters() {
        try {
            // Get filtered tools
            const filtered = this.getFilteredTools();
            
            // Update UI
            this.updateFilterCounts();
            this.updateActiveFiltersBar();
            this.updateURL();
            
            // Call the callback
            if (this.onFilterChange) {
                this.onFilterChange(filtered);
            }
            
            // Show notification
            if (window.showNotification) {
                const activeFilters = this.getActiveFilters();
                const filterCount = Object.values(activeFilters).flat().filter(v => v && v.length > 0).length;
                if (filterCount > 0) {
                    window.showNotification(`Showing ${filtered.length} tools (${filterCount} filters active)`, 'info');
                }
            }
        } catch (error) {
            console.error('Error in applyFilters:', error);
            console.error('Stack:', error.stack);
        }
    }
    
    getFilteredTools() {
        let filtered = [...this.tools];
        
        // Get search from header search input
        const headerSearchInput = document.getElementById('headerSearchInput');
        const searchQuery = headerSearchInput ? headerSearchInput.value : '';
        
        // Apply search filter if header has a value
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
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
                
                return searchWords.every(word => searchableText.includes(word));
            });
        }
        
        // Apply category filter
        if (this.filterState.categories.length > 0) {
            filtered = filtered.filter(tool => 
                this.filterState.categories.includes(tool.category)
            );
        }
        
        // Apply source filter
        if (this.filterState.source.length > 0) {
            filtered = filtered.filter(tool => {
                const toolSource = (tool.source || '').toLowerCase();
                return this.filterState.source.some(source => {
                    if (source === 'all-sources') return true;
                    return toolSource.includes(source.replace('-tools', '').replace('ai-tools-', ''));
                });
            });
        }
        
        // Apply feature filter
        if (this.filterState.features.length > 0) {
            filtered = filtered.filter(tool => {
                const searchText = `${tool.feature_breakdown || ''} ${tool.pricing_model || ''} ${tool.integration_potential || ''}`.toLowerCase();
                return this.filterState.features.some(feature => {
                    if (feature === 'free-tier') return searchText.includes('free');
                    if (feature === 'api-available') return searchText.includes('api');
                    if (feature === 'enterprise') return searchText.includes('enterprise');
                    if (feature === 'easy-integration') return searchText.includes('integration');
                    return false;
                });
            });
        }
        
        // Apply price filter
        if (this.filterState.price.length > 0) {
            filtered = filtered.filter(tool => {
                const priceInfo = this.parsePriceInfo(tool.pricing_model);
                return this.filterState.price.some(priceRange => {
                    if (priceRange === 'free' && priceInfo.isFree) return true;
                    if (priceRange === 'enterprise' && priceInfo.isEnterprise) return true;
                    if (priceRange === 'unknown' && priceInfo.isUnknown) return true;
                    
                    // Check price ranges
                    if (priceInfo.monthlyPrice !== null) {
                        if (priceRange === 'under-20' && priceInfo.monthlyPrice < 20) return true;
                        if (priceRange === '20-50' && priceInfo.monthlyPrice >= 20 && priceInfo.monthlyPrice <= 50) return true;
                        if (priceRange === '50-100' && priceInfo.monthlyPrice >= 50 && priceInfo.monthlyPrice <= 100) return true;
                        if (priceRange === '100-plus' && priceInfo.monthlyPrice > 100) return true;
                    }
                    return false;
                });
            });
        }
        
        // Apply advanced filters
        // Learning curve
        if (this.filterState.advanced.learningCurve.length > 0) {
            filtered = filtered.filter(tool => {
                const curve = this.parseLearningCurve(tool.learning_curve);
                return this.filterState.advanced.learningCurve.includes(curve);
            });
        }
        
        // Integrations
        if (this.filterState.advanced.integrations.length > 0) {
            filtered = filtered.filter(tool => {
                const integrations = this.parseIntegrations(tool);
                return this.filterState.advanced.integrations.some(req => integrations.includes(req));
            });
        }
        
        return filtered;
    }
    
    parsePriceInfo(priceText) {
        if (!priceText) return { isUnknown: true };
        
        const text = priceText.toLowerCase();
        const info = {
            isFree: false,
            isEnterprise: false,
            isUnknown: false,
            monthlyPrice: null
        };
        
        if (text.includes('free') && !text.includes('freemium')) {
            info.isFree = true;
        }
        
        if (text.includes('enterprise') || text.includes('custom') || text.includes('contact')) {
            info.isEnterprise = true;
        }
        
        // Extract numeric price
        const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
            info.monthlyPrice = parseFloat(priceMatch[1]);
        }
        
        if (!info.isFree && !info.isEnterprise && info.monthlyPrice === null) {
            info.isUnknown = true;
        }
        
        return info;
    }
    
    parseLearningCurve(curveText) {
        if (!curveText) return 'unknown';
        
        const text = curveText.toLowerCase();
        if (text.includes('easy') || text.includes('simple') || text.includes('beginner')) return 'easy';
        if (text.includes('moderate') || text.includes('medium')) return 'moderate';
        if (text.includes('steep') || text.includes('difficult') || text.includes('complex')) return 'steep';
        
        return 'unknown';
    }
    
    parseIntegrations(tool) {
        const integrations = [];
        const searchText = `${tool.integration_potential || ''} ${tool.feature_breakdown || ''}`.toLowerCase();
        
        if (searchText.includes('zapier')) integrations.push('zapier');
        if (searchText.includes('slack')) integrations.push('slack');
        if (searchText.includes('google') || searchText.includes('gmail')) integrations.push('google');
        if (searchText.includes('microsoft') || searchText.includes('office')) integrations.push('microsoft');
        
        return integrations;
    }
    
    syncWithURL() {
        const params = new URLSearchParams(window.location.search);
        
        // Sync filters (no search - that's handled by header)
        ['categories', 'source', 'features', 'price'].forEach(type => {
            if (params.has(type)) {
                this.filterState[type] = params.get(type).split(',');
            }
        });
        
        // Apply filters without updating URL again
        this.applyFilters();
    }
    
    updateURL() {
        const params = new URLSearchParams();
        
        // Get search from header if present
        const headerSearchInput = document.getElementById('headerSearchInput');
        if (headerSearchInput && headerSearchInput.value) {
            params.set('search', headerSearchInput.value);
        }
        
        // Add other filters
        ['categories', 'source', 'features', 'price'].forEach(type => {
            if (this.filterState[type].length > 0) {
                params.set(type, this.filterState[type].join(','));
            }
        });
        
        // Update URL without reload
        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    }
    
    // Expose current filter state for integration with header search
    getActiveFilters() {
        return {
            categories: this.filterState.categories,
            source: this.filterState.source,
            features: this.filterState.features,
            price: this.filterState.price,
            advanced: this.filterState.advanced,
            quickFilters: this.quickFilters.filter(qf => {
                const chip = document.querySelector(`[data-filter-id="${qf.id}"]`);
                return chip && chip.classList.contains('active');
            }).map(qf => qf.id)
        };
    }
}

// Export for use
window.UnifiedFilterBar = UnifiedFilterBar;