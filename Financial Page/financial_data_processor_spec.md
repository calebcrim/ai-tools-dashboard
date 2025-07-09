# Financial Data Processor Component Specification

## Component Overview
The Financial Data Processor is the foundation of the financial analysis system. It transforms raw tool data into enriched financial metrics, identifies patterns, and maintains high-performance indices for instant access to financial insights.

## Responsibilities
- Parse and normalize pricing data from 317 tools
- Calculate derived financial metrics
- Identify cost redundancies and savings opportunities
- Maintain real-time financial indices
- Provide data access APIs for other components

## Component Interface

### Public API
```javascript
class FinancialDataProcessor {
  // Initialization
  constructor(toolsData: Array<Tool>, options?: ProcessorOptions)
  
  // Core Methods
  init(): Promise<void>
  refresh(): Promise<void>
  
  // Data Access
  getToolFinancials(toolName: string): FinancialMetrics | null
  getTotalPortfolioSpend(): PortfolioSpend
  getToolsByPriceRange(min: number, max: number): Array<ToolFinancial>
  getToolsByCategory(category: string): Array<ToolFinancial>
  getDepartmentSpend(department: string): DepartmentSpend
  
  // Analysis Methods
  findRedundancies(): Array<RedundancyGroup>
  identifySavingsOpportunities(): Array<SavingsOpportunity>
  getQuickWins(criteria?: QuickWinCriteria): Array<Tool>
  calculateConsolidationSavings(toolIds: Array<string>): ConsolidationAnalysis
  
  // Export Methods
  exportFinancialSummary(): FinancialSummary
  exportForCache(): SerializedData
}
```

### Data Structures
```typescript
interface FinancialMetrics {
  toolName: string
  monthlyPrice: number
  annualPrice: number
  pricePerUser: number | null
  pricingTier: 'starter' | 'professional' | 'enterprise'
  priceConfidence: 'exact' | 'estimated' | 'range'
  lastUpdated: Date
  
  costs: {
    subscription: number
    implementation: number
    training: number
    integration: number
    maintenance: number
    opportunity: number
  }
  
  derived: {
    tcoOneYear: number
    tcoThreeYear: number
    tcoPer User: number
    pricePercentile: number
    categoryRank: number
  }
}

interface SavingsOpportunity {
  id: string
  type: 'consolidation' | 'elimination' | 'optimization' | 'negotiation'
  title: string
  description: string
  affectedTools: Array<string>
  currentSpend: number
  projectedSpend: number
  annualSavings: number
  implementationEffort: 'low' | 'medium' | 'high'
  timeToRealize: number // months
  confidence: number // 0-1
  risks: Array<string>
  nextSteps: Array<string>
}
```

## Implementation Details

### Price Extraction Engine
```javascript
class PriceExtractor {
  constructor() {
    this.patterns = [
      // Per user per month
      {
        regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/|per)\s*user\s*(?:\/|per)\s*month/i,
        extractor: (match, teamSize = 50) => ({
          monthly: parseFloat(match[1].replace(/,/g, '')) * teamSize,
          priceType: 'perUser',
          confidence: 'exact'
        })
      },
      
      // Flat monthly
      {
        regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/|per)\s*month/i,
        extractor: (match) => ({
          monthly: parseFloat(match[1].replace(/,/g, '')),
          priceType: 'flat',
          confidence: 'exact'
        })
      },
      
      // Annual pricing
      {
        regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/|per)\s*year/i,
        extractor: (match) => ({
          monthly: parseFloat(match[1].replace(/,/g, '')) / 12,
          priceType: 'annual',
          confidence: 'exact'
        })
      },
      
      // Range pricing
      {
        regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        extractor: (match) => ({
          monthly: (parseFloat(match[1].replace(/,/g, '')) + parseFloat(match[2].replace(/,/g, ''))) / 2,
          priceType: 'range',
          confidence: 'estimated'
        })
      },
      
      // Starting at
      {
        regex: /starting\s+at\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        extractor: (match) => ({
          monthly: parseFloat(match[1].replace(/,/g, '')),
          priceType: 'starting',
          confidence: 'estimated'
        })
      }
    ];
    
    this.enterprisePricing = {
      'ai assistant': 5000,
      'analytics': 3000,
      'content creation': 2000,
      'security': 8000,
      'infrastructure': 10000,
      'default': 5000
    };
  }

  extractPrice(pricingModel, category, additionalContext = {}) {
    if (!pricingModel) return this.estimateFromCategory(category);
    
    // Try each pattern
    for (const pattern of this.patterns) {
      const match = pricingModel.match(pattern.regex);
      if (match) {
        return pattern.extractor(match, additionalContext.teamSize);
      }
    }
    
    // Handle enterprise/custom pricing
    if (/enterprise|custom|contact|quote/i.test(pricingModel)) {
      return {
        monthly: this.enterprisePricing[category] || this.enterprisePricing.default,
        priceType: 'enterprise',
        confidence: 'estimated'
      };
    }
    
    // Free tier
    if (/free/i.test(pricingModel) && !/free\s*trial/i.test(pricingModel)) {
      return {
        monthly: 0,
        priceType: 'free',
        confidence: 'exact'
      };
    }
    
    return this.estimateFromCategory(category);
  }

  estimateFromCategory(category) {
    const categoryAverages = {
      'ai assistant': 500,
      'content creation': 300,
      'analytics': 1000,
      'productivity': 200,
      'communication': 400,
      'security': 1500,
      'development': 800
    };
    
    return {
      monthly: categoryAverages[category] || 500,
      priceType: 'category_estimate',
      confidence: 'estimated'
    };
  }
}
```

### TCO Calculation Logic
```javascript
class TCOCalculator {
  calculateTCO(tool, financialMetrics, options = {}) {
    const {
      years = 3,
      teamSize = 50,
      includeOpportunityCost = true,
      customMultipliers = {}
    } = options;
    
    const multipliers = {
      implementation: {
        1: 0.5,   // 0.5 months effort
        2: 2,     // 2 months effort
        3: 4,     // 4 months effort
        4: 8,     // 8 months effort
        5: 12     // 12 months effort
      },
      training: {
        'low': 20,      // hours per person
        'medium': 60,   
        'high': 120,
        'expert': 200
      },
      integration: {
        'none': 0,
        'basic': 40,    // hours
        'moderate': 160,
        'complex': 400
      },
      ...customMultipliers
    };
    
    const hourlyRate = 150; // Blended rate for calculations
    
    const costs = {
      subscription: this.calculateSubscriptionCost(
        financialMetrics.monthlyPrice,
        tool.pricing_model,
        teamSize,
        years
      ),
      
      implementation: this.calculateImplementationCost(
        tool.complexity_score,
        multipliers.implementation,
        hourlyRate
      ),
      
      training: this.calculateTrainingCost(
        tool.learning_curve,
        teamSize,
        multipliers.training,
        hourlyRate
      ),
      
      integration: this.calculateIntegrationCost(
        tool.integration_potential,
        multipliers.integration,
        hourlyRate
      ),
      
      maintenance: this.calculateMaintenanceCost(
        financialMetrics.monthlyPrice,
        years
      )
    };
    
    if (includeOpportunityCost) {
      costs.opportunity = this.calculateOpportunityCost(tool, costs);
    }
    
    return {
      breakdown: costs,
      total: Object.values(costs).reduce((sum, cost) => sum + cost, 0),
      perUser: Object.values(costs).reduce((sum, cost) => sum + cost, 0) / teamSize,
      perMonth: Object.values(costs).reduce((sum, cost) => sum + cost, 0) / (years * 12)
    };
  }

  calculateSubscriptionCost(monthlyPrice, pricingModel, teamSize, years) {
    let totalCost = 0;
    
    // Check for volume discounts
    const volumeDiscount = this.getVolumeDiscount(teamSize, pricingModel);
    const annualDiscount = this.getAnnualDiscount(pricingModel);
    
    for (let year = 0; year < years; year++) {
      const yearlyBase = monthlyPrice * 12;
      const discounted = yearlyBase * (1 - volumeDiscount) * (1 - annualDiscount);
      
      // Account for typical 5% annual price increases
      const withIncrease = discounted * Math.pow(1.05, year);
      totalCost += withIncrease;
    }
    
    return totalCost;
  }

  getVolumeDiscount(teamSize, pricingModel) {
    if (teamSize < 10) return 0;
    if (teamSize < 50) return 0.1;  // 10% discount
    if (teamSize < 100) return 0.15;
    if (teamSize < 500) return 0.2;
    return 0.25; // 25% for 500+
  }

  getAnnualDiscount(pricingModel) {
    if (/annual.*discount|save.*annual/i.test(pricingModel)) {
      const match = pricingModel.match(/(\d+)%/);
      return match ? parseFloat(match[1]) / 100 : 0.1;
    }
    return 0.1; // Default 10% annual discount
  }
}
```

### Redundancy Detection Algorithm
```javascript
class RedundancyDetector {
  constructor(tools, financialMetrics) {
    this.tools = tools;
    this.financialMetrics = financialMetrics;
    this.featureMap = this.buildFeatureMap();
  }

  findRedundancies() {
    const redundancies = [];
    
    // Method 1: Category-based redundancy
    const categoryGroups = this.groupByCategory();
    categoryGroups.forEach((tools, category) => {
      if (tools.length >= 3) {
        const analysis = this.analyzeCategoryRedundancy(category, tools);
        if (analysis.savingsPotential > 1000) { // $1000/month threshold
          redundancies.push(analysis);
        }
      }
    });
    
    // Method 2: Feature-based redundancy
    const featureOverlaps = this.findFeatureOverlaps();
    featureOverlaps.forEach(overlap => {
      if (overlap.tools.length >= 2 && overlap.savingsPotential > 500) {
        redundancies.push(overlap);
      }
    });
    
    // Method 3: Use case redundancy
    const useCaseOverlaps = this.findUseCaseOverlaps();
    redundancies.push(...useCaseOverlaps);
    
    // Sort by savings potential
    return redundancies.sort((a, b) => b.savingsPotential - a.savingsPotential);
  }

  analyzeCategoryRedundancy(category, tools) {
    const monthlySpends = tools.map(tool => ({
      tool: tool.tool_name,
      spend: this.financialMetrics.get(tool.tool_name)?.monthlyPrice || 0,
      impact: tool.business_impact_score,
      features: this.extractFeatures(tool)
    }));
    
    const totalSpend = monthlySpends.reduce((sum, t) => sum + t.spend, 0);
    const keepTools = this.selectOptimalTools(monthlySpends);
    const keepSpend = keepTools.reduce((sum, t) => sum + t.spend, 0);
    
    return {
      type: 'category_redundancy',
      category,
      currentTools: tools.length,
      currentSpend: totalSpend,
      recommendedTools: keepTools.map(t => t.tool),
      recommendedSpend: keepSpend,
      savingsPotential: totalSpend - keepSpend,
      annualSavings: (totalSpend - keepSpend) * 12,
      confidence: this.calculateConfidence(monthlySpends)
    };
  }

  selectOptimalTools(toolsWithSpend) {
    // Select tools that provide best value
    const sorted = toolsWithSpend.sort((a, b) => {
      const valueA = a.impact / (a.spend || 1);
      const valueB = b.impact / (b.spend || 1);
      return valueB - valueA;
    });
    
    const selected = [];
    const coveredFeatures = new Set();
    
    for (const tool of sorted) {
      const newFeatures = tool.features.filter(f => !coveredFeatures.has(f));
      if (newFeatures.length > 0 || selected.length === 0) {
        selected.push(tool);
        newFeatures.forEach(f => coveredFeatures.add(f));
        
        // Stop if we've covered 90% of features
        if (coveredFeatures.size >= tool.features.length * 0.9) {
          break;
        }
      }
    }
    
    return selected;
  }

  findFeatureOverlaps() {
    const featureTools = new Map();
    
    // Build inverted index of features to tools
    this.tools.forEach(tool => {
      const features = this.extractFeatures(tool);
      features.forEach(feature => {
        if (!featureTools.has(feature)) {
          featureTools.set(feature, []);
        }
        featureTools.get(feature).push(tool);
      });
    });
    
    // Find overlapping features
    const overlaps = [];
    featureTools.forEach((tools, feature) => {
      if (tools.length >= 2) {
        const overlap = this.analyzeFeatureOverlap(feature, tools);
        if (overlap) overlaps.push(overlap);
      }
    });
    
    return overlaps;
  }
}
```

### Performance Optimization
```javascript
class FinancialDataCache {
  constructor() {
    this.indices = {
      byPrice: new BTree(), // B-tree for range queries
      byCategory: new Map(),
      byDepartment: new Map(),
      byImpact: new SortedList()
    };
    
    this.computeCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }

  buildIndices(processedData) {
    console.time('Building financial indices');
    
    processedData.forEach((metrics, toolName) => {
      // Price index (B-tree for efficient range queries)
      this.indices.byPrice.insert(metrics.monthlyPrice, toolName);
      
      // Category index
      const tool = this.getToolByName(toolName);
      if (!this.indices.byCategory.has(tool.category)) {
        this.indices.byCategory.set(tool.category, new Set());
      }
      this.indices.byCategory.get(tool.category).add(toolName);
      
      // Impact index (sorted list for top-N queries)
      this.indices.byImpact.insert({
        score: tool.business_impact_score,
        toolName: toolName
      });
    });
    
    console.timeEnd('Building financial indices');
  }

  getToolsByPriceRange(min, max) {
    const cacheKey = `price_range_${min}_${max}`;
    
    return this.computeCache.get(cacheKey) || 
      this.computeCache.set(cacheKey, 
        this.indices.byPrice.range(min, max)
      );
  }

  invalidateCache(pattern) {
    // Selective cache invalidation
    for (const [key] of this.computeCache.entries()) {
      if (!pattern || key.match(pattern)) {
        this.computeCache.delete(key);
      }
    }
  }
}
```

### Data Validation & Quality
```javascript
class DataQualityValidator {
  validateFinancialData(tool, metrics) {
    const issues = [];
    
    // Price validation
    if (!metrics.monthlyPrice && !metrics.annualPrice) {
      issues.push({
        field: 'pricing',
        issue: 'No pricing information found',
        severity: 'high'
      });
    }
    
    if (metrics.monthlyPrice > 50000) {
      issues.push({
        field: 'monthlyPrice',
        issue: 'Unusually high price detected',
        severity: 'medium',
        value: metrics.monthlyPrice
      });
    }
    
    // TCO validation
    if (metrics.costs.implementation > metrics.costs.subscription * 2) {
      issues.push({
        field: 'implementation',
        issue: 'Implementation cost seems high relative to subscription',
        severity: 'low'
      });
    }
    
    // Completeness check
    const requiredFields = ['pricing_model', 'complexity_score', 'business_impact_score'];
    requiredFields.forEach(field => {
      if (!tool[field]) {
        issues.push({
          field,
          issue: `Missing required field: ${field}`,
          severity: 'medium'
        });
      }
    });
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      completenessScore: this.calculateCompleteness(tool),
      confidenceScore: this.calculateConfidence(metrics)
    };
  }

  calculateCompleteness(tool) {
    const fields = [
      'tool_name', 'category', 'pricing_model', 'complexity_score',
      'business_impact_score', 'time_to_value', 'learning_curve',
      'integration_potential', 'case_studies', 'feature_breakdown'
    ];
    
    const filledFields = fields.filter(field => tool[field] && tool[field] !== '');
    return (filledFields.length / fields.length) * 100;
  }
}
```

## Integration Points

### Input Requirements
- Complete tools dataset (JSON) with pricing and complexity information
- Optional: Historical pricing data for trend analysis
- Optional: Department/team mapping for allocation

### Output Interfaces
```javascript
// For Cost Calculator
processor.getToolFinancials(toolName) // => FinancialMetrics

// For Budget Planner  
processor.getDepartmentSpend(dept) // => DepartmentSpend

// For Scenario Analyzer
processor.getToolsByPriceRange(min, max) // => Array<Tool>

// For Comparison Engine
processor.findRedundancies() // => Array<RedundancyGroup>

// For Export Reports
processor.exportFinancialSummary() // => FinancialSummary
```

## Testing Strategy

### Unit Tests
```javascript
describe('FinancialDataProcessor', () => {
  describe('Price Extraction', () => {
    test('extracts per-user monthly pricing', () => {
      const result = extractor.extractPrice('$10/user/month');
      expect(result.monthly).toBe(500); // 50 users * $10
      expect(result.confidence).toBe('exact');
    });

    test('handles annual pricing', () => {
      const result = extractor.extractPrice('$1200/year');
      expect(result.monthly).toBe(100);
    });

    test('estimates enterprise pricing', () => {
      const result = extractor.extractPrice('Contact us for pricing', 'analytics');
      expect(result.monthly).toBe(3000);
      expect(result.confidence).toBe('estimated');
    });
  });

  describe('Redundancy Detection', () => {
    test('identifies category redundancies', () => {
      const redundancies = detector.findRedundancies();
      expect(redundancies[0].type).toBe('category_redundancy');
      expect(redundancies[0].savingsPotential).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('processes 317 tools in under 100ms', () => {
      const start = performance.now();
      const processor = new FinancialDataProcessor(largeDataset);
      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });
  });
});
```

## Error Handling

### Graceful Degradation
```javascript
class ResilientProcessor extends FinancialDataProcessor {
  async processToolSafely(tool) {
    try {
      return await this.processTool(tool);
    } catch (error) {
      console.error(`Error processing ${tool.tool_name}:`, error);
      
      // Return minimal valid data
      return {
        toolName: tool.tool_name,
        monthlyPrice: 0,
        priceConfidence: 'error',
        error: error.message,
        costs: this.getDefaultCosts()
      };
    }
  }

  getDefaultCosts() {
    return {
      subscription: 0,
      implementation: 0,
      training: 0,
      integration: 0,
      maintenance: 0,
      opportunity: 0
    };
  }
}
```

## Performance Benchmarks

### Target Metrics
- Initial processing: < 100ms for 317 tools
- Price extraction: < 1ms per tool
- Redundancy detection: < 50ms for full portfolio
- Index building: < 20ms
- Memory usage: < 50MB for full dataset
- Cache hit rate: > 80% after warmup

## Future Enhancements

### Version 2.0
- Machine learning for price prediction
- Automated pricing updates via APIs
- Historical trend analysis
- Competitive pricing intelligence
- Dynamic redundancy scoring

### Version 3.0
- Real-time price monitoring
- Predictive cost modeling
- AI-powered consolidation recommendations
- Integration with procurement systems