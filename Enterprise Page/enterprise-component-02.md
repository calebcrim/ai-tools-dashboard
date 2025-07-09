# Executive Metrics Bar Component Specification

## Component Overview
The Executive Metrics Bar is a fixed horizontal bar that displays key portfolio metrics for executive decision-making. It replaces the previous sidebar metrics with a more prominent, always-visible display that updates in real-time as filters are applied.

## Responsibilities
- Display four key metrics: Quick Wins, Strategic Tools, Potential Savings, Average ROI
- Update metrics in real-time as filters change
- Provide visual feedback during updates
- Support click interactions for metric deep-dives
- Maintain visibility during scrolling
- Adapt responsively for mobile devices

## Component Interface

### Public API
```javascript
class ExecutiveMetricsBar {
  // Initialization
  constructor(container: HTMLElement, dataProcessor: EnterpriseDataProcessor)
  
  // Core Methods
  render(): void
  updateMetrics(metrics: ExecutiveMetrics): void
  showLoading(): void
  hideLoading(): void
  
  // Interaction Methods
  onMetricClick(metricType: MetricType, callback: Function): void
  highlightMetric(metricType: MetricType): void
  animateChange(metricType: MetricType, oldValue: number, newValue: number): void
  
  // Responsive Methods
  setCompactMode(isCompact: boolean): void
  updateLayout(): void
}
```

### Data Structures
```typescript
interface MetricConfig {
  type: MetricType
  icon: string
  label: string
  sublabel: string
  formatter: (value: number) => string
  color: string
  clickable: boolean
}

type MetricType = 'quickWins' | 'strategic' | 'savings' | 'roi'

interface MetricState {
  value: number
  previousValue: number
  isLoading: boolean
  trend: 'up' | 'down' | 'stable'
}
```

## Visual Design

### Desktop Layout (1400px+)
```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 58           ♔ 4              💰 $257k         📈 69%       │
│  Quick Wins      Strategic Tools   Potential       Average ROI   │
│  High impact,    Transform ops     Savings         Portfolio     │
│  Low complexity                    Annual opp.     performance   │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1399px)
```
┌─────────────────────────────────┐
│  🚀 58         ♔ 4              │
│  Quick Wins    Strategic Tools   │
├─────────────────────────────────┤
│  💰 $257k      📈 69%           │
│  Savings       Average ROI       │
└─────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────┐
│  🚀 58  |  ♔ 4  │
│  💰 257k | 📈69%│
└─────────────────┘
```

## Implementation Details

### HTML Structure
```html
<div class="executive-metrics-bar" role="region" aria-label="Executive Metrics">
  <div class="metrics-container">
    <div class="metric-item" data-metric="quickWins" tabindex="0" role="button">
      <div class="metric-icon" aria-hidden="true">🚀</div>
      <div class="metric-content">
        <div class="metric-value">
          <span class="value-number">0</span>
          <span class="value-change" aria-label="Change"></span>
        </div>
        <div class="metric-label">Quick Wins</div>
        <div class="metric-sublabel">High impact, Low complexity</div>
      </div>
      <div class="metric-loading" aria-hidden="true">
        <div class="spinner"></div>
      </div>
    </div>
    <!-- Repeat for other metrics -->
  </div>
</div>
```

### CSS Styling
```css
.executive-metrics-bar {
  --metric-height: 80px;
  --icon-size: 32px;
  --value-size: 28px;
  --label-size: 14px;
  --sublabel-size: 12px;
  
  position: sticky;
  top: var(--nav-height);
  height: var(--metric-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.metric-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid var(--color-border-light);
}

.metric-item:hover {
  background: var(--color-surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-item:active {
  transform: translateY(0);
}

.metric-icon {
  font-size: var(--icon-size);
  filter: grayscale(20%);
}

.metric-value {
  font-size: var(--value-size);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.value-change {
  font-size: 14px;
  font-weight: 400;
}

.value-change.positive {
  color: var(--color-success);
}

.value-change.positive::before {
  content: '↑';
}

.value-change.negative {
  color: var(--color-danger);
}

.value-change.negative::before {
  content: '↓';
}

/* Animations */
@keyframes valueChange {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.metric-value.animating {
  animation: valueChange 0.3s ease;
}

/* Loading State */
.metric-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.metric-item.loading .metric-loading {
  opacity: 1;
  pointer-events: all;
}
```

### JavaScript Implementation
```javascript
class ExecutiveMetricsBar {
  constructor(container, dataProcessor) {
    this.container = container;
    this.dataProcessor = dataProcessor;
    this.metrics = {
      quickWins: { value: 0, previousValue: 0 },
      strategic: { value: 0, previousValue: 0 },
      savings: { value: 0, previousValue: 0 },
      roi: { value: 0, previousValue: 0 }
    };
    
    this.config = {
      quickWins: {
        icon: '🚀',
        label: 'Quick Wins',
        sublabel: 'High impact, Low complexity',
        formatter: (v) => v.toString(),
        color: 'var(--color-primary)'
      },
      strategic: {
        icon: '♔',
        label: 'Strategic Tools',
        sublabel: 'Transform operations',
        formatter: (v) => v.toString(),
        color: 'var(--color-secondary)'
      },
      savings: {
        icon: '💰',
        label: 'Potential Savings',
        sublabel: 'Annual opportunity',
        formatter: (v) => this.formatCurrency(v),
        color: 'var(--color-success)'
      },
      roi: {
        icon: '📈',
        label: 'Average ROI',
        sublabel: 'Portfolio performance',
        formatter: (v) => `${v}%`,
        color: 'var(--color-info)'
      }
    };
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.observeDataChanges();
  }

  render() {
    const metricsHTML = Object.entries(this.config).map(([type, config]) => `
      <div class="metric-item" data-metric="${type}" tabindex="0" role="button">
        <div class="metric-icon" aria-hidden="true">${config.icon}</div>
        <div class="metric-content">
          <div class="metric-value">
            <span class="value-number">0</span>
            <span class="value-change" aria-label="Change"></span>
          </div>
          <div class="metric-label">${config.label}</div>
          <div class="metric-sublabel">${config.sublabel}</div>
        </div>
        <div class="metric-loading" aria-hidden="true">
          <div class="spinner"></div>
        </div>
      </div>
    `).join('');
    
    this.container.innerHTML = `
      <div class="metrics-container">
        ${metricsHTML}
      </div>
    `;
    
    // Cache DOM references
    this.metricElements = {};
    Object.keys(this.config).forEach(type => {
      this.metricElements[type] = {
        container: this.container.querySelector(`[data-metric="${type}"]`),
        value: this.container.querySelector(`[data-metric="${type}"] .value-number`),
        change: this.container.querySelector(`[data-metric="${type}"] .value-change`)
      };
    });
  }

  updateMetrics(newMetrics) {
    Object.entries(newMetrics).forEach(([type, value]) => {
      if (this.metrics[type] && this.metricElements[type]) {
        const oldValue = this.metrics[type].value;
        this.metrics[type].previousValue = oldValue;
        this.metrics[type].value = value;
        
        this.animateChange(type, oldValue, value);
      }
    });
  }

  animateChange(type, oldValue, newValue) {
    const element = this.metricElements[type];
    const config = this.config[type];
    
    // Determine trend
    const trend = newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'stable';
    
    // Animate value
    element.value.classList.add('animating');
    element.value.textContent = config.formatter(newValue);
    
    // Show change indicator
    if (trend !== 'stable' && oldValue !== 0) {
      const change = newValue - oldValue;
      const changePercent = Math.round((change / oldValue) * 100);
      element.change.textContent = `${changePercent}%`;
      element.change.className = `value-change ${trend === 'up' ? 'positive' : 'negative'}`;
      element.change.style.opacity = '1';
    } else {
      element.change.style.opacity = '0';
    }
    
    // Remove animation class
    setTimeout(() => {
      element.value.classList.remove('animating');
    }, 300);
  }

  formatCurrency(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }
    return `$${value}`;
  }

  attachEventListeners() {
    // Click handlers for deep dives
    Object.keys(this.metricElements).forEach(type => {
      const element = this.metricElements[type].container;
      
      element.addEventListener('click', () => {
        this.handleMetricClick(type);
      });
      
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleMetricClick(type);
        }
      });
    });
    
    // Responsive layout observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout();
    });
    this.resizeObserver.observe(this.container);
  }

  handleMetricClick(type) {
    // Emit custom event for other components to handle
    const event = new CustomEvent('metricClick', {
      detail: { type, value: this.metrics[type].value }
    });
    this.container.dispatchEvent(event);
    
    // Visual feedback
    this.highlightMetric(type);
  }

  highlightMetric(type) {
    const element = this.metricElements[type].container;
    element.classList.add('highlighted');
    setTimeout(() => {
      element.classList.remove('highlighted');
    }, 500);
  }

  updateLayout() {
    const width = this.container.offsetWidth;
    
    if (width < 768) {
      this.container.classList.add('compact', 'mobile');
    } else if (width < 1400) {
      this.container.classList.add('compact');
      this.container.classList.remove('mobile');
    } else {
      this.container.classList.remove('compact', 'mobile');
    }
  }
}
```

## Integration Points

### Data Source
- Receives metrics from EnterpriseDataProcessor
- Updates when filters are applied
- Refreshes on data reload

### Event Emissions
```javascript
// Metric clicked event
container.addEventListener('metricClick', (e) => {
  const { type, value } = e.detail;
  
  switch(type) {
    case 'quickWins':
      // Apply quick wins filter
      filterPanel.applyQuickWinsFilter();
      break;
    case 'savings':
      // Show savings opportunities modal
      savingsModal.show();
      break;
  }
});
```

## Accessibility

- Keyboard navigable with Tab key
- Enter/Space triggers click actions
- ARIA labels for screen readers
- High contrast mode support
- Reduced motion preferences respected

## Testing Strategy

### Component Tests
```javascript
describe('ExecutiveMetricsBar', () => {
  test('renders all four metrics', () => {
    const bar = new ExecutiveMetricsBar(container, processor);
    expect(container.querySelectorAll('.metric-item')).toHaveLength(4);
  });
  
  test('updates values with animation', async () => {
    bar.updateMetrics({ quickWins: 58 });
    expect(container.querySelector('[data-metric="quickWins"] .value-number'))
      .toHaveTextContent('58');
  });
  
  test('formats currency correctly', () => {
    expect(bar.formatCurrency(257000)).toBe('$257k');
    expect(bar.formatCurrency(2500000)).toBe('$2.5M');
  });
  
  test('responds to resize events', () => {
    window.innerWidth = 600;
    window.dispatchEvent(new Event('resize'));
    expect(container).toHaveClass('mobile');
  });
});
```

## Performance Considerations

- Use CSS transforms for animations (GPU accelerated)
- Debounce resize observer callbacks
- Cache DOM references to avoid repeated queries
- Use requestAnimationFrame for smooth animations
- Minimize reflows during updates