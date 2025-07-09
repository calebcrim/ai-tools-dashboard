# View Modes Component Specification

## Component Overview
The View Modes component manages the different visualization options for the AI tools portfolio: Grid view (card layout), List view (tabular format), and Matrix view (2x2 strategic positioning). It handles smooth transitions between views while maintaining user context and selection state.

## Responsibilities
- Manage three distinct view modes with smooth transitions
- Preserve tool selection and scroll position across views
- Implement the strategic 2x2 matrix for executive decision-making
- Provide view-specific sorting and display options
- Handle responsive behavior for each view mode
- Maintain performance with 317 tools

## Component Interface

### Public API
```javascript
class ViewModeManager {
  // Initialization
  constructor(container: HTMLElement, dataProcessor: EnterpriseDataProcessor)
  
  // Core Methods
  setView(mode: ViewMode): void
  getCurrentView(): ViewMode
  refreshView(): void
  
  // View-Specific Methods
  updateGridColumns(columns: number): void
  updateListColumns(columns: string[]): void
  updateMatrixQuadrants(quadrantConfig: QuadrantConfig): void
  
  // State Management
  preserveState(): ViewState
  restoreState(state: ViewState): void
  
  // Event Handling
  onViewChange(callback: Function): void
  onQuadrantClick(callback: Function): void
  onToolInteraction(callback: Function): void
}
```

### Data Structures
```typescript
type ViewMode = 'grid' | 'list' | 'matrix'

interface ViewState {
  mode: ViewMode
  scrollPosition: number
  selectedTools: number[]
  sortOrder: string
  filters: FilterState
}

interface QuadrantConfig {
  topLeft: { label: string, description: string, color: string }
  topRight: { label: string, description: string, color: string }
  bottomLeft: { label: string, description: string, color: string }
  bottomRight: { label: string, description: string, color: string }
}

interface MatrixPosition {
  x: number  // 0-100 (impact score)
  y: number  // 0-100 (inverted complexity for visual placement)
  quadrant: string
}
```

## View Implementations

### Grid View
```
┌─────────────────────────────────────────┐
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │   Tool  │ │   Tool  │ │   Tool  │   │
│ │   Card  │ │   Card  │ │   Card  │   │
│ │         │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │   Tool  │ │   Tool  │ │   Tool  │   │
│ │   Card  │ │   Card  │ │   Card  │   │
│ │         │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

### List View
```
┌─────────────────────────────────────────┐
│ Tool Name    Category   Impact Complex. │
│ ─────────────────────────────────────── │
│ ChatGPT      AI Assist    95      2    │
│ Claude       AI Assist    94      2    │
│ Tableau      Analytics    89      3    │
│ Perplexity   Search       87      2    │
└─────────────────────────────────────────┘
```

### Matrix View (2x2 Strategic Positioning)
```
         Low Complexity          High Complexity
    ┌──────────────────────┬──────────────────────┐
    │                      │                      │
High│    QUICK WINS       │     STRATEGIC        │
    │    (58 tools)       │     (4 tools)        │
Impact│  • ChatGPT         │  • Salesforce        │
    │  • Canva            │  • Databricks        │
    │  • Grammarly        │  • Custom AI         │
    │                      │                      │
    ├──────────────────────┼──────────────────────┤
    │                      │                      │
Low │     ROUTINE         │   QUESTION VALUE     │
    │   (211 tools)       │    (44 tools)        │
Impact│  • Basic Analytics │  • Complex Legacy    │
    │  • Simple Tools     │  • Niche Solutions   │
    │                      │                      │
    └──────────────────────┴──────────────────────┘
```

## Implementation Details

### HTML Structure for Matrix View
```html
<div class="view-mode matrix-view" data-view="matrix">
  <div class="matrix-container">
    <!-- Axes Labels -->
    <div class="matrix-axis-y">
      <span class="axis-label top">High Impact</span>
      <span class="axis-label bottom">Low Impact</span>
    </div>
    <div class="matrix-axis-x">
      <span class="axis-label left">Low Complexity</span>
      <span class="axis-label right">High Complexity</span>
    </div>
    
    <!-- Quadrants -->
    <div class="matrix-grid">
      <div class="matrix-quadrant" data-quadrant="quick-wins">
        <div class="quadrant-header">
          <h3 class="quadrant-title">
            <span class="quadrant-icon">🚀</span>
            Quick Wins
          </h3>
          <p class="quadrant-description">
            High impact, Low complexity
          </p>
          <div class="quadrant-count">58 tools</div>
        </div>
        <div class="quadrant-tools">
          <!-- Tool dots or mini cards -->
        </div>
        <div class="quadrant-summary">
          <div class="summary-item">
            <span class="label">Avg. ROI:</span>
            <span class="value">127%</span>
          </div>
          <div class="summary-item">
            <span class="label">Time to Value:</span>
            <span class="value">< 30 days</span>
          </div>
        </div>
      </div>
      
      <!-- Repeat for other quadrants -->
    </div>
    
    <!-- Interactive Overlay -->
    <div class="matrix-overlay">
      <canvas id="matrixCanvas"></canvas>
      <div class="matrix-tooltip" hidden>
        <div class="tooltip-content">
          <!-- Dynamic content -->
        </div>
      </div>
    </div>
  </div>
  
  <!-- Matrix Controls -->
  <div class="matrix-controls">
    <button class="matrix-zoom-in" aria-label="Zoom in">+</button>
    <button class="matrix-zoom-out" aria-label="Zoom out">-</button>
    <button class="matrix-reset" aria-label="Reset view">Reset</button>
  </div>
</div>
```

### CSS Styling
```css
/* View Mode Container */
.view-mode {
  width: 100%;
  height: 100%;
  position: relative;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.view-mode.active {
  opacity: 1;
}

/* Matrix View Specific */
.matrix-view {
  padding: 20px;
}

.matrix-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 240px);
  min-height: 600px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

/* Matrix Grid */
.matrix-grid {
  position: absolute;
  inset: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  background: var(--color-border);
}

.matrix-quadrant {
  background: var(--color-surface);
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.matrix-quadrant:hover {
  background: var(--color-surface-hover);
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Quadrant Styling */
.matrix-quadrant[data-quadrant="quick-wins"] {
  background: linear-gradient(135deg, 
    var(--color-success-light) 0%, 
    var(--color-surface) 100%);
}

.matrix-quadrant[data-quadrant="strategic"] {
  background: linear-gradient(135deg, 
    var(--color-info-light) 0%, 
    var(--color-surface) 100%);
}

.matrix-quadrant[data-quadrant="routine"] {
  background: linear-gradient(135deg, 
    var(--color-neutral-light) 0%, 
    var(--color-surface) 100%);
}

.matrix-quadrant[data-quadrant="question-value"] {
  background: linear-gradient(135deg, 
    var(--color-warning-light) 0%, 
    var(--color-surface) 100%);
}

/* Quadrant Header */
.quadrant-header {
  margin-bottom: 20px;
}

.quadrant-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.quadrant-icon {
  font-size: 24px;
}

.quadrant-description {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 4px 0;
}

.quadrant-count {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

/* Quadrant Tools Display */
.quadrant-tools {
  position: relative;
  height: 200px;
  margin: 20px 0;
}

.tool-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-dot:hover {
  transform: scale(1.5);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Matrix Axes */
.matrix-axis-y,
.matrix-axis-x {
  position: absolute;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.matrix-axis-y {
  left: 10px;
  top: 40px;
  bottom: 40px;
  width: 20px;
  flex-direction: column;
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

.matrix-axis-x {
  left: 40px;
  right: 40px;
  bottom: 10px;
  height: 20px;
}

/* Matrix Overlay (for interactive features) */
.matrix-overlay {
  position: absolute;
  inset: 40px;
  pointer-events: none;
}

.matrix-overlay canvas {
  width: 100%;
  height: 100%;
}

.matrix-tooltip {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 1000;
  max-width: 300px;
}

/* Matrix Controls */
.matrix-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
}

.matrix-controls button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.matrix-controls button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .matrix-grid {
    gap: 1px;
  }
  
  .matrix-quadrant {
    padding: 12px;
  }
  
  .quadrant-title {
    font-size: 16px;
  }
  
  .quadrant-tools {
    height: 120px;
  }
  
  .matrix-axis-y,
  .matrix-axis-x {
    font-size: 10px;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.view-mode.active .matrix-quadrant {
  animation: slideIn 0.5s ease backwards;
}

.matrix-quadrant:nth-child(1) { animation-delay: 0.1s; }
.matrix-quadrant:nth-child(2) { animation-delay: 0.2s; }
.matrix-quadrant:nth-child(3) { animation-delay: 0.3s; }
.matrix-quadrant:nth-child(4) { animation-delay: 0.4s; }
```

### JavaScript Implementation
```javascript
class ViewModeManager {
  constructor(container, dataProcessor) {
    this.container = container;
    this.dataProcessor = dataProcessor;
    
    this.state = {
      currentView: 'grid',
      previousView: null,
      viewStates: {
        grid: { scrollPosition: 0, selectedTools: [] },
        list: { scrollPosition: 0, selectedTools: [], sortColumn: null },
        matrix: { zoom: 1, center: { x: 50, y: 50 }, selectedQuadrant: null }
      }
    };
    
    this.callbacks = {
      viewChange: new Set(),
      quadrantClick: new Set(),
      toolInteraction: new Set()
    };
    
    this.matrixCanvas = null;
    this.matrixRenderer = null;
    
    this.init();
  }

  init() {
    this.setupViewContainers();
    this.initializeMatrixView();
    this.attachEventListeners();
  }

  setupViewContainers() {
    // Ensure all view containers exist
    const views = ['grid', 'list', 'matrix'];
    views.forEach(view => {
      let container = this.container.querySelector(`[data-view="${view}"]`);
      if (!container) {
        container = document.createElement('div');
        container.className = `view-mode ${view}-view`;
        container.dataset.view = view;
        this.container.appendChild(container);
      }
    });
  }

  initializeMatrixView() {
    const matrixView = this.container.querySelector('[data-view="matrix"]');
    if (!matrixView.querySelector('.matrix-container')) {
      matrixView.innerHTML = this.generateMatrixHTML();
    }
    
    // Initialize canvas for advanced visualizations
    this.matrixCanvas = matrixView.querySelector('#matrixCanvas');
    if (this.matrixCanvas) {
      this.matrixRenderer = new MatrixRenderer(this.matrixCanvas, this.dataProcessor);
    }
  }

  generateMatrixHTML() {
    const quadrants = [
      {
        id: 'quick-wins',
        title: 'Quick Wins',
        icon: '🚀',
        description: 'High impact, Low complexity',
        position: 'top-left'
      },
      {
        id: 'strategic',
        title: 'Strategic Tools',
        icon: '♔',
        description: 'High impact, High complexity',
        position: 'top-right'
      },
      {
        id: 'routine',
        title: 'Routine Tools',
        icon: '📋',
        description: 'Low impact, Low complexity',
        position: 'bottom-left'
      },
      {
        id: 'question-value',
        title: 'Question Value',
        icon: '❓',
        description: 'Low impact, High complexity',
        position: 'bottom-right'
      }
    ];
    
    return `
      <div class="matrix-container">
        <div class="matrix-axis-y">
          <span class="axis-label top">High Impact</span>
          <span class="axis-label bottom">Low Impact</span>
        </div>
        <div class="matrix-axis-x">
          <span class="axis-label left">Low Complexity</span>
          <span class="axis-label right">High Complexity</span>
        </div>
        
        <div class="matrix-grid">
          ${quadrants.map(q => this.generateQuadrantHTML(q)).join('')}
        </div>
        
        <div class="matrix-overlay">
          <canvas id="matrixCanvas"></canvas>
          <div class="matrix-tooltip" hidden></div>
        </div>
      </div>
      
      <div class="matrix-controls">
        <button class="matrix-zoom-in" aria-label="Zoom in">+</button>
        <button class="matrix-zoom-out" aria-label="Zoom out">-</button>
        <button class="matrix-reset" aria-label="Reset view">⟲</button>
      </div>
    `;
  }

  generateQuadrantHTML(quadrant) {
    const tools = this.dataProcessor.getToolsByQuadrant(quadrant.id);
    const metrics = this.calculateQuadrantMetrics(tools);
    
    return `
      <div class="matrix-quadrant" data-quadrant="${quadrant.id}">
        <div class="quadrant-header">
          <h3 class="quadrant-title">
            <span class="quadrant-icon">${quadrant.icon}</span>
            ${quadrant.title}
          </h3>
          <p class="quadrant-description">${quadrant.description}</p>
          <div class="quadrant-count">${tools.length} tools</div>
        </div>
        
        <div class="quadrant-tools" data-quadrant="${quadrant.id}">
          ${this.renderQuadrantTools(tools.slice(0, 5))}
        </div>
        
        <div class="quadrant-summary">
          <div class="summary-item">
            <span class="label">Avg. ROI:</span>
            <span class="value">${metrics.avgROI}%</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Cost:</span>
            <span class="value">${this.formatCurrency(metrics.totalCost)}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderQuadrantTools(tools) {
    if (tools.length === 0) {
      return '<div class="empty-quadrant">No tools in this category</div>';
    }
    
    return `
      <div class="quadrant-tool-list">
        ${tools.map(tool => `
          <div class="quadrant-tool-item" data-tool-id="${tool.id}">
            <span class="tool-name">${tool.tool_name}</span>
            <span class="tool-score">${tool.business_impact_score}</span>
          </div>
        `).join('')}
        ${tools.length > 5 ? 
          `<div class="more-tools">+${tools.length - 5} more tools</div>` : 
          ''
        }
      </div>
    `;
  }

  setView(mode) {
    if (mode === this.state.currentView) return;
    
    // Save current view state
    this.preserveViewState();
    
    // Update state
    this.state.previousView = this.state.currentView;
    this.state.currentView = mode;
    
    // Transition views
    this.transitionToView(mode);
    
    // Notify listeners
    this.callbacks.viewChange.forEach(cb => cb(mode, this.state.previousView));
  }

  transitionToView(mode) {
    const views = this.container.querySelectorAll('.view-mode');
    
    views.forEach(view => {
      const isActive = view.dataset.view === mode;
      
      if (isActive) {
        view.style.display = 'block';
        // Force reflow for animation
        view.offsetHeight;
        view.classList.add('active');
        
        // Special handling for matrix view
        if (mode === 'matrix' && this.matrixRenderer) {
          setTimeout(() => {
            this.matrixRenderer.render();
          }, 300);
        }
      } else {
        view.classList.remove('active');
        setTimeout(() => {
          if (view.dataset.view !== this.state.currentView) {
            view.style.display = 'none';
          }
        }, 300);
      }
    });
    
    // Restore view state
    this.restoreViewState(mode);
  }

  preserveViewState() {
    const view = this.state.currentView;
    const container = this.container.querySelector(`[data-view="${view}"]`);
    
    switch(view) {
      case 'grid':
      case 'list':
        const scrollContainer = container.querySelector('.portfolio-grid, .portfolio-list');
        if (scrollContainer) {
          this.state.viewStates[view].scrollPosition = scrollContainer.scrollTop;
        }
        break;
      case 'matrix':
        if (this.matrixRenderer) {
          this.state.viewStates.matrix.zoom = this.matrixRenderer.zoom;
          this.state.viewStates.matrix.center = this.matrixRenderer.center;
        }
        break;
    }
    
    // Save selected tools
    const selectedElements = container.querySelectorAll('.selected[data-tool-id]');
    this.state.viewStates[view].selectedTools = Array.from(selectedElements)
      .map(el => parseInt(el.dataset.toolId));
  }

  restoreViewState(mode) {
    const state = this.state.viewStates[mode];
    const container = this.container.querySelector(`[data-view="${mode}"]`);
    
    switch(mode) {
      case 'grid':
      case 'list':
        const scrollContainer = container.querySelector('.portfolio-grid, .portfolio-list');
        if (scrollContainer && state.scrollPosition) {
          scrollContainer.scrollTop = state.scrollPosition;
        }
        break;
      case 'matrix':
        if (this.matrixRenderer && state.zoom) {
          this.matrixRenderer.setZoom(state.zoom);
          this.matrixRenderer.setCenter(state.center);
        }
        break;
    }
    
    // Restore selected tools
    if (state.selectedTools.length > 0) {
      state.selectedTools.forEach(toolId => {
        const element = container.querySelector(`[data-tool-id="${toolId}"]`);
        if (element) {
          element.classList.add('selected');
        }
      });
    }
  }

  attachEventListeners() {
    // Matrix quadrant clicks
    this.container.addEventListener('click', (e) => {
      const quadrant = e.target.closest('.matrix-quadrant');
      if (quadrant && this.state.currentView === 'matrix') {
        this.handleQuadrantClick(quadrant.dataset.quadrant);
      }
      
      const toolItem = e.target.closest('[data-tool-id]');
      if (toolItem) {
        this.handleToolClick(parseInt(toolItem.dataset.toolId));
      }
    });
    
    // Matrix controls
    const matrixView = this.container.querySelector('[data-view="matrix"]');
    if (matrixView) {
      matrixView.querySelector('.matrix-zoom-in')?.addEventListener('click', () => {
        if (this.matrixRenderer) {
          this.matrixRenderer.zoomIn();
        }
      });
      
      matrixView.querySelector('.matrix-zoom-out')?.addEventListener('click', () => {
        if (this.matrixRenderer) {
          this.matrixRenderer.zoomOut();
        }
      });
      
      matrixView.querySelector('.matrix-reset')?.addEventListener('click', () => {
        if (this.matrixRenderer) {
          this.matrixRenderer.reset();
        }
      });
    }
  }

  handleQuadrantClick(quadrantId) {
    this.state.viewStates.matrix.selectedQuadrant = quadrantId;
    
    // Visual feedback
    const quadrants = this.container.querySelectorAll('.matrix-quadrant');
    quadrants.forEach(q => {
      q.classList.toggle('selected', q.dataset.quadrant === quadrantId);
    });
    
    // Notify listeners
    this.callbacks.quadrantClick.forEach(cb => cb(quadrantId));
  }

  handleToolClick(toolId) {
    const tool = this.dataProcessor.getToolById(toolId);
    if (!tool) return;
    
    // Notify listeners
    this.callbacks.toolInteraction.forEach(cb => cb('click', tool));
  }

  calculateQuadrantMetrics(tools) {
    if (tools.length === 0) {
      return { avgROI: 0, totalCost: 0, avgTimeToValue: 'N/A' };
    }
    
    let totalROI = 0;
    let totalCost = 0;
    
    tools.forEach(tool => {
      const roi = this.dataProcessor.calculateROI(tool);
      totalROI += roi;
      
      const cost = this.dataProcessor.extractMonthlyPrice(tool.pricing_model) * 12;
      totalCost += cost;
    });
    
    return {
      avgROI: Math.round(totalROI / tools.length),
      totalCost: totalCost,
      avgTimeToValue: this.calculateAvgTimeToValue(tools)
    };
  }

  calculateAvgTimeToValue(tools) {
    const timeValues = tools
      .map(t => t.time_to_value)
      .filter(t => t);
    
    if (timeValues.length === 0) return 'N/A';
    
    // Parse and average time values
    // Implementation depends on time_to_value format
    return '< 30 days';
  }

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return `$${amount}`;
  }

  // Event handling
  onViewChange(callback) {
    this.callbacks.viewChange.add(callback);
    return () => this.callbacks.viewChange.delete(callback);
  }

  onQuadrantClick(callback) {
    this.callbacks.quadrantClick.add(callback);
    return () => this.callbacks.quadrantClick.delete(callback);
  }

  onToolInteraction(callback) {
    this.callbacks.toolInteraction.add(callback);
    return () => this.callbacks.toolInteraction.delete(callback);
  }
}

// Matrix Renderer for Advanced Visualizations
class MatrixRenderer {
  constructor(canvas, dataProcessor) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dataProcessor = dataProcessor;
    
    this.zoom = 1;
    this.center = { x: 50, y: 50 };
    this.tools = [];
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.loadTools();
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });
    
    // Mouse interactions
    this.setupInteractions();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  loadTools() {
    this.tools = this.dataProcessor.tools.map(tool => ({
      id: tool.id,
      name: tool.tool_name,
      x: tool.business_impact_score,
      y: 100 - (tool.complexity_score * 20), // Invert for visual layout
      quadrant: tool.quadrant,
      size: this.calculateToolSize(tool)
    }));
  }

  calculateToolSize(tool) {
    // Size based on completeness or other metric
    const baseSize = 4;
    const sizeMultiplier = (tool.completeness_score || 50) / 100;
    return baseSize + (baseSize * sizeMultiplier);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid lines
    this.drawGrid();
    
    // Draw tools as dots
    this.tools.forEach(tool => {
      this.drawTool(tool);
    });
  }

  drawGrid() {
    const { width, height } = this.canvas;
    
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Center lines
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
  }

  drawTool(tool) {
    const pos = this.projectPosition(tool.x, tool.y);
    
    // Set color based on quadrant
    const colors = {
      'quick-wins': '#22c55e',
      'strategic': '#3b82f6',
      'routine': '#6b7280',
      'question-value': '#f59e0b'
    };
    
    this.ctx.fillStyle = colors[tool.quadrant] || '#6b7280';
    this.ctx.globalAlpha = 0.7;
    
    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, tool.size * this.zoom, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
  }

  projectPosition(x, y) {
    const { width, height } = this.canvas;
    
    // Apply zoom and center
    const projectedX = ((x - this.center.x) * this.zoom + 50) * width / 100;
    const projectedY = ((y - this.center.y) * this.zoom + 50) * height / 100;
    
    return { x: projectedX, y: projectedY };
  }

  setupInteractions() {
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        this.center.x -= dx / this.canvas.width * 100 / this.zoom;
        this.center.y -= dy / this.canvas.height * 100 / this.zoom;
        
        dragStart = { x: e.clientX, y: e.clientY };
        this.render();
      } else {
        // Show tooltip on hover
        const tool = this.getToolAtPosition(e.offsetX, e.offsetY);
        if (tool) {
          this.showTooltip(tool, e.offsetX, e.offsetY);
        } else {
          this.hideTooltip();
        }
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Zoom with wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(0.5, Math.min(3, this.zoom * delta));
      this.render();
    });
  }

  getToolAtPosition(x, y) {
    for (const tool of this.tools) {
      const pos = this.projectPosition(tool.x, tool.y);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance <= tool.size * this.zoom) {
        return tool;
      }
    }
    return null;
  }

  showTooltip(tool, x, y) {
    const tooltip = this.canvas.parentElement.querySelector('.matrix-tooltip');
    tooltip.innerHTML = `
      <strong>${tool.name}</strong><br>
      Impact: ${tool.x}<br>
      Complexity: ${Math.round((100 - tool.y) / 20)}
    `;
    
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;
    tooltip.hidden = false;
  }

  hideTooltip() {
    const tooltip = this.canvas.parentElement.querySelector('.matrix-tooltip');
    tooltip.hidden = true;
  }

  zoomIn() {
    this.zoom = Math.min(3, this.zoom * 1.2);
    this.render();
  }

  zoomOut() {
    this.zoom = Math.max(0.5, this.zoom * 0.8);
    this.render();
  }

  reset() {
    this.zoom = 1;
    this.center = { x: 50, y: 50 };
    this.render();
  }
}
```

## Integration Points

### View Switching
```javascript
// From view toggle buttons
viewToggle.addEventListener('click', (e) => {
  const mode = e.target.dataset.view;
  viewModeManager.setView(mode);
  portfolioGrid.setViewMode(mode);
});

// Preserve state across views
viewModeManager.onViewChange((newView, oldView) => {
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('view', newView);
  window.history.replaceState({}, '', url);
  
  // Update UI
  updateViewToggleButtons(newView);
});
```

### Quadrant Filtering
```javascript
// When quadrant is clicked in matrix view
viewModeManager.onQuadrantClick((quadrantId) => {
  // Apply filter to show only tools in that quadrant
  const tools = dataProcessor.getToolsByQuadrant(quadrantId);
  
  // Switch to grid view with filtered results
  viewModeManager.setView('grid');
  portfolioGrid.updateTools(tools);
  
  // Update filters to reflect selection
  filterSystem.setQuadrantFilter(quadrantId);
});
```

## Accessibility Features

- Keyboard navigation between quadrants
- Screen reader announcements for view changes
- High contrast mode support
- Focus management during transitions
- Alternative text for visual elements
- Reduced motion preferences

## Performance Optimizations

- Canvas rendering for matrix visualization
- Debounced zoom/pan operations
- Efficient quadrant calculations
- Cached tool positions
- RequestAnimationFrame for smooth animations

## Testing Strategy

```javascript
describe('ViewModeManager', () => {
  test('switches between views smoothly', async () => {
    viewModeManager.setView('matrix');
    await waitForAnimation();
    
    expect(viewModeManager.getCurrentView()).toBe('matrix');
    expect(container.querySelector('[data-view="matrix"]').classList)
      .toContain('active');
  });
  
  test('preserves selection state across views', () => {
    // Select tools in grid view
    portfolioGrid.selectTool(1);
    portfolioGrid.selectTool(2);
    
    // Switch to matrix and back
    viewModeManager.setView('matrix');
    viewModeManager.setView('grid');
    
    // Check selection preserved
    const selected = container.querySelectorAll('.selected[data-tool-id]');
    expect(selected.length).toBe(2);
  });
  
  test('matrix quadrant calculations are accurate', () => {
    const quickWins = dataProcessor.getToolsByQuadrant('quick-wins');
    
    expect(quickWins.every(tool => 
      tool.business_impact_score >= 80 && 
      tool.complexity_score <= 2
    )).toBe(true);
  });
});
```

## Mobile Adaptations

- Simplified matrix view on small screens
- Touch gestures for pan/zoom
- Collapsible quadrant details
- Responsive grid columns
- Optimized touch targets