# Advanced Search & Filter System Specification

## Overview
With 317 tools and extensive metadata, the search and filter system needs to be powerful yet performant, providing instant results and intelligent filtering options.

## Search Architecture

### 1. Multi-Field Search Engine
```javascript
class AdvancedSearchEngine {
  constructor(tools) {
    this.tools = tools;
    this.searchIndex = null;
    this.searchCache = new Map();
    this.initializeIndex();
  }
  
  initializeIndex() {
    // Create weighted search index with Fuse.js
    this.searchIndex = new Fuse(this.tools, {
      keys: [
        { name: 'tool_name', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'category', weight: 0.15 },
        { name: 'feature_breakdown', weight: 0.15 },
        { name: 'pros_cons_limitations', weight: 0.1 },
        { name: 'integration_potential', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true,
      minMatchCharLength: 2
    });
  }
  
  search(query, options = {}) {
    // Check cache first
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }
    
    // Parse query for advanced search syntax
    const parsedQuery = this.parseAdvancedQuery(query);
    
    // Perform search
    let results = this.searchIndex.search(parsedQuery.searchString);
    
    // Apply field-specific filters from parsed query
    if (parsedQuery.fieldFilters.length > 0) {
      results = this.applyFieldFilters(results, parsedQuery.fieldFilters);
    }
    
    // Apply boost for exact matches
    results = this.boostExactMatches(results, query);
    
    // Transform results
    const transformedResults = results.map(result => ({
      ...result.item,
      searchScore: result.score,
      matchedFields: this.getMatchedFields(result)
    }));
    
    // Cache results
    this.searchCache.set(cacheKey, transformedResults);
    
    return transformedResults;
  }
  
  parseAdvancedQuery(query) {
    // Support advanced search syntax
    // Examples:
    // - category:marketing
    // - impact:>80
    // - complexity:<3
    // - "exact phrase"
    
    const fieldFilters = [];
    let searchString = query;
    
    // Extract field-specific searches
    const fieldPattern = /(\w+):([<>]?)(\S+)/g;
    let match;
    
    while ((match = fieldPattern.exec(query)) !== null) {
      fieldFilters.push({
        field: match[1],
        operator: match[2] || '=',
        value: match[3]
      });
      searchString = searchString.replace(match[0], '');
    }
    
    return {
      searchString: searchString.trim(),
      fieldFilters
    };
  }
}
```

### 2. Smart Filter System
```javascript
class SmartFilterSystem {
  constructor(tools) {
    this.tools = tools;
    this.activeFilters = {};
    this.filterCache = new Map();
    this.initializeFilterOptions();
  }
  
  initializeFilterOptions() {
    this.filterOptions = {
      categories: this.extractUniqueValues('category'),
      impactRanges: [
        { label: 'High Impact (80-100)', range: [80, 100] },
        { label: 'Medium Impact (50-79)', range: [50, 79] },
        { label: 'Low Impact (0-49)', range: [0, 49] }
      ],
      complexityLevels: [1, 2, 3, 4, 5],
      priceRanges: this.generatePriceRanges(),
      features: this.extractCommonFeatures(),
      integrationTypes: this.extractIntegrationTypes(),
      learningCurves: ['Low', 'Moderate', 'High', 'Variable']
    };
  }
  
  applyFilters(tools, filters) {
    const cacheKey = JSON.stringify(filters);
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey);
    }
    
    let filtered = [...tools];
    
    // Category filter
    if (filters.categories?.length) {
      filtered = filtered.filter(tool =>
        filters.categories.includes(tool.category)
      );
    }
    
    // Impact score filter
    if (filters.impactRange) {
      filtered = filtered.filter(tool =>
        tool.business_impact_score >= filters.impactRange[0] &&
        tool.business_impact_score <= filters.impactRange[1]
      );
    }
    
    // Complexity filter
    if (filters.complexityLevels?.length) {
      filtered = filtered.filter(tool =>
        filters.complexityLevels.includes(tool.complexity_score)
      );
    }
    
    // Price filter
    if (filters.priceRange) {
      filtered = filtered.filter(tool =>
        this.matchesPriceRange(tool, filters.priceRange)
      );
    }
    
    // Feature filter
    if (filters.features?.length) {
      filtered = filtered.filter(tool =>
        filters.features.some(feature =>
          tool.feature_breakdown?.toLowerCase().includes(feature.toLowerCase())
        )
      );
    }
    
    // Integration filter
    if (filters.integrationType) {
      filtered = filtered.filter(tool =>
        this.matchesIntegrationType(tool, filters.integrationType)
      );
    }
    
    // Learning curve filter
    if (filters.learningCurve) {
      filtered = filtered.filter(tool =>
        tool.learning_curve?.toLowerCase().includes(filters.learningCurve.toLowerCase())
      );
    }
    
    // Cache results
    this.filterCache.set(cacheKey, filtered);
    
    return filtered;
  }
  
  matchesPriceRange(tool, priceRange) {
    const pricing = tool.pricing_model?.toLowerCase() || '';
    
    // Extract numeric values from pricing
    const priceMatch = pricing.match(/\$(\d+)/);
    if (!priceMatch) {
      // Handle free tools
      if (pricing.includes('free')) {
        return priceRange[0] === 0;
      }
      return false;
    }
    
    const price = parseInt(priceMatch[1]);
    return price >= priceRange[0] && price <= priceRange[1];
  }
}
```

### 3. Search & Filter UI Components

#### Search Bar Component
```javascript
class AdvancedSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      showSuggestions: false,
      suggestions: [],
      searchMode: 'simple' // or 'advanced'
    };
    this.searchDebounce = debounce(this.performSearch, 300);
  }
  
  render() {
    const { query, showSuggestions, suggestions, searchMode } = this.state;
    
    return (
      <div className="advanced-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={this.handleQueryChange}
            onFocus={() => this.setState({ showSuggestions: true })}
            placeholder={searchMode === 'advanced' 
              ? "Try: category:ai impact:>80 'machine learning'"
              : "Search 317 AI tools by name, feature, or use case..."
            }
            className="search-input"
          />
          
          <div className="search-actions">
            <button
              className="search-mode-toggle"
              onClick={this.toggleSearchMode}
              title={`Switch to ${searchMode === 'simple' ? 'advanced' : 'simple'} search`}
            >
              <Icon name={searchMode === 'simple' ? 'code' : 'search'} />
            </button>
            
            <button className="search-button" onClick={this.performSearch}>
              <Icon name="search" />
            </button>
          </div>
        </div>
        
        {/* Search suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={this.handleSuggestionSelect}
            highlightQuery={query}
          />
        )}
        
        {/* Advanced search help */}
        {searchMode === 'advanced' && (
          <SearchHelp examples={this.getSearchExamples()} />
        )}
      </div>
    );
  }
}
```

#### Filter Panel Component
```javascript
class FilterPanel extends Component {
  render() {
    const { filters, options, onChange, resultCount } = this.props;
    
    return (
      <div className="filter-panel">
        <div className="filter-header">
          <h3>Filters</h3>
          <button 
            className="clear-filters"
            onClick={this.clearAllFilters}
            disabled={!this.hasActiveFilters()}
          >
            Clear All
          </button>
        </div>
        
        {/* Active filters summary */}
        {this.hasActiveFilters() && (
          <ActiveFilters
            filters={filters}
            onRemove={this.removeFilter}
          />
        )}
        
        {/* Category Filter */}
        <FilterSection title="Category" defaultOpen={true}>
          <CategoryFilter
            selected={filters.categories || []}
            options={options.categories}
            onChange={(categories) => onChange({ ...filters, categories })}
            showCounts={true}
          />
        </FilterSection>
        
        {/* Business Impact Filter */}
        <FilterSection title="Business Impact">
          <RangeSlider
            min={0}
            max={100}
            value={filters.impactRange || [0, 100]}
            onChange={(range) => onChange({ ...filters, impactRange: range })}
            labels={['Low', 'Medium', 'High']}
          />
        </FilterSection>
        
        {/* Complexity Filter */}
        <FilterSection title="Implementation Complexity">
          <ComplexityFilter
            selected={filters.complexityLevels || []}
            onChange={(levels) => onChange({ ...filters, complexityLevels: levels })}
          />
        </FilterSection>
        
        {/* Price Range Filter */}
        <FilterSection title="Price Range">
          <PriceRangeFilter
            selected={filters.priceRange}
            options={options.priceRanges}
            onChange={(range) => onChange({ ...filters, priceRange: range })}
          />
        </FilterSection>
        
        {/* Features Filter */}
        <FilterSection title="Features">
          <FeatureTagFilter
            selected={filters.features || []}
            options={options.features}
            onChange={(features) => onChange({ ...filters, features })}
            limit={20}
          />
        </FilterSection>
        
        {/* Integration Type Filter */}
        <FilterSection title="Integration Type">
          <IntegrationFilter
            selected={filters.integrationType}
            options={options.integrationTypes}
            onChange={(type) => onChange({ ...filters, integrationType: type })}
          />
        </FilterSection>
        
        {/* Results Summary */}
        <div className="filter-results-summary">
          <span className="result-count">{resultCount} tools found</span>
        </div>
      </div>
    );
  }
}
```

### 4. Smart Suggestions Engine
```javascript
class SmartSuggestionsEngine {
  constructor(tools) {
    this.tools = tools;
    this.suggestionCache = new Map();
    this.buildSuggestionIndex();
  }
  
  buildSuggestionIndex() {
    // Build indices for different suggestion types
    this.indices = {
      toolNames: this.tools.map(t => t.tool_name),
      categories: [...new Set(this.tools.map(t => t.category))],
      features: this.extractAllFeatures(),
      commonQueries: this.generateCommonQueries()
    };
  }
  
  getSuggestions(query, limit = 10) {
    if (query.length < 2) return [];
    
    const cacheKey = `${query}-${limit}`;
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey);
    }
    
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Tool name suggestions (highest priority)
    const toolSuggestions = this.indices.toolNames
      .filter(name => name.toLowerCase().includes(queryLower))
      .map(name => ({
        type: 'tool',
        text: name,
        icon: 'cube',
        priority: 1
      }));
    
    // Category suggestions
    const categorySuggestions = this.indices.categories
      .filter(cat => cat.toLowerCase().includes(queryLower))
      .map(cat => ({
        type: 'category',
        text: `in category: ${cat}`,
        icon: 'folder',
        priority: 2
      }));
    
    // Feature suggestions
    const featureSuggestions = this.indices.features
      .filter(feature => feature.toLowerCase().includes(queryLower))
      .slice(0, 5)
      .map(feature => ({
        type: 'feature',
        text: `with feature: ${feature}`,
        icon: 'star',
        priority: 3
      }));
    
    // Common query suggestions
    const commonSuggestions = this.indices.commonQueries
      .filter(q => q.toLowerCase().includes(queryLower))
      .map(q => ({
        type: 'query',
        text: q,
        icon: 'search',
        priority: 4
      }));
    
    // Combine and sort by priority
    suggestions.push(
      ...toolSuggestions,
      ...categorySuggestions,
      ...featureSuggestions,
      ...commonSuggestions
    );
    
    // Sort by priority and limit
    const sorted = suggestions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, limit);
    
    this.suggestionCache.set(cacheKey, sorted);
    return sorted;
  }
}
```

## Filter UI Styles

```css
/* Filter panel styling */
.filter-panel {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.filter-section:last-child {
  border-bottom: none;
}

/* Range slider */
.range-slider {
  padding: 1rem 0;
}

.range-slider .slider-track {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  position: relative;
}

.range-slider .slider-fill {
  position: absolute;
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
}

/* Category filter */
.category-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.category-option:hover {
  background: var(--bg-secondary);
}

.category-option.selected {
  background: var(--primary-light);
  color: var(--primary);
}

/* Active filters */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
}

.active-filter-chip .remove-btn {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.active-filter-chip .remove-btn:hover {
  opacity: 1;
}
```