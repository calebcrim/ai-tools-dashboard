// analytics-events.js
// Custom event tracking for crimintel.ai

class AnalyticsTracker {
  constructor() {
    this.gtag = window.gtag || function(){};
  }

  // Track tool views
  trackToolView(tool) {
    this.gtag('event', 'view_tool', {
      tool_id: tool.id || tool.tool_name,
      tool_name: tool.tool_name,
      tool_category: tool.category,
      tool_pricing: tool.pricing_model || 'not_specified',
      tool_url: tool.url,
      event_category: 'engagement',
      event_label: tool.tool_name
    });
    
    // Update local storage for user journey
    this.updateViewedTools(tool);
  }

  // Track tool comparisons
  trackComparison(tools) {
    this.gtag('event', 'compare_tools', {
      comparison_count: tools.length,
      tools_compared: tools.map(t => t.tool_name).join(','),
      categories: [...new Set(tools.map(t => t.category))].join(','),
      event_category: 'engagement',
      event_label: `Compared ${tools.length} tools`
    });
    
    // Update comparison count
    const count = parseInt(localStorage.getItem('comparison_count') || '0');
    localStorage.setItem('comparison_count', count + 1);
  }

  // Track search behavior
  trackSearch(query, resultsCount, filters = {}) {
    this.gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
      filters_used: Object.keys(filters).filter(k => filters[k]).join(','),
      filter_values: JSON.stringify(filters),
      event_category: 'search',
      event_label: query
    });
    
    // Update search history
    this.updateSearchHistory(query, resultsCount);
  }

  // Track filter usage
  trackFilterUse(filterType, filterValue, resultsCount) {
    this.gtag('event', 'use_filter', {
      filter_type: filterType,
      filter_value: filterValue,
      results_count: resultsCount,
      event_category: 'filter',
      event_label: `${filterType}: ${filterValue}`
    });
  }

  // Track ROI calculator usage
  trackROICalculation(toolName, savings, implementation_time) {
    this.gtag('event', 'calculate_roi', {
      tool_name: toolName,
      estimated_savings: savings,
      implementation_months: implementation_time,
      event_category: 'conversion',
      event_label: toolName,
      value: savings
    });
  }

  // Track outbound clicks to tool websites
  trackOutboundClick(tool, destination) {
    this.gtag('event', 'click', {
      event_category: 'outbound',
      event_label: tool.tool_name,
      destination_url: destination,
      tool_category: tool.category,
      tool_id: tool.id || tool.tool_name
    });
    
    // Also track as conversion event
    this.gtag('event', 'outbound_click', {
      tool_name: tool.tool_name,
      destination: destination,
      value: 1
    });
  }

  // Track content engagement
  trackContentEngagement(contentType, contentTitle, engagementType) {
    this.gtag('event', 'content_engagement', {
      content_type: contentType, // 'guide', 'comparison', 'case_study', 'best_practices'
      content_title: contentTitle,
      engagement_type: engagementType, // 'read', 'download', 'share'
      event_category: 'content',
      event_label: `${contentType}: ${contentTitle}`
    });
  }

  // Track user preferences
  trackPreferenceSave(preferenceType, value) {
    this.gtag('event', 'save_preference', {
      preference_type: preferenceType,
      preference_value: value,
      user_segment: this.getUserSegment(),
      event_category: 'preference',
      event_label: `${preferenceType}: ${value}`
    });
  }

  // Track mode switches (Executive/Technical/Browse)
  trackModeSwitch(mode) {
    const previousMode = localStorage.getItem('current_mode') || 'browse';
    
    this.gtag('event', 'switch_mode', {
      new_mode: mode,
      previous_mode: previousMode,
      user_segment: this.getUserSegment(),
      event_category: 'ui_interaction',
      event_label: `Mode: ${mode}`
    });
    
    localStorage.setItem('current_mode', mode);
  }

  // Track newsletter signup
  trackNewsletterSignup(email) {
    this.gtag('event', 'sign_up', {
      method: 'newsletter',
      event_category: 'conversion',
      event_label: 'Newsletter Signup'
    });
    
    // Track as conversion
    this.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: 10 // Estimated value of a newsletter signup
    });
  }

  // Track page views with enhanced data
  trackPageView(pagePath, pageTitle) {
    this.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      user_segment: this.getUserSegment(),
      user_type: this.getUserType(),
      page_location: window.location.href
    });
  }

  // Track errors
  trackError(errorType, errorMessage, errorLocation) {
    this.gtag('event', 'exception', {
      description: errorMessage,
      error_type: errorType,
      error_location: errorLocation,
      fatal: false
    });
  }

  // Helper method to determine user segment
  getUserSegment() {
    const viewCount = parseInt(localStorage.getItem('tool_view_count') || '0');
    if (viewCount < 5) return 'new_user';
    if (viewCount < 20) return 'active_user';
    return 'power_user';
  }

  // Helper to determine user type
  getUserType() {
    if (localStorage.getItem('premium_user')) return 'premium_user';
    if (localStorage.getItem('registered_user')) return 'free_user';
    return 'visitor';
  }

  // Helper to update viewed tools in localStorage
  updateViewedTools(tool) {
    const viewedTools = JSON.parse(localStorage.getItem('viewed_tools') || '[]');
    const toolEntry = {
      id: tool.id || tool.tool_name,
      tool_name: tool.tool_name,
      category: tool.category,
      timestamp: new Date().toISOString()
    };
    
    viewedTools.push(toolEntry);
    
    // Keep only last 100 views
    if (viewedTools.length > 100) {
      viewedTools.shift();
    }
    
    localStorage.setItem('viewed_tools', JSON.stringify(viewedTools));
    
    // Update view count
    const count = parseInt(localStorage.getItem('tool_view_count') || '0');
    localStorage.setItem('tool_view_count', count + 1);
  }

  // Helper to update search history
  updateSearchHistory(query, resultsCount) {
    const searches = JSON.parse(localStorage.getItem('search_history') || '[]');
    searches.push({
      query: query,
      results: resultsCount,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 searches
    if (searches.length > 50) {
      searches.shift();
    }
    
    localStorage.setItem('search_history', JSON.stringify(searches));
    
    // Update search count
    const count = parseInt(localStorage.getItem('search_count') || '0');
    localStorage.setItem('search_count', count + 1);
  }

  // Get preferred categories based on viewing history
  getPreferredCategories() {
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
}

// Export singleton instance
const analyticsTracker = new AnalyticsTracker();