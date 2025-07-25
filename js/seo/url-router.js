// url-router.js
// Client-side URL routing for crimintel.ai

class URLRouter {
  constructor() {
    this.routes = {
      '/': this.handleHomePage,
      '/ai-tools/:toolName': this.handleToolPage,
      '/category/:categoryName': this.handleCategoryPage,
      '/compare/:comparison': this.handleComparePage
    };
    
    this.currentRoute = null;
    this.initialize();
  }

  initialize() {
    // For local testing, check if we have a hash route
    const isLocalTest = window.location.protocol === 'file:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname.includes('github.dev') ||
                       window.location.port !== '';
    const hash = window.location.hash.slice(1); // Remove #
    
    
    // Check for test route in query params
    const urlParams = new URLSearchParams(window.location.search);
    const testRoute = urlParams.get('test-route');
    
    if (testRoute) {
      setTimeout(() => this.handleRoute(testRoute), 1000); // Wait for data to load
    } else if (isLocalTest && hash) {
      // Local testing: use hash as path
      setTimeout(() => this.handleRoute(hash), 500); // Wait for data to load
    } else {
      // Production: use pathname
      this.handleRoute(window.location.pathname);
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname);
    });
    
    // For local testing, also listen to hashchange
    if (isLocalTest) {
      window.addEventListener('hashchange', (e) => {
        const newHash = window.location.hash.slice(1);
        if (newHash) {
          this.handleRoute(newHash);
        }
      });
    }
    
    // Listen for postMessage (for iframe testing)
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'navigate' && e.data.path) {
        this.handleRoute(e.data.path);
      }
    });
    
    // Intercept link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        
        // Skip if it's a direct HTML file link (not our SPA routes)
        if (path.endsWith('.html') || path.includes('/index.html')) {
          // Let normal navigation happen for HTML files
          return;
        }
        
        // Check if this is a route we handle
        if (this.matchRoute(path)) {
          e.preventDefault();
          this.navigateTo(path);
        }
      }
    });
  }

  // Navigate to a new route
  navigateTo(path) {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
      this.handleRoute(path);
    }
  }

  // Handle route change
  handleRoute(path) {
    const route = this.matchRoute(path);
    
    if (route) {
      this.currentRoute = route;
      route.handler.call(this, route.params);
      
      // Track page view
      if (window.analyticsTracker) {
        window.analyticsTracker.trackPageView(path, document.title);
      }
    } else {
      // 404 - redirect to home
      this.navigateTo('/');
    }
  }

  // Match path to route
  matchRoute(path) {
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const regex = this.patternToRegex(pattern);
      const match = path.match(regex);
      
      if (match) {
        const params = this.extractParams(pattern, match);
        return { pattern, handler, params };
      }
    }
    
    return null;
  }

  // Convert route pattern to regex
  patternToRegex(pattern) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withParams = escaped.replace(/:(\w+)/g, '([^/]+)');
    return new RegExp(`^${withParams}$`);
  }

  // Extract parameters from match
  extractParams(pattern, match) {
    const params = {};
    const paramNames = (pattern.match(/:(\w+)/g) || []).map(p => p.slice(1));
    
    paramNames.forEach((name, index) => {
      params[name] = decodeURIComponent(match[index + 1]);
    });
    
    return params;
  }

  // Route handlers
  handleHomePage() {
    // Show all tools
    this.showAllTools();
    
    // Update meta tags
    if (window.metaManager) {
      window.metaManager.updateMeta({
        title: 'AI Tools Intelligence Hub',
        description: 'Discover and compare 345+ AI tools. Find the perfect AI software for your needs with detailed analysis, pricing, and integration information.'
      });
    }
  }

  handleToolPage(params) {
    const toolSlug = params.toolName;
    const tool = this.findToolBySlug(toolSlug);
    
    if (tool) {
      this.showToolDetails(tool);
      
      // Update meta tags
      if (window.metaManager) {
        window.metaManager.updateToolMeta(tool);
      }
      
      // Track tool view
      if (window.analyticsTracker) {
        window.analyticsTracker.trackToolView(tool);
      }
      if (window.journeyTracker) {
        window.journeyTracker.trackToolView(tool);
      }
    } else {
      // Tool not found
      this.navigateTo('/');
    }
  }

  handleCategoryPage(params) {
    const categorySlug = params.categoryName;
    const category = this.findCategoryBySlug(categorySlug);
    
    if (category) {
      this.showCategoryTools(category);
      
      // Count tools in category
      const toolCount = this.getToolsInCategory(category).length;
      
      // Update meta tags
      if (window.metaManager) {
        window.metaManager.updateCategoryMeta(category, toolCount);
      }
    } else {
      // Category not found
      this.navigateTo('/');
    }
  }

  handleComparePage(params) {
    const comparison = params.comparison;
    const toolSlugs = comparison.split('-vs-');
    const tools = toolSlugs.map(slug => this.findToolBySlug(slug)).filter(Boolean);
    
    if (tools.length >= 2) {
      this.showComparison(tools);
      
      // Update meta tags
      if (window.metaManager) {
        window.metaManager.updateComparisonMeta(tools);
      }
      
      // Track comparison
      if (window.analyticsTracker) {
        window.analyticsTracker.trackComparison(tools);
      }
      if (window.journeyTracker) {
        window.journeyTracker.trackComparison(tools);
      }
    } else {
      // Invalid comparison
      this.navigateTo('/');
    }
  }

  // Helper methods
  findToolBySlug(slug) {
    if (!window.unifiedToolsData || !window.unifiedToolsData.tools) return null;
    
    // Try finding in the raw tools data first
    const tool = window.unifiedToolsData.tools.find(tool => {
      const toolName = tool.tool_name || tool.name;
      if (!toolName) return false;
      
      const toolSlug = this.slugify(toolName);
      return toolSlug === slug;
    });
    
    return tool;
  }

  findCategoryBySlug(slug) {
    if (!window.unifiedToolsData) return null;
    
    const categories = [...new Set(window.unifiedToolsData.tools.map(t => t.category))];
    return categories.find(cat => this.slugify(cat) === slug);
  }

  getToolsInCategory(category) {
    if (!window.unifiedToolsData) return [];
    
    return window.unifiedToolsData.tools.filter(tool => 
      tool.category === category
    );
  }

  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // UI update methods (to be implemented based on your UI structure)
  showAllTools() {
    // Hide tool details, comparison views
    this.hideAllViews();
    
    // Show main tools grid
    const mainContent = document.querySelector('.main-content, #toolsGrid, .tools-container');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    // Reset any filters
    this.resetFilters();
  }

  showToolDetails(tool) {
    // Check if we have the dashboard instance available
    if (window.unifiedDashboard && window.unifiedDashboard.openDetailPanel) {
      // Use existing detail panel system
      const toolId = tool.originalId || tool.id || `${tool.tool_name}-${tool.category}`.toLowerCase().replace(/\s+/g, '-');
      window.unifiedDashboard.openDetailPanel(toolId);
    } else if (window.openEnhancedToolModal) {
      // Try modal system as fallback
      const toolId = tool.id || `${tool.tool_name}-${tool.category}`.toLowerCase().replace(/\s+/g, '-');
      window.openEnhancedToolModal(toolId);
    } else {
      // Final fallback to inline view
      this.hideAllViews();
      
      // Create or update tool details view
      let detailsView = document.getElementById('tool-details-view');
      if (!detailsView) {
        detailsView = document.createElement('div');
        detailsView.id = 'tool-details-view';
        detailsView.className = 'tool-details-view';
        document.querySelector('.main-container, main').appendChild(detailsView);
      }
      
      // Render tool details
      detailsView.innerHTML = this.renderToolDetails(tool);
      detailsView.style.display = 'block';
    }
  }

  showCategoryTools(category) {
    // Show all tools
    this.showAllTools();
    
    // Apply category filter
    this.applyFilter('category', category);
  }

  showComparison(tools) {
    // Hide other views
    this.hideAllViews();
    
    // Create or update comparison view
    let comparisonView = document.getElementById('comparison-view');
    if (!comparisonView) {
      comparisonView = document.createElement('div');
      comparisonView.id = 'comparison-view';
      comparisonView.className = 'comparison-view';
      document.querySelector('.main-container, main').appendChild(comparisonView);
    }
    
    // Render comparison
    comparisonView.innerHTML = this.renderComparison(tools);
    comparisonView.style.display = 'block';
  }

  hideAllViews() {
    // Hide tool details
    const detailsView = document.getElementById('tool-details-view');
    if (detailsView) detailsView.style.display = 'none';
    
    // Hide comparison view
    const comparisonView = document.getElementById('comparison-view');
    if (comparisonView) comparisonView.style.display = 'none';
    
    // Hide main content initially
    const mainContent = document.querySelector('.main-content, #toolsGrid, .tools-container');
    if (mainContent) mainContent.style.display = 'none';
  }

  resetFilters() {
    // Reset all filter checkboxes and selects
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-select').forEach(sel => sel.value = '');
    
    // Show all tools
    document.querySelectorAll('.tool-card').forEach(card => {
      card.style.display = 'block';
    });
  }

  applyFilter(filterType, value) {
    // This would integrate with your existing filter system
    // For now, just filter tool cards by category
    if (filterType === 'category') {
      document.querySelectorAll('.tool-card').forEach(card => {
        const cardCategory = card.dataset.category || 
          card.querySelector('.tool-category')?.textContent?.trim();
        
        if (cardCategory === value) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  // Render methods
  renderToolDetails(tool) {
    return `
      <div class="tool-details-content">
        <div class="tool-details-header">
          <button class="back-button" onclick="router.navigateTo('/')">
            <i class="fas fa-arrow-left"></i> Back to Tools
          </button>
          <h1>${tool.tool_name}</h1>
          <span class="tool-category-badge">${tool.category}</span>
        </div>
        
        <div class="tool-details-body">
          <section class="tool-section">
            <h2>Overview</h2>
            <p>${tool.brief_purpose_summary}</p>
          </section>
          
          ${tool.feature_breakdown ? `
            <section class="tool-section">
              <h2>Features</h2>
              <div class="features-list">
                ${tool.feature_breakdown.split('\n').map(f => 
                  `<div class="feature-item">${f}</div>`
                ).join('')}
              </div>
            </section>
          ` : ''}
          
          ${tool.pricing_model ? `
            <section class="tool-section">
              <h2>Pricing</h2>
              <p>${tool.pricing_model}</p>
            </section>
          ` : ''}
          
          ${tool.pros_cons_limitations ? `
            <section class="tool-section">
              <h2>Pros & Cons</h2>
              <div class="pros-cons-content">${tool.pros_cons_limitations}</div>
            </section>
          ` : ''}
          
          ${tool.use_cases_in_pr ? `
            <section class="tool-section">
              <h2>Use Cases</h2>
              <ul class="use-cases-list">
                ${tool.use_cases_in_pr.map(uc => 
                  `<li>${uc}</li>`
                ).join('')}
              </ul>
            </section>
          ` : ''}
          
          <div class="tool-actions">
            <a href="${tool.url}" target="_blank" rel="noopener" class="visit-tool-btn">
              Visit ${tool.tool_name} <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderComparison(tools) {
    return `
      <div class="comparison-content">
        <div class="comparison-header">
          <button class="back-button" onclick="router.navigateTo('/')">
            <i class="fas fa-arrow-left"></i> Back to Tools
          </button>
          <h1>Comparing ${tools.length} AI Tools</h1>
        </div>
        
        <div class="comparison-grid">
          ${tools.map(tool => `
            <div class="comparison-column">
              <h2>${tool.tool_name}</h2>
              <div class="comparison-category">${tool.category}</div>
              
              <div class="comparison-section">
                <h3>Overview</h3>
                <p>${tool.brief_purpose_summary}</p>
              </div>
              
              <div class="comparison-section">
                <h3>Pricing</h3>
                <p>${tool.pricing_model || 'Not specified'}</p>
              </div>
              
              <div class="comparison-section">
                <h3>Key Features</h3>
                <ul>
                  ${tool.feature_breakdown ? 
                    tool.feature_breakdown.split('\n').slice(0, 5).map(f => 
                      `<li>${f}</li>`
                    ).join('') : '<li>No features listed</li>'}
                </ul>
              </div>
              
              <a href="${tool.url}" target="_blank" class="visit-tool-btn">
                Visit Site <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Initialize router
const router = new URLRouter();

// Export for global access
window.router = router;

