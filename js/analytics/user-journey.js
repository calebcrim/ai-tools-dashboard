// user-journey.js
// User journey tracking for crimintel.ai

class UserJourneyTracker {
  constructor() {
    this.journey = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      touchpoints: [],
      toolsViewed: [],
      filtersUsed: {},
      searchQueries: [],
      comparisons: []
    };
    
    // Initialize session
    this.initializeSession();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeSession() {
    // Update visit count
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
    localStorage.setItem('visit_count', visitCount + 1);
    
    // Store session start
    sessionStorage.setItem('session_id', this.journey.sessionId);
    sessionStorage.setItem('session_start', this.journey.startTime);
    
    // Restore previous session data if exists
    const previousJourney = sessionStorage.getItem('journey_data');
    if (previousJourney) {
      try {
        const parsed = JSON.parse(previousJourney);
        if (parsed.sessionId === this.journey.sessionId) {
          this.journey = parsed;
        }
      } catch (e) {
        console.error('Error restoring journey data:', e);
      }
    }
  }

  saveJourneyData() {
    try {
      sessionStorage.setItem('journey_data', JSON.stringify(this.journey));
    } catch (e) {
      console.error('Error saving journey data:', e);
    }
  }

  addTouchpoint(action, details) {
    const touchpoint = {
      timestamp: Date.now(),
      action: action,
      details: details,
      timeFromStart: Date.now() - this.journey.startTime,
      url: window.location.pathname
    };
    
    this.journey.touchpoints.push(touchpoint);
    this.saveJourneyData();
    
    // Send to GA4 every 5 touchpoints
    if (this.journey.touchpoints.length % 5 === 0) {
      this.sendJourneyUpdate();
    }
  }

  trackToolView(tool) {
    // Calculate dwell time on previous tool if any
    if (this.journey.toolsViewed.length > 0) {
      const lastTool = this.journey.toolsViewed[this.journey.toolsViewed.length - 1];
      if (!lastTool.dwellTime) {
        lastTool.dwellTime = Date.now() - lastTool.viewTime;
      }
    }
    
    const toolView = {
      toolId: tool.id || tool.tool_name,
      toolName: tool.tool_name,
      category: tool.category,
      viewTime: Date.now(),
      dwellTime: 0
    };
    
    this.journey.toolsViewed.push(toolView);
    
    this.addTouchpoint('tool_view', {
      toolName: tool.tool_name,
      category: tool.category,
      toolId: tool.id
    });
  }

  trackFilterChange(filterType, value) {
    this.journey.filtersUsed[filterType] = value;
    this.addTouchpoint('filter_change', {
      filterType,
      value,
      activeFilters: Object.keys(this.journey.filtersUsed).length
    });
  }

  trackSearch(query, results) {
    const searchEntry = {
      query,
      resultsCount: results,
      timestamp: Date.now()
    };
    
    this.journey.searchQueries.push(searchEntry);
    
    this.addTouchpoint('search', {
      query,
      resultsCount: results,
      searchNumber: this.journey.searchQueries.length
    });
  }

  trackComparison(tools) {
    const comparisonEntry = {
      tools: tools.map(t => ({
        id: t.id || t.tool_name,
        name: t.tool_name,
        category: t.category
      })),
      timestamp: Date.now()
    };
    
    this.journey.comparisons.push(comparisonEntry);
    
    this.addTouchpoint('comparison', {
      toolCount: tools.length,
      toolNames: tools.map(t => t.tool_name),
      categories: [...new Set(tools.map(t => t.category))]
    });
  }

  trackOutboundClick(tool, url) {
    this.addTouchpoint('outbound_click', {
      toolName: tool.tool_name,
      toolId: tool.id || tool.tool_name,
      destination: url,
      timeToConversion: Date.now() - this.journey.startTime
    });
    
    // Mark as potential conversion
    this.journey.hasConversion = true;
  }

  trackModeSwitch(mode) {
    this.addTouchpoint('mode_switch', {
      newMode: mode,
      toolsViewedBeforeSwitch: this.journey.toolsViewed.length
    });
  }

  sendJourneyUpdate() {
    if (window.gtag) {
      const metrics = this.getEngagementMetrics();
      
      window.gtag('event', 'user_journey_update', {
        session_id: this.journey.sessionId,
        touchpoint_count: this.journey.touchpoints.length,
        tools_viewed_count: this.journey.toolsViewed.length,
        unique_categories_viewed: this.getUniqueCategories().length,
        filters_used_count: Object.keys(this.journey.filtersUsed).length,
        searches_performed: this.journey.searchQueries.length,
        comparisons_made: this.journey.comparisons.length,
        session_duration: metrics.sessionDuration,
        engagement_score: metrics.engagementScore,
        has_conversion: this.journey.hasConversion || false,
        last_action: this.journey.touchpoints[this.journey.touchpoints.length - 1]
      });
    }
  }

  // Calculate engagement metrics
  getEngagementMetrics() {
    const totalDwellTime = this.journey.toolsViewed.reduce((sum, tool) => {
      const dwellTime = tool.dwellTime || (Date.now() - tool.viewTime);
      return sum + dwellTime;
    }, 0);
    
    const avgDwellTime = this.journey.toolsViewed.length > 0 ? 
      totalDwellTime / this.journey.toolsViewed.length : 0;
    
    return {
      sessionDuration: Date.now() - this.journey.startTime,
      touchpointCount: this.journey.touchpoints.length,
      toolsViewed: this.journey.toolsViewed.length,
      uniqueToolsViewed: new Set(this.journey.toolsViewed.map(t => t.toolId)).size,
      searchesPerformed: this.journey.searchQueries.length,
      filtersUsed: Object.keys(this.journey.filtersUsed).length,
      comparisons: this.journey.comparisons.length,
      averageDwellTime: avgDwellTime,
      engagementScore: this.calculateEngagementScore(),
      conversionProbability: this.calculateConversionProbability()
    };
  }

  calculateEngagementScore() {
    // Weighted engagement scoring
    const weights = {
      toolView: 1,
      search: 2,
      filter: 1.5,
      comparison: 3,
      outboundClick: 5,
      dwellTime: 0.001 // per second
    };
    
    let score = 0;
    
    // Score touchpoints
    this.journey.touchpoints.forEach(tp => {
      switch(tp.action) {
        case 'tool_view':
          score += weights.toolView;
          break;
        case 'search':
          score += weights.search;
          break;
        case 'filter_change':
          score += weights.filter;
          break;
        case 'comparison':
          score += weights.comparison;
          break;
        case 'outbound_click':
          score += weights.outboundClick;
          break;
      }
    });
    
    // Add dwell time score
    const totalDwellSeconds = this.journey.toolsViewed.reduce((sum, tool) => {
      const dwellTime = tool.dwellTime || (Date.now() - tool.viewTime);
      return sum + (dwellTime / 1000);
    }, 0);
    
    score += totalDwellSeconds * weights.dwellTime;
    
    return Math.round(score);
  }

  calculateConversionProbability() {
    // Simple conversion probability based on engagement
    const factors = {
      hasComparison: this.journey.comparisons.length > 0 ? 0.3 : 0,
      multipleSearches: this.journey.searchQueries.length > 2 ? 0.2 : 0,
      highEngagement: this.journey.toolsViewed.length > 5 ? 0.2 : 0,
      usedFilters: Object.keys(this.journey.filtersUsed).length > 0 ? 0.1 : 0,
      longSession: (Date.now() - this.journey.startTime) > 300000 ? 0.2 : 0 // 5+ minutes
    };
    
    return Object.values(factors).reduce((a, b) => a + b, 0);
  }

  getUniqueCategories() {
    const categories = new Set();
    this.journey.toolsViewed.forEach(tool => {
      categories.add(tool.category);
    });
    return Array.from(categories);
  }

  getTopCategories() {
    const categoryCounts = {};
    this.journey.toolsViewed.forEach(tool => {
      categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }

  // Call this on page unload
  endSession() {
    // Update dwell time for last viewed tool
    if (this.journey.toolsViewed.length > 0) {
      const lastTool = this.journey.toolsViewed[this.journey.toolsViewed.length - 1];
      if (!lastTool.dwellTime) {
        lastTool.dwellTime = Date.now() - lastTool.viewTime;
      }
    }
    
    const metrics = this.getEngagementMetrics();
    
    if (window.gtag) {
      window.gtag('event', 'session_end', {
        session_id: this.journey.sessionId,
        total_duration: metrics.sessionDuration,
        tools_viewed: metrics.toolsViewed,
        unique_tools_viewed: metrics.uniqueToolsViewed,
        engagement_score: metrics.engagementScore,
        conversion_probability: metrics.conversionProbability,
        conversions: this.journey.touchpoints.filter(t => 
          t.action === 'outbound_click' || 
          t.action === 'contact_vendor'
        ).length,
        top_categories: this.getTopCategories().map(c => c.category).join(','),
        final_page: window.location.pathname
      });
    }
    
    // Store journey summary for future analysis
    this.storeJourneySummary(metrics);
  }

  storeJourneySummary(metrics) {
    const journeySummary = {
      sessionId: this.journey.sessionId,
      date: new Date().toISOString(),
      metrics: metrics,
      topCategories: this.getTopCategories(),
      hasConversion: this.journey.hasConversion || false,
      touchpointSummary: this.getTouchpointSummary()
    };
    
    const journeyHistory = JSON.parse(localStorage.getItem('journey_history') || '[]');
    journeyHistory.push(journeySummary);
    
    // Keep only last 20 sessions
    if (journeyHistory.length > 20) {
      journeyHistory.shift();
    }
    
    localStorage.setItem('journey_history', JSON.stringify(journeyHistory));
  }

  getTouchpointSummary() {
    const summary = {};
    this.journey.touchpoints.forEach(tp => {
      summary[tp.action] = (summary[tp.action] || 0) + 1;
    });
    return summary;
  }
}

// Initialize journey tracker
let journeyTracker;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    journeyTracker = new UserJourneyTracker();
  });
} else {
  journeyTracker = new UserJourneyTracker();
}

// Set up page unload tracking
window.addEventListener('beforeunload', () => {
  if (journeyTracker) {
    journeyTracker.endSession();
  }
});

// Also track on visibility change (mobile background)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && journeyTracker) {
    journeyTracker.sendJourneyUpdate();
  }
});