// Progressive Filter Panel Component
// Implements two-tier category system with search and visual enhancements

class ProgressiveFilterPanel {
    constructor() {
        this.expandedGroups = new Set();
        this.selectedCategories = new Set();
        this.searchTerm = '';
        this.isCollapsed = false;
        this.sortMode = 'alphabetical'; // alphabetical, popularity, recent
        this.toolsData = [];
        this.categoryCounts = {};
        this.trendingCategories = [];

        // Load saved preferences
        this.loadPreferences();
    }

    init(toolsData) {
        this.toolsData = toolsData;
        this.categoryCounts = getCategoryCounts(toolsData);
        this.identifyTrendingCategories();
        this.render();
        this.attachEventListeners();
    }

    loadPreferences() {
        const saved = localStorage.getItem('filterPanelPrefs');
        if (saved) {
            const prefs = JSON.parse(saved);
            this.expandedGroups = new Set(prefs.expandedGroups || []);
            this.isCollapsed = prefs.isCollapsed || false;
            this.sortMode = prefs.sortMode || 'alphabetical';
        }
    }

    savePreferences() {
        localStorage.setItem('filterPanelPrefs', JSON.stringify({
            expandedGroups: Array.from(this.expandedGroups),
            isCollapsed: this.isCollapsed,
            sortMode: this.sortMode
        }));
    }

    identifyTrendingCategories() {
        // Get top 5 categories by tool count
        const sorted = Object.entries(this.categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        this.trendingCategories = sorted.map(([cat]) => cat);
    }

    render() {
        const container = document.getElementById('filterContent');
        if (!container) return;

        // Clear any existing progressive filters to avoid duplication
        const existingProgressive = container.querySelector('.progressive-filter-container');
        if (existingProgressive) {
            existingProgressive.remove();
        }

        // Add the enhanced filter structure
        const filterHTML = `
            <div class="progressive-filter-container ${this.isCollapsed ? 'collapsed' : ''}">
                <!-- Category Quick Search -->
                <div class="category-search-wrapper">
                    <div class="category-search">
                        <i class="fas fa-search"></i>
                        <input
                            type="text"
                            id="categorySearchInput"
                            placeholder="Filter categories..."
                            class="category-filter-input"
                            value="${this.searchTerm}"
                        />
                        ${this.searchTerm ? '<button class="clear-search" id="clearCategorySearch">✕</button>' : ''}
                    </div>
                </div>

                <!-- Trending Categories Pills -->
                <div class="quick-categories">
                    <div class="section-label">🔥 Trending</div>
                    <div class="category-pills" id="trendingPills">
                        ${this.renderTrendingPills()}
                    </div>
                </div>

                <!-- Sort Options -->
                <div class="sort-options">
                    <button class="sort-btn ${this.sortMode === 'alphabetical' ? 'active' : ''}" data-sort="alphabetical">
                        <i class="fas fa-sort-alpha-down"></i> A-Z
                    </button>
                    <button class="sort-btn ${this.sortMode === 'popularity' ? 'active' : ''}" data-sort="popularity">
                        <i class="fas fa-fire"></i> Popular
                    </button>
                    <button class="sort-btn ${this.sortMode === 'recent' ? 'active' : ''}" data-sort="recent">
                        <i class="fas fa-clock"></i> Recent
                    </button>
                </div>

                <!-- Progressive Category List -->
                <div class="progressive-categories" id="progressiveCategories">
                    ${this.renderCategoryGroups()}
                </div>

                <!-- View All Categories Button -->
                <button class="view-all-categories-btn" id="viewAllCategoriesBtn">
                    <i class="fas fa-th"></i> View All Categories
                </button>
            </div>

            <!-- Floating Filter Button (shown when collapsed) -->
            ${this.isCollapsed ? this.renderFloatingButton() : ''}
        `;

        // Insert the progressive filter panel at the beginning
        const wrapper = document.createElement('div');
        wrapper.innerHTML = filterHTML;
        const progressivePanel = wrapper.firstElementChild;

        // Insert at the beginning of the container
        if (container.firstChild) {
            container.insertBefore(progressivePanel, container.firstChild);
        } else {
            container.appendChild(progressivePanel);
        }
    }

    renderTrendingPills() {
        return this.trendingCategories.map(cat => `
            <button class="pill ${this.selectedCategories.has(cat) ? 'active' : ''}" data-category="${cat}">
                ${cat} <span class="pill-count">${this.categoryCounts[cat]}</span>
            </button>
        `).join('') + '<button class="pill more-btn" id="moreCategoriesBtn">+ More</button>';
    }

    renderCategoryGroups() {
        const metaCounts = getMetaCategoryCounts(this.toolsData);
        const groups = [];

        // Sort meta-categories based on sort mode
        let sortedMetaCategories = Object.entries(categoryHierarchy);
        if (this.sortMode === 'popularity') {
            sortedMetaCategories.sort((a, b) => metaCounts[b[0]] - metaCounts[a[0]]);
        }

        for (const [metaCategory, data] of sortedMetaCategories) {
            const isExpanded = this.expandedGroups.has(metaCategory);
            const count = metaCounts[metaCategory];

            // Filter categories if search term exists
            let filteredCategories = data.categories;
            if (this.searchTerm) {
                filteredCategories = data.categories.filter(cat =>
                    cat.toLowerCase().includes(this.searchTerm.toLowerCase())
                );
                if (filteredCategories.length === 0) continue;
            }

            groups.push(`
                <div class="category-group" data-meta="${metaCategory}">
                    <div class="category-group-header ${isExpanded ? 'expanded' : ''}" data-meta="${metaCategory}">
                        <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
                        <span class="category-group-icon">${data.icon}</span>
                        <span class="category-group-name">${metaCategory}</span>
                        <span class="category-group-count">${count}</span>
                    </div>
                    <div class="category-children ${isExpanded ? 'expanded' : ''}">
                        ${this.renderCategoryChildren(filteredCategories)}
                    </div>
                </div>
            `);
        }

        return groups.join('');
    }

    renderCategoryChildren(categories) {
        // Sort categories within group
        let sorted = [...categories];
        if (this.sortMode === 'popularity') {
            sorted.sort((a, b) => (this.categoryCounts[b] || 0) - (this.categoryCounts[a] || 0));
        } else {
            sorted.sort();
        }

        return sorted.map(cat => {
            const count = this.categoryCounts[cat] || 0;
            const isSelected = this.selectedCategories.has(cat);
            const isPopular = this.trendingCategories.includes(cat);

            return `
                <div class="category-item ${isSelected ? 'selected' : ''} ${isPopular ? 'popular' : ''}" data-category="${cat}">
                    <input type="checkbox"
                           class="category-checkbox"
                           data-category="${cat}"
                           ${isSelected ? 'checked' : ''}>
                    ${isPopular ? '<span class="trending-badge">🔥</span>' : ''}
                    <span class="category-name">${cat}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    renderFloatingButton() {
        const activeCount = this.selectedCategories.size;
        return `
            <button class="floating-filter-btn" id="floatingFilterBtn" aria-label="Show filters">
                <i class="fas fa-filter"></i>
                ${activeCount > 0 ? `<span class="active-filter-count">${activeCount}</span>` : ''}
            </button>
        `;
    }

    attachEventListeners() {
        // Category search
        const searchInput = document.getElementById('categorySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.updateCategoryDisplay();
            });
        }

        // Clear search
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clearCategorySearch') {
                this.searchTerm = '';
                this.updateCategoryDisplay();
            }
        });

        // Group expand/collapse
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-group-header')) {
                const meta = e.target.closest('.category-group-header').dataset.meta;
                this.toggleGroup(meta);
            }
        });

        // Category selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-checkbox')) {
                const category = e.target.dataset.category;
                this.toggleCategory(category);
            }
        });

        // Trending pills
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill') && e.target.dataset.category) {
                this.toggleCategory(e.target.dataset.category);
                this.updatePillDisplay();
            }
        });

        // Sort buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sort-btn')) {
                const sortMode = e.target.closest('.sort-btn').dataset.sort;
                this.setSortMode(sortMode);
            }
        });

        // View all categories modal
        const viewAllBtn = document.getElementById('viewAllCategoriesBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        // More categories button
        const moreBtn = document.getElementById('moreCategoriesBtn');
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        // Floating filter button
        const floatingBtn = document.getElementById('floatingFilterBtn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }
    }

    toggleGroup(metaCategory) {
        if (this.expandedGroups.has(metaCategory)) {
            this.expandedGroups.delete(metaCategory);
        } else {
            this.expandedGroups.add(metaCategory);
        }
        this.savePreferences();
        this.updateGroupDisplay(metaCategory);
    }

    toggleCategory(category) {
        if (this.selectedCategories.has(category)) {
            this.selectedCategories.delete(category);
        } else {
            this.selectedCategories.add(category);
        }
        this.onCategoryChange();
    }

    setSortMode(mode) {
        this.sortMode = mode;
        this.savePreferences();
        this.updateCategoryDisplay();

        // Update button states
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === mode);
        });
    }

    togglePanel() {
        this.isCollapsed = !this.isCollapsed;
        this.savePreferences();

        const container = document.querySelector('.progressive-filter-container');
        if (container) {
            container.classList.toggle('collapsed', this.isCollapsed);
        }

        // Update floating button visibility
        this.updateFloatingButton();
    }

    updateGroupDisplay(metaCategory) {
        const group = document.querySelector(`.category-group[data-meta="${metaCategory}"]`);
        if (!group) return;

        const header = group.querySelector('.category-group-header');
        const children = group.querySelector('.category-children');
        const icon = header.querySelector('.expand-icon');

        const isExpanded = this.expandedGroups.has(metaCategory);
        header.classList.toggle('expanded', isExpanded);
        children.classList.toggle('expanded', isExpanded);
        icon.textContent = isExpanded ? '▼' : '▶';
    }

    updateCategoryDisplay() {
        const container = document.getElementById('progressiveCategories');
        if (container) {
            container.innerHTML = this.renderCategoryGroups();
        }
    }

    updatePillDisplay() {
        const container = document.getElementById('trendingPills');
        if (container) {
            container.innerHTML = this.renderTrendingPills();
        }
    }

    updateFloatingButton() {
        let floatingBtn = document.getElementById('floatingFilterBtn');

        if (this.isCollapsed && !floatingBtn) {
            const btnHTML = this.renderFloatingButton();
            document.body.insertAdjacentHTML('beforeend', btnHTML);
        } else if (!this.isCollapsed && floatingBtn) {
            floatingBtn.remove();
        } else if (floatingBtn) {
            // Update count
            const countEl = floatingBtn.querySelector('.active-filter-count');
            const count = this.selectedCategories.size;
            if (count > 0) {
                if (countEl) {
                    countEl.textContent = count;
                } else {
                    floatingBtn.innerHTML += `<span class="active-filter-count">${count}</span>`;
                }
            } else if (countEl) {
                countEl.remove();
            }
        }
    }

    showCategoryModal() {
        // Create and show the category grid modal
        const modal = new CategoryGridModal(this.toolsData, this.selectedCategories);
        modal.show();
        modal.onCategorySelect = (category) => {
            this.toggleCategory(category);
            this.updateCategoryDisplay();
            this.updatePillDisplay();
        };
    }

    onCategoryChange() {
        // Trigger filter update in main dashboard
        if (window.unifiedDashboard) {
            window.unifiedDashboard.filters.category = Array.from(this.selectedCategories);
            window.unifiedDashboard.applyFilters();
        }

        this.updateFloatingButton();
    }

    getSelectedCategories() {
        return Array.from(this.selectedCategories);
    }

    clearAll() {
        this.selectedCategories.clear();
        this.searchTerm = '';
        this.updateCategoryDisplay();
        this.updatePillDisplay();
        this.onCategoryChange();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.progressiveFilterPanel = new ProgressiveFilterPanel();
});