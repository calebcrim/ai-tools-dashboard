// recently-viewed.js
// Track and display recently viewed AI tools

class RecentlyViewedTools {
    constructor() {
        this.maxItems = 10;
        this.storageKey = 'recentlyViewedTools';
        this.recentTools = this.loadRecentTools();
        this.initializeEventListeners();
    }

    // Load recently viewed tools from localStorage
    loadRecentTools() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const tools = JSON.parse(stored);
                // Validate and clean data
                return tools.filter(tool => tool && tool.id && tool.name).slice(0, this.maxItems);
            }
        } catch (e) {
            console.error('Error loading recently viewed tools:', e);
        }
        return [];
    }

    // Save recently viewed tools to localStorage
    saveRecentTools() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.recentTools));
        } catch (e) {
            console.error('Error saving recently viewed tools:', e);
        }
    }

    // Add a tool to recently viewed
    addTool(toolData) {
        if (!toolData || !toolData.id) return;

        const tool = {
            id: toolData.id,
            name: toolData.tool_name || toolData.name,
            category: toolData.category,
            url: toolData.url,
            description: toolData.brief_purpose_summary || toolData.description,
            viewedAt: new Date().toISOString()
        };

        // Remove if already exists
        this.recentTools = this.recentTools.filter(t => t.id !== tool.id);
        
        // Add to beginning
        this.recentTools.unshift(tool);
        
        // Keep only max items
        this.recentTools = this.recentTools.slice(0, this.maxItems);
        
        // Save to localStorage
        this.saveRecentTools();
        
        // Update UI if on dashboard
        this.updateRecentlyViewedSection();
    }

    // Get recently viewed tools
    getRecentTools() {
        return this.recentTools;
    }

    // Clear all recently viewed
    clearRecentTools() {
        this.recentTools = [];
        this.saveRecentTools();
        this.updateRecentlyViewedSection();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Listen for tool card clicks
        document.addEventListener('click', (e) => {
            const toolCard = e.target.closest('.tool-card');
            if (toolCard) {
                const toolData = this.extractToolDataFromCard(toolCard);
                if (toolData) {
                    this.addTool(toolData);
                }
            }
        });

        // Listen for tool modal views
        document.addEventListener('toolModalOpened', (e) => {
            if (e.detail && e.detail.tool) {
                this.addTool(e.detail.tool);
            }
        });
    }

    // Extract tool data from card element
    extractToolDataFromCard(cardElement) {
        if (!cardElement) return null;

        // Try to get tool data from data attributes
        const toolId = cardElement.dataset.toolId;
        const toolName = cardElement.dataset.toolName || 
                        cardElement.querySelector('.tool-name, h3, h4')?.textContent?.trim();
        const toolCategory = cardElement.dataset.category || 
                           cardElement.querySelector('.tool-category, .category')?.textContent?.trim();
        const toolUrl = cardElement.querySelector('a.tool-website, a[href*="http"]')?.href;
        const toolDescription = cardElement.querySelector('.tool-description, .description, p')?.textContent?.trim();

        // If we have the tool name, try to find it in the global tools data
        if (window.unifiedToolsData && toolName) {
            const tool = window.unifiedToolsData.tools.find(t => 
                t.tool_name === toolName || t.id == toolId
            );
            if (tool) return tool;
        }

        // Return what we have
        return {
            id: toolId || toolName?.toLowerCase().replace(/\s+/g, '-'),
            tool_name: toolName,
            category: toolCategory,
            url: toolUrl,
            brief_purpose_summary: toolDescription
        };
    }

    // Create recently viewed section HTML
    createRecentlyViewedSection() {
        const recentTools = this.getRecentTools();
        if (recentTools.length === 0) return '';

        return `
            <div class="recently-viewed-section">
                <div class="section-header">
                    <h2>Recently Viewed Tools</h2>
                    <button class="clear-recent" onclick="recentlyViewed.clearRecentTools()">
                        Clear All
                    </button>
                </div>
                <div class="recently-viewed-grid">
                    ${recentTools.map(tool => this.createRecentToolCard(tool)).join('')}
                </div>
            </div>
        `;
    }

    // Create individual tool card for recently viewed
    createRecentToolCard(tool) {
        const timeSince = this.getTimeSince(tool.viewedAt);
        
        return `
            <div class="recent-tool-card" data-tool-id="${tool.id}">
                <div class="recent-tool-header">
                    <h4 class="recent-tool-name">${tool.name}</h4>
                    <span class="recent-tool-time">${timeSince}</span>
                </div>
                <p class="recent-tool-category">${tool.category || 'Uncategorized'}</p>
                ${tool.description ? `<p class="recent-tool-description">${this.truncateText(tool.description, 80)}</p>` : ''}
                <a href="${tool.url || '#'}" class="recent-tool-link" target="_blank" rel="noopener">
                    Visit Tool <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
    }

    // Update recently viewed section on page
    updateRecentlyViewedSection() {
        const container = document.getElementById('recentlyViewedContainer');
        if (!container) return;

        const recentTools = this.getRecentTools();
        
        if (recentTools.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = this.createRecentlyViewedSection();
    }

    // Get time since viewed
    getTimeSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Truncate text helper
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Add CSS styles
    addStyles() {
        if (document.getElementById('recently-viewed-styles')) return;

        const style = document.createElement('style');
        style.id = 'recently-viewed-styles';
        style.textContent = `
            .recently-viewed-section {
                margin: 2rem 0;
                padding: 1.5rem;
                background: var(--bg-secondary, #f8f9fa);
                border-radius: 12px;
            }

            .recently-viewed-section .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .recently-viewed-section h2 {
                margin: 0;
                font-size: 1.5rem;
                color: var(--text-primary, #333);
            }

            .clear-recent {
                padding: 0.5rem 1rem;
                background: transparent;
                border: 1px solid var(--border-color, #ddd);
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .clear-recent:hover {
                background: var(--bg-primary, #fff);
                border-color: var(--primary, #007bff);
                color: var(--primary, #007bff);
            }

            .recently-viewed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1rem;
            }

            .recent-tool-card {
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                padding: 1rem;
                transition: all 0.2s;
                cursor: pointer;
            }

            .recent-tool-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border-color: var(--primary, #007bff);
            }

            .recent-tool-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.5rem;
            }

            .recent-tool-name {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary, #333);
                flex: 1;
                margin-right: 0.5rem;
            }

            .recent-tool-time {
                font-size: 0.75rem;
                color: var(--text-secondary, #666);
                white-space: nowrap;
            }

            .recent-tool-category {
                margin: 0 0 0.5rem 0;
                font-size: 0.875rem;
                color: var(--primary, #007bff);
            }

            .recent-tool-description {
                margin: 0 0 0.75rem 0;
                font-size: 0.875rem;
                color: var(--text-secondary, #666);
                line-height: 1.4;
            }

            .recent-tool-link {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.875rem;
                color: var(--primary, #007bff);
                text-decoration: none;
                transition: all 0.2s;
            }

            .recent-tool-link:hover {
                text-decoration: underline;
            }

            .recent-tool-link i {
                font-size: 0.75rem;
            }

            @media (max-width: 768px) {
                .recently-viewed-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Initialize recently viewed tools
const recentlyViewed = new RecentlyViewedTools();
recentlyViewed.addStyles();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecentlyViewedTools;
}