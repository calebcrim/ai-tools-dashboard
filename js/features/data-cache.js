// data-cache.js
// Local Storage caching for tool data to improve performance

class DataCache {
    constructor() {
        this.cacheKey = 'ai_tools_cache';
        this.cacheExpiryKey = 'ai_tools_cache_expiry';
        this.cacheVersion = 'v1';
        this.cacheVersionKey = 'ai_tools_cache_version';
        this.cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
        this.maxCacheSize = 5 * 1024 * 1024; // 5MB limit for localStorage
        
        // Check and clean cache on init
        this.initializeCache();
    }

    // Initialize cache system
    initializeCache() {
        // Check version
        const currentVersion = localStorage.getItem(this.cacheVersionKey);
        if (currentVersion !== this.cacheVersion) {
            this.clearCache();
            localStorage.setItem(this.cacheVersionKey, this.cacheVersion);
        }

        // Check if cache is expired
        if (this.isCacheExpired()) {
            this.clearCache();
        }

        // Monitor cache size
        this.monitorCacheSize();
    }

    // Get cached tools data
    getCachedTools() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            
            // Validate data structure
            if (!data || !data.tools || !Array.isArray(data.tools)) {
                this.clearCache();
                return null;
            }

            console.log('Loaded tools from cache:', data.tools.length);
            return data;
        } catch (error) {
            console.error('Error reading cache:', error);
            this.clearCache();
            return null;
        }
    }

    // Save tools data to cache
    cacheTools(toolsData) {
        try {
            // Check if data is valid
            if (!toolsData || !toolsData.tools) {
                console.error('Invalid tools data for caching');
                return false;
            }

            // Calculate size
            const dataString = JSON.stringify(toolsData);
            const sizeInBytes = new Blob([dataString]).size;

            // Check if it fits in localStorage
            if (sizeInBytes > this.maxCacheSize) {
                console.warn('Tools data too large for cache:', sizeInBytes);
                return false;
            }

            // Save to cache
            localStorage.setItem(this.cacheKey, dataString);
            localStorage.setItem(this.cacheExpiryKey, Date.now() + this.cacheExpiry);
            
            console.log('Cached tools data:', toolsData.tools.length, 'tools,', sizeInBytes, 'bytes');
            
            // Track cache event
            if (window.gtag) {
                gtag('event', 'cache_saved', {
                    event_category: 'performance',
                    event_label: 'tools_data',
                    value: toolsData.tools.length
                });
            }

            return true;
        } catch (error) {
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, clearing old data');
                this.clearOldCacheData();
                
                // Try once more
                try {
                    localStorage.setItem(this.cacheKey, JSON.stringify(toolsData));
                    localStorage.setItem(this.cacheExpiryKey, Date.now() + this.cacheExpiry);
                    return true;
                } catch (retryError) {
                    console.error('Failed to cache after clearing:', retryError);
                }
            }
            
            console.error('Error caching tools:', error);
            return false;
        }
    }

    // Check if cache is expired
    isCacheExpired() {
        const expiry = localStorage.getItem(this.cacheExpiryKey);
        if (!expiry) return true;
        
        return Date.now() > parseInt(expiry);
    }

    // Clear all cache
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.cacheExpiryKey);
        console.log('Cache cleared');
    }

    // Clear old cache data to make room
    clearOldCacheData() {
        // Remove other cached data that might be taking up space
        const keysToCheck = [
            'search_history',
            'filter_preferences',
            'comparison_data'
        ];

        keysToCheck.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Monitor cache size and performance
    monitorCacheSize() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            
            const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
            console.log('Total localStorage usage:', sizeInMB, 'MB');
            
            // Warn if getting close to typical 5-10MB limit
            if (totalSize > 4 * 1024 * 1024) {
                console.warn('localStorage usage high:', sizeInMB, 'MB');
            }
        } catch (error) {
            console.error('Error monitoring cache size:', error);
        }
    }

    // Get cached data for specific tool
    getCachedTool(toolId) {
        const cachedData = this.getCachedTools();
        if (!cachedData || !cachedData.tools) return null;
        
        return cachedData.tools.find(tool => 
            tool.id === toolId || tool.tool_name === toolId
        );
    }

    // Update single tool in cache
    updateCachedTool(toolId, updates) {
        const cachedData = this.getCachedTools();
        if (!cachedData || !cachedData.tools) return false;
        
        const toolIndex = cachedData.tools.findIndex(tool => 
            tool.id === toolId || tool.tool_name === toolId
        );
        
        if (toolIndex === -1) return false;
        
        // Update tool data
        cachedData.tools[toolIndex] = {
            ...cachedData.tools[toolIndex],
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        
        // Save back to cache
        return this.cacheTools(cachedData);
    }

    // Get cache statistics
    getCacheStats() {
        const cached = localStorage.getItem(this.cacheKey);
        const expiry = localStorage.getItem(this.cacheExpiryKey);
        
        if (!cached) {
            return {
                hasCache: false,
                toolsCount: 0,
                sizeInBytes: 0,
                sizeInMB: 0,
                expiresIn: 0,
                isExpired: true
            };
        }
        
        const sizeInBytes = new Blob([cached]).size;
        const expiresIn = expiry ? parseInt(expiry) - Date.now() : 0;
        
        try {
            const data = JSON.parse(cached);
            return {
                hasCache: true,
                toolsCount: data.tools ? data.tools.length : 0,
                sizeInBytes: sizeInBytes,
                sizeInMB: (sizeInBytes / 1024 / 1024).toFixed(2),
                expiresIn: Math.max(0, Math.floor(expiresIn / 1000 / 60)), // minutes
                isExpired: expiresIn <= 0
            };
        } catch (error) {
            return {
                hasCache: false,
                toolsCount: 0,
                sizeInBytes: 0,
                sizeInMB: 0,
                expiresIn: 0,
                isExpired: true
            };
        }
    }

    // Prefetch and cache tools data
    async prefetchTools() {
        // Check if we already have valid cache
        if (!this.isCacheExpired() && this.getCachedTools()) {
            console.log('Tools already cached and valid');
            return true;
        }

        // If unifiedToolsData is available globally, cache it
        if (window.unifiedToolsData) {
            return this.cacheTools(window.unifiedToolsData);
        }

        // Otherwise, we'd need to fetch from an API
        // This is a placeholder for when you have an API endpoint
        console.log('No tools data available to cache');
        return false;
    }
}

// Create global instance
const dataCache = new DataCache();

// Enhance the global unifiedToolsData loading
if (window.unifiedToolsData) {
    // Cache the data immediately
    dataCache.cacheTools(window.unifiedToolsData);
} else {
    // Check cache first when page loads
    document.addEventListener('DOMContentLoaded', () => {
        const cachedData = dataCache.getCachedTools();
        if (cachedData) {
            window.unifiedToolsData = cachedData;
            console.log('Loaded tools from cache on page load');
            
            // Dispatch event to notify other scripts
            window.dispatchEvent(new CustomEvent('toolsDataLoaded', {
                detail: { fromCache: true, toolsCount: cachedData.tools.length }
            }));
        }
    });
}

// Export for use in other modules
window.dataCache = dataCache;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataCache;
}