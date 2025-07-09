# Budget Planner Component Specification

## Component Overview
The Budget Planner enables sophisticated department-level budget allocation, multi-year financial planning, and approval workflows for AI tool investments. It transforms reactive spending into proactive budget management with intelligent allocation recommendations.

## Responsibilities
- Department-wise budget allocation and tracking
- Multi-year budget projections with growth scenarios
- Phased rollout planning for tool deployments
- Budget optimization recommendations
- Approval workflow management
- Budget vs. actual tracking and alerts

## Component Interface

### Public API
```typescript
class BudgetPlanner {
  // Initialization
  constructor(dataProcessor: FinancialDataProcessor, calculator: CostCalculator)
  
  // Budget Creation
  createBudget(params: BudgetParameters): Budget
  createDepartmentBudget(department: string, allocation: number): DepartmentBudget
  createMultiYearBudget(baseYear: BudgetYear, projections: ProjectionParams): MultiYearBudget
  
  // Budget Allocation
  allocateTools(budget: Budget, tools: Tool[], strategy: AllocationStrategy): AllocationResult
  optimizeAllocation(constraints: BudgetConstraints): OptimalAllocation
  suggestReallocation(currentBudget: Budget): ReallocationSuggestion
  
  // Phased Planning
  createPhasedRollout(tools: Tool[], constraints: RolloutConstraints): PhasedPlan
  adjustPhasing(plan: PhasedPlan, newConstraints: RolloutConstraints): PhasedPlan
  
  // Tracking & Analysis
  trackActualSpend(budget: Budget, actuals: ActualSpend[]): BudgetVariance
  forecastBudgetUtilization(budget: Budget, currentDate: Date): UtilizationForecast
  identifyBudgetRisks(budget: Budget): BudgetRisk[]
  
  // Approval Workflows
  submitForApproval(budget: Budget, approvers: Approver[]): ApprovalRequest
  getApprovalStatus(budgetId: string): ApprovalStatus
  implementApprovedBudget(budget: Budget): ImplementationResult
}
```

### Data Structures
```typescript
interface Budget {
  id: string
  name: string
  fiscalYear: number
  totalAllocation: number
  currency: string
  departments: DepartmentBudget[]
  categories: CategoryBudget[]
  status: 'draft' | 'pending_approval' | 'approved' | 'active'
  constraints: BudgetConstraints
  metadata: {
    createdBy: string
    createdAt: Date
    lastModified: Date
    version: number
  }
}

interface DepartmentBudget {
  departmentId: string
  departmentName: string
  allocation: number
  headcount: number
  allocatedTools: ToolAllocation[]
  utilizationTarget: number
  constraints: {
    maxToolsPerPerson: number
    requiredCapabilities: string[]
    blacklistedTools: string[]
  }
  approver: Approver
}

interface PhasedPlan {
  totalDuration: number // months
  phases: Phase[]
  totalCost: number
  cashFlowProjection: CashFlow[]
  riskProfile: RiskAssessment
  dependencies: Dependency[]
  milestones: Milestone[]
}

interface Phase {
  phaseNumber: number
  name: string
  duration: number // months
  tools: ToolDeployment[]
  budget: number
  prerequisites: string[]
  deliverables: string[]
  successCriteria: Criterion[]
}

interface BudgetVariance {
  budget: Budget
  period: DateRange
  actualSpend: number
  budgetedSpend: number
  variance: number
  variancePercentage: number
  categories: CategoryVariance[]
  departments: DepartmentVariance[]
  alerts: VarianceAlert[]
  trends: SpendTrend[]
}
```

## Implementation Details

### Budget Allocation Engine
```javascript
class BudgetAllocationEngine {
  constructor(dataProcessor, calculator) {
    this.dataProcessor = dataProcessor;
    this.calculator = calculator;
    this.strategies = {
      balanced: new BalancedAllocationStrategy(),
      growth: new GrowthAllocationStrategy(),
      efficiency: new EfficiencyAllocationStrategy(),
      innovation: new InnovationAllocationStrategy()
    };
  }

  allocateTools(budget, availableTools, strategy = 'balanced') {
    const allocator = this.strategies[strategy] || this.strategies.balanced;
    
    // Prepare allocation context
    const context = {
      totalBudget: budget.totalAllocation,
      departments: budget.departments,
      constraints: budget.constraints,
      toolMetrics: this.calculateToolMetrics(availableTools),
      currentTools: this.getCurrentTools(budget)
    };
    
    // Run allocation algorithm
    const allocation = allocator.allocate(context, availableTools);
    
    // Validate allocation
    const validation = this.validateAllocation(allocation, budget);
    if (!validation.isValid) {
      return this.handleInvalidAllocation(allocation, validation, budget);
    }
    
    // Generate implementation plan
    const implementation = this.createImplementationPlan(allocation, budget);
    
    return {
      allocation,
      implementation,
      metrics: this.calculateAllocationMetrics(allocation),
      risks: this.assessAllocationRisks(allocation, budget),
      alternatives: this.generateAlternatives(allocation, context)
    };
  }

  calculateToolMetrics(tools) {
    return tools.map(tool => {
      const financials = this.dataProcessor.getToolFinancials(tool.tool_name);
      const tco = this.calculator.calculateTCO(tool.tool_name);
      const roi = this.calculator.calculateROI(tool.tool_name);
      
      return {
        tool: tool.tool_name,
        category: tool.category,
        monthlyPrice: financials.monthlyPrice,
        tco: tco.summary.totalCost,
        roi: roi.metrics.roi,
        impactScore: tool.business_impact_score,
        complexityScore: tool.complexity_score,
        valueScore: this.calculateValueScore(tool, financials, roi),
        fitScore: this.calculateFitScore(tool)
      };
    });
  }

  optimizeAllocation(constraints) {
    const {
      totalBudget,
      departments,
      requiredCapabilities,
      optimizationGoal = 'value',
      timeHorizon = 12
    } = constraints;
    
    // Build optimization model
    const model = {
      variables: this.createDecisionVariables(departments),
      objective: this.createObjectiveFunction(optimizationGoal),
      constraints: this.buildConstraints(constraints)
    };
    
    // Solve using linear programming
    const solution = this.solveOptimization(model);
    
    // Interpret results
    const optimalAllocation = this.interpretSolution(solution);
    
    // Calculate improvement metrics
    const currentValue = this.calculateCurrentValue(departments);
    const optimizedValue = this.calculateOptimizedValue(optimalAllocation);
    
    return {
      currentAllocation: this.getCurrentAllocation(departments),
      optimalAllocation,
      improvement: {
        absolute: optimizedValue - currentValue,
        percentage: ((optimizedValue - currentValue) / currentValue) * 100
      },
      recommendations: this.generateOptimizationRecommendations(
        optimalAllocation,
        constraints
      ),
      implementation: this.createOptimizationRoadmap(optimalAllocation)
    };
  }
}

// Allocation Strategies
class BalancedAllocationStrategy {
  allocate(context, tools) {
    const allocations = [];
    const remainingBudget = { ...context.departments };
    
    // Score and rank tools
    const scoredTools = tools.map(tool => ({
      ...tool,
      score: this.calculateBalancedScore(tool, context)
    })).sort((a, b) => b.score - a.score);
    
    // Allocate tools to departments
    for (const tool of scoredTools) {
      const bestDepartment = this.findBestDepartment(
        tool,
        remainingBudget,
        context
      );
      
      if (bestDepartment && this.canAllocate(tool, bestDepartment)) {
        allocations.push({
          tool: tool.tool_name,
          department: bestDepartment.departmentName,
          cost: tool.monthlyPrice * 12,
          justification: this.generateJustification(tool, bestDepartment)
        });
        
        remainingBudget[bestDepartment.departmentId] -= tool.monthlyPrice * 12;
      }
    }
    
    return allocations;
  }

  calculateBalancedScore(tool, context) {
    const weights = {
      roi: 0.3,
      impact: 0.3,
      complexity: 0.2,
      fit: 0.2
    };
    
    return (
      weights.roi * this.normalizeROI(tool.roi) +
      weights.impact * (tool.business_impact_score / 100) +
      weights.complexity * (1 - tool.complexity_score / 5) +
      weights.fit * this.calculateFitScore(tool, context)
    );
  }
}

class GrowthAllocationStrategy {
  allocate(context, tools) {
    // Prioritize tools that enable scaling and growth
    const growthTools = tools.filter(tool => 
      this.isGrowthEnabling(tool) || 
      tool.category === 'automation' ||
      tool.category === 'analytics'
    );
    
    // Allocate growth tools first
    const allocations = this.allocateGrowthTools(growthTools, context);
    
    // Fill remaining budget with supporting tools
    const remainingBudget = this.calculateRemainingBudget(context, allocations);
    const supportingAllocations = this.allocateSupportingTools(
      tools,
      remainingBudget,
      allocations
    );
    
    return [...allocations, ...supportingAllocations];
  }

  isGrowthEnabling(tool) {
    const growthKeywords = [
      'scale', 'automation', 'efficiency', 'productivity',
      'analytics', 'insights', 'optimization'
    ];
    
    const description = (tool.feature_breakdown + tool.use_cases_in_pr).toLowerCase();
    return growthKeywords.some(keyword => description.includes(keyword));
  }
}
```

### Phased Rollout Planner
```javascript
class PhasedRolloutPlanner {
  createPhasedRollout(tools, constraints) {
    const {
      maxMonthlySpend,
      maxSimultaneousDeployments = 3,
      requiredROI = 0,
      teamCapacity,
      riskTolerance = 'medium'
    } = constraints;
    
    // Analyze tool dependencies
    const dependencies = this.analyzeDependencies(tools);
    
    // Group tools by deployment complexity
    const complexityGroups = this.groupByComplexity(tools);
    
    // Create phases
    const phases = this.generatePhases(
      complexityGroups,
      dependencies,
      constraints
    );
    
    // Optimize phase sequencing
    const optimizedPhases = this.optimizePhaseSequence(phases, constraints);
    
    // Generate detailed plan
    return {
      totalDuration: this.calculateTotalDuration(optimizedPhases),
      phases: optimizedPhases,
      totalCost: this.calculateTotalCost(optimizedPhases),
      cashFlowProjection: this.projectCashFlow(optimizedPhases),
      riskProfile: this.assessRiskProfile(optimizedPhases, riskTolerance),
      dependencies: dependencies,
      milestones: this.defineMilestones(optimizedPhases),
      contingencies: this.planContingencies(optimizedPhases)
    };
  }

  generatePhases(complexityGroups, dependencies, constraints) {
    const phases = [];
    let phaseNumber = 1;
    
    // Phase 1: Quick wins (low complexity, high impact)
    const quickWins = complexityGroups.low.filter(tool => 
      tool.business_impact_score >= 70 &&
      !this.hasDependencies(tool, dependencies)
    );
    
    if (quickWins.length > 0) {
      phases.push({
        phaseNumber: phaseNumber++,
        name: 'Quick Wins & Foundation',
        duration: 1, // month
        tools: this.createToolDeployments(quickWins.slice(0, 5)),
        objective: 'Demonstrate value and build momentum',
        successCriteria: [
          'All tools deployed and operational',
          'Initial productivity gains measured',
          'User adoption > 80%'
        ]
      });
    }
    
    // Phase 2: Core infrastructure
    const infrastructure = complexityGroups.medium.filter(tool =>
      this.isInfrastructure(tool) ||
      this.hasManyDependents(tool, dependencies)
    );
    
    if (infrastructure.length > 0) {
      phases.push({
        phaseNumber: phaseNumber++,
        name: 'Core Infrastructure',
        duration: 3, // months
        tools: this.createToolDeployments(infrastructure),
        objective: 'Establish foundation for future tools',
        prerequisites: ['Phase 1 completion', 'IT team readiness'],
        successCriteria: [
          'Infrastructure tools integrated',
          'APIs and connections established',
          'Security compliance verified'
        ]
      });
    }
    
    // Phase 3: Department-specific tools
    const departmentTools = this.groupByDepartment(complexityGroups.medium);
    Object.entries(departmentTools).forEach(([dept, tools]) => {
      if (tools.length > 0) {
        phases.push({
          phaseNumber: phaseNumber++,
          name: `${dept} Enablement`,
          duration: 2,
          tools: this.createToolDeployments(tools),
          objective: `Empower ${dept} team with specialized tools`,
          prerequisites: ['Infrastructure phase completion'],
          successCriteria: [
            `${dept} team trained and using tools`,
            'Department KPIs showing improvement',
            'Integration with existing workflows complete'
          ]
        });
      }
    });
    
    // Phase 4: Advanced/Complex tools
    const complexTools = complexityGroups.high.filter(tool =>
      tool.business_impact_score >= 80
    );
    
    if (complexTools.length > 0) {
      phases.push({
        phaseNumber: phaseNumber++,
        name: 'Strategic Transformation',
        duration: 6,
        tools: this.createToolDeployments(complexTools),
        objective: 'Deploy transformational AI capabilities',
        prerequisites: [
          'All previous phases complete',
          'Change management plan approved',
          'Executive sponsorship secured'
        ],
        successCriteria: [
          'Complex tools fully operational',
          'Measured business transformation',
          'ROI targets achieved'
        ]
      });
    }
    
    return phases;
  }

  optimizePhaseSequence(phases, constraints) {
    // Calculate phase scores
    const scoredPhases = phases.map(phase => ({
      ...phase,
      score: this.calculatePhaseScore(phase, constraints),
      risk: this.assessPhaseRisk(phase),
      effort: this.estimatePhaseEffort(phase)
    }));
    
    // Apply sequencing rules
    const sequenced = this.applySequencingRules(scoredPhases, constraints);
    
    // Balance load across phases
    const balanced = this.balancePhaseLoad(sequenced, constraints);
    
    // Add buffer time
    const buffered = this.addBufferTime(balanced, constraints.riskTolerance);
    
    return buffered;
  }

  projectCashFlow(phases) {
    const cashFlow = [];
    let cumulativeCost = 0;
    
    phases.forEach(phase => {
      const phaseMonths = [];
      const monthlyCost = phase.budget / phase.duration;
      
      for (let month = 0; month < phase.duration; month++) {
        cumulativeCost += monthlyCost;
        phaseMonths.push({
          month: cashFlow.length + month + 1,
          phase: phase.phaseNumber,
          monthlySpend: monthlyCost,
          cumulativeSpend: cumulativeCost,
          deployments: month === 0 ? phase.tools.length : 0,
          activeTools: this.calculateActiveTools(phases, cashFlow.length + month)
        });
      }
      
      cashFlow.push(...phaseMonths);
    });
    
    return cashFlow;
  }
}
```

### Budget Tracking & Variance Analysis
```javascript
class BudgetTracker {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.variances = new Map();
    this.alerts = [];
  }

  trackActualSpend(budget, actuals) {
    const period = this.determinePeriod(actuals);
    const budgetedSpend = this.getBudgetedSpend(budget, period);
    const actualSpend = this.aggregateActuals(actuals);
    
    // Calculate variances
    const variance = {
      budget,
      period,
      actualSpend: actualSpend.total,
      budgetedSpend: budgetedSpend.total,
      variance: actualSpend.total - budgetedSpend.total,
      variancePercentage: ((actualSpend.total - budgetedSpend.total) / budgetedSpend.total) * 100,
      categories: this.calculateCategoryVariances(budget, actuals),
      departments: this.calculateDepartmentVariances(budget, actuals),
      alerts: [],
      trends: this.analyzeTrends(budget, actuals)
    };
    
    // Generate alerts
    variance.alerts = this.generateVarianceAlerts(variance);
    
    // Store for trending
    this.variances.set(`${budget.id}_${period.start}_${period.end}`, variance);
    
    return variance;
  }

  calculateCategoryVariances(budget, actuals) {
    const categoryActuals = this.groupByCategory(actuals);
    const categoryBudgets = this.getCategoryBudgets(budget);
    
    return Array.from(categoryActuals.entries()).map(([category, actual]) => {
      const budgeted = categoryBudgets.get(category) || 0;
      const variance = actual - budgeted;
      
      return {
        category,
        budgeted,
        actual,
        variance,
        variancePercentage: budgeted > 0 ? (variance / budgeted) * 100 : 0,
        status: this.getVarianceStatus(variance, budgeted),
        topContributors: this.getTopVarianceContributors(category, actuals)
      };
    });
  }

  generateVarianceAlerts(variance) {
    const alerts = [];
    
    // Overall budget alert
    if (Math.abs(variance.variancePercentage) > 10) {
      alerts.push({
        type: variance.variance > 0 ? 'overspend' : 'underspend',
        severity: Math.abs(variance.variancePercentage) > 20 ? 'high' : 'medium',
        message: `Budget variance of ${variance.variancePercentage.toFixed(1)}% detected`,
        amount: Math.abs(variance.variance),
        action: this.suggestVarianceAction(variance)
      });
    }
    
    // Category alerts
    variance.categories.forEach(cat => {
      if (Math.abs(cat.variancePercentage) > 15) {
        alerts.push({
          type: 'category_variance',
          severity: Math.abs(cat.variancePercentage) > 25 ? 'high' : 'medium',
          category: cat.category,
          message: `${cat.category} spending ${cat.variance > 0 ? 'over' : 'under'} budget by ${Math.abs(cat.variancePercentage).toFixed(1)}%`,
          topContributors: cat.topContributors
        });
      }
    });
    
    // Trend alerts
    const concerning Trends = variance.trends.filter(trend => 
      trend.direction === 'increasing' && trend.rate > 0.1
    );
    
    concerningTrends.forEach(trend => {
      alerts.push({
        type: 'trend_alert',
        severity: trend.rate > 0.2 ? 'high' : 'medium',
        message: `${trend.category} spending increasing at ${(trend.rate * 100).toFixed(1)}% per month`,
        projection: trend.projectedOverspend
      });
    });
    
    return alerts;
  }

  forecastBudgetUtilization(budget, currentDate) {
    const fiscalYearStart = new Date(budget.fiscalYear, 0, 1);
    const fiscalYearEnd = new Date(budget.fiscalYear, 11, 31);
    const elapsed = (currentDate - fiscalYearStart) / (fiscalYearEnd - fiscalYearStart);
    
    // Get historical spending
    const historicalSpend = this.getHistoricalSpend(budget, currentDate);
    const currentUtilization = (historicalSpend / budget.totalAllocation) * 100;
    
    // Calculate run rate
    const monthlyRunRate = this.calculateRunRate(budget, historicalSpend, elapsed);
    const projectedAnnualSpend = monthlyRunRate * 12;
    const projectedUtilization = (projectedAnnualSpend / budget.totalAllocation) * 100;
    
    // Analyze spending patterns
    const patterns = this.analyzeSpendingPatterns(budget);
    
    // Adjust for seasonality
    const seasonallyAdjusted = this.adjustForSeasonality(
      projectedAnnualSpend,
      patterns.seasonality
    );
    
    return {
      currentUtilization,
      projectedUtilization,
      projectedAnnualSpend: seasonallyAdjusted,
      monthlyRunRate,
      remainingBudget: budget.totalAllocation - historicalSpend,
      daysRemaining: Math.floor((fiscalYearEnd - currentDate) / (1000 * 60 * 60 * 24)),
      recommendations: this.generateUtilizationRecommendations(
        currentUtilization,
        projectedUtilization,
        elapsed
      ),
      risks: this.identifyUtilizationRisks(projectedUtilization, elapsed),
      opportunities: this.identifyUtilizationOpportunities(
        currentUtilization,
        remainingBudget,
        elapsed
      )
    };
  }
}
```

### Budget Approval Workflow
```javascript
class BudgetApprovalWorkflow {
  constructor() {
    this.approvals = new Map();
    this.notifications = new NotificationService();
  }

  submitForApproval(budget, approvers) {
    // Validate budget before submission
    const validation = this.validateBudget(budget);
    if (!validation.isValid) {
      throw new ValidationError('Budget validation failed', validation.errors);
    }
    
    // Create approval request
    const request = {
      id: this.generateRequestId(),
      budgetId: budget.id,
      budget: budget,
      submittedAt: new Date(),
      submittedBy: budget.metadata.createdBy,
      approvers: approvers.map(approver => ({
        ...approver,
        status: 'pending',
        comments: [],
        history: []
      })),
      status: 'pending',
      currentLevel: 0,
      documentation: this.prepareSupportingDocuments(budget)
    };
    
    // Store request
    this.approvals.set(request.id, request);
    
    // Notify first level approvers
    this.notifyApprovers(request, 0);
    
    // Set up escalation timers
    this.setupEscalation(request);
    
    return request;
  }

  processApproval(requestId, approverId, decision, comments) {
    const request = this.approvals.get(requestId);
    if (!request) throw new Error('Approval request not found');
    
    const approver = request.approvers.find(a => a.id === approverId);
    if (!approver) throw new Error('Approver not found');
    
    // Record decision
    approver.status = decision;
    approver.comments = comments;
    approver.decidedAt = new Date();
    approver.history.push({
      action: decision,
      timestamp: new Date(),
      comments
    });
    
    // Check if level is complete
    const levelComplete = this.checkLevelComplete(request);
    
    if (levelComplete) {
      if (decision === 'approved') {
        // Move to next level or complete
        if (request.currentLevel < this.getMaxLevel(request)) {
          request.currentLevel++;
          this.notifyApprovers(request, request.currentLevel);
        } else {
          request.status = 'approved';
          this.handleApprovalComplete(request);
        }
      } else {
        request.status = 'rejected';
        this.handleRejection(request);
      }
    }
    
    return this.getApprovalStatus(requestId);
  }

  prepareSupportingDocuments(budget) {
    return {
      executiveSummary: this.generateExecutiveSummary(budget),
      detailedBreakdown: this.generateDetailedBreakdown(budget),
      comparisonToPrevious: this.compareT oPreviousYear(budget),
      roiProjections: this.generateROIProjections(budget),
      riskAssessment: this.assessBudgetRisks(budget),
      alternativeScenarios: this.generateAlternativeScenarios(budget)
    };
  }

  generateExecutiveSummary(budget) {
    const tools = this.extractToolsFromBudget(budget);
    const metrics = this.calculateBudgetMetrics(budget);
    
    return {
      totalRequest: budget.totalAllocation,
      yearOverYearChange: metrics.yoyChange,
      topInvestments: metrics.topInvestments,
      expectedROI: metrics.expectedROI,
      strategicAlignment: this.assessStrategicAlignment(budget),
      keyBenefits: this.summarizeBenefits(tools),
      implementation: this.summarizeImplementation(budget)
    };
  }
}
```

### Budget Optimization Algorithms
```javascript
class BudgetOptimizer {
  optimizeBudgetAllocation(constraints) {
    // Define optimization problem
    const problem = {
      objective: 'maximize',
      direction: constraints.optimizationGoal || 'value',
      variables: this.defineVariables(constraints),
      constraints: this.defineConstraints(constraints),
      bounds: this.defineBounds(constraints)
    };
    
    // Solve using simplex method
    const solution = this.solveSimplex(problem);
    
    // Post-process solution
    return this.interpretOptimalSolution(solution, constraints);
  }

  defineVariables(constraints) {
    const variables = [];
    
    constraints.departments.forEach(dept => {
      constraints.availableTools.forEach(tool => {
        variables.push({
          name: `x_${dept.id}_${tool.id}`,
          type: 'binary', // 0 or 1 - tool allocated or not
          coefficient: this.calculateCoefficient(tool, dept),
          cost: tool.annualCost,
          department: dept.id,
          tool: tool.id
        });
      });
    });
    
    return variables;
  }

  defineConstraints(constraints) {
    const problemConstraints = [];
    
    // Budget constraints per department
    constraints.departments.forEach(dept => {
      problemConstraints.push({
        name: `budget_${dept.id}`,
        type: 'budget',
        expression: this.buildBudgetExpression(dept),
        relation: '<=',
        rhs: dept.allocation
      });
    });
    
    // Tool uniqueness constraints
    constraints.availableTools.forEach(tool => {
      if (!tool.allowMultipleDepartments) {
        problemConstraints.push({
          name: `unique_${tool.id}`,
          type: 'uniqueness',
          expression: this.buildUniquenessExpression(tool),
          relation: '<=',
          rhs: 1
        });
      }
    });
    
    // Capability constraints
    constraints.requiredCapabilities.forEach(capability => {
      problemConstraints.push({
        name: `capability_${capability}`,
        type: 'capability',
        expression: this.buildCapabilityExpression(capability),
        relation: '>=',
        rhs: 1
      });
    });
    
    return problemConstraints;
  }

  solveSimplex(problem) {
    // Initialize tableau
    const tableau = this.initializeTableau(problem);
    
    // Run simplex iterations
    let iteration = 0;
    const maxIterations = 1000;
    
    while (!this.isOptimal(tableau) && iteration < maxIterations) {
      // Find entering variable
      const enteringVar = this.findEnteringVariable(tableau);
      
      // Find leaving variable
      const leavingVar = this.findLeavingVariable(tableau, enteringVar);
      
      // Perform pivot operation
      this.pivot(tableau, enteringVar, leavingVar);
      
      iteration++;
    }
    
    // Extract solution
    return this.extractSolution(tableau);
  }

  calculateCoefficient(tool, department) {
    // Multi-criteria scoring
    const weights = {
      roi: 0.3,
      impact: 0.25,
      fit: 0.25,
      complexity: 0.2
    };
    
    const scores = {
      roi: this.normalizeROI(tool.expectedROI),
      impact: tool.businessImpactScore / 100,
      fit: this.calculateDepartmentFit(tool, department),
      complexity: 1 - (tool.complexityScore / 5)
    };
    
    return Object.entries(weights).reduce((total, [criterion, weight]) => 
      total + weight * scores[criterion], 0
    );
  }
}
```

## Integration Points

### Dependencies
- FinancialDataProcessor for cost data
- CostCalculator for TCO/ROI calculations
- Authentication service for approval workflows
- Notification service for alerts

### API Endpoints
```javascript
// Budget creation and management
POST   /api/budgets/create
GET    /api/budgets/{budgetId}
PUT    /api/budgets/{budgetId}/update
DELETE /api/budgets/{budgetId}

// Allocation and optimization
POST   /api/budgets/{budgetId}/allocate
POST   /api/budgets/optimize
GET    /api/budgets/{budgetId}/recommendations

// Tracking and analysis
POST   /api/budgets/{budgetId}/actuals
GET    /api/budgets/{budgetId}/variance
GET    /api/budgets/{budgetId}/forecast

// Approval workflow
POST   /api/budgets/{budgetId}/submit-approval
POST   /api/approvals/{requestId}/approve
GET    /api/approvals/{requestId}/status
```

## Testing Strategy

### Unit Tests
```javascript
describe('BudgetPlanner', () => {
  describe('Budget Creation', () => {
    test('creates valid department budgets', () => {
      const budget = planner.createDepartmentBudget('Marketing', 100000);
      expect(budget.allocation).toBe(100000);
      expect(budget.status).toBe('draft');
    });

    test('enforces budget constraints', () => {
      const constraints = { maxToolsPerPerson: 5, totalBudget: 500000 };
      expect(() => planner.createBudget({ ...constraints, totalBudget: -1000 }))
        .toThrow('Invalid budget amount');
    });
  });

  describe('Allocation Optimization', () => {
    test('optimizes within budget constraints', () => {
      const result = planner.optimizeAllocation({
        totalBudget: 200000,
        departments: mockDepartments,
        availableTools: mockTools
      });
      
      expect(result.optimalAllocation.totalCost).toBeLessThanOrEqual(200000);
      expect(result.improvement.percentage).toBeGreaterThan(0);
    });
  });

  describe('Phased Planning', () => {
    test('creates logical phase sequence', () => {
      const plan = planner.createPhasedRollout(mockTools, {
        maxMonthlySpend: 50000
      });
      
      expect(plan.phases[0].name).toContain('Quick Wins');
      expect(plan.phases.every(p => p.budget <= 50000 * p.duration)).toBe(true);
    });
  });
});
```

## Error Handling

### Validation & Recovery
```javascript
class ValidatedBudgetPlanner extends BudgetPlanner {
  createBudget(params) {
    try {
      // Validate inputs
      this.validateBudgetParams(params);
      
      // Create budget with validation
      const budget = super.createBudget(params);
      
      // Post-creation validation
      this.validateCreatedBudget(budget);
      
      return budget;
    } catch (error) {
      console.error('Budget creation error:', error);
      
      // Attempt recovery
      if (error.code === 'INVALID_ALLOCATION') {
        return this.createMinimalBudget(params);
      }
      
      throw error;
    }
  }

  validateBudgetParams(params) {
    const errors = [];
    
    if (!params.fiscalYear || params.fiscalYear < 2024) {
      errors.push('Invalid fiscal year');
    }
    
    if (!params.totalAllocation || params.totalAllocation <= 0) {
      errors.push('Budget allocation must be positive');
    }
    
    if (!params.departments || params.departments.length === 0) {
      errors.push('At least one department required');
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Budget validation failed', errors);
    }
  }
}
```

## Performance Optimization

### Caching Strategy
```javascript
class CachedBudgetPlanner extends BudgetPlanner {
  constructor(dataProcessor, calculator) {
    super(dataProcessor, calculator);
    
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 30 // 30 minutes
    });
    
    this.memoizedOptimization = memoize(
      this.optimizeAllocation.bind(this),
      { maxAge: 1000 * 60 * 15 } // 15 minutes
    );
  }

  optimizeAllocation(constraints) {
    const cacheKey = this.generateCacheKey('optimize', constraints);
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isStale(cached, constraints)) {
      return cached;
    }
    
    const result = this.memoizedOptimization(constraints);
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

## Performance Benchmarks

### Target Metrics
- Budget creation: < 100ms
- Allocation optimization (50 tools): < 1s
- Phased rollout planning: < 500ms
- Variance calculation: < 200ms
- Forecast generation: < 300ms

## Future Enhancements

### Version 2.0
- AI-powered budget recommendations
- Predictive budget alerts
- Integration with ERP systems
- Collaborative budgeting workflows
- Real-time budget tracking dashboards

### Version 3.0
- Machine learning optimization
- Automated approval routing
- Multi-currency support
- Advanced scenario planning
- Budget performance analytics