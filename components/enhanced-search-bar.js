/**
 * Enhanced Search Bar Component
 * Features: Focus retention, clear button, live filtering, autocomplete
 */

class EnhancedSearchBar {
    constructor(tools, onSearchChange) {
        this.tools = tools;
        this.onSearchChange = onSearchChange;
        this.searchTerm = '';
        this.searchHistory = this.loadSearchHistory();
        this.autocompleteResults = [];
        this.selectedIndex = -1;
        this.isAutocompleteOpen = false;
        this.debounceTimer = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        // Check if search bar already exists to prevent re-rendering
        let searchBar = document.querySelector('.enhanced-search-bar');
        if (!searchBar) {
            searchBar = document.createElement('div');
            searchBar.className = 'enhanced-search-bar';
            
            // Find the compressed filter bar or create a container
            const filterBar = document.querySelector('.compressed-filter-bar');
            if (filterBar) {
                const searchContainer = filterBar.querySelector('.filter-search');
                if (searchContainer) {
                    searchContainer.replaceWith(searchBar);
                } else {
                    filterBar.querySelector('.filter-bar-content').prepend(searchBar);
                }
            } else {
                // Fallback: Add to the main search area
                const originalSearchBar = document.querySelector('.search-bar');
                if (originalSearchBar) {
                    originalSearchBar.replaceWith(searchBar);
                }
            }
        }
        
        searchBar.innerHTML = `
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" 
                       class="search-input enhanced" 
                       placeholder="Search tools by name, feature, or use case..." 
                       id="enhancedSearchInput"
                       value="${this.searchTerm}"
                       autocomplete="off"
                       role="combobox"
                       aria-expanded="false"
                       aria-autocomplete="list"
                       aria-controls="search-autocomplete"
                       aria-haspopup="listbox">
                <button class="search-clear-btn ${this.searchTerm ? 'visible' : ''}" 
                        id="searchClearBtn"
                        aria-label="Clear search">
                    <i class="fas fa-times"></i>
                </button>
                <div class="search-autocomplete" 
                     id="search-autocomplete"
                     role="listbox"
                     aria-label="Search suggestions">
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const input = document.getElementById('enhancedSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        const autocomplete = document.getElementById('search-autocomplete');
        
        if (!input) return;
        
        // Input event with debouncing
        input.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.updateClearButtonVisibility();
            
            // Debounce the search
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch();
                this.updateAutocomplete();
            }, 300);
        });
        
        // Focus event
        input.addEventListener('focus', () => {
            if (this.searchTerm.length > 0) {
                this.updateAutocomplete();
            }
        });
        
        // Blur event
        input.addEventListener('blur', (e) => {
            // Delay hiding to allow click on autocomplete items
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.search-autocomplete')) {
                    this.hideAutocomplete();
                }
            }, 200);
        });
        
        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (!this.isAutocompleteOpen) return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateAutocomplete(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateAutocomplete(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.selectAutocompleteItem();
                    break;
                case 'Escape':
                    this.hideAutocomplete();
                    break;
            }
        });
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
                input.focus();
            });
        }
        
        // Prevent form submission if within a form
        const form = input.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
    }
    
    performSearch() {
        // Save to history if not empty
        if (this.searchTerm.trim()) {
            this.addToSearchHistory(this.searchTerm.trim());
        }
        
        // Filter tools
        let filtered = [...this.tools];
        
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
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
        
        // Call the callback with filtered results
        if (this.onSearchChange) {
            this.onSearchChange(filtered);
        }
    }
    
    updateAutocomplete() {
        if (!this.searchTerm) {
            this.hideAutocomplete();
            return;
        }
        
        const searchLower = this.searchTerm.toLowerCase();
        
        // Combine suggestions from history and tool names
        const suggestions = [];
        
        // Add matching search history
        const historySuggestions = this.searchHistory
            .filter(term => term.toLowerCase().includes(searchLower) && term !== this.searchTerm)
            .slice(0, 3)
            .map(term => ({
                type: 'history',
                value: term,
                label: term,
                icon: 'fas fa-history'
            }));
        
        suggestions.push(...historySuggestions);
        
        // Add matching tool names
        const toolSuggestions = this.tools
            .filter(tool => 
                tool.tool_name && 
                tool.tool_name.toLowerCase().includes(searchLower) &&
                !tool.tool_name.toLowerCase().startsWith(searchLower) // Don't duplicate exact matches
            )
            .slice(0, 5 - suggestions.length)
            .map(tool => ({
                type: 'tool',
                value: tool.tool_name,
                label: tool.tool_name,
                icon: 'fas fa-robot',
                category: tool.category
            }));
        
        suggestions.push(...toolSuggestions);
        
        // Add category suggestions
        if (suggestions.length < 5) {
            const categories = [...new Set(this.tools.map(t => t.category))]
                .filter(cat => cat && cat.toLowerCase().includes(searchLower))
                .slice(0, 5 - suggestions.length)
                .map(cat => ({
                    type: 'category',
                    value: `category:${cat}`,
                    label: `in ${this.formatCategoryName(cat)}`,
                    icon: 'fas fa-folder'
                }));
            
            suggestions.push(...categories);
        }
        
        this.autocompleteResults = suggestions;
        this.selectedIndex = -1;
        this.renderAutocomplete();
    }
    
    renderAutocomplete() {
        const autocomplete = document.getElementById('search-autocomplete');
        if (!autocomplete) return;
        
        if (this.autocompleteResults.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        autocomplete.innerHTML = this.autocompleteResults.map((item, index) => `
            <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}"
                 data-index="${index}"
                 role="option"
                 aria-selected="${index === this.selectedIndex}">
                <i class="${item.icon} autocomplete-icon"></i>
                <span class="autocomplete-text">${this.highlightMatch(item.label)}</span>
                ${item.category ? `<span class="autocomplete-category">${item.category}</span>` : ''}
            </div>
        `).join('');
        
        // Add click handlers
        autocomplete.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectedIndex = index;
                this.selectAutocompleteItem();
            });
        });
        
        this.showAutocomplete();
    }
    
    highlightMatch(text) {
        const searchLower = this.searchTerm.toLowerCase();
        const textLower = text.toLowerCase();
        const index = textLower.indexOf(searchLower);
        
        if (index === -1) return text;
        
        return text.substring(0, index) + 
               `<strong>${text.substring(index, index + this.searchTerm.length)}</strong>` + 
               text.substring(index + this.searchTerm.length);
    }
    
    navigateAutocomplete(direction) {
        const maxIndex = this.autocompleteResults.length - 1;
        
        if (direction === 1) {
            this.selectedIndex = this.selectedIndex < maxIndex ? this.selectedIndex + 1 : 0;
        } else {
            this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : maxIndex;
        }
        
        this.renderAutocomplete();
    }
    
    selectAutocompleteItem() {
        if (this.selectedIndex === -1 || !this.autocompleteResults[this.selectedIndex]) {
            return;
        }
        
        const selected = this.autocompleteResults[this.selectedIndex];
        const input = document.getElementById('enhancedSearchInput');
        
        this.searchTerm = selected.value;
        input.value = selected.value;
        
        this.hideAutocomplete();
        this.performSearch();
        input.focus();
    }
    
    showAutocomplete() {
        const autocomplete = document.getElementById('search-autocomplete');
        const input = document.getElementById('enhancedSearchInput');
        
        if (autocomplete && input) {
            autocomplete.classList.add('visible');
            input.setAttribute('aria-expanded', 'true');
            this.isAutocompleteOpen = true;
            
            // Force z-index to ensure visibility
            autocomplete.style.zIndex = '99999';
            
            // Check if we need to adjust position
            const inputRect = input.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If close to bottom, show above instead
            if (inputRect.bottom + 300 > viewportHeight) {
                autocomplete.style.bottom = '100%';
                autocomplete.style.top = 'auto';
                autocomplete.style.marginBottom = '4px';
            }
            
            // Ensure parent containers don't clip
            let parent = autocomplete.parentElement;
            while (parent && parent !== document.body) {
                const style = window.getComputedStyle(parent);
                if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
                    parent.style.overflow = 'visible';
                }
                parent = parent.parentElement;
            }
        }
    }
    
    hideAutocomplete() {
        const autocomplete = document.getElementById('search-autocomplete');
        const input = document.getElementById('enhancedSearchInput');
        
        if (autocomplete && input) {
            autocomplete.classList.remove('visible');
            input.setAttribute('aria-expanded', 'false');
            this.isAutocompleteOpen = false;
        }
    }
    
    clearSearch() {
        this.searchTerm = '';
        const input = document.getElementById('enhancedSearchInput');
        if (input) {
            input.value = '';
        }
        
        this.updateClearButtonVisibility();
        this.hideAutocomplete();
        this.performSearch();
    }
    
    updateClearButtonVisibility() {
        const clearBtn = document.getElementById('searchClearBtn');
        if (clearBtn) {
            if (this.searchTerm) {
                clearBtn.classList.add('visible');
            } else {
                clearBtn.classList.remove('visible');
            }
        }
    }
    
    formatCategoryName(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Search history management
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) : [];
        } catch {
            return [];
        }
    }
    
    addToSearchHistory(term) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(t => t !== term);
        
        // Add to beginning
        this.searchHistory.unshift(term);
        
        // Keep only last 10
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch {
            // Ignore localStorage errors
        }
    }
}

// Export for use
window.EnhancedSearchBar = EnhancedSearchBar;