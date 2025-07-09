// Financial Data Processor - Phase 1 Implementation
// Processes 317 AI tools for comprehensive financial analysis

class FinancialDataProcessor {
  constructor(toolsData) {
    this.tools = toolsData;
    this.financialMetrics = new Map();
    this.redundancies = [];
    this.savingsOpportunities = [];
    this.processingTime = 0;
    this.init();
  }

  init() {
    const startTime = performance.now();
    console.log(`Processing financial data for ${this.tools.length} tools...`);
    
    this.processFinancialMetrics();
    this.identifyRedundancies();
    this.calculateSavingsOpportunities();
    this.buildFinancialIndices();
    
    this.processingTime = performance.now() - startTime;
    console.log(`Financial data processing complete in ${this.processingTime.toFixed(2)}ms`);
    
    // Debug output
    console.log('Processing results:', {
      totalTools: this.financialMetrics.size,
      totalMonthlySpend: this.getTotalSpend(),
      totalAnnualSpend: this.getTotalSpend() * 12,
      savingsOpportunities: this.savingsOpportunities.length,
      redundancies: this.redundancies.length,
      quickWins: this.getQuickWins().length
    });
  }

  processFinancialMetrics() {
    this.tools.forEach(tool => {
      const metrics = {
        monthlyPrice: this.extractMonthlyPrice(tool.pricing_model),
        annualPrice: null,
        pricePerUser: null,
        tco: {
          subscription: 0,
          implementation: 0,
          training: 0,
          integration: 0,
          maintenance: 0,
          total: 0
        },
        roi: this.extractROIMetrics(tool.case_studies),
        savingsPotential: 0,
        businessImpact: tool.business_impact_score || 50,
        complexity: tool.complexity_score || 3,
        confidenceScore: this.calculateConfidenceScore(tool)
      };

      // Calculate annual price with potential discounts
      metrics.annualPrice = metrics.monthlyPrice * 12 * 0.9; // 10% annual discount

      // Calculate TCO components
      metrics.tco = this.calculateTCO(tool, metrics.monthlyPrice);

      this.financialMetrics.set(tool.tool_name, metrics);
    });
  }

  extractMonthlyPrice(pricingModel) {
    if (!pricingModel) return 0;

    // Handle various pricing formats
    const patterns = [
      { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\/\s*month/i, multiplier: 1 },
      { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\/\s*user\s*\/\s*month/i, multiplier: 50 }, // Assume 50 users
      { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\/\s*year/i, multiplier: 1/12 },
      { regex: /starting at\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, multiplier: 1 },
      { regex: /from\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, multiplier: 1 },
      { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*per\s*month/i, multiplier: 1 },
      { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*monthly/i, multiplier: 1 }
    ];

    for (const pattern of patterns) {
      const match = pricingModel.match(pattern.regex);
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        return price * pattern.multiplier;
      }
    }

    // Handle enterprise/custom pricing
    if (/enterprise|custom|contact|quote/i.test(pricingModel)) {
      return 5000; // Default enterprise estimate
    }

    // Handle free/freemium
    if (/free|freemium|trial/i.test(pricingModel)) {
      return 0;
    }

    return 0;
  }

  calculateTCO(tool, monthlySubscription) {
    const tco = {
      subscription: monthlySubscription * 36, // 3 years
      implementation: 0,
      training: 0,
      integration: 0,
      maintenance: 0,
      total: 0
    };

    // Implementation cost based on complexity
    const implementationMultipliers = {
      1: 2000,   // 1 week effort
      2: 8000,   // 1 month effort
      3: 20000,  // 2.5 months effort
      4: 40000,  // 5 months effort
      5: 80000   // 10 months effort
    };
    tco.implementation = implementationMultipliers[tool.complexity_score] || 20000;

    // Training cost based on learning curve
    const trainingCosts = {
      'low': 1000,
      'medium': 5000,
      'high': 15000,
      'expert': 30000
    };
    const learningCurve = tool.learning_curve?.toLowerCase() || 'medium';
    tco.training = trainingCosts[learningCurve] || 5000;

    // Integration cost estimation
    if (tool.integration_potential?.includes('API')) {
      tco.integration = 10000;
    } else if (tool.integration_potential?.includes('native')) {
      tco.integration = 5000;
    } else {
      tco.integration = 2000;
    }

    // Annual maintenance (15% of subscription)
    tco.maintenance = monthlySubscription * 12 * 0.15 * 3;

    // Calculate total
    tco.total = tco.subscription + tco.implementation + tco.training + tco.integration + tco.maintenance;

    return tco;
  }

  extractROIMetrics(caseStudies) {
    const metrics = {
      timeToValue: 12, // months
      productivityGain: 0,
      costSavings: 0,
      revenueImpact: 0,
      roiPercentage: 0,
      confidence: 0.5
    };

    if (!caseStudies) return metrics;

    // Extract productivity improvements
    const productivityMatch = caseStudies.match(/(\d+)%?\s*(?:productivity|efficiency|faster|time\s*savings?)/i);
    if (productivityMatch) {
      metrics.productivityGain = parseFloat(productivityMatch[1]);
      metrics.confidence += 0.2;
    }

    // Extract cost savings
    const costMatch = caseStudies.match(/\$?([\d,]+)\s*(?:savings?|saved|reduced?\s*costs?)/i);
    if (costMatch) {
      metrics.costSavings = parseFloat(costMatch[1].replace(/,/g, ''));
      metrics.confidence += 0.2;
    }

    // Extract revenue impact
    const revenueMatch = caseStudies.match(/(\d+)%?\s*(?:revenue|sales|growth)/i);
    if (revenueMatch) {
      metrics.revenueImpact = parseFloat(revenueMatch[1]);
      metrics.confidence += 0.1;
    }

    // Calculate ROI percentage
    if (metrics.productivityGain > 0) {
      metrics.roiPercentage = Math.min(500, metrics.productivityGain * 3); // Cap at 500%
    }

    return metrics;
  }

  calculateConfidenceScore(tool) {
    let score = 0.3; // Base confidence

    // Higher confidence for complete data
    if (tool.pricing_model && tool.pricing_model !== 'N/A') score += 0.2;
    if (tool.case_studies && tool.case_studies.length > 50) score += 0.2;
    if (tool.complexity_score && tool.complexity_score > 0) score += 0.1;
    if (tool.learning_curve && tool.learning_curve !== 'N/A') score += 0.1;
    if (tool.integration_potential && tool.integration_potential.length > 20) score += 0.1;

    return Math.min(1.0, score);
  }

  identifyRedundancies() {
    const categoryTools = new Map();
    
    this.tools.forEach(tool => {
      if (!categoryTools.has(tool.category)) {
        categoryTools.set(tool.category, []);
      }
      categoryTools.get(tool.category).push(tool);
    });

    // Find categories with multiple tools
    this.redundancies = [];
    categoryTools.forEach((tools, category) => {
      if (tools.length > 3) {
        const totalSpend = tools.reduce((sum, tool) => {
          const metrics = this.financialMetrics.get(tool.tool_name);
          return sum + (metrics?.monthlyPrice || 0);
        }, 0);

        this.redundancies.push({
          category,
          toolCount: tools.length,
          monthlySpend: totalSpend,
          potentialSavings: totalSpend * 0.6, // Could save 60% through consolidation
          tools: tools.map(t => ({
            name: t.tool_name,
            price: this.financialMetrics.get(t.tool_name)?.monthlyPrice || 0,
            businessImpact: t.business_impact_score || 50
          })).sort((a, b) => b.businessImpact - a.businessImpact)
        });
      }
    });

    // Sort by potential savings
    this.redundancies.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  calculateSavingsOpportunities() {
    this.savingsOpportunities = [];

    // Redundancy savings
    this.redundancies.forEach(redundancy => {
      this.savingsOpportunities.push({
        type: 'consolidation',
        category: redundancy.category,
        description: `Consolidate ${redundancy.toolCount} ${redundancy.category} tools`,
        monthlySavings: redundancy.potentialSavings,
        annualSavings: redundancy.potentialSavings * 12,
        effort: 'medium',
        confidence: 0.8,
        tools: redundancy.tools.map(t => t.name)
      });
    });

    // Underutilized tools (low impact score, high cost)
    this.tools.forEach(tool => {
      const metrics = this.financialMetrics.get(tool.tool_name);
      if (tool.business_impact_score < 50 && metrics?.monthlyPrice > 500) {
        this.savingsOpportunities.push({
          type: 'elimination',
          tool: tool.tool_name,
          description: `Consider eliminating low-impact tool: ${tool.tool_name}`,
          monthlySavings: metrics.monthlyPrice,
          annualSavings: metrics.monthlyPrice * 12,
          effort: 'low',
          confidence: 0.7,
          businessImpact: tool.business_impact_score || 0
        });
      }
    });

    // Overpriced tools (high cost, low complexity)
    this.tools.forEach(tool => {
      const metrics = this.financialMetrics.get(tool.tool_name);
      if (tool.complexity_score <= 2 && metrics?.monthlyPrice > 1000) {
        this.savingsOpportunities.push({
          type: 'negotiation',
          tool: tool.tool_name,
          description: `Negotiate better pricing for ${tool.tool_name} - simple tool with high cost`,
          monthlySavings: metrics.monthlyPrice * 0.3, // 30% potential savings
          annualSavings: metrics.monthlyPrice * 12 * 0.3,
          effort: 'low',
          confidence: 0.6,
          currentPrice: metrics.monthlyPrice
        });
      }
    });

    // Sort by savings potential
    this.savingsOpportunities.sort((a, b) => b.annualSavings - a.annualSavings);
  }

  buildFinancialIndices() {
    // Build sorted indices for fast querying
    this.indices = {
      byCost: Array.from(this.financialMetrics.entries())
        .sort((a, b) => (b[1].monthlyPrice || 0) - (a[1].monthlyPrice || 0)),
      byROI: Array.from(this.financialMetrics.entries())
        .sort((a, b) => (b[1].roi.roiPercentage || 0) - (a[1].roi.roiPercentage || 0)),
      byCategory: this.groupByCategory(),
      byComplexity: this.groupByComplexity()
    };
  }

  groupByCategory() {
    const categories = new Map();
    this.tools.forEach(tool => {
      const category = tool.category || 'Uncategorized';
      if (!categories.has(category)) {
        categories.set(category, {
          tools: [],
          totalMonthlySpend: 0,
          averageROI: 0,
          toolCount: 0
        });
      }
      
      const categoryData = categories.get(category);
      categoryData.tools.push(tool);
      categoryData.toolCount++;
      
      const metrics = this.financialMetrics.get(tool.tool_name);
      if (metrics) {
        categoryData.totalMonthlySpend += metrics.monthlyPrice || 0;
        categoryData.averageROI += metrics.roi.roiPercentage || 0;
      }
    });

    // Calculate averages
    categories.forEach(data => {
      data.averageROI = data.averageROI / data.toolCount;
    });

    return categories;
  }

  groupByComplexity() {
    const complexity = new Map();
    [1, 2, 3, 4, 5].forEach(level => {
      complexity.set(level, {
        tools: [],
        totalMonthlySpend: 0,
        averageROI: 0,
        toolCount: 0
      });
    });

    this.tools.forEach(tool => {
      const level = tool.complexity_score || 3;
      const complexityData = complexity.get(level);
      if (complexityData) {
        complexityData.tools.push(tool);
        complexityData.toolCount++;
        
        const metrics = this.financialMetrics.get(tool.tool_name);
        if (metrics) {
          complexityData.totalMonthlySpend += metrics.monthlyPrice || 0;
          complexityData.averageROI += metrics.roi.roiPercentage || 0;
        }
      }
    });

    // Calculate averages
    complexity.forEach(data => {
      if (data.toolCount > 0) {
        data.averageROI = data.averageROI / data.toolCount;
      }
    });

    return complexity;
  }

  getTotalSpend() {
    let total = 0;
    this.financialMetrics.forEach(metrics => {
      total += metrics.monthlyPrice || 0;
    });
    return total;
  }

  getTotalSavings() {
    return this.savingsOpportunities.reduce((sum, opp) => sum + opp.annualSavings, 0);
  }

  getQuickWins() {
    return this.tools.filter(tool => {
      const metrics = this.financialMetrics.get(tool.tool_name);
      return (
        tool.business_impact_score >= 80 && 
        tool.complexity_score <= 2 &&
        metrics?.monthlyPrice <= 1000 &&
        metrics?.roi.roiPercentage >= 200
      );
    });
  }

  getTopExpensiveTools(limit = 10) {
    return this.indices.byCost.slice(0, limit).map(([toolName, metrics]) => ({
      toolName,
      monthlyPrice: metrics.monthlyPrice,
      annualPrice: metrics.annualPrice,
      tco: metrics.tco.total,
      roi: metrics.roi.roiPercentage
    }));
  }

  getTopROITools(limit = 10) {
    return this.indices.byROI.slice(0, limit).map(([toolName, metrics]) => ({
      toolName,
      monthlyPrice: metrics.monthlyPrice,
      roi: metrics.roi.roiPercentage,
      businessImpact: metrics.businessImpact,
      confidence: metrics.confidenceScore
    }));
  }

  getCategorySpendBreakdown() {
    const breakdown = [];
    this.indices.byCategory.forEach((data, category) => {
      breakdown.push({
        category,
        monthlySpend: data.totalMonthlySpend,
        annualSpend: data.totalMonthlySpend * 12,
        toolCount: data.toolCount,
        averageROI: data.averageROI
      });
    });
    return breakdown.sort((a, b) => b.monthlySpend - a.monthlySpend);
  }

  getPortfolioSummary() {
    const totalMonthly = this.getTotalSpend();
    const totalSavings = this.getTotalSavings();
    const quickWins = this.getQuickWins();
    const averageROI = this.calculateAverageROI();

    return {
      totalMonthlySpend: totalMonthly,
      totalAnnualSpend: totalMonthly * 12,
      totalSavingsOpportunity: totalSavings,
      quickWinsCount: quickWins.length,
      averageROI,
      toolCount: this.tools.length,
      categoriesCount: this.indices.byCategory.size,
      highConfidenceTools: Array.from(this.financialMetrics.values())
        .filter(m => m.confidenceScore >= 0.8).length,
      processingTime: this.processingTime
    };
  }

  calculateAverageROI() {
    const toolsWithROI = Array.from(this.financialMetrics.values())
      .filter(m => m.roi.roiPercentage > 0);
    
    if (toolsWithROI.length === 0) return 0;
    
    const totalROI = toolsWithROI.reduce((sum, m) => sum + m.roi.roiPercentage, 0);
    return Math.round(totalROI / toolsWithROI.length);
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      processingTime: this.processingTime,
      toolsProcessed: this.tools.length,
      metricsGenerated: this.financialMetrics.size,
      savingsOpportunities: this.savingsOpportunities.length,
      redundanciesFound: this.redundancies.length,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    // Rough estimate of memory usage
    const toolsSize = JSON.stringify(this.tools).length;
    const metricsSize = JSON.stringify(Array.from(this.financialMetrics.entries())).length;
    return Math.round((toolsSize + metricsSize) / 1024); // KB
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FinancialDataProcessor;
}