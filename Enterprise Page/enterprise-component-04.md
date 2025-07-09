# Portfolio Grid Component Specification

## Component Overview
The Portfolio Grid is the central component displaying AI tools in various view modes (Grid, List, Matrix). It implements virtual scrolling for performance, handles tool selection, and provides sorting capabilities while maintaining smooth 60fps scrolling with 317 tools.

## Responsibilities
- Display tools in Grid, List, or Matrix view
- Implement virtual scrolling for performance
- Handle tool card interactions and selection
- Provide sorting by multiple criteria
- Show loading states during updates
- Maintain scroll position during filtering
- Support keyboard navigation
- Trigger details panel on tool selection

## Component Interface

### Public API
```javascript
class PortfolioGrid {
  // Initialization
  constructor(container: HTMLElement, dataProcessor: EnterpriseDataProcessor)
  
  // Core Methods
  render(): void
  updateTools(tools: Array<Tool>): void
  setViewMode(mode: ViewMode): void
  setSortOrder(sortBy: SortOption): void
  
  // Tool Management
  selectTool(toolId: number): void
  clearSelection(): void
  getSelectedTool(): Tool | null
  highlightTool(toolId: number): void
  
  // View State
  saveScrollPosition(): void
  restoreScrollPosition(): void
  showLoading(show: boolean): void
  showEmptyState(message: string): void
  
  // Event Handling
  onToolSelect(callback: Function): void
  onToolCompare(callback: Function): void
  onViewChange(callback: Function): void
}
```

### Data Structures
```typescript
type ViewMode = 'grid' | 'list' | 'matrix'

type SortOption = 
  | 'impact-desc' 
  | 'impact-asc' 
  | 'complexity-asc' 
  | 'complexity-desc' 
  | 'name-asc' 
  | 'name-desc'
  | 'roi-desc'

interface GridConfig {
  itemsPerPage: number
  gridColumns: number
  listRowHeight: number
  cardHeight: number
  virtualScrollBuffer: number
}

interface ToolCardData {
  id: number
  name: string
  category: string
  impactScore: number
  complexityScore: number
  quadrant: string
  pricing: string
  tags: string[]
  completeness: number
}
```

## Visual Design

### Grid View Layout
```
┌────────────────────────────────────────────┐
│ AI Tools Portfolio     [Grid][List][Matrix] │
│ Showing 30 of 317     Sort: Impact ↓        │
├────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Tool    │ │ Tool    │ │ Tool    │       │
│ │ Card    │ │ Card    │ │ Card    │       │
│ └─────────┘ └─────────┘ └─────────┘       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Tool    │ │ Tool    │ │ Tool    │       │
│ │ Card    │ │ Card    │ │ Card    │       │
│ └─────────┘ └─────────┘ └─────────┘       │
└────────────────────────────────────────────┘
```

### List View Layout
```
┌────────────────────────────────────────────┐
│ Name          Category    Impact  Complex. │
├────────────────────────────────────────────┤
│ ChatGPT       AI Assist.    95      2     │
│ Claude        AI Assist.    94      2     │
│ Tableau       Analytics     89      3     │
└────────────────────────────────────────────┘
```

### Matrix View Layout
```
┌────────────────────────────────────────────┐
│         Low Complexity    High Complexity   │
│  High   ┌─────────────┐  ┌──────────────┐ │
│ Impact  │ Quick Wins  │  │  Strategic   │ │
│         │   58 tools  │  │   4 tools    │ │
│         └─────────────┘  └──────────────┘ │
│  Low    ┌─────────────┐  ┌──────────────┐ │
│ Impact  │  Routine    │  │Question Value│ │
│         │  211 tools  │  │   44 tools   │ │
│         └─────────────┘  └──────────────┘ │
└────────────────────────────────────────────┘
```

## Implementation Details

### HTML Structure
```html
<main class="portfolio-section" role="main">
  <div class="portfolio-header">
    <h1>AI Tools Portfolio</h1>
    <div class="portfolio-controls">
      <!-- View Toggle -->
      <div class="view-toggle" role="tablist" aria-label="View options">
        <button 
          role="tab" 
          aria-selected="true" 
          aria-controls="grid-view"
          class="view-btn active" 
          data-view="grid"
        >
          <svg class="icon-grid"><!-- Grid icon --></svg>
          <span>Grid</span>
        </button>
        <button 
          role="tab" 
          aria-selected="false" 
          aria-controls="list-view"
          class="view-btn" 
          data-view="list"
        >
          <svg class="icon-list"><!-- List icon --></svg>
          <span>List</span>
        </button>
        <button 
          role="tab" 
          aria-selected="false" 
          aria-controls="matrix-view"
          class="view-btn" 
          data-view="matrix"
        >
          <svg class="icon-matrix"><!-- Matrix icon --></svg>
          <span>Matrix</span>
        </button>
      </div>
      
      <!-- Sort Control -->
      <div class="sort-control">
        <label for="sort-select" class="visually-hidden">Sort by</label>
        <select id="sort-select" class="sort-select">
          <option value="impact-desc">Impact: High to Low</option>
          <option value="impact-asc">Impact: Low to High</option>
          <option value="complexity-asc">Complexity: Low to High</option>
          <option value="complexity-desc">Complexity: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="roi-desc">ROI: High to Low</option>
        </select>
      </div>
    </div>
  </div>
  
  <div class="portfolio-stats" aria-live="polite">
    Showing <span class="showing-count">30</span> of 
    <span class="total-count">317</span> tools
  </div>
  
  <!-- Grid View -->
  <div 
    id="grid-view" 
    role="tabpanel" 
    class="portfolio-view portfolio-grid active"
    data-view="grid"
  >
    <div class="virtual-scroll-container">
      <div class="virtual-scroll-spacer"></div>
      <div class="tool-cards-container">
        <!-- Tool cards rendered here -->
      </div>
    </div>
  </div>
  
  <!-- List View -->
  <div 
    id="list-view" 
    role="tabpanel" 
    class="portfolio-view portfolio-list"
    data-view="list"
    hidden
  >
    <table class="tools-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Impact</th>
          <th>Complexity</th>
          <th>Pricing</th>
        </tr>
      </thead>
      <tbody class="virtual-table-body">
        <!-- Rows rendered here -->
      </tbody>
    </table>
  </div>
  
  <!-- Loading State -->
  <div class="portfolio-loading" aria-hidden="true">
    <div class="spinner"></div>
    <p>Loading tools...</p>
  </div>
  
  <!-- Empty State -->
  <div class="portfolio-empty" hidden>
    <svg class="empty-icon"><!-- Empty illustration --></svg>
    <h3>No tools match your filters</h3>
    <p>Try adjusting your search criteria</p>
  </div>
</main>
```

### Tool Card Component
```html
<article 
  class="tool-card" 
  data-tool-id="1"
  data-quadrant="quick-wins"
  tabindex="0"
  role="button"
  aria-label="ChatGPT - AI Assistant"
>
  <div class="card-header">
    <h3 class="tool-name">ChatGPT</h3>
    <span class="tool-category">AI Assistant</span>
  </div>
  
  <div class="card-metrics">
    <div class="metric impact">
      <span class="metric-label">Impact</span>
      <span class="metric-value">95</span>
      <div class="metric-bar">
        <div class="metric-fill" style="width: 95%"></div>
      </div>
    </div>
    <div class="metric complexity">
      <span class="metric-label">Complexity</span>
      <span class="metric-value">2/5</span>
      <div class="complexity-dots">
        <span class="dot filled"></span>
        <span class="dot filled"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
  
  <div class="card-tags">
    <span class="tag">LLM</span>
    <span class="tag">Chat</span>
    <span class="tag">AI</span>
  </div>
  
  <div class="card-footer">
    <span class="pricing">$20/mo</span>
    <span class="completeness" title="Data completeness">95%</span>
  </div>
  
  <div class="card-badge quick-win">
    <svg class="badge-icon"><!-- Lightning icon --></svg>
    <span>Quick Win</span>
  </div>
</article>
```

### CSS Styling
```css
/* Portfolio Grid Container */
.portfolio-grid {
  --card-width: 320px;
  --card-gap: 20px;
  --card-height: 200px;
  
  height: calc(100vh - 200px);
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-container {
  position: relative;
}

.virtual-scroll-spacer {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  pointer-events: none;
}

.tool-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  gap: var(--card-gap);
  padding-bottom: 40px;
}

/* Tool Card */
.tool-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.tool-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.tool-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

/* Card Badge */
.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-badge.quick-win {
  background: var(--color-success-light);
  color: var(--color-success);
}

.card-badge.strategic {
  background: var(--color-info-light);
  color: var(--color-info);
}

/* Metric Bars */
.metric-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.metric-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* List View */
.portfolio-list {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.tools-table {
  width: 100%;
  border-collapse: collapse;
}

.tools-table th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
  z-index: 10;
}

.tools-table td {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.tools-table tr:hover {
  background: var(--color-surface-hover);
}

/* Matrix View */
.portfolio-matrix {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 200px);
  padding: 20px;
}

.matrix-quadrant {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.matrix-quadrant:hover {
  border-color: var(--color-primary);
  transform: scale(1.02);
}

/* Loading & Empty States */
.portfolio-loading,
.portfolio-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### JavaScript Implementation
```javascript
class PortfolioGrid {
  constructor(container, dataProcessor) {
    this.container = container;
    this.dataProcessor = dataProcessor;
    
    this.state = {
      viewMode: 'grid',
      sortBy: 'impact-desc',
      selectedToolId: null,
      scrollPosition: 0,
      visibleRange: { start: 0, end: 30 }
    };
    
    this.config = {
      itemsPerPage: 30,
      gridColumns: 3,
      cardHeight: 200,
      listRowHeight: 60,
      virtualScrollBuffer: 5
    };
    
    this.tools = [];
    this.virtualScroller = null;
    this.callbacks = {
      toolSelect: new Set(),
      viewChange: new Set()
    };
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.initVirtualScroller();
  }

  render() {
    // Render initial structure (HTML shown above)
    this.container.innerHTML = this.generateHTML();
    
    // Cache DOM elements
    this.elements = {
      viewToggles: this.container.querySelectorAll('.view-btn'),
      sortSelect: this.container.querySelector('.sort-select'),
      showingCount: this.container.querySelector('.showing-count'),
      totalCount: this.container.querySelector('.total-count'),
      views: {
        grid: this.container.querySelector('[data-view="grid"]'),
        list: this.container.querySelector('[data-view="list"]'),
        matrix: this.container.querySelector('[data-view="matrix"]')
      },
      cardsContainer: this.container.querySelector('.tool-cards-container'),
      tableBody: this.container.querySelector('.virtual-table-body'),
      loadingState: this.container.querySelector('.portfolio-loading'),
      emptyState: this.container.querySelector('.portfolio-empty')
    };
  }

  initVirtualScroller() {
    const scrollContainer = this.elements.views[this.state.viewMode];
    
    this.virtualScroller = new VirtualScroller({
      container: scrollContainer,
      items: this.tools,
      itemHeight: this.state.viewMode === 'grid' ? this.config.cardHeight : this.config.listRowHeight,
      buffer: this.config.virtualScrollBuffer,
      renderFn: (tool) => this.renderToolItem(tool)
    });
  }

  updateTools(tools) {
    this.tools = this.sortTools(tools, this.state.sortBy);
    
    // Update counts
    this.elements.totalCount.textContent = this.dataProcessor.tools.length;
    this.elements.showingCount.textContent = tools.length;
    
    // Show empty state if needed
    if (tools.length === 0) {
      this.showEmptyState('No tools match your filters');
      return;
    }
    
    // Update view
    this.hideEmptyState();
    
    if (this.state.viewMode === 'matrix') {
      this.renderMatrixView();
    } else {
      this.virtualScroller.setItems(this.tools);
    }
  }

  sortTools(tools, sortBy) {
    const sorted = [...tools];
    
    switch(sortBy) {
      case 'impact-desc':
        return sorted.sort((a, b) => b.business_impact_score - a.business_impact_score);
      case 'impact-asc':
        return sorted.sort((a, b) => a.business_impact_score - b.business_impact_score);
      case 'complexity-asc':
        return sorted.sort((a, b) => a.complexity_score - b.complexity_score);
      case 'complexity-desc':
        return sorted.sort((a, b) => b.complexity_score - a.complexity_score);
      case 'name-asc':
        return sorted.sort((a, b) => a.tool_name.localeCompare(b.tool_name));
      case 'roi-desc':
        return sorted.sort((a, b) => {
          const roiA = this.dataProcessor.calculateROI(a);
          const roiB = this.dataProcessor.calculateROI(b);
          return roiB - roiA;
        });
      default:
        return sorted;
    }
  }

  renderToolItem(tool) {
    if (this.state.viewMode === 'grid') {
      return this.renderToolCard(tool);
    } else {
      return this.renderToolRow(tool);
    }
  }

  renderToolCard(tool) {
    const quadrantClass = tool.quadrant ? `card-badge ${tool.quadrant}` : '';
    const quadrantLabel = this.getQuadrantLabel(tool.quadrant);
    
    return `
      <article 
        class="tool-card ${tool.id === this.state.selectedToolId ? 'selected' : ''}" 
        data-tool-id="${tool.id}"
        data-quadrant="${tool.quadrant || ''}"
        tabindex="0"
        role="button"
        aria-label="${tool.tool_name} - ${tool.category}"
      >
        <div class="card-header">
          <h3 class="tool-name">${this.escapeHtml(tool.tool_name)}</h3>
          <span class="tool-category">${this.escapeHtml(tool.category)}</span>
        </div>
        
        <div class="card-metrics">
          <div class="metric impact">
            <span class="metric-label">Impact</span>
            <span class="metric-value">${tool.business_impact_score}</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${tool.business_impact_score}%"></div>
            </div>
          </div>
          <div class="metric complexity">
            <span class="metric-label">Complexity</span>
            <span class="metric-value">${tool.complexity_score}/5</span>
            <div class="complexity-dots">
              ${this.renderComplexityDots(tool.complexity_score)}
            </div>
          </div>
        </div>
        
        <div class="card-tags">
          ${(tool.tags || []).slice(0, 3).map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
          ).join('')}
        </div>
        
        <div class="card-footer">
          <span class="pricing">${this.extractPricing(tool.pricing_model)}</span>
          <span class="completeness" title="Data completeness">
            ${Math.round(tool.completeness_score || 95)}%
          </span>
        </div>
        
        ${quadrantClass ? `
          <div class="${quadrantClass}">
            <span>${quadrantLabel}</span>
          </div>
        ` : ''}
      </article>
    `;
  }

  renderToolRow(tool) {
    return `
      <tr 
        class="tool-row ${tool.id === this.state.selectedToolId ? 'selected' : ''}"
        data-tool-id="${tool.id}"
        tabindex="0"
        role="button"
      >
        <td class="tool-name-cell">
          <strong>${this.escapeHtml(tool.tool_name)}</strong>
        </td>
        <td>${this.escapeHtml(tool.category)}</td>
        <td>
          <div class="impact-cell">
            <span>${tool.business_impact_score}</span>
            <div class="mini-bar">
              <div class="mini-fill" style="width: ${tool.business_impact_score}%"></div>
            </div>
          </div>
        </td>
        <td>${tool.complexity_score}/5</td>
        <td>${this.extractPricing(tool.pricing_model)}</td>
      </tr>
    `;
  }

  renderMatrixView() {
    const quadrants = {
      'quick-wins': { tools: [], label: 'Quick Wins', desc: 'High Impact, Low Complexity' },
      'strategic': { tools: [], label: 'Strategic', desc: 'High Impact, High Complexity' },
      'routine': { tools: [], label: 'Routine', desc: 'Low Impact, Low Complexity' },
      'question-value': { tools: [], label: 'Question Value', desc: 'Low Impact, High Complexity' }
    };
    
    this.tools.forEach(tool => {
      const quadrant = tool.quadrant || 'routine';
      quadrants[quadrant].tools.push(tool);
    });
    
    const matrixHTML = `
      <div class="matrix-grid">
        ${Object.entries(quadrants).map(([key, data]) => `
          <div class="matrix-quadrant" data-quadrant="${key}">
            <h3>${data.label}</h3>
            <p class="quadrant-desc">${data.desc}</p>
            <div class="quadrant-count">${data.tools.length} tools</div>
            <div class="quadrant-tools">
              ${data.tools.slice(0, 5).map(tool => 
                `<span class="tool-chip">${tool.tool_name}</span>`
              ).join('')}
              ${data.tools.length > 5 ? 
                `<span class="more-tools">+${data.tools.length - 5} more</span>` : ''
              }
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.elements.views.matrix.innerHTML = matrixHTML;
  }

  attachEventListeners() {
    // View mode toggles
    this.elements.viewToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setViewMode(btn.dataset.view);
      });
    });
    
    // Sort control
    this.elements.sortSelect.addEventListener('change', (e) => {
      this.setSortOrder(e.target.value);
    });
    
    // Tool selection (delegation)
    Object.values(this.elements.views).forEach(view => {
      view.addEventListener('click', (e) => {
        const toolElement = e.target.closest('[data-tool-id]');
        if (toolElement) {
          const toolId = parseInt(toolElement.dataset.toolId);
          this.selectTool(toolId);
        }
      });
      
      // Keyboard navigation
      view.addEventListener('keydown', (e) => {
        const toolElement = e.target.closest('[data-tool-id]');
        if (toolElement && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          const toolId = parseInt(toolElement.dataset.toolId);
          this.selectTool(toolId);
        }
      });
    });
  }

  setViewMode(mode) {
    if (mode === this.state.viewMode) return;
    
    // Update state
    this.state.viewMode = mode;
    
    // Update UI
    this.elements.viewToggles.forEach(btn => {
      const isActive = btn.dataset.view === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    // Show/hide views
    Object.entries(this.elements.views).forEach(([viewMode, element]) => {
      element.hidden = viewMode !== mode;
    });
    
    // Reinitialize virtual scroller if needed
    if (mode !== 'matrix') {
      this.initVirtualScroller();
      this.virtualScroller.setItems(this.tools);
    } else {
      this.renderMatrixView();
    }
    
    // Notify listeners
    this.callbacks.viewChange.forEach(cb => cb(mode));
  }

  selectTool(toolId) {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool) return;
    
    // Update state
    this.state.selectedToolId = toolId;
    
    // Update UI
    this.container.querySelectorAll('[data-tool-id]').forEach(el => {
      el.classList.toggle('selected', parseInt(el.dataset.toolId) === toolId);
    });
    
    // Notify listeners
    this.callbacks.toolSelect.forEach(cb => cb(tool));
  }

  onToolSelect(callback) {
    this.callbacks.toolSelect.add(callback);
    return () => this.callbacks.toolSelect.delete(callback);
  }

  // Utility methods
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  extractPricing(pricingModel) {
    if (!pricingModel) return 'Contact';
    
    const match = pricingModel.match(/\$[\d,]+(?:\/\w+)?/);
    return match ? match[0] : 'Custom';
  }

  renderComplexityDots(level) {
    return Array.from({ length: 5 }, (_, i) => 
      `<span class="dot ${i < level ? 'filled' : ''}"></span>`
    ).join('');
  }

  getQuadrantLabel(quadrant) {
    const labels = {
      'quick-wins': '⚡ Quick Win',
      'strategic': '♔ Strategic',
      'routine': '📋 Routine',
      'question-value': '❓ Question'
    };
    return labels[quadrant] || '';
  }
}

// Virtual Scroller Implementation
class VirtualScroller {
  constructor(options) {
    this.container = options.container;
    this.items = options.items || [];
    this.itemHeight = options.itemHeight;
    this.buffer = options.buffer || 5;
    this.renderFn = options.renderFn;
    
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.init();
  }

  init() {
    this.spacer = this.container.querySelector('.virtual-scroll-spacer') || 
                  this.createSpacer();
    
    this.content = this.container.querySelector('.tool-cards-container') || 
                   this.container.querySelector('.virtual-table-body');
    
    this.container.addEventListener('scroll', 
      this.throttle(() => this.handleScroll(), 16)
    );
    
    this.handleScroll();
  }

  createSpacer() {
    const spacer = document.createElement('div');
    spacer.className = 'virtual-scroll-spacer';
    this.container.appendChild(spacer);
    return spacer;
  }

  setItems(items) {
    this.items = items;
    this.updateHeight();
    this.handleScroll();
  }

  updateHeight() {
    const totalHeight = this.items.length * this.itemHeight;
    this.spacer.style.height = `${totalHeight}px`;
  }

  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);
    const end = Math.min(this.items.length, start + visibleCount + this.buffer * 2);
    
    if (start !== this.visibleStart || end !== this.visibleEnd) {
      this.visibleStart = start;
      this.visibleEnd = end;
      this.render();
    }
  }

  render() {
    const fragment = document.createDocumentFragment();
    const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd);
    
    const html = visibleItems.map(item => this.renderFn(item)).join('');
    
    this.content.innerHTML = html;
    this.content.style.transform = 
      `translateY(${this.visibleStart * this.itemHeight}px)`;
  }

  throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }
}
```

## Integration Points

### Event Flow
```javascript
// Tool selection triggers details panel
portfolioGrid.onToolSelect((tool) => {
  detailsPanel.showTool(tool);
  enterpriseContent.classList.add('details-open');
});

// View mode changes
portfolioGrid.onViewChange((mode) => {
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('view', mode);
  window.history.replaceState({}, '', url);
});
```

### Filter Integration
```javascript
// Filters update portfolio
filterSystem.onFilterChange((filteredTools) => {
  portfolioGrid.updateTools(filteredTools);
});
```

## Performance Optimizations

- Virtual scrolling for all views
- Throttled scroll handlers (16ms)
- Minimal DOM manipulation
- CSS transforms for positioning
- RequestAnimationFrame for smooth animations
- Lazy rendering of complex elements

## Accessibility

- Full keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader announcements
- High contrast support
- Reduced motion support

## Testing Strategy

### Performance Tests
```javascript
describe('PortfolioGrid Performance', () => {
  test('renders 317 tools without lag', () => {
    const start = performance.now();
    portfolioGrid.updateTools(allTools);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  test('maintains 60fps during scroll', async () => {
    // Simulate rapid scrolling
    const fps = await measureScrollingFPS(portfolioGrid.container);
    expect(fps).toBeGreaterThan(55);
  });
});
```