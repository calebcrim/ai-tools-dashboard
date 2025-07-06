/**
 * Enhanced Export and Advanced Filtering System
 * Provides JSON/CSV export, advanced filtering, comparison, and user feedback
 */

class EnhancedExportSystem {
    constructor() {
        this.comparisonTools = [];
        this.userRatings = this.loadUserRatings();
        this.userComments = this.loadUserComments();
        this.exportProgress = null;
    }

    /**
     * Export tools in multiple formats with progress tracking
     */
    exportTools(tools, format = 'json', filename = null, onProgress = null) {
        const timestamp = new Date().toISOString().split('T')[0];
        const defaultFilename = `ai-tools-export-${timestamp}`;
        const finalFilename = filename || defaultFilename;

        // Start progress tracking
        this.exportProgress = onProgress;
        this.updateProgress(0, `Starting ${format.toUpperCase()} export...`);

        try {
            switch (format.toLowerCase()) {
                case 'json':
                    this.exportJSON(tools, `${finalFilename}.json`);
                    break;
                case 'csv':
                    this.exportCSV(tools, `${finalFilename}.csv`);
                    break;
                case 'excel':
                    this.exportExcel(tools, `${finalFilename}.xlsx`);
                    break;
                default:
                    console.error('Unsupported export format:', format);
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            this.updateProgress(100, `Export completed successfully!`);
            return true;
        } catch (error) {
            console.error('Export error:', error);
            this.updateProgress(0, `Export failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Update export progress
     */
    updateProgress(percentage, message) {
        if (this.exportProgress && typeof this.exportProgress === 'function') {
            this.exportProgress({ percentage, message });
        }
    }

    /**
     * Export as JSON with metadata
     */
    exportJSON(tools, filename) {
        this.updateProgress(10, 'Preparing JSON data...');
        
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalTools: tools.length,
                exportedBy: 'CrimIntelligence: AI Tools Suite',
                version: '2.0',
                userDataIncluded: true
            },
            tools: tools.map((tool, index) => {
                this.updateProgress(10 + (index / tools.length) * 80, `Processing tool ${index + 1} of ${tools.length}`);
                
                return {
                    ...tool,
                    userRating: this.getUserRating(tool.id),
                    userComments: this.getUserComments(tool.id),
                    completenessScore: this.calculateCompleteness(tool)
                };
            })
        };

        this.updateProgress(90, 'Generating JSON file...');
        const dataStr = JSON.stringify(exportData, null, 2);
        this.downloadFile(dataStr, filename, 'application/json');
    }

    /**
     * Export as CSV with proper formatting
     */
    exportCSV(tools, filename) {
        this.updateProgress(10, 'Preparing CSV headers...');
        
        // Define CSV headers
        const headers = [
            'ID', 'Tool Name', 'URL', 'Category', 'Source', 'Purpose Summary',
            'Features', 'Pricing Model', 'Pros/Cons', 'Integration Potential',
            'Learning Curve', 'Use Cases', 'Tags', 'User Rating', 'Comments Count',
            'Completeness Score'
        ];

        // Convert tools to CSV rows
        const rows = tools.map((tool, index) => {
            this.updateProgress(10 + (index / tools.length) * 80, `Processing row ${index + 1} of ${tools.length}`);
            
            return [
                tool.id,
                this.escapeCsvField(tool.tool_name),
                tool.url,
                tool.category,
                tool.source,
                this.escapeCsvField(tool.brief_purpose_summary),
                this.escapeCsvField(tool.feature_breakdown),
                this.escapeCsvField(tool.pricing_model),
                this.escapeCsvField(tool.pros_cons_limitations),
                this.escapeCsvField(tool.integration_potential),
                tool.learning_curve || '',
                this.escapeCsvField(Array.isArray(tool.use_cases_in_pr) ? tool.use_cases_in_pr.join('; ') : ''),
                this.escapeCsvField(Array.isArray(tool.tags) ? tool.tags.join(', ') : ''),
                this.getUserRating(tool.id) || '',
                this.getUserComments(tool.id).length,
                this.calculateCompleteness(tool) + '%'
            ];
        });

        this.updateProgress(90, 'Generating CSV file...');
        
        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * Export as Excel (CSV-based for now)
     */
    exportExcel(tools, filename) {
        // For now, export as CSV with .xlsx extension warning
        const csvFilename = filename.replace('.xlsx', '.csv');
        this.exportCSV(tools, csvFilename);
        
        // Show warning about format
        if (this.exportProgress) {
            setTimeout(() => {
                this.updateProgress(100, 'Note: Excel export currently saves as CSV format. For true Excel format, consider implementing SheetJS library.');
            }, 100);
        }
    }

    /**
     * Escape CSV fields containing commas, quotes, or newlines
     */
    escapeCsvField(field) {
        if (!field) return '';
        
        const str = String(field);
        
        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        
        return str;
    }

    /**
     * Download file helper with browser compatibility
     */
    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            
            // Modern browsers
            if (window.navigator.msSaveOrOpenBlob) {
                // IE10+
                window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // Chrome, Firefox, Safari
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 100);
            }
        } catch (error) {
            console.error('Download error:', error);
            throw new Error('Failed to download file: ' + error.message);
        }
    }

    /**
     * Calculate tool completeness percentage
     */
    calculateCompleteness(tool) {
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
     * Load user ratings from localStorage with error handling
     */
    loadUserRatings() {
        try {
            const stored = localStorage.getItem('aitools_ratings');
            if (!stored) return {};
            
            const ratings = JSON.parse(stored);
            return ratings || {};
        } catch (error) {
            console.warn('Error loading user ratings:', error);
            return {};
        }
    }

    /**
     * Save user ratings to localStorage with error handling
     */
    saveUserRatings() {
        try {
            localStorage.setItem('aitools_ratings', JSON.stringify(this.userRatings));
            return true;
        } catch (error) {
            console.error('Error saving user ratings:', error);
            if (error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded');
            }
            return false;
        }
    }

    /**
     * Load user comments from localStorage with error handling
     */
    loadUserComments() {
        try {
            const stored = localStorage.getItem('aitools_comments');
            if (!stored) return {};
            
            const comments = JSON.parse(stored);
            return comments || {};
        } catch (error) {
            console.warn('Error loading user comments:', error);
            return {};
        }
    }

    /**
     * Save user comments to localStorage with error handling
     */
    saveUserComments() {
        try {
            localStorage.setItem('aitools_comments', JSON.stringify(this.userComments));
            return true;
        } catch (error) {
            console.error('Error saving user comments:', error);
            if (error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded');
            }
            return false;
        }
    }

    /**
     * Rate a tool (1-5 stars)
     */
    rateTool(toolId, rating) {
        if (!toolId) {
            console.error('Tool ID is required');
            return false;
        }

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            console.error('Rating must be a number between 1 and 5');
            return false;
        }

        this.userRatings[toolId] = {
            rating: rating,
            timestamp: new Date().toISOString()
        };

        return this.saveUserRatings();
    }

    /**
     * Add comment to a tool with validation
     */
    addComment(toolId, comment, author = 'Anonymous') {
        if (!toolId) {
            console.error('Tool ID is required');
            return null;
        }

        if (!comment || comment.trim().length === 0) {
            console.error('Comment cannot be empty');
            return null;
        }

        if (!this.userComments[toolId]) {
            this.userComments[toolId] = [];
        }

        const commentData = {
            id: Date.now(),
            comment: comment.trim(),
            author: author.trim() || 'Anonymous',
            timestamp: new Date().toISOString()
        };

        this.userComments[toolId].push(commentData);
        
        if (this.saveUserComments()) {
            return commentData.id;
        }
        
        return null;
    }

    /**
     * Delete a comment
     */
    deleteComment(toolId, commentId) {
        if (!this.userComments[toolId]) {
            return false;
        }

        const index = this.userComments[toolId].findIndex(c => c.id === commentId);
        if (index > -1) {
            this.userComments[toolId].splice(index, 1);
            return this.saveUserComments();
        }

        return false;
    }

    /**
     * Get user rating for a tool
     */
    getUserRating(toolId) {
        return this.userRatings[toolId]?.rating || null;
    }

    /**
     * Get user comments for a tool
     */
    getUserComments(toolId) {
        return this.userComments[toolId] || [];
    }

    /**
     * Get average rating for a tool (future multi-user support)
     */
    getAverageRating(toolId) {
        const rating = this.getUserRating(toolId);
        return rating ? { average: rating, count: 1 } : { average: null, count: 0 };
    }

    /**
     * Clear all user data with confirmation
     */
    clearAllUserData() {
        if (confirm('Are you sure you want to clear all ratings and comments? This cannot be undone.')) {
            this.userRatings = {};
            this.userComments = {};
            this.saveUserRatings();
            this.saveUserComments();
            return true;
        }
        return false;
    }
}

/**
 * Advanced Filtering System
 */
class AdvancedFilterSystem {
    constructor(tools) {
        this.allTools = tools || [];
        this.filteredTools = [...this.allTools];
        this.activeFilters = {
            categories: [],
            tags: [],
            pricingModels: [],
            sources: [],
            features: [],
            ratings: { min: 0, max: 5 },
            completeness: { min: 0, max: 100 },
            searchQuery: ''
        };
        this.filterCallbacks = [];
    }

    /**
     * Register callback for filter changes
     */
    onFilterChange(callback) {
        if (typeof callback === 'function') {
            this.filterCallbacks.push(callback);
        }
    }

    /**
     * Notify all callbacks of filter changes
     */
    notifyFilterChange() {
        this.filterCallbacks.forEach(callback => {
            try {
                callback(this.filteredTools, this.activeFilters);
            } catch (error) {
                console.error('Filter callback error:', error);
            }
        });
    }

    /**
     * Apply multiple filters
     */
    applyFilters(filters = {}) {
        this.activeFilters = { ...this.activeFilters, ...filters };
        
        this.filteredTools = this.allTools.filter(tool => {
            return this.matchesAllFilters(tool);
        });

        this.notifyFilterChange();
        return this.filteredTools;
    }

    /**
     * Check if tool matches all active filters
     */
    matchesAllFilters(tool) {
        // Category filter
        if (this.activeFilters.categories.length > 0 && 
            !this.activeFilters.categories.includes(tool.category)) {
            return false;
        }

        // Tags filter
        if (this.activeFilters.tags.length > 0) {
            const toolTags = tool.tags || [];
            if (!this.activeFilters.tags.some(tag => toolTags.includes(tag))) {
                return false;
            }
        }

        // Pricing model filter
        if (this.activeFilters.pricingModels.length > 0) {
            const pricing = tool.pricing_model?.toLowerCase() || '';
            const hasMatchingPricing = this.activeFilters.pricingModels.some(model => {
                switch (model) {
                    case 'free':
                        return pricing.includes('free') && !pricing.includes('trial');
                    case 'paid':
                        return pricing.includes('$') || pricing.includes('paid') || 
                               pricing.includes('subscription') || pricing.includes('per month');
                    case 'freemium':
                        return pricing.includes('free') && 
                               (pricing.includes('$') || pricing.includes('pro') || pricing.includes('premium'));
                    case 'enterprise':
                        return pricing.includes('enterprise') || pricing.includes('custom pricing');
                    default:
                        return false;
                }
            });
            if (!hasMatchingPricing) return false;
        }

        // Source filter
        if (this.activeFilters.sources.length > 0 && 
            !this.activeFilters.sources.includes(tool.source)) {
            return false;
        }

        // Feature filter
        if (this.activeFilters.features.length > 0) {
            const hasMatchingFeature = this.activeFilters.features.some(feature => {
                const featureText = tool.feature_breakdown?.toLowerCase() || '';
                const integrationText = tool.integration_potential?.toLowerCase() || '';
                const summaryText = tool.brief_purpose_summary?.toLowerCase() || '';
                
                switch (feature) {
                    case 'api':
                        return featureText.includes('api') || integrationText.includes('api');
                    case 'integration':
                        return integrationText.length > 20; // Has substantial integration info
                    case 'mobile':
                        return featureText.includes('mobile') || featureText.includes('app') || 
                               summaryText.includes('mobile');
                    case 'enterprise':
                        return featureText.includes('enterprise') || 
                               tool.pricing_model?.includes('enterprise') ||
                               summaryText.includes('enterprise');
                    case 'opensource':
                        return featureText.includes('open source') || featureText.includes('opensource') ||
                               summaryText.includes('open source');
                    default:
                        return featureText.includes(feature) || summaryText.includes(feature);
                }
            });
            if (!hasMatchingFeature) return false;
        }

        // Rating filter
        if (window.exportSystem) {
            const rating = window.exportSystem.getUserRating(tool.id) || 0;
            if (this.activeFilters.ratings.min > 0 && rating === 0) {
                // No rating when minimum is set
                return false;
            }
            if (rating > 0 && (rating < this.activeFilters.ratings.min || rating > this.activeFilters.ratings.max)) {
                return false;
            }
        }

        // Completeness filter
        if (window.exportSystem) {
            const completeness = window.exportSystem.calculateCompleteness(tool);
            if (completeness < this.activeFilters.completeness.min || 
                completeness > this.activeFilters.completeness.max) {
                return false;
            }
        }

        // Search query filter
        if (this.activeFilters.searchQuery && this.activeFilters.searchQuery.trim()) {
            return this.matchesSearchQuery(tool, this.activeFilters.searchQuery);
        }

        return true;
    }

    /**
     * Check if tool matches search query
     */
    matchesSearchQuery(tool, query) {
        const searchTerm = query.toLowerCase().trim();
        
        const searchableText = [
            tool.tool_name,
            tool.brief_purpose_summary,
            tool.feature_breakdown,
            tool.category,
            tool.source,
            tool.pricing_model,
            ...(tool.tags || []),
            ...(tool.use_cases_in_pr || [])
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
    }

    /**
     * Get filter statistics
     */
    getFilterStats() {
        const stats = {
            totalTools: this.allTools.length,
            filteredTools: this.filteredTools.length,
            categories: {},
            tags: {},
            sources: {},
            pricingModels: {
                free: 0,
                paid: 0,
                freemium: 0,
                enterprise: 0
            },
            features: {
                api: 0,
                integration: 0,
                mobile: 0,
                enterprise: 0,
                opensource: 0
            },
            ratings: {
                rated: 0,
                unrated: 0,
                average: 0
            },
            completeness: {
                high: 0,  // 80-100%
                medium: 0, // 50-79%
                low: 0     // 0-49%
            }
        };

        // Calculate distributions
        this.allTools.forEach(tool => {
            // Categories
            stats.categories[tool.category] = (stats.categories[tool.category] || 0) + 1;
            
            // Sources
            stats.sources[tool.source] = (stats.sources[tool.source] || 0) + 1;
            
            // Tags
            if (tool.tags) {
                tool.tags.forEach(tag => {
                    stats.tags[tag] = (stats.tags[tag] || 0) + 1;
                });
            }

            // Pricing models
            const pricing = tool.pricing_model?.toLowerCase() || '';
            if (pricing.includes('free') && !pricing.includes('trial') && !pricing.includes('$')) {
                stats.pricingModels.free++;
            } else if (pricing.includes('free') && pricing.includes('$')) {
                stats.pricingModels.freemium++;
            } else if (pricing.includes('enterprise')) {
                stats.pricingModels.enterprise++;
            } else if (pricing.includes('$') || pricing.includes('paid')) {
                stats.pricingModels.paid++;
            }

            // Features
            const featureText = (tool.feature_breakdown + ' ' + tool.integration_potential + ' ' + tool.brief_purpose_summary).toLowerCase();
            if (featureText.includes('api')) stats.features.api++;
            if (tool.integration_potential && tool.integration_potential.length > 20) stats.features.integration++;
            if (featureText.includes('mobile') || featureText.includes('app')) stats.features.mobile++;
            if (featureText.includes('enterprise')) stats.features.enterprise++;
            if (featureText.includes('open source') || featureText.includes('opensource')) stats.features.opensource++;

            // Ratings
            if (window.exportSystem) {
                const rating = window.exportSystem.getUserRating(tool.id);
                if (rating) {
                    stats.ratings.rated++;
                    stats.ratings.average += rating;
                } else {
                    stats.ratings.unrated++;
                }

                // Completeness
                const completeness = window.exportSystem.calculateCompleteness(tool);
                if (completeness >= 80) stats.completeness.high++;
                else if (completeness >= 50) stats.completeness.medium++;
                else stats.completeness.low++;
            }
        });

        // Calculate average rating
        if (stats.ratings.rated > 0) {
            stats.ratings.average = Math.round((stats.ratings.average / stats.ratings.rated) * 10) / 10;
        }

        return stats;
    }

    /**
     * Sort tools by various criteria
     */
    sortTools(criteria = 'name', direction = 'asc') {
        this.filteredTools.sort((a, b) => {
            let valueA, valueB;

            switch (criteria) {
                case 'name':
                    valueA = a.tool_name?.toLowerCase() || '';
                    valueB = b.tool_name?.toLowerCase() || '';
                    break;
                case 'category':
                    valueA = a.category || '';
                    valueB = b.category || '';
                    break;
                case 'rating':
                    valueA = window.exportSystem?.getUserRating(a.id) || 0;
                    valueB = window.exportSystem?.getUserRating(b.id) || 0;
                    break;
                case 'completeness':
                    valueA = window.exportSystem?.calculateCompleteness(a) || 0;
                    valueB = window.exportSystem?.calculateCompleteness(b) || 0;
                    break;
                case 'dateAdded':
                    valueA = a.id || 0;
                    valueB = b.id || 0;
                    break;
                default:
                    valueA = a[criteria] || '';
                    valueB = b[criteria] || '';
            }

            const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            return direction === 'desc' ? -comparison : comparison;
        });

        this.notifyFilterChange();
        return this.filteredTools;
    }

    /**
     * Search tools by text with debouncing support
     */
    searchTools(query) {
        this.activeFilters.searchQuery = query || '';
        return this.applyFilters();
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.activeFilters = {
            categories: [],
            tags: [],
            pricingModels: [],
            sources: [],
            features: [],
            ratings: { min: 0, max: 5 },
            completeness: { min: 0, max: 100 },
            searchQuery: ''
        };
        
        return this.applyFilters();
    }

    /**
     * Get unique values for filter options
     */
    getFilterOptions() {
        const options = {
            categories: new Set(),
            tags: new Set(),
            sources: new Set()
        };

        this.allTools.forEach(tool => {
            if (tool.category) options.categories.add(tool.category);
            if (tool.source) options.sources.add(tool.source);
            if (tool.tags) {
                tool.tags.forEach(tag => options.tags.add(tag));
            }
        });

        return {
            categories: Array.from(options.categories).sort(),
            tags: Array.from(options.tags).sort(),
            sources: Array.from(options.sources).sort(),
            pricingModels: ['free', 'paid', 'freemium', 'enterprise'],
            features: ['api', 'integration', 'mobile', 'enterprise', 'opensource']
        };
    }
}

// Initialize global instances
if (typeof window !== 'undefined') {
    window.exportSystem = new EnhancedExportSystem();
    
    // Initialize filter system when tools are loaded
    if (window.allTools) {
        window.filterSystem = new AdvancedFilterSystem(window.allTools);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedExportSystem, AdvancedFilterSystem };
}