// Cost Calculator - Advanced TCO and ROI Calculations
// Sub-2 second calculation engine for financial analysis

class CostCalculator {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.calculations = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  calculateToolTCO(toolName, options = {}) {
    const cacheKey = `tco_${toolName}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const {
      teamSize = 50,
      years = 3,
      includeOpportunityCost = true,
      growthRate = 0.2,
      inflationRate = 0.03,
      customPricing = null
    } = options;

    const tool = this.dataProcessor.tools.find(t => t.tool_name === toolName);
    if (!tool) return null;

    const baseMetrics = this.dataProcessor.financialMetrics.get(toolName);
    if (!baseMetrics) return null;

    const tco = { ...baseMetrics.tco };

    // Use custom pricing if provided
    const monthlyPrice = customPricing || baseMetrics.monthlyPrice;

    // Adjust for team size and pricing model
    if (tool.pricing_model?.includes('per user')) {
      tco.subscription = this.calculateSubscriptionWithGrowth(
        monthlyPrice, teamSize, years, growthRate, inflationRate
      );
    } else {
      tco.subscription = this.calculateSubscriptionWithInflation(
        monthlyPrice, years, inflationRate
      );
    }

    // Scale implementation cost with team size
    tco.implementation = this.scaleImplementationCost(
      tco.implementation, teamSize, tool.complexity_score
    );

    // Scale training cost with team size
    tco.training = this.scaleTrainingCost(
      tco.training, teamSize, tool.learning_curve
    );

    // Add opportunity cost
    if (includeOpportunityCost) {
      const delayMonths = this.estimateImplementationTime(tool);
      const monthlyBenefit = this.estimateMonthlyBenefit(tool, teamSize);
      tco.opportunity = delayMonths * monthlyBenefit;
    }

    // Risk adjustment
    tco.riskAdjustment = this.calculateRiskAdjustment(tool, tco);

    // Recalculate total
    tco.total = tco.subscription + tco.implementation + tco.training + 
                tco.integration + tco.maintenance + (tco.opportunity || 0) + 
                tco.riskAdjustment;

    // Add confidence metrics
    const result = {
      toolName,
      tco,
      confidence: baseMetrics.confidenceScore,
      assumptions: {
        teamSize,
        years,
        growthRate,
        inflationRate,
        monthlyPrice
      },
      calculatedAt: new Date()
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  calculateSubscriptionWithGrowth(monthlyPrice, teamSize, years, growthRate, inflationRate) {
    let totalCost = 0;
    let currentTeamSize = teamSize;
    
    for (let year = 0; year < years; year++) {
      const yearlyInflation = Math.pow(1 + inflationRate, year);
      const adjustedPrice = monthlyPrice * yearlyInflation;
      const yearCost = adjustedPrice * currentTeamSize * 12;
      
      totalCost += yearCost;
      currentTeamSize = Math.ceil(currentTeamSize * (1 + growthRate));
    }
    
    return totalCost;
  }

  calculateSubscriptionWithInflation(monthlyPrice, years, inflationRate) {
    let totalCost = 0;
    
    for (let year = 0; year < years; year++) {
      const yearlyInflation = Math.pow(1 + inflationRate, year);
      const adjustedPrice = monthlyPrice * yearlyInflation;
      totalCost += adjustedPrice * 12;
    }
    
    return totalCost;
  }

  scaleImplementationCost(baseCost, teamSize, complexity) {
    // Scale implementation cost based on team size and complexity
    const teamSizeMultiplier = Math.log10(teamSize / 10) + 1; // Logarithmic scaling
    const complexityMultiplier = complexity ? Math.pow(complexity, 0.5) : 1;
    
    return baseCost * teamSizeMultiplier * complexityMultiplier;
  }

  scaleTrainingCost(baseCost, teamSize, learningCurve) {
    // Scale training cost based on team size and learning curve
    const teamSizeMultiplier = teamSize / 50; // Linear scaling
    const learningMultiplier = {
      'low': 0.7,
      'medium': 1.0,
      'high': 1.5,
      'expert': 2.0
    };
    
    const curve = learningCurve?.toLowerCase() || 'medium';
    return baseCost * teamSizeMultiplier * (learningMultiplier[curve] || 1.0);
  }

  calculateRiskAdjustment(tool, tco) {
    let riskFactor = 0;
    
    // Pricing model risk
    if (tool.pricing_model?.includes('custom') || tool.pricing_model?.includes('enterprise')) {
      riskFactor += 0.15; // 15% risk for custom pricing
    }
    
    // Complexity risk
    if (tool.complexity_score >= 4) {
      riskFactor += 0.10; // 10% risk for complex tools
    }
    
    // Learning curve risk
    if (tool.learning_curve?.toLowerCase() === 'high' || tool.learning_curve?.toLowerCase() === 'expert') {
      riskFactor += 0.08; // 8% risk for steep learning curves
    }
    
    // Integration risk
    if (!tool.integration_potential || tool.integration_potential.length < 10) {
      riskFactor += 0.05; // 5% risk for poor integration
    }
    
    return (tco.subscription + tco.implementation + tco.training) * riskFactor;
  }

  estimateImplementationTime(tool) {
    // Estimate implementation time in months based on complexity
    const timeMap = {
      1: 0.5,  // 2 weeks
      2: 1,    // 1 month
      3: 2,    // 2 months
      4: 4,    // 4 months
      5: 6     // 6 months
    };
    
    return timeMap[tool.complexity_score] || 2;
  }

  estimateMonthlyBenefit(tool, teamSize) {
    // Estimate monthly benefit based on business impact and team size
    const baseMetrics = this.dataProcessor.financialMetrics.get(tool.tool_name);
    if (!baseMetrics) return 0;
    
    const hourlyRate = 75; // Average hourly rate
    const hoursPerMonth = 160; // Working hours per month
    const productivityGain = baseMetrics.roi.productivityGain / 100;
    
    // Estimate affected team percentage based on tool category
    const affectedPercentage = this.getAffectedTeamPercentage(tool.category);
    const affectedTeamSize = Math.ceil(teamSize * affectedPercentage);
    
    return affectedTeamSize * hoursPerMonth * hourlyRate * productivityGain;
  }

  getAffectedTeamPercentage(category) {
    const percentages = {
      'ai assistant': 0.8,
      'productivity': 0.9,
      'content creation': 0.3,
      'analytics': 0.4,
      'security': 0.2,
      'finance': 0.1,
      'hr': 0.15,
      'sales': 0.25,
      'marketing': 0.3
    };
    
    return percentages[category?.toLowerCase()] || 0.5;
  }

  calculatePortfolioTCO(toolNames, options = {}) {
    const startTime = performance.now();
    
    const portfolioTCO = {
      tools: [],
      totalByCategory: {},
      grandTotal: 0,
      savingsFromBundling: 0,
      riskAdjustedTotal: 0,
      calculations: {
        startTime,
        endTime: null,
        duration: null
      }
    };

    toolNames.forEach(toolName => {
      const toolTCO = this.calculateToolTCO(toolName, options);
      if (toolTCO) {
        const tool = this.dataProcessor.tools.find(t => t.tool_name === toolName);
        const category = tool?.category || 'Uncategorized';
        
        portfolioTCO.tools.push({
          name: toolName,
          category,
          tco: toolTCO.tco,
          confidence: toolTCO.confidence
        });
        
        // Sum by category
        if (!portfolioTCO.totalByCategory[category]) {
          portfolioTCO.totalByCategory[category] = 0;
        }
        portfolioTCO.totalByCategory[category] += toolTCO.tco.total;
        
        portfolioTCO.grandTotal += toolTCO.tco.total;
      }
    });

    // Calculate potential bundling savings
    portfolioTCO.savingsFromBundling = this.calculateBundlingSavings(toolNames);
    portfolioTCO.riskAdjustedTotal = portfolioTCO.grandTotal - portfolioTCO.savingsFromBundling;

    // Performance metrics
    portfolioTCO.calculations.endTime = performance.now();
    portfolioTCO.calculations.duration = portfolioTCO.calculations.endTime - startTime;

    return portfolioTCO;
  }

  calculateBundlingSavings(toolNames) {
    // Identify tools from same vendor or category for bundling discounts
    const vendors = new Map();
    const categories = new Map();
    
    toolNames.forEach(toolName => {
      const tool = this.dataProcessor.tools.find(t => t.tool_name === toolName);
      if (tool) {
        // Group by vendor (simplified - using domain)
        const vendor = tool.url?.split('.')[0] || 'unknown';
        if (!vendors.has(vendor)) vendors.set(vendor, []);
        vendors.get(vendor).push(toolName);
        
        // Group by category
        const category = tool.category || 'Uncategorized';
        if (!categories.has(category)) categories.set(category, []);
        categories.get(category).push(toolName);
      }
    });

    let totalSavings = 0;

    // Vendor bundling savings (5-15% discount for multiple tools)
    vendors.forEach((tools, vendor) => {
      if (tools.length >= 2) {
        const vendorTotal = tools.reduce((sum, toolName) => {
          const metrics = this.dataProcessor.financialMetrics.get(toolName);
          return sum + (metrics?.monthlyPrice || 0) * 36; // 3 years
        }, 0);
        
        const discountRate = Math.min(0.15, 0.05 + (tools.length - 1) * 0.025);
        totalSavings += vendorTotal * discountRate;
      }
    });

    return totalSavings;
  }

  calculateROI(toolName, options = {}) {
    const tcoResult = this.calculateToolTCO(toolName, options);
    if (!tcoResult) return null;

    const tool = this.dataProcessor.tools.find(t => t.tool_name === toolName);
    const baseMetrics = this.dataProcessor.financialMetrics.get(toolName);
    
    if (!tool || !baseMetrics) return null;

    const benefits = this.calculateBenefits(tool, options.teamSize || 50);
    const tco = tcoResult.tco;

    return {
      toolName,
      totalCost: tco.total,
      totalBenefit: benefits.total,
      netBenefit: benefits.total - tco.total,
      roi: ((benefits.total - tco.total) / tco.total) * 100,
      paybackMonths: Math.ceil(tco.total / (benefits.monthly || 1)),
      breakEvenMonth: this.calculateBreakEven(tco, benefits),
      benefitBreakdown: benefits.breakdown,
      confidence: tcoResult.confidence,
      riskAdjustedROI: this.calculateRiskAdjustedROI(tco, benefits, tool)
    };
  }

  calculateBenefits(tool, teamSize) {
    const baseMetrics = this.dataProcessor.financialMetrics.get(tool.tool_name);
    const benefits = {
      productivity: 0,
      costSavings: 0,
      revenue: 0,
      riskMitigation: 0,
      total: 0,
      monthly: 0,
      breakdown: {}
    };

    // Productivity benefits
    if (baseMetrics.roi.productivityGain > 0) {
      const hourlyRate = 75;
      const hoursPerMonth = 160;
      const affectedPercentage = this.getAffectedTeamPercentage(tool.category);
      const affectedTeamSize = Math.ceil(teamSize * affectedPercentage);
      
      benefits.productivity = affectedTeamSize * hoursPerMonth * hourlyRate * 
                             (baseMetrics.roi.productivityGain / 100) * 36; // 3 years
      benefits.breakdown.productivity = {
        affectedTeamSize,
        productivityGain: baseMetrics.roi.productivityGain,
        monthlyValue: benefits.productivity / 36
      };
    }

    // Cost savings from case studies
    if (baseMetrics.roi.costSavings > 0) {
      benefits.costSavings = baseMetrics.roi.costSavings * 3; // 3 years
      benefits.breakdown.costSavings = {
        annualSavings: baseMetrics.roi.costSavings,
        source: 'case_studies'
      };
    }

    // Revenue impact
    if (baseMetrics.roi.revenueImpact > 0) {
      // Conservative estimate: 10% of revenue impact
      benefits.revenue = 10000000 * (baseMetrics.roi.revenueImpact / 100) * 0.1;
      benefits.breakdown.revenue = {
        revenueImpact: baseMetrics.roi.revenueImpact,
        conservativeMultiplier: 0.1
      };
    }

    // Risk mitigation value (for security tools)
    if (tool.category?.toLowerCase().includes('security')) {
      benefits.riskMitigation = 500000; // Conservative estimate
      benefits.breakdown.riskMitigation = {
        estimatedValue: benefits.riskMitigation,
        description: 'Risk mitigation value'
      };
    }

    benefits.total = benefits.productivity + benefits.costSavings + 
                    benefits.revenue + benefits.riskMitigation;
    benefits.monthly = benefits.total / 36; // 3-year period

    return benefits;
  }

  calculateBreakEven(tco, benefits) {
    if (benefits.monthly <= 0) return null;
    
    let cumulativeCosts = 0;
    let cumulativeBenefits = 0;
    
    // Implementation costs upfront
    cumulativeCosts += tco.implementation + tco.training + tco.integration;
    
    for (let month = 1; month <= 36; month++) {
      cumulativeCosts += (tco.subscription + tco.maintenance) / 36;
      cumulativeBenefits += benefits.monthly;
      
      if (cumulativeBenefits >= cumulativeCosts) {
        return month;
      }
    }
    
    return null; // No break-even within 3 years
  }

  calculateRiskAdjustedROI(tco, benefits, tool) {
    const baseROI = ((benefits.total - tco.total) / tco.total) * 100;
    
    // Risk factors
    let riskMultiplier = 1.0;
    
    // Confidence in data
    const baseMetrics = this.dataProcessor.financialMetrics.get(tool.tool_name);
    if (baseMetrics.confidenceScore < 0.7) {
      riskMultiplier -= 0.2;
    }
    
    // Market maturity
    if (tool.category?.toLowerCase().includes('ai') && 
        !tool.case_studies?.includes('enterprise')) {
      riskMultiplier -= 0.1;
    }
    
    // Complexity risk
    if (tool.complexity_score >= 4) {
      riskMultiplier -= 0.15;
    }
    
    return baseROI * Math.max(0.5, riskMultiplier);
  }

  generateCostReport(options = {}) {
    const {
      includeAllTools = false,
      topN = 20,
      teamSize = 50,
      years = 3
    } = options;

    const report = {
      generatedAt: new Date(),
      parameters: { teamSize, years, topN },
      portfolio: this.dataProcessor.getPortfolioSummary(),
      topCosts: [],
      topROI: [],
      savingsOpportunities: this.dataProcessor.savingsOpportunities.slice(0, 10),
      recommendations: [],
      categoryBreakdown: this.dataProcessor.getCategorySpendBreakdown(),
      performance: {
        calculationTime: 0,
        toolsAnalyzed: 0,
        cacheHitRate: 0
      }
    };

    const startTime = performance.now();

    // Get top expensive tools with TCO
    const topExpensiveTools = this.dataProcessor.getTopExpensiveTools(topN);
    report.topCosts = topExpensiveTools.map(tool => {
      const tco = this.calculateToolTCO(tool.toolName, { teamSize, years });
      return {
        ...tool,
        tco: tco?.tco || { total: 0 },
        confidence: tco?.confidence || 0
      };
    });

    // Get top ROI tools
    const topROITools = this.dataProcessor.getTopROITools(topN);
    report.topROI = topROITools.map(tool => {
      const roi = this.calculateROI(tool.toolName, { teamSize, years });
      return {
        ...tool,
        roi: roi?.roi || 0,
        paybackMonths: roi?.paybackMonths || null,
        riskAdjustedROI: roi?.riskAdjustedROI || 0
      };
    });

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // Performance metrics
    report.performance.calculationTime = performance.now() - startTime;
    report.performance.toolsAnalyzed = report.topCosts.length;
    report.performance.cacheHitRate = this.cache.size / (this.cache.size + report.topCosts.length);

    return report;
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Quick wins recommendation
    const quickWins = this.dataProcessor.getQuickWins();
    if (quickWins.length > 0) {
      recommendations.push({
        type: 'quick-win',
        priority: 'high',
        title: 'Immediate Implementation Opportunities',
        description: `${quickWins.length} high-impact, low-complexity tools ready for deployment`,
        tools: quickWins.slice(0, 5).map(t => t.tool_name),
        estimatedImpact: 'High productivity gains with minimal disruption',
        estimatedSavings: 0,
        implementationTime: '< 30 days'
      });
    }

    // Consolidation recommendation
    if (this.dataProcessor.redundancies.length > 0) {
      const topRedundancy = this.dataProcessor.redundancies[0];
      recommendations.push({
        type: 'consolidation',
        priority: 'high',
        title: 'Tool Consolidation Opportunity',
        description: `Consolidate ${topRedundancy.toolCount} ${topRedundancy.category} tools`,
        potentialSavings: topRedundancy.potentialSavings * 12,
        effort: 'medium',
        tools: topRedundancy.tools.map(t => t.name),
        implementationTime: '2-3 months'
      });
    }

    // Budget optimization
    const overpriced = report.topCosts.filter(tool => 
      tool.roi < 150 && tool.monthlyPrice > 1000
    );
    if (overpriced.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Budget Reallocation Opportunity',
        description: `${overpriced.length} expensive tools with low ROI`,
        tools: overpriced.map(t => t.toolName),
        potentialSavings: overpriced.reduce((sum, tool) => sum + (tool.monthlyPrice * 12), 0),
        implementationTime: '1-2 months'
      });
    }

    // High-value additions
    const highROI = report.topROI.filter(tool => 
      tool.roi > 300 && tool.monthlyPrice < 500
    );
    if (highROI.length > 0) {
      recommendations.push({
        type: 'expansion',
        priority: 'medium',
        title: 'High-Value Addition Opportunities',
        description: `${highROI.length} tools with exceptional ROI potential`,
        tools: highROI.map(t => t.toolName),
        estimatedROI: Math.round(highROI.reduce((sum, tool) => sum + tool.roi, 0) / highROI.length),
        implementationTime: '1-2 months'
      });
    }

    return recommendations;
  }

  // Cache management
  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      hitRate: this.cacheHitRate || 0,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CostCalculator;
}