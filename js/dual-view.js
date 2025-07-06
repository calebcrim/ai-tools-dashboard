// Dual View Management System
class DualViewManager {
    constructor() {
        this.currentView = 'executive';
        this.toolsData = [];
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupViewToggle();
        this.setupSearch();
        this.loadToolsData();
    }

    setupSearch() {
        const searchInput = document.getElementById('dualViewSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTools(e.target.value);
            });
        }
    }

    filterTools(searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!term) {
            this.renderTools();
            return;
        }

        const filtered = this.toolsData.filter(tool => 
            tool.name.toLowerCase().includes(term) ||
            (tool.description && tool.description.toLowerCase().includes(term)) ||
            (tool.category && tool.category.toLowerCase().includes(term))
        );

        if (this.currentView === 'executive') {
            const grid = document.getElementById('executiveGrid');
            grid.innerHTML = filtered.map(tool => this.createExecutiveCard(tool)).join('');
        } else {
            const grid = document.getElementById('technicalGrid');
            grid.innerHTML = filtered.map(tool => this.createTechnicalCard(tool)).join('');
        }

        // Update stats
        this.updateStats(filtered);
    }

    updateStats(tools = null) {
        const toolsToCount = tools || this.toolsData;
        document.getElementById('totalTools').textContent = toolsToCount.length;
        
        const highImpact = toolsToCount.filter(t => t.businessImpact >= 80).length;
        document.getElementById('highImpactTools').textContent = highImpact;
        
        const evaluated = toolsToCount.filter(t => t.description && t.description.length > 50).length;
        document.getElementById('evaluatedTools').textContent = evaluated;
        
        const enterprise = toolsToCount.filter(t => 
            t.compliance.some(c => ['SOC2', 'GDPR', 'Enterprise'].includes(c))
        ).length;
        document.getElementById('enterpriseReady').textContent = enterprise;
    }

    setupViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        if (view === this.currentView) return;
        
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Hide all views
        document.querySelectorAll('.view-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected view
        document.querySelector(`.view-content[data-view="${view}"]`).style.display = 'block';
        
        // Re-render tools for the selected view
        this.renderTools();
    }

    async loadToolsData() {
        try {
            // Wait a moment for scripts to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if unified tools data is already loaded (try both window and global)
            const toolsData = window.unifiedToolsData || (typeof unifiedToolsData !== 'undefined' ? unifiedToolsData : null);
            
            if (toolsData) {
                // Check if it's an object with tools property or an array
                let toolsArray = Array.isArray(toolsData) ? toolsData : 
                               (toolsData.tools && Array.isArray(toolsData.tools)) ? toolsData.tools :
                               Object.values(toolsData);
                
                if (toolsArray.length > 0) {
                    console.log('Using unified tools data:', toolsArray.length, 'tools');
                    this.toolsData = this.transformUnifiedData(toolsArray);
                    this.renderTools();
                } else {
                    console.log('UnifiedToolsData found but empty');
                    this.toolsData = this.getSampleData();
                    this.renderTools();
                }
            } else {
                console.log('UnifiedToolsData not found, using sample data');
                // For demo purposes, use sample data
                this.toolsData = this.getSampleData();
                this.renderTools();
            }
        } catch (error) {
            console.error('Error loading tools data:', error);
            // For demo purposes, use sample data
            this.toolsData = this.getSampleData();
            this.renderTools();
        }
    }

    transformUnifiedData(unifiedData) {
        return unifiedData.map(tool => ({
            id: tool.tool_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: tool.tool_name,
            businessImpact: this.calculateBusinessImpact(tool),
            timeToValue: this.estimateTimeToValue(tool),
            cost: this.formatCost(tool),
            risk: this.assessRisk(tool),
            compliance: this.extractCompliance(tool),
            executiveSummary: tool.description ? tool.description.substring(0, 150) + '...' : 'AI-powered tool for enhanced productivity',
            apis: this.extractAPIs(tool),
            rateLimit: tool.rate_limits || 'Check documentation',
            sdks: this.extractSDKs(tool),
            codeSample: this.generateCodeSample(tool),
            integrations: this.extractIntegrations(tool),
            category: tool.category,
            website: tool.website,
            description: tool.description
        }));
    }

    calculateBusinessImpact(tool) {
        let score = 50;
        
        // Category-based scoring
        const highImpactCategories = ['AI Assistant', 'Analytics', 'Productivity', 'Automation'];
        if (tool.category && highImpactCategories.some(cat => tool.category.includes(cat))) {
            score += 25;
        }
        
        // Feature-based scoring
        if (tool.key_features && tool.key_features.length > 5) score += 10;
        if (tool.website && tool.website.includes('enterprise')) score += 10;
        if (tool.description && tool.description.toLowerCase().includes('api')) score += 5;
        
        return Math.min(score, 95);
    }

    estimateTimeToValue(tool) {
        if (tool.category && tool.category.includes('Assistant')) return 'Immediate';
        if (tool.category && tool.category.includes('Analytics')) return '1-2 weeks';
        if (tool.category && tool.category.includes('Development')) return '2-4 weeks';
        return '1 week';
    }

    formatCost(tool) {
        if (tool.pricing_model) {
            if (tool.pricing_model.toLowerCase().includes('free')) return 'Free tier available';
            if (tool.pricing_model.toLowerCase().includes('subscription')) return '$10-50/user/month';
            if (tool.pricing_model.toLowerCase().includes('pay')) return 'Usage-based';
        }
        return 'Custom pricing';
    }

    assessRisk(tool) {
        if (tool.category && tool.category.includes('Enterprise')) return 'Low';
        if (tool.pricing_model && tool.pricing_model.includes('Free')) return 'Medium';
        return 'Low';
    }

    extractCompliance(tool) {
        const compliance = [];
        const text = (tool.description + ' ' + (tool.key_features || []).join(' ')).toLowerCase();
        
        if (text.includes('soc')) compliance.push('SOC2');
        if (text.includes('gdpr')) compliance.push('GDPR');
        if (text.includes('hipaa')) compliance.push('HIPAA');
        if (text.includes('api')) compliance.push('API');
        if (text.includes('enterprise')) compliance.push('Enterprise');
        
        return compliance.length > 0 ? compliance : ['Standard'];
    }

    extractAPIs(tool) {
        const apis = [];
        if (tool.description && tool.description.toLowerCase().includes('api')) apis.push('REST API');
        if (tool.description && tool.description.toLowerCase().includes('sdk')) apis.push('SDK');
        if (tool.integrations && tool.integrations.length > 0) apis.push('Webhooks');
        return apis.length > 0 ? apis : ['Web UI'];
    }

    extractSDKs(tool) {
        const sdks = [];
        const text = (tool.description || '').toLowerCase();
        if (text.includes('python')) sdks.push('Python');
        if (text.includes('javascript') || text.includes('js')) sdks.push('JavaScript');
        if (text.includes('api')) sdks.push('REST');
        return sdks.length > 0 ? sdks : ['API'];
    }

    generateCodeSample(tool) {
        const name = tool.tool_name.replace(/\s+/g, '');
        return `# Example: ${tool.tool_name}
client = ${name}Client(api_key="your_key")
result = client.process(data)
print(result)`;
    }

    extractIntegrations(tool) {
        if (tool.integrations && Array.isArray(tool.integrations)) {
            return tool.integrations.slice(0, 4);
        }
        return ['API', 'Webhooks'];
    }

    renderTools() {
        if (this.currentView === 'executive') {
            this.renderExecutiveView();
        } else {
            this.renderTechnicalView();
        }
        this.updateStats();
    }

    renderExecutiveView() {
        const grid = document.getElementById('executiveGrid');
        grid.innerHTML = this.toolsData.map(tool => this.createExecutiveCard(tool)).join('');
    }

    renderTechnicalView() {
        const grid = document.getElementById('technicalGrid');
        grid.innerHTML = this.toolsData.map(tool => this.createTechnicalCard(tool)).join('');
    }

    createExecutiveCard(tool) {
        const impactClass = tool.businessImpact >= 80 ? 'high' : 
                           tool.businessImpact >= 50 ? 'medium' : 'low';
        
        return `
            <div class="tool-card" onclick="openToolModal('${tool.id}')">
                <h3 class="tool-name">${tool.name}</h3>
                <div class="impact-score ${impactClass}">${tool.businessImpact}</div>
                <p class="impact-label">Business Impact Score</p>
                
                <div class="roi-timeline">
                    <i class="fas fa-clock"></i>
                    <span>ROI in ${tool.timeToValue}</span>
                </div>
                
                <div class="quick-stats">
                    <div class="stat-item">
                        <span class="stat-label">Cost</span>
                        <span class="stat-value">${tool.cost}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Risk</span>
                        <span class="stat-value risk-${tool.risk.toLowerCase()}">${tool.risk}</span>
                    </div>
                </div>
                
                <div class="compliance-badges">
                    ${tool.compliance.map(badge => 
                        `<span class="compliance-badge">${badge}</span>`
                    ).join('')}
                </div>
                
                <p class="executive-summary">${tool.executiveSummary}</p>
            </div>
        `;
    }

    createTechnicalCard(tool) {
        return `
            <div class="tool-card" onclick="openToolModal('${tool.id}')">
                <h3 class="tool-name">${tool.name}</h3>
                
                <div class="api-badges">
                    ${tool.apis.map(api => 
                        `<span class="api-badge">${api}</span>`
                    ).join('')}
                </div>
                
                <div class="tech-specs">
                    <div class="spec-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Rate Limit: ${tool.rateLimit}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-code"></i>
                        <span>SDKs: ${tool.sdks.join(', ')}</span>
                    </div>
                </div>
                
                <div class="code-sample">
                    <pre>${tool.codeSample}</pre>
                </div>
                
                <div class="integration-matrix">
                    ${tool.integrations.map(int => 
                        `<div class="integration-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${int}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    getSampleData() {
        return [
            {
                id: 'chatgpt',
                name: 'ChatGPT',
                businessImpact: 95,
                timeToValue: '1 week',
                cost: '$20/user/month',
                risk: 'Low',
                compliance: ['SOC2', 'GDPR', 'API'],
                executiveSummary: 'Transform knowledge work with 30-50% productivity gains',
                apis: ['REST', 'Python', 'Node.js'],
                rateLimit: '10k/min',
                sdks: ['Python', 'JavaScript', 'Java'],
                codeSample: 'client = OpenAI(api_key="...")\nresponse = client.chat.completions.create(...)',
                integrations: ['Slack', 'Teams', 'Zapier', 'Custom']
            },
            {
                id: 'claude',
                name: 'Claude',
                businessImpact: 85,
                timeToValue: 'Immediate',
                cost: '$20/user/month',
                risk: 'Low',
                compliance: ['SOC2', 'API'],
                executiveSummary: 'Superior for complex analysis and coding with less hallucination',
                apis: ['REST', 'Python SDK'],
                rateLimit: '1k/min',
                sdks: ['Python', 'TypeScript'],
                codeSample: 'anthropic = Anthropic(api_key="...")\nmessage = anthropic.messages.create(...)',
                integrations: ['API', 'Web', 'Custom']
            }
        ];
    }
}

// Initialize the dual view manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dualViewManager = new DualViewManager();
});

// Modal functions
function openToolModal(toolId) {
    const modal = document.getElementById('toolModal');
    const modalBody = document.getElementById('modalBody');
    
    // Get tool data
    const tool = window.dualViewManager.toolsData.find(t => t.id === toolId);
    
    // Render modal content based on current view
    if (window.dualViewManager.currentView === 'executive') {
        modalBody.innerHTML = renderExecutiveModal(tool);
    } else {
        modalBody.innerHTML = renderTechnicalModal(tool);
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('toolModal').style.display = 'none';
}

function renderExecutiveModal(tool) {
    return `
        <h2>${tool.name} - Executive Overview</h2>
        <div class="modal-section">
            <h3>Business Value Proposition</h3>
            <p>${tool.executiveSummary}</p>
            <!-- Add more executive-focused details -->
        </div>
    `;
}

function renderTechnicalModal(tool) {
    return `
        <h2>${tool.name} - Technical Details</h2>
        <div class="modal-section">
            <h3>API Documentation</h3>
            <pre class="code-sample">${tool.codeSample}</pre>
            <!-- Add more technical details -->
        </div>
    `;
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('toolModal');
    if (event.target === modal) {
        closeModal();
    }
}