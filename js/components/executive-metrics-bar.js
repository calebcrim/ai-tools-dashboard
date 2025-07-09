/**
 * Executive Metrics Bar Component
 * Displays key portfolio metrics with real-time updates and animations
 */
class ExecutiveMetricsBar {
    constructor(container, dataProcessor) {
        this.container = container;
        this.dataProcessor = dataProcessor;
        
        // Current metric values
        this.metrics = {
            quickWins: { value: 0, previousValue: 0, isLoading: true },
            strategic: { value: 0, previousValue: 0, isLoading: true },
            savings: { value: 0, previousValue: 0, isLoading: true },
            roi: { value: 0, previousValue: 0, isLoading: true }
        };
        
        // Metric configurations
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
                color: 'var(--color-accent)'
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
                color: 'var(--color-secondary)'
            }
        };
        
        // DOM element references
        this.metricElements = {};
        
        // Event handlers
        this.clickHandlers = new Map();
        
        // Initialize component
        this.init();
    }
    
    init() {
        this.setupDOM();
        this.attachEventListeners();
        this.updateResponsiveLayout();
        
        // Initial data load
        if (this.dataProcessor) {
            this.updateFromDataProcessor();
        }
    }
    
    setupDOM() {
        // Get metric containers - support both old and inline versions
        const metricItems = this.container.querySelectorAll('.metric-item, .metric-item-inline');
        
        metricItems.forEach(item => {
            const metricType = item.dataset.metric;
            if (metricType && this.config[metricType]) {
                this.metricElements[metricType] = {
                    container: item,
                    value: item.querySelector('.metric-value'),
                    label: item.querySelector('.metric-label'),
                    sublabel: item.querySelector('.metric-sublabel'),
                    icon: item.querySelector('.metric-icon')
                };
                
                // Remove loading class when ready
                item.classList.remove('loading');
            }
        });
    }
    
    attachEventListeners() {
        // Click handlers for each metric
        Object.keys(this.metricElements).forEach(type => {
            const element = this.metricElements[type].container;
            
            // Click event
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMetricClick(type);
            });
            
            // Keyboard accessibility
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleMetricClick(type);
                }
            });
            
            // Hover effects
            element.addEventListener('mouseenter', () => {
                element.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('hover');
            });
        });
        
        // Responsive layout observer
        this.resizeObserver = new ResizeObserver(this.debounce(() => {
            this.updateResponsiveLayout();
        }, 100));
        this.resizeObserver.observe(this.container);
        
        // Listen for window resize
        window.addEventListener('resize', this.debounce(() => {
            this.updateResponsiveLayout();
        }, 100));
    }
    
    updateMetrics(newMetrics) {
        Object.entries(newMetrics).forEach(([type, value]) => {
            if (this.metrics[type] !== undefined && this.metricElements[type]) {
                const oldValue = this.metrics[type].value;
                
                // Update stored values
                this.metrics[type].previousValue = oldValue;
                this.metrics[type].value = value;
                this.metrics[type].isLoading = false;
                
                // Animate the change
                this.animateMetricChange(type, oldValue, value);
            }
        });
    }
    
    animateMetricChange(type, oldValue, newValue) {
        const element = this.metricElements[type];
        const config = this.config[type];
        
        if (!element || !element.value) return;
        
        // Remove loading state
        element.value.classList.remove('loading');
        
        // Add changing animation
        element.value.classList.add('changing');
        
        // Determine if this is a significant change
        const isSignificantChange = this.isSignificantChange(type, oldValue, newValue);
        
        // Update the displayed value
        const formattedValue = config.formatter(newValue);
        
        // Animate number change for significant updates
        if (isSignificantChange && oldValue !== 0) {
            this.animateNumber(element.value, oldValue, newValue, config.formatter);
        } else {
            element.value.textContent = formattedValue;
        }
        
        // Add trend indicator if needed
        if (isSignificantChange && oldValue !== 0) {
            this.showTrendIndicator(element.container, oldValue, newValue);
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.value.classList.remove('changing');
        }, 300);
    }
    
    animateNumber(element, start, end, formatter) {
        const duration = 500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out animation
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = start + (end - start) * easeOutProgress;
            
            element.textContent = formatter(Math.round(currentValue));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    isSignificantChange(type, oldValue, newValue) {
        // Define thresholds for significant changes
        const thresholds = {
            quickWins: 5,
            strategic: 2,
            savings: 10000,
            roi: 10
        };
        
        const threshold = thresholds[type] || 0;
        const change = Math.abs(newValue - oldValue);
        
        return change >= threshold;
    }
    
    showTrendIndicator(container, oldValue, newValue) {
        // Create or get trend element
        let trendElement = container.querySelector('.metric-trend');
        if (!trendElement) {
            trendElement = document.createElement('div');
            trendElement.className = 'metric-trend';
            container.appendChild(trendElement);
        }
        
        // Calculate percentage change
        const percentChange = Math.round(((newValue - oldValue) / oldValue) * 100);
        const isPositive = newValue > oldValue;
        
        // Update trend indicator
        trendElement.textContent = `${isPositive ? '+' : ''}${percentChange}%`;
        trendElement.className = `metric-trend ${isPositive ? 'up' : 'down'}`;
        
        // Fade out after delay
        setTimeout(() => {
            trendElement.style.opacity = '0';
            setTimeout(() => {
                trendElement.remove();
            }, 300);
        }, 3000);
    }
    
    handleMetricClick(type) {
        // Visual feedback
        this.highlightMetric(type);
        
        // Emit custom event
        const event = new CustomEvent('metricClick', {
            detail: {
                type,
                value: this.metrics[type].value,
                config: this.config[type]
            },
            bubbles: true
        });
        this.container.dispatchEvent(event);
        
        // Call registered click handler if exists
        if (this.clickHandlers.has(type)) {
            const handler = this.clickHandlers.get(type);
            handler(this.metrics[type].value);
        }
    }
    
    highlightMetric(type) {
        const element = this.metricElements[type];
        if (!element) return;
        
        // Add active class
        element.container.classList.add('active');
        
        // Remove active class from others
        Object.keys(this.metricElements).forEach(otherType => {
            if (otherType !== type) {
                this.metricElements[otherType].container.classList.remove('active');
            }
        });
        
        // Remove active class after delay
        setTimeout(() => {
            element.container.classList.remove('active');
        }, 2000);
    }
    
    onMetricClick(metricType, callback) {
        this.clickHandlers.set(metricType, callback);
    }
    
    formatCurrency(value) {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${Math.round(value / 1000)}k`;
        }
        return `$${value}`;
    }
    
    showLoading() {
        Object.values(this.metricElements).forEach(element => {
            element.value.classList.add('loading');
        });
    }
    
    hideLoading() {
        Object.values(this.metricElements).forEach(element => {
            element.value.classList.remove('loading');
        });
    }
    
    updateResponsiveLayout() {
        const width = this.container.offsetWidth;
        const metricsContainer = this.container.querySelector('.metrics-container');
        
        if (!metricsContainer) return;
        
        // Remove all layout classes
        metricsContainer.classList.remove('compact', 'mobile', 'ultra-compact');
        
        // Apply appropriate layout class
        if (width < 480) {
            metricsContainer.classList.add('ultra-compact');
        } else if (width < 768) {
            metricsContainer.classList.add('mobile');
        } else if (width < 1200) {
            metricsContainer.classList.add('compact');
        }
    }
    
    updateFromDataProcessor() {
        if (!this.dataProcessor || !this.dataProcessor.metrics) return;
        
        const metrics = this.dataProcessor.metrics;
        
        // Calculate metrics from processed data
        const updates = {
            quickWins: metrics.quickWins || 0,
            strategic: metrics.strategicTools || 0,
            savings: metrics.totalSavings || 0,
            roi: Math.round(metrics.averageROI || 0)
        };
        
        this.updateMetrics(updates);
    }
    
    refresh() {
        this.showLoading();
        
        // Simulate data refresh
        setTimeout(() => {
            this.updateFromDataProcessor();
            this.hideLoading();
        }, 300);
    }
    
    // Utility function to debounce events
    debounce(func, wait) {
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
    
    // Clean up
    destroy() {
        // Remove event listeners
        Object.keys(this.metricElements).forEach(type => {
            const element = this.metricElements[type].container;
            element.replaceWith(element.cloneNode(true));
        });
        
        // Stop observing
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Clear handlers
        this.clickHandlers.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExecutiveMetricsBar;
}

// Make available globally
window.ExecutiveMetricsBar = ExecutiveMetricsBar;