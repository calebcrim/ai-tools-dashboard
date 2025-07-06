// Data adapter to convert existing unified-tools-data.js to dual-view format

class DataAdapter {
    constructor() {
        this.unifiedData = null;
    }

    async loadUnifiedData() {
        try {
            // Load your existing unified tools data
            if (typeof window.unifiedToolsData !== 'undefined') {
                this.unifiedData = window.unifiedToolsData;
            } else {
                // Try to load from the data file
                const script = document.createElement('script');
                script.src = '/data/unified-tools-data.js';
                document.head.appendChild(script);
                
                // Wait for script to load
                await new Promise(resolve => {
                    script.onload = resolve;
                });
                
                this.unifiedData = window.unifiedToolsData;
            }
            
            return this.transformData();
        } catch (error) {
            console.error('Error loading unified data:', error);
            return [];
        }
    }

    transformData() {
        if (!this.unifiedData || !Array.isArray(this.unifiedData)) {
            return [];
        }

        return this.unifiedData.map(tool => ({
            id: this.generateId(tool.tool_name || tool.name),
            name: tool.tool_name || tool.name,
            businessImpact: this.calculateBusinessImpact(tool),
            timeToValue: this.estimateTimeToValue(tool),
            cost: this.formatCost(tool),
            risk: this.assessRisk(tool),
            compliance: this.extractCompliance(tool),
            executiveSummary: this.generateExecutiveSummary(tool),
            apis: this.extractAPIs(tool),
            rateLimit: tool.rate_limit || 'N/A',
            sdks: this.extractSDKs(tool),
            codeSample: this.generateCodeSample(tool),
            integrations: this.extractIntegrations(tool)
        }));
    }

    generateId(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    calculateBusinessImpact(tool) {
        // Calculate based on various factors
        let score = 50; // Base score
        
        // Boost for certain categories
        const highImpactCategories = ['ai-assistant', 'analytics', 'automation'];
        if (tool.category && highImpactCategories.includes(tool.category)) {
            score += 20;
        }
        
        // Boost for enterprise features
        if (tool.pricing_model && tool.pricing_model.includes('enterprise')) {
            score += 15;
        }
        
        // Boost for integrations
        if (tool.integrations && tool.integrations.length > 3) {
            score += 10;
        }
        
        // Cap at 100
        return Math.min(score, 100);
    }

    estimateTimeToValue(tool) {
        const category = tool.category || '';
        
        if (category.includes('assistant') || category.includes('chat')) {
            return 'Immediate';
        } else if (category.includes('analytics')) {
            return '1-2 weeks';
        } else if (category.includes('development')) {
            return '2-4 weeks';
        } else {
            return '1 week';
        }
    }

    formatCost(tool) {
        if (tool.pricing) {
            return tool.pricing;
        } else if (tool.pricing_model) {
            if (tool.pricing_model.includes('free')) {
                return 'Free';
            } else if (tool.pricing_model.includes('subscription')) {
                return '$20-50/month';
            } else {
                return 'Custom pricing';
            }
        }
        return 'Contact for pricing';
    }

    assessRisk(tool) {
        // Simple risk assessment based on data security and compliance
        if (tool.compliance && tool.compliance.length > 2) {
            return 'Low';
        } else if (tool.category && tool.category.includes('experimental')) {
            return 'High';
        } else {
            return 'Medium';
        }
    }

    extractCompliance(tool) {
        const compliance = [];
        
        // Check for common compliance indicators
        const description = (tool.description || '').toLowerCase();
        
        if (description.includes('soc2') || description.includes('soc 2')) {
            compliance.push('SOC2');
        }
        if (description.includes('gdpr')) {
            compliance.push('GDPR');
        }
        if (description.includes('hipaa')) {
            compliance.push('HIPAA');
        }
        if (tool.api_available) {
            compliance.push('API');
        }
        
        return compliance.length > 0 ? compliance : ['TOS'];
    }

    generateExecutiveSummary(tool) {
        const category = tool.category || '';
        const description = tool.description || '';
        
        // Generate category-specific summaries
        if (category.includes('assistant')) {
            return 'Enhance productivity with AI-powered assistance for daily tasks';
        } else if (category.includes('analytics')) {
            return 'Drive data-driven decisions with advanced analytics capabilities';
        } else if (category.includes('content')) {
            return 'Accelerate content creation and improve quality at scale';
        } else {
            // Use first 100 chars of description or generic
            return description.substring(0, 100) + '...' || 'Transform workflows with AI-powered automation';
        }
    }

    extractAPIs(tool) {
        const apis = [];
        
        if (tool.api_available) {
            apis.push('REST');
        }
        
        // Check description for API mentions
        const description = (tool.description || '').toLowerCase();
        
        if (description.includes('python')) {
            apis.push('Python');
        }
        if (description.includes('javascript') || description.includes('node')) {
            apis.push('Node.js');
        }
        if (description.includes('graphql')) {
            apis.push('GraphQL');
        }
        
        return apis.length > 0 ? apis : ['Web Interface'];
    }

    extractSDKs(tool) {
        const sdks = [];
        const description = (tool.description || '').toLowerCase();
        
        // Common SDK patterns
        if (description.includes('python')) sdks.push('Python');
        if (description.includes('javascript')) sdks.push('JavaScript');
        if (description.includes('java')) sdks.push('Java');
        if (description.includes('typescript')) sdks.push('TypeScript');
        if (description.includes('.net') || description.includes('c#')) sdks.push('.NET');
        
        return sdks.length > 0 ? sdks : ['REST API'];
    }

    generateCodeSample(tool) {
        const name = tool.tool_name || tool.name;
        
        // Generate generic code samples based on tool type
        if (tool.api_available) {
            return `# ${name} API Example
client = ${name.replace(/\s+/g, '')}API(api_key="your_key")
response = client.request(
    endpoint="/analyze",
    data={"input": "your_data"}
)`;
        } else {
            return `// ${name} Integration
// Visit ${name.toLowerCase().replace(/\s+/g, '-')}.com
// for detailed documentation`;
        }
    }

    extractIntegrations(tool) {
        const integrations = [];
        const description = (tool.description || '').toLowerCase();
        
        // Check for common integrations
        if (description.includes('slack')) integrations.push('Slack');
        if (description.includes('teams')) integrations.push('Teams');
        if (description.includes('zapier')) integrations.push('Zapier');
        if (description.includes('webhook')) integrations.push('Webhooks');
        if (tool.api_available) integrations.push('API');
        
        return integrations.length > 0 ? integrations : ['Web'];
    }
}

// Export for use in dual-view.js
window.DataAdapter = DataAdapter;