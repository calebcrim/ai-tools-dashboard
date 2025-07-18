export class EnhancedFilters {
  constructor(options) {
    this.container = options.container;
    this.onFilterChange = options.onFilterChange;
    this.categoryGroups = options.categoryGroups;
    this.tools = options.tools;
    
    this.activeFilters = {
      search: '',
      categories: [],
      pricing: [],
      features: [],
      quickFilter: 'all'
    };
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEventListeners();
    this.updateCounts();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="filter-system">
        <!-- Sidebar Filters -->
        <aside class="sidebar-filters">
          <div class="filter-header">
            <h3>Filters</h3>
            <span class="clear-filters" id="clearFilters">
              <i class="fas fa-times"></i> Clear all
            </span>
          </div>
          
          <!-- Categories -->
          <div class="filter-section">
            <h4>Categories</h4>
            <div id="categoryGroups"></div>
          </div>
          
          <!-- Pricing -->
          <div class="filter-section">
            <h4>Pricing Model</h4>
            <div class="filter-option">
              <input type="checkbox" id="free" value="free">
              <label for="free">Free <span class="filter-count" data-pricing="free">0</span></label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="freemium" value="freemium">
              <label for="freemium">Freemium <span class="filter-count" data-pricing="freemium">0</span></label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="paid" value="paid">
              <label for="paid">Paid <span class="filter-count" data-pricing="paid">0</span></label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="enterprise" value="enterprise">
              <label for="enterprise">Enterprise <span class="filter-count" data-pricing="enterprise">0</span></label>
            </div>
          </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
          <!-- Search -->
          <div class="search-section">
            <div class="search-container">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" 
                       class="search-input" 
                       id="searchInput"
                       placeholder="Search by tool name, feature, use case, or category...">
              </div>
            </div>
          </div>
          
          <!-- Quick Filters -->
          <div class="quick-filters">
            <button class="quick-filter active" data-filter="all">
              <i class="fas fa-border-all"></i> All Tools
            </button>
            <button class="quick-filter" data-filter="popular">
              <i class="fas fa-star"></i> Popular
            </button>
            <button class="quick-filter" data-filter="ai-powered">
              <i class="fas fa-robot"></i> AI-Powered
            </button>
            <button class="quick-filter" data-filter="free">
              <i class="fas fa-gift"></i> Free Tools
            </button>
          </div>
          
          <!-- Active Filters -->
          <div class="active-filters" id="activeFilters" style="display: none;">
            <span class="active-filter-label">Active filters:</span>
            <div id="activeFilterChips"></div>
          </div>
          
          <!-- Results Summary -->
          <div class="results-summary">
            <div class="results-count">
              Showing <strong id="resultsCount">0</strong> of <span id="totalCount">0</span> tools
            </div>
            <div class="view-options">
              <button class="view-btn active" data-view="grid">
                <i class="fas fa-th"></i>
              </button>
              <button class="view-btn" data-view="list">
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
          
          <!-- Tools Container -->
          <div id="toolsContainer" class="tools-grid"></div>
        </main>
      </div>
    `;
    
    this.renderCategoryGroups();
  }
  
  renderCategoryGroups() {
    const container = document.getElementById('categoryGroups');
    
    // First, let's create a flat list since we now have 43 well-organized categories
    // Group them logically based on the consolidation results
    const logicalGroups = {
      'Content & Media': [
        'Content Creation', 'Media Production', 'Audio/Video Processing',
        'Publishing Tools', 'Media Intelligence', 'Content Research'
      ],
      'AI & Development': [
        'AI Assistants', 'AI Development', 'Development Tools',
        'API & Documentation', 'Computer Vision', 'Language Processing'
      ],
      'Business & Analytics': [
        'Data Analytics', 'Business Intelligence', 'Web Analytics',
        'Specialized Analytics', 'Research Tools', 'Finance'
      ],
      'Marketing & Sales': [
        'Marketing Automation', 'Advertising Tech', 'Social Media Management',
        'Social Analytics', 'CRM & Sales', 'Customer Service'
      ],
      'Operations & Workflow': [
        'Workflow Automation', 'Project Management', 'IT Support',
        'Supply Chain', 'Document Processing', 'Communication Tools',
        'Productivity Tools', 'Collaboration Tools'
      ],
      'Security & Compliance': [
        'Cybersecurity', 'Data Protection', 'Legal Tech', 'Compliance Tools'
      ],
      'Other Tools': [
        'General Tools', 'Real Estate Tech', 'IoT Solutions', 
        'Hardware Integration', 'HR & Employee Tools', 'Web Development',
        'Resource Directory', 'Consumer Apps'
      ]
    };
    
    Object.entries(logicalGroups).forEach(([groupName, categories]) => {
      // Only include categories that actually exist in the data
      const existingCategories = categories.filter(cat => 
        this.tools.some(tool => tool.category === cat)
      );
      
      if (existingCategories.length > 0) {
        const groupHtml = `
          <div class="category-group">
            <div class="category-group-header" data-group="${groupName}">
              <i class="fas fa-chevron-right"></i>
              <span>${groupName}</span>
            </div>
            <div class="category-items">
              ${existingCategories.map(category => `
                <div class="filter-option">
                  <input type="checkbox" 
                         id="cat-${category.replace(/\s+/g, '-')}" 
                         value="${category}">
                  <label for="cat-${category.replace(/\s+/g, '-')}">
                    ${category}
                    <span class="filter-count" data-category="${category}">0</span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        
        container.insertAdjacentHTML('beforeend', groupHtml);
      }
    });
  }
  
  attachEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.activeFilters.search = e.target.value;
      this.applyFilters();
    });
    
    // Category group toggles
    document.querySelectorAll('.category-group-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('expanded');
      });
    });
    
    // Category checkboxes
    document.querySelectorAll('.category-items input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateCategoryFilters();
        this.applyFilters();
      });
    });
    
    // Pricing checkboxes
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
      if (checkbox.id === 'free' || checkbox.id === 'freemium' || checkbox.id === 'paid' || checkbox.id === 'enterprise') {
        checkbox.addEventListener('change', () => {
          this.updatePricingFilters();
          this.applyFilters();
        });
      }
    });
    
    // Quick filters
    document.querySelectorAll('.quick-filter').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.activeFilters.quickFilter = button.dataset.filter;
        this.applyFilters();
      });
    });
    
    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearAllFilters();
    });
    
    // View options
    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.changeView(button.dataset.view);
      });
    });
  }
  
  updateCategoryFilters() {
    const checked = Array.from(
      document.querySelectorAll('.category-items input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    
    this.activeFilters.categories = checked;
  }
  
  updatePricingFilters() {
    const checked = Array.from(
      document.querySelectorAll('#free:checked, #freemium:checked, #paid:checked, #enterprise:checked')
    ).map(cb => cb.value);
    
    this.activeFilters.pricing = checked;
  }
  
  applyFilters() {
    const filteredTools = this.filterTools();
    this.updateActiveFiltersDisplay();
    this.updateResultsCount(filteredTools.length);
    
    if (this.onFilterChange) {
      this.onFilterChange(filteredTools);
    }
  }
  
  filterTools() {
    let filtered = [...this.tools];
    
    // Search filter - using correct field names for unified-tools-data.js
    if (this.activeFilters.search) {
      const search = this.activeFilters.search.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.tool_name?.toLowerCase().includes(search) ||
        tool.brief_purpose_summary?.toLowerCase().includes(search) ||
        tool.category?.toLowerCase().includes(search) ||
        tool.feature_breakdown?.toLowerCase().includes(search) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Category filter
    if (this.activeFilters.categories.length > 0) {
      filtered = filtered.filter(tool => 
        this.activeFilters.categories.includes(tool.category)
      );
    }
    
    // Pricing filter
    if (this.activeFilters.pricing.length > 0) {
      filtered = filtered.filter(tool => {
        const pricing = tool.pricing_model?.toLowerCase() || '';
        return this.activeFilters.pricing.some(filter => {
          if (filter === 'free') return pricing.includes('free') && !pricing.includes('freemium');
          if (filter === 'freemium') return pricing.includes('freemium');
          if (filter === 'paid') return pricing.includes('paid') || pricing.includes('subscription') || pricing.includes('$');
          if (filter === 'enterprise') return pricing.includes('enterprise') || pricing.includes('contact');
          return false;
        });
      });
    }
    
    // Quick filters
    switch (this.activeFilters.quickFilter) {
      case 'popular':
        // Filter by tools that have extensive features or case studies
        filtered = filtered.filter(tool => 
          tool.case_studies && tool.case_studies.length > 50
        );
        break;
      case 'ai-powered':
        // Filter tools that have AI in their name or category
        filtered = filtered.filter(tool => 
          tool.tool_name?.toLowerCase().includes('ai') ||
          tool.category?.toLowerCase().includes('ai') ||
          tool.tags?.some(tag => tag.toLowerCase().includes('ai'))
        );
        break;
      case 'free':
        filtered = filtered.filter(tool => 
          tool.pricing_model?.toLowerCase().includes('free')
        );
        break;
    }
    
    return filtered;
  }
  
  updateCounts() {
    // Category counts
    const categoryCounts = {};
    this.tools.forEach(tool => {
      if (tool.category) {
        categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
      }
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const countElement = document.querySelector(`[data-category="${category}"]`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
    
    // Pricing counts
    const pricingCounts = {
      free: 0,
      freemium: 0,
      paid: 0,
      enterprise: 0
    };
    
    this.tools.forEach(tool => {
      const pricing = tool.pricing_model?.toLowerCase() || '';
      if (pricing.includes('free') && !pricing.includes('freemium')) pricingCounts.free++;
      if (pricing.includes('freemium')) pricingCounts.freemium++;
      if (pricing.includes('paid') || pricing.includes('subscription') || pricing.includes('$')) pricingCounts.paid++;
      if (pricing.includes('enterprise') || pricing.includes('contact')) pricingCounts.enterprise++;
    });
    
    Object.entries(pricingCounts).forEach(([pricing, count]) => {
      const countElement = document.querySelector(`[data-pricing="${pricing}"]`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
    
    // Total count
    document.getElementById('totalCount').textContent = this.tools.length;
    document.getElementById('resultsCount').textContent = this.tools.length;
  }
  
  updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    const chipsContainer = document.getElementById('activeFilterChips');
    
    const activeChips = [];
    
    // Categories
    this.activeFilters.categories.forEach(category => {
      activeChips.push({ type: 'category', value: category, label: category });
    });
    
    // Pricing
    this.activeFilters.pricing.forEach(pricing => {
      activeChips.push({ type: 'pricing', value: pricing, label: pricing });
    });
    
    // Search
    if (this.activeFilters.search) {
      activeChips.push({ 
        type: 'search', 
        value: this.activeFilters.search, 
        label: `"${this.activeFilters.search}"` 
      });
    }
    
    if (activeChips.length > 0) {
      container.style.display = 'flex';
      chipsContainer.innerHTML = activeChips.map(chip => `
        <div class="active-filter-chip" data-type="${chip.type}" data-value="${chip.value}">
          ${chip.label}
          <i class="fas fa-times"></i>
        </div>
      `).join('');
      
      // Add remove handlers
      chipsContainer.querySelectorAll('.active-filter-chip i').forEach(icon => {
        icon.addEventListener('click', (e) => {
          const chip = e.target.parentElement;
          this.removeFilter(chip.dataset.type, chip.dataset.value);
        });
      });
    } else {
      container.style.display = 'none';
    }
  }
  
  removeFilter(type, value) {
    switch (type) {
      case 'category':
        this.activeFilters.categories = this.activeFilters.categories.filter(c => c !== value);
        document.getElementById(`cat-${value.replace(/\s+/g, '-')}`).checked = false;
        break;
      case 'pricing':
        this.activeFilters.pricing = this.activeFilters.pricing.filter(p => p !== value);
        document.getElementById(value).checked = false;
        break;
      case 'search':
        this.activeFilters.search = '';
        document.getElementById('searchInput').value = '';
        break;
    }
    
    this.applyFilters();
  }
  
  updateResultsCount(count) {
    document.getElementById('resultsCount').textContent = count;
  }
  
  clearAllFilters() {
    // Clear all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Clear search
    document.getElementById('searchInput').value = '';
    
    // Reset quick filter
    document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
    document.querySelector('.quick-filter[data-filter="all"]').classList.add('active');
    
    // Reset active filters
    this.activeFilters = {
      search: '',
      categories: [],
      pricing: [],
      features: [],
      quickFilter: 'all'
    };
    
    this.applyFilters();
  }
  
  changeView(view) {
    const container = document.getElementById('toolsContainer');
    container.className = `tools-${view}`;
  }
}