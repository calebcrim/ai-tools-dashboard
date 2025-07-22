// analytics-init.js
// Main analytics initialization for crimintel.ai

// Load all analytics modules
const loadAnalyticsModules = () => {
  const scripts = [
    '/js/analytics/analytics-config.js',
    '/js/analytics/analytics-events.js',
    '/js/analytics/user-journey.js',
    '/js/analytics/privacy-compliance.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
};

// Initialize analytics when DOM is ready
const initializeAnalyticsSystem = () => {
  // Wait for all modules to load
  setTimeout(() => {
    // Check if user has consented
    if (window.privacyAnalytics && window.privacyAnalytics.consentGiven) {
      // Initialize Google Analytics
      if (window.initializeAnalytics) {
        window.initializeAnalytics();
      }
      
      // Send initial page view
      if (window.analyticsTracker) {
        window.analyticsTracker.trackPageView(
          window.location.pathname,
          document.title
        );
      }
    }
    
    // Set up event listeners for tracking
    setupEventTracking();
  }, 100);
};

// Set up global event tracking
const setupEventTracking = () => {
  // Track tool card clicks
  document.addEventListener('click', (e) => {
    // Tool card click
    const toolCard = e.target.closest('.tool-card');
    if (toolCard && window.analyticsTracker) {
      const toolData = getToolDataFromCard(toolCard);
      if (toolData) {
        window.analyticsTracker.trackToolView(toolData);
        if (window.journeyTracker) {
          window.journeyTracker.trackToolView(toolData);
        }
      }
    }
    
    // Outbound link tracking
    const link = e.target.closest('a');
    if (link && link.href && !link.href.includes(window.location.hostname)) {
      const toolData = getToolDataFromCard(link.closest('.tool-card'));
      if (toolData && window.analyticsTracker) {
        window.analyticsTracker.trackOutboundClick(toolData, link.href);
        if (window.journeyTracker) {
          window.journeyTracker.trackOutboundClick(toolData, link.href);
        }
      }
    }
    
    // Mode switch tracking
    const modeBtn = e.target.closest('.mode-btn');
    if (modeBtn && window.analyticsTracker) {
      const mode = modeBtn.dataset.mode;
      window.analyticsTracker.trackModeSwitch(mode);
      if (window.journeyTracker) {
        window.journeyTracker.trackModeSwitch(mode);
      }
    }
  });
  
  // Track search input
  const searchInputs = document.querySelectorAll('.search-input, #globalSearchInput, #searchInput');
  searchInputs.forEach(input => {
    let searchTimeout;
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (e.target.value.trim() && window.analyticsTracker) {
          // Get search results count (this will need to be implemented based on your search logic)
          const resultsCount = document.querySelectorAll('.tool-card:not([style*="display: none"])').length;
          const filters = getActiveFilters();
          
          window.analyticsTracker.trackSearch(e.target.value, resultsCount, filters);
          if (window.journeyTracker) {
            window.journeyTracker.trackSearch(e.target.value, resultsCount);
          }
        }
      }, 500);
    });
  });
  
  // Track filter changes
  document.addEventListener('change', (e) => {
    if (e.target.matches('.filter-checkbox, .filter-select, input[type="checkbox"][data-filter]')) {
      const filterType = e.target.dataset.filterType || e.target.name || 'unknown';
      const filterValue = e.target.type === 'checkbox' ? 
        (e.target.checked ? e.target.value : null) : 
        e.target.value;
      
      if (window.analyticsTracker) {
        const resultsCount = document.querySelectorAll('.tool-card:not([style*="display: none"])').length;
        window.analyticsTracker.trackFilterUse(filterType, filterValue, resultsCount);
      }
      
      if (window.journeyTracker) {
        window.journeyTracker.trackFilterChange(filterType, filterValue);
      }
    }
  });
  
  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    
    // Newsletter signup
    if (form.matches('[name="newsletter"], .newsletter-form')) {
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && window.analyticsTracker) {
        window.analyticsTracker.trackNewsletterSignup(emailInput.value);
      }
    }
  });
  
  // Track errors
  window.addEventListener('error', (e) => {
    if (window.analyticsTracker) {
      window.analyticsTracker.trackError(
        'javascript_error',
        e.message,
        `${e.filename}:${e.lineno}:${e.colno}`
      );
    }
  });
  
  // Listen for consent changes
  window.addEventListener('consentChanged', (e) => {
    if (e.detail.analytics && !window.analyticsInitialized) {
      if (window.initializeAnalytics) {
        window.initializeAnalytics();
        window.analyticsInitialized = true;
      }
    }
  });
};

// Helper function to extract tool data from card element
const getToolDataFromCard = (cardElement) => {
  if (!cardElement) return null;
  
  // Try to get tool data from data attributes
  const toolId = cardElement.dataset.toolId;
  const toolName = cardElement.dataset.toolName || 
                  cardElement.querySelector('.tool-name, h3, h4')?.textContent?.trim();
  const toolCategory = cardElement.dataset.category || 
                      cardElement.querySelector('.tool-category, .category')?.textContent?.trim();
  
  // If we have the tool name, try to find it in the global tools data
  if (toolName && window.unifiedToolsData) {
    const tool = window.unifiedToolsData.tools.find(t => 
      t.tool_name === toolName || t.id == toolId
    );
    if (tool) return tool;
  }
  
  // Return what we have
  return {
    id: toolId,
    tool_name: toolName,
    category: toolCategory,
    url: cardElement.querySelector('a')?.href
  };
};

// Helper function to get active filters
const getActiveFilters = () => {
  const filters = {};
  
  // Get all checked filter checkboxes
  document.querySelectorAll('.filter-checkbox:checked, input[type="checkbox"][data-filter]:checked').forEach(cb => {
    const filterType = cb.dataset.filterType || cb.name || 'unknown';
    filters[filterType] = filters[filterType] || [];
    filters[filterType].push(cb.value);
  });
  
  // Get all select filters with values
  document.querySelectorAll('.filter-select, select[data-filter]').forEach(select => {
    if (select.value && select.value !== 'all' && select.value !== '') {
      const filterType = select.dataset.filterType || select.name || 'unknown';
      filters[filterType] = select.value;
    }
  });
  
  return filters;
};

// Load modules and initialize
loadAnalyticsModules();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalyticsSystem);
} else {
  initializeAnalyticsSystem();
}