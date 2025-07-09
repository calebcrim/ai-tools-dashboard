/**
 * Enhanced AI Tools Dashboard - Complete Implementation
 * Includes all new features: advanced filtering, comparison, ratings, export
 */

// Enhanced Global State
let allTools = [];
let filteredTools = [];
let virtualScroll = null;
let modalTabs = null;
let exportSystem = null;
let filterSystem = null;
let unifiedFilterBar = null;
let comparisonTools = [];
let currentSortCriteria = 'name';
let currentSortDirection = 'asc';
let currentView = 'grid';
let isInitializing = false;

// Initialize enhanced systems
document.addEventListener('DOMContentLoaded', function() {
    // Initialize export system if available
    if (typeof EnhancedExportSystem !== 'undefined') {
        exportSystem = new EnhancedExportSystem();
    }
    
    // Load tools data
    loadToolsData();
});

/**
 * Enhanced tool loading
 */
async function loadToolsData() {
    try {
        const container = document.getElementById('toolsContainer');
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading AI tools database...</p>
            </div>
        `;
        
        // Load unified data
        if (typeof window.unifiedToolsData !== 'undefined' && window.unifiedToolsData.tools) {
            allTools = window.unifiedToolsData.tools;
            console.log(`✅ Loaded ${allTools.length} tools from unified data`);
            
            // Check for duplicates in metadata
            const metadata = window.unifiedToolsData.metadata;
            if (metadata && metadata.duplicatesRemoved > 0) {
                console.log(`🧹 Duplicates removed during build: ${metadata.duplicatesRemoved}`);
                showNotification(`Loaded ${allTools.length} unique tools (${metadata.duplicatesRemoved} duplicates removed)`, 'success');
            }
        } else {
            console.warn('No unified data found, using sample tools');
            allTools = getSampleTools();
        }
        
        // Initialize systems
        filteredTools = allTools;
        if (typeof AdvancedFilterSystem !== 'undefined') {
            filterSystem = new AdvancedFilterSystem(allTools);
        }
        
        // Load search from URL if present
        const params = new URLSearchParams(window.location.search);
        const searchQuery = params.get('search');
        if (searchQuery) {
            const headerSearchInput = document.getElementById('headerSearchInput');
            if (headerSearchInput) {
                headerSearchInput.value = searchQuery;
            }
        }
        
        // Initialize the app
        initializeEnhancedApp();
        
    } catch (error) {
        console.error('Error in loadToolsData:', error);
        console.error('Error stack:', error.stack);
        
        // Only use sample tools if we actually failed to load data
        if (allTools.length === 0) {
            showNotification('Error loading tools data. Using sample data.', 'error');
            allTools = getSampleTools();
            filteredTools = allTools;
        }
        
        // Don't re-initialize if already initialized
        if (!window.unifiedFilterBar) {
            initializeEnhancedApp();
        }
    }
}

/**
 * Enhanced app initialization
 */
function initializeEnhancedApp() {
    if (isInitializing) {
        console.log('Already initializing, skipping duplicate call');
        return;
    }
    isInitializing = true;
    
    updateStatistics();
    setupEnhancedEventListeners();
    
    // Initialize unified filter bar
    if (typeof UnifiedFilterBar !== 'undefined' && !window.unifiedFilterBar) {
        unifiedFilterBar = new UnifiedFilterBar(allTools, (filtered) => {
            filteredTools = filtered;
            updateStatistics();
            
            const container = document.getElementById('toolsContainer');
            
            // Initialize virtual scroll on first callback if not already initialized
            if (!virtualScroll && container) {
                container.innerHTML = '';
                virtualScroll = new VirtualScroll(
                    container,
                    filteredTools,
                    renderEnhancedToolCard,
                    { itemHeight: 320, buffer: 5 }
                );
            } else if (virtualScroll) {
                virtualScroll.updateItems(filteredTools);
                virtualScroll.scrollToTop();
            }
        });
    } else if (!window.unifiedFilterBar) {
        // Fallback to old filters if unified filter bar not loaded
        initializeFilters();
    }
    
    const container = document.getElementById('toolsContainer');
    
    // Initialize modal tabs
    modalTabs = new ModalTabs();
    
    // Don't initialize virtual scroll yet - wait for unified filter bar to trigger it
    if (!window.unifiedFilterBar) {
        // Only initialize virtual scroll if no unified filter bar (legacy mode)
        container.innerHTML = '';
        virtualScroll = new VirtualScroll(
            container,
            filteredTools,
            renderEnhancedToolCard,
            { itemHeight: 320, buffer: 5 }
        );
    } else {
        // Clear loading message for unified filter bar mode
        // Virtual scroll will be initialized when filter callback is triggered
        container.innerHTML = '<div class="loading"><p>Applying filters...</p></div>';
    }
    
    // Show loading completion
    showNotification('CrimIntelligence loaded successfully!', 'success');
}

/**
 * Setup enhanced event listeners
 */
function setupEnhancedEventListeners() {
    // Enhanced search - connect to unified filter bar if available
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((event) => {
            if (window.unifiedFilterBar) {
                // Trigger unified filter bar filtering when search changes
                window.unifiedFilterBar.applyFilters();
            } else {
                // Fallback to regular search
                handleEnhancedSearch(event);
            }
        }, 300));
    }
    
    // Export button - update to use new modal
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.removeEventListener('click', exportTools);
        exportBtn.addEventListener('click', openExportModal);
    }
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            currentView = view;
            
            if (virtualScroll) {
                virtualScroll.updateDimensions();
                virtualScroll.render();
            }
        });
    });
    
    // Sort controls
    const sortSelect = document.getElementById('sortCriteria');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }
    
    // Advanced filters removed - now handled by unified filter bar
    
    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeExportModal();
            // Advanced filters panel removed
            if (document.getElementById('comparisonPanel').classList.contains('active')) {
                toggleComparison();
            }
        }
    });
}

/**
 * Enhanced search with smart filtering
 */
function handleEnhancedSearch(event) {
    const query = event.target.value.trim();
    
    // If unified filter bar is active, let it handle the search
    if (window.unifiedFilterBar) {
        window.unifiedFilterBar.applyFilters();
        return;
    }
    
    // Legacy search handling
    if (query === '') {
        filteredTools = filterSystem ? filterSystem.filteredTools : allTools;
    } else {
        filteredTools = filterSystem ? filterSystem.searchTools(query) : searchTools(query);
    }
    
    updateStatistics();
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
}

/**
 * Fallback search function
 */
function searchTools(query) {
    const searchTerm = query.toLowerCase();
    return allTools.filter(tool => {
        const searchableText = [
            tool.tool_name || '',
            tool.brief_purpose_summary || '',
            tool.feature_breakdown || '',
            tool.category || '',
            ...(tool.tags || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
    });
}

/**
 * Enhanced tool card rendering
 */
function renderEnhancedToolCard(tool) {
    const userRating = exportSystem ? exportSystem.getUserRating(tool.id) : null;
    const completeness = calculateToolCompleteness(tool);
    const isInComparison = comparisonTools.some(t => t.id === tool.id);
    
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.toolId = tool.id;
    card.dataset.category = tool.category;
    card.dataset.source = tool.source;
    
    // Build stars HTML
    const starsHtml = Array.from({length: 5}, (_, i) => {
        const starClass = userRating && i < userRating ? 'active' : '';
        return `<i class="fas fa-star ${starClass}"></i>`;
    }).join('');
    
    const iconClass = getIconClass(tool.icon || tool.category);
    const toolName = tool.tool_name || tool.name;
    const description = tool.brief_purpose_summary || tool.description;
    
    card.innerHTML = `
        <div class="tool-header">
            <div class="tool-icon ${tool.icon || tool.category}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="tool-info">
                <h3>${escapeHtml(toolName)}</h3>
                <a href="https://${tool.url}" target="_blank" class="tool-url" onclick="event.stopPropagation()">
                    ${tool.url} <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
        <p class="tool-description">${escapeHtml(description)}</p>
        <div class="tool-tags">
            ${(tool.tags || []).slice(0, 5).map(tag => `<span class="tool-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        
        <!-- User Rating Display -->
        <div class="tool-rating">
            <div class="stars">${starsHtml}</div>
            <span class="rating-text">
                ${userRating ? `${userRating}/5` : 'Not rated'}
            </span>
        </div>
        
        <!-- Data Completeness Indicator -->
        <div class="completeness-indicator">
            <div class="completeness-bar">
                <div class="completeness-fill" style="width: ${completeness}%"></div>
            </div>
            <span class="completeness-text">${completeness}% complete</span>
        </div>
        
        <div class="tool-actions">
            <button class="tool-btn" onclick="event.stopPropagation(); toggleToolComparison(${tool.id})">
                <i class="fas fa-balance-scale"></i> ${isInComparison ? 'Remove' : 'Compare'}
            </button>
            <button class="tool-btn primary" onclick="event.stopPropagation(); openEnhancedToolModal(${tool.id})">
                <i class="fas fa-info-circle"></i> Details
            </button>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => openEnhancedToolModal(tool.id));
    
    return card;
}

/**
 * Calculate tool completeness percentage
 */
function calculateToolCompleteness(tool) {
    const fields = [
        'tool_name', 'url', 'brief_purpose_summary', 'feature_breakdown',
        'pricing_model', 'pros_cons_limitations', 'integration_potential',
        'learning_curve', 'use_cases_in_pr', 'tags'
    ];
    
    let completedFields = 0;
    fields.forEach(field => {
        const value = tool[field];
        if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            completedFields++;
        }
    });
    
    return Math.round((completedFields / fields.length) * 100);
}

/**
 * Enhanced modal opening
 */
function openEnhancedToolModal(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    if (modalTabs) {
        modalTabs.showToolDetails(toolId);
    } else {
        // Fallback to basic modal
        openToolModal(toolId);
    }
}

// Fallback for compatibility
function openToolModal(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    const modal = document.getElementById('toolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = tool.tool_name || tool.name;
    
    modalBody.innerHTML = `
        <div class="tool-detail">
            <p>${tool.brief_purpose_summary || tool.description}</p>
            <a href="https://${tool.url}" target="_blank" class="tool-link">
                Visit ${tool.tool_name || tool.name} →
            </a>
        </div>
    `;
    
    modal.style.display = 'block';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Export modal functions
 */
function openExportModal() {
    const modal = document.getElementById('exportModal');
    
    // Update counts
    document.getElementById('filteredCount').textContent = filteredTools.length;
    document.getElementById('totalCount').textContent = allTools.length;
    
    modal.style.display = 'block';
}

window.closeExportModal = function() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
}

window.executeExport = function() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const scope = document.querySelector('input[name="exportScope"]:checked').value;
    
    const toolsToExport = scope === 'all' ? allTools : filteredTools;
    
    if (exportSystem) {
        exportSystem.exportTools(toolsToExport, format);
    } else {
        // Fallback export
        exportTools(toolsToExport, format);
    }
    
    closeExportModal();
    showNotification(`Exported ${toolsToExport.length} tools (${format.toUpperCase()})`, 'success');
}

// Fallback export function
function exportTools(tools = filteredTools, format = 'json') {
    let dataStr;
    let filename;
    let mimeType;
    
    if (format === 'csv') {
        // CSV export
        const headers = ['Name', 'URL', 'Category', 'Description', 'Tags'];
        const csvData = [
            headers.join(','),
            ...tools.map(tool => {
                return [
                    `"${(tool.tool_name || '').replace(/"/g, '""')}"`,
                    `"${(tool.url || '').replace(/"/g, '""')}"`,
                    `"${(tool.category || '').replace(/"/g, '""')}"`,
                    `"${(tool.brief_purpose_summary || '').replace(/"/g, '""')}"`,
                    `"${(tool.tags || []).join(', ').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');
        
        dataStr = csvData;
        filename = `ai-tools-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
    } else {
        // JSON export
        dataStr = JSON.stringify(tools, null, 2);
        filename = `ai-tools-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    }
    
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', filename);
    linkElement.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Advanced filtering functions
 */
window.toggleAdvancedFilters = function() {
    const panel = document.getElementById('advancedFilters');
    panel.classList.toggle('active');
}

window.applyAdvancedFilters = function() {
    const activeCategories = Array.from(document.querySelectorAll('#categoryFilters .filter-chip.active'))
        .map(chip => chip.dataset.category)
        .filter(cat => cat !== 'all');
    
    const activeSources = Array.from(document.querySelectorAll('#sourceFilters .filter-chip.active'))
        .map(chip => chip.dataset.source)
        .filter(source => source !== 'all');
    
    const activeFeatures = Array.from(document.querySelectorAll('#featureFilters .filter-chip.active'))
        .map(chip => chip.dataset.feature);
    
    const pricingModels = Array.from(document.querySelectorAll('[data-filter="pricing"]:checked'))
        .map(cb => cb.value);
    
    const features = Array.from(document.querySelectorAll('[data-filter="features"]:checked'))
        .map(cb => cb.value);
    
    const minRating = parseInt(document.getElementById('minRating')?.value || '0');
    const minCompleteness = parseInt(document.getElementById('completenessSlider')?.value || '0');
    
    // Apply filters
    filteredTools = allTools.filter(tool => {
        // Category filter
        if (activeCategories.length > 0 && !activeCategories.includes(tool.category)) {
            return false;
        }
        
        // Source filter
        if (activeSources.length > 0 && !activeSources.includes(tool.source)) {
            return false;
        }
        
        // Feature filters from existing UI
        if (activeFeatures.length > 0) {
            const hasFeatures = activeFeatures.every(feature => {
                switch (feature) {
                    case 'api':
                        return (tool.integration_potential || '').toLowerCase().includes('api');
                    case 'free':
                        return (tool.pricing_model || '').toLowerCase().includes('free');
                    case 'enterprise':
                        return (tool.pricing_model || '').toLowerCase().includes('enterprise');
                    case 'integration':
                        return tool.integration_potential;
                    default:
                        return true;
                }
            });
            if (!hasFeatures) return false;
        }
        
        // Advanced pricing filters
        if (pricingModels.length > 0) {
            const pricingText = (tool.pricing_model || '').toLowerCase();
            const matchesPricing = pricingModels.some(model => pricingText.includes(model));
            if (!matchesPricing) return false;
        }
        
        // Rating filter
        if (minRating > 0 && exportSystem) {
            const rating = exportSystem.getUserRating(tool.id) || 0;
            if (rating < minRating) return false;
        }
        
        // Completeness filter
        if (minCompleteness > 0) {
            const completeness = calculateToolCompleteness(tool);
            if (completeness < minCompleteness) return false;
        }
        
        return true;
    });
    
    updateStatistics();
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
    
    showNotification(`Showing ${filteredTools.length} tools`, 'info');
}

window.clearAllFilters = function() {
    // Clear existing filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        if (chip.dataset.category === 'all' || chip.dataset.source === 'all') {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
    // Clear checkboxes
    document.querySelectorAll('[data-filter]').forEach(cb => cb.checked = false);
    
    // Reset sliders and selects
    const completenessSlider = document.getElementById('completenessSlider');
    if (completenessSlider) {
        completenessSlider.value = 0;
        document.getElementById('completenessValue').textContent = '0%';
    }
    
    const minRating = document.getElementById('minRating');
    if (minRating) minRating.value = '0';
    
    // Clear search
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) searchInput.value = '';
    
    // Reset to all tools
    filteredTools = allTools;
    updateStatistics();
    
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
    
    showNotification('Filters cleared', 'info');
}

/**
 * Comparison functions
 */
window.toggleToolComparison = function(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    const index = comparisonTools.findIndex(t => t.id === toolId);
    
    if (index > -1) {
        // Remove from comparison
        comparisonTools.splice(index, 1);
        showNotification(`${tool.tool_name} removed from comparison`, 'info');
    } else {
        // Add to comparison (max 3)
        if (comparisonTools.length >= 3) {
            showNotification('Maximum 3 tools can be compared', 'warning');
            
            // Uncheck the checkbox
            const checkbox = document.querySelector(`input[data-tool-id="${toolId}"]`);
            if (checkbox) checkbox.checked = false;
            
            return;
        }
        comparisonTools.push(tool);
        showNotification(`${tool.tool_name} added to comparison`, 'success');
    }
    
    updateComparisonCount();
    updateComparisonPanel();
}

window.toggleComparison = function() {
    const panel = document.getElementById('comparisonPanel');
    panel.classList.toggle('active');
}

window.clearComparison = function() {
    comparisonTools = [];
    updateComparisonCount();
    updateComparisonPanel();
    
    // Uncheck all comparison checkboxes
    document.querySelectorAll('input[data-tool-id]').forEach(cb => cb.checked = false);
    
    showNotification('Comparison cleared', 'info');
}

window.exportComparison = function() {
    if (comparisonTools.length === 0) {
        showNotification('No tools selected for comparison', 'warning');
        return;
    }
    
    if (exportSystem) {
        exportSystem.exportComparison(comparisonTools);
    } else {
        exportTools(comparisonTools, 'json');
    }
    
    showNotification('Comparison exported', 'success');
}

function updateComparisonCount() {
    document.querySelectorAll('#comparisonCount, #comparisonCountBtn').forEach(el => {
        el.textContent = comparisonTools.length;
    });
}

function updateComparisonPanel() {
    const container = document.getElementById('comparisonTools');
    if (!container) return;
    
    if (comparisonTools.length === 0) {
        container.innerHTML = '<p class="no-comparison">No tools selected for comparison</p>';
        return;
    }
    
    container.innerHTML = comparisonTools.map(tool => `
        <div class="comparison-card">
            <h4>${escapeHtml(tool.tool_name)}</h4>
            <p class="comparison-url">${tool.url}</p>
            <p class="comparison-category">${formatCategory(tool.category)}</p>
            <button class="btn-sm btn-secondary" onclick="removeFromComparison(${tool.id})">
                <i class="fas fa-times"></i> Remove
            </button>
        </div>
    `).join('');
}

window.removeFromComparison = function(toolId) {
    toggleToolComparison(toolId);
    
    // Uncheck the checkbox if visible
    const checkbox = document.querySelector(`input[data-tool-id="${toolId}"]`);
    if (checkbox) checkbox.checked = false;
}

/**
 * Sorting functions
 */
window.applySorting = function() {
    const criteria = document.getElementById('sortCriteria').value;
    currentSortCriteria = criteria;
    
    filteredTools.sort((a, b) => {
        let valueA, valueB;
        
        switch (criteria) {
            case 'name':
                valueA = (a.tool_name || '').toLowerCase();
                valueB = (b.tool_name || '').toLowerCase();
                break;
            case 'category':
                valueA = a.category || '';
                valueB = b.category || '';
                break;
            case 'rating':
                valueA = exportSystem ? exportSystem.getUserRating(a.id) || 0 : 0;
                valueB = exportSystem ? exportSystem.getUserRating(b.id) || 0 : 0;
                break;
            case 'completeness':
                valueA = calculateToolCompleteness(a);
                valueB = calculateToolCompleteness(b);
                break;
            default:
                valueA = a[criteria] || '';
                valueB = b[criteria] || '';
        }
        
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return currentSortDirection === 'desc' ? -comparison : comparison;
    });
    
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
}

window.toggleSortDirection = function() {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    
    const directionBtn = document.getElementById('sortDirection');
    const icon = directionBtn.querySelector('i');
    
    if (currentSortDirection === 'asc') {
        icon.className = 'fas fa-sort-alpha-down';
    } else {
        icon.className = 'fas fa-sort-alpha-up';
    }
    
    applySorting();
}

/**
 * Rating and comment functions
 */
window.rateTool = function(toolId, rating) {
    if (!exportSystem) {
        showNotification('Rating system not available', 'warning');
        return;
    }
    
    exportSystem.rateTool(toolId, rating);
    
    // Update rating display in modal
    const ratingInput = document.querySelector('.rating-input');
    if (ratingInput) {
        const stars = ratingInput.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }
    
    // Update card display if visible
    const toolCard = document.querySelector(`[data-tool-id="${toolId}"]`);
    if (toolCard) {
        const cardStars = toolCard.querySelectorAll('.tool-rating .stars i');
        cardStars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
        
        const ratingText = toolCard.querySelector('.rating-text');
        if (ratingText) {
            ratingText.textContent = `${rating}/5`;
        }
    }
    
    showNotification(`Rated ${rating} stars!`, 'success');
}

window.addComment = function(toolId) {
    if (!exportSystem) {
        showNotification('Comment system not available', 'warning');
        return;
    }
    
    const commentTextarea = document.querySelector(`#commentText-${toolId}`);
    if (!commentTextarea) return;
    
    const comment = commentTextarea.value.trim();
    
    if (!comment) {
        showNotification('Please enter a comment', 'warning');
        return;
    }
    
    exportSystem.addComment(toolId, comment, 'User');
    
    // Clear textarea
    commentTextarea.value = '';
    
    showNotification('Comment added successfully!', 'success');
    
    // Refresh modal content if still open
    openEnhancedToolModal(toolId);
}

window.suggestMissingData = function(type, toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    showNotification(`Help improve our database! Visit ${tool.tool_name} to gather ${type} information.`, 'info');
}

/**
 * Tab switching for enhanced modals
 */
window.switchTab = function(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab
    const tabBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (tabBtn) tabBtn.classList.add('active');
    
    const tabPane = document.getElementById(`${tabName}-tab`);
    if (tabPane) tabPane.classList.add('active');
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatCategory(category) {
    return categories[category]?.name || category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.closeModal = function() {
    const modal = document.getElementById('toolModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Get icon class based on category (already exists in original)
function getIconClass(icon) {
    const iconMap = {
        'ai-assistant': 'fa-robot',
        'media': 'fa-newspaper',
        'media-intelligence': 'fa-newspaper',
        'video': 'fa-video',
        'video-audio': 'fa-video',
        'analytics': 'fa-chart-line',
        'transcription': 'fa-microphone',
        'content': 'fa-pen',
        'content-creation': 'fa-pen',
        'image': 'fa-image',
        'image-generation': 'fa-image',
        'productivity': 'fa-tasks',
        'research': 'fa-search',
        'translation': 'fa-language',
        'customer-service': 'fa-headset',
        'finance': 'fa-dollar-sign',
        'cybersecurity': 'fa-shield-alt',
        'legal-compliance': 'fa-gavel',
        'legal': 'fa-gavel',
        'uncategorized': 'fa-cube'
    };
    return iconMap[icon] || 'fa-cube';
}

// Update statistics (enhanced version of updateStatistics)
function updateStatistics() {
    const stats = {
        total: allTools.length,
        media: allTools.filter(t => t.category === 'media-intelligence').length,
        ai: allTools.filter(t => t.category === 'ai-assistant').length,
        google: allTools.filter(t => t.source === 'google').length
    };
    
    // Update header badge count
    const headerCount = document.getElementById('header-tools-count');
    if (headerCount) {
        headerCount.textContent = stats.total;
    }
    
    // These elements were removed with the stats bar
    // document.getElementById('total-tools').textContent = stats.total;
    // document.getElementById('media-tools').textContent = stats.media;
    // document.getElementById('ai-assistants').textContent = stats.ai;
    // document.getElementById('google-tools').textContent = stats.google;
    
    // Update filter counts
    updateFilterCounts();
}

// Filter management functions (legacy - now handled by UnifiedFilterBar)
function filterTools() {
    // Skip if unified filter bar is active
    if (window.unifiedFilterBar) {
        return;
    }
    
    // Legacy filter logic for header search only
    const searchTerm = document.getElementById('headerSearchInput').value.toLowerCase();
    
    filteredTools = allTools.filter(tool => {
        // Search filter only
        const searchMatch = searchTerm === '' || 
            (tool.tool_name || tool.name).toLowerCase().includes(searchTerm) ||
            (tool.brief_purpose_summary || tool.description).toLowerCase().includes(searchTerm) ||
            tool.url.toLowerCase().includes(searchTerm) ||
            (tool.tags || []).some(tag => tag.toLowerCase().includes(searchTerm));
        
        return searchMatch;
    });
    
    // Update virtual scroll with filtered tools
    if (virtualScroll) {
        virtualScroll.updateItems(filteredTools);
        virtualScroll.scrollToTop();
    }
    
    // Update results count
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const totalCount = document.getElementById('total-tools');
    if (totalCount) {
        totalCount.textContent = filteredTools.length;
    }
}

// Update filter counts (legacy - now handled by UnifiedFilterBar)
function updateFilterCounts() {
    // Skip if unified filter bar is active
    if (window.unifiedFilterBar) {
        return;
    }
    
    // Legacy filter count logic removed as those elements no longer exist
}

// Initialize filters (legacy - now replaced by UnifiedFilterBar)
function initializeFilters() {
    // Skip if unified filter bar is active
    if (window.unifiedFilterBar) {
        console.log('Unified filter bar active, skipping legacy filters');
        return;
    }
    
    // Legacy filter initialization
    console.warn('Using legacy filters - unified filter bar not available');
    
    // Search input - connect to header search
    const headerSearchInput = document.getElementById('headerSearchInput');
    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', filterTools);
    }
}

// Categories configuration (keep existing)
const categories = {
    'all': { name: 'All', icon: 'fa-layer-group' },
    'ai-assistant': { name: 'AI Assistants', icon: 'fa-robot' },
    'media-intelligence': { name: 'Media Intelligence', icon: 'fa-newspaper' },
    'video-audio': { name: 'Video/Audio', icon: 'fa-video' },
    'analytics': { name: 'Analytics', icon: 'fa-chart-line' },
    'transcription': { name: 'Transcription', icon: 'fa-microphone' },
    'content-creation': { name: 'Content Creation', icon: 'fa-pen' },
    'image-generation': { name: 'Image Generation', icon: 'fa-image' },
    'productivity': { name: 'Productivity', icon: 'fa-tasks' },
    'research': { name: 'Research', icon: 'fa-search' },
    'translation': { name: 'Translation', icon: 'fa-language' },
    'customer-service': { name: 'Customer Service', icon: 'fa-headset' },
    'finance': { name: 'Finance', icon: 'fa-dollar-sign' },
    'cybersecurity': { name: 'Cybersecurity', icon: 'fa-shield-alt' },
    'legal-compliance': { name: 'Legal & Compliance', icon: 'fa-gavel' },
    'uncategorized': { name: 'Uncategorized', icon: 'fa-cube' }
};

// Virtual Scrolling Component (keep existing class)
class VirtualScroll {
    constructor(container, items, renderItem, options = {}) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.options = options;
        
        // Configuration
        this.itemHeight = options.itemHeight || 280;
        this.buffer = options.buffer || 5;
        this.columns = options.columns || 3;
        
        // State
        this.scrollTop = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        
        this.init();
    }

    init() {
        // Create viewport and content containers
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
        
        // Force a layout calculation
        this.container.offsetHeight;
        
        // Calculate total height
        this.updateDimensions();
        
        // Event listeners
        this.viewport.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Initial render after a short delay
        setTimeout(() => {
            this.render();
        }, 100);
    }

    updateDimensions() {
        // Calculate grid columns based on viewport width
        const viewportWidth = this.container.offsetWidth;
        
        if (currentView === 'list') {
            // In list view, always use 1 column
            this.columns = 1;
            this.itemHeight = 80; // Smaller height for list items
        } else {
            // Match the CSS grid minmax(320px, 1fr)
            this.columns = Math.floor(viewportWidth / 320);
            this.columns = Math.max(1, this.columns);
            this.itemHeight = this.options.itemHeight || 280;
        }
        
        // Calculate rows and total height
        this.totalRows = Math.ceil(this.items.length / this.columns);
        const gapSize = currentView === 'list' ? 16 : 24;
        this.totalHeight = (this.totalRows * this.itemHeight) + ((this.totalRows - 1) * gapSize);
        
        // Set content height for scrollbar
        this.content.style.height = `${this.totalHeight}px`;
    }

    handleScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.render();
    }

    handleResize() {
        this.updateDimensions();
        this.render();
    }

    render() {
        const viewportHeight = this.viewport.offsetHeight || 600;
        
        // Check if no items
        if (this.items.length === 0) {
            this.content.innerHTML = '<div class="loading">No tools found</div>';
            return;
        }
        
        // Calculate visible rows
        const startRow = Math.floor(this.scrollTop / this.itemHeight);
        const endRow = Math.ceil((this.scrollTop + viewportHeight) / this.itemHeight);
        
        // Add buffer
        const bufferedStartRow = Math.max(0, startRow - this.buffer);
        const bufferedEndRow = Math.min(this.totalRows - 1, endRow + this.buffer);
        
        // Calculate item indices
        this.visibleStart = bufferedStartRow * this.columns;
        this.visibleEnd = Math.min(this.items.length - 1, (bufferedEndRow + 1) * this.columns - 1);
        
        // Clear content
        this.content.innerHTML = '';
        
        // Create spacer for items above
        if (bufferedStartRow > 0) {
            const spacer = document.createElement('div');
            spacer.style.height = `${bufferedStartRow * this.itemHeight}px`;
            this.content.appendChild(spacer);
        }
        
        // Render visible items
        const fragment = document.createDocumentFragment();
        
        // Create a grid container for the visible items
        const gridContainer = document.createElement('div');
        gridContainer.className = 'tools-grid' + (currentView === 'list' ? ' list-view' : '');
        gridContainer.style.position = 'relative';
        
        for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
            if (this.items[i]) {
                const element = this.renderItem(this.items[i]);
                gridContainer.appendChild(element);
            }
        }
        fragment.appendChild(gridContainer);
        this.content.appendChild(fragment);
        
        // Create spacer for items below
        const remainingRows = this.totalRows - bufferedEndRow - 1;
        if (remainingRows > 0) {
            const spacer = document.createElement('div');
            spacer.style.height = `${remainingRows * this.itemHeight}px`;
            this.content.appendChild(spacer);
        }
    }

    updateItems(newItems) {
        this.items = newItems;
        this.updateDimensions();
        this.render();
    }

    scrollToTop() {
        this.viewport.scrollTop = 0;
    }
}

// Enhanced Modal Component with Tabs (keep existing class)
class ModalTabs {
    constructor() {
        this.currentTool = null;
        this.activeTab = 'overview';
        this.modal = document.getElementById('toolModal');
        this.modalBody = document.getElementById('modalBody');
        this.modalTitle = document.getElementById('modalTitle');
        
        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    showToolDetails(toolId) {
        const tool = allTools.find(t => t.id === toolId);
        if (!tool) return;
        
        this.currentTool = tool;
        this.modalTitle.textContent = tool.tool_name || tool.name;
        this.activeTab = 'overview';
        this.render();
        this.modal.style.display = 'block';
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    render() {
        const tabs = this.getAvailableTabs();
        
        this.modalBody.innerHTML = `
            <div class="modal-tabs">
                ${tabs.map(tab => `
                    <button class="tab-button ${tab.id === this.activeTab ? 'active' : ''}" 
                            data-tab="${tab.id}">
                        <i class="${tab.icon}"></i> ${tab.label}
                    </button>
                `).join('')}
            </div>
            <div class="tab-content">
                ${this.renderTabContent()}
            </div>
        `;
        
        // Add event listeners
        this.modalBody.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.render();
            });
        });
    }

    getAvailableTabs() {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
            { id: 'features', label: 'Features', icon: 'fas fa-list-check' },
            { id: 'pricing', label: 'Pricing', icon: 'fas fa-dollar-sign' },
            { id: 'integration', label: 'Integration', icon: 'fas fa-plug' }
        ];
        
        if (this.currentTool.use_cases_in_pr?.length || this.currentTool.features?.useCases?.length) {
            tabs.push({ id: 'use-cases', label: 'Use Cases', icon: 'fas fa-lightbulb' });
        }
        
        if (this.currentTool.cision_use_suggestions) {
            tabs.push({ id: 'suggestions', label: 'PR Applications', icon: 'fas fa-bullhorn' });
        }
        
        return tabs;
    }

    renderTabContent() {
        const tool = this.currentTool;
        
        switch (this.activeTab) {
            case 'overview':
                return `
                    <div class="tab-overview">
                        <div class="tool-meta">
                            <a href="https://${tool.url}" target="_blank" class="tool-link">
                                <i class="fas fa-external-link-alt"></i> ${tool.url}
                            </a>
                            <span class="tool-category">${this.formatCategory(tool.category)}</span>
                            <span class="tool-source">${tool.source}</span>
                        </div>
                        <p class="tool-summary">${tool.brief_purpose_summary || tool.description}</p>
                        ${tool.pros_cons_limitations ? `
                            <div class="pros-cons">
                                <h4>Pros & Cons</h4>
                                <p>${tool.pros_cons_limitations}</p>
                            </div>
                        ` : ''}
                        ${(tool.features?.pros || tool.features?.cons) ? `
                            <div class="pros-cons">
                                <h4>Pros & Cons</h4>
                                ${tool.features.pros ? `<p><strong>Pros:</strong> ${tool.features.pros}</p>` : ''}
                                ${tool.features.cons ? `<p><strong>Cons:</strong> ${tool.features.cons}</p>` : ''}
                            </div>
                        ` : ''}
                        ${tool.learning_curve || tool.features?.learningCurve ? `
                            <div class="learning-curve">
                                <h4>Learning Curve</h4>
                                <p>${tool.learning_curve || tool.features.learningCurve}</p>
                            </div>
                        ` : ''}
                    </div>
                `;
                
            case 'features':
                return `
                    <div class="tab-features">
                        <h4>Feature Breakdown</h4>
                        <p>${this.formatFeatures(tool.feature_breakdown || tool.features?.extensive)}</p>
                        ${tool.geo_regulatory_limitations ? `
                            <h4>Geographic & Regulatory Limitations</h4>
                            <p>${tool.geo_regulatory_limitations}</p>
                        ` : ''}
                    </div>
                `;
                
            case 'pricing':
                return `
                    <div class="tab-pricing">
                        <h4>Pricing Model</h4>
                        <p>${tool.pricing_model || tool.features?.pricing || 'Pricing information not available'}</p>
                    </div>
                `;
                
            case 'integration':
                return `
                    <div class="tab-integration">
                        <h4>Integration Potential</h4>
                        <p>${tool.integration_potential || tool.features?.integration || 'Integration details not available'}</p>
                    </div>
                `;
                
            case 'use-cases':
                const useCases = tool.use_cases_in_pr || tool.features?.useCases || [];
                return `
                    <div class="tab-use-cases">
                        <h4>Use Cases in PR</h4>
                        <ul class="use-cases-list">
                            ${useCases.map(useCase => `
                                <li><i class="fas fa-check"></i> ${useCase}</li>
                            `).join('')}
                        </ul>
                        ${tool.case_studies ? `
                            <h4>Case Studies</h4>
                            <p>${tool.case_studies}</p>
                        ` : ''}
                    </div>
                `;
                
            case 'suggestions':
                const suggestions = tool.cision_use_suggestions;
                return `
                    <div class="tab-suggestions">
                        <h4>Strategic PR Applications</h4>
                        ${suggestions.primary ? `
                            <div class="suggestion-item">
                                <span class="suggestion-label">Primary Use:</span>
                                <p>${suggestions.primary}</p>
                            </div>
                        ` : ''}
                        ${suggestions.secondary ? `
                            <div class="suggestion-item">
                                <span class="suggestion-label">Secondary Use:</span>
                                <p>${suggestions.secondary}</p>
                            </div>
                        ` : ''}
                        ${suggestions.tertiary ? `
                            <div class="suggestion-item">
                                <span class="suggestion-label">Tertiary Use:</span>
                                <p>${suggestions.tertiary}</p>
                            </div>
                        ` : ''}
                        ${suggestions.experimental_1 || suggestions.experimental_2 ? `
                            <h5>Experimental Applications</h5>
                            ${suggestions.experimental_1 ? `<p>» ${suggestions.experimental_1}</p>` : ''}
                            ${suggestions.experimental_2 ? `<p>» ${suggestions.experimental_2}</p>` : ''}
                        ` : ''}
                    </div>
                `;
                
            default:
                return '<p>No content available for this tab.</p>';
        }
    }

    formatCategory(category) {
        return categories[category]?.name || category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatFeatures(features) {
        if (!features) return 'No features listed';
        
        // If features are separated by semicolons or commas, convert to list
        if (features.includes(';') || features.includes(',')) {
            const separator = features.includes(';') ? ';' : ',';
            const items = features.split(separator).map(item => item.trim()).filter(item => item);
            return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        
        return features;
    }

    close() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentTool = null;
        }, 300);
    }
}

// Get sample tools for testing
function getSampleTools() {
    return [
        {
            id: 1,
            tool_name: "Claude (Anthropic)",
            url: "claude.ai",
            category: "ai-assistant",
            source: "pdf",
            brief_purpose_summary: "Large language model assistant for complex questions, content generation, coding, and document analysis.",
            feature_breakdown: "Chat interface, 100k+ token context, code generation, image analysis, document processing",
            pricing_model: "Free tier limited, Pro $20/month, Team $25/user/month",
            integration_potential: "API available for developers",
            tags: ["LLM", "Coding", "Analysis", "Chat"]
        },
        {
            id: 2,
            tool_name: "Signal AI",
            url: "signal-ai.com",
            category: "media-intelligence",
            source: "ai-list",
            brief_purpose_summary: "Media intelligence platform using AI to track media presence and extract actionable insights.",
            feature_breakdown: "Real-time monitoring, sentiment analysis, trend detection, custom alerts",
            pricing_model: "Enterprise pricing",
            tags: ["Media Monitoring", "Sentiment Analysis", "PR", "Analytics"]
        }
    ];
}

// Tool card renderer (for backward compatibility)
function createToolCard(tool) {
    return renderEnhancedToolCard(tool);
}

// Global functions for backwards compatibility
window.showNotification = showNotification;

// Advanced filter functions - redirect to unified filter bar
window.toggleAdvancedFilters = function() {
    if (window.unifiedFilterBar) {
        window.unifiedFilterBar.toggleMoreFilters();
    }
};

window.clearAllFilters = function() {
    if (window.unifiedFilterBar) {
        window.unifiedFilterBar.clearAllFilters();
    }
};

window.applyFilters = function() {
    if (window.unifiedFilterBar) {
        window.unifiedFilterBar.applyFilters();
    }
};

window.applyAdvancedFilters = function() {
    if (window.unifiedFilterBar) {
        window.unifiedFilterBar.applyFilters();
    }
};