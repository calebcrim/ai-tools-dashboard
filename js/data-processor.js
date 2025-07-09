/**
 * Enterprise Data Processor
 * Extends FinancialDataProcessor with enterprise-specific features
 * Handles 317 AI tools with quadrant analysis and executive metrics
 */

// Import or reference the FinancialDataProcessor
const BaseProcessor = window.FinancialDataProcessor || class {
    constructor(toolsData) {
        this.tools = toolsData;
        this.financialMetrics = new Map();
        console.log('Base processor initialized with', toolsData.length, 'tools');
    }
    
    extractMonthlyPrice(pricingModel) {
        if (!pricingModel) return 0;
        
        // Simple extraction
        const match = pricingModel.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\/?\s*(?:month|mo)/i);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        
        if (/free/i.test(pricingModel)) return 0;
        if (/enterprise|contact/i.test(pricingModel)) return 5000;
        
        return 100; // Default
    }
};

class EnterpriseDataProcessor extends BaseProcessor {
    constructor(toolsData) {
        // Ensure we have an array of tools
        const tools = Array.isArray(toolsData) ? toolsData : (toolsData.tools || []);
        super(tools);
        
        // Enterprise-specific properties
        this.processedData = new Map();
        this.quadrants = new Map();
        this.searchIndex = new Map();
        this.categoryIndex = new Map();
        this.metricsCache = new MetricsCache();
        
        // Executive metrics
        this.executiveMetrics = {
            quickWins: 0,
            strategic: 0,
            savings: 0,
            avgROI: 0,
            lastUpdated: null
        };
        
        console.log('EnterpriseDataProcessor initializing with', this.tools.length, 'tools');
        this.initializeEnterpriseFeatures();
    }
    
    initializeEnterpriseFeatures() {
        const startTime = performance.now();
        
        // Process each tool
        this.tools.forEach((tool, index) => {
            // Ensure tool has an ID
            if (!tool.id) tool.id = index + 1;
            
            // Add computed fields
            const processedTool = {
                ...tool,
                business_impact_score: this.parseBusinessImpact(tool),
                complexity_score: this.parseComplexity(tool),
                quadrant: null,
                estimatedROI: null,
                implementationCost: null,
                matchScore: 0
            };
            
            // Determine quadrant
            processedTool.quadrant = this.determineQuadrant(
                processedTool.business_impact_score,
                processedTool.complexity_score
            );
            
            // Calculate ROI
            processedTool.estimatedROI = this.calculateROI(processedTool);
            
            // Store processed tool
            this.processedData.set(tool.tool_name, processedTool);
            
            // Add to quadrant index
            if (!this.quadrants.has(processedTool.quadrant)) {
                this.quadrants.set(processedTool.quadrant, new Set());
            }
            this.quadrants.get(processedTool.quadrant).add(tool.tool_name);
            
            // Add to category index
            if (!this.categoryIndex.has(tool.category)) {
                this.categoryIndex.set(tool.category, new Set());
            }
            this.categoryIndex.get(tool.category).add(tool.tool_name);
        });
        
        // Build search index
        this.buildSearchIndex();
        
        // Calculate metrics
        this.refreshMetrics();
        
        const processingTime = performance.now() - startTime;
        console.log(`Enterprise features initialized in ${processingTime.toFixed(2)}ms`);
        console.log('Quadrant distribution:', {
            'quick-wins': this.quadrants.get('quick-wins')?.size || 0,
            'strategic': this.quadrants.get('strategic')?.size || 0,
            'routine': this.quadrants.get('routine')?.size || 0,
            'question-value': this.quadrants.get('question-value')?.size || 0
        });
    }
    
    parseBusinessImpact(tool) {
        // If already has a score, use it
        if (typeof tool.business_impact_score === 'number') {
            return tool.business_impact_score;
        }
        
        // Default score
        let score = 50;
        
        // Boost based on category - more comprehensive list
        const categoryBoosts = {
            'ai assistant': 30,
            'data analytics': 25,
            'crm': 25,
            'automation': 25,
            'marketing': 20,
            'content-creation': 20,
            'security': 25,
            'productivity': 20,
            'communication': 15,
            'finance': 20,
            'sales': 20,
            'customer support': 20
        };
        
        // Apply category boost
        const categoryLower = tool.category?.toLowerCase() || '';
        for (const [cat, boost] of Object.entries(categoryBoosts)) {
            if (categoryLower.includes(cat)) {
                score += boost;
                break;
            }
        }
        
        // Boost based on case studies
        if (tool.case_studies && tool.case_studies.length > 100) {
            score += 15;
        }
        
        // Boost based on features
        if (tool.feature_breakdown && tool.feature_breakdown.length > 200) {
            score += 10;
        }
        
        // Boost based on use cases
        if (tool.use_cases_in_pr && tool.use_cases_in_pr.length > 5) {
            score += 10;
        }
        
        // Boost if has many tags (indicates comprehensive tool)
        if (tool.tags && tool.tags.length > 5) {
            score += 5;
        }
        
        // Cap at 100
        return Math.min(100, score);
    }
    
    parseComplexity(tool) {
        // If already has a score, use it
        if (typeof tool.complexity_score === 'number') {
            return tool.complexity_score;
        }
        
        // Default complexity
        let complexity = 3;
        
        // Adjust based on learning curve
        if (tool.learning_curve) {
            const lcLower = tool.learning_curve.toLowerCase();
            if (lcLower.includes('low') || lcLower.includes('easy') || lcLower.includes('simple') || lcLower.includes('intuitive')) {
                complexity = 2;
            } else if (lcLower.includes('moderate') || lcLower.includes('medium')) {
                complexity = 3;
            } else if (lcLower.includes('high') || lcLower.includes('steep')) {
                complexity = 4;
            } else if (lcLower.includes('very high') || lcLower.includes('expert') || lcLower.includes('technical')) {
                complexity = 5;
            }
        }
        
        // Adjust based on time to value
        if (tool.time_to_value) {
            const ttvLower = tool.time_to_value.toLowerCase();
            if (ttvLower.includes('< 1 week') || ttvLower.includes('immediate') || ttvLower.includes('minutes')) {
                complexity = Math.min(complexity, 2);
            } else if (ttvLower.includes('week')) {
                complexity = Math.min(complexity, 3);
            } else if (ttvLower.includes('month')) {
                complexity = Math.max(complexity, 3);
            } else if (ttvLower.includes('quarter') || ttvLower.includes('year')) {
                complexity = Math.max(complexity, 4);
            }
        }
        
        // Category-based complexity hints
        const simpleCategories = ['content-creation', 'ai assistant', 'chatbot', 'writing'];
        const complexCategories = ['security', 'data analytics', 'crm', 'enterprise'];
        
        const categoryLower = tool.category?.toLowerCase() || '';
        if (simpleCategories.some(cat => categoryLower.includes(cat))) {
            complexity = Math.min(complexity, 2);
        } else if (complexCategories.some(cat => categoryLower.includes(cat))) {
            complexity = Math.max(complexity, 3);
        }
        
        // If no learning curve info but has quick setup hints
        if (!tool.learning_curve && tool.brief_purpose_summary) {
            const summary = tool.brief_purpose_summary.toLowerCase();
            if (summary.includes('easy') || summary.includes('simple') || summary.includes('minutes')) {
                complexity = 2;
            }
        }
        
        return Math.min(5, Math.max(1, complexity));
    }
    
    determineQuadrant(impact, complexity) {
        // Quick Wins: High impact (≥80), Low complexity (≤2)
        if (impact >= 80 && complexity <= 2) {
            return 'quick-wins';
        }
        
        // Strategic: High impact (≥80), High complexity (≥4)
        if (impact >= 80 && complexity >= 4) {
            return 'strategic';
        }
        
        // Question Value: Low impact (<50), High complexity (≥4)
        if (impact < 50 && complexity >= 4) {
            return 'question-value';
        }
        
        // Routine: Everything else
        return 'routine';
    }
    
    calculateROI(tool) {
        // Simple ROI calculation based on impact and complexity
        const impact = tool.business_impact_score || 50;
        const complexity = tool.complexity_score || 3;
        
        // Base ROI calculation: higher impact and lower complexity = higher ROI
        let roi = (impact * 3) / complexity;
        
        // Adjust based on pricing
        const monthlyPrice = this.extractMonthlyPrice(tool.pricing_model);
        if (monthlyPrice === 0) {
            roi *= 1.5; // Boost for free tools
        } else if (monthlyPrice > 1000) {
            roi *= 0.8; // Reduce for expensive tools
        }
        
        return Math.round(roi);
    }
    
    extractMonthlyPrice(pricingModel) {
        if (!pricingModel) return 0;
        
        // Use FinancialDataProcessor method if available
        if (super.extractMonthlyPrice) {
            return super.extractMonthlyPrice(pricingModel);
        }
        
        // Simple extraction
        const match = pricingModel.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\/?\s*(?:month|mo)/i);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        
        if (/free/i.test(pricingModel)) return 0;
        if (/enterprise|contact/i.test(pricingModel)) return 5000;
        
        return 100; // Default
    }
    
    buildSearchIndex() {
        this.searchIndex.clear();
        
        this.tools.forEach(tool => {
            // Index by tool name tokens
            const nameTokens = tool.tool_name.toLowerCase().split(/[\s\-_]+/);
            nameTokens.forEach(token => {
                if (token.length > 2) {
                    if (!this.searchIndex.has(token)) {
                        this.searchIndex.set(token, new Set());
                    }
                    this.searchIndex.get(token).add(tool.tool_name);
                }
            });
            
            // Index by category
            if (tool.category) {
                const categoryTokens = tool.category.toLowerCase().split(/[\s\-_]+/);
                categoryTokens.forEach(token => {
                    if (!this.searchIndex.has(token)) {
                        this.searchIndex.set(token, new Set());
                    }
                    this.searchIndex.get(token).add(tool.tool_name);
                });
            }
            
            // Index by tags
            if (tool.tags && Array.isArray(tool.tags)) {
                tool.tags.forEach(tag => {
                    const tagLower = tag.toLowerCase();
                    if (!this.searchIndex.has(tagLower)) {
                        this.searchIndex.set(tagLower, new Set());
                    }
                    this.searchIndex.get(tagLower).add(tool.tool_name);
                });
            }
        });
        
        console.log('Search index built with', this.searchIndex.size, 'tokens');
    }
    
    search(query) {
        if (!query || query.length < 2) {
            return Array.from(this.processedData.values());
        }
        
        const tokens = query.toLowerCase().split(/[\s\-_]+/).filter(t => t.length > 1);
        const matchingSets = tokens.map(token => {
            const exact = this.searchIndex.get(token) || new Set();
            const partial = new Set();
            
            // Find partial matches
            for (const [key, toolNames] of this.searchIndex.entries()) {
                if (key.includes(token)) {
                    toolNames.forEach(name => partial.add(name));
                }
            }
            
            return new Set([...exact, ...partial]);
        });
        
        // Find tools that match all tokens
        let intersection;
        if (matchingSets.length === 0) {
            intersection = new Set();
        } else if (matchingSets.length === 1) {
            intersection = matchingSets[0];
        } else {
            intersection = matchingSets.reduce((a, b) => 
                new Set([...a].filter(x => b.has(x)))
            );
        }
        
        // Convert to tool objects and calculate match scores
        const results = Array.from(intersection)
            .map(toolName => {
                const tool = this.processedData.get(toolName);
                if (tool) {
                    tool.matchScore = this.calculateMatchScore(tool, tokens);
                }
                return tool;
            })
            .filter(Boolean)
            .sort((a, b) => b.matchScore - a.matchScore);
        
        return results;
    }
    
    calculateMatchScore(tool, tokens) {
        let score = 0;
        const toolNameLower = tool.tool_name.toLowerCase();
        
        tokens.forEach(token => {
            // Exact match in name
            if (toolNameLower === token) score += 100;
            // Name contains token
            else if (toolNameLower.includes(token)) score += 50;
            // Category match
            if (tool.category?.toLowerCase().includes(token)) score += 30;
            // Tag match
            if (tool.tags?.some(tag => tag.toLowerCase().includes(token))) score += 20;
        });
        
        return score;
    }
    
    applyFilters(filters) {
        let filtered = Array.from(this.processedData.values());
        
        // Search filter
        if (filters.search) {
            filtered = this.search(filters.search);
        }
        
        // Impact range filter
        if (filters.impactRange) {
            const [min, max] = filters.impactRange;
            filtered = filtered.filter(tool => 
                tool.business_impact_score >= min && 
                tool.business_impact_score <= max
            );
        }
        
        // Complexity filter
        if (filters.complexityLevels?.length) {
            filtered = filtered.filter(tool => 
                filters.complexityLevels.includes(tool.complexity_score)
            );
        }
        
        // Category filter
        if (filters.categories?.length) {
            filtered = filtered.filter(tool => 
                filters.categories.includes(tool.category)
            );
        }
        
        // Quick filter
        if (filters.quickFilter) {
            switch (filters.quickFilter) {
                case 'quick-wins':
                    filtered = filtered.filter(tool => tool.quadrant === 'quick-wins');
                    break;
                case 'strategic':
                    filtered = filtered.filter(tool => tool.quadrant === 'strategic');
                    break;
                case 'high-roi':
                    filtered = filtered.filter(tool => tool.estimatedROI >= 200);
                    break;
            }
        }
        
        return filtered;
    }
    
    refreshMetrics() {
        const tools = Array.from(this.processedData.values());
        
        // Calculate quick wins
        this.executiveMetrics.quickWins = tools.filter(t => t.quadrant === 'quick-wins').length;
        
        // Calculate strategic tools
        this.executiveMetrics.strategic = tools.filter(t => t.quadrant === 'strategic').length;
        
        // Calculate potential savings
        this.executiveMetrics.savings = tools.reduce((sum, tool) => {
            // Estimate savings based on impact and current spend
            const monthlyPrice = this.extractMonthlyPrice(tool.pricing_model);
            const impact = tool.business_impact_score || 50;
            // Higher impact tools can generate more savings through efficiency
            return sum + (monthlyPrice * 12 * (impact / 100) * 0.3); // 30% efficiency gain
        }, 0);
        
        // Calculate average ROI
        const totalROI = tools.reduce((sum, tool) => sum + (tool.estimatedROI || 0), 0);
        this.executiveMetrics.avgROI = Math.round(totalROI / tools.length);
        
        this.executiveMetrics.lastUpdated = new Date();
        
        // Cache the results
        this.metricsCache.set('executive', this.executiveMetrics);
        
        return this.executiveMetrics;
    }
    
    getToolsByQuadrant(quadrant) {
        const toolNames = this.quadrants.get(quadrant) || new Set();
        return Array.from(toolNames).map(name => this.processedData.get(name)).filter(Boolean);
    }
    
    getQuickWinOpportunities(limit = 10) {
        return this.getToolsByQuadrant('quick-wins')
            .sort((a, b) => b.estimatedROI - a.estimatedROI)
            .slice(0, limit);
    }
    
    getStrategicInitiatives() {
        return this.getToolsByQuadrant('strategic')
            .sort((a, b) => b.business_impact_score - a.business_impact_score);
    }
    
    getFilterOptions() {
        const categories = Array.from(this.categoryIndex.keys()).sort();
        const complexityLevels = [1, 2, 3, 4, 5];
        
        return {
            categories,
            complexityLevels,
            impactRange: { min: 0, max: 100 },
            quadrants: ['quick-wins', 'strategic', 'routine', 'question-value']
        };
    }
    
    getFilteredTools(filters = {}) {
        return this.applyFilters(filters);
    }
    
    getToolByName(name) {
        return this.processedData.get(name);
    }
    
    invalidateCache(type) {
        this.metricsCache.invalidate(type);
    }
}

// Metrics Cache implementation
class MetricsCache {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutes
    }
    
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.value;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    invalidate(pattern) {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnterpriseDataProcessor, MetricsCache };
}

// Make available globally
window.EnterpriseDataProcessor = EnterpriseDataProcessor;
window.MetricsCache = MetricsCache;