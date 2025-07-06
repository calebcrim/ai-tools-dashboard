/**
 * Performance Tests for AI Tools Dashboard
 * Tests with real data and no mocks
 */

describe('Performance: Large Dataset Handling', () => {
    test('Data structure handles 200+ tools efficiently', () => {
        const startTime = performance.now();
        
        // Access the real unified tools data
        assert.ok(window.unifiedToolsData, 'Unified tools data should be loaded');
        assert.ok(window.unifiedToolsData.tools.length > 200, 'Should have 200+ tools');
        
        // Test data access speed
        const randomAccess = [];
        for (let i = 0; i < 1000; i++) {
            const randomIndex = Math.floor(Math.random() * window.unifiedToolsData.tools.length);
            randomAccess.push(window.unifiedToolsData.tools[randomIndex]);
        }
        
        const accessTime = performance.now() - startTime;
        assert.ok(accessTime < 10, `Random access should be fast (took ${accessTime}ms)`);
    });
    
    test('Search indexing completes within performance budget', () => {
        const tools = window.unifiedToolsData.tools;
        const searchIndex = {};
        
        const startTime = performance.now();
        
        // Build search index
        tools.forEach(tool => {
            const searchableText = [
                tool.tool_name,
                tool.brief_purpose_summary,
                tool.category,
                ...(tool.tags || [])
            ].join(' ').toLowerCase();
            
            const words = searchableText.split(/\s+/);
            words.forEach(word => {
                if (word.length > 2) {
                    if (!searchIndex[word]) {
                        searchIndex[word] = [];
                    }
                    searchIndex[word].push(tool.id);
                }
            });
        });
        
        const indexTime = performance.now() - startTime;
        assert.ok(indexTime < 100, `Index building should be fast (took ${indexTime}ms)`);
        
        // Test search performance
        const searchStart = performance.now();
        const searchTerms = ['ai', 'video', 'chat', 'analytics', 'google'];
        const results = [];
        
        searchTerms.forEach(term => {
            if (searchIndex[term]) {
                results.push(...searchIndex[term]);
            }
        });
        
        const searchTime = performance.now() - searchStart;
        assert.ok(searchTime < 5, `Search should be instant (took ${searchTime}ms)`);
    });
    
    test('Filtering by category maintains 60fps performance', () => {
        const tools = window.unifiedToolsData.tools;
        const frameTime = 16.67; // 60fps = 16.67ms per frame
        
        const categories = ['ai-assistant', 'content-creation', 'video-audio'];
        
        categories.forEach(category => {
            const startTime = performance.now();
            
            const filtered = tools.filter(tool => tool.category === category);
            
            const filterTime = performance.now() - startTime;
            assert.ok(filterTime < frameTime, 
                `Filtering ${category} should complete within one frame (took ${filterTime}ms)`);
            assert.ok(filtered.length > 0, `Should have tools in ${category} category`);
        });
    });
    
    test('Complex data queries remain performant', () => {
        const tools = window.unifiedToolsData.tools;
        
        // Test 1: Multi-criteria search
        const startTime1 = performance.now();
        const complexFilter = tools.filter(tool => 
            tool.pricing_model?.toLowerCase().includes('free') &&
            tool.integration_potential?.toLowerCase().includes('api') &&
            tool.category === 'ai-assistant'
        );
        const time1 = performance.now() - startTime1;
        
        assert.ok(time1 < 10, `Complex filter should be fast (took ${time1}ms)`);
        assert.ok(complexFilter.length > 0, 'Should find tools matching complex criteria');
        
        // Test 2: Aggregation
        const startTime2 = performance.now();
        const categoryCounts = tools.reduce((acc, tool) => {
            acc[tool.category] = (acc[tool.category] || 0) + 1;
            return acc;
        }, {});
        const time2 = performance.now() - startTime2;
        
        assert.ok(time2 < 5, `Aggregation should be fast (took ${time2}ms)`);
        assert.ok(Object.keys(categoryCounts).length > 5, 'Should have multiple categories');
        
        // Test 3: Sorting
        const startTime3 = performance.now();
        const sorted = [...tools].sort((a, b) => 
            a.tool_name.localeCompare(b.tool_name)
        );
        const time3 = performance.now() - startTime3;
        
        assert.ok(time3 < 20, `Sorting should be reasonable (took ${time3}ms)`);
        assert.equal(sorted[0].tool_name < sorted[sorted.length - 1].tool_name, true, 
            'Tools should be sorted alphabetically');
    });
    
    test('Memory usage remains stable with repeated operations', () => {
        if (!performance.memory) {
            console.log('Skipping memory test - performance.memory not available');
            return;
        }
        
        const initialMemory = performance.memory.usedJSHeapSize;
        const operations = [];
        
        // Perform repeated operations
        for (let i = 0; i < 100; i++) {
            operations.push(
                window.unifiedToolsData.tools.filter(t => t.category === 'ai-assistant'),
                window.unifiedToolsData.tools.map(t => t.tool_name),
                [...window.unifiedToolsData.tools].sort((a, b) => a.id - b.id)
            );
        }
        
        // Clear references
        operations.length = 0;
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        const increaseMB = memoryIncrease / (1024 * 1024);
        
        assert.ok(increaseMB < 50, 
            `Memory increase should be reasonable (increased ${increaseMB.toFixed(2)}MB)`);
    });
});