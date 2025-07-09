# Tool Details Panel Component Specification

## Component Overview
The Tool Details Panel is a slide-in right panel that displays comprehensive information about a selected AI tool. It provides detailed metrics, features, integration details, and action buttons for executives to make informed decisions about tool adoption.

## Responsibilities
- Display detailed tool information in organized tabs
- Slide in/out smoothly from the right side
- Provide quick actions (Compare, Export, Share)
- Show related tools and alternatives
- Calculate and display TCO and ROI
- Support keyboard navigation and accessibility
- Maintain state during tool switching

## Component Interface

### Public API
```javascript
class ToolDetailsPanel {
  // Initialization
  constructor(container: HTMLElement, dataProcessor: EnterpriseDataProcessor)
  
  // Core Methods
  showTool(tool: Tool): void
  hideTool(): void
  updateTool(tool: Tool): void
  isOpen(): boolean
  
  // Tab Management
  setActiveTab(tabId: string): void
  getActiveTab(): string
  
  // Actions
  compareTool(toolId: number): void
  exportToolReport(format: 'pdf' | 'excel'): void
  shareToolLink(): void
  
  // Related Tools
  loadRelatedTools(): void
  loadAlternatives(): void
  
  // Event Handling
  onClose(callback: Function): void
  onCompare(callback: Function): void
  onAction(action: string, callback: Function): void
}
```

### Data Structures
```typescript
interface ToolDetails {
  // Basic Info
  id: number
  name: string
  url: string
  category: string
  description: string
  
  // Metrics
  businessImpact: number
  complexity: number
  timeToValue: string
  learningCurve: string
  
  // Financial
  pricing: PricingInfo
  tco: TCOCalculation
  roi: ROIEstimate
  
  // Features
  features: string[]
  integrations: Integration[]
  limitations: string[]
  
  // Additional
  caseStudies: CaseStudy[]
  alternatives: Tool[]
  relatedTools: Tool[]
}

interface TabConfig {
  id: string
  label: string
  icon: string
  component: Component
}
```

## Visual Design

### Panel Layout
```
┌─────────────────────────────────────┐
│ × │          Tool Name              │
├─────────────────────────────────────┤
│ [Overview][Features][Costs][Reviews]│
├─────────────────────────────────────┤
│                                     │
│         Tab Content Area            │
│                                     │
├─────────────────────────────────────┤
│ Related Tools                       │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │Tool │ │Tool │ │Tool │           │
│ └─────┘ └─────┘ └─────┘           │
├─────────────────────────────────────┤
│ [Compare] [Export] [Share]          │
└─────────────────────────────────────┘
```

## Implementation Details

### HTML Structure
```html
<aside 
  class="details-panel" 
  id="detailsPanel"
  role="complementary"
  aria-label="Tool Details"
  aria-hidden="true"
>
  <!-- Header -->
  <header class="details-header">
    <button 
      class="close-details" 
      aria-label="Close details panel"
      type="button"
    >
      <svg class="icon-close"><!-- Close icon --></svg>
    </button>
    <div class="details-title">
      <h2 class="tool-name">Select a tool</h2>
      <a class="tool-url" href="#" target="_blank" rel="noopener">
        Visit website
        <svg class="icon-external"><!-- External link icon --></svg>
      </a>
    </div>
  </header>

  <!-- Tabs -->
  <nav class="details-tabs" role="tablist">
    <button 
      role="tab" 
      aria-selected="true" 
      aria-controls="tab-overview"
      class="tab-button active" 
      data-tab="overview"
    >
      <svg class="tab-icon"><!-- Overview icon --></svg>
      <span>Overview</span>
    </button>
    <button 
      role="tab" 
      aria-selected="false" 
      aria-controls="tab-features"
      class="tab-button" 
      data-tab="features"
    >
      <svg class="tab-icon"><!-- Features icon --></svg>
      <span>Features</span>
    </button>
    <button 
      role="tab" 
      aria-selected="false" 
      aria-controls="tab-financial"
      class="tab-button" 
      data-tab="financial"
    >
      <svg class="tab-icon"><!-- Dollar icon --></svg>
      <span>Costs & ROI</span>
    </button>
    <button 
      role="tab" 
      aria-selected="false" 
      aria-controls="tab-reviews"
      class="tab-button" 
      data-tab="reviews"
    >
      <svg class="tab-icon"><!-- Star icon --></svg>
      <span>Reviews</span>
    </button>
  </nav>

  <!-- Tab Content -->
  <div class="details-content">
    <!-- Overview Tab -->
    <div 
      id="tab-overview" 
      role="tabpanel" 
      class="tab-panel active"
      data-tab="overview"
    >
      <section class="detail-section">
        <h3>Description</h3>
        <p class="tool-description"></p>
      </section>

      <section class="detail-section metrics-grid">
        <div class="metric-card">
          <h4>Business Impact</h4>
          <div class="big-number impact-score">0</div>
          <div class="metric-bar">
            <div class="metric-fill"></div>
          </div>
        </div>
        <div class="metric-card">
          <h4>Complexity</h4>
          <div class="complexity-visual">
            <span class="complexity-number">0</span>
            <span class="complexity-label">of 5</span>
          </div>
          <div class="complexity-dots">
            <!-- Dots rendered here -->
          </div>
        </div>
        <div class="metric-card">
          <h4>Time to Value</h4>
          <div class="time-value">--</div>
        </div>
        <div class="metric-card">
          <h4>Learning Curve</h4>
          <div class="learning-curve">--</div>
        </div>
      </section>

      <section class="detail-section">
        <h3>Key Benefits</h3>
        <ul class="benefits-list">
          <!-- Benefits rendered here -->
        </ul>
      </section>
    </div>

    <!-- Features Tab -->
    <div 
      id="tab-features" 
      role="tabpanel" 
      class="tab-panel"
      data-tab="features"
      hidden
    >
      <section class="detail-section">
        <h3>Core Features</h3>
        <div class="features-grid">
          <!-- Feature cards rendered here -->
        </div>
      </section>

      <section class="detail-section">
        <h3>Integrations</h3>
        <div class="integrations-list">
          <!-- Integration badges rendered here -->
        </div>
      </section>

      <section class="detail-section">
        <h3>Limitations</h3>
        <ul class="limitations-list">
          <!-- Limitations rendered here -->
        </ul>
      </section>
    </div>

    <!-- Financial Tab -->
    <div 
      id="tab-financial" 
      role="tabpanel" 
      class="tab-panel"
      data-tab="financial"
      hidden
    >
      <section class="detail-section">
        <h3>Pricing Model</h3>
        <div class="pricing-details">
          <!-- Pricing tiers rendered here -->
        </div>
      </section>

      <section class="detail-section">
        <h3>Total Cost of Ownership (3 Year)</h3>
        <div class="tco-breakdown">
          <div class="tco-chart">
            <!-- Chart rendered here -->
          </div>
          <div class="tco-table">
            <!-- Cost breakdown table -->
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h3>ROI Estimate</h3>
        <div class="roi-calculator">
          <!-- ROI inputs and results -->
        </div>
      </section>
    </div>

    <!-- Reviews Tab -->
    <div 
      id="tab-reviews" 
      role="tabpanel" 
      class="tab-panel"
      data-tab="reviews"
      hidden
    >
      <section class="detail-section">
        <h3>Case Studies</h3>
        <div class="case-studies">
          <!-- Case study cards -->
        </div>
      </section>

      <section class="detail-section">
        <h3>User Feedback</h3>
        <div class="feedback-summary">
          <!-- Pros/cons lists -->
        </div>
      </section>
    </div>
  </div>

  <!-- Related Tools -->
  <section class="related-tools">
    <h3>Related Tools</h3>
    <div class="related-tools-grid">
      <!-- Mini tool cards -->
    </div>
  </section>

  <!-- Action Buttons -->
  <footer class="details-actions">
    <button class="action-btn compare-btn">
      <svg class="icon-compare"><!-- Compare icon --></svg>
      Compare
    </button>
    <button class="action-btn export-btn">
      <svg class="icon-export"><!-- Export icon --></svg>
      Export
    </button>
    <button class="action-btn share-btn">
      <svg class="icon-share"><!-- Share icon --></svg>
      Share
    </button>
  </footer>
</aside>
```

### CSS Styling
```css
/* Details Panel Container */
.details-panel {
  --panel-width: 400px;
  
  position: fixed;
  top: var(--nav-height);
  right: 0;
  bottom: 0;
  width: var(--panel-width);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.details-panel.open {
  transform: translateX(0);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
}

/* Header */
.details-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
}

.close-details {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-details:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.tool-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  padding-right: 40px;
}

.tool-url {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  margin-top: 8px;
}

.tool-url:hover {
  text-decoration: underline;
}

/* Tabs */
.details-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-button {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.tab-button.active {
  color: var(--color-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}

.tab-icon {
  width: 20px;
  height: 20px;
}

/* Content Area */
.details-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metric-card {
  background: var(--color-surface-elevated);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.metric-card h4 {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.big-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
}

.complexity-visual {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.complexity-number {
  font-size: 36px;
  font-weight: 700;
}

.complexity-label {
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* Features Grid */
.features-grid {
  display: grid;
  gap: 12px;
}

.feature-card {
  padding: 12px;
  background: var(--color-surface-elevated);
  border-radius: 6px;
  display: flex;
  align-items: start;
  gap: 12px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--color-primary);
}

/* Integrations */
.integrations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.integration-badge {
  padding: 6px 12px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Related Tools */
.related-tools {
  padding: 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
}

.related-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.mini-tool-card {
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-tool-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* Action Buttons */
.details-actions {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  background: var(--color-surface);
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Loading State */
.details-panel.loading .details-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .details-panel {
    width: 100%;
    max-width: 100%;
  }
}
```

### JavaScript Implementation
```javascript
class ToolDetailsPanel {
  constructor(container, dataProcessor) {
    this.container = container;
    this.dataProcessor = dataProcessor;
    
    this.state = {
      currentTool: null,
      activeTab: 'overview',
      isOpen: false,
      relatedTools: [],
      compareList: []
    };
    
    this.callbacks = {
      close: new Set(),
      compare: new Set(),
      action: new Map()
    };
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
  }

  cacheElements() {
    this.elements = {
      panel: this.container,
      closeBtn: this.container.querySelector('.close-details'),
      toolName: this.container.querySelector('.tool-name'),
      toolUrl: this.container.querySelector('.tool-url'),
      tabs: this.container.querySelectorAll('.tab-button'),
      panels: this.container.querySelectorAll('.tab-panel'),
      
      // Overview elements
      description: this.container.querySelector('.tool-description'),
      impactScore: this.container.querySelector('.impact-score'),
      impactBar: this.container.querySelector('.metric-fill'),
      complexityNumber: this.container.querySelector('.complexity-number'),
      complexityDots: this.container.querySelector('.complexity-dots'),
      timeValue: this.container.querySelector('.time-value'),
      learningCurve: this.container.querySelector('.learning-curve'),
      benefitsList: this.container.querySelector('.benefits-list'),
      
      // Action buttons
      compareBtn: this.container.querySelector('.compare-btn'),
      exportBtn: this.container.querySelector('.export-btn'),
      shareBtn: this.container.querySelector('.share-btn'),
      
      // Related tools
      relatedGrid: this.container.querySelector('.related-tools-grid')
    };
  }

  attachEventListeners() {
    // Close button
    this.elements.closeBtn.addEventListener('click', () => {
      this.hideTool();
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.hideTool();
      }
    });
    
    // Tab switching
    this.elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setActiveTab(tab.dataset.tab);
      });
      
      // Keyboard navigation
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          const next = tab.nextElementSibling || this.elements.tabs[0];
          next.focus();
          next.click();
        } else if (e.key === 'ArrowLeft') {
          const prev = tab.previousElementSibling || 
                       this.elements.tabs[this.elements.tabs.length - 1];
          prev.focus();
          prev.click();
        }
      });
    });
    
    // Action buttons
    this.elements.compareBtn.addEventListener('click', () => {
      this.handleCompare();
    });
    
    this.elements.exportBtn.addEventListener('click', () => {
      this.handleExport();
    });
    
    this.elements.shareBtn.addEventListener('click', () => {
      this.handleShare();
    });
    
    // Related tools delegation
    this.elements.relatedGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.mini-tool-card');
      if (card) {
        const toolId = parseInt(card.dataset.toolId);
        const tool = this.dataProcessor.getToolById(toolId);
        if (tool) {
          this.showTool(tool);
        }
      }
    });
  }

  showTool(tool) {
    if (!tool) return;
    
    this.state.currentTool = tool;
    this.state.isOpen = true;
    
    // Update UI
    this.updateOverviewTab(tool);
    this.updateFeaturesTab(tool);
    this.updateFinancialTab(tool);
    this.updateReviewsTab(tool);
    this.loadRelatedTools(tool);
    
    // Show panel
    this.elements.panel.classList.add('open');
    this.elements.panel.setAttribute('aria-hidden', 'false');
    
    // Announce to screen readers
    this.announceToolChange(tool);
    
    // Focus management
    this.elements.closeBtn.focus();
  }

  hideTool() {
    this.state.isOpen = false;
    
    // Hide panel
    this.elements.panel.classList.remove('open');
    this.elements.panel.setAttribute('aria-hidden', 'true');
    
    // Notify listeners
    this.callbacks.close.forEach(cb => cb());
    
    // Return focus to the tool that was selected
    if (this.state.currentTool) {
      const toolCard = document.querySelector(
        `[data-tool-id="${this.state.currentTool.id}"]`
      );
      if (toolCard) {
        toolCard.focus();
      }
    }
  }

  updateOverviewTab(tool) {
    // Basic info
    this.elements.toolName.textContent = tool.tool_name;
    this.elements.toolUrl.href = tool.url || '#';
    this.elements.description.textContent = tool.description || 
      'No description available.';
    
    // Metrics
    this.elements.impactScore.textContent = tool.business_impact_score;
    this.elements.impactBar.style.width = `${tool.business_impact_score}%`;
    
    this.elements.complexityNumber.textContent = tool.complexity_score;
    this.renderComplexityDots(tool.complexity_score);
    
    this.elements.timeValue.textContent = tool.time_to_value || 'N/A';
    this.elements.learningCurve.textContent = tool.learning_curve || 'N/A';
    
    // Benefits
    const benefits = this.extractBenefits(tool);
    this.elements.benefitsList.innerHTML = benefits
      .map(benefit => `<li>${this.escapeHtml(benefit)}</li>`)
      .join('');
  }

  updateFeaturesTab(tool) {
    const featuresPanel = this.container.querySelector('[data-tab="features"]');
    
    // Features
    const features = this.parseFeatures(tool.feature_breakdown);
    const featuresGrid = featuresPanel.querySelector('.features-grid');
    featuresGrid.innerHTML = features.map(feature => `
      <div class="feature-card">
        <svg class="feature-icon"><!-- Check icon --></svg>
        <div>
          <strong>${this.escapeHtml(feature.title)}</strong>
          <p>${this.escapeHtml(feature.description)}</p>
        </div>
      </div>
    `).join('');
    
    // Integrations
    const integrations = this.parseIntegrations(tool.integration_potential);
    const integrationsList = featuresPanel.querySelector('.integrations-list');
    integrationsList.innerHTML = integrations.map(integration => `
      <span class="integration-badge">
        <svg class="integration-icon"><!-- Link icon --></svg>
        ${this.escapeHtml(integration)}
      </span>
    `).join('');
    
    // Limitations
    const limitations = this.parseLimitations(tool.pros_cons_limitations);
    const limitationsList = featuresPanel.querySelector('.limitations-list');
    limitationsList.innerHTML = limitations.map(limitation => 
      `<li>${this.escapeHtml(limitation)}</li>`
    ).join('');
  }

  updateFinancialTab(tool) {
    const financialPanel = this.container.querySelector('[data-tab="financial"]');
    
    // Pricing
    const pricingDetails = financialPanel.querySelector('.pricing-details');
    pricingDetails.innerHTML = this.renderPricingDetails(tool.pricing_model);
    
    // TCO Calculation
    const tco = this.dataProcessor.calculateTCO(tool.tool_name, {
      years: 3,
      teamSize: 50
    });
    
    this.renderTCOBreakdown(tco, financialPanel);
    
    // ROI Estimate
    const roi = this.dataProcessor.calculateROI(tool);
    this.renderROIEstimate(roi, financialPanel);
  }

  updateReviewsTab(tool) {
    const reviewsPanel = this.container.querySelector('[data-tab="reviews"]');
    
    // Case Studies
    const caseStudies = this.parseCaseStudies(tool.case_studies);
    const caseStudiesContainer = reviewsPanel.querySelector('.case-studies');
    caseStudiesContainer.innerHTML = caseStudies.map(study => `
      <div class="case-study-card">
        <h4>${this.escapeHtml(study.title)}</h4>
        <p>${this.escapeHtml(study.description)}</p>
        <div class="case-study-metrics">
          ${study.metrics.map(metric => 
            `<span class="metric">${this.escapeHtml(metric)}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
    
    // Pros and Cons
    const feedback = this.parseFeedback(tool.pros_cons_limitations);
    const feedbackSummary = reviewsPanel.querySelector('.feedback-summary');
    feedbackSummary.innerHTML = `
      <div class="pros-cons-grid">
        <div class="pros">
          <h4>Pros</h4>
          <ul>
            ${feedback.pros.map(pro => 
              `<li>${this.escapeHtml(pro)}</li>`
            ).join('')}
          </ul>
        </div>
        <div class="cons">
          <h4>Cons</h4>
          <ul>
            ${feedback.cons.map(con => 
              `<li>${this.escapeHtml(con)}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  loadRelatedTools(tool) {
    // Find tools in same category with similar impact
    const related = this.dataProcessor.tools
      .filter(t => 
        t.id !== tool.id && 
        t.category === tool.category &&
        Math.abs(t.business_impact_score - tool.business_impact_score) < 20
      )
      .slice(0, 6);
    
    this.state.relatedTools = related;
    
    // Render mini cards
    this.elements.relatedGrid.innerHTML = related.map(t => `
      <div class="mini-tool-card" data-tool-id="${t.id}">
        <div class="mini-tool-name">${this.escapeHtml(t.tool_name)}</div>
        <div class="mini-tool-score">${t.business_impact_score}</div>
      </div>
    `).join('');
  }

  setActiveTab(tabId) {
    if (tabId === this.state.activeTab) return;
    
    this.state.activeTab = tabId;
    
    // Update tabs
    this.elements.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
    
    // Update panels
    this.elements.panels.forEach(panel => {
      const isActive = panel.dataset.tab === tabId;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
  }

  renderComplexityDots(level) {
    const dots = Array.from({ length: 5 }, (_, i) => 
      `<span class="complexity-dot ${i < level ? 'filled' : ''}"></span>`
    ).join('');
    
    this.elements.complexityDots.innerHTML = dots;
  }

  handleCompare() {
    if (!this.state.currentTool) return;
    
    this.callbacks.compare.forEach(cb => cb(this.state.currentTool));
    
    // Visual feedback
    this.elements.compareBtn.classList.add('added');
    setTimeout(() => {
      this.elements.compareBtn.classList.remove('added');
    }, 1000);
  }

  handleExport() {
    const exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';
    exportMenu.innerHTML = `
      <button data-format="pdf">Export as PDF</button>
      <button data-format="excel">Export as Excel</button>
    `;
    
    exportMenu.addEventListener('click', (e) => {
      const format = e.target.dataset.format;
      if (format) {
        this.exportToolReport(format);
        document.body.removeChild(exportMenu);
      }
    });
    
    // Position near button
    const rect = this.elements.exportBtn.getBoundingClientRect();
    exportMenu.style.position = 'fixed';
    exportMenu.style.top = `${rect.top - 80}px`;
    exportMenu.style.right = '20px';
    
    document.body.appendChild(exportMenu);
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!exportMenu.contains(e.target)) {
          document.body.removeChild(exportMenu);
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }

  handleShare() {
    const url = new URL(window.location);
    url.searchParams.set('tool', this.state.currentTool.id);
    
    if (navigator.share) {
      navigator.share({
        title: `${this.state.currentTool.tool_name} - AI Tool Analysis`,
        url: url.toString()
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(url.toString());
      
      // Show feedback
      const feedback = document.createElement('div');
      feedback.className = 'share-feedback';
      feedback.textContent = 'Link copied to clipboard!';
      this.elements.shareBtn.appendChild(feedback);
      
      setTimeout(() => {
        feedback.remove();
      }, 2000);
    }
  }

  exportToolReport(format) {
    const tool = this.state.currentTool;
    if (!tool) return;
    
    const reportData = {
      tool: tool,
      tco: this.dataProcessor.calculateTCO(tool.tool_name),
      roi: this.dataProcessor.calculateROI(tool),
      alternatives: this.state.relatedTools
    };
    
    if (format === 'pdf') {
      // Generate PDF report
      this.generatePDFReport(reportData);
    } else if (format === 'excel') {
      // Generate Excel report
      this.generateExcelReport(reportData);
    }
  }

  announceToolChange(tool) {
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Now viewing details for ${tool.tool_name}`;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Utility methods
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  extractBenefits(tool) {
    // Extract from feature_breakdown or use_cases
    const benefits = [];
    
    if (tool.use_cases_in_pr) {
      benefits.push(...tool.use_cases_in_pr.slice(0, 3));
    }
    
    return benefits;
  }

  parseFeatures(featureBreakdown) {
    if (!featureBreakdown) return [];
    
    // Parse feature string into structured data
    const features = featureBreakdown.split(';').map(feature => {
      const parts = feature.trim().split(':');
      return {
        title: parts[0] || feature,
        description: parts[1] || ''
      };
    });
    
    return features.slice(0, 6); // Limit to 6 features
  }

  parseIntegrations(integrationPotential) {
    if (!integrationPotential) return [];
    
    // Extract integration names
    const integrations = [];
    const patterns = [
      /integrates with ([^,\.]+)/gi,
      /compatible with ([^,\.]+)/gi,
      /connects to ([^,\.]+)/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = integrationPotential.matchAll(pattern);
      for (const match of matches) {
        integrations.push(match[1].trim());
      }
    });
    
    return [...new Set(integrations)]; // Remove duplicates
  }

  parseLimitations(prosConsLimitations) {
    if (!prosConsLimitations) return [];
    
    // Extract limitations/cons
    const limitations = [];
    const limitSection = prosConsLimitations.match(/limitations?:([^.]+)/i);
    const consSection = prosConsLimitations.match(/cons?:([^.]+)/i);
    
    if (limitSection) {
      limitations.push(...limitSection[1].split(',').map(l => l.trim()));
    }
    
    if (consSection) {
      limitations.push(...consSection[1].split(',').map(c => c.trim()));
    }
    
    return limitations.filter(l => l.length > 0);
  }

  parseCaseStudies(caseStudiesText) {
    if (!caseStudiesText) return [];
    
    // Parse case studies into structured format
    const studies = [];
    const sentences = caseStudiesText.split('.');
    
    sentences.forEach(sentence => {
      if (sentence.length > 20) {
        // Extract metrics from sentence
        const metrics = [];
        const percentMatch = sentence.match(/(\d+%)/g);
        const dollarMatch = sentence.match(/\$[\d,]+/g);
        const timeMatch = sentence.match(/(\d+\s*(hours?|days?|weeks?|months?))/gi);
        
        if (percentMatch) metrics.push(...percentMatch);
        if (dollarMatch) metrics.push(...dollarMatch);
        if (timeMatch) metrics.push(...timeMatch);
        
        studies.push({
          title: 'Customer Success Story',
          description: sentence.trim(),
          metrics: metrics
        });
      }
    });
    
    return studies.slice(0, 3); // Limit to 3 case studies
  }

  parseFeedback(prosConsText) {
    if (!prosConsText) return { pros: [], cons: [] };
    
    const feedback = { pros: [], cons: [] };
    
    // Extract pros
    const prosMatch = prosConsText.match(/pros?:([^;]+)/i);
    if (prosMatch) {
      feedback.pros = prosMatch[1]
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }
    
    // Extract cons
    const consMatch = prosConsText.match(/cons?:([^;]+)/i);
    if (consMatch) {
      feedback.cons = consMatch[1]
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
    }
    
    return feedback;
  }

  // Event handling
  onClose(callback) {
    this.callbacks.close.add(callback);
    return () => this.callbacks.close.delete(callback);
  }

  onCompare(callback) {
    this.callbacks.compare.add(callback);
    return () => this.callbacks.compare.delete(callback);
  }

  onAction(action, callback) {
    if (!this.callbacks.action.has(action)) {
      this.callbacks.action.set(action, new Set());
    }
    this.callbacks.action.get(action).add(callback);
    return () => this.callbacks.action.get(action).delete(callback);
  }
}
```

## Integration Points

### Panel Control
```javascript
// From portfolio grid
portfolioGrid.onToolSelect((tool) => {
  detailsPanel.showTool(tool);
});

// Close panel
detailsPanel.onClose(() => {
  document.body.classList.remove('details-open');
});
```

### Compare Feature
```javascript
detailsPanel.onCompare((tool) => {
  compareManager.addTool(tool);
  compareButton.updateCount(compareManager.getCount());
});
```

## Accessibility Features

- Focus management on open/close
- Keyboard navigation for tabs
- Screen reader announcements
- ARIA labels and roles
- Escape key to close
- Tab trapping when open

## Performance Considerations

- Lazy load tab content
- Debounce resize events
- Cache parsed data
- Minimize reflows
- Use CSS transforms for animations

## Testing Strategy

```javascript
describe('ToolDetailsPanel', () => {
  test('displays tool information correctly', () => {
    const tool = mockTools[0];
    detailsPanel.showTool(tool);
    
    expect(detailsPanel.elements.toolName.textContent).toBe(tool.tool_name);
    expect(detailsPanel.elements.impactScore.textContent).toBe(tool.business_impact_score.toString());
  });
  
  test('switches tabs properly', () => {
    detailsPanel.setActiveTab('features');
    
    expect(detailsPanel.state.activeTab).toBe('features');
    expect(detailsPanel.container.querySelector('[data-tab="features"]').hidden).toBe(false);
  });
  
  test('handles keyboard navigation', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    
    expect(detailsPanel.isOpen()).toBe(false);
  });
});
```