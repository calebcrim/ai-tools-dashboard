// Category Grid Modal Component
// Provides a comprehensive overview of all categories in a grid layout

class CategoryGridModal {
    constructor(toolsData, selectedCategories = new Set()) {
        this.toolsData = toolsData;
        this.selectedCategories = new Set(selectedCategories);
        this.searchTerm = '';
        this.categoryCounts = getCategoryCounts(toolsData);
        this.onCategorySelect = null; // Callback function
    }

    show() {
        this.createModal();
        this.attachEventListeners();
        document.body.classList.add('modal-open');
    }

    hide() {
        const modal = document.getElementById('categoryGridModal');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
        }
    }

    createModal() {
        const modalHTML = `
            <div class="category-modal-overlay" id="categoryGridModal">
                <div class="category-modal">
                    <div class="modal-header">
                        <h2>All Categories</h2>
                        <div class="modal-search">
                            <i class="fas fa-search"></i>
                            <input type="search"
                                   id="modalCategorySearch"
                                   placeholder="Search categories..."
                                   class="modal-search-input">
                        </div>
                        <button class="modal-close" id="closeCategoryModal">✕</button>
                    </div>

                    <div class="modal-tabs">
                        <button class="tab-btn active" data-view="grid">
                            <i class="fas fa-th"></i> Grid View
                        </button>
                        <button class="tab-btn" data-view="hierarchy">
                            <i class="fas fa-sitemap"></i> Hierarchy View
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="view-container active" id="gridView">
                            ${this.renderGridView()}
                        </div>
                        <div class="view-container" id="hierarchyView">
                            ${this.renderHierarchyView()}
                        </div>
                    </div>

                    <div class="modal-footer">
                        <div class="selection-info">
                            <span class="selected-count">${this.selectedCategories.size} categories selected</span>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-secondary" id="clearAllCategories">Clear All</button>
                            <button class="btn-primary" id="applyCategories">Apply Filters</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    renderGridView() {
        const metaCounts = getMetaCategoryCounts(this.toolsData);
        const cards = [];

        for (const [metaCategory, data] of Object.entries(categoryHierarchy)) {
            const count = metaCounts[metaCategory];
            const selectedInGroup = data.categories.filter(cat => this.selectedCategories.has(cat)).length;

            cards.push(`
                <div class="category-card" data-meta="${metaCategory}">
                    <div class="card-header">
                        <span class="card-icon" style="color: ${data.color}">${data.icon}</span>
                        <h3>${metaCategory}</h3>
                        ${selectedInGroup > 0 ? `<span class="selected-badge">${selectedInGroup}</span>` : ''}
                    </div>
                    <div class="card-stats">
                        <span class="tool-count">${count} tools</span>
                    </div>
                    <div class="card-categories">
                        ${this.renderCardCategories(data.categories)}
                    </div>
                    <div class="card-actions">
                        <button class="select-all-btn" data-meta="${metaCategory}">
                            Select All
                        </button>
                    </div>
                </div>
            `);
        }

        return `<div class="category-grid">${cards.join('')}</div>`;
    }

    renderCardCategories(categories) {
        const sorted = [...categories].sort((a, b) => {
            const countA = this.categoryCounts[a] || 0;
            const countB = this.categoryCounts[b] || 0;
            return countB - countA;
        });

        return sorted.slice(0, 5).map(cat => {
            const count = this.categoryCounts[cat] || 0;
            const isSelected = this.selectedCategories.has(cat);

            return `
                <div class="card-category ${isSelected ? 'selected' : ''}" data-category="${cat}">
                    <input type="checkbox"
                           class="category-check"
                           data-category="${cat}"
                           ${isSelected ? 'checked' : ''}>
                    <span class="cat-name">${cat}</span>
                    <span class="cat-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    renderHierarchyView() {
        const tree = [];

        for (const [metaCategory, data] of Object.entries(categoryHierarchy)) {
            const count = metaCounts[metaCategory];
            tree.push(`
                <div class="hierarchy-group">
                    <div class="hierarchy-header">
                        <span class="hierarchy-icon" style="color: ${data.color}">${data.icon}</span>
                        <span class="hierarchy-title">${metaCategory}</span>
                        <span class="hierarchy-count">${count}</span>
                    </div>
                    <div class="hierarchy-children">
                        ${this.renderHierarchyCategories(data.categories)}
                    </div>
                </div>
            `);
        }

        return `<div class="hierarchy-tree">${tree.join('')}</div>`;
    }

    renderHierarchyCategories(categories) {
        return categories.map(cat => {
            const count = this.categoryCounts[cat] || 0;
            const isSelected = this.selectedCategories.has(cat);

            return `
                <div class="hierarchy-item ${isSelected ? 'selected' : ''}" data-category="${cat}">
                    <input type="checkbox"
                           class="category-check"
                           data-category="${cat}"
                           ${isSelected ? 'checked' : ''}>
                    <span class="item-name">${cat}</span>
                    <span class="item-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    attachEventListeners() {
        // Close modal
        document.getElementById('closeCategoryModal')?.addEventListener('click', () => {
            this.hide();
        });

        // Click outside to close
        document.getElementById('categoryGridModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'categoryGridModal') {
                this.hide();
            }
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Category selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-check')) {
                const category = e.target.dataset.category;
                this.toggleCategory(category);
            }
        });

        // Select all in group
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-all-btn')) {
                const metaCategory = e.target.dataset.meta;
                this.selectAllInGroup(metaCategory);
            }
        });

        // Clear all
        document.getElementById('clearAllCategories')?.addEventListener('click', () => {
            this.clearAll();
        });

        // Apply filters
        document.getElementById('applyCategories')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Search
        document.getElementById('modalCategorySearch')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.filterCategories();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    switchView(view) {
        // Update tab states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update view containers
        document.querySelectorAll('.view-container').forEach(container => {
            const isActive = container.id === `${view}View`;
            container.classList.toggle('active', isActive);
        });
    }

    toggleCategory(category) {
        if (this.selectedCategories.has(category)) {
            this.selectedCategories.delete(category);
        } else {
            this.selectedCategories.add(category);
        }

        this.updateSelectionDisplay();

        // Notify parent component
        if (this.onCategorySelect) {
            this.onCategorySelect(category);
        }
    }

    selectAllInGroup(metaCategory) {
        const categories = categoryHierarchy[metaCategory]?.categories || [];
        const allSelected = categories.every(cat => this.selectedCategories.has(cat));

        categories.forEach(cat => {
            if (allSelected) {
                this.selectedCategories.delete(cat);
            } else {
                this.selectedCategories.add(cat);
            }
        });

        this.updateModalContent();
        this.updateSelectionDisplay();
    }

    clearAll() {
        this.selectedCategories.clear();
        this.updateModalContent();
        this.updateSelectionDisplay();
    }

    applyFilters() {
        // Apply the selected categories to the main filter panel
        if (window.progressiveFilterPanel) {
            window.progressiveFilterPanel.selectedCategories = new Set(this.selectedCategories);
            window.progressiveFilterPanel.onCategoryChange();
            window.progressiveFilterPanel.updateCategoryDisplay();
            window.progressiveFilterPanel.updatePillDisplay();
        }

        this.hide();
    }

    filterCategories() {
        const term = this.searchTerm.toLowerCase();

        if (!term) {
            // Show all categories
            document.querySelectorAll('.category-card, .hierarchy-group').forEach(el => {
                el.style.display = '';
            });
            document.querySelectorAll('.card-category, .hierarchy-item').forEach(el => {
                el.style.display = '';
            });
        } else {
            // Filter categories
            document.querySelectorAll('.card-category, .hierarchy-item').forEach(el => {
                const category = el.dataset.category;
                const matches = category.toLowerCase().includes(term);
                el.style.display = matches ? '' : 'none';
            });

            // Hide empty groups
            document.querySelectorAll('.category-card, .hierarchy-group').forEach(card => {
                const hasVisible = card.querySelectorAll('.card-category:not([style*="display: none"]), .hierarchy-item:not([style*="display: none"])').length > 0;
                card.style.display = hasVisible ? '' : 'none';
            });
        }
    }

    updateSelectionDisplay() {
        const count = this.selectedCategories.size;
        const countEl = document.querySelector('.selected-count');
        if (countEl) {
            countEl.textContent = `${count} categories selected`;
        }

        // Update checkboxes
        document.querySelectorAll('.category-check').forEach(checkbox => {
            const category = checkbox.dataset.category;
            checkbox.checked = this.selectedCategories.has(category);
            checkbox.closest('.card-category, .hierarchy-item')?.classList.toggle('selected', checkbox.checked);
        });

        // Update badges
        document.querySelectorAll('.category-card').forEach(card => {
            const meta = card.dataset.meta;
            const categories = categoryHierarchy[meta]?.categories || [];
            const selectedCount = categories.filter(cat => this.selectedCategories.has(cat)).length;

            let badge = card.querySelector('.selected-badge');
            if (selectedCount > 0) {
                if (!badge) {
                    card.querySelector('.card-header').insertAdjacentHTML('beforeend',
                        `<span class="selected-badge">${selectedCount}</span>`
                    );
                } else {
                    badge.textContent = selectedCount;
                }
            } else if (badge) {
                badge.remove();
            }
        });
    }

    updateModalContent() {
        const gridView = document.getElementById('gridView');
        const hierarchyView = document.getElementById('hierarchyView');

        if (gridView) {
            gridView.innerHTML = this.renderGridView();
        }
        if (hierarchyView) {
            hierarchyView.innerHTML = this.renderHierarchyView();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryGridModal;
}