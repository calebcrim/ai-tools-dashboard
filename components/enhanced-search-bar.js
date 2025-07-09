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
        this.isClickingAutocomplete = false;
        
        this.init();
    }
    
    init() {
        this.render();
        // Ensure DOM is updated before attaching listeners
        setTimeout(() => {
            this.attachEventListeners();
        }, 0);
    }
    
    render() {
        // DISABLED: We're using the header search bar instead
        return;
    }
    
    attachEventListeners() {
        const input = document.getElementById('enhancedSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        
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
        input.addEventListener('blur', () => {
            // Delay hiding to allow click on autocomplete items
            setTimeout(() => {
                // Check if we clicked on an autocomplete item
                const activeElement = document.activeElement;
                const autocompleteContainer = document.getElementById('search-autocomplete');
                if (!autocompleteContainer?.contains(activeElement) && !this.isClickingAutocomplete) {
                    this.hideAutocomplete();
                }
            }, 250);
        });
        
        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    if (this.isAutocompleteOpen) {
                        e.preventDefault();
                        this.navigateAutocomplete(1);
                    }
                    break;
                case 'ArrowUp':
                    if (this.isAutocompleteOpen) {
                        e.preventDefault();
                        this.navigateAutocomplete(-1);
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    console.log('Enter key pressed, autocomplete open:', this.isAutocompleteOpen, 'selectedIndex:', this.selectedIndex);
                    if (this.isAutocompleteOpen && this.selectedIndex !== -1) {
                        this.selectAutocompleteItem();
                    } else {
                        // Perform search even if autocomplete is not open
                        this.performSearch();
                        this.hideAutocomplete();
                    }
                    break;
                case 'Escape':
                    if (this.isAutocompleteOpen) {
                        this.hideAutocomplete();
                    }
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
        
        // Event delegation for autocomplete clicks
        const autocompleteEl = document.getElementById('search-autocomplete');
        if (autocompleteEl) {
            console.log('Attaching mousedown listener to autocomplete');
            autocompleteEl.addEventListener('mousedown', (e) => {
                // Use mousedown instead of click to fire before blur
                const item = e.target.closest('.autocomplete-item');
                if (item) {
                    e.preventDefault(); // Prevent blur
                    this.isClickingAutocomplete = true;
                    const index = parseInt(item.dataset.index);
                    this.selectedIndex = index;
                    console.log('Autocomplete item clicked, index:', index);
                    this.selectAutocompleteItem();
                    // Reset flag after a delay
                    setTimeout(() => {
                        this.isClickingAutocomplete = false;
                    }, 300);
                }
            });
        } else {
            console.warn('Autocomplete element not found when attaching listeners');
            // Try again after a delay
            setTimeout(() => {
                const retryAutocomplete = document.getElementById('search-autocomplete');
                if (retryAutocomplete && !retryAutocomplete.hasAttribute('data-listeners-attached')) {
                    retryAutocomplete.setAttribute('data-listeners-attached', 'true');
                    console.log('Attaching mousedown listener to autocomplete (retry)');
                    retryAutocomplete.addEventListener('mousedown', (e) => {
                        const item = e.target.closest('.autocomplete-item');
                        if (item) {
                            e.preventDefault();
                            this.isClickingAutocomplete = true;
                            const index = parseInt(item.dataset.index);
                            this.selectedIndex = index;
                            console.log('Autocomplete item clicked (retry), index:', index);
                            this.selectAutocompleteItem();
                            setTimeout(() => {
                                this.isClickingAutocomplete = false;
                            }, 300);
                        }
                    });
                }
            }, 100);
        }
    }
    
    performSearch() {
        console.log('performSearch called with term:', this.searchTerm);
        
        // Save to history if not empty
        if (this.searchTerm.trim()) {
            this.addToSearchHistory(this.searchTerm.trim());
        }
        
        // Filter tools
        let filtered = [...this.tools];
        
        // If search term is empty, show all tools
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            // Call the callback with all tools
            if (this.onSearchChange) {
                this.onSearchChange(filtered);
            }
            return;
        }
        
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            
            // Check if this is a category search
            if (searchLower.startsWith('category:')) {
                const categorySearch = searchLower.substring(9).trim(); // Remove 'category:' prefix
                filtered = filtered.filter(tool => {
                    const toolCategory = (tool.category || '').toLowerCase();
                    return toolCategory.includes(categorySearch);
                });
            } else {
                // Regular search
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
            }
            
            // Sort by relevance
            filtered.sort((a, b) => {
                const aNameMatch = (a.tool_name || '').toLowerCase().includes(searchLower);
                const bNameMatch = (b.tool_name || '').toLowerCase().includes(searchLower);
                
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                return 0;
            });
        }
        
        console.log('Filtered results:', filtered.length, 'items');
        
        // Call the callback with filtered results
        if (this.onSearchChange) {
            console.log('Calling onSearchChange callback');
            this.onSearchChange(filtered);
        } else {
            console.error('onSearchChange callback is not set!');
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
        console.log('selectAutocompleteItem called, selectedIndex:', this.selectedIndex);
        
        if (this.selectedIndex === -1 || !this.autocompleteResults[this.selectedIndex]) {
            // If no item is selected but we have a search term, perform search
            if (this.searchTerm.trim()) {
                console.log('No item selected, performing search with current term');
                this.performSearch();
                this.hideAutocomplete();
            }
            return;
        }
        
        const selected = this.autocompleteResults[this.selectedIndex];
        console.log('Selected item:', selected);
        
        const input = document.getElementById('enhancedSearchInput');
        
        this.searchTerm = selected.value;
        input.value = selected.value;
        
        console.log('Updated search term to:', this.searchTerm);
        
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
            
            // Always position below the input
            autocomplete.style.top = '100%';
            autocomplete.style.bottom = 'auto';
            autocomplete.style.marginTop = '4px';
            autocomplete.style.marginBottom = '0';
            
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