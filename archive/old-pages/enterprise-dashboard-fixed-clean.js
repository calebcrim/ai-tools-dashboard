// Enterprise Dashboard - Fixed Version with Debugging

// Data Processor Class with Fixed Calculations
class EnterpriseDataProcessor {
  constructor(toolsData) {
    this.rawData = toolsData;
    this.processedData = new Map();
    this.indices = {
      byImpact: new Map(),
      byComplexity: new Map(),
      byCategory: new Map(),
      byTimeToValue: new Map(),
      byQuadrant: new Map(),
      byDepartment: new Map()
    };
    this.metrics = {};
    this.cache = new Map();
    this.init();
  }

  init() {
    console.time('DataProcessing');
    console.log('Starting data processing for', this.rawData.length, 'tools');
    this.processTools();
    this.buildIndices();
    this.calculateMetrics();
    this.cacheResults();
    console.timeEnd('DataProcessing');
    
    // Debug output
    console.log('Data processing complete:', {
      totalTools: this.processedData.size,
      quickWins: this.metrics.quickWins,
      averageROI: this.metrics.averageROI,
      highImpactTools: this.metrics.highImpact
    });
  }

  processTools() {
    this.rawData.forEach(tool => {
      // Parse business impact score - check if it exists as a field
      let businessImpactScore = tool.business_impact_score;
      if (typeof businessImpactScore !== 'number') {
        businessImpactScore = this.parseBusinessImpact(tool);
      }
      
      // Parse complexity score - check if it exists as a field
      let complexityScore = tool.complexity_score;
      if (typeof complexityScore !== 'number') {
        complexityScore = this.parseComplexity(tool);
      }
      
      const processed = {
        ...tool,
        business_impact_score: businessImpactScore,
        complexity_score: complexityScore,
        impactCategory: this.categorizeImpact(businessImpactScore),
        complexityLevel: this.categorizeComplexity(complexityScore),
        quadrant: this.assignQuadrant({ business_impact_score: businessImpactScore, complexity_score: complexityScore }),
        estimatedROI: this.calculateROI(tool),
        riskScore: this.calculateRiskScore(tool),
        completenessScore: this.calculateCompleteness(tool),
        timeToValueDays: this.parseTimeToValue(tool.time_to_value),
        monthlyPrice: this.extractMonthlyPrice(tool.pricing_model),
        enterpriseFeatures: this.parseEnterpriseFeatures(tool),
        departments: this.identifyDepartments(tool)
      };
      
      this.processedData.set(tool.tool_name, processed);
    });
    
    // Debug: Check a sample of processed tools
    const sampleTools = Array.from(this.processedData.values()).slice(0, 5);
    console.log('Sample processed tools:', sampleTools);
  }

  parseBusinessImpact(tool) {
    // Default to a reasonable score if no data
    let score = 50;
    
    // Try to extract from case studies
    if (tool.case_studies) {
      const caseStudyScore = this.extractImpactFromCaseStudies(tool.case_studies);
      score = Math.max(score, caseStudyScore);
    }
    
    // Boost score based on category
    const categoryBoost = this.getCategoryImpactBoost(tool.category);
    score = Math.min(100, score + categoryBoost);
    
    // Boost based on features
    if (tool.feature_breakdown && tool.feature_breakdown.length > 100) {
      score = Math.min(100, score + 5);
    }
    
    return score;
  }

  parseComplexity(tool) {
    // Default complexity - start at 3 (medium)
    let complexity = 3;
    
    // Check learning curve
    if (tool.learning_curve) {
      const learningCurve = tool.learning_curve.toLowerCase();
      if (learningCurve.includes('low') || learningCurve.includes('easy') || learningCurve.includes('simple') || learningCurve.includes('intuitive')) {
        complexity = 2;
      } else if (learningCurve.includes('medium') || learningCurve.includes('moderate')) {
        complexity = 3;
      } else if (learningCurve.includes('high') || learningCurve.includes('steep') || learningCurve.includes('complex') || learningCurve.includes('technical')) {
        complexity = 4;
      }
    }
    
    // Check integration complexity
    if (tool.integration_potential) {
      const integration = tool.integration_potential.toLowerCase();
      if (integration.includes('native') || integration.includes('seamless') || integration.includes('pre-built') || integration.includes('no-code')) {
        complexity = Math.min(complexity, 2);
      } else if (integration.includes('api') || integration.includes('webhook')) {
        // API/webhook is standard, don't change
      } else if (integration.includes('complex') || integration.includes('custom') || integration.includes('difficult') || integration.includes('limited')) {
        complexity = Math.max(complexity, 4);
      }
    }
    
    // Category-based adjustments - some categories are inherently more complex
    if (tool.category) {
      const cat = tool.category.toLowerCase();
      if (cat.includes('enterprise') || cat.includes('platform') || cat.includes('infrastructure')) {
        complexity = Math.max(complexity, 3);
      }
      if (cat.includes('security') || cat.includes('compliance')) {
        complexity = Math.max(complexity, 3);
      }
    }
    
    // Very few tools should be complexity 1
    // Ensure complexity is within bounds
    return Math.max(1, Math.min(5, complexity));
  }

  getCategoryImpactBoost(category) {
    if (!category) return 0;
    
    const cat = category.toLowerCase();
    
    // High impact categories
    if (cat.includes('ai') || cat.includes('assistant') || cat.includes('analytics') || cat.includes('automation')) {
      return 10;
    }
    if (cat.includes('sales') || cat.includes('marketing') || cat.includes('customer')) {
      return 8;
    }
    if (cat.includes('productivity') || cat.includes('collaboration')) {
      return 5;
    }
    
    return 0;
  }

  extractImpactFromCaseStudies(caseStudies) {
    if (!caseStudies) return 50;
    
    const text = caseStudies.toLowerCase();
    
    // Look for percentage improvements
    const percentageMatches = text.match(/(\d+)%/g);
    if (percentageMatches) {
      const percentages = percentageMatches.map(p => parseInt(p));
      const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
      
      if (avgPercentage >= 50) return 90;
      if (avgPercentage >= 30) return 75;
      if (avgPercentage >= 20) return 65;
    }
    
    // Look for impact keywords
    if (text.includes('transform') || text.includes('revolution') || text.includes('game-chang')) {
      return 85;
    }
    if (text.includes('significant') || text.includes('major') || text.includes('substantial')) {
      return 75;
    }
    if (text.includes('improve') || text.includes('enhance') || text.includes('increase')) {
      return 65;
    }
    
    return 50;
  }

  categorizeImpact(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  categorizeComplexity(score) {
    if (score <= 2) return 'low';
    if (score === 3) return 'medium';
    return 'high';
  }

  assignQuadrant(tool) {
    const impact = tool.business_impact_score || 50;
    const complexity = tool.complexity_score || 3;
    
    // More selective criteria for quick wins
    if (impact >= 85 && complexity <= 2) return 'quick-wins';  // Raised from 80 to 85
    if (impact >= 80 && complexity >= 4) return 'strategic';
    if (impact < 50 && complexity >= 4) return 'reconsider';
    return 'efficiency';
  }

  calculateROI(tool) {
    let baseROI = 0;
    const impact = tool.business_impact_score || 50;
    const complexity = tool.complexity_score || 3;
    
    // Base ROI from impact
    baseROI = impact * 2;
    
    // Adjust for complexity
    const complexityMultiplier = 1 / (complexity * 0.5);
    baseROI = Math.round(baseROI * complexityMultiplier);
    
    // Extract specific ROI from case studies if available
    if (tool.case_studies) {
      const roiMatch = tool.case_studies.match(/(\d+)%\s*ROI/i);
      if (roiMatch) {
        const specificROI = parseInt(roiMatch[1]);
        baseROI = Math.max(baseROI, specificROI);
      }
    }
    
    // Cap ROI at realistic levels
    baseROI = Math.min(500, Math.max(-50, baseROI));
    
    // Calculate payback period
    const monthlyPrice = this.extractMonthlyPrice(tool.pricing_model) || 100;
    const monthlyBenefit = monthlyPrice * (baseROI / 100);
    const paybackMonths = monthlyBenefit > 0 ? Math.round(monthlyPrice / monthlyBenefit) : 999;
    
    return {
      percentage: baseROI,
      paybackMonths: Math.min(paybackMonths, 999),
      annualBenefit: Math.round(monthlyBenefit * 12)
    };
  }

  extractMonthlyPrice(pricingModel) {
    if (!pricingModel) return 0;
    
    const text = pricingModel.toLowerCase();
    
    // Look for monthly prices
    const monthlyMatch = text.match(/\$(\d+)\s*(?:\/|per)\s*(?:mo|month)/i);
    if (monthlyMatch) {
      return parseInt(monthlyMatch[1]);
    }
    
    // Look for annual prices and convert
    const annualMatch = text.match(/\$(\d+)\s*(?:\/|per)\s*(?:yr|year)/i);
    if (annualMatch) {
      return Math.round(parseInt(annualMatch[1]) / 12);
    }
    
    // Look for user-based pricing
    const userMatch = text.match(/\$(\d+)\s*(?:\/|per)\s*(?:user|seat)/i);
    if (userMatch) {
      return parseInt(userMatch[1]) * 5; // Assume 5 users
    }
    
    // Free
    if (text.includes('free')) {
      return 0;
    }
    
    // Enterprise
    if (text.includes('enterprise') || text.includes('contact')) {
      return 500; // Default enterprise estimate
    }
    
    return 100; // Default
  }

  calculateRiskScore(tool) {
    let risk = 0;
    
    // Complexity adds risk
    risk += (tool.complexity_score || 3) * 10;
    
    // Lack of data adds risk
    if (!tool.case_studies) risk += 10;
    if (!tool.integration_potential) risk += 10;
    if (!tool.pricing_model) risk += 10;
    
    // Regulatory concerns
    if (tool.geo_regulatory_limitations && tool.geo_regulatory_limitations.length > 50) {
      risk += 15;
    }
    
    return Math.min(100, risk);
  }

  calculateCompleteness(tool) {
    const fields = [
      'brief_purpose_summary',
      'feature_breakdown',
      'pricing_model',
      'pros_cons_limitations',
      'integration_potential',
      'learning_curve',
      'geo_regulatory_limitations',
      'case_studies',
      'use_cases_in_pr'
    ];
    
    const completedFields = fields.filter(field => 
      tool[field] && tool[field].toString().length > 10
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }

  parseTimeToValue(timeToValue) {
    if (!timeToValue) return 30;
    
    const text = timeToValue.toLowerCase();
    
    if (text.includes('immediate') || text.includes('instant')) return 1;
    if (text.includes('day')) {
      const match = text.match(/(\d+)\s*day/);
      return match ? parseInt(match[1]) : 7;
    }
    if (text.includes('week')) {
      const match = text.match(/(\d+)\s*week/);
      const weeks = match ? parseInt(match[1]) : 1;
      return weeks * 7;
    }
    if (text.includes('month')) {
      const match = text.match(/(\d+)\s*month/);
      const months = match ? parseInt(match[1]) : 1;
      return months * 30;
    }
    
    return 30; // Default to 1 month
  }

  parseEnterpriseFeatures(tool) {
    const features = [];
    
    // Check various fields for enterprise features
    const fieldsToCheck = [
      tool.feature_breakdown,
      tool.integration_potential,
      tool.pros_cons_limitations
    ].filter(Boolean).join(' ');
    
    const text = fieldsToCheck.toLowerCase();
    
    if (text.includes('sso') || text.includes('single sign-on')) features.push('SSO');
    if (text.includes('api')) features.push('API Access');
    if (text.includes('sla')) features.push('SLA');
    if (text.includes('saml')) features.push('SAML');
    if (text.includes('ldap')) features.push('LDAP');
    if (text.includes('audit')) features.push('Audit Logs');
    if (text.includes('role') && text.includes('based')) features.push('RBAC');
    if (text.includes('custom') || text.includes('white-label')) features.push('Customization');
    if (text.includes('dedicated')) features.push('Dedicated Support');
    if (text.includes('on-premise') || text.includes('self-host')) features.push('On-Premise');
    
    return features;
  }

  identifyDepartments(tool) {
    const departments = [];
    const text = [
      tool.category,
      tool.brief_purpose_summary,
      tool.use_cases_in_pr
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (text.includes('sales') || text.includes('crm')) departments.push('Sales');
    if (text.includes('marketing') || text.includes('campaign')) departments.push('Marketing');
    if (text.includes('hr') || text.includes('human resource') || text.includes('recruit')) departments.push('HR');
    if (text.includes('finance') || text.includes('accounting')) departments.push('Finance');
    if (text.includes('it') || text.includes('security') || text.includes('infrastructure')) departments.push('IT');
    if (text.includes('customer') || text.includes('support')) departments.push('Customer Success');
    if (text.includes('product') || text.includes('development')) departments.push('Product');
    if (text.includes('operations') || text.includes('ops')) departments.push('Operations');
    
    return departments.length > 0 ? departments : ['General'];
  }

  buildIndices() {
    this.processedData.forEach((tool, name) => {
      // By impact
      const impactCategory = this.categorizeImpact(tool.business_impact_score);
      if (!this.indices.byImpact.has(impactCategory)) {
        this.indices.byImpact.set(impactCategory, []);
      }
      this.indices.byImpact.get(impactCategory).push(name);
      
      // By complexity
      const complexityLevel = tool.complexity_score;
      if (!this.indices.byComplexity.has(complexityLevel)) {
        this.indices.byComplexity.set(complexityLevel, []);
      }
      this.indices.byComplexity.get(complexityLevel).push(name);
      
      // By category
      if (tool.category) {
        if (!this.indices.byCategory.has(tool.category)) {
          this.indices.byCategory.set(tool.category, []);
        }
        this.indices.byCategory.get(tool.category).push(name);
      }
      
      // By quadrant
      if (!this.indices.byQuadrant.has(tool.quadrant)) {
        this.indices.byQuadrant.set(tool.quadrant, []);
      }
      this.indices.byQuadrant.get(tool.quadrant).push(name);
      
      // By department
      tool.departments.forEach(dept => {
        if (!this.indices.byDepartment.has(dept)) {
          this.indices.byDepartment.set(dept, []);
        }
        this.indices.byDepartment.get(dept).push(name);
      });
    });
    
    // Debug output
    console.log('Indices built:', {
      byQuadrant: Object.fromEntries(this.indices.byQuadrant.entries()),
      quickWinsCount: this.indices.byQuadrant.get('quick-wins')?.length || 0
    });
  }

  calculateMetrics() {
    const tools = Array.from(this.processedData.values());
    
    this.metrics = {
      totalTools: tools.length,
      completeData: tools.filter(t => t.completenessScore > 80).length,
      highImpact: tools.filter(t => t.business_impact_score >= 80).length,
      quickWins: this.indices.byQuadrant.get('quick-wins')?.length || 0,
      strategicPlatforms: this.indices.byQuadrant.get('strategic')?.length || 0,
      potentialSavings: this.calculatePotentialSavings(tools),
      topOpportunities: this.identifyTopOpportunities(tools),
      consolidationOpportunities: this.findConsolidationOpportunities(tools),
      averageROI: Math.round(tools.reduce((sum, t) => sum + (t.estimatedROI?.percentage || 0), 0) / tools.length),
      byCategory: this.getCategoryMetrics(),
      byDepartment: this.getDepartmentMetrics(),
      enterpriseReady: tools.filter(t => t.enterpriseFeatures.length >= 3).length
    };
    
    // Debug output
    console.log('Metrics calculated:', this.metrics);
  }

  calculatePotentialSavings(tools) {
    // Find overlapping tools by category
    const categoryGroups = {};
    tools.forEach(tool => {
      if (tool.category && tool.monthlyPrice > 0) {
        if (!categoryGroups[tool.category]) {
          categoryGroups[tool.category] = [];
        }
        categoryGroups[tool.category].push(tool);
      }
    });
    
    let savings = 0;
    Object.values(categoryGroups).forEach(group => {
      if (group.length > 2) {
        // Can potentially consolidate
        const totalSpend = group.reduce((sum, t) => sum + t.monthlyPrice, 0);
        const highestPrice = Math.max(...group.map(t => t.monthlyPrice));
        savings += (totalSpend - highestPrice) * 12; // Annual savings
      }
    });
    
    return Math.round(savings);
  }

  identifyTopOpportunities(tools) {
    const immediate = tools
      .filter(t => t.quadrant === 'quick-wins' && t.timeToValueDays <= 7)
      .sort((a, b) => b.business_impact_score - a.business_impact_score)
      .slice(0, 5);
    
    const strategic = tools
      .filter(t => t.quadrant === 'strategic')
      .sort((a, b) => b.estimatedROI.percentage - a.estimatedROI.percentage)
      .slice(0, 5);
    
    const efficiency = tools
      .filter(t => t.quadrant === 'efficiency' && t.estimatedROI.percentage > 100)
      .sort((a, b) => b.estimatedROI.percentage - a.estimatedROI.percentage)
      .slice(0, 5);
    
    return { immediate, strategic, efficiency };
  }

  findConsolidationOpportunities(tools) {
    const opportunities = [];
    const categoryTools = {};
    
    // Group by category
    tools.forEach(tool => {
      if (tool.category && tool.monthlyPrice > 0) {
        if (!categoryTools[tool.category]) {
          categoryTools[tool.category] = [];
        }
        categoryTools[tool.category].push(tool);
      }
    });
    
    // Find categories with multiple tools
    Object.entries(categoryTools).forEach(([category, categoryGroup]) => {
      if (categoryGroup.length >= 3) {
        const totalMonthly = categoryGroup.reduce((sum, t) => sum + t.monthlyPrice, 0);
        const bestTool = categoryGroup.sort((a, b) => 
          b.business_impact_score - a.business_impact_score
        )[0];
        
        opportunities.push({
          category,
          tools: categoryGroup.map(t => t.tool_name),
          currentMonthly: totalMonthly,
          recommended: bestTool.tool_name,
          monthlySavings: totalMonthly - bestTool.monthlyPrice,
          annualSavings: (totalMonthly - bestTool.monthlyPrice) * 12
        });
      }
    });
    
    return opportunities.sort((a, b) => b.annualSavings - a.annualSavings).slice(0, 5);
  }

  getCategoryMetrics() {
    const metrics = {};
    
    this.indices.byCategory.forEach((tools, category) => {
      const categoryTools = tools.map(name => this.processedData.get(name));
      metrics[category] = {
        count: tools.length,
        avgImpact: Math.round(
          categoryTools.reduce((sum, t) => sum + (t?.business_impact_score || 0), 0) / tools.length
        ),
        avgComplexity: Math.round(
          categoryTools.reduce((sum, t) => sum + (t?.complexity_score || 0), 0) / tools.length * 10
        ) / 10,
        totalMonthly: categoryTools.reduce((sum, t) => sum + (t?.monthlyPrice || 0), 0)
      };
    });
    
    return metrics;
  }

  getDepartmentMetrics() {
    const metrics = {};
    
    this.indices.byDepartment.forEach((tools, dept) => {
      const deptTools = tools.map(name => this.processedData.get(name));
      metrics[dept] = {
        count: tools.length,
        avgImpact: Math.round(
          deptTools.reduce((sum, t) => sum + (t?.business_impact_score || 0), 0) / tools.length
        )
      };
    });
    
    return metrics;
  }

  cacheResults() {
    // Cache frequently accessed data
    this.cache.set('allTools', Array.from(this.processedData.values()));
    this.cache.set('quickWins', 
      Array.from(this.processedData.values()).filter(t => t.quadrant === 'quick-wins')
    );
    this.cache.set('highImpact',
      Array.from(this.processedData.values()).filter(t => t.business_impact_score >= 80)
    );
  }

  // Query methods
  getTools(filters = {}) {
    let results = Array.from(this.processedData.values());
    
    if (filters.impact) {
      results = results.filter(tool => 
        (tool.business_impact_score || 0) >= filters.impact.min &&
        (tool.business_impact_score || 0) <= filters.impact.max
      );
    }
    
    if (filters.complexity && filters.complexity.length > 0) {
      results = results.filter(tool =>
        filters.complexity.includes(tool.complexity_score || 3)
      );
    }
    
    if (filters.timeToValue && filters.timeToValue.length > 0) {
      results = results.filter(tool => {
        const category = this.getTimeToValueCategory(tool.timeToValueDays);
        return filters.timeToValue.includes(category);
      });
    }
    
    if (filters.budget && filters.budget.length > 0) {
      results = results.filter(tool => {
        const price = tool.monthlyPrice || 0;
        return filters.budget.some(range => {
          if (range === '0-100') return price <= 100;
          if (range === '100-500') return price > 100 && price <= 500;
          if (range === '500-2000') return price > 500 && price <= 2000;
          if (range === 'enterprise') return price > 2000 || !price;
          return false;
        });
      });
    }
    
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(tool =>
        tool.category && filters.categories.includes(tool.category)
      );
    }
    
    if (filters.departments && filters.departments.length > 0) {
      results = results.filter(tool =>
        tool.departments.some(dept => filters.departments.includes(dept))
      );
    }
    
    if (filters.compliance && filters.compliance.length > 0) {
      results = results.filter(tool =>
        filters.compliance.some(req => tool.enterpriseFeatures.includes(req))
      );
    }
    
    if (filters.quadrant) {
      results = results.filter(tool => tool.quadrant === filters.quadrant);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(tool =>
        tool.tool_name.toLowerCase().includes(searchLower) ||
        (tool.category && tool.category.toLowerCase().includes(searchLower)) ||
        (tool.brief_purpose_summary && tool.brief_purpose_summary.toLowerCase().includes(searchLower))
      );
    }
    
    return this.sortResults(results, filters.sortBy || 'impact');
  }

  getTimeToValueCategory(days) {
    if (days <= 1) return 'immediate';
    if (days <= 7) return '1-week';
    if (days <= 30) return '1-month';
    return '3-months';
  }

  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'impact':
        return results.sort((a, b) => (b.business_impact_score || 0) - (a.business_impact_score || 0));
      case 'complexity':
        return results.sort((a, b) => (a.complexity_score || 3) - (b.complexity_score || 3));
      case 'roi':
        return results.sort((a, b) => (b.estimatedROI?.percentage || 0) - (a.estimatedROI?.percentage || 0));
      case 'price':
        return results.sort((a, b) => (a.monthlyPrice || 0) - (b.monthlyPrice || 0));
      case 'name':
        return results.sort((a, b) => a.tool_name.localeCompare(b.tool_name));
      default:
        return results;
    }
  }
}

// Executive Dashboard Class
class ExecutiveDashboard {
  constructor(dataProcessor) {
    this.processor = dataProcessor;
    this.metrics = dataProcessor.metrics;
  }

  render() {
    return `
      <div class="executive-dashboard">
        ${this.renderHeader()}
        ${this.renderKeyMetrics()}
        ${this.renderInsights()}
        ${this.renderQuadrantMatrix()}
        ${this.renderActionButtons()}
      </div>
    `;
  }

  renderHeader() {
    const dataCompleteness = Math.round((this.metrics.completeData / this.metrics.totalTools) * 100);
    
    return `
      <div class="dashboard-header">
        <h1>AI Tools Investment Strategy</h1>
        <p class="last-updated">Analysis of ${this.metrics.totalTools} tools • ${new Date().toLocaleDateString()}</p>
        <div class="data-quality-indicator">
          <span class="quality-badge">${dataCompleteness}% Complete Data (${this.metrics.completeData} of ${this.metrics.totalTools})</span>
          <span class="confidence-indicator">Enterprise Ready: ${this.metrics.enterpriseReady} tools</span>
        </div>
      </div>
    `;
  }

  renderKeyMetrics() {
    const savingsFormatted = this.formatCurrency(this.metrics.potentialSavings);
    const avgROI = this.metrics.averageROI || 0;
    
    return `
      <div class="key-metrics">
        <div class="metric-card highlight pulse">
          <div class="metric-icon"><i class="fas fa-rocket"></i></div>
          <div class="metric-value">${this.metrics.quickWins}</div>
          <div class="metric-label">Quick Wins Available</div>
          <div class="metric-detail">High impact (80+), Low complexity (1-2)</div>
          <div class="metric-action">
            <button class="small-btn" onclick="dashboard.filterByQuadrant('quick-wins')">View All</button>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon"><i class="fas fa-chess-king"></i></div>
          <div class="metric-value">${this.metrics.strategicPlatforms}</div>
          <div class="metric-label">Strategic Platforms</div>
          <div class="metric-detail">High impact, Higher complexity</div>
          <div class="metric-action">
            <button class="small-btn" onclick="dashboard.filterByQuadrant('strategic')">Explore</button>
          </div>
        </div>
        
        <div class="metric-card financial">
          <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="metric-value">$${savingsFormatted}</div>
          <div class="metric-label">Annual Savings Potential</div>
          <div class="metric-detail">Through tool consolidation</div>
          <div class="metric-action">
            <button class="small-btn" onclick="dashboard.showConsolidationDetails()">Details</button>
          </div>
        </div>
        
        <div class="metric-card roi">
          <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
          <div class="metric-value">${avgROI}%</div>
          <div class="metric-label">Average ROI</div>
          <div class="metric-detail">Across evaluated tools</div>
          <div class="metric-action">
            <button class="small-btn" onclick="dashboard.showROIAnalysis()">Calculate</button>
          </div>
        </div>
      </div>
    `;
  }

  renderInsights() {
    const topOpportunities = this.metrics.topOpportunities;
    const consolidation = this.metrics.consolidationOpportunities.slice(0, 3);
    
    // Get actual phase tool counts
    const phaseOneTools = this.getPhaseOneTools();
    const phaseTwoTools = this.getPhaseTwoTools();
    const phaseThreeTools = this.getPhaseThreeTools();
    
    return `
      <div class="insights-section">
        <h2>Executive Insights</h2>
        
        <div class="insights-grid">
          <div class="insight-card immediate">
            <div class="insight-header">
              <h3><i class="fas fa-bolt"></i> Immediate Opportunities</h3>
              <span class="insight-badge">${topOpportunities.immediate.length} tools</span>
            </div>
            <div class="insight-content">
              <p>Deploy these tools within 7 days for instant impact:</p>
              <ul class="opportunity-list">
                ${topOpportunities.immediate.slice(0, 3).map(tool => `
                  <li class="opportunity-item">
                    <div class="tool-info">
                      <strong>${tool.tool_name}</strong>
                      <span class="impact-score">${tool.business_impact_score || 0} impact</span>
                    </div>
                    <div class="tool-metrics">
                      <span class="roi-badge">${tool.estimatedROI?.percentage || 0}% ROI</span>
                      <span class="payback">${tool.estimatedROI?.paybackMonths || 'N/A'} mo payback</span>
                    </div>
                  </li>
                `).join('')}
              </ul>
              <button class="insight-action" onclick="dashboard.showImmediateOpportunities()">
                View All ${topOpportunities.immediate.length} Opportunities
              </button>
            </div>
          </div>
          
          <div class="insight-card cost-optimization">
            <div class="insight-header">
              <h3><i class="fas fa-piggy-bank"></i> Cost Optimization</h3>
              <span class="insight-badge">${consolidation.length} opportunities</span>
            </div>
            <div class="insight-content">
              <p>Consolidate overlapping tools to reduce costs:</p>
              <ul class="consolidation-list">
                ${consolidation.length > 0 ? consolidation.map(group => `
                  <li class="consolidation-item">
                    <div class="consolidation-info">
                      <strong>Replace:</strong> ${group.tools.slice(0, 2).join(', ')}${group.tools.length > 2 ? '...' : ''}
                    </div>
                    <div class="consolidation-recommendation">
                      <strong>With:</strong> ${group.recommended}
                    </div>
                    <div class="consolidation-savings">
                      <span class="savings-amount">Save $${this.formatNumber(group.monthlySavings)}/mo</span>
                    </div>
                  </li>
                `).join('') : '<li>No significant consolidation opportunities found</li>'}
              </ul>
              <button class="insight-action" onclick="dashboard.showConsolidationAnalysis()">
                Full Consolidation Analysis
              </button>
            </div>
          </div>
          
          <div class="insight-card strategic">
            <div class="insight-header">
              <h3><i class="fas fa-chess"></i> Strategic Roadmap</h3>
              <span class="insight-badge">3-phase plan</span>
            </div>
            <div class="insight-content">
              <div class="strategy-timeline">
                <div class="phase" onclick="dashboard.showPhaseDetails(1)">
                  <div class="phase-header">
                    <h4>Phase 1</h4>
                    <span class="phase-duration">Week 1-2</span>
                  </div>
                  <p>Deploy ${phaseOneTools.length} immediate impact tools</p>
                  <div class="phase-tools-preview">
                    ${phaseOneTools.slice(0, 2).map(t => t.tool_name).join(', ')}${phaseOneTools.length > 2 ? '...' : ''}
                  </div>
                  <div class="phase-roi">Est. ROI: 150-200%</div>
                </div>
                <div class="phase" onclick="dashboard.showPhaseDetails(2)">
                  <div class="phase-header">
                    <h4>Phase 2</h4>
                    <span class="phase-duration">Week 3-4</span>
                  </div>
                  <p>Integrate ${phaseTwoTools.length} complementary solutions</p>
                  <div class="phase-tools-preview">
                    ${phaseTwoTools.slice(0, 2).map(t => t.tool_name).join(', ')}${phaseTwoTools.length > 2 ? '...' : ''}
                  </div>
                  <div class="phase-roi">Est. ROI: 200-300%</div>
                </div>
                <div class="phase" onclick="dashboard.showPhaseDetails(3)">
                  <div class="phase-header">
                    <h4>Phase 3</h4>
                    <span class="phase-duration">Month 2+</span>
                  </div>
                  <p>Implement ${phaseThreeTools.length} strategic platforms</p>
                  <div class="phase-tools-preview">
                    ${phaseThreeTools.slice(0, 2).map(t => t.tool_name).join(', ')}${phaseThreeTools.length > 2 ? '...' : ''}
                  </div>
                  <div class="phase-roi">Est. ROI: 300-400%</div>
                </div>
              </div>
              <button class="insight-action" onclick="dashboard.buildCustomRoadmap()">
                Customize Roadmap
              </button>
            </div>
          </div>
          
          <div class="insight-card department">
            <div class="insight-header">
              <h3><i class="fas fa-building"></i> Department Impact</h3>
              <span class="insight-badge">${Object.keys(this.metrics.byDepartment).length} departments</span>
            </div>
            <div class="insight-content">
              <p>AI tool opportunities by department:</p>
              <div class="department-grid">
                ${Object.entries(this.metrics.byDepartment)
                  .sort((a, b) => b[1].avgImpact - a[1].avgImpact)
                  .slice(0, 4)
                  .map(([dept, data]) => `
                    <div class="department-item" onclick="dashboard.filterByDepartment('${dept}')">
                      <div class="dept-name">${dept}</div>
                      <div class="dept-stats">
                        <span class="tool-count">${data.count} tools</span>
                        <span class="avg-impact">${data.avgImpact} avg impact</span>
                      </div>
                    </div>
                  `).join('')}
              </div>
              <button class="insight-action" onclick="dashboard.showDepartmentAnalysis()">
                Full Department Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuadrantMatrix() {
    const quadrants = {
      'quick-wins': this.processor.indices.byQuadrant.get('quick-wins') || [],
      'strategic': this.processor.indices.byQuadrant.get('strategic') || [],
      'efficiency': this.processor.indices.byQuadrant.get('efficiency') || [],
      'reconsider': this.processor.indices.byQuadrant.get('reconsider') || []
    };
    
    return `
      <div class="quadrant-matrix-section">
        <h2>Strategic Positioning Matrix</h2>
        <div class="quadrant-matrix">
          <div class="matrix-labels">
            <div class="y-axis-label">Business Impact →</div>
            <div class="x-axis-label">Implementation Complexity →</div>
          </div>
          
          <div class="quadrants-grid">
            <div class="quadrant quick-wins" onclick="dashboard.filterByQuadrant('quick-wins')">
              <h3>Quick Wins</h3>
              <div class="quadrant-count">${quadrants['quick-wins'].length}</div>
              <p>High Impact, Low Complexity</p>
              <div class="quadrant-examples">
                ${quadrants['quick-wins'].slice(0, 3).map(name => `
                  <span class="tool-pill">${name}</span>
                `).join('')}
                ${quadrants['quick-wins'].length > 3 ? '<span class="more">...</span>' : ''}
              </div>
            </div>
            
            <div class="quadrant strategic" onclick="dashboard.filterByQuadrant('strategic')">
              <h3>Strategic Investments</h3>
              <div class="quadrant-count">${quadrants.strategic.length}</div>
              <p>High Impact, High Complexity</p>
              <div class="quadrant-examples">
                ${quadrants.strategic.slice(0, 3).map(name => `
                  <span class="tool-pill">${name}</span>
                `).join('')}
                ${quadrants.strategic.length > 3 ? '<span class="more">...</span>' : ''}
              </div>
            </div>
            
            <div class="quadrant efficiency" onclick="dashboard.filterByQuadrant('efficiency')">
              <h3>Efficiency Boosters</h3>
              <div class="quadrant-count">${quadrants.efficiency.length}</div>
              <p>Medium Impact, Low Complexity</p>
              <div class="quadrant-examples">
                ${quadrants.efficiency.slice(0, 3).map(name => `
                  <span class="tool-pill">${name}</span>
                `).join('')}
                ${quadrants.efficiency.length > 3 ? '<span class="more">...</span>' : ''}
              </div>
            </div>
            
            <div class="quadrant reconsider" onclick="dashboard.filterByQuadrant('reconsider')">
              <h3>Reconsider</h3>
              <div class="quadrant-count">${quadrants.reconsider.length}</div>
              <p>Low Impact, High Complexity</p>
              <div class="quadrant-examples">
                ${quadrants.reconsider.slice(0, 3).map(name => `
                  <span class="tool-pill">${name}</span>
                `).join('')}
                ${quadrants.reconsider.length > 3 ? '<span class="more">...</span>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderActionButtons() {
    return `
      <div class="action-buttons">
        <button class="action-btn primary" onclick="dashboard.generateExecutiveReport()">
          <i class="fas fa-file-pdf"></i> Generate Executive Report
        </button>
        <button class="action-btn secondary" onclick="dashboard.scheduleDemo()">
          <i class="fas fa-calendar"></i> Schedule Implementation Review
        </button>
        <button class="action-btn secondary" onclick="dashboard.exportData()">
          <i class="fas fa-download"></i> Export Analysis
        </button>
      </div>
    `;
  }

  // Helper methods
  formatCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'k';
    }
    return amount.toString();
  }

  formatNumber(num) {
    return num.toLocaleString();
  }

  getPhaseOneTools() {
    return Array.from(this.processor.processedData.values())
      .filter(t => t.quadrant === 'quick-wins' && t.timeToValueDays <= 7)
      .sort((a, b) => b.business_impact_score - a.business_impact_score)
      .slice(0, 10);
  }

  getPhaseTwoTools() {
    return Array.from(this.processor.processedData.values())
      .filter(t => t.quadrant === 'efficiency' && t.estimatedROI.percentage > 100)
      .sort((a, b) => b.estimatedROI.percentage - a.estimatedROI.percentage)
      .slice(0, 10);
  }

  getPhaseThreeTools() {
    return Array.from(this.processor.processedData.values())
      .filter(t => t.quadrant === 'strategic')
      .sort((a, b) => b.business_impact_score - a.business_impact_score)
      .slice(0, 5);
  }

  // Action methods (to be implemented)
  filterByQuadrant(quadrant) {
    filters.activeFilters.quadrant = quadrant;
    filters.applyFilters();
  }

  showConsolidationDetails() {
    alert('Consolidation analysis feature coming soon!');
  }

  showROIAnalysis() {
    alert('ROI calculator feature coming soon!');
  }

  showImmediateOpportunities() {
    this.filterByQuadrant('quick-wins');
  }

  showConsolidationAnalysis() {
    alert('Full consolidation analysis coming soon!');
  }

  buildCustomRoadmap() {
    alert('Custom roadmap builder coming soon!');
  }

  showPhaseDetails(phase) {
    alert(`Phase ${phase} details coming soon!`);
  }

  filterByDepartment(dept) {
    filters.activeFilters.departments = [dept];
    filters.applyFilters();
  }

  showDepartmentAnalysis() {
    alert('Department analysis coming soon!');
  }

  generateExecutiveReport() {
    alert('PDF report generation coming soon!');
  }

  scheduleDemo() {
    alert('Demo scheduling coming soon!');
  }

  exportData() {
    alert('Data export coming soon!');
  }
}

// Simple Filters Class
class SimpleFilters {
  constructor(dataProcessor) {
    this.processor = dataProcessor;
    this.activeFilters = {
      impact: { min: 0, max: 100 },
      complexity: [],
      timeToValue: [],
      budget: [],
      categories: [],
      search: ''
    };
  }

  render() {
    const categories = Object.keys(this.processor.metrics.byCategory);
    
    return `
      <div class="filter-panel">
        <h3>Filters</h3>
        
        <div class="filter-section">
          <label>Search</label>
          <input type="text" id="filter-search" placeholder="Search tools..." 
                 onkeyup="filters.updateSearch(this.value)">
        </div>
        
        <div class="filter-section">
          <label>Business Impact</label>
          <div class="range-slider">
            <input type="range" min="0" max="100" value="0" id="impact-min"
                   oninput="filters.updateImpactRange()">
            <input type="range" min="0" max="100" value="100" id="impact-max"
                   oninput="filters.updateImpactRange()">
            <div class="range-values">
              <span id="impact-min-val">0</span> - <span id="impact-max-val">100</span>
            </div>
          </div>
        </div>
        
        <div class="filter-section">
          <label>Complexity</label>
          <div class="checkbox-group">
            ${[1,2,3,4,5].map(level => `
              <label>
                <input type="checkbox" value="${level}" onchange="filters.updateComplexity()">
                ${level} - ${this.getComplexityLabel(level)}
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="filter-section">
          <label>Time to Value</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="immediate" onchange="filters.updateTimeToValue()"> Immediate</label>
            <label><input type="checkbox" value="1-week" onchange="filters.updateTimeToValue()"> 1 Week</label>
            <label><input type="checkbox" value="1-month" onchange="filters.updateTimeToValue()"> 1 Month</label>
            <label><input type="checkbox" value="3-months" onchange="filters.updateTimeToValue()"> 3+ Months</label>
          </div>
        </div>
        
        <div class="filter-section">
          <label>Category</label>
          <select multiple onchange="filters.updateCategories()" id="category-filter">
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        
        <div class="filter-section">
          <label>Budget Range</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="0-100" onchange="filters.updateBudget()"> Under $100/mo</label>
            <label><input type="checkbox" value="100-500" onchange="filters.updateBudget()"> $100-500/mo</label>
            <label><input type="checkbox" value="500-2000" onchange="filters.updateBudget()"> $500-2000/mo</label>
            <label><input type="checkbox" value="enterprise" onchange="filters.updateBudget()"> Enterprise</label>
          </div>
        </div>
        
        <button class="reset-filters-btn" onclick="filters.reset()">Reset Filters</button>
      </div>
    `;
  }

  getComplexityLabel(level) {
    const labels = {
      1: 'Very Easy',
      2: 'Easy', 
      3: 'Moderate',
      4: 'Complex',
      5: 'Very Complex'
    };
    return labels[level];
  }

  updateSearch(value) {
    this.activeFilters.search = value;
    this.applyFilters();
  }

  updateImpactRange() {
    const min = parseInt(document.getElementById('impact-min').value);
    const max = parseInt(document.getElementById('impact-max').value);
    
    this.activeFilters.impact.min = Math.min(min, max);
    this.activeFilters.impact.max = Math.max(min, max);
    
    document.getElementById('impact-min-val').textContent = this.activeFilters.impact.min;
    document.getElementById('impact-max-val').textContent = this.activeFilters.impact.max;
    
    this.applyFilters();
  }

  updateComplexity() {
    const checked = Array.from(document.querySelectorAll('input[type="checkbox"][value="1"],input[type="checkbox"][value="2"],input[type="checkbox"][value="3"],input[type="checkbox"][value="4"],input[type="checkbox"][value="5"]'))
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
    this.activeFilters.complexity = checked;
    this.applyFilters();
  }

  updateTimeToValue() {
    const checked = Array.from(document.querySelectorAll('input[type="checkbox"][value="immediate"],input[type="checkbox"][value="1-week"],input[type="checkbox"][value="1-month"],input[type="checkbox"][value="3-months"]'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    this.activeFilters.timeToValue = checked;
    this.applyFilters();
  }

  updateCategories() {
    const select = document.getElementById('category-filter');
    this.activeFilters.categories = Array.from(select.selectedOptions).map(opt => opt.value);
    this.applyFilters();
  }

  updateBudget() {
    const checked = Array.from(document.querySelectorAll('input[type="checkbox"][value="0-100"],input[type="checkbox"][value="100-500"],input[type="checkbox"][value="500-2000"],input[type="checkbox"][value="enterprise"]'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    this.activeFilters.budget = checked;
    this.applyFilters();
  }

  reset() {
    this.activeFilters = {
      impact: { min: 0, max: 100 },
      complexity: [],
      timeToValue: [],
      budget: [],
      categories: [],
      search: ''
    };
    
    // Reset UI
    document.getElementById('filter-search').value = '';
    document.getElementById('impact-min').value = 0;
    document.getElementById('impact-max').value = 100;
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('category-filter').value = '';
    
    this.applyFilters();
  }

  applyFilters() {
    const results = this.processor.getTools(this.activeFilters);
    updateToolsGrid(results);
  }

  // Quick filter methods for horizontal filter bar
  quickFilterImpact(value) {
    if (!value || value === 'all' || value === '') {
      this.activeFilters.impact = { min: 0, max: 100 };
    } else if (value === 'high' || value === '80-100') {
      this.activeFilters.impact = { min: 80, max: 100 };
    } else if (value === 'medium' || value === '60-79') {
      this.activeFilters.impact = { min: 60, max: 79 };
    } else if (value === 'low' || value === '0-59') {
      this.activeFilters.impact = { min: 0, max: 59 };
    }
    this.applyFilters();
  }

  quickFilterComplexity(value) {
    if (!value || value === 'all' || value === '') {
      this.activeFilters.complexity = [];
    } else if (value === '1,2' || value === 'simple') {
      this.activeFilters.complexity = [1, 2];
    } else if (value === '3' || value === 'moderate') {
      this.activeFilters.complexity = [3];
    } else if (value === '4,5' || value === 'complex') {
      this.activeFilters.complexity = [4, 5];
    }
    this.applyFilters();
  }

  quickFilterCategory(value) {
    if (!value || value === 'all' || value === '') {
      this.activeFilters.categories = [];
    } else {
      this.activeFilters.categories = [value];
    }
    this.applyFilters();
  }
}

// Global variables
let dataProcessor;
let dashboard;
let filters;
let toolsData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  showLoadingState();
  
  try {
    await loadToolsData();
    initializeComponents();
    renderDashboard();
    initializeEventListeners();
    hideLoadingState();
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    showErrorState(error);
  }
});

// Load tools data
async function loadToolsData() {
  try {
    // Debug: Check if data is already loaded
    console.log('Checking for unifiedToolsData:', typeof unifiedToolsData);
    
    if (typeof unifiedToolsData !== 'undefined' && unifiedToolsData.tools) {
      toolsData = unifiedToolsData.tools;
      console.log(`Loaded ${toolsData.length} tools from unified data`);
      console.log('Sample tool:', toolsData[0]);
      
      // Debug: Check data fields
      const toolsWithImpact = toolsData.filter(t => t.business_impact_score !== undefined);
      const toolsWithComplexity = toolsData.filter(t => t.complexity_score !== undefined);
      console.log(`Tools with business_impact_score: ${toolsWithImpact.length}`);
      console.log(`Tools with complexity_score: ${toolsWithComplexity.length}`);
    } else {
      throw new Error('Failed to load tools data - unifiedToolsData not found');
    }
  } catch (error) {
    console.error('Error loading tools data:', error);
    throw error;
  }
}

// Initialize all components
function initializeComponents() {
  // Initialize data processor
  dataProcessor = new EnterpriseDataProcessor(toolsData);
  window.dataProcessor = dataProcessor;
  
  // Initialize dashboard
  dashboard = new ExecutiveDashboard(dataProcessor);
  window.dashboard = dashboard;
  
  // Initialize filters
  filters = new SimpleFilters(dataProcessor);
  window.filters = filters;
  
  console.log('Components initialized successfully');
}

// Render main dashboard
function renderDashboard() {
  console.log('Starting renderDashboard...');
  
  // 1. Render executive summary (just the key metrics cards)
  renderExecutiveSummary();
  
  // 2. Render the main content area with 3-column layout
  renderMainContent();
}

// Render simplified executive summary
function renderExecutiveSummary() {
  const container = document.getElementById('executive-summary');
  if (!container) return;
  
  const metrics = dataProcessor.metrics;
  const savingsFormatted = (metrics.potentialSavings / 1000).toFixed(0) + 'k';
  const avgROI = metrics.averageROI || 0;
  
  container.innerHTML = `
    <div class="summary-cards">
      <div class="metric-card highlight">
        <div class="metric-icon"><i class="fas fa-rocket"></i></div>
        <div class="metric-value">${metrics.quickWins}</div>
        <div class="metric-label">Quick Wins</div>
        <div class="metric-detail">High impact, Low complexity</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon"><i class="fas fa-chess-king"></i></div>
        <div class="metric-value">${metrics.strategicPlatforms}</div>
        <div class="metric-label">Strategic Tools</div>
        <div class="metric-detail">Transform operations</div>
      </div>
      
      <div class="metric-card financial">
        <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
        <div class="metric-value">$${savingsFormatted}</div>
        <div class="metric-label">Potential Savings</div>
        <div class="metric-detail">Annual optimization</div>
      </div>
      
      <div class="metric-card roi">
        <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
        <div class="metric-value">${avgROI}%</div>
        <div class="metric-label">Average ROI</div>
        <div class="metric-detail">Across all tools</div>
      </div>
    </div>
  `;
  
  // Add CSS for summary cards
  addExecutiveSummaryStyles();
}

// Render main content with proper 3-column layout
function renderMainContent() {
  const container = document.getElementById('main-content');
  if (!container) return;
  
  const allTools = dataProcessor.getTools();
  console.log(`Rendering main content with ${allTools.length} tools`);
  
  container.innerHTML = `
    <div class="content-layout">
      <!-- Left: Filters Sidebar -->
      <aside class="filters-sidebar">
        <h3>Filters</h3>
        
        <!-- Search -->
        <div class="filter-section">
          <label>Search</label>
          <input type="text" id="filter-search" placeholder="Search tools..." 
                 onkeyup="filters.updateSearch(this.value)">
        </div>
        
        <!-- Impact Score -->
        <div class="filter-section">
          <label>Business Impact</label>
          <div class="range-slider">
            <input type="range" min="0" max="100" value="0" id="impact-min"
                   oninput="filters.updateImpactRange()">
            <input type="range" min="0" max="100" value="100" id="impact-max"
                   oninput="filters.updateImpactRange()">
            <div class="range-values">
              <span id="impact-min-val">0</span> - <span id="impact-max-val">100</span>
            </div>
          </div>
        </div>
        
        <!-- Complexity -->
        <div class="filter-section">
          <label>Complexity</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="1" onchange="filters.updateComplexity()"> Very Easy (1)</label>
            <label><input type="checkbox" value="2" onchange="filters.updateComplexity()"> Easy (2)</label>
            <label><input type="checkbox" value="3" onchange="filters.updateComplexity()"> Moderate (3)</label>
            <label><input type="checkbox" value="4" onchange="filters.updateComplexity()"> Complex (4)</label>
            <label><input type="checkbox" value="5" onchange="filters.updateComplexity()"> Very Complex (5)</label>
          </div>
        </div>
        
        <!-- Categories -->
        <div class="filter-section">
          <label>Categories</label>
          <select multiple size="8" id="category-filter" onchange="filters.updateCategories()">
            ${Object.keys(dataProcessor.metrics.byCategory || {}).map(cat => 
              `<option value="${cat}">${cat}</option>`
            ).join('')}
          </select>
        </div>
        
        <button class="reset-filters-btn" onclick="filters.reset()">
          <i class="fas fa-undo"></i> Reset Filters
        </button>
      </aside>
      
      <!-- Center: MAIN TOOLS PORTFOLIO -->
      <main class="tools-portfolio">
        <div class="portfolio-header">
          <h2>AI Tools Portfolio</h2>
          <div class="portfolio-controls">
            <span class="results-info">
              Showing <strong id="showing-count">${allTools.length}</strong> of ${dataProcessor.metrics.totalTools} tools
            </span>
            <div class="view-controls">
              <button class="view-btn active" data-view="grid" onclick="switchView('grid')">
                <i class="fas fa-th"></i> Grid
              </button>
              <button class="view-btn" data-view="list" onclick="switchView('list')">
                <i class="fas fa-list"></i> List
              </button>
            </div>
          </div>
        </div>
        
        <div class="tools-container grid-view" id="tools-container">
          ${allTools.slice(0, 50).map(tool => renderToolCard(tool)).join('')}
        </div>
        
        ${allTools.length > 50 ? `
          <div class="load-more-container">
            <button class="load-more-btn" onclick="loadMoreTools()">
              Load More Tools (${allTools.length - 50} remaining)
            </button>
          </div>
        ` : ''}
      </main>
      
      <!-- Right: Tool Details Panel -->
      <aside id="tool-details-panel" class="details-panel">
        <div class="empty-state">
          <i class="fas fa-mouse-pointer"></i>
          <p>Select a tool to view details</p>
        </div>
      </aside>
    </div>
  `;
  
  // Store tools for pagination
  window.currentTools = allTools;
  window.currentOffset = 50;
  
  // Add CSS for the layout
  addMainContentStyles();
}

// Update tools grid (now updates just the tools container, not the whole layout)
function updateToolsGrid(tools) {
  console.log('updateToolsGrid called with', tools.length, 'tools');
  
  const container = document.getElementById('tools-container');
  const countElement = document.getElementById('showing-count');
  
  if (!container) {
    console.error('Tools container not found');
    return;
  }
  
  // Update count
  if (countElement) {
    countElement.textContent = tools.length;
  }
  
  if (tools.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No tools match your criteria</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    `;
    return;
  }
  
  // Update just the tools grid content
  container.innerHTML = tools.slice(0, 50).map(tool => renderToolCard(tool)).join('');
  
  // Update pagination
  window.currentTools = tools;
  window.currentOffset = 50;
  
  // Add/remove load more button
  const loadMoreContainer = document.querySelector('.load-more-container');
  if (tools.length > 50) {
    if (!loadMoreContainer) {
      const portfolioElement = document.querySelector('.tools-portfolio');
      if (portfolioElement) {
        portfolioElement.insertAdjacentHTML('beforeend', `
          <div class="load-more-container">
            <button class="load-more-btn" onclick="loadMoreTools()">
              Load More Tools (${tools.length - 50} remaining)
            </button>
          </div>
        `);
      }
    } else {
      loadMoreContainer.querySelector('.load-more-btn').textContent = 
        `Load More Tools (${tools.length - 50} remaining)`;
    }
  } else if (loadMoreContainer) {
    loadMoreContainer.remove();
  }
}

// Add executive summary styles
function addExecutiveSummaryStyles() {
  if (document.getElementById('executive-summary-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'executive-summary-styles';
  style.innerHTML = `
    .executive-summary {
      padding: 20px;
      background: #f8f9fa;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .metric-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      text-align: center;
    }
    
    .metric-card.highlight {
      border: 2px solid #667eea;
    }
    
    .metric-icon {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 10px;
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    
    .metric-label {
      font-size: 16px;
      font-weight: 600;
      color: #34495e;
      margin-bottom: 5px;
    }
    
    .metric-detail {
      font-size: 14px;
      color: #7f8c8d;
    }
  `;
  document.head.appendChild(style);
}

// Add main content styles
function addMainContentStyles() {
  if (document.getElementById('main-content-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'main-content-styles';
  style.innerHTML = `
    .main-content-area {
      padding: 20px;
    }
    
    .content-layout {
      display: grid;
      grid-template-columns: 280px 1fr 350px;
      gap: 20px;
      min-height: 600px;
    }
    
    /* Filters Sidebar */
    .filters-sidebar {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      height: fit-content;
      position: sticky;
      top: 20px;
    }
    
    .filters-sidebar h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #2c3e50;
    }
    
    .filter-section {
      margin-bottom: 20px;
    }
    
    .filter-section label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #34495e;
    }
    
    .filter-section input[type="text"] {
      width: 100%;
      padding: 10px;
      font-size: 14px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-group label {
      font-size: 14px;
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    select[multiple] {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px;
      font-size: 14px;
    }
    
    .reset-filters-btn {
      width: 100%;
      padding: 10px;
      background: #e0e7ff;
      color: #667eea;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    
    /* Tools Portfolio */
    .tools-portfolio {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      overflow-y: auto;
      max-height: calc(100vh - 300px);
    }
    
    .portfolio-header {
      margin-bottom: 20px;
    }
    
    .portfolio-header h2 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    
    .portfolio-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .results-info {
      font-size: 14px;
      color: #7f8c8d;
    }
    
    .results-info strong {
      color: #667eea;
      font-weight: 600;
    }
    
    .view-controls {
      display: flex;
      gap: 5px;
    }
    
    .view-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      color: #7f8c8d;
      cursor: pointer;
      font-size: 14px;
    }
    
    .view-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    /* Tools Container */
    .tools-container {
      display: grid;
      gap: 20px;
    }
    
    .tools-container.grid-view {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    .tools-container.list-view {
      grid-template-columns: 1fr;
    }
    
    .tool-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    
    /* Load More */
    .load-more-container {
      margin-top: 30px;
      text-align: center;
    }
    
    .load-more-btn {
      padding: 12px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    
    /* Details Panel */
    .details-panel {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      height: fit-content;
      position: sticky;
      top: 20px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #95a5a6;
    }
    
    .empty-state i {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    .tool-details-content h2 {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 15px 0;
      color: #2c3e50;
    }
    
    .detail-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .metric-item {
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .metric-item label {
      font-size: 12px;
      color: #7f8c8d;
      display: block;
      margin-bottom: 4px;
    }
    
    .metric-item .value {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .detail-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .detail-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #34495e;
    }
    
    .detail-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .detail-actions button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .detail-actions .primary {
      background: #667eea;
      color: white;
    }
    
    .detail-actions .secondary {
      background: #e0e7ff;
      color: #667eea;
    }
    
    /* Responsive */
    @media (max-width: 1400px) {
      .content-layout {
        grid-template-columns: 250px 1fr;
      }
      
      .details-panel {
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        width: 350px;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-radius: 0;
      }
      
      .details-panel.show {
        transform: translateX(0);
        box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      }
    }
  `;
  document.head.appendChild(style);
}

// Render individual tool card
function renderToolCard(tool) {
  const roi = tool.estimatedROI || { percentage: 0, paybackMonths: 0 };
  const impactClass = tool.impactCategory || 'medium';
  const complexityClass = `complexity-${tool.complexity_score || 3}`;
  
  // Create complexity dots
  const complexityDots = Array(5).fill(0).map((_, i) => 
    `<span class="complexity-dot ${i < (tool.complexity_score || 3) ? 'filled' : ''}"></span>`
  ).join('');
  
  return `
    <div class="tool-card enhanced ${impactClass} ${tool.quadrant}" 
         data-tool="${tool.tool_name}" 
         onclick="selectTool('${tool.tool_name.replace(/'/g, "\\'")}')"
         style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; 
                background: white; cursor: pointer; transition: all 0.2s;">
      <div class="card-header" style="margin-bottom: 12px;">
        <h3 class="tool-name" style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #2c3e50;">
          ${tool.tool_name}
        </h3>
        <div class="quick-stats" style="display: flex; gap: 12px; font-size: 14px;">
          <span class="impact-badge" title="Business Impact Score" style="color: #667eea;">
            Impact: <strong>${tool.business_impact_score || 'N/A'}</strong>
          </span>
          <span class="complexity-badge ${complexityClass}" title="Implementation Complexity">
            Complexity: <strong>${tool.complexity_score || 'N/A'}/5</strong>
          </span>
        </div>
      </div>
      
      <div class="card-body">
        <p class="tool-summary" style="font-size: 14px; line-height: 1.5; color: #5a6c7d; 
                                       margin: 0 0 12px 0; height: 2.5em; overflow: hidden;">
          ${(tool.brief_purpose_summary || 'No description available').substring(0, 120)}${tool.brief_purpose_summary?.length > 120 ? '...' : ''}
        </p>
        
        <div class="tool-meta" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
          <span class="category-tag" style="font-size: 12px; color: #7f8c8d; 
                                            background: #f0f0f0; padding: 4px 8px; 
                                            border-radius: 4px;">
            ${tool.category || 'Uncategorized'}
          </span>
          <span class="pricing" style="font-size: 12px; color: #27ae60;">
            ${tool.monthlyPrice ? `$${tool.monthlyPrice}/mo` : 'Contact for pricing'}
          </span>
        </div>
      </div>
      
      <div class="card-footer" style="padding-top: 12px; border-top: 1px solid #f0f0f0;">
        <button class="view-details-btn" 
                style="width: 100%; padding: 8px; background: #667eea; color: white; 
                       border: none; border-radius: 6px; font-size: 14px; 
                       font-weight: 600; cursor: pointer;"
                onclick="event.stopPropagation(); viewToolDetails('${tool.tool_name.replace(/'/g, "\\'")}')">
          View Details →
        </button>
      </div>
    </div>
  `;
}

// Initialize event listeners
function initializeEventListeners() {
  // Global search
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filters.updateSearch(e.target.value);
    }, 300));
  }
}

// Select a tool and show details
function selectTool(toolName) {
  const tool = dataProcessor.processedData.get(toolName);
  if (!tool) return;
  
  const detailsPanel = document.getElementById('tool-details-panel');
  if (!detailsPanel) return;
  
  // Update panel content
  detailsPanel.innerHTML = `
    <div class="tool-details-content">
      <h2>${tool.tool_name}</h2>
      
      <div class="detail-metrics">
        <div class="metric-item">
          <label>Business Impact</label>
          <div class="value">${tool.business_impact_score || 'N/A'}</div>
        </div>
        <div class="metric-item">
          <label>Complexity</label>
          <div class="value">${tool.complexity_score || 'N/A'}/5</div>
        </div>
        <div class="metric-item">
          <label>Time to Value</label>
          <div class="value">${tool.time_to_value || 'N/A'}</div>
        </div>
        <div class="metric-item">
          <label>ROI</label>
          <div class="value">${tool.estimatedROI?.percentage || 0}%</div>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Pricing</h3>
        <p>${tool.pricing_model || 'Contact for pricing'}</p>
      </div>
      
      <div class="detail-section">
        <h3>Overview</h3>
        <p>${tool.brief_purpose_summary || 'No description available'}</p>
      </div>
      
      ${tool.feature_breakdown ? `
        <div class="detail-section">
          <h3>Key Features</h3>
          <p>${tool.feature_breakdown}</p>
        </div>
      ` : ''}
      
      ${tool.integration_potential ? `
        <div class="detail-section">
          <h3>Integration Capabilities</h3>
          <p>${tool.integration_potential}</p>
        </div>
      ` : ''}
      
      <div class="detail-actions">
        <button class="primary" onclick="addToRoadmap('${tool.tool_name.replace(/'/g, "\\'")}')">
          Add to Roadmap
        </button>
        <button class="secondary" onclick="compareTools('${tool.tool_name.replace(/'/g, "\\'")}')">
          Compare
        </button>
      </div>
      
      <button class="close-details" onclick="closeToolDetails()" 
              style="position: absolute; top: 10px; right: 10px; 
                     background: none; border: none; font-size: 20px; 
                     cursor: pointer; color: #95a5a6;">
        ×
      </button>
    </div>
  `;
  
  // Show panel on smaller screens
  if (window.innerWidth <= 1400) {
    detailsPanel.classList.add('show');
  }
}

// View tool details (opens in modal or new page)
function viewToolDetails(toolName) {
  selectTool(toolName);
}

// Close tool details panel
function closeToolDetails() {
  const detailsPanel = document.getElementById('tool-details-panel');
  if (detailsPanel) {
    detailsPanel.classList.remove('show');
    detailsPanel.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-mouse-pointer"></i>
        <p>Select a tool to view details</p>
      </div>
    `;
  }
}

// Add to roadmap
function addToRoadmap(toolName) {
  alert(`Added ${toolName} to implementation roadmap`);
}

// Compare tools
function compareTools(toolName) {
  alert(`Tool comparison feature coming soon!`);
}

// Switch view
function switchView(viewType) {
  const container = document.getElementById('tools-container');
  if (container) {
    container.className = `tools-container ${viewType}-view`;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewType);
    });
  }
}

// Load more tools
function loadMoreTools() {
  if (!window.currentTools || !window.currentOffset) return;
  
  const container = document.getElementById('tools-container');
  const nextBatch = window.currentTools.slice(window.currentOffset, window.currentOffset + 50);
  
  nextBatch.forEach(tool => {
    container.insertAdjacentHTML('beforeend', renderToolCard(tool));
  });
  
  window.currentOffset += 50;
  
  if (window.currentOffset >= window.currentTools.length) {
    document.querySelector('.load-more')?.remove();
  }
}

// Toggle advanced filters visibility
function toggleAdvancedFilters() {
  const sidebar = document.getElementById('advanced-filters');
  const button = document.querySelector('.show-advanced-filters');
  
  if (sidebar) {
    const isVisible = sidebar.style.display !== 'none';
    sidebar.style.display = isVisible ? 'none' : 'block';
    
    if (button) {
      button.textContent = isVisible ? 'Show Advanced Filters' : 'Hide Advanced Filters';
    }
  }
}

// Utility functions
function showLoadingState() {
  document.body.innerHTML += `
    <div class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Analyzing ${toolsData.length || '317'} AI tools...</p>
      </div>
    </div>
  `;
}

function hideLoadingState() {
  document.querySelector('.loading-overlay')?.remove();
}

function showErrorState(error) {
  document.body.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Failed to Load Dashboard</h2>
      <p>${error.message}</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export to global scope
window.viewToolDetails = viewToolDetails;
window.selectTool = selectTool;
window.closeToolDetails = closeToolDetails;
window.addToRoadmap = addToRoadmap;
window.compareTools = compareTools;
window.switchView = switchView;
window.loadMoreTools = loadMoreTools;
window.toggleAdvancedFilters = toggleAdvancedFilters;