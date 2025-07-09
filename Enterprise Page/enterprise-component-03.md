# Filter System Component Specification

## Component Overview
The Filter System provides advanced filtering capabilities in the left column of the Enterprise Report page. It enables executives to quickly narrow down 317 AI tools to find exactly what they need through search, sliders, and multi-select options.

## Responsibilities
- Provide instant search across tool names, categories, and tags
- Enable range filtering for business impact scores
- Allow multi-select filtering for complexity levels
- Support category-based filtering with counts
- Apply filters with < 100ms response time
- Maintain filter state in URL for shareability
- Show active filter count and provide quick reset

## Component Interface

### Public API
```javascript
class FilterSystem {
  // Initialization
  constructor(container: HTMLElement, dataProcessor: EnterpriseDataProcessor)
  
  // Core Methods
  render(): void
  applyFilters(): void
  resetFilters(): void
  getActiveFilters(): FilterCriteria
  
  // Filter Methods
  setSearchQuery(query: string): void
  setImpactRange(min: number, max: number): void
  setComplexityLevels(levels: number[]): void
  setCategories(categories: string[]): void
  
  // State Management
  saveToURL(): void
  loadFromURL(): void
  onFilterChange(callback: Function): void
  
  // UI Updates
  updateCounts(filteredTools: Array<Tool>): void
  showLoading(isLoading: boolean): void
  highlightActiveFilters(): void
}
```

### Data Structures
```typescript
interface FilterState {
  search: string
  impactRange: [number, number]
  complexityLevels: Set<number>
  categories: Set<string>
  priceRange: [number, number] | null
}

interface FilterCounts {
  total: number
  byCategory: Map<string, number>
  byComplexity: Map<number, number>
  byQuadrant: Map<string, number>
}

interface FilterConfig {
  debounceMs: number
  animationDuration: number
  maxCategoriesShown: number
  defaultImpactRange: [number, number]
}
```

## Visual Design

### Filter Panel Layout
```
┌─────────────────────────┐
│ Filters          Reset  │
├─────────────────────────┤
│ 🔍 Search              │
│ ┌─────────────────────┐ │
│ │ Search 317 tools... │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Business Impact         │
│ ──────[====]────────   │
│ 25 ←────────────→ 95   │
├─────────────────────────┤
│ Complexity             │
│ ☐ Very Easy (1)    45  │
│ ☑ Easy (2)         67  │
│ ☑ Moderate (3)     89  │
│ ☐ Complex (4)      72  │
│ ☐ Very Complex (5) 44  │
├─────────────────────────┤
│ Categories             │
│ ☑ Data Analytics   47  │
│ ☐ Content Creation 38  │
│ ☑ Media Relations  29  │
│ ☐ Social Media     31  │
│ + Show 12 more...      │
└─────────────────────────┘
```

## Implementation Details

### HTML Structure
```html
<aside class="filter-panel" role="complementary" aria-label="Tool Filters">
  <div class="filter-header">
    <h3>Filters</h3>
    <button class="reset-filters" aria-label="Reset all filters">
      Reset
    </button>
    <span class="active-filter-count" aria-live="polite">
      <span class="count">0</span> active
    </span>
  </div>
  
  <!-- Search Filter -->
  <div class="filter-section search-section">
    <label for="tool-search">Search</label>
    <div class="search-wrapper">
      <input 
        type="search" 
        id="tool-search"
        class="search-input" 
        placeholder="Search 317 AI tools..."
        aria-describedby="search-hint"
      >
      <span class="search-icon" aria-hidden="true">🔍</span>
    </div>
    <small id="search-hint" class="filter-hint">
      Search by name, category, or features
    </small>
  </div>
  
  <!-- Impact Range Filter -->
  <div class="filter-section impact-section">
    <label for="impact-range">Business Impact</label>
    <div class="range-slider" data-min="0" data-max="100">
      <div class="slider-track"></div>
      <div class="slider-fill"></div>
      <input 
        type="range" 
        id="impact-min"
        class="range-min" 
        min="0" 
        max="100" 
        value="0"
        aria-label="Minimum impact"
      >
      <input 
        type="range" 
        id="impact-max"
        class="range-max" 
        min="0" 
        max="100" 
        value="100"
        aria-label="Maximum impact"
      >
    </div>
    <div class="range-values">
      <span class="min-value">0</span>
      <span class="range-separator">–</span>
      <span class="max-value">100</span>
    </div>
  </div>
  
  <!-- Complexity Filter -->
  <div class="filter-section complexity-section">
    <fieldset>
      <legend>Complexity</legend>
      <div class="checkbox-group" role="group">
        <label class="checkbox-label">
          <input type="checkbox" value="1" aria-describedby="complexity-1-count">
          <span class="checkbox-text">Very Easy (1)</span>
          <span id="complexity-1-count" class="filter-count">45</span>
        </label>
        <!-- Repeat for levels 2-5 -->
      </div>
    </fieldset>
  </div>
  
  <!-- Category Filter -->
  <div class="filter-section category-section">
    <fieldset>
      <legend>Categories</legend>
      <div class="category-list" role="group">
        <!-- Dynamically populated -->
      </div>
      <button class="show-more-categories" aria-expanded="false">
        Show <span class="more-count">12</span> more...
      </button>
    </fieldset>
  </div>
</aside>
```

### CSS Styling
```css
.filter-panel {
  --panel-width: 280px;
  --section-spacing: 24px;
  --control-height: 40px;
  
  width: var(--panel-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: 20px;
}

/* Filter Header */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--section-spacing);
}

.reset-filters {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.active-filter-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: auto;
  margin-right: 12px;
}

.active-filter-count .count {
  font-weight: 600;
  color: var(--color-primary);
}

/* Search Section */
.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  height: var(--control-height);
  padding: 0 40px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Range Slider */
.range-slider {
  position: relative;
  height: 40px;
  margin: 16px 0;
}

.slider-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
}

.slider-fill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: var(--color-primary);
  border-radius: 2px;
}

.range-slider input[type="range"] {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
}

.range-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Checkbox Groups */
.checkbox-label {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: var(--color-surface-hover);
  margin: 0 -12px;
  padding: 8px 12px;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.filter-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Loading State */
.filter-panel.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### JavaScript Implementation
```javascript
class FilterSystem {
  constructor(container, dataProcessor) {
    this.container = container;
    this.dataProcessor = dataProcessor;
    
    this.state = {
      search: '',
      impactRange: [0, 100],
      complexityLevels: new Set(),
      categories: new Set()
    };
    
    this.config = {
      debounceMs: 300,
      animationDuration: 200,
      maxCategoriesShown: 5
    };
    
    this.callbacks = new Set();
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.loadFromURL();
    this.updateCounts(this.dataProcessor.tools);
  }

  render() {
    // Get available categories from data
    const categories = this.dataProcessor.getCategories();
    
    this.container.innerHTML = this.generateHTML(categories);
    
    // Cache DOM references
    this.elements = {
      searchInput: this.container.querySelector('#tool-search'),
      impactMin: this.container.querySelector('#impact-min'),
      impactMax: this.container.querySelector('#impact-max'),
      sliderFill: this.container.querySelector('.slider-fill'),
      minValue: this.container.querySelector('.min-value'),
      maxValue: this.container.querySelector('.max-value'),
      complexityCheckboxes: this.container.querySelectorAll('.complexity-section input'),
      categoryContainer: this.container.querySelector('.category-list'),
      resetButton: this.container.querySelector('.reset-filters'),
      activeCount: this.container.querySelector('.active-filter-count .count')
    };
  }

  attachEventListeners() {
    // Search input
    this.elements.searchInput.addEventListener('input', 
      debounce((e) => {
        this.state.search = e.target.value;
        this.applyFilters();
      }, this.config.debounceMs)
    );
    
    // Range sliders
    const updateRange = () => {
      const min = parseInt(this.elements.impactMin.value);
      const max = parseInt(this.elements.impactMax.value);
      
      // Prevent overlap
      if (min > max - 5) {
        if (event.target === this.elements.impactMin) {
          this.elements.impactMin.value = max - 5;
        } else {
          this.elements.impactMax.value = min + 5;
        }
      }
      
      this.state.impactRange = [
        parseInt(this.elements.impactMin.value),
        parseInt(this.elements.impactMax.value)
      ];
      
      this.updateRangeVisual();
      this.applyFilters();
    };
    
    this.elements.impactMin.addEventListener('input', updateRange);
    this.elements.impactMax.addEventListener('input', updateRange);
    
    // Complexity checkboxes
    this.elements.complexityCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const level = parseInt(e.target.value);
        
        if (e.target.checked) {
          this.state.complexityLevels.add(level);
        } else {
          this.state.complexityLevels.delete(level);
        }
        
        this.applyFilters();
      });
    });
    
    // Reset button
    this.elements.resetButton.addEventListener('click', () => {
      this.resetFilters();
    });
    
    // Category delegation
    this.elements.categoryContainer.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const category = e.target.value;
        
        if (e.target.checked) {
          this.state.categories.add(category);
        } else {
          this.state.categories.delete(category);
        }
        
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    const filters = {
      search: this.state.search,
      impactRange: this.state.impactRange,
      complexityLevels: Array.from(this.state.complexityLevels),
      categories: Array.from(this.state.categories)
    };
    
    // Apply filters through data processor
    const filtered = this.dataProcessor.applyFilters(filters);
    
    // Update UI
    this.updateCounts(filtered);
    this.updateActiveCount();
    this.saveToURL();
    
    // Notify listeners
    this.callbacks.forEach(callback => callback(filtered, filters));
  }

  updateRangeVisual() {
    const [min, max] = this.state.impactRange;
    const minPercent = min;
    const maxPercent = max;
    
    this.elements.sliderFill.style.left = `${minPercent}%`;
    this.elements.sliderFill.style.width = `${maxPercent - minPercent}%`;
    
    this.elements.minValue.textContent = min;
    this.elements.maxValue.textContent = max;
  }

  updateCounts(filteredTools) {
    // Count by complexity
    const complexityCounts = new Map();
    const categoryCounts = new Map();
    
    filteredTools.forEach(tool => {
      // Complexity
      const level = tool.complexity_score;
      complexityCounts.set(level, (complexityCounts.get(level) || 0) + 1);
      
      // Category
      const category = tool.category;
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    
    // Update complexity counts
    this.elements.complexityCheckboxes.forEach(checkbox => {
      const level = parseInt(checkbox.value);
      const count = complexityCounts.get(level) || 0;
      const countElement = checkbox.parentElement.querySelector('.filter-count');
      countElement.textContent = count;
      
      // Disable if no items
      checkbox.disabled = count === 0;
      checkbox.parentElement.classList.toggle('disabled', count === 0);
    });
    
    // Update category counts
    this.updateCategoryList(categoryCounts);
  }

  updateActiveCount() {
    let count = 0;
    
    if (this.state.search) count++;
    if (this.state.impactRange[0] > 0 || this.state.impactRange[1] < 100) count++;
    if (this.state.complexityLevels.size > 0) count++;
    if (this.state.categories.size > 0) count++;
    
    this.elements.activeCount.textContent = count;
    this.elements.resetButton.disabled = count === 0;
  }

  resetFilters() {
    this.state = {
      search: '',
      impactRange: [0, 100],
      complexityLevels: new Set(),
      categories: new Set()
    };
    
    // Reset UI
    this.elements.searchInput.value = '';
    this.elements.impactMin.value = 0;
    this.elements.impactMax.value = 100;
    this.updateRangeVisual();
    
    this.elements.complexityCheckboxes.forEach(cb => cb.checked = false);
    this.container.querySelectorAll('.category-list input').forEach(cb => cb.checked = false);
    
    this.applyFilters();
  }

  saveToURL() {
    const params = new URLSearchParams();
    
    if (this.state.search) {
      params.set('q', this.state.search);
    }
    
    if (this.state.impactRange[0] > 0 || this.state.impactRange[1] < 100) {
      params.set('impact', this.state.impactRange.join('-'));
    }
    
    if (this.state.complexityLevels.size > 0) {
      params.set('complexity', Array.from(this.state.complexityLevels).join(','));
    }
    
    if (this.state.categories.size > 0) {
      params.set('cat', Array.from(this.state.categories).join(','));
    }
    
    const url = new URL(window.location);
    url.search = params.toString();
    window.history.replaceState({}, '', url);
  }

  onFilterChange(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

// Utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

## Integration Points

### Data Flow
```javascript
// Filter system notifies portfolio grid
filterSystem.onFilterChange((filteredTools, filters) => {
  portfolioGrid.updateTools(filteredTools);
  metricsBar.updateMetrics(dataProcessor.calculateMetrics(filteredTools));
});
```

### URL State Management
```javascript
// On page load
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('q')) {
  filterSystem.setSearchQuery(urlParams.get('q'));
}
```

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements for count updates
- Focus management for dynamic content
- High contrast mode support

## Testing Strategy

### Component Tests
```javascript
describe('FilterSystem', () => {
  test('applies search filter correctly', () => {
    filterSystem.setSearchQuery('analytics');
    const filtered = dataProcessor.getFilteredTools();
    expect(filtered.every(t => 
      t.tool_name.toLowerCase().includes('analytics') ||
      t.category.toLowerCase().includes('analytics')
    )).toBe(true);
  });
  
  test('combines multiple filters', () => {
    filterSystem.setSearchQuery('data');
    filterSystem.setImpactRange(70, 100);
    filterSystem.setComplexityLevels([1, 2]);
    
    const filtered = dataProcessor.getFilteredTools();
    expect(filtered.length).toBeLessThan(317);
  });
  
  test('updates URL on filter change', () => {
    filterSystem.setSearchQuery('ai');
    expect(window.location.search).toContain('q=ai');
  });
});
```

## Performance Optimizations

- Debounced search input (300ms)
- Cached filter counts
- Virtual scrolling for long category lists
- RequestAnimationFrame for visual updates
- Minimal DOM manipulation