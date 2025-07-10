// Enhanced Dual View Management System with 317+ Tools Support
class EnhancedDualViewManager {
    constructor() {
        this.currentView = 'executive';
        this.dataProcessor = null;
        this.allTools = [];
        this.displayedTools = [];
        this.currentFilters = {};
        this.isLoading = true;
        this.virtualScroller = null;
        
        // Performance tracking
        this.performanceMetrics = {
            loadTime: 0,
            searchTime: 0,
            renderTime: 0
        };
        
        this.init();
    }

    async init() {
        // Show loading indicator
        this.showLoadingState();
        
        // Initialize data processor
        this.dataProcessor = new EnhancedDataProcessor();
        
        // Set up callbacks
        this.dataProcessor.callbacks = {
            onProgress: (progress) => this.updateLoadingProgress(progress),
            onComplete: (stats) => this.onDataLoadComplete(stats),
            onError: (error) => this.onDataLoadError(error)
        };
        
        // Set up event listeners
        this.setupViewToggle();
        this.setupSearch();
        this.setupFilters();
        this.setupDensityControl();
        
        // Load tools data
        await this.loadToolsData();
    }

    showLoadingState() {
        // Create loading overlay as a fixed position element without destroying existing DOM
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center;';
        loadingDiv.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading 317+ AI tools...</p>
                <div class="loading-progress" style="width: 300px; margin: 0 auto;">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <p class="loading-percentage">0%</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }

    updateLoadingProgress(progress) {
        const progressBar = document.querySelector('.progress-bar');
        const percentage = document.querySelector('.loading-percentage');
        
        if (progressBar) {
            progressBar.style.width = `${progress.percentage}%`;
        }
        if (percentage) {
            percentage.textContent = `${progress.percentage}% (${progress.current}/${progress.total} tools)`;
        }
    }

    onDataLoadComplete(stats) {
        console.log('Data load complete:', stats);
        this.isLoading = false;
        this.performanceMetrics.loadTime = stats.loadTime;
        
        // Set the displayed tools from the processor
        this.allTools = this.dataProcessor.tools;
        this.displayedTools = [...this.allTools];
        
        console.log('Setting displayed tools:', this.displayedTools.length);
        
        // Get initial metrics
        const metrics = this.dataProcessor.getMetrics();
        this.updateDashboardMetrics(metrics);
        
        // Remove loading overlay and render
        this.removeLoadingState();
        this.renderTools();
        
        // Initialize virtual scrolling after render
        this.setupVirtualScrolling();
    }

    onDataLoadError(error) {
        console.error('Failed to load tools data:', error);
        this.isLoading = false;
        this.showErrorState(error);
    }

    removeLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        // Force check if grids exist after removing overlay
        const execGrid = document.getElementById('executiveGrid');
        const techGrid = document.getElementById('technicalGrid');
        console.log('After removing loading state - Executive grid:', !!execGrid, 'Technical grid:', !!techGrid);
    }

    showErrorState(error) {
        const container = document.querySelector('.dual-view-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to Load Tools Data</h3>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }

    async loadToolsData() {
        try {
            // Wait for unified tools data to be available
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const toolsData = window.unifiedToolsData || (typeof unifiedToolsData !== 'undefined' ? unifiedToolsData : null);
            
            if (toolsData && toolsData.tools) {
                // Process tools with enhanced processor
                await this.dataProcessor.loadTools(toolsData.tools);
                this.allTools = this.dataProcessor.tools;
                this.displayedTools = [...this.allTools];
                
                // Log for debugging
                console.log('Tools loaded:', this.allTools.length);
                console.log('Displayed tools:', this.displayedTools.length);
            } else {
                throw new Error('Unified tools data not found');
            }
        } catch (error) {
            console.error('Error loading tools data:', error);
            this.onDataLoadError(error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('dualViewSearch');
        if (searchInput) {
            // Debounced search for performance
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
            
            // Search suggestions
            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }
    }

    performSearch(query) {
        const startTime = performance.now();
        
        if (!query) {
            this.displayedTools = this.applyCurrentFilters(this.allTools);
        } else {
            const searchResults = this.dataProcessor.search(query, {
                filters: this.currentFilters
            });
            this.displayedTools = searchResults;
        }
        
        this.performanceMetrics.searchTime = performance.now() - startTime;
        console.log(`Search completed in ${this.performanceMetrics.searchTime.toFixed(2)}ms`);
        
        this.renderTools();
        this.updateResultsCount();
    }

    showSearchSuggestions() {
        // TODO: Implement search suggestions UI
    }

    setupFilters() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const selectedCategories = Array.from(e.target.selectedOptions)
                    .map(option => option.value);
                this.currentFilters.categories = selectedCategories.length ? selectedCategories : null;
                this.applyFilters();
            });
        }
        
        // Impact score range
        const impactRange = document.getElementById('impactRange');
        if (impactRange) {
            impactRange.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.currentFilters.impactRange = [value, 100];
                document.getElementById('impactValue').textContent = value;
                this.applyFilters();
            });
        }
        
        // Complexity filter
        const complexityCheckboxes = document.querySelectorAll('.complexity-filter');
        complexityCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selected = Array.from(complexityCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => parseInt(cb.value));
                this.currentFilters.complexity = selected.length ? selected : null;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        const searchInput = document.getElementById('dualViewSearch');
        const query = searchInput ? searchInput.value : '';
        
        if (query) {
            this.performSearch(query);
        } else {
            this.displayedTools = this.applyCurrentFilters(this.allTools);
            this.renderTools();
            this.updateResultsCount();
        }
    }

    applyCurrentFilters(tools) {
        return this.dataProcessor.applyFilters(tools, this.currentFilters);
    }

    setupDensityControl() {
        const densityButtons = document.querySelectorAll('.density-btn');
        densityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const density = e.target.dataset.density;
                this.setDensity(density);
            });
        });
    }

    setDensity(density) {
        document.body.setAttribute('data-density', density);
        document.querySelectorAll('.density-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.density === density);
        });
        
        // Trigger re-render if virtual scrolling is active
        if (this.virtualScroller) {
            this.virtualScroller.forceUpdate();
        }
    }

    setupViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        if (view === this.currentView) return;
        
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Hide all views
        document.querySelectorAll('.view-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected view
        const viewContent = document.querySelector(`.view-content[data-view="${view}"]`);
        if (viewContent) {
            viewContent.style.display = 'block';
        }
        
        // Re-render tools for the selected view
        this.renderTools();
    }

    setupVirtualScrolling() {
        // Note: In a real implementation, you would use react-window or similar
        // For now, we'll implement basic lazy loading
        const container = this.currentView === 'executive' 
            ? document.getElementById('executiveGrid')
            : document.getElementById('technicalGrid');
            
        if (container) {
            // Add click event delegation for tool cards
            container.addEventListener('click', (e) => {
                const toolCard = e.target.closest('.tool-card');
                if (toolCard && !toolCard.classList.contains('lazy-card')) {
                    const toolId = toolCard.dataset.toolId;
                    if (toolId) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openToolModal(toolId);
                    }
                }
            });
            
            // Intersection Observer for lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const toolCard = entry.target;
                        this.loadCardContent(toolCard);
                        observer.unobserve(toolCard);
                    }
                });
            }, {
                rootMargin: '100px'
            });
            
            // Observe all tool cards
            container.querySelectorAll('.tool-card[data-lazy="true"]').forEach(card => {
                observer.observe(card);
            });
        }
    }

    loadCardContent(card) {
        // Replace placeholder with actual content
        const toolId = card.dataset.toolId;
        const tool = this.displayedTools.find(t => t.id === toolId);
        
        if (tool) {
            if (this.currentView === 'executive') {
                card.innerHTML = this.createExecutiveCardContent(tool);
            } else {
                card.innerHTML = this.createTechnicalCardContent(tool);
            }
            card.dataset.lazy = 'false';
        }
    }

    renderTools() {
        const startTime = performance.now();
        
        if (this.currentView === 'executive') {
            this.renderExecutiveView();
        } else {
            this.renderTechnicalView();
        }
        
        this.performanceMetrics.renderTime = performance.now() - startTime;
        console.log(`Render completed in ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
        
        this.updateStats();
        this.setupVirtualScrolling();
    }

    renderExecutiveView() {
        const grid = document.getElementById('executiveGrid');
        console.log('Executive grid element:', grid);
        if (!grid) {
            console.error('Executive grid not found!');
            return;
        }
        
        console.log('Rendering executive view with', this.displayedTools.length, 'tools');
        
        // Log first tool structure for debugging
        if (this.displayedTools.length > 0) {
            console.log('First tool structure:', this.displayedTools[0]);
            console.log('First tool id:', this.displayedTools[0].id);
            console.log('Tool id type:', typeof this.displayedTools[0].id);
        }
        
        // Render first 30 tools immediately, lazy load the rest
        const immediateTools = this.displayedTools.slice(0, 30);
        const lazyTools = this.displayedTools.slice(30);
        
        console.log('Immediate tools:', immediateTools.length, 'Lazy tools:', lazyTools.length);
        
        const cards = [
            ...immediateTools.map(tool => this.createExecutiveCard(tool, false)),
            ...lazyTools.map(tool => this.createExecutiveCard(tool, true))
        ];
        
        console.log('Generated', cards.length, 'cards');
        grid.innerHTML = cards.join('');
    }

    renderTechnicalView() {
        const grid = document.getElementById('technicalGrid');
        if (!grid) return;
        
        // Render first 30 tools immediately, lazy load the rest
        const immediateTools = this.displayedTools.slice(0, 30);
        const lazyTools = this.displayedTools.slice(30);
        
        grid.innerHTML = [
            ...immediateTools.map(tool => this.createTechnicalCard(tool, false)),
            ...lazyTools.map(tool => this.createTechnicalCard(tool, true))
        ].join('');
    }

    createExecutiveCard(tool, isLazy = false) {
        try {
            if (isLazy) {
                return `
                    <div class="tool-card lazy-card" data-tool-id="${tool.id}" data-lazy="true">
                        <div class="card-skeleton">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-score"></div>
                            <div class="skeleton-content"></div>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="tool-card" data-tool-id="${tool.id}">
                    ${this.createExecutiveCardContent(tool)}
                </div>
            `;
        } catch (error) {
            console.error('Error creating card for tool:', tool, error);
            return '';
        }
    }

    createExecutiveCardContent(tool) {
        const impactClass = tool.businessImpactScore >= 80 ? 'high' : 
                           tool.businessImpactScore >= 50 ? 'medium' : 'low';
        
        return `
            <div class="card-header">
                <h3 class="tool-name">${tool.displayName}</h3>
                <span class="category-tag">${tool.category}</span>
            </div>
            
            <div class="impact-visualization">
                <div class="impact-circle ${impactClass}">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="10"
                                stroke-dasharray="${tool.businessImpactScore * 2.83} 283"
                                transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="impact-score-text">${tool.businessImpactScore}</div>
                </div>
                <p class="impact-label">Business Impact</p>
            </div>
            
            <div class="executive-metrics">
                <div class="metric-row">
                    <i class="fas fa-chart-line"></i>
                    <span class="metric-label">ROI Score:</span>
                    <span class="metric-value">${tool.roiScore || 'N/A'}</span>
                </div>
                <div class="metric-row">
                    <i class="fas fa-clock"></i>
                    <span class="metric-label">Time to Value:</span>
                    <span class="metric-value">${tool.timeToValue}</span>
                </div>
                <div class="metric-row">
                    <i class="fas fa-dollar-sign"></i>
                    <span class="metric-label">Cost:</span>
                    <span class="metric-value">${tool.formattedPrice}</span>
                </div>
                <div class="metric-row">
                    <i class="fas fa-shield-alt"></i>
                    <span class="metric-label">Risk:</span>
                    <span class="metric-value risk-${tool.riskLevel.toLowerCase()}">${tool.riskLevel}</span>
                </div>
            </div>
            
            <div class="compliance-section">
                ${tool.compliance.map(badge => 
                    `<span class="compliance-badge">${badge}</span>`
                ).join('')}
            </div>
            
            <p class="executive-summary">${tool.brief_purpose_summary.substring(0, 120)}...</p>
            
            <div class="card-footer">
                <span class="data-completeness">
                    <i class="fas fa-database"></i>
                    ${tool.dataCompleteness}% complete
                </span>
                <button class="quick-action" onclick="event.stopPropagation(); window.enhancedDualView.compareTools('${tool.id}')">
                    <i class="fas fa-balance-scale"></i> Compare
                </button>
            </div>
        `;
    }

    createTechnicalCard(tool, isLazy = false) {
        if (isLazy) {
            return `
                <div class="tool-card lazy-card" data-tool-id="${tool.id}" data-lazy="true">
                    <div class="card-skeleton">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-badges"></div>
                        <div class="skeleton-content"></div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="tool-card" data-tool-id="${tool.id}">
                ${this.createTechnicalCardContent(tool)}
            </div>
        `;
    }

    createTechnicalCardContent(tool) {
        const integrations = tool.integrations || [];
        const features = tool.features || [];
        
        return `
            <div class="card-header">
                <h3 class="tool-name">${tool.displayName}</h3>
                <div class="complexity-indicator">
                    ${this.renderComplexityStars(tool.complexityScore)}
                </div>
            </div>
            
            <div class="technical-badges">
                ${integrations.slice(0, 4).map(int => 
                    `<span class="integration-badge"><i class="fas fa-plug"></i> ${int}</span>`
                ).join('')}
                ${integrations.length > 4 ? 
                    `<span class="more-badge">+${integrations.length - 4} more</span>` : ''
                }
            </div>
            
            <div class="feature-highlights">
                <h4>Key Features:</h4>
                <ul>
                    ${features.slice(0, 3).map(feature => 
                        `<li>${feature.substring(0, 80)}${feature.length > 80 ? '...' : ''}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="technical-specs">
                <div class="spec-item">
                    <i class="fas fa-cog"></i>
                    <span>Learning Curve: ${tool.learning_curve || 'Not specified'}</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-globe"></i>
                    <span>Availability: ${tool.geo_regulatory_limitations ? 
                        (tool.geo_regulatory_limitations.substring(0, 30) + '...') : 
                        'Global'}</span>
                </div>
            </div>
            
            <div class="use-cases-preview">
                <h4>PR Use Cases:</h4>
                <div class="use-case-tags">
                    ${(tool.useCases || []).slice(0, 2).map(useCase => 
                        `<span class="use-case-tag">${useCase.substring(0, 40)}...</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="card-footer">
                <a href="${tool.url}" target="_blank" class="tool-link" onclick="event.stopPropagation()">
                    <i class="fas fa-external-link-alt"></i> Visit
                </a>
                <button class="quick-action" onclick="event.stopPropagation(); window.enhancedDualView.showIntegrationCode('${tool.id}')">
                    <i class="fas fa-code"></i> Code
                </button>
            </div>
        `;
    }

    renderComplexityStars(complexity) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(`<i class="fas fa-star ${i <= complexity ? 'filled' : 'empty'}"></i>`);
        }
        return stars.join('');
    }

    updateStats() {
        const metrics = this.dataProcessor.getMetrics();
        this.updateDashboardMetrics(metrics);
        this.updateResultsCount();
    }

    updateDashboardMetrics(metrics) {
        // Update metric cards
        const updateMetric = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateMetric('totalTools', metrics.totalTools);
        updateMetric('highImpactTools', metrics.highImpactTools);
        updateMetric('evaluatedTools', metrics.completeDataTools);
        updateMetric('enterpriseReady', this.displayedTools.filter(t => 
            t.compliance.some(c => ['SOC2', 'GDPR', 'HIPAA'].includes(c))
        ).length);
        
        // Update category breakdown if available
        if (metrics.categoriesCount) {
            updateMetric('totalCategories', metrics.categoriesCount);
        }
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `Showing ${this.displayedTools.length} of ${this.allTools.length} tools`;
        }
    }

    // Modal functionality
    openToolModal(toolId) {
        console.log('Opening modal for tool:', toolId);
        // Try to find by exact match first, then by string/number conversion
        let tool = this.allTools.find(t => t.id === toolId);
        if (!tool) {
            // Try converting to string or number
            tool = this.allTools.find(t => 
                t.id === String(toolId) || 
                t.id === Number(toolId) ||
                String(t.id) === String(toolId)
            );
        }
        if (!tool) {
            console.error('Tool not found:', toolId);
            console.log('Available tool IDs:', this.allTools.slice(0, 5).map(t => ({ id: t.id, type: typeof t.id })));
            return;
        }
        
        const modal = document.getElementById('toolModal');
        const modalBody = document.getElementById('modalBody');
        
        console.log('Modal element:', modal, 'Modal body:', modalBody);
        
        if (modal && modalBody) {
            modalBody.innerHTML = this.currentView === 'executive' 
                ? this.renderExecutiveModal(tool)
                : this.renderTechnicalModal(tool);
            
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
        } else {
            console.error('Modal elements not found');
        }
    }

    renderExecutiveModal(tool) {
        return `
            <div class="modal-header">
                <h2>${tool.displayName}</h2>
                <span class="category-tag large">${tool.category}</span>
            </div>
            
            <div class="modal-section">
                <h3>Executive Summary</h3>
                <p>${tool.brief_purpose_summary}</p>
            </div>
            
            <div class="modal-section">
                <h3>Business Impact Analysis</h3>
                <div class="impact-details">
                    <div class="impact-chart">
                        <canvas id="impactChart"></canvas>
                    </div>
                    <div class="impact-metrics">
                        <div class="metric">
                            <span class="label">Impact Score:</span>
                            <span class="value">${tool.businessImpactScore}/100</span>
                        </div>
                        <div class="metric">
                            <span class="label">ROI Score:</span>
                            <span class="value">${tool.roiScore}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Time to Value:</span>
                            <span class="value">${tool.timeToValue}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Pricing Model</h3>
                <p>${tool.pricing_model || 'Pricing information not available'}</p>
            </div>
            
            <div class="modal-section">
                <h3>Pros & Cons</h3>
                <div class="pros-cons-grid">
                    <div class="pros">
                        <h4><i class="fas fa-check-circle"></i> Pros</h4>
                        <ul>
                            ${(tool.pros_cons.pros || []).map(pro => 
                                `<li>${pro}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="cons">
                        <h4><i class="fas fa-times-circle"></i> Cons</h4>
                        <ul>
                            ${(tool.pros_cons.cons || []).map(con => 
                                `<li>${con}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            ${tool.case_studies ? `
                <div class="modal-section">
                    <h3>Case Studies</h3>
                    <p>${tool.case_studies}</p>
                </div>
            ` : ''}
            
            <div class="modal-actions">
                <a href="${tool.url}" target="_blank" class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
                <button class="btn btn-secondary" onclick="window.enhancedDualView.exportToolData('${tool.id}')">
                    <i class="fas fa-download"></i> Export Data
                </button>
            </div>
        `;
    }

    renderTechnicalModal(tool) {
        return `
            <div class="modal-header">
                <h2>${tool.displayName}</h2>
                <div class="technical-tags">
                    ${tool.integrations.map(int => 
                        `<span class="integration-badge">${int}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Technical Overview</h3>
                <p>${tool.brief_purpose_summary}</p>
            </div>
            
            <div class="modal-section">
                <h3>Features Breakdown</h3>
                <ul class="features-list">
                    ${(tool.features || []).map(feature => 
                        `<li><i class="fas fa-check"></i> ${feature}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Integration Capabilities</h3>
                <p>${tool.integration_potential || 'Integration details not available'}</p>
            </div>
            
            <div class="modal-section">
                <h3>Learning Curve & Implementation</h3>
                <div class="implementation-details">
                    <p><strong>Learning Curve:</strong> ${tool.learning_curve || 'Not specified'}</p>
                    <p><strong>Complexity Score:</strong> ${this.renderComplexityStars(tool.complexityScore)}</p>
                    <p><strong>Estimated Time to Implement:</strong> ${tool.timeToValue}</p>
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Use Cases in PR/Marketing</h3>
                <ul class="use-cases-list">
                    ${(tool.useCases || []).map(useCase => 
                        `<li>${useCase}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Geographic & Regulatory Information</h3>
                <p>${tool.geo_regulatory_limitations || 'No specific limitations noted'}</p>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.enhancedDualView.showIntegrationCode('${tool.id}')">
                    <i class="fas fa-code"></i> View Integration Code
                </button>
                <a href="${tool.url}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-book"></i> Documentation
                </a>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('toolModal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('fade-in', 'fade-out');
            }, 300);
        }
    }

    // Additional functionality
    compareTools(toolId) {
        // TODO: Implement tool comparison functionality
        console.log('Compare tool:', toolId);
    }

    showIntegrationCode(toolId) {
        // TODO: Show integration code snippets
        console.log('Show integration code for:', toolId);
    }

    exportToolData(toolId) {
        const tool = this.allTools.find(t => t.id === toolId);
        if (tool) {
            const dataStr = JSON.stringify(tool, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tool.id}-data.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    // Performance monitoring
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            toolsLoaded: this.allTools.length,
            toolsDisplayed: this.displayedTools.length,
            cacheSize: this.dataProcessor.cache.size,
            dataQuality: {
                averageCompleteness: Math.round(
                    this.allTools.reduce((sum, tool) => sum + tool.dataCompleteness, 0) / this.allTools.length
                ),
                missingDataTools: this.allTools.filter(t => t.dataCompleteness < 50).length
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for required elements...');
    
    // Check if required DOM elements exist
    const executiveGrid = document.getElementById('executiveGrid');
    const technicalGrid = document.getElementById('technicalGrid');
    
    console.log('Executive grid found:', !!executiveGrid);
    console.log('Technical grid found:', !!technicalGrid);
    
    // Make sure enhanced data processor is loaded
    if (typeof EnhancedDataProcessor === 'undefined') {
        console.error('EnhancedDataProcessor not loaded');
        return;
    }
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
        console.log('Initializing EnhancedDualViewManager...');
        window.enhancedDualView = new EnhancedDualViewManager();
    }, 100);
});

// Close modal on outside click
window.addEventListener('click', (event) => {
    const modal = document.getElementById('toolModal');
    if (event.target === modal) {
        window.enhancedDualView.closeModal();
    }
});