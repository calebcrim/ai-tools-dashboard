# Performance Optimizations for 317+ Tools

## Overview
With 317 tools and extensive metadata per tool, performance optimization is critical. This document outlines strategies to maintain sub-100ms response times and smooth 60fps scrolling.

## Virtual Scrolling Implementation

### 1. React Window Integration
```javascript
import { FixedSizeGrid, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

class VirtualizedToolGrid extends Component {
  constructor(props) {
    super(props);
    this.itemData = createItemData(props.tools, props.view);
    this.cache = new CellMeasurerCache({
      defaultHeight: 320,
      defaultWidth: 380,
      fixedWidth: true
    });
  }
  
  render() {
    const { view } = this.props;
    
    return (
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.floor(width / 400);
          const rowCount = Math.ceil(this.props.tools.length / columnCount);
          
          return (
            <FixedSizeGrid
              height={height}
              width={width}
              columnCount={columnCount}
              columnWidth={width / columnCount}
              rowCount={rowCount}
              rowHeight={view === 'executive' ? 380 : 420}
              itemData={this.itemData}
              overscanRowCount={2}
              overscanColumnCount={1}
            >
              {this.renderCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    );
  }
  
  renderCell = ({ columnIndex, rowIndex, style, data }) => {
    const index = rowIndex * data.columnCount + columnIndex;
    if (index >= data.tools.length) return null;
    
    const tool = data.tools[index];
    
    return (
      <div style={style}>
        <div className="virtualized-cell">
          {data.view === 'executive' ? (
            <ExecutiveToolCard tool={tool} />
          ) : (
            <TechnicalToolCard tool={tool} />
          )}
        </div>
      </div>
    );
  };
}
```

### 2. Intersection Observer for Lazy Loading
```javascript
class LazyLoadContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      hasLoaded: false
    };
    this.containerRef = React.createRef();
  }
  
  componentDidMount() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setState({ isVisible: true, hasLoaded: true });
            // Once loaded, stop observing
            if (this.props.loadOnce) {
              this.observer.unobserve(entry.target);
            }
          } else if (!this.props.loadOnce) {
            this.setState({ isVisible: false });
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );
    
    if (this.containerRef.current) {
      this.observer.observe(this.containerRef.current);
    }
  }
  
  componentWillUnmount() {
    if (this.observer && this.containerRef.current) {
      this.observer.unobserve(this.containerRef.current);
    }
  }
  
  render() {
    const { isVisible, hasLoaded } = this.state;
    const shouldRender = isVisible || (this.props.loadOnce && hasLoaded);
    
    return (
      <div ref={this.containerRef} className="lazy-load-container">
        {shouldRender ? (
          this.props.children
        ) : (
          <div className="placeholder" style={{ height: this.props.height }} />
        )}
      </div>
    );
  }
}
```

## Data Processing Optimizations

### 1. Web Worker for Heavy Computations
```javascript
// data-processing.worker.js
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'PROCESS_TOOLS':
      const processed = await processTools(payload);
      self.postMessage({ type: 'TOOLS_PROCESSED', data: processed });
      break;
      
    case 'CALCULATE_METRICS':
      const metrics = calculateMetrics(payload);
      self.postMessage({ type: 'METRICS_CALCULATED', data: metrics });
      break;
      
    case 'FILTER_TOOLS':
      const filtered = filterTools(payload.tools, payload.filters);
      self.postMessage({ type: 'TOOLS_FILTERED', data: filtered });
      break;
      
    case 'BUILD_SEARCH_INDEX':
      const index = buildSearchIndex(payload);
      self.postMessage({ type: 'SEARCH_INDEX_BUILT', data: index });
      break;
  }
});

function processTools(tools) {
  return tools.map(tool => ({
    ...tool,
    // Parse features
    features: tool.feature_breakdown ? 
      tool.feature_breakdown.split(',').map(f => f.trim()) : [],
    
    // Calculate derived fields
    roi_score: calculateROI(tool),
    risk_level: assessRisk(tool),
    implementation_time: estimateImplementationTime(tool),
    
    // Parse pros/cons
    pros_cons: parseProsConsLimitations(tool.pros_cons_limitations),
    
    // Extract pricing info
    pricing_info: extractPricingInfo(tool.pricing_model),
    
    // Assess integration level
    integration_score: assessIntegrationScore(tool.integration_potential)
  }));
}

function calculateMetrics(tools) {
  // Perform expensive calculations in worker
  const metrics = {
    total: tools.length,
    byCategory: groupBy(tools, 'category'),
    avgImpactScore: average(tools.map(t => t.business_impact_score)),
    highImpact: tools.filter(t => t.business_impact_score >= 80).length,
    quickWins: tools.filter(t => 
      t.business_impact_score >= 70 && t.complexity_score <= 2
    ).length,
    complexityDistribution: getDistribution(tools, 'complexity_score'),
    priceRanges: categorizePriceRanges(tools)
  };
  
  return metrics;
}
```

### 2. Worker Manager Class
```javascript
class WorkerManager {
  constructor() {
    this.worker = new Worker('/workers/data-processing.worker.js');
    this.pendingJobs = new Map();
    this.jobId = 0;
    
    this.worker.addEventListener('message', this.handleWorkerMessage);
  }
  
  async processInWorker(type, payload) {
    return new Promise((resolve, reject) => {
      const id = ++this.jobId;
      
      this.pendingJobs.set(id, { resolve, reject });
      
      this.worker.postMessage({
        id,
        type,
        payload
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingJobs.has(id)) {
          this.pendingJobs.delete(id);
          reject(new Error('Worker timeout'));
        }
      }, 30000);
    });
  }
  
  handleWorkerMessage = (event) => {
    const { id, type, data, error } = event.data;
    
    const job = this.pendingJobs.get(id);
    if (job) {
      this.pendingJobs.delete(id);
      
      if (error) {
        job.reject(error);
      } else {
        job.resolve(data);
      }
    }
  };
  
  terminate() {
    this.worker.terminate();
  }
}
```

## Memory Management

### 1. Tool Data Pagination
```javascript
class PaginatedDataManager {
  constructor(pageSize = 50) {
    this.pageSize = pageSize;
    this.pages = new Map();
    this.currentPage = 0;
    this.totalTools = 0;
  }
  
  async loadPage(pageNumber) {
    // Check if page is already loaded
    if (this.pages.has(pageNumber)) {
      return this.pages.get(pageNumber);
    }
    
    // Load page data
    const start = pageNumber * this.pageSize;
    const end = start + this.pageSize;
    
    const pageData = await this.fetchPageData(start, end);
    
    // Store in memory with LRU eviction
    this.storePage(pageNumber, pageData);
    
    return pageData;
  }
  
  storePage(pageNumber, data) {
    // Implement LRU cache - keep only 10 pages in memory
    if (this.pages.size >= 10) {
      const oldestPage = this.findOldestPage();
      this.pages.delete(oldestPage);
    }
    
    this.pages.set(pageNumber, {
      data,
      timestamp: Date.now()
    });
  }
  
  preloadAdjacentPages(currentPage) {
    // Preload next and previous pages
    const pagesToPreload = [
      currentPage - 1,
      currentPage + 1,
      currentPage + 2
    ].filter(p => p >= 0 && p < this.totalPages);
    
    pagesToPreload.forEach(page => {
      if (!this.pages.has(page)) {
        this.loadPage(page); // Don't await, load in background
      }
    });
  }
}
```

### 2. Image and Asset Optimization
```javascript
class AssetLoader {
  constructor() {
    this.imageCache = new Map();
    this.loadingImages = new Set();
  }
  
  async loadImage(src, priority = 'low') {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }
    
    if (this.loadingImages.has(src)) {
      // Wait for existing load
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.imageCache.has(src)) {
            clearInterval(checkInterval);
            resolve(this.imageCache.get(src));
          }
        }, 50);
      });
    }
    
    this.loadingImages.add(src);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (priority === 'high') {
        img.loading = 'eager';
      } else {
        img.loading = 'lazy';
      }
      
      img.onload = () => {
        this.imageCache.set(src, img);
        this.loadingImages.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingImages.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  preloadImages(urls) {
    urls.forEach(url => this.loadImage(url, 'low'));
  }
}
```

## Rendering Optimizations

### 1. React.memo and useMemo
```javascript
const ExecutiveToolCard = React.memo(({ tool }) => {
  // Memoize expensive calculations
  const roiData = useMemo(() => calculateROI(tool), [tool]);
  const riskAssessment = useMemo(() => assessRisk(tool), [tool]);
  
  // Memoize parsed data
  const features = useMemo(() => 
    tool.feature_breakdown?.split(',').map(f => f.trim()) || [],
    [tool.feature_breakdown]
  );
  
  return (
    <div className="executive-card">
      {/* Card content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.tool.id === nextProps.tool.id &&
    prevProps.tool.business_impact_score === nextProps.tool.business_impact_score &&
    prevProps.tool.complexity_score === nextProps.tool.complexity_score
  );
});
```

### 2. Debounced Updates
```javascript
class DebouncedUpdater {
  constructor(updateFn, delay = 300) {
    this.updateFn = updateFn;
    this.delay = delay;
    this.timeoutId = null;
    this.pendingUpdate = null;
  }
  
  update(data) {
    this.pendingUpdate = data;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.delay);
  }
  
  flush() {
    if (this.pendingUpdate !== null) {
      this.updateFn(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingUpdate = null;
  }
}

// Usage
const searchUpdater = new DebouncedUpdater((query) => {
  performSearch(query);
}, 300);

// In component
handleSearchInput = (event) => {
  const query = event.target.value;
  this.setState({ searchQuery: query });
  searchUpdater.update(query);
};
```

## Bundle Size Optimization

### 1. Code Splitting
```javascript
// Lazy load heavy components
const ExecutiveView = lazy(() => 
  import(/* webpackChunkName: "executive-view" */ './views/ExecutiveView')
);

const TechnicalView = lazy(() => 
  import(/* webpackChunkName: "technical-view" */ './views/TechnicalView')
);

const ChartComponents = lazy(() => 
  import(/* webpackChunkName: "charts" */ './components/Charts')
);

// Component with suspense
function DualView() {
  const [view, setView] = useState('executive');
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {view === 'executive' ? (
        <ExecutiveView />
      ) : (
        <TechnicalView />
      )}
    </Suspense>
  );
}
```

### 2. Tree Shaking Configuration
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        data: {
          test: /unified-tools-data/,
          name: 'tools-data',
          priority: 20
        }
      }
    }
  }
};
```

## Performance Monitoring

### 1. Performance Observer
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      searchTimes: [],
      renderTimes: [],
      filterTimes: []
    };
    
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry);
      }
    });
    
    this.observer.observe({ entryTypes: ['measure'] });
  }
  
  startMeasure(name) {
    performance.mark(`${name}-start`);
  }
  
  endMeasure(name, category) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    if (measure && this.metrics[category]) {
      this.metrics[category].push(measure.duration);
      
      // Keep only last 100 measurements
      if (this.metrics[category].length > 100) {
        this.metrics[category].shift();
      }
    }
  }
  
  getAverageTime(category) {
    const times = this.metrics[category];
    if (times.length === 0) return 0;
    
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  logPerformanceReport() {
    console.group('Performance Report');
    console.log(`Average search time: ${this.getAverageTime('searchTimes').toFixed(2)}ms`);
    console.log(`Average render time: ${this.getAverageTime('renderTimes').toFixed(2)}ms`);
    console.log(`Average filter time: ${this.getAverageTime('filterTimes').toFixed(2)}ms`);
    console.groupEnd();
  }
}
```