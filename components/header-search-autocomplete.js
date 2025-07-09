/**
 * Header Search Autocomplete
 * Adds autocomplete functionality to the header search bar
 */

class HeaderSearchAutocomplete {
    constructor(tools) {
        this.tools = tools;
        this.searchHistory = this.loadSearchHistory();
        this.autocompleteResults = [];
        this.selectedIndex = -1;
        this.isAutocompleteOpen = false;
        this.debounceTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupAutocomplete();
        this.attachEventListeners();
    }
    
    setupAutocomplete() {
        const headerSearchInput = document.getElementById('headerSearchInput');
        if (!headerSearchInput) return;
        
        // Create autocomplete container
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'header-search-autocomplete';
        autocompleteContainer.id = 'header-search-autocomplete';
        autocompleteContainer.setAttribute('role', 'listbox');
        autocompleteContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            margin-top: 4px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
            box-shadow: var(--shadow-lg);
        `;
        
        // Insert after the search input's parent
        const searchBarContainer = headerSearchInput.parentElement;
        searchBarContainer.style.position = 'relative';
        searchBarContainer.appendChild(autocompleteContainer);
    }
    
    attachEventListeners() {
        const input = document.getElementById('headerSearchInput');
        if (!input) return;
        
        // Input event
        input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updateAutocomplete(e.target.value);
            }, 200);
        });
        
        // Focus event
        input.addEventListener('focus', () => {
            if (input.value.length > 0) {
                this.updateAutocomplete(input.value);
            }
        });
        
        // Blur event
        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideAutocomplete();
            }, 200);
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
                    if (this.isAutocompleteOpen && this.selectedIndex !== -1) {
                        e.preventDefault();
                        this.selectAutocompleteItem();
                    }
                    break;
                case 'Escape':
                    if (this.isAutocompleteOpen) {
                        this.hideAutocomplete();
                    }
                    break;
            }
        });
        
        // Click on autocomplete items
        const autocompleteEl = document.getElementById('header-search-autocomplete');
        if (autocompleteEl) {
            autocompleteEl.addEventListener('mousedown', (e) => {
                const item = e.target.closest('.autocomplete-item');
                if (item) {
                    e.preventDefault();
                    const index = parseInt(item.dataset.index);
                    this.selectedIndex = index;
                    this.selectAutocompleteItem();
                }
            });
        }
    }
    
    updateAutocomplete(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            this.hideAutocomplete();
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        const suggestions = [];
        
        // Add matching search history
        const historySuggestions = this.searchHistory
            .filter(term => term.toLowerCase().includes(searchLower) && term !== searchTerm)
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
                tool.tool_name.toLowerCase().includes(searchLower)
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
        const autocomplete = document.getElementById('header-search-autocomplete');
        if (!autocomplete) return;
        
        if (this.autocompleteResults.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        autocomplete.innerHTML = this.autocompleteResults.map((item, index) => `
            <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}"
                 data-index="${index}"
                 role="option"
                 aria-selected="${index === this.selectedIndex}"
                 style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; ${index === this.selectedIndex ? 'background: var(--bg-hover);' : ''}">
                <i class="${item.icon}" style="color: var(--text-muted); font-size: 14px;"></i>
                <span style="flex: 1;">${this.highlightMatch(item.label, this.getCurrentSearchTerm())}</span>
                ${item.category ? `<span style="font-size: 12px; color: var(--text-muted);">${item.category}</span>` : ''}
            </div>
        `).join('');
        
        this.showAutocomplete();
    }
    
    getCurrentSearchTerm() {
        const input = document.getElementById('headerSearchInput');
        return input ? input.value : '';
    }
    
    highlightMatch(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
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
        const input = document.getElementById('headerSearchInput');
        
        input.value = selected.value;
        
        // Add to search history
        this.addToSearchHistory(selected.value);
        
        // Trigger search
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
        
        this.hideAutocomplete();
        input.focus();
    }
    
    showAutocomplete() {
        const autocomplete = document.getElementById('header-search-autocomplete');
        if (autocomplete) {
            autocomplete.style.display = 'block';
            this.isAutocompleteOpen = true;
        }
    }
    
    hideAutocomplete() {
        const autocomplete = document.getElementById('header-search-autocomplete');
        if (autocomplete) {
            autocomplete.style.display = 'none';
            this.isAutocompleteOpen = false;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const tools = window.allTools || window.unifiedToolsData?.tools || [];
            window.headerSearchAutocomplete = new HeaderSearchAutocomplete(tools);
        }, 500);
    });
} else {
    setTimeout(() => {
        const tools = window.allTools || window.unifiedToolsData?.tools || [];
        window.headerSearchAutocomplete = new HeaderSearchAutocomplete(tools);
    }, 500);
}