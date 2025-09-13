// Unified Dashboard JavaScript
class UnifiedDashboard {
    constructor() {
        console.log('[UnifiedDashboard] Constructor called');
        this.currentMode = 'browse';
        this.currentView = 'grid';
        this.toolsData = [];
        this.filteredTools = [];
        this.filters = {
            search: '',
            category: [],
            pricing: [],
            rating: 1,
            impact: 0,
            roi: '',
            apis: [],
            complexity: ''
        };
        this.selectedTool = null;
        
        console.log('[UnifiedDashboard] Calling init()');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadToolsData();
        this.updateModeDisplay();
        this.initializeDarkMode();
        this.initializeProgressiveFilters();
    }

    initializeProgressiveFilters() {
        // Initialize the progressive filter panel if available
        if (window.progressiveFilterPanel && this.toolsData.length > 0) {
            window.progressiveFilterPanel.init(this.toolsData);
        }
    }

    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });

        // View toggle (Browse mode)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Global search
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter toggle (mobile)
        const filterToggle = document.getElementById('filterToggle');
        if (filterToggle) {
            filterToggle.addEventListener('click', () => {
                this.toggleFilters();
            });
        }

        // Filter inputs
        this.setupFilterListeners();

        // Detail panel
        const closeBtn = document.getElementById('closeDetailPanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                this.closeDetailPanel();
            });
        }

        // Sort controls
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }


        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
    }

    setupFilterListeners() {
        // Category filtering is now handled by the progressive filter panel
        // No need for the old categoryFilter element

        // Pricing filters
        document.querySelectorAll('.pricing-filter').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.pricing = Array.from(document.querySelectorAll('.pricing-filter:checked')).map(cb => cb.value);
                this.applyFilters();
            });
        });

        // Range filters
        const ratingRange = document.getElementById('ratingRange');
        if (ratingRange) {
            ratingRange.addEventListener('input', (e) => {
                this.filters.rating = parseFloat(e.target.value);
                document.getElementById('ratingValue').textContent = e.target.value + '+';
                this.applyFilters();
            });
        }

        const impactRange = document.getElementById('impactRange');
        if (impactRange) {
            impactRange.addEventListener('input', (e) => {
                this.filters.impact = parseInt(e.target.value);
                document.getElementById('impactValue').textContent = e.target.value + '+';
                this.applyFilters();
            });
        }

        // ROI filter
        const roiFilter = document.getElementById('roiFilter');
        if (roiFilter) {
            roiFilter.addEventListener('change', (e) => {
                this.filters.roi = e.target.value;
                this.applyFilters();
            });
        }

        // API filters
        document.querySelectorAll('.api-filter').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.apis = Array.from(document.querySelectorAll('.api-filter:checked')).map(cb => cb.value);
                this.applyFilters();
            });
        });

        // Complexity filter
        const complexityFilter = document.getElementById('complexityFilter');
        if (complexityFilter) {
            complexityFilter.addEventListener('change', (e) => {
                this.filters.complexity = e.target.value;
                this.applyFilters();
            });
        }
    }

    async loadToolsData() {
        try {
            // Wait for data to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const toolsData = window.unifiedToolsData || unifiedToolsData;
            
            if (toolsData && toolsData.tools) {
                this.toolsData = this.transformToolsData(toolsData.tools);
                this.populateFilters();
                this.applyFilters();
                this.updateStats();
                // Initialize progressive filters after data loads
                this.initializeProgressiveFilters();
            } else {
                console.error('No tools data found');
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading tools data:', error);
            this.showEmptyState();
        }
    }

    transformToolsData(rawData) {
        return rawData.map((tool, index) => {
            // Generate a consistent ID from tool name or use index as fallback
            const generatedId = tool.tool_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `tool-${index}`;
            
            return {
                id: tool.id || generatedId,
                originalId: tool.id || generatedId, // Keep original ID for lookup, or use generated
                name: tool.tool_name || 'Unknown Tool',
                category: tool.category || 'Uncategorized',
                description: tool.brief_purpose_summary || 'No description available',
                url: tool.url || '#',
                pricing: this.extractPricing(tool.pricing_model),
                rating: this.generateRating(),
                businessImpact: this.calculateBusinessImpact(tool),
                timeToValue: this.estimateTimeToValue(tool),
                complexity: this.assessComplexity(tool),
                apiAvailable: this.hasAPI(tool),
                sdkSupport: this.hasSDK(tool),
                webhookSupport: this.hasWebhooks(tool),
                features: this.extractFeatures(tool),
                integrations: this.extractIntegrations(tool),
                tags: tool.tags || [],
                lastUpdated: new Date().toISOString(),
                // Include all raw data fields
                rawData: {
                    feature_breakdown: tool.feature_breakdown || 'No detailed features available',
                    pricing_model: tool.pricing_model || 'Pricing information not available',
                    pros_cons_limitations: tool.pros_cons_limitations || 'No pros/cons information available',
                    integration_potential: tool.integration_potential || 'No integration information available',
                    learning_curve: tool.learning_curve || 'Learning curve information not available',
                    geo_regulatory_limitations: tool.geo_regulatory_limitations || 'No geographic limitations information',
                    case_studies: tool.case_studies || 'No case studies available',
                    use_cases_in_pr: tool.use_cases_in_pr || [],
                    source: tool.source || 'Unknown',
                    icon: tool.icon || null,
                    cision_use_suggestions: tool.cision_use_suggestions || null
                }
            };
        });
    }

    extractPricing(pricingModel) {
        if (!pricingModel) return 'freemium'; // Default to freemium if unknown
        const pricing = pricingModel.toLowerCase();
        
        if (pricing.includes('enterprise') || pricing.includes('custom') || pricing.includes('contact')) return 'enterprise';
        if (pricing.includes('free') && !pricing.includes('paid')) return 'free';
        if (pricing.includes('free') || pricing.includes('trial')) return 'freemium';
        if (pricing.includes('$') || pricing.includes('paid') || pricing.includes('pro') || pricing.includes('premium')) return 'paid';
        
        return 'freemium'; // Default to freemium instead of unknown
    }

    generateRating() {
        return Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
    }

    calculateBusinessImpact(tool) {
        let score = 60; // Start with higher base score
        
        // Broader categories for higher impact
        const highImpactCategories = ['ai', 'assistant', 'analytics', 'automation', 'productivity', 
                                      'chatbot', 'content', 'writing', 'marketing', 'sales', 
                                      'design', 'development', 'data', 'research'];
        if (tool.category) {
            const categoryLower = tool.category.toLowerCase();
            const matchCount = highImpactCategories.filter(cat => categoryLower.includes(cat)).length;
            score += Math.min(matchCount * 10, 25); // Up to 25 points for category matches
        }
        
        // More generous scoring based on available data
        if (tool.feature_breakdown && tool.feature_breakdown.length > 50) score += 10;
        if (tool.integration_potential && tool.integration_potential.length > 30) score += 8;
        if (tool.case_studies && tool.case_studies.length > 30) score += 7;
        if (tool.pricing_model) {
            const pricingLower = tool.pricing_model.toLowerCase();
            if (pricingLower.includes('enterprise') || pricingLower.includes('custom')) score += 5;
            if (pricingLower.includes('free')) score += 3; // Free tier is valuable too
        }
        
        // Bonus for having complete data
        if (tool.brief_purpose_summary && tool.brief_purpose_summary.length > 20) score += 3;
        
        return Math.min(score, 95);
    }

    estimateTimeToValue(tool) {
        if (!tool.learning_curve) return '1-2 weeks';
        
        const curve = tool.learning_curve.toLowerCase();
        if (curve.includes('low') || curve.includes('easy')) return 'Immediate';
        if (curve.includes('medium')) return '1 week';
        if (curve.includes('high') || curve.includes('complex')) return '2-4 weeks';
        
        return '1-2 weeks';
    }

    assessComplexity(tool) {
        if (!tool.learning_curve) return 'medium';
        
        const curve = tool.learning_curve.toLowerCase();
        if (curve.includes('low') || curve.includes('easy')) return 'low';
        if (curve.includes('high') || curve.includes('complex')) return 'high';
        
        return 'medium';
    }

    hasAPI(tool) {
        const text = ((tool.integration_potential || '') + ' ' + 
                     (tool.feature_breakdown || '') + ' ' + 
                     (tool.brief_purpose_summary || '')).toLowerCase();
        return text.includes('api') || text.includes('rest') || text.includes('endpoint') || 
               text.includes('integration') || text.includes('connect') || text.includes('zapier');
    }

    hasSDK(tool) {
        const text = ((tool.integration_potential || '') + ' ' + 
                     (tool.feature_breakdown || '') + ' ' + 
                     (tool.brief_purpose_summary || '')).toLowerCase();
        return text.includes('sdk') || text.includes('library') || text.includes('python') || 
               text.includes('javascript') || text.includes('package') || text.includes('npm') || 
               text.includes('pip') || text.includes('framework');
    }

    hasWebhooks(tool) {
        const text = ((tool.integration_potential || '') + ' ' + 
                     (tool.feature_breakdown || '') + ' ' + 
                     (tool.brief_purpose_summary || '')).toLowerCase();
        return text.includes('webhook') || text.includes('callback') || text.includes('notification') || 
               text.includes('real-time') || text.includes('event') || text.includes('trigger');
    }

    extractFeatures(tool) {
        if (!tool.feature_breakdown) return [];
        
        return tool.feature_breakdown
            .split(/[.\n]/)
            .filter(feature => feature.trim().length > 10)
            .slice(0, 5)
            .map(feature => feature.trim());
    }

    extractIntegrations(tool) {
        if (!tool.integration_potential) return [];
        
        const integrations = [];
        const text = tool.integration_potential.toLowerCase();
        
        if (text.includes('slack')) integrations.push('Slack');
        if (text.includes('teams')) integrations.push('Microsoft Teams');
        if (text.includes('salesforce')) integrations.push('Salesforce');
        if (text.includes('zapier')) integrations.push('Zapier');
        if (text.includes('api')) integrations.push('REST API');
        
        return integrations;
    }

    populateFilters() {
        // Category filters are now populated by the progressive filter panel
        // No need to populate the old categoryFilter element
    }

    switchMode(mode) {
        if (mode === this.currentMode) return;
        
        this.currentMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update mode display
        this.updateModeDisplay();
        
        // Re-render tools
        this.renderTools();
        
        // Update statistics for the new mode
        this.updateStats();
    }

    switchView(view) {
        if (view === this.currentView) return;
        
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update grid class
        const grids = document.querySelectorAll('.tools-grid');
        grids.forEach(grid => {
            grid.classList.toggle('list-view', view === 'list');
        });
        
        // Re-render tools
        this.renderTools();
    }

    updateModeDisplay() {
        // Show/hide mode content
        document.querySelectorAll('.mode-content').forEach(content => {
            content.style.display = content.dataset.mode === this.currentMode ? 'block' : 'none';
        });
        
        // Show/hide mode-specific filters
        document.querySelectorAll('.filter-mode').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.mode === this.currentMode);
        });
    }

    handleSearch(searchTerm) {
        this.filters.search = searchTerm.toLowerCase();
        this.applyFilters();
    }

    handleSort(sortBy) {
        this.filteredTools.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'rating':
                    return b.rating - a.rating;
                case 'updated':
                    return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                default:
                    return 0;
            }
        });
        
        this.renderTools();
    }

    applyFilters() {
        this.filteredTools = this.toolsData.filter(tool => {
            // Search filter
            if (this.filters.search) {
                const searchFields = [tool.name, tool.category, tool.description].join(' ').toLowerCase();
                if (!searchFields.includes(this.filters.search)) return false;
            }
            
            // Category filter
            if (this.filters.category.length > 0 && !this.filters.category.includes(tool.category)) {
                return false;
            }
            
            // Pricing filter
            if (this.filters.pricing.length > 0 && !this.filters.pricing.includes(tool.pricing)) {
                return false;
            }
            
            // Rating filter
            if (tool.rating < this.filters.rating) return false;
            
            // Business impact filter
            if (tool.businessImpact < this.filters.impact) return false;
            
            // ROI filter
            if (this.filters.roi && tool.timeToValue !== this.filters.roi) return false;
            
            // API filters
            if (this.filters.apis.length > 0) {
                if (this.filters.apis.includes('rest') && !tool.apiAvailable) return false;
                if (this.filters.apis.includes('sdk') && !tool.sdkSupport) return false;
                if (this.filters.apis.includes('webhook') && !tool.webhookSupport) return false;
            }
            
            // Complexity filter
            if (this.filters.complexity && tool.complexity !== this.filters.complexity) return false;
            
            return true;
        });
        
        this.renderTools();
        this.updateStats();
        
        // Update meta tags based on filtered results
        this.updateMetaTags();
    }

    renderTools() {
        console.log('[UnifiedDashboard] renderTools called', {
            currentMode: this.currentMode,
            filteredToolsCount: this.filteredTools.length
        });
        
        const gridId = this.currentMode === 'browse' ? 'browseGrid' : 
                      this.currentMode === 'executive' ? 'executiveGrid' : 
                      'technicalGrid';
        
        const grid = document.getElementById(gridId);
        console.log('[UnifiedDashboard] Grid element:', gridId, '=', !!grid);
        
        if (!grid) {
            console.error('[UnifiedDashboard] Grid not found:', gridId);
            return;
        }
        
        if (this.filteredTools.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        const renderMethod = this.currentMode === 'browse' ? 'renderBrowseCard' :
                            this.currentMode === 'executive' ? 'renderExecutiveCard' :
                            'renderTechnicalCard';
        
        console.log('[UnifiedDashboard] Rendering', this.filteredTools.length, 'tools using', renderMethod);
        grid.innerHTML = this.filteredTools.map(tool => this[renderMethod](tool)).join('');
        
        // Add click event listeners to all tool cards
        this.attachCardClickListeners();
    }

    attachCardClickListeners() {
        const cards = document.querySelectorAll('.tool-card');
        console.log(`[UnifiedDashboard] Attaching click listeners to ${cards.length} cards`);
        
        cards.forEach((card, index) => {
            // Add visual feedback for debugging
            card.style.cursor = 'pointer';
            
            // Log card details
            console.log(`[UnifiedDashboard] Card ${index}: toolId=${card.dataset.toolId}, toolName=${card.dataset.toolName}`);
            
            card.addEventListener('click', (e) => {
                console.log('[UnifiedDashboard] Card clicked!', {
                    target: e.target,
                    currentTarget: e.currentTarget,
                    toolId: card.dataset.toolId,
                    toolName: card.dataset.toolName,
                    hasRouter: !!window.router
                });
                
                try {
                    // Don't stop propagation if clicking on export button
                    if (!e.target.closest('.export-btn')) {
                        e.stopPropagation();
                    }
                    
                    const toolId = card.dataset.toolId;
                    const toolName = card.dataset.toolName;
                    
                    if (!toolId) {
                        console.error('[UnifiedDashboard] No toolId found on card element');
                        return;
                    }
                    
                    // Use router for URL navigation if available, otherwise open directly
                    if (toolId && window.router) {
                        // Find the tool to get its name for URL
                        const tool = this.toolsData.find(t => (t.originalId || t.id) === toolId);
                        if (tool) {
                            // Use URL navigation
                            const slug = tool.name.toLowerCase()
                                .trim()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-');
                            window.router.navigateTo(`/ai-tools/${slug}`);
                        } else {
                            console.error('[UnifiedDashboard] Tool not found in toolsData for ID:', toolId);
                            // Fallback to direct panel display
                            this.openDetailPanel(toolId);
                        }
                    } else if (toolId) {
                        console.log('[UnifiedDashboard] No router available, using direct panel display');
                        this.openDetailPanel(toolId);
                    }
                } catch (error) {
                    console.error('[UnifiedDashboard] Error in card click handler:', error);
                    alert('Error opening tool details. Check console for details.');
                }
            });
            
            // Add hover effect for visual feedback
            card.addEventListener('mouseenter', () => {
                card.style.opacity = '0.9';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.opacity = '1';
            });
        });
        
        console.log('[UnifiedDashboard] Click listeners attached successfully');
    }

    renderBrowseCard(tool) {
        // Log tool ID info for debugging
        const toolId = tool.originalId || tool.id;
        console.log('[UnifiedDashboard] Rendering card for:', tool.name, 'with ID:', toolId);
        
        // Create a clean tool object for export
        const exportData = {
            tool_name: tool.name,
            category: tool.category,
            brief_purpose_summary: tool.description,
            pricing_model: tool.rawData?.pricing_model || tool.pricing,
            feature_breakdown: tool.rawData?.feature_breakdown,
            pros_cons_limitations: tool.rawData?.pros_cons_limitations,
            integration_potential: tool.rawData?.integration_potential,
            learning_curve: tool.rawData?.learning_curve,
            url: tool.url
        };
        
        return `
            <div class="tool-card" data-tool-id="${toolId}" data-tool-name="${tool.name}" data-category="${tool.category}" style="cursor: pointer;">
                <button class="export-btn" onclick="event.stopPropagation(); exportToolToPDF(${JSON.stringify(exportData).replace(/"/g, '&quot;')})" title="Export to PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <h3>${tool.name}</h3>
                <div class="category">${tool.category}</div>
                <div class="description">${tool.description}</div>
                <div class="tool-meta">
                    <span class="rating">
                        <i class="fas fa-star"></i> ${tool.rating}
                    </span>
                    <span class="pricing">${tool.pricing}</span>
                </div>
            </div>
        `;
    }

    renderExecutiveCard(tool) {
        const toolId = tool.originalId || tool.id;
        const impactClass = tool.businessImpact >= 70 ? 'high' : 
                           tool.businessImpact >= 50 ? 'medium' : 'low';
        
        return `
            <div class="tool-card executive-card" data-tool-id="${toolId}" data-tool-name="${tool.name}" style="cursor: pointer;">
                <h3>${tool.name}</h3>
                <div class="impact-score ${impactClass}">${tool.businessImpact}</div>
                <div class="impact-label">Business Impact Score</div>
                <div class="roi-timeline">
                    <i class="fas fa-clock"></i>
                    <span>ROI in ${tool.timeToValue}</span>
                </div>
                <div class="pricing">${tool.pricing}</div>
                <div class="description">${tool.description}</div>
            </div>
        `;
    }

    renderTechnicalCard(tool) {
        const toolId = tool.originalId || tool.id;
        const apis = [];
        if (tool.apiAvailable) apis.push('REST API');
        if (tool.sdkSupport) apis.push('SDK');
        if (tool.webhookSupport) apis.push('Webhooks');
        
        return `
            <div class="tool-card technical-card" data-tool-id="${toolId}" data-tool-name="${tool.name}" style="cursor: pointer;">
                <h3>${tool.name}</h3>
                <div class="api-badges">
                    ${apis.map(api => `<span class="api-badge">${api}</span>`).join('')}
                </div>
                <div class="tech-specs">
                    <div class="spec-item">
                        <i class="fas fa-cogs"></i>
                        <span>Complexity: ${tool.complexity}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-plug"></i>
                        <span>Integrations: ${tool.integrations.length}</span>
                    </div>
                </div>
                <div class="description">${tool.description}</div>
            </div>
        `;
    }

    openDetailPanel(toolId) {
        console.log('[UnifiedDashboard] openDetailPanel called with toolId:', toolId);
        console.log('[UnifiedDashboard] Total tools in toolsData:', this.toolsData.length);
        console.log('[UnifiedDashboard] First 3 tools:', this.toolsData.slice(0, 3).map(t => ({
            id: t.id,
            originalId: t.originalId,
            name: t.name
        })));
        
        // Try to find tool by originalId first, then by transformed id
        const tool = this.toolsData.find(t => 
            t.originalId == toolId || 
            t.id == toolId || 
            String(t.originalId) === String(toolId)
        );
        
        if (!tool) {
            console.error('[UnifiedDashboard] Tool not found for ID:', toolId);
            console.log('[UnifiedDashboard] Available tool IDs (first 10):', this.toolsData.slice(0, 10).map(t => ({ 
                id: t.id, 
                originalId: t.originalId,
                name: t.name 
            })));
            alert(`Tool not found with ID: ${toolId}. Check console for available IDs.`);
            return;
        }
        
        console.log('[UnifiedDashboard] Tool found:', tool.name);
        
        this.selectedTool = tool;
        const panel = document.getElementById('detailPanel');
        const title = document.getElementById('detailPanelTitle');
        const content = document.getElementById('detailPanelContent');
        
        console.log('[UnifiedDashboard] Panel elements:', { 
            panel: !!panel, 
            title: !!title, 
            content: !!content,
            panelClasses: panel?.className,
            panelId: panel?.id
        });
        
        if (!panel || !title || !content) {
            console.error('[UnifiedDashboard] Detail panel elements not found in DOM', {
                panel: panel,
                title: title,
                content: content
            });
            // Let's check if we can find it differently
            const allPanels = document.querySelectorAll('[id*="detail"], [class*="detail"]');
            console.log('[UnifiedDashboard] Found detail-related elements:', allPanels.length);
            allPanels.forEach(el => console.log('  -', el.tagName, el.id, el.className));
            alert('Detail panel elements not found in DOM. Check console for details.');
            return;
        }
        
        title.textContent = tool.name;
        content.innerHTML = this.renderDetailContent(tool);
        
        // Update meta tags for the selected tool
        if (window.metaManager && tool.rawData) {
            window.metaManager.updateToolMeta(tool.rawData);
        }
        
        // Add structured data for the selected tool
        if (window.schemaGenerator && tool.rawData) {
            window.schemaGenerator.addStructuredData(
                window.schemaGenerator.generateToolSchema(tool.rawData)
            );
        }
        
        // Add a small delay to ensure the panel opens after any potential close events
        setTimeout(() => {
            panel.classList.add('open');
            console.log('[UnifiedDashboard] Detail panel should now be open. Panel classes:', panel.className);
            console.log('[UnifiedDashboard] Panel computed style right:', window.getComputedStyle(panel).right);
        }, 10);
    }

    closeDetailPanel() {
        console.log('Closing detail panel');
        const panel = document.getElementById('detailPanel');
        panel.classList.remove('open');
        this.selectedTool = null;
        console.log('Detail panel closed');
        
        // Reset meta tags to current filter state
        this.updateMetaTags();
    }

    renderDetailContent(tool) {
        // Render content based on current mode
        if (this.currentMode === 'executive') {
            return this.renderExecutiveDetailContent(tool);
        } else if (this.currentMode === 'technical') {
            return this.renderTechnicalDetailContent(tool);
        } else {
            return this.renderBrowseDetailContent(tool);
        }
    }

    renderBrowseDetailContent(tool) {
        return `
            <div class="detail-section">
                <h3>Overview</h3>
                <p>${tool.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>Category</h3>
                <span class="category-badge">${tool.category}</span>
            </div>
            
            <div class="detail-section">
                <h3>Detailed Features</h3>
                <div class="feature-content">
                    ${tool.rawData.feature_breakdown.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Pricing Model</h3>
                <div class="pricing-content">
                    <p>${tool.rawData.pricing_model}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Pros, Cons & Limitations</h3>
                <div class="pros-cons-content">
                    ${tool.rawData.pros_cons_limitations.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Learning Curve</h3>
                <p>${tool.rawData.learning_curve}</p>
            </div>
            
            <div class="detail-section">
                <h3>Use Cases in PR/Marketing</h3>
                <div class="use-cases-list">
                    ${Array.isArray(tool.rawData.use_cases_in_pr) && tool.rawData.use_cases_in_pr.length > 0 ? 
                        tool.rawData.use_cases_in_pr.map(useCase => `<div class="use-case-item">${useCase}</div>`).join('') :
                        '<p>No specific use cases documented</p>'
                    }
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Geographic & Regulatory Limitations</h3>
                <p>${tool.rawData.geo_regulatory_limitations}</p>
            </div>
            
            ${tool.rawData.case_studies && tool.rawData.case_studies !== 'No case studies available' ? `
                <div class="detail-section">
                    <h3>Case Studies</h3>
                    <div class="case-studies-content">
                        ${tool.rawData.case_studies.split('\n').map(line => 
                            line.trim() ? `<p>${line.trim()}</p>` : ''
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Tags</h3>
                <div class="tags-list">
                    ${tool.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-actions">
                <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
            </div>
        `;
    }

    renderExecutiveDetailContent(tool) {
        return `
            <div class="executive-metrics">
                <div class="metric-card">
                    <div class="metric-value">${tool.businessImpact}</div>
                    <div class="metric-label">Business Impact Score</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${tool.timeToValue}</div>
                    <div class="metric-label">Time to Value</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${tool.complexity}</div>
                    <div class="metric-label">Implementation Complexity</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Business Value Proposition</h3>
                <p>${tool.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>Detailed Investment Analysis</h3>
                <div class="pricing-content">
                    <p><strong>Pricing Model:</strong> ${tool.rawData.pricing_model}</p>
                    <p><strong>Learning Curve:</strong> ${tool.rawData.learning_curve}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Strategic Benefits & Limitations</h3>
                <div class="pros-cons-content">
                    ${tool.rawData.pros_cons_limitations.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Integration & Implementation</h3>
                <div class="integration-content">
                    ${tool.rawData.integration_potential.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Business Use Cases</h3>
                <div class="use-cases-list">
                    ${Array.isArray(tool.rawData.use_cases_in_pr) && tool.rawData.use_cases_in_pr.length > 0 ? 
                        tool.rawData.use_cases_in_pr.map(useCase => `<div class="use-case-item">${useCase}</div>`).join('') :
                        '<p>No specific use cases documented</p>'
                    }
                </div>
            </div>
            
            ${tool.rawData.case_studies && tool.rawData.case_studies !== 'No case studies available' ? `
                <div class="detail-section">
                    <h3>Case Studies & ROI Evidence</h3>
                    <div class="case-studies-content">
                        ${tool.rawData.case_studies.split('\n').map(line => 
                            line.trim() ? `<p>${line.trim()}</p>` : ''
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Risk Assessment</h3>
                <p><strong>Geographic/Regulatory Limitations:</strong> ${tool.rawData.geo_regulatory_limitations}</p>
            </div>
            
            <div class="detail-actions">
                <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
            </div>
        `;
    }

    renderTechnicalDetailContent(tool) {
        return `
            <div class="technical-overview">
                <div class="tech-metric">
                    <i class="fas fa-code"></i>
                    <span>API Available: ${tool.apiAvailable ? 'Yes' : 'No'}</span>
                </div>
                <div class="tech-metric">
                    <i class="fas fa-cube"></i>
                    <span>SDK Support: ${tool.sdkSupport ? 'Yes' : 'No'}</span>
                </div>
                <div class="tech-metric">
                    <i class="fas fa-bolt"></i>
                    <span>Webhooks: ${tool.webhookSupport ? 'Yes' : 'No'}</span>
                </div>
                <div class="tech-metric">
                    <i class="fas fa-layer-group"></i>
                    <span>Complexity: ${tool.complexity}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Technical Overview</h3>
                <p>${tool.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>Feature Architecture</h3>
                <div class="feature-content">
                    ${tool.rawData.feature_breakdown.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Integration Capabilities</h3>
                <div class="integration-content">
                    ${tool.rawData.integration_potential.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Implementation Considerations</h3>
                <div class="implementation-content">
                    <p><strong>Learning Curve:</strong> ${tool.rawData.learning_curve}</p>
                    <p><strong>Complexity Level:</strong> ${tool.complexity}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Technical Limitations</h3>
                <div class="limitations-content">
                    ${tool.rawData.pros_cons_limitations.split('\n').map(line => 
                        line.trim() ? `<p>${line.trim()}</p>` : ''
                    ).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Deployment Use Cases</h3>
                <div class="use-cases-list">
                    ${Array.isArray(tool.rawData.use_cases_in_pr) && tool.rawData.use_cases_in_pr.length > 0 ? 
                        tool.rawData.use_cases_in_pr.map(useCase => `<div class="use-case-item">${useCase}</div>`).join('') :
                        '<p>No specific technical use cases documented</p>'
                    }
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Geographic/Regulatory Constraints</h3>
                <p>${tool.rawData.geo_regulatory_limitations}</p>
            </div>
            
            <div class="detail-section">
                <h3>Technical Tags</h3>
                <div class="tags-list">
                    ${tool.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-actions">
                <a href="${tool.url.startsWith('http') ? tool.url : 'https://' + tool.url}" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
            </div>
        `;
    }

    updateStats() {
        // Update total tools count
        document.getElementById('totalToolsCount').textContent = this.toolsData.length;
        document.getElementById('activeToolsCount').textContent = this.toolsData.length;
        document.getElementById('filteredCount').textContent = this.filteredTools.length;
        
        // Update category count
        const uniqueCategories = new Set(this.toolsData.map(tool => tool.category));
        document.getElementById('categoriesCount').textContent = uniqueCategories.size;
        
        // Update mode-specific metrics
        if (this.currentMode === 'executive') {
            const highImpact = this.filteredTools.filter(tool => tool.businessImpact >= 70).length; // Lowered threshold
            const avgRoi = this.filteredTools.length > 0 
                ? Math.round(this.filteredTools.reduce((sum, tool) => sum + tool.businessImpact, 0) / this.filteredTools.length)
                : 0;
            const enterpriseReady = this.filteredTools.filter(tool => 
                tool.pricing === 'enterprise' || tool.pricing === 'custom' || tool.pricing === 'contact').length;
            
            document.getElementById('highImpactCount').textContent = highImpact;
            document.getElementById('avgRoi').textContent = avgRoi + '%';
            document.getElementById('enterpriseReady').textContent = enterpriseReady;
        } else if (this.currentMode === 'technical') {
            const apiAvailable = this.filteredTools.filter(tool => tool.apiAvailable).length;
            const sdkSupport = this.filteredTools.filter(tool => tool.sdkSupport).length;
            const webhookSupport = this.filteredTools.filter(tool => tool.webhookSupport).length;
            
            document.getElementById('apiAvailable').textContent = apiAvailable;
            document.getElementById('sdkSupport').textContent = sdkSupport;
            document.getElementById('webhookSupport').textContent = webhookSupport;
        }
    }

    updateMetaTags() {
        // Only update meta tags if metaManager is available
        if (!window.metaManager) return;
        
        // Determine the context based on current filters
        const hasActiveFilters = this.filters.search || 
                               this.filters.category.length > 0 || 
                               this.filters.pricing.length > 0 ||
                               this.filters.rating > 1 ||
                               this.filters.impact > 0 ||
                               this.filters.roi ||
                               this.filters.apis.length > 0 ||
                               this.filters.complexity;
        
        // If no filters, use homepage meta
        if (!hasActiveFilters) {
            window.metaManager.updateMeta({
                title: 'AI Tools Intelligence Hub',
                description: 'Discover and compare 349+ AI tools. Find the perfect AI software for your needs with detailed analysis, pricing, and integration information.'
            });
            
            // Add structured data for homepage
            if (window.schemaGenerator && this.filteredTools.length > 0) {
                const featuredTools = this.getOriginalToolsData(this.filteredTools.slice(0, 10));
                window.schemaGenerator.addStructuredData(
                    window.schemaGenerator.generateToolListSchema(featuredTools, 'Featured AI Tools')
                );
            }
            return;
        }
        
        // If filtering by single category
        if (this.filters.category.length === 1 && !this.filters.search) {
            const category = this.filters.category[0];
            window.metaManager.updateCategoryMeta(category, this.filteredTools.length);
            
            // Add structured data for category
            if (window.schemaGenerator && this.filteredTools.length > 0) {
                const categoryTools = this.getOriginalToolsData(this.filteredTools);
                window.schemaGenerator.addStructuredData(
                    window.schemaGenerator.generateCategorySchema(category, categoryTools)
                );
            }
            return;
        }
        
        // If searching for specific tools
        if (this.filters.search && this.filteredTools.length === 1) {
            // Single tool found - update with tool-specific meta
            const tool = this.filteredTools[0];
            const toolsArray = window.unifiedToolsData?.tools || window.unifiedToolsData || [];
            const originalTool = toolsArray.find(t => 
                t.tool_name === tool.name || 
                t.id === tool.originalId
            );
            if (originalTool) {
                window.metaManager.updateToolMeta(originalTool);
                
                // Add structured data for single tool
                if (window.schemaGenerator) {
                    window.schemaGenerator.addStructuredData(
                        window.schemaGenerator.generateToolSchema(originalTool)
                    );
                }
            }
            return;
        }
        
        // For complex filters or multiple results
        let description = `Showing ${this.filteredTools.length} AI tools`;
        const parts = [];
        
        if (this.filters.search) {
            parts.push(`matching "${this.filters.search}"`);
        }
        if (this.filters.category.length > 0) {
            parts.push(`in ${this.filters.category.join(', ')} categories`);
        }
        if (this.filters.pricing.length > 0) {
            parts.push(`with ${this.filters.pricing.join('/')} pricing`);
        }
        if (this.filters.rating > 1) {
            parts.push(`rated ${this.filters.rating}+ stars`);
        }
        if (this.filters.impact > 0) {
            parts.push(`with ${this.filters.impact}+ business impact score`);
        }
        
        if (parts.length > 0) {
            description += ' ' + parts.join(', ');
        }
        description += '. Compare features, pricing, and business impact scores.';
        
        window.metaManager.updateMeta({
            title: `AI Tools Search Results - ${this.filteredTools.length} Tools Found`,
            description: description
        });
        
        // Add structured data for search results
        if (window.schemaGenerator && this.filteredTools.length > 0) {
            const searchResultTools = this.getOriginalToolsData(this.filteredTools.slice(0, 20));
            window.schemaGenerator.addStructuredData(
                window.schemaGenerator.generateToolListSchema(searchResultTools, 'Search Results')
            );
        }
    }
    
    // Helper method to get original tool data from filtered tools
    getOriginalToolsData(filteredTools) {
        const toolsArray = window.unifiedToolsData?.tools || window.unifiedToolsData || [];
        
        return filteredTools.map(tool => {
            const originalTool = toolsArray.find(t => 
                t.tool_name === tool.name || 
                t.id === tool.originalId
            );
            return originalTool || tool.rawData || tool;
        }).filter(tool => tool);
    }

    toggleFilters() {
        const filterContent = document.getElementById('filterContent');
        filterContent.classList.toggle('open');
    }

    exportData() {
        // Export functionality - can be accessed via console: window.unifiedDashboard.exportData()
        const dataToExport = this.filteredTools.map(tool => ({
            name: tool.name,
            category: tool.category,
            pricing: tool.pricing,
            rating: tool.rating,
            businessImpact: tool.businessImpact,
            timeToValue: tool.timeToValue,
            complexity: tool.complexity,
            url: tool.url
        }));
        
        const csv = this.convertToCSV(dataToExport);
        this.downloadCSV(csv, 'ai-tools-export.csv');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No tools found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
    }

    showEmptyState() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load tools data</h3>
                <p>Please refresh the page or try again later</p>
            </div>
        `;
    }

    clearAllFilters() {
        // Reset all filter values
        this.filters = {
            search: '',
            category: [],
            pricing: [],
            rating: 1,
            impact: 0,
            roi: '',
            apis: [],
            complexity: ''
        };

        // Clear search input
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Clear category selections in progressive filter panel
        if (window.progressiveFilterPanel) {
            window.progressiveFilterPanel.clearAll();
        }

        // Clear pricing checkboxes
        document.querySelectorAll('.pricing-filter').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset rating range
        const ratingRange = document.getElementById('ratingRange');
        if (ratingRange) {
            ratingRange.value = 1;
            document.getElementById('ratingValue').textContent = '1.0+';
        }

        // Reset impact range
        const impactRange = document.getElementById('impactRange');
        if (impactRange) {
            impactRange.value = 0;
            document.getElementById('impactValue').textContent = '0+';
        }

        // Clear ROI filter
        const roiFilter = document.getElementById('roiFilter');
        if (roiFilter) {
            roiFilter.selectedIndex = 0;
        }

        // Clear API checkboxes
        document.querySelectorAll('.api-filter').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear complexity filter
        const complexityFilter = document.getElementById('complexityFilter');
        if (complexityFilter) {
            complexityFilter.selectedIndex = 0;
        }

        // Reapply filters (which will show all tools)
        this.applyFilters();
    }

    initializeDarkMode() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button icon
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
            }
        }
    }
}

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[UnifiedDashboard] DOM Content Loaded');
    
    // Wait for data to be available before initializing
    function initializeDashboard() {
        console.log('[UnifiedDashboard] Checking for data...', {
            hasUnifiedToolsData: !!window.unifiedToolsData,
            hasTools: window.unifiedToolsData?.tools ? window.unifiedToolsData.tools.length : 0
        });
        
        if (window.unifiedToolsData) {
            console.log('[UnifiedDashboard] Data loaded, initializing dashboard with', window.unifiedToolsData.tools?.length || 0, 'tools');
            window.unifiedDashboard = new UnifiedDashboard();
            console.log('[UnifiedDashboard] Dashboard initialized successfully');
        } else {
            console.log('[UnifiedDashboard] Waiting for data to load...');
            setTimeout(initializeDashboard, 100);
        }
    }
    initializeDashboard();
});

// Close detail panel on outside click
document.addEventListener('click', (e) => {
    // Only proceed if dashboard is initialized
    if (!window.unifiedDashboard) return;
    
    const panel = document.getElementById('detailPanel');
    if (panel && panel.classList.contains('open') && !panel.contains(e.target)) {
        // Don't close if clicking on a tool card
        if (!e.target.closest('.tool-card')) {
            console.log('[UnifiedDashboard] Closing panel - clicked outside');
            window.unifiedDashboard.closeDetailPanel();
        }
    }
});