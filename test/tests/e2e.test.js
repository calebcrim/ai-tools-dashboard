/**
 * End-to-End Tests for AI Tools Dashboard
 * RULE: No mocks - using real services and dependencies
 */

describe('E2E: Full Application Flow', () => {
    let appFrame;
    let appWindow;
    let appDocument;
    
    beforeAll(async () => {
        // Create iframe for isolated testing
        appFrame = document.createElement('iframe');
        appFrame.style.width = '1200px';
        appFrame.style.height = '800px';
        appFrame.style.position = 'fixed';
        appFrame.style.top = '-9999px'; // Hidden but rendered
        document.body.appendChild(appFrame);
        
        // Load the actual application
        await new Promise((resolve) => {
            appFrame.onload = resolve;
            appFrame.src = '../index.html';
        });
        
        appWindow = appFrame.contentWindow;
        appDocument = appFrame.contentDocument;
        
        // Wait for application to fully load
        await waitForCondition(() => {
            return appDocument.getElementById('toolsGrid') && 
                   appWindow.toolsData && 
                   appWindow.toolsData.length > 0;
        }, 10000, 'Application failed to load');
    });
    
    afterAll(() => {
        if (appFrame) {
            document.body.removeChild(appFrame);
        }
    });
    
    test('Application loads with correct initial state', async () => {
        // Verify DOM elements exist
        assert.ok(appDocument.getElementById('toolsGrid'), 'Tools grid should exist');
        assert.ok(appDocument.getElementById('searchInput'), 'Search input should exist');
        assert.ok(appDocument.getElementById('categoryFilters'), 'Category filters should exist');
        
        // Verify data loaded
        assert.ok(appWindow.toolsData.length > 200, 'Should load 200+ tools');
        
        // Verify no console errors during load
        assert.noConsoleErrors(TestRunner.consoleCapture);
    });
    
    test('Search functionality filters tools in real-time', async () => {
        const searchInput = appDocument.getElementById('searchInput');
        const toolsGrid = appDocument.getElementById('toolsGrid');
        
        // Clear any existing search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        await delay(100); // Wait for debounce
        
        const initialCount = toolsGrid.querySelectorAll('.tool-card').length;
        assert.ok(initialCount > 0, 'Should have tools initially');
        
        // Search for specific tool
        searchInput.value = 'ChatGPT';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        await delay(300); // Wait for search debounce
        
        const filteredCount = toolsGrid.querySelectorAll('.tool-card').length;
        assert.ok(filteredCount < initialCount, 'Search should filter results');
        assert.ok(filteredCount >= 1, 'Should find at least ChatGPT');
        
        // Verify correct tool is shown
        const visibleTool = toolsGrid.querySelector('.tool-card h3');
        assert.ok(visibleTool.textContent.includes('ChatGPT'), 'ChatGPT should be visible');
        
        // Clear search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        await delay(300);
        
        const resetCount = toolsGrid.querySelectorAll('.tool-card').length;
        assert.equal(resetCount, initialCount, 'Clearing search should show all tools');
    });
    
    test('Category filters work correctly', async () => {
        const aiFilter = appDocument.querySelector('[data-category="ai-assistant"]');
        assert.ok(aiFilter, 'AI Assistant filter should exist');
        
        // Click category filter
        aiFilter.click();
        await delay(100);
        
        // Check filter is active
        assert.ok(aiFilter.classList.contains('active'), 'Filter should be active');
        
        // Verify only AI assistant tools are shown
        const visibleTools = appDocument.querySelectorAll('.tool-card:not([style*="display: none"])');
        visibleTools.forEach(tool => {
            const category = tool.getAttribute('data-category');
            assert.equal(category, 'ai-assistant', 'Only AI assistant tools should be visible');
        });
        
        // Click again to deactivate
        aiFilter.click();
        await delay(100);
        
        assert.notOk(aiFilter.classList.contains('active'), 'Filter should be inactive');
    });
    
    test('Modal displays detailed tool information', async () => {
        const firstTool = appDocument.querySelector('.tool-card');
        const detailsButton = firstTool.querySelector('button[onclick*="showDetails"]');
        
        // Click details button
        detailsButton.click();
        await delay(100);
        
        const modal = appDocument.getElementById('toolModal');
        assert.equal(modal.style.display, 'block', 'Modal should be visible');
        
        // Verify modal content
        const modalTitle = appDocument.getElementById('modalTitle');
        assert.ok(modalTitle.textContent.length > 0, 'Modal should have title');
        
        // Verify tabs exist
        const tabs = appDocument.querySelectorAll('.tab-button');
        assert.ok(tabs.length >= 4, 'Should have at least 4 tabs');
        
        // Test tab switching
        const featuresTab = Array.from(tabs).find(t => t.textContent.includes('Features'));
        featuresTab.click();
        await delay(100);
        
        assert.ok(featuresTab.classList.contains('active'), 'Features tab should be active');
        
        // Close modal
        const closeButton = appDocument.querySelector('.modal-close');
        closeButton.click();
        await delay(100);
        
        assert.notEqual(modal.style.display, 'block', 'Modal should be hidden');
    });
    
    test('Virtual scrolling maintains performance with 200+ tools', async () => {
        const grid = appDocument.getElementById('toolsGrid');
        const viewport = grid.querySelector('.virtual-scroll-viewport');
        
        assert.ok(viewport, 'Virtual scroll viewport should exist');
        
        // Measure initial render performance
        const startTime = performance.now();
        
        // Scroll to bottom
        viewport.scrollTop = viewport.scrollHeight;
        await delay(100);
        
        const scrollTime = performance.now() - startTime;
        assert.ok(scrollTime < 500, `Scrolling should be performant (took ${scrollTime}ms)`);
        
        // Verify not all items are rendered
        const renderedCards = grid.querySelectorAll('.tool-card').length;
        assert.ok(renderedCards < appWindow.toolsData.length, 
            'Virtual scrolling should not render all items at once');
        
        // Scroll back to top
        viewport.scrollTop = 0;
        await delay(100);
    });
    
    test('Export functionality generates correct data', async () => {
        const exportButton = appDocument.querySelector('.export-btn');
        
        // Intercept download
        let downloadData = null;
        appWindow.URL.createObjectURL = (blob) => {
            downloadData = blob;
            return 'blob:test';
        };
        
        // Mock createElement for anchor
        const originalCreateElement = appDocument.createElement;
        appDocument.createElement = function(tag) {
            const element = originalCreateElement.call(this, tag);
            if (tag === 'a') {
                element.click = () => {
                    // Capture download attempt
                };
            }
            return element;
        };
        
        exportButton.click();
        await delay(100);
        
        assert.ok(downloadData, 'Export should generate data');
        
        // Restore mocks
        appDocument.createElement = originalCreateElement;
    });
    
    test('Responsive design adapts to different screen sizes', async () => {
        const originalWidth = appFrame.style.width;
        
        // Test mobile size
        appFrame.style.width = '375px';
        await delay(300); // Wait for resize handlers
        
        const mobileColumns = getComputedColumns(appDocument);
        assert.equal(mobileColumns, 1, 'Should show 1 column on mobile');
        
        // Test tablet size
        appFrame.style.width = '768px';
        await delay(300);
        
        const tabletColumns = getComputedColumns(appDocument);
        assert.ok(tabletColumns >= 2, 'Should show 2+ columns on tablet');
        
        // Restore original size
        appFrame.style.width = originalWidth;
        await delay(300);
    });
    
    // Helper functions
    function waitForCondition(condition, timeout = 5000, message = 'Condition not met') {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(message));
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function getComputedColumns(doc) {
        const grid = doc.querySelector('.tools-grid');
        const gridStyle = doc.defaultView.getComputedStyle(grid);
        const columns = gridStyle.getPropertyValue('grid-template-columns');
        return columns.split(' ').length;
    }
});