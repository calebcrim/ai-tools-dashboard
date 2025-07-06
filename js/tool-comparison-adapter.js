/**
 * Tool Comparison Data Adapter
 * Transforms existing tool data structure to match the ToolComparisonView component expectations
 */

class ToolComparisonAdapter {
    constructor() {
        // Feature name standardization mapping
        this.featureMapping = {
            // API variations
            'api access': 'API access',
            'api integration': 'API access',
            'restful api': 'API access',
            'api capabilities': 'API access',
            'api available': 'API access',
            
            // Support variations
            '24/7 support': '24/7 Support',
            'dedicated support': '24/7 Support',
            'priority support': 'Priority Support',
            
            // Mobile variations
            'mobile app': 'Mobile app',
            'mobile support': 'Mobile app',
            'mobile application': 'Mobile app',
            
            // Analytics variations
            'real-time analytics': 'Real-time analytics',
            'analytics': 'Real-time analytics',
            'reporting': 'Custom dashboards',
            'custom reports': 'Custom dashboards',
            'dashboard': 'Custom dashboards',
            
            // Collaboration variations
            'team collaboration': 'Team collaboration',
            'team features': 'Team collaboration',
            'collaboration': 'Team collaboration',
            
            // Export variations
            'data export': 'Data export',
            'export capabilities': 'Data export',
            'csv export': 'Data export',
            
            // Integration variations
            'integrations': 'Third-party integrations',
            'integration potential': 'Third-party integrations',
            'webhook': 'Webhooks',
            'webhooks': 'Webhooks',
            
            // Security variations
            'security': 'Enterprise security',
            'encryption': 'Data encryption',
            'sso': 'SSO/SAML',
            'saml': 'SSO/SAML',
            
            // Other common features
            'white labeling': 'White labeling',
            'white label': 'White labeling',
            'custom branding': 'White labeling',
            'automation': 'Automation',
            'ai-powered': 'AI-powered features',
            'machine learning': 'AI-powered features',
            'free tier': 'Free tier available',
            'trial': 'Free trial'
        };
        
        // Standard features to check for
        this.standardFeatures = [
            'API access',
            '24/7 Support',
            'Mobile app',
            'Real-time analytics',
            'Custom dashboards',
            'Team collaboration',
            'Data export',
            'Third-party integrations',
            'White labeling',
            'Enterprise security',
            'AI-powered features',
            'Free tier available'
        ];
    }
    
    /**
     * Transform a single tool from existing structure to comparison structure
     */
    transformTool(tool) {
        return {
            id: tool.id,
            name: tool.tool_name || tool.name,
            category: this.formatCategory(tool.category),
            pricing: this.extractPricing(tool),
            features: this.extractFeatures(tool),
            useCases: this.extractUseCases(tool),
            pros: this.extractPros(tool),
            cons: this.extractCons(tool),
            rating: this.calculateRating(tool),
            lastUpdated: this.getLastUpdated(tool),
            // Keep original data for reference
            _original: tool
        };
    }
    
    /**
     * Transform multiple tools for comparison
     */
    transformTools(tools) {
        return tools.map(tool => this.transformTool(tool));
    }
    
    /**
     * Format category name
     */
    formatCategory(category) {
        if (!category) return 'Uncategorized';
        
        const categoryMap = {
            'ai-assistant': 'AI Assistant',
            'content-creation': 'Content Creation',
            'media-intelligence': 'Media Intelligence',
            'video-audio': 'Video & Audio',
            'image-generation': 'Image Generation',
            'analytics': 'Analytics',
            'customer-service': 'Customer Service',
            'cybersecurity': 'Cybersecurity',
            'legal-compliance': 'Legal & Compliance',
            'transcription': 'Transcription',
            'translation': 'Translation',
            'research': 'Research',
            'productivity': 'Productivity',
            'finance': 'Finance'
        };
        
        return categoryMap[category] || category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    /**
     * Extract pricing information
     */
    extractPricing(tool) {
        const pricingModel = tool.pricing_model || '';
        const pricingLower = pricingModel.toLowerCase();
        
        // Determine pricing model type
        let model = 'Custom';
        if (pricingLower.includes('free')) model = 'Freemium';
        else if (pricingLower.includes('subscription')) model = 'Subscription';
        else if (pricingLower.includes('enterprise')) model = 'Enterprise';
        else if (pricingLower.includes('usage') || pricingLower.includes('pay as')) model = 'Usage-based';
        
        // Extract starting price
        let starting = 'Contact sales';
        const priceMatch = pricingModel.match(/\$[\d,]+(?:\/\w+)?|\d+ ?(?:USD|EUR|GBP)/i);
        if (priceMatch) {
            starting = priceMatch[0];
        } else if (pricingLower.includes('free')) {
            starting = 'Free';
        }
        
        // Extract pricing tiers
        const tiers = this.extractPricingTiers(pricingModel);
        
        return {
            model,
            starting,
            tiers,
            raw: pricingModel
        };
    }
    
    /**
     * Extract pricing tiers from pricing model text
     */
    extractPricingTiers(pricingText) {
        const tiers = [];
        const tierPatterns = [
            /(?:basic|starter|free)[:\s]+\$?([\d,]+|free)(?:\/\w+)?/gi,
            /(?:pro|professional|plus)[:\s]+\$?([\d,]+)(?:\/\w+)?/gi,
            /(?:enterprise|business|team)[:\s]+\$?([\d,]+|custom|contact)(?:\/\w+)?/gi
        ];
        
        // Common tier structures
        if (pricingText.toLowerCase().includes('free')) {
            tiers.push({ name: 'Free', price: '$0', users: '1' });
        }
        
        // Try to extract structured pricing
        tierPatterns.forEach((pattern, index) => {
            const match = pricingText.match(pattern);
            if (match) {
                const tierNames = ['Basic', 'Professional', 'Enterprise'];
                tiers.push({
                    name: tierNames[index],
                    price: match[1].includes('$') ? match[1] : `$${match[1]}`,
                    users: 'Contact sales'
                });
            }
        });
        
        // If no tiers found, create default structure
        if (tiers.length === 0) {
            if (pricingText.toLowerCase().includes('enterprise')) {
                tiers.push({ name: 'Enterprise', price: 'Contact sales', users: 'Unlimited' });
            } else {
                tiers.push({ name: 'Standard', price: 'Contact sales', users: 'Varies' });
            }
        }
        
        return tiers;
    }
    
    /**
     * Extract features from various fields
     */
    extractFeatures(tool) {
        const features = {};
        
        // Initialize all standard features as unknown
        this.standardFeatures.forEach(feature => {
            features[feature] = null; // null means unknown
        });
        
        // Sources to check for features
        const textToAnalyze = [
            tool.feature_breakdown || '',
            tool.integration_potential || '',
            tool.pricing_model || '',
            tool.brief_purpose_summary || '',
            ...(tool.tags || [])
        ].join(' ').toLowerCase();
        
        // Check for each feature
        Object.entries(this.featureMapping).forEach(([variant, standardName]) => {
            if (textToAnalyze.includes(variant.toLowerCase())) {
                features[standardName] = true;
            }
        });
        
        // Special checks
        if (textToAnalyze.includes('api') && !textToAnalyze.includes('no api')) {
            features['API access'] = true;
        }
        
        if (textToAnalyze.includes('free')) {
            features['Free tier available'] = true;
        }
        
        if (textToAnalyze.includes('mobile')) {
            features['Mobile app'] = true;
        }
        
        if (textToAnalyze.includes('24/7') || textToAnalyze.includes('dedicated support')) {
            features['24/7 Support'] = true;
        }
        
        if (textToAnalyze.includes('ai') || textToAnalyze.includes('machine learning')) {
            features['AI-powered features'] = true;
        }
        
        // Extract additional features from feature_breakdown
        if (tool.feature_breakdown) {
            const additionalFeatures = tool.feature_breakdown.split(/[,;.]/).map(f => f.trim()).filter(f => f.length > 3);
            additionalFeatures.forEach(feature => {
                if (feature.length < 50) { // Reasonable feature name length
                    const cleanFeature = feature.charAt(0).toUpperCase() + feature.slice(1);
                    if (!features[cleanFeature]) {
                        features[cleanFeature] = true;
                    }
                }
            });
        }
        
        return features;
    }
    
    /**
     * Extract use cases
     */
    extractUseCases(tool) {
        // Prefer use_cases_in_pr if available
        if (tool.use_cases_in_pr && tool.use_cases_in_pr.length > 0) {
            return tool.use_cases_in_pr.slice(0, 5); // Limit to 5 for display
        }
        
        // Fallback to extracting from description
        const useCases = [];
        const summary = tool.brief_purpose_summary || '';
        
        // Common use case patterns
        const patterns = [
            /use(?:d)? for ([^,.]+)/gi,
            /help(?:s)? with ([^,.]+)/gi,
            /enable(?:s)? ([^,.]+)/gi,
            /perfect for ([^,.]+)/gi,
            /ideal for ([^,.]+)/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(summary)) !== null) {
                useCases.push(match[1].trim());
            }
        });
        
        // If no use cases found, generate from category
        if (useCases.length === 0) {
            const categoryUseCases = {
                'ai-assistant': ['AI-powered assistance', 'Content generation', 'Task automation'],
                'content-creation': ['Content creation', 'Marketing campaigns', 'Social media content'],
                'analytics': ['Data analysis', 'Performance tracking', 'Reporting'],
                'cybersecurity': ['Security monitoring', 'Threat detection', 'Compliance'],
                'customer-service': ['Customer support', 'Help desk automation', 'Query resolution']
            };
            
            return categoryUseCases[tool.category] || ['General purpose use'];
        }
        
        return useCases.slice(0, 5);
    }
    
    /**
     * Extract pros from pros_cons_limitations
     */
    extractPros(tool) {
        const prosConsText = tool.pros_cons_limitations || '';
        const pros = [];
        
        // Extract pros section
        const prosMatch = prosConsText.match(/pros?:([^.]+(?:\.[^.]+)*?)(?:cons?:|$)/i);
        if (prosMatch) {
            const prosText = prosMatch[1];
            // Split by semicolons, commas, or periods
            const items = prosText.split(/[;,.]/).map(item => item.trim()).filter(item => item.length > 5);
            pros.push(...items.slice(0, 4)); // Limit to 4 pros
        }
        
        // If no pros found, generate from features
        if (pros.length === 0 && tool.feature_breakdown) {
            const features = tool.feature_breakdown.split(/[,;.]/).slice(0, 3);
            features.forEach(feature => {
                if (feature.trim()) {
                    pros.push(feature.trim());
                }
            });
        }
        
        // Default pros if none found
        if (pros.length === 0) {
            pros.push('Easy to use', 'Well-documented', 'Regular updates');
        }
        
        return pros;
    }
    
    /**
     * Extract cons from pros_cons_limitations
     */
    extractCons(tool) {
        const prosConsText = tool.pros_cons_limitations || '';
        const cons = [];
        
        // Extract cons section
        const consMatch = prosConsText.match(/cons?:([^.]+(?:\.[^.]+)*?)(?:$|limitations?:)/i);
        if (consMatch) {
            const consText = consMatch[1];
            const items = consText.split(/[;,.]/).map(item => item.trim()).filter(item => item.length > 5);
            cons.push(...items.slice(0, 4)); // Limit to 4 cons
        }
        
        // Extract limitations
        const limitationsMatch = prosConsText.match(/limitations?:(.+)/i);
        if (limitationsMatch && cons.length < 3) {
            const limitText = limitationsMatch[1];
            const items = limitText.split(/[;,.]/).map(item => item.trim()).filter(item => item.length > 5);
            cons.push(...items.slice(0, 2));
        }
        
        // Generate cons based on common patterns
        if (cons.length === 0) {
            if (tool.pricing_model && tool.pricing_model.toLowerCase().includes('enterprise')) {
                cons.push('Enterprise pricing may be expensive');
            }
            if (tool.learning_curve && tool.learning_curve.toLowerCase().includes('steep')) {
                cons.push('Steep learning curve');
            }
            if (!tool.feature_breakdown || tool.feature_breakdown.length < 50) {
                cons.push('Limited feature information available');
            }
        }
        
        // Default cons if none found
        if (cons.length === 0) {
            cons.push('May require training', 'Limited free tier');
        }
        
        return cons;
    }
    
    /**
     * Calculate rating based on data completeness and features
     */
    calculateRating(tool) {
        let score = 3.0; // Base score
        
        // Add points for data completeness
        if (tool.feature_breakdown && tool.feature_breakdown.length > 50) score += 0.5;
        if (tool.pricing_model && tool.pricing_model.length > 20) score += 0.3;
        if (tool.use_cases_in_pr && tool.use_cases_in_pr.length > 3) score += 0.4;
        if (tool.integration_potential && tool.integration_potential.length > 30) score += 0.3;
        if (tool.case_studies && tool.case_studies.length > 50) score += 0.5;
        
        // Cap at 5.0
        return Math.min(5.0, Math.round(score * 10) / 10);
    }
    
    /**
     * Get last updated date
     */
    getLastUpdated(tool) {
        // If tool has metadata about last update, use it
        if (tool.lastUpdated) return tool.lastUpdated;
        
        // Otherwise, return a default based on source
        const sourceDefaults = {
            'pdf': '2024-01-15',
            'ai-list': '2024-02-01',
            'hr': '2024-03-01'
        };
        
        return sourceDefaults[tool.source] || '2024-01-01';
    }
    
    /**
     * Export comparison data in various formats
     */
    exportComparison(tools, format = 'json') {
        const transformedTools = this.transformTools(tools);
        
        if (format === 'csv') {
            return this.exportAsCSV(transformedTools);
        } else if (format === 'json') {
            return this.exportAsJSON(transformedTools);
        } else if (format === 'markdown') {
            return this.exportAsMarkdown(transformedTools);
        }
    }
    
    /**
     * Export as CSV
     */
    exportAsCSV(tools) {
        const headers = [
            'Name', 'Category', 'Pricing Model', 'Starting Price', 'Rating',
            'API Access', '24/7 Support', 'Mobile App', 'Free Tier',
            'Primary Use Case', 'Main Pro', 'Main Con'
        ];
        
        const rows = tools.map(tool => [
            tool.name,
            tool.category,
            tool.pricing.model,
            tool.pricing.starting,
            tool.rating,
            tool.features['API access'] ? 'Yes' : 'No',
            tool.features['24/7 Support'] ? 'Yes' : 'No',
            tool.features['Mobile app'] ? 'Yes' : 'No',
            tool.features['Free tier available'] ? 'Yes' : 'No',
            tool.useCases[0] || '',
            tool.pros[0] || '',
            tool.cons[0] || ''
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csv;
    }
    
    /**
     * Export as JSON
     */
    exportAsJSON(tools) {
        return JSON.stringify({
            comparisonDate: new Date().toISOString(),
            toolsCompared: tools.length,
            tools: tools
        }, null, 2);
    }
    
    /**
     * Export as Markdown
     */
    exportAsMarkdown(tools) {
        let markdown = '# Tool Comparison Report\n\n';
        markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        tools.forEach(tool => {
            markdown += `## ${tool.name}\n\n`;
            markdown += `**Category:** ${tool.category}\n`;
            markdown += `**Pricing:** ${tool.pricing.model} - Starting at ${tool.pricing.starting}\n`;
            markdown += `**Rating:** ${tool.rating}/5\n\n`;
            
            markdown += '### Features\n';
            Object.entries(tool.features).forEach(([feature, available]) => {
                if (available !== null) {
                    markdown += `- ${feature}: ${available ? '✓' : '✗'}\n`;
                }
            });
            
            markdown += '\n### Use Cases\n';
            tool.useCases.forEach(useCase => {
                markdown += `- ${useCase}\n`;
            });
            
            markdown += '\n### Pros\n';
            tool.pros.forEach(pro => {
                markdown += `- ${pro}\n`;
            });
            
            markdown += '\n### Cons\n';
            tool.cons.forEach(con => {
                markdown += `- ${con}\n`;
            });
            
            markdown += '\n---\n\n';
        });
        
        return markdown;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolComparisonAdapter;
}