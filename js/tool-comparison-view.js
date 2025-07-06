/**
 * Tool Comparison View Component
 * Vanilla JavaScript implementation of the comprehensive comparison view
 */

class ToolComparisonView {
    constructor(container, adapter) {
        this.container = container;
        this.adapter = adapter || new ToolComparisonAdapter();
        this.tools = [];
        this.expandedSections = {
            basic: true,
            pricing: true,
            features: true,
            useCases: true,
            proscons: true
        };
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'tool-comparison-view';
    }
    
    /**
     * Update the comparison view with new tools
     */
    updateTools(tools) {
        this.tools = this.adapter.transformTools(tools);
        this.render();
    }
    
    /**
     * Main render method
     */
    render() {
        if (this.tools.length === 0) {
            this.container.innerHTML = `
                <div class="comparison-empty">
                    <i class="fas fa-balance-scale"></i>
                    <p>Select up to 3 tools to compare</p>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = `
            <div class="comparison-container">
                <div class="comparison-header">
                    <h2>Tool Comparison</h2>
                    <div class="comparison-actions">
                        <button class="btn-export" onclick="window.exportComparisonData()">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn-print" onclick="window.print()">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
                
                ${this.renderBasicInfo()}
                ${this.renderPricing()}
                ${this.renderFeatures()}
                ${this.renderUseCases()}
                ${this.renderProsCons()}
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    /**
     * Render basic information section
     */
    renderBasicInfo() {
        return `
            <div class="comparison-section ${this.expandedSections.basic ? 'expanded' : ''}">
                <div class="section-header" data-section="basic">
                    <h3>Basic Information</h3>
                    <i class="fas fa-chevron-${this.expandedSections.basic ? 'up' : 'down'}"></i>
                </div>
                
                <div class="section-content">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th class="attribute-col">Attribute</th>
                                ${this.tools.map(tool => `
                                    <th class="tool-col">${this.escapeHtml(tool.name)}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="attribute-name">Category</td>
                                ${this.tools.map(tool => `
                                    <td>${tool.category}</td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="attribute-name">Rating</td>
                                ${this.tools.map(tool => `
                                    <td>
                                        <div class="rating">
                                            <span class="stars">${this.renderStars(tool.rating)}</span>
                                            <span class="rating-value">${tool.rating}/5</span>
                                        </div>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="attribute-name">Website</td>
                                ${this.tools.map(tool => `
                                    <td>
                                        <a href="https://${tool._original.url}" target="_blank" class="tool-link">
                                            ${tool._original.url} <i class="fas fa-external-link-alt"></i>
                                        </a>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="attribute-name">Last Updated</td>
                                ${this.tools.map(tool => `
                                    <td>${tool.lastUpdated}</td>
                                `).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    /**
     * Render pricing section
     */
    renderPricing() {
        // Find max number of tiers across all tools
        const maxTiers = Math.max(...this.tools.map(tool => tool.pricing.tiers.length));
        
        return `
            <div class="comparison-section ${this.expandedSections.pricing ? 'expanded' : ''}">
                <div class="section-header" data-section="pricing">
                    <h3>Pricing Comparison</h3>
                    <i class="fas fa-chevron-${this.expandedSections.pricing ? 'up' : 'down'}"></i>
                </div>
                
                <div class="section-content">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th class="attribute-col">Pricing</th>
                                ${this.tools.map(tool => `
                                    <th class="tool-col">${this.escapeHtml(tool.name)}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="attribute-name">Model Type</td>
                                ${this.tools.map(tool => `
                                    <td>
                                        <span class="pricing-model">${tool.pricing.model}</span>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="attribute-name">Starting Price</td>
                                ${this.tools.map(tool => `
                                    <td>
                                        <span class="starting-price ${tool.pricing.starting === 'Free' ? 'free' : ''}">${tool.pricing.starting}</span>
                                    </td>
                                `).join('')}
                            </tr>
                            ${Array.from({length: maxTiers}, (_, i) => `
                                <tr>
                                    <td class="attribute-name">Tier ${i + 1}</td>
                                    ${this.tools.map(tool => {
                                        const tier = tool.pricing.tiers[i];
                                        if (tier) {
                                            return `
                                                <td>
                                                    <div class="pricing-tier">
                                                        <strong>${tier.name}</strong><br>
                                                        <span class="tier-price">${tier.price}</span><br>
                                                        <span class="tier-users">${tier.users} users</span>
                                                    </div>
                                                </td>
                                            `;
                                        } else {
                                            return '<td><span class="not-available">-</span></td>';
                                        }
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    /**
     * Render features section
     */
    renderFeatures() {
        // Get all unique features
        const allFeatures = new Set();
        this.tools.forEach(tool => {
            Object.keys(tool.features).forEach(feature => allFeatures.add(feature));
        });
        
        // Sort features: standard features first, then alphabetical
        const sortedFeatures = Array.from(allFeatures).sort((a, b) => {
            const aIsStandard = this.adapter.standardFeatures.includes(a);
            const bIsStandard = this.adapter.standardFeatures.includes(b);
            if (aIsStandard && !bIsStandard) return -1;
            if (!aIsStandard && bIsStandard) return 1;
            return a.localeCompare(b);
        });
        
        return `
            <div class="comparison-section ${this.expandedSections.features ? 'expanded' : ''}">
                <div class="section-header" data-section="features">
                    <h3>Feature Comparison</h3>
                    <i class="fas fa-chevron-${this.expandedSections.features ? 'up' : 'down'}"></i>
                </div>
                
                <div class="section-content">
                    <table class="comparison-table features-table">
                        <thead>
                            <tr>
                                <th class="attribute-col">Feature</th>
                                ${this.tools.map(tool => `
                                    <th class="tool-col text-center">${this.escapeHtml(tool.name)}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedFeatures.map(feature => `
                                <tr class="${this.adapter.standardFeatures.includes(feature) ? 'standard-feature' : ''}">
                                    <td class="attribute-name">
                                        ${feature}
                                        ${feature === 'API access' ? '<i class="fas fa-plug feature-icon"></i>' : ''}
                                        ${feature === '24/7 Support' ? '<i class="fas fa-headset feature-icon"></i>' : ''}
                                        ${feature === 'Mobile app' ? '<i class="fas fa-mobile-alt feature-icon"></i>' : ''}
                                    </td>
                                    ${this.tools.map(tool => {
                                        const hasFeature = tool.features[feature];
                                        if (hasFeature === true) {
                                            return '<td class="text-center"><i class="fas fa-check feature-yes"></i></td>';
                                        } else if (hasFeature === false) {
                                            return '<td class="text-center"><i class="fas fa-times feature-no"></i></td>';
                                        } else {
                                            return '<td class="text-center"><i class="fas fa-question feature-unknown"></i></td>';
                                        }
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="feature-legend">
                        <span><i class="fas fa-check feature-yes"></i> Available</span>
                        <span><i class="fas fa-times feature-no"></i> Not Available</span>
                        <span><i class="fas fa-question feature-unknown"></i> Unknown</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render use cases section
     */
    renderUseCases() {
        return `
            <div class="comparison-section ${this.expandedSections.useCases ? 'expanded' : ''}">
                <div class="section-header" data-section="useCases">
                    <h3>Use Cases</h3>
                    <i class="fas fa-chevron-${this.expandedSections.useCases ? 'up' : 'down'}"></i>
                </div>
                
                <div class="section-content">
                    <div class="use-cases-grid">
                        ${this.tools.map(tool => `
                            <div class="use-case-column">
                                <h4>${this.escapeHtml(tool.name)}</h4>
                                <ul class="use-case-list">
                                    ${tool.useCases.map(useCase => `
                                        <li>
                                            <i class="fas fa-check-circle"></i>
                                            ${this.escapeHtml(useCase)}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render pros and cons section
     */
    renderProsCons() {
        return `
            <div class="comparison-section ${this.expandedSections.proscons ? 'expanded' : ''}">
                <div class="section-header" data-section="proscons">
                    <h3>Pros & Cons</h3>
                    <i class="fas fa-chevron-${this.expandedSections.proscons ? 'up' : 'down'}"></i>
                </div>
                
                <div class="section-content">
                    <div class="pros-cons-grid">
                        ${this.tools.map(tool => `
                            <div class="pros-cons-column">
                                <h4>${this.escapeHtml(tool.name)}</h4>
                                
                                <div class="pros-section">
                                    <h5 class="pros-header"><i class="fas fa-plus-circle"></i> Pros</h5>
                                    <ul class="pros-list">
                                        ${tool.pros.map(pro => `
                                            <li>${this.escapeHtml(pro)}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                
                                <div class="cons-section">
                                    <h5 class="cons-header"><i class="fas fa-minus-circle"></i> Cons</h5>
                                    <ul class="cons-list">
                                        ${tool.cons.map(con => `
                                            <li>${this.escapeHtml(con)}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Section toggle handlers
        this.container.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.toggleSection(section);
            });
        });
    }
    
    /**
     * Toggle section expansion
     */
    toggleSection(section) {
        this.expandedSections[section] = !this.expandedSections[section];
        
        const sectionEl = this.container.querySelector(`.comparison-section .section-header[data-section="${section}"]`).parentElement;
        sectionEl.classList.toggle('expanded', this.expandedSections[section]);
        
        const chevron = sectionEl.querySelector('.section-header i');
        chevron.className = `fas fa-chevron-${this.expandedSections[section] ? 'up' : 'down'}`;
    }
    
    /**
     * Export comparison data
     */
    exportData(format = 'json') {
        const originalTools = this.tools.map(t => t._original);
        
        if (format === 'csv') {
            const csv = this.adapter.exportAsCSV(this.tools);
            this.downloadFile(csv, 'tool-comparison.csv', 'text/csv');
        } else if (format === 'markdown') {
            const markdown = this.adapter.exportAsMarkdown(this.tools);
            this.downloadFile(markdown, 'tool-comparison.md', 'text/markdown');
        } else {
            const json = this.adapter.exportAsJSON(this.tools);
            this.downloadFile(json, 'tool-comparison.json', 'application/json');
        }
    }
    
    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get share URL for current comparison
     */
    getShareUrl() {
        const toolIds = this.tools.map(t => t.id).join(',');
        const url = new URL(window.location.href);
        url.searchParams.set('compare', toolIds);
        return url.toString();
    }
    
    /**
     * Copy share URL to clipboard
     */
    copyShareUrl() {
        const url = this.getShareUrl();
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Comparison link copied to clipboard!', 'success');
        });
    }
}