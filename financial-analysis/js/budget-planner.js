// Budget Planner - Department-level budget allocation and planning

class BudgetPlanner {
  constructor(dataProcessor, costCalculator) {
    this.dataProcessor = dataProcessor;
    this.costCalculator = costCalculator;
    this.budgetAllocations = new Map();
    this.departmentProfiles = this.initializeDepartmentProfiles();
    this.totalBudget = 0;
    this.currentAllocation = 0;
  }

  initializeDepartmentProfiles() {
    return {
      'Engineering': {
        name: 'Engineering',
        teamSize: 20,
        priorities: ['ai assistant', 'productivity', 'development'],
        budgetWeight: 0.35,
        suggestedTools: []
      },
      'Marketing': {
        name: 'Marketing',
        teamSize: 8,
        priorities: ['content creation', 'analytics', 'social media'],
        budgetWeight: 0.25,
        suggestedTools: []
      },
      'Sales': {
        name: 'Sales',
        teamSize: 12,
        priorities: ['crm', 'ai assistant', 'analytics'],
        budgetWeight: 0.20,
        suggestedTools: []
      },
      'Operations': {
        name: 'Operations',
        teamSize: 6,
        priorities: ['productivity', 'automation', 'analytics'],
        budgetWeight: 0.10,
        suggestedTools: []
      },
      'HR': {
        name: 'HR',
        teamSize: 4,
        priorities: ['hr', 'productivity', 'analytics'],
        budgetWeight: 0.10,
        suggestedTools: []
      }
    };
  }

  setBudget(totalBudget) {
    this.totalBudget = totalBudget;
    this.generateInitialAllocations();
  }

  generateInitialAllocations() {
    this.budgetAllocations.clear();
    
    Object.values(this.departmentProfiles).forEach(dept => {
      const allocation = {
        department: dept.name,
        teamSize: dept.teamSize,
        allocatedBudget: this.totalBudget * dept.budgetWeight,
        suggestedTools: this.recommendToolsForDepartment(dept),
        actualSpend: 0,
        savings: 0,
        roi: 0
      };
      
      // Calculate actual spend and ROI
      allocation.actualSpend = allocation.suggestedTools.reduce((sum, tool) => {
        const tco = this.costCalculator.calculateToolTCO(tool.name, {
          teamSize: dept.teamSize,
          years: 1
        });
        return sum + (tco?.tco.subscription / 12 || 0);
      }, 0);
      
      allocation.savings = allocation.allocatedBudget - allocation.actualSpend;
      allocation.roi = this.calculateDepartmentROI(allocation.suggestedTools, dept.teamSize);
      
      this.budgetAllocations.set(dept.name, allocation);
    });
  }

  recommendToolsForDepartment(department) {
    const relevantTools = this.dataProcessor.tools.filter(tool => {
      const category = tool.category?.toLowerCase() || '';
      return department.priorities.some(priority => 
        category.includes(priority.toLowerCase())
      );
    });

    // Score tools based on department fit
    const scoredTools = relevantTools.map(tool => {
      const metrics = this.dataProcessor.financialMetrics.get(tool.tool_name);
      const score = this.calculateDepartmentFitScore(tool, department, metrics);
      
      return {
        name: tool.tool_name,
        category: tool.category,
        score,
        monthlyPrice: metrics?.monthlyPrice || 0,
        roi: metrics?.roi.roiPercentage || 0,
        complexity: tool.complexity_score || 3,
        businessImpact: tool.business_impact_score || 50
      };
    });

    // Sort by score and return top recommendations
    return scoredTools
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter(tool => tool.score > 0.5);
  }

  calculateDepartmentFitScore(tool, department, metrics) {
    let score = 0;
    
    // Category relevance
    const category = tool.category?.toLowerCase() || '';
    const categoryMatch = department.priorities.some(priority => 
      category.includes(priority.toLowerCase())
    );
    if (categoryMatch) score += 0.3;
    
    // Business impact
    const businessImpact = (tool.business_impact_score || 50) / 100;
    score += businessImpact * 0.25;
    
    // ROI potential
    const roi = (metrics?.roi.roiPercentage || 0) / 500; // Normalize to 0-1
    score += Math.min(roi, 1) * 0.25;
    
    // Complexity fit (lower complexity = better fit for smaller teams)
    const complexity = tool.complexity_score || 3;
    const complexityScore = department.teamSize < 10 ? 
      (6 - complexity) / 5 : // Prefer simpler tools for small teams
      complexity / 5; // Larger teams can handle complex tools
    score += complexityScore * 0.2;
    
    return Math.min(score, 1);
  }

  calculateDepartmentROI(suggestedTools, teamSize) {
    if (suggestedTools.length === 0) return 0;
    
    const totalROI = suggestedTools.reduce((sum, tool) => {
      const roi = this.costCalculator.calculateROI(tool.name, { teamSize });
      return sum + (roi?.roi || 0);
    }, 0);
    
    return Math.round(totalROI / suggestedTools.length);
  }

  updateDepartmentAllocation(department, newBudget) {
    const allocation = this.budgetAllocations.get(department);
    if (!allocation) return false;
    
    allocation.allocatedBudget = newBudget;
    
    // Recalculate savings
    allocation.savings = allocation.allocatedBudget - allocation.actualSpend;
    
    // Update total allocation
    this.updateTotalAllocation();
    
    return true;
  }

  updateTotalAllocation() {
    this.currentAllocation = Array.from(this.budgetAllocations.values())
      .reduce((sum, allocation) => sum + allocation.allocatedBudget, 0);
  }

  addToolToDepartment(department, toolName) {
    const allocation = this.budgetAllocations.get(department);
    const dept = this.departmentProfiles[department];
    
    if (!allocation || !dept) return false;
    
    const tool = this.dataProcessor.tools.find(t => t.tool_name === toolName);
    const metrics = this.dataProcessor.financialMetrics.get(toolName);
    
    if (!tool || !metrics) return false;
    
    const toolInfo = {
      name: toolName,
      category: tool.category,
      monthlyPrice: metrics.monthlyPrice || 0,
      roi: metrics.roi.roiPercentage || 0,
      complexity: tool.complexity_score || 3,
      businessImpact: tool.business_impact_score || 50
    };
    
    allocation.suggestedTools.push(toolInfo);
    
    // Recalculate spend and ROI
    allocation.actualSpend += toolInfo.monthlyPrice;
    allocation.roi = this.calculateDepartmentROI(allocation.suggestedTools, dept.teamSize);
    allocation.savings = allocation.allocatedBudget - allocation.actualSpend;
    
    return true;
  }

  removeToolFromDepartment(department, toolName) {
    const allocation = this.budgetAllocations.get(department);
    const dept = this.departmentProfiles[department];
    
    if (!allocation || !dept) return false;
    
    const toolIndex = allocation.suggestedTools.findIndex(t => t.name === toolName);
    if (toolIndex === -1) return false;
    
    const removedTool = allocation.suggestedTools.splice(toolIndex, 1)[0];
    
    // Recalculate spend and ROI
    allocation.actualSpend -= removedTool.monthlyPrice;
    allocation.roi = this.calculateDepartmentROI(allocation.suggestedTools, dept.teamSize);
    allocation.savings = allocation.allocatedBudget - allocation.actualSpend;
    
    return true;
  }

  generateBudgetReport() {
    const report = {
      generatedAt: new Date(),
      totalBudget: this.totalBudget,
      currentAllocation: this.currentAllocation,
      remainingBudget: this.totalBudget - this.currentAllocation,
      departments: [],
      summary: {
        totalTools: 0,
        totalSpend: 0,
        totalSavings: 0,
        averageROI: 0,
        riskScore: 0
      }
    };

    // Department details
    this.budgetAllocations.forEach((allocation, department) => {
      report.departments.push({
        department,
        teamSize: allocation.teamSize,
        allocatedBudget: allocation.allocatedBudget,
        actualSpend: allocation.actualSpend,
        savings: allocation.savings,
        roi: allocation.roi,
        toolCount: allocation.suggestedTools.length,
        tools: allocation.suggestedTools.map(tool => ({
          name: tool.name,
          monthlyPrice: tool.monthlyPrice,
          roi: tool.roi,
          complexity: tool.complexity
        })),
        budgetUtilization: (allocation.actualSpend / allocation.allocatedBudget) * 100,
        riskLevel: this.calculateDepartmentRisk(allocation)
      });
    });

    // Summary calculations
    report.summary.totalTools = report.departments.reduce((sum, dept) => sum + dept.toolCount, 0);
    report.summary.totalSpend = report.departments.reduce((sum, dept) => sum + dept.actualSpend, 0);
    report.summary.totalSavings = report.departments.reduce((sum, dept) => sum + dept.savings, 0);
    report.summary.averageROI = report.departments.reduce((sum, dept) => sum + dept.roi, 0) / report.departments.length;
    report.summary.riskScore = report.departments.reduce((sum, dept) => sum + dept.riskLevel, 0) / report.departments.length;

    return report;
  }

  calculateDepartmentRisk(allocation) {
    let riskScore = 0;
    
    // Budget utilization risk
    const utilization = allocation.actualSpend / allocation.allocatedBudget;
    if (utilization > 0.95) riskScore += 0.3;
    else if (utilization > 0.85) riskScore += 0.2;
    
    // Tool complexity risk
    const avgComplexity = allocation.suggestedTools.reduce((sum, tool) => sum + tool.complexity, 0) / allocation.suggestedTools.length;
    if (avgComplexity > 3.5) riskScore += 0.2;
    
    // ROI risk
    if (allocation.roi < 150) riskScore += 0.3;
    else if (allocation.roi < 200) riskScore += 0.2;
    
    // Tool count risk (too many tools)
    if (allocation.suggestedTools.length > 8) riskScore += 0.2;
    
    return Math.min(riskScore, 1);
  }

  optimizeBudgetAllocation() {
    const recommendations = [];
    
    this.budgetAllocations.forEach((allocation, department) => {
      const utilization = allocation.actualSpend / allocation.allocatedBudget;
      const riskLevel = this.calculateDepartmentRisk(allocation);
      
      // Over-allocated departments
      if (utilization > 0.9) {
        recommendations.push({
          type: 'increase_budget',
          department,
          priority: 'high',
          description: `${department} is over-allocated (${Math.round(utilization * 100)}% utilization)`,
          suggestedIncrease: allocation.actualSpend - allocation.allocatedBudget,
          impact: 'Prevents budget overrun'
        });
      }
      
      // Under-allocated departments with high ROI tools available
      if (utilization < 0.7 && allocation.roi > 200) {
        recommendations.push({
          type: 'reallocate_budget',
          department,
          priority: 'medium',
          description: `${department} has unused budget with high-ROI opportunities`,
          availableBudget: allocation.allocatedBudget - allocation.actualSpend,
          impact: 'Increase overall ROI'
        });
      }
      
      // High risk departments
      if (riskLevel > 0.6) {
        recommendations.push({
          type: 'reduce_risk',
          department,
          priority: 'high',
          description: `${department} has high implementation risk`,
          riskLevel,
          impact: 'Reduce deployment risk'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  createPhasedRolloutPlan() {
    const phases = [
      { name: 'Phase 1: Foundation', duration: 30, tools: [] },
      { name: 'Phase 2: Expansion', duration: 60, tools: [] },
      { name: 'Phase 3: Advanced', duration: 90, tools: [] }
    ];

    // Collect all tools across departments
    const allTools = [];
    this.budgetAllocations.forEach((allocation, department) => {
      allocation.suggestedTools.forEach(tool => {
        allTools.push({
          ...tool,
          department,
          priority: this.calculateImplementationPriority(tool, allocation)
        });
      });
    });

    // Sort by priority
    allTools.sort((a, b) => b.priority - a.priority);

    // Distribute tools across phases
    let currentPhase = 0;
    let phaseComplexity = 0;
    const maxPhaseComplexity = 15; // Arbitrary complexity budget per phase

    allTools.forEach(tool => {
      if (phaseComplexity + tool.complexity > maxPhaseComplexity && currentPhase < 2) {
        currentPhase++;
        phaseComplexity = 0;
      }
      
      phases[currentPhase].tools.push(tool);
      phaseComplexity += tool.complexity;
    });

    // Add phase summary
    phases.forEach(phase => {
      phase.toolCount = phase.tools.length;
      phase.totalCost = phase.tools.reduce((sum, tool) => sum + tool.monthlyPrice, 0);
      phase.averageROI = phase.tools.reduce((sum, tool) => sum + tool.roi, 0) / phase.tools.length;
      phase.totalComplexity = phase.tools.reduce((sum, tool) => sum + tool.complexity, 0);
    });

    return phases;
  }

  calculateImplementationPriority(tool, allocation) {
    let priority = 0;
    
    // ROI weight (40%)
    priority += (tool.roi / 500) * 0.4;
    
    // Business impact weight (30%)
    priority += (tool.businessImpact / 100) * 0.3;
    
    // Complexity weight (20% - inverse, simpler = higher priority)
    priority += ((6 - tool.complexity) / 5) * 0.2;
    
    // Cost efficiency weight (10%)
    const costEfficiency = tool.roi / (tool.monthlyPrice || 1);
    priority += Math.min(costEfficiency / 10, 1) * 0.1;
    
    return Math.min(priority, 1);
  }

  getBudgetSummary() {
    this.updateTotalAllocation();
    
    return {
      totalBudget: this.totalBudget,
      currentAllocation: this.currentAllocation,
      remainingBudget: this.totalBudget - this.currentAllocation,
      utilizationRate: (this.currentAllocation / this.totalBudget) * 100,
      departmentCount: this.budgetAllocations.size,
      totalTools: Array.from(this.budgetAllocations.values())
        .reduce((sum, allocation) => sum + allocation.suggestedTools.length, 0),
      averageROI: Array.from(this.budgetAllocations.values())
        .reduce((sum, allocation) => sum + allocation.roi, 0) / this.budgetAllocations.size
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BudgetPlanner;
}