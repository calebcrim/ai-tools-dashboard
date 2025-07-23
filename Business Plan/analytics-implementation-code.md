# Analytics Implementation for AI Tools Hub

## Google Analytics 4 Setup

### 1. Base Implementation

```javascript
// analytics-config.js
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 ID

// Initialize Google Analytics
const initializeAnalytics = () => {
  // Add Google tag (gtag.js)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll send custom page views
  });
  
  return gtag;
};
```

### 2. Custom Event Tracking

```javascript
// analytics-events.js
class AnalyticsTracker {
  constructor() {
    this.gtag = window.gtag || function(){};
  }

  // Track tool views
  trackToolView(tool) {
    this.gtag('event', 'view_tool', {
      tool_id: tool.id,
      tool_name: tool.tool_name,
      tool_category: tool.category,
      tool_pricing: tool.pricing_model,
      tool_rating: tool.rating || 'not_rated'
    });
  }

  // Track tool comparisons
  trackComparison(tools) {
    this.gtag('event', 'compare_tools', {
      comparison_count: tools.length,
      tools_compared: tools.map(t => t.tool_name).join(','),
      categories: [...new Set(tools.map(t => t.category))].join(',')
    });
  }

  // Track search behavior
  trackSearch(query, resultsCount, filters) {
    this.gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
      filters_used: Object.keys(filters).join(','),
      filter_values: JSON.stringify(filters)
    });
  }

  // Track filter usage
  trackFilterUse(filterType, filterValue, resultsCount) {
    this.gtag('event', 'use_filter', {
      filter_type: filterType,
      filter_value: filterValue,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Track ROI calculator usage
  trackROICalculation(toolName, savings, implementation_time) {
    this.gtag('event', 'calculate_roi', {
      tool_name: toolName,
      estimated_savings: savings,
      implementation_months: implementation_time,
      calculation_date: new Date().toISOString()
    });
  }

  // Track outbound clicks to tool websites
  trackOutboundClick(tool, destination) {
    this.gtag('event', 'click', {
      event_category: 'outbound',
      event_label: tool.tool_name,
      destination_url: destination,
      tool_category: tool.category
    });
  }

  // Track content engagement
  trackContentEngagement(contentType, contentTitle, engagementType) {
    this.gtag('event', 'content_engagement', {
      content_type: contentType, // 'guide', 'comparison', 'case_study'
      content_title: contentTitle,
      engagement_type: engagementType, // 'read', 'download', 'share'
      engagement_time: new Date().toISOString()
    });
  }

  // Track user preferences
  trackPreferenceSave(preferenceType, value) {
    this.gtag('event', 'save_preference', {
      preference_type: preferenceType,
      preference_value: value,
      user_segment: this.getUserSegment()
    });
  }

  // Helper method to determine user segment
  getUserSegment() {
    const viewCount = parseInt(localStorage.getItem('tool_view_count') || '0');
    if (viewCount < 5) return 'new_user';
    if (viewCount < 20) return 'active_user';
    return 'power_user';
  }
}

// Export singleton instance
const analyticsTracker = new AnalyticsTracker();
```

### 3. Enhanced User Journey Tracking

```javascript
// user-journey-tracker.js
class UserJourneyTracker {
  constructor() {
    this.journey = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      touchpoints: [],
      toolsViewed: [],
      filtersUsed: {},
      searchQueries: []
    };
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addTouchpoint(action, details) {
    const touchpoint = {
      timestamp: Date.now(),
      action: action,
      details: details,
      timeFromStart: Date.now() - this.journey.startTime
    };
    
    this.journey.touchpoints.push(touchpoint);
    
    // Send to GA4 every 5 touchpoints
    if (this.journey.touchpoints.length % 5 === 0) {
      this.sendJourneyUpdate();
    }
  }

  trackToolView(tool) {
    this.journey.toolsViewed.push({
      toolId: tool.id,
      toolName: tool.tool_name,
      viewTime: Date.now(),
      dwellTime: 0 // Will be updated on next action
    });
    
    this.addTouchpoint('tool_view', {
      toolName: tool.tool_name,
      category: tool.category
    });
  }

  trackFilterChange(filterType, value) {
    this.journey.filtersUsed[filterType] = value;
    this.addTouchpoint('filter_change', {
      filterType,
      value
    });
  }

  trackSearch(query, results) {
    this.journey.searchQueries.push({
      query,
      resultsCount: results,
      timestamp: Date.now()
    });
    
    this.addTouchpoint('search', {
      query,
      resultsCount: results
    });
  }

  sendJourneyUpdate() {
    gtag('event', 'user_journey_update', {
      session_id: this.journey.sessionId,
      touchpoint_count: this.journey.touchpoints.length,
      tools_viewed_count: this.journey.toolsViewed.length,
      filters_used_count: Object.keys(this.journey.filtersUsed).length,
      session_duration: Date.now() - this.journey.startTime,
      last_action: this.journey.touchpoints[this.journey.touchpoints.length - 1]
    });
  }

  // Call this on page unload
  endSession() {
    this.sendJourneyUpdate();
    gtag('event', 'session_end', {
      session_id: this.journey.sessionId,
      total_duration: Date.now() - this.journey.startTime,
      tools_viewed: this.journey.toolsViewed.length,
      conversions: this.journey.touchpoints.filter(t => 
        t.action === 'outbound_click' || 
        t.action === 'contact_vendor'
      ).length
    });
  }
}

// Initialize journey tracker
const journeyTracker = new UserJourneyTracker();

// Set up page unload tracking
window.addEventListener('beforeunload', () => {
  journeyTracker.endSession();
});
```

### 4. Custom Dimensions Setup

```javascript
// custom-dimensions.js
const setupCustomDimensions = () => {
  // User Type Dimension
  const userType = determineUserType();
  gtag('set', {
    'user_type': userType, // 'visitor', 'free_user', 'premium_user'
  });

  // Industry Dimension (if known)
  const userIndustry = getUserIndustry();
  if (userIndustry) {
    gtag('set', {
      'user_industry': userIndustry
    });
  }

  // Preferred Categories
  const preferredCategories = getPreferredCategories();
  gtag('set', {
    'preferred_categories': preferredCategories.join(',')
  });

  // Engagement Level
  const engagementLevel = calculateEngagementLevel();
  gtag('set', {
    'engagement_level': engagementLevel // 'low', 'medium', 'high'
  });
};

function determineUserType() {
  // Logic to determine user type
  if (localStorage.getItem('premium_user')) return 'premium_user';
  if (localStorage.getItem('registered_user')) return 'free_user';
  return 'visitor';
}

function getUserIndustry() {
  return localStorage.getItem('user_industry') || null;
}

function getPreferredCategories() {
  const viewedTools = JSON.parse(localStorage.getItem('viewed_tools') || '[]');
  const categoryCounts = {};
  
  viewedTools.forEach(tool => {
    categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
  });
  
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}

function calculateEngagementLevel() {
  const metrics = {
    toolsViewed: JSON.parse(localStorage.getItem('viewed_tools') || '[]').length,
    comparisons: parseInt(localStorage.getItem('comparison_count') || '0'),
    searchCount: parseInt(localStorage.getItem('search_count') || '0'),
    returnVisits: parseInt(localStorage.getItem('visit_count') || '1')
  };
  
  const score = 
    metrics.toolsViewed * 1 +
    metrics.comparisons * 3 +
    metrics.searchCount * 2 +
    metrics.returnVisits * 5;
  
  if (score > 50) return 'high';
  if (score > 20) return 'medium';
  return 'low';
}
```

### 5. Implementation in Your Existing Code

```javascript
// Add to your main app initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Analytics
  initializeAnalytics();
  setupCustomDimensions();
  
  // Track page views with enhanced data
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    user_segment: analyticsTracker.getUserSegment()
  });
  
  // Set up tool card click tracking
  document.addEventListener('click', (e) => {
    const toolCard = e.target.closest('.tool-card');
    if (toolCard) {
      const toolData = getToolDataFromCard(toolCard);
      analyticsTracker.trackToolView(toolData);
      journeyTracker.trackToolView(toolData);
    }
    
    // Track outbound links
    if (e.target.matches('a[href^="http"]:not([href*="crimintel.ai"])')) {
      const toolData = getToolDataFromCard(e.target.closest('.tool-card'));
      analyticsTracker.trackOutboundClick(toolData, e.target.href);
    }
  });
  
  // Track search
  const searchInput = document.querySelector('#search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const results = performSearch(e.target.value);
        analyticsTracker.trackSearch(e.target.value, results.length, getActiveFilters());
        journeyTracker.trackSearch(e.target.value, results.length);
      }, 500);
    });
  }
  
  // Track filter changes
  document.querySelectorAll('.filter-checkbox, .filter-select').forEach(filter => {
    filter.addEventListener('change', (e) => {
      const filterType = e.target.dataset.filterType;
      const filterValue = e.target.type === 'checkbox' 
        ? (e.target.checked ? e.target.value : null)
        : e.target.value;
      
      analyticsTracker.trackFilterUse(filterType, filterValue, getFilteredResults().length);
      journeyTracker.trackFilterChange(filterType, filterValue);
    });
  });
});
```

### 6. Analytics Dashboard Component

```javascript
// analytics-dashboard.js
class AnalyticsDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = {
      realTime: {},
      daily: {},
      trends: {}
    };
  }

  async fetchAnalyticsData() {
    // In production, this would fetch from GA4 API
    // For now, using local storage data
    return {
      toolViews: this.getToolViewsData(),
      searchQueries: this.getSearchData(),
      userFlow: this.getUserFlowData(),
      conversions: this.getConversionData()
    };
  }

  renderDashboard() {
    const data = this.fetchAnalyticsData();
    
    this.container.innerHTML = `
      <div class="analytics-dashboard">
        <h2>Analytics Overview</h2>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Tool Views Today</h3>
            <div class="metric-value">${data.toolViews.today}</div>
            <div class="metric-change ${data.toolViews.change >= 0 ? 'positive' : 'negative'}">
              ${data.toolViews.change}% from yesterday
            </div>
          </div>
          
          <div class="metric-card">
            <h3>Active Users</h3>
            <div class="metric-value">${data.realTime.activeUsers || 0}</div>
            <div class="metric-subtitle">Right now</div>
          </div>
          
          <div class="metric-card">
            <h3>Popular Searches</h3>
            <ul class="search-list">
              ${data.searchQueries.top.map(query => 
                `<li>${query.term} (${query.count})</li>`
              ).join('')}
            </ul>
          </div>
          
          <div class="metric-card">
            <h3>Conversion Rate</h3>
            <div class="metric-value">${data.conversions.rate}%</div>
            <div class="metric-subtitle">Tool clicks to vendor site</div>
          </div>
        </div>
        
        <div class="charts-section">
          <div id="tool-views-chart" class="chart-container"></div>
          <div id="category-breakdown-chart" class="chart-container"></div>
        </div>
      </div>
    `;
    
    this.renderCharts(data);
  }

  renderCharts(data) {
    // Tool views over time
    this.renderTimeSeriesChart('tool-views-chart', data.toolViews.timeSeries);
    
    // Category breakdown
    this.renderPieChart('category-breakdown-chart', data.toolViews.byCategory);
  }
  
  // Helper methods for data processing
  getToolViewsData() {
    const viewedTools = JSON.parse(localStorage.getItem('viewed_tools') || '[]');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todayViews = viewedTools.filter(t => 
      new Date(t.timestamp).toDateString() === today
    ).length;
    
    const yesterdayViews = viewedTools.filter(t => 
      new Date(t.timestamp).toDateString() === yesterday
    ).length;
    
    return {
      today: todayViews,
      change: yesterdayViews > 0 
        ? Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100)
        : 100,
      timeSeries: this.generateTimeSeries(viewedTools),
      byCategory: this.groupByCategory(viewedTools)
    };
  }
  
  getSearchData() {
    const searches = JSON.parse(localStorage.getItem('search_history') || '[]');
    const searchCounts = {};
    
    searches.forEach(search => {
      searchCounts[search.query] = (searchCounts[search.query] || 0) + 1;
    });
    
    const topSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));
    
    return {
      total: searches.length,
      unique: Object.keys(searchCounts).length,
      top: topSearches
    };
  }
}

// Initialize analytics dashboard if on analytics page
if (document.getElementById('analytics-container')) {
  const dashboard = new AnalyticsDashboard('analytics-container');
  dashboard.renderDashboard();
  
  // Refresh every 30 seconds
  setInterval(() => dashboard.renderDashboard(), 30000);
}
```

### 7. Privacy-Compliant Implementation

```javascript
// privacy-compliance.js
class PrivacyCompliantAnalytics {
  constructor() {
    this.consentGiven = this.checkConsent();
  }

  checkConsent() {
    return localStorage.getItem('analytics_consent') === 'true';
  }

  requestConsent() {
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-content">
        <p>We use analytics to improve your experience. No personal data is collected.</p>
        <div class="consent-actions">
          <button class="consent-accept">Accept Analytics</button>
          <button class="consent-reject">Reject</button>
          <a href="/privacy" class="consent-learn">Learn More</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    banner.querySelector('.consent-accept').addEventListener('click', () => {
      this.setConsent(true);
      banner.remove();
    });
    
    banner.querySelector('.consent-reject').addEventListener('click', () => {
      this.setConsent(false);
      banner.remove();
    });
  }

  setConsent(granted) {
    this.consentGiven = granted;
    localStorage.setItem('analytics_consent', granted);
    
    if (granted) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
  }

  enableAnalytics() {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }

  disableAnalytics() {
    gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
}

// Initialize privacy-compliant analytics
const privacyAnalytics = new PrivacyCompliantAnalytics();
if (!privacyAnalytics.consentGiven) {
  privacyAnalytics.requestConsent();
}
```

## Implementation Steps

1. Add the analytics initialization code to your main HTML file
2. Import the analytics tracker in your tool display components
3. Add event listeners for user interactions
4. Set up custom dimensions in GA4 interface
5. Create goals and conversions in GA4
6. Set up real-time monitoring dashboard
7. Configure privacy compliance based on your region

## Testing Your Implementation

```javascript
// analytics-test.js
const testAnalytics = () => {
  console.log('Testing Analytics Implementation...');
  
  // Test tool view
  analyticsTracker.trackToolView({
    id: 'test-001',
    tool_name: 'Test Tool',
    category: 'Testing',
    pricing_model: 'Free'
  });
  
  // Test search
  analyticsTracker.trackSearch('AI writing tools', 15, {
    category: 'content',
    pricing: 'free'
  });
  
  // Check if events are firing
  window.dataLayer.forEach(event => {
    console.log('Event:', event);
  });
};

// Run test in console
// testAnalytics();
```