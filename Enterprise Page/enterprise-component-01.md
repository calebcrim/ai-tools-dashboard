# Data Processor Component Specification

## Component Overview
The Data Processor is a shared component between Enterprise Report and Financial Analysis pages. It extends the base FinancialDataProcessor to add enterprise-specific features like quadrant analysis and executive metrics calculation.

## Responsibilities
- Load and parse unified-tools-data.js (317 tools)
- Calculate business impact quadrants (Quick Wins, Strategic, etc.)
- Compute executive metrics in real-time
- Provide filtered data access with < 100ms response
- Maintain search indices for instant results
- Cache expensive calculations

## Component Interface

### Public API
```javascript
class EnterpriseDataProcessor extends FinancialDataProcessor {
  // Initialization
  constructor(toolsData: Array<Tool>)
  
  // Core Methods
  initializeEnterpriseFeatures(): void
  refreshMetrics(): ExecutiveMetrics
  
  // Quadrant Analysis
  categorizeToolsByQuadrant(): void
  determineQuadrant(impact: number, complexity: number): Quadrant
  getToolsByQuadrant(quadrant: Quadrant): Array<Tool>
  
  // Search & Filter
  search(query: string): Array<Tool>
  applyFilters(filters: FilterCriteria): Array<Tool>
  getFilterOptions(): FilterOptions
  
  // Executive Metrics
  calculateExecutiveMetrics(): ExecutiveMetrics
  getQuickWinOpportunities(limit?: number): Array<Tool>
  getStrategicInitiatives(): Array<Tool>
  
  // Performance Methods
  buildSearchIndex(): void
  invalidateCache(type?: CacheType): void
  precomputeMetrics(): void
}
```

### Data Structures
```typescript
interface ExecutiveMetrics {
  quickWins: number
  strategic: number
  savings: number
  avgROI: number
  lastUpdated: Date
}

interface FilterCriteria {
  search?: string
  impactRange?: [number, number]
  complexityLevels?: number[]
  categories?: string[]
  priceRange?: [number, number]
  features?: string[]
}

interface Tool {
  // Existing fields from unified-tools-data.js
  id: number
  tool_name: string
  category: string
  business_impact_score: number
  complexity_score: number
  pricing_model: string
  
  // Computed fields
  quadrant?: Quadrant
  estimatedROI?: number
  implementationCost?: number
  matchScore?: number // For search relevance
}

type Quadrant = 'quick-wins' | 'strategic' | 'routine' | 'question-value'
```

## Implementation Details

### Quadrant Analysis Logic
```javascript
determineQuadrant(impact, complexity) {
  // Quick Wins: High impact (80+), Low complexity (1-2)
  if (impact >= 80 && complexity <= 2) {
    return 'quick-wins';
  }
  
  // Strategic: High impact (80+), High complexity (4-5)
  if (impact >= 80 && complexity >= 4) {
    return 'strategic';
  }
  
  // Question Value: Low impact (<50), High complexity (4-5)
  if (impact < 50 && complexity >= 4) {
    return 'question-value';
  }
  
  // Routine: Everything else
  return 'routine';
}
```

### Search Index Implementation
```javascript
buildSearchIndex() {
  this.searchIndex = new Map();
  
  this.tools.forEach(tool => {
    // Index by tool name
    const nameTokens = tool.tool_name.toLowerCase().split(/\s+/);
    nameTokens.forEach(token => {
      if (!this.searchIndex.has(token)) {
        this.searchIndex.set(token, new Set());
      }
      this.searchIndex.get(token).add(tool.id);
    });
    
    // Index by category
    const categoryToken = tool.category.toLowerCase();
    if (!this.searchIndex.has(categoryToken)) {
      this.searchIndex.set(categoryToken, new Set());
    }
    this.searchIndex.get(categoryToken).add(tool.id);
    
    // Index by key features
    if (tool.tags) {
      tool.tags.forEach(tag => {
        const tagToken = tag.toLowerCase();
        if (!this.searchIndex.has(tagToken)) {
          this.searchIndex.set(tagToken, new Set());
        }
        this.searchIndex.get(tagToken).add(tool.id);
      });
    }
  });
}

search(query) {
  if (!query || query.length < 2) return this.tools;
  
  const tokens = query.toLowerCase().split(/\s+/);
  const matchingSets = tokens.map(token => {
    const exact = this.searchIndex.get(token) || new Set();
    const partial = new Set();
    
    // Find partial matches
    for (const [key, ids] of this.searchIndex.entries()) {
      if (key.includes(token)) {
        ids.forEach(id => partial.add(id));
      }
    }
    
    return new Set([...exact, ...partial]);
  });
  
  // Find tools that match all tokens
  const intersection = matchingSets.reduce((a, b) => 
    new Set([...a].filter(x => b.has(x)))
  );
  
  return Array.from(intersection)
    .map(id => this.tools.find(t => t.id === id))
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by relevance (exact matches first)
      const aScore = this.calculateMatchScore(a, tokens);
      const bScore = this.calculateMatchScore(b, tokens);
      return bScore - aScore;
    });
}
```

### Performance Optimizations
```javascript
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
```

### Filter Application
```javascript
applyFilters(filters) {
  let filtered = [...this.tools];
  
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
  
  // Update metrics after filtering
  this.updateFilteredMetrics(filtered);
  
  return filtered;
}
```

## Integration Points

### Shared with Financial Analysis
- Base FinancialDataProcessor class
- TCO calculation methods
- ROI computation algorithms
- Savings opportunity identification

### Used by Components
- ExecutiveMetricsBar: Reads metric values
- FilterPanel: Gets available filter options
- PortfolioGrid: Receives filtered tool lists
- DetailsPanel: Fetches individual tool data

## Testing Strategy

### Unit Tests
```javascript
describe('EnterpriseDataProcessor', () => {
  test('categorizes tools into correct quadrants', () => {
    const processor = new EnterpriseDataProcessor(mockTools);
    
    const quickWins = processor.getToolsByQuadrant('quick-wins');
    expect(quickWins.every(t => 
      t.business_impact_score >= 80 && t.complexity_score <= 2
    )).toBe(true);
  });
  
  test('search returns relevant results quickly', () => {
    const start = performance.now();
    const results = processor.search('analytics');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50); // < 50ms
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool_name.toLowerCase()).toContain('analytics');
  });
  
  test('filters combine correctly', () => {
    const filtered = processor.applyFilters({
      impactRange: [70, 100],
      complexityLevels: [1, 2],
      categories: ['data analytics']
    });
    
    expect(filtered.every(t => 
      t.business_impact_score >= 70 &&
      t.complexity_score <= 2 &&
      t.category === 'data analytics'
    )).toBe(true);
  });
});
```

## Error Handling
```javascript
try {
  const data = await fetch('data/unified-tools-data.js');
  const tools = await data.json();
  
  if (!Array.isArray(tools) || tools.length === 0) {
    throw new Error('Invalid tools data format');
  }
  
  this.processor = new EnterpriseDataProcessor(tools);
} catch (error) {
  console.error('Failed to initialize data processor:', error);
  this.showErrorState('Unable to load AI tools data');
}
```

## Performance Benchmarks
- Initial data processing: < 500ms for 317 tools
- Search response: < 50ms for any query
- Filter application: < 100ms for complex filters
- Metrics calculation: < 200ms for full recalculation
- Memory usage: < 50MB including all caches