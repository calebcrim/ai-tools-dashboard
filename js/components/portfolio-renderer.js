/**
 * Portfolio Renderer Component (Stub)
 * Will render tool cards in different view modes
 */

class PortfolioRenderer {
    constructor(container, dataProcessor) {
        this.container = container;
        this.dataProcessor = dataProcessor;
        this.viewMode = 'grid'; // grid, list, matrix
        console.log('PortfolioRenderer stub initialized');
    }
    
    init() {
        console.log('PortfolioRenderer init (stub)');
        // TODO: Implement renderer initialization
    }
    
    render(tools) {
        console.log('Rendering tools:', tools.length, 'in', this.viewMode, 'view');
        
        // Basic rendering for testing
        if (this.container) {
            const visibleTools = tools.slice(0, 20); // Show more tools now
            
            const html = visibleTools.map(tool => {
                // Determine color based on quadrant
                let borderColor = '#ddd';
                let badge = '';
                
                if (tool.quadrant === 'quick-wins') {
                    borderColor = '#22c55e';
                    badge = '<span class="card-badge quick-win">🚀 Quick Win</span>';
                } else if (tool.quadrant === 'strategic') {
                    borderColor = '#3b82f6';
                    badge = '<span class="card-badge strategic">♔ Strategic</span>';
                }
                
                return `
                    <div class="tool-card" style="padding: 20px; border: 2px solid ${borderColor}; margin: 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <h3 style="margin: 0; font-size: 1.1rem;">${tool.tool_name}</h3>
                            ${badge}
                        </div>
                        <p style="color: #666; margin: 5px 0; font-size: 0.9rem;">${tool.category}</p>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px;">
                            <div>
                                <small style="color: #999; display: block;">Impact</small>
                                <div style="font-weight: bold; color: ${tool.business_impact_score >= 80 ? '#10b981' : '#333'};">
                                    ${tool.business_impact_score || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <small style="color: #999; display: block;">Complexity</small>
                                <div style="font-weight: bold; color: ${tool.complexity_score <= 2 ? '#10b981' : '#333'};">
                                    ${tool.complexity_score || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <small style="color: #999; display: block;">ROI</small>
                                <div style="font-weight: bold; color: #667eea;">
                                    ${tool.estimatedROI || 0}%
                                </div>
                            </div>
                            <div>
                                <small style="color: #999; display: block;">Price</small>
                                <div style="font-weight: bold; font-size: 0.9rem;">
                                    ${this.formatPrice(tool.pricing_model)}
                                </div>
                            </div>
                        </div>
                        ${tool.brief_purpose_summary ? `
                            <p style="margin-top: 10px; font-size: 0.85rem; color: #555; line-height: 1.4;">
                                ${tool.brief_purpose_summary.substring(0, 100)}${tool.brief_purpose_summary.length > 100 ? '...' : ''}
                            </p>
                        ` : ''}
                    </div>
                `;
            }).join('');
            
            this.container.innerHTML = html + `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p>Showing ${visibleTools.length} of ${tools.length} tools</p>
                    <p style="font-size: 0.9rem;">Virtual scrolling coming soon for better performance</p>
                </div>
            `;
            
            // Add hover effects
            this.container.querySelectorAll('.tool-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                });
            });
        }
    }
    
    formatPrice(pricing) {
        if (!pricing) return 'N/A';
        if (/free/i.test(pricing)) return 'Free';
        if (/contact|enterprise/i.test(pricing)) return 'Enterprise';
        
        // Extract price if possible
        const match = pricing.match(/\$(\d+)/);
        if (match) return `$${match[1]}/mo`;
        
        return pricing.substring(0, 20) + '...';
    }
    
    setViewMode(mode) {
        console.log('Setting view mode:', mode);
        this.viewMode = mode;
        
        // Update container classes for different layouts
        if (this.container && this.container.parentElement) {
            const portfolioSection = this.container.closest('.portfolio-section');
            if (portfolioSection) {
                portfolioSection.classList.remove('grid-view', 'list-view', 'matrix-view');
                portfolioSection.classList.add(`${mode}-view`);
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioRenderer;
}

// Make available globally
window.PortfolioRenderer = PortfolioRenderer;