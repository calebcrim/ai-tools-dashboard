// Web Worker for background data processing
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    try {
        switch (type) {
            case 'CALCULATE_METRICS':
                const metrics = calculateBusinessMetrics(data);
                self.postMessage({ type: 'METRICS_COMPLETE', data: metrics });
                break;
                
            case 'PROCESS_BATCH':
                const processed = processBatch(data);
                self.postMessage({ type: 'BATCH_COMPLETE', data: processed });
                break;
                
            case 'CALCULATE_ANALYTICS':
                const analytics = calculateAnalytics(data);
                self.postMessage({ type: 'ANALYTICS_COMPLETE', data: analytics });
                break;
                
            case 'GENERATE_INSIGHTS':
                const insights = generateInsights(data);
                self.postMessage({ type: 'INSIGHTS_COMPLETE', data: insights });
                break;
        }
    } catch (error) {
        self.postMessage({ 
            type: 'ERROR', 
            data: { 
                message: error.message, 
                stack: error.stack,
                originalType: type 
            } 
        });
    }
});

// Calculate aggregated business metrics
function calculateBusinessMetrics(tools) {
    const metrics = {
        totalTools: tools.length,
        averageImpactScore: 0,
        highImpactCount: 0,
        quickWins: 0,
        totalEstimatedSavings: 0,
        categoriesBreakdown: {},
        complexityDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        integrationCapabilities: {
            api: 0,
            webhook: 0,
            sdk: 0,
            noCode: 0
        }
    };
    
    let totalImpact = 0;
    
    tools.forEach(tool => {
        // Impact calculations
        const impact = tool.businessImpactScore || 0;
        totalImpact += impact;
        
        if (impact >= 80) {
            metrics.highImpactCount++;
        }
        
        // Quick wins: high impact, low complexity
        if (impact >= 70 && tool.complexityScore <= 2) {
            metrics.quickWins++;
        }
        
        // Category breakdown
        if (tool.category) {
            metrics.categoriesBreakdown[tool.category] = 
                (metrics.categoriesBreakdown[tool.category] || 0) + 1;
        }
        
        // Complexity distribution
        if (tool.complexityScore) {
            metrics.complexityDistribution[tool.complexityScore]++;
        }
        
        // Integration capabilities
        const integrationText = (tool.integration_potential || '').toLowerCase();
        if (integrationText.includes('api')) metrics.integrationCapabilities.api++;
        if (integrationText.includes('webhook')) metrics.integrationCapabilities.webhook++;
        if (integrationText.includes('sdk')) metrics.integrationCapabilities.sdk++;
        if (integrationText.includes('no-code') || integrationText.includes('no code')) {
            metrics.integrationCapabilities.noCode++;
        }
        
        // Estimated savings (simplified calculation)
        if (tool.roiScore) {
            metrics.totalEstimatedSavings += tool.roiScore * 1000; // Arbitrary multiplier
        }
    });
    
    metrics.averageImpactScore = tools.length > 0 ? 
        Math.round(totalImpact / tools.length) : 0;
    
    return metrics;
}

// Process batch of tools with enhanced calculations
function processBatch(batch) {
    return batch.map(tool => {
        const processed = {
            ...tool,
            // Calculate scores if not already present
            businessImpactScore: tool.businessImpactScore || calculateBusinessImpact(tool),
            complexityScore: tool.complexityScore || calculateComplexity(tool),
            roiScore: tool.roiScore || calculateROI(tool),
            riskLevel: tool.riskLevel || assessRisk(tool)
        };
        
        return processed;
    });
}

// Calculate detailed analytics
function calculateAnalytics(tools) {
    const analytics = {
        topPerformers: [],
        bottomPerformers: [],
        bestROI: [],
        mostComplex: [],
        quickestImplementation: [],
        byCategory: {},
        trends: {
            aiAdoption: 0,
            cloudBased: 0,
            openSource: 0,
            enterprise: 0
        }
    };
    
    // Sort and slice for top/bottom performers
    const sortedByImpact = [...tools].sort((a, b) => 
        (b.businessImpactScore || 0) - (a.businessImpactScore || 0)
    );
    
    analytics.topPerformers = sortedByImpact.slice(0, 10).map(formatToolSummary);
    analytics.bottomPerformers = sortedByImpact.slice(-10).reverse().map(formatToolSummary);
    
    // Best ROI
    const sortedByROI = [...tools].sort((a, b) => 
        (b.roiScore || 0) - (a.roiScore || 0)
    );
    analytics.bestROI = sortedByROI.slice(0, 10).map(formatToolSummary);
    
    // Most complex
    const sortedByComplexity = [...tools].sort((a, b) => 
        (b.complexityScore || 0) - (a.complexityScore || 0)
    );
    analytics.mostComplex = sortedByComplexity.slice(0, 10).map(formatToolSummary);
    
    // Category analysis
    tools.forEach(tool => {
        const category = tool.category || 'Uncategorized';
        if (!analytics.byCategory[category]) {
            analytics.byCategory[category] = {
                count: 0,
                avgImpact: 0,
                avgComplexity: 0,
                tools: []
            };
        }
        
        const catStats = analytics.byCategory[category];
        catStats.count++;
        catStats.avgImpact += (tool.businessImpactScore || 0);
        catStats.avgComplexity += (tool.complexityScore || 0);
        catStats.tools.push(tool.tool_name);
    });
    
    // Calculate category averages
    Object.keys(analytics.byCategory).forEach(category => {
        const catStats = analytics.byCategory[category];
        catStats.avgImpact = Math.round(catStats.avgImpact / catStats.count);
        catStats.avgComplexity = Math.round(catStats.avgComplexity / catStats.count * 10) / 10;
    });
    
    // Trend analysis
    tools.forEach(tool => {
        const description = (tool.brief_purpose_summary || '').toLowerCase();
        const features = (tool.feature_breakdown || '').toLowerCase();
        
        if (description.includes('ai') || description.includes('artificial intelligence')) {
            analytics.trends.aiAdoption++;
        }
        if (description.includes('cloud') || features.includes('saas')) {
            analytics.trends.cloudBased++;
        }
        if (description.includes('open source') || features.includes('open-source')) {
            analytics.trends.openSource++;
        }
        if (tool.pricing_model && tool.pricing_model.toLowerCase().includes('enterprise')) {
            analytics.trends.enterprise++;
        }
    });
    
    return analytics;
}

// Generate actionable insights
function generateInsights(data) {
    const { tools, metrics } = data;
    const insights = [];
    
    // Quick wins insight
    if (metrics.quickWins > 0) {
        insights.push({
            type: 'opportunity',
            priority: 'high',
            title: `${metrics.quickWins} Quick Win Opportunities`,
            description: `Found ${metrics.quickWins} tools with high impact (70+) and low complexity (≤2) that could deliver rapid value.`,
            action: 'Review these tools for immediate implementation'
        });
    }
    
    // Underutilized categories
    const avgToolsPerCategory = tools.length / Object.keys(metrics.categoriesBreakdown).length;
    Object.entries(metrics.categoriesBreakdown).forEach(([category, count]) => {
        if (count < avgToolsPerCategory * 0.5) {
            insights.push({
                type: 'gap',
                priority: 'medium',
                title: `Limited ${category} Tools`,
                description: `Only ${count} tools in ${category} category, below average of ${Math.round(avgToolsPerCategory)}.`,
                action: 'Consider expanding tool evaluation in this category'
            });
        }
    });
    
    // Integration opportunities
    const integrationRate = (metrics.integrationCapabilities.api + metrics.integrationCapabilities.webhook) / tools.length;
    if (integrationRate < 0.5) {
        insights.push({
            type: 'warning',
            priority: 'medium',
            title: 'Limited Integration Capabilities',
            description: `Only ${Math.round(integrationRate * 100)}% of tools have API/webhook integrations.`,
            action: 'Prioritize tools with strong integration capabilities for better workflow automation'
        });
    }
    
    // Complexity warning
    const highComplexityRate = (metrics.complexityDistribution[4] + metrics.complexityDistribution[5]) / tools.length;
    if (highComplexityRate > 0.3) {
        insights.push({
            type: 'warning',
            priority: 'high',
            title: 'High Implementation Complexity',
            description: `${Math.round(highComplexityRate * 100)}% of tools have high complexity scores (4-5).`,
            action: 'Balance portfolio with simpler tools or allocate more resources for implementation'
        });
    }
    
    return insights;
}

// Helper functions
function calculateBusinessImpact(tool) {
    let score = 50; // Base score
    
    if (tool.feature_breakdown && tool.feature_breakdown.length > 100) score += 10;
    if (tool.pricing_model && tool.pricing_model.toLowerCase().includes('enterprise')) score += 15;
    if (tool.integration_potential && tool.integration_potential.length > 50) score += 10;
    if (tool.case_studies && tool.case_studies.length > 50) score += 15;
    
    return Math.min(100, score);
}

function calculateComplexity(tool) {
    if (!tool.learning_curve) return 3;
    
    const lcLower = tool.learning_curve.toLowerCase();
    if (lcLower.includes('low') || lcLower.includes('easy')) return 1;
    if (lcLower.includes('medium') || lcLower.includes('moderate')) return 3;
    if (lcLower.includes('high') || lcLower.includes('steep')) return 5;
    
    return 3;
}

function calculateROI(tool) {
    const impact = calculateBusinessImpact(tool);
    const complexity = calculateComplexity(tool);
    return Math.round((impact / complexity) * 20);
}

function assessRisk(tool) {
    let riskScore = 0;
    
    if (calculateComplexity(tool) >= 4) riskScore += 2;
    if (tool.case_studies && tool.case_studies.length > 100) riskScore -= 1;
    if (tool.geo_regulatory_limitations && tool.geo_regulatory_limitations.length > 50) riskScore += 1;
    
    if (riskScore <= 0) return 'Low';
    if (riskScore <= 2) return 'Medium';
    return 'High';
}

function formatToolSummary(tool) {
    return {
        name: tool.tool_name,
        category: tool.category,
        score: tool.businessImpactScore || 0,
        complexity: tool.complexityScore || 0,
        roi: tool.roiScore || 0
    };
}

// Average calculation helper
function average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}