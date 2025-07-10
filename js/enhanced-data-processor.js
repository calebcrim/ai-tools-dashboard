// Enhanced Data Processor for 317+ AI Tools
class EnhancedDataProcessor {
    constructor() {
        this.tools = [];
        this.searchIndex = null;
        this.cache = new Map();
        this.worker = null;
        this.isProcessing = false;
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null
        };
        
        // Initialize worker if available
        if (typeof Worker !== 'undefined') {
            try {
                this.worker = new Worker('/js/data-worker.js');
                this.setupWorker();
            } catch (e) {
                console.log('Worker not available, will use main thread');
            }
        }
    }
    
    setupWorker() {
        if (!this.worker) return;
        
        this.worker.addEventListener('message', (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'METRICS_COMPLETE':
                    this.handleMetricsComplete(data);
                    break;
                case 'BATCH_COMPLETE':
                    this.handleBatchComplete(data);
                    break;
                case 'ERROR':
                    this.handleError(data);
                    break;
            }
        });
    }
    
    async loadTools(rawData) {
        this.isProcessing = true;
        const startTime = performance.now();
        
        try {
            // Process in batches to prevent UI blocking
            const BATCH_SIZE = 50;
            const totalBatches = Math.ceil(rawData.length / BATCH_SIZE);
            
            for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
                const batch = rawData.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                
                // Report progress
                if (this.callbacks.onProgress) {
                    this.callbacks.onProgress({
                        current: Math.min(i + BATCH_SIZE, rawData.length),
                        total: rawData.length,
                        percentage: Math.round((batchNumber / totalBatches) * 100)
                    });
                }
                
                await this.processBatch(batch);
                
                // Small delay to keep UI responsive
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Build search index after loading
            this.buildSearchIndex();
            
            const loadTime = performance.now() - startTime;
            console.log(`Loaded ${this.tools.length} tools in ${loadTime.toFixed(2)}ms`);
            
            if (this.callbacks.onComplete) {
                this.callbacks.onComplete({
                    toolsCount: this.tools.length,
                    loadTime: loadTime
                });
            }
            
        } catch (error) {
            console.error('Error loading tools:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    async processBatch(batch) {
        const processed = batch.map(tool => ({
            ...tool,
            // Enhanced fields
            id: tool.id || this.generateId(tool.tool_name),
            displayName: tool.tool_name,
            searchableText: this.createSearchableText(tool),
            
            // Parse complex fields
            features: this.parseFeatures(tool.feature_breakdown),
            pros_cons: this.parseProsConsLimitations(tool.pros_cons_limitations),
            integrations: this.parseIntegrations(tool.integration_potential),
            useCases: this.parseUseCases(tool.use_cases_in_pr),
            
            // Calculate derived metrics
            businessImpactScore: this.calculateBusinessImpact(tool),
            complexityScore: this.calculateComplexity(tool),
            roiScore: this.calculateROI(tool),
            riskLevel: this.assessRisk(tool),
            timeToValue: this.estimateTimeToValue(tool),
            
            // Format display fields
            formattedPrice: this.formatPricing(tool.pricing_model),
            compliance: this.extractCompliance(tool),
            
            // Metadata
            lastUpdated: new Date().toISOString(),
            dataCompleteness: this.calculateDataCompleteness(tool)
        }));
        
        this.tools.push(...processed);
        return processed;
    }
    
    // Search functionality
    buildSearchIndex() {
        if (typeof Fuse === 'undefined') {
            console.warn('Fuse.js not loaded, using basic search');
            return;
        }
        
        this.searchIndex = new Fuse(this.tools, {
            keys: [
                { name: 'tool_name', weight: 0.3 },
                { name: 'category', weight: 0.2 },
                { name: 'brief_purpose_summary', weight: 0.2 },
                { name: 'feature_breakdown', weight: 0.15 },
                { name: 'integration_potential', weight: 0.1 },
                { name: 'use_cases_in_pr', weight: 0.05 }
            ],
            threshold: 0.3,
            includeScore: true,
            useExtendedSearch: true,
            minMatchCharLength: 2
        });
    }
    
    search(query, options = {}) {
        if (!query) return this.tools;
        
        // Check cache first
        const cacheKey = `search:${query}:${JSON.stringify(options)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        let results;
        
        if (this.searchIndex) {
            // Use Fuse.js search
            results = this.searchIndex.search(query)
                .map(result => ({
                    ...result.item,
                    matchScore: result.score
                }));
        } else {
            // Fallback to basic search
            const searchTerm = query.toLowerCase();
            results = this.tools.filter(tool => 
                tool.searchableText.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply additional filters if provided
        if (options.filters) {
            results = this.applyFilters(results, options.filters);
        }
        
        // Sort by relevance and impact
        results.sort((a, b) => {
            if (a.matchScore && b.matchScore) {
                return a.matchScore - b.matchScore; // Lower score is better in Fuse.js
            }
            return b.businessImpactScore - a.businessImpactScore;
        });
        
        // Cache results
        this.cache.set(cacheKey, results);
        
        // Limit cache size
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return results;
    }
    
    // Filtering system
    applyFilters(tools, filters) {
        let filtered = [...tools];
        
        // Category filter
        if (filters.categories?.length) {
            filtered = filtered.filter(tool =>
                filters.categories.includes(tool.category)
            );
        }
        
        // Impact score range
        if (filters.impactRange) {
            filtered = filtered.filter(tool => 
                tool.businessImpactScore >= filters.impactRange[0] &&
                tool.businessImpactScore <= filters.impactRange[1]
            );
        }
        
        // Complexity filter
        if (filters.complexity?.length) {
            filtered = filtered.filter(tool =>
                filters.complexity.includes(tool.complexityScore)
            );
        }
        
        // Price range filter
        if (filters.priceRange) {
            filtered = filtered.filter(tool =>
                this.matchesPriceRange(tool, filters.priceRange)
            );
        }
        
        // Integration filter
        if (filters.hasIntegrations) {
            filtered = filtered.filter(tool =>
                tool.integrations && tool.integrations.length > 0
            );
        }
        
        // Compliance filter
        if (filters.compliance?.length) {
            filtered = filtered.filter(tool =>
                tool.compliance.some(c => filters.compliance.includes(c))
            );
        }
        
        return filtered;
    }
    
    // Parsing functions
    parseFeatures(featureBreakdown) {
        if (!featureBreakdown) return [];
        
        // Handle both string and array formats
        if (Array.isArray(featureBreakdown)) {
            return featureBreakdown;
        }
        
        // Parse numbered list format
        const features = featureBreakdown
            .split(/\n/)
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(feature => feature.length > 0);
        
        return features;
    }
    
    parseProsConsLimitations(prosConsText) {
        if (!prosConsText) return { pros: [], cons: [], limitations: [] };
        
        const result = { pros: [], cons: [], limitations: [] };
        
        // Split by common delimiters
        const sections = prosConsText.split(/(?:Pros:|Cons:|Limitations:)/i);
        
        sections.forEach((section, index) => {
            const items = section
                .split(/[;,\n]/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
            
            if (prosConsText.toLowerCase().includes('pros:') && index === 1) {
                result.pros = items;
            } else if (prosConsText.toLowerCase().includes('cons:') && index === 2) {
                result.cons = items;
            } else if (prosConsText.toLowerCase().includes('limitations:') && index === 3) {
                result.limitations = items;
            }
        });
        
        return result;
    }
    
    parseIntegrations(integrationText) {
        if (!integrationText) return [];
        
        // Extract platform names and APIs
        const integrations = [];
        const platforms = ['Slack', 'Teams', 'Salesforce', 'HubSpot', 'Zapier', 'API', 'SDK', 'REST', 'GraphQL', 'Webhook'];
        
        platforms.forEach(platform => {
            if (integrationText.toLowerCase().includes(platform.toLowerCase())) {
                integrations.push(platform);
            }
        });
        
        return integrations;
    }
    
    parseUseCases(useCases) {
        if (!useCases) return [];
        return Array.isArray(useCases) ? useCases : [];
    }
    
    // Calculation functions
    calculateBusinessImpact(tool) {
        let score = 50; // Base score
        
        // Increase score based on features
        if (tool.feature_breakdown && tool.feature_breakdown.length > 100) {
            score += 10;
        }
        
        // Increase for enterprise features
        if (tool.pricing_model && tool.pricing_model.toLowerCase().includes('enterprise')) {
            score += 15;
        }
        
        // Increase for integrations
        if (tool.integration_potential && tool.integration_potential.length > 50) {
            score += 10;
        }
        
        // Increase for proven case studies
        if (tool.case_studies && tool.case_studies.length > 50) {
            score += 15;
        }
        
        return Math.min(100, score);
    }
    
    calculateComplexity(tool) {
        // 1-5 scale based on learning curve
        if (!tool.learning_curve) return 3;
        
        const lcLower = tool.learning_curve.toLowerCase();
        if (lcLower.includes('low') || lcLower.includes('easy')) return 1;
        if (lcLower.includes('medium') || lcLower.includes('moderate')) return 3;
        if (lcLower.includes('high') || lcLower.includes('steep')) return 5;
        
        return 3; // Default
    }
    
    calculateROI(tool) {
        // Simple ROI calculation based on impact vs complexity
        const impact = this.calculateBusinessImpact(tool);
        const complexity = this.calculateComplexity(tool);
        
        return Math.round((impact / complexity) * 20);
    }
    
    assessRisk(tool) {
        let riskScore = 0;
        
        // Increase risk for complex tools
        if (this.calculateComplexity(tool) >= 4) riskScore += 2;
        
        // Decrease risk for established tools with case studies
        if (tool.case_studies && tool.case_studies.length > 100) riskScore -= 1;
        
        // Increase risk for tools with limitations
        if (tool.geo_regulatory_limitations && tool.geo_regulatory_limitations.length > 50) riskScore += 1;
        
        if (riskScore <= 0) return 'Low';
        if (riskScore <= 2) return 'Medium';
        return 'High';
    }
    
    estimateTimeToValue(tool) {
        const complexity = this.calculateComplexity(tool);
        
        if (complexity <= 2) return '1-2 weeks';
        if (complexity <= 3) return '2-4 weeks';
        if (complexity <= 4) return '1-2 months';
        return '2-3 months';
    }
    
    // Utility functions
    generateId(toolName) {
        return toolName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }
    
    createSearchableText(tool) {
        return [
            tool.tool_name,
            tool.category,
            tool.brief_purpose_summary,
            tool.feature_breakdown,
            tool.integration_potential,
            tool.use_cases_in_pr?.join(' ')
        ].filter(Boolean).join(' ');
    }
    
    formatPricing(pricingModel) {
        if (!pricingModel) return 'Contact for pricing';
        
        // Extract key pricing info
        if (pricingModel.toLowerCase().includes('free')) {
            return 'Free tier available';
        }
        
        // Try to extract price ranges
        const priceMatch = pricingModel.match(/\$[\d,]+/);
        if (priceMatch) {
            return priceMatch[0] + '/mo';
        }
        
        return pricingModel.substring(0, 50) + '...';
    }
    
    extractCompliance(tool) {
        const compliance = [];
        const certifications = ['SOC2', 'GDPR', 'HIPAA', 'ISO', 'CCPA'];
        
        const searchText = [
            tool.geo_regulatory_limitations,
            tool.brief_purpose_summary,
            tool.pros_cons_limitations
        ].join(' ').toUpperCase();
        
        certifications.forEach(cert => {
            if (searchText.includes(cert)) {
                compliance.push(cert);
            }
        });
        
        return compliance;
    }
    
    calculateDataCompleteness(tool) {
        const fields = [
            'tool_name',
            'category',
            'brief_purpose_summary',
            'feature_breakdown',
            'pricing_model',
            'pros_cons_limitations',
            'integration_potential',
            'learning_curve',
            'case_studies',
            'use_cases_in_pr'
        ];
        
        const filledFields = fields.filter(field => 
            tool[field] && tool[field].length > 10
        ).length;
        
        return Math.round((filledFields / fields.length) * 100);
    }
    
    // Performance monitoring
    getMetrics() {
        return {
            totalTools: this.tools.length,
            averageImpactScore: this.tools.reduce((sum, tool) => sum + tool.businessImpactScore, 0) / this.tools.length,
            highImpactTools: this.tools.filter(t => t.businessImpactScore >= 80).length,
            completeDataTools: this.tools.filter(t => t.dataCompleteness >= 80).length,
            categoriesCount: new Set(this.tools.map(t => t.category)).size,
            cacheSize: this.cache.size
        };
    }
    
    // Export for worker usage
    static exportForWorker() {
        return {
            calculateBusinessImpact: this.prototype.calculateBusinessImpact,
            calculateComplexity: this.prototype.calculateComplexity,
            calculateROI: this.prototype.calculateROI,
            assessRisk: this.prototype.assessRisk
        };
    }
}

// Make available globally
window.EnhancedDataProcessor = EnhancedDataProcessor;