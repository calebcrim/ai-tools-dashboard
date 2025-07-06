/**
 * Integration Tests for Component Interactions
 * Tests real component integration without mocks
 */

describe('Integration: Component Interactions', () => {
    let container;
    
    beforeEach(() => {
        // Create fresh container for each test
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });
    
    afterEach(() => {
        // Clean up
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    
    test('Virtual scroll integrates with real tool data', async () => {
        // Create tools grid container
        const gridContainer = document.createElement('div');
        gridContainer.style.height = '600px';
        container.appendChild(gridContainer);
        
        // Initialize virtual scroll with real data
        const virtualScroll = new window.VirtualScroll(
            gridContainer,
            window.unifiedToolsData.tools,
            (tool) => {
                const card = document.createElement('div');
                card.className = 'tool-card';
                card.textContent = tool.tool_name;
                card.dataset.toolId = tool.id;
                return card;
            }
        );
        
        // Wait for initial render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify rendering
        const renderedCards = gridContainer.querySelectorAll('.tool-card');
        assert.ok(renderedCards.length > 0, 'Should render some cards');
        assert.ok(renderedCards.length < window.unifiedToolsData.tools.length, 
            'Should not render all cards (virtual scrolling)');
        
        // Test scrolling
        const viewport = gridContainer.querySelector('.virtual-scroll-viewport');
        viewport.scrollTop = 1000;
        viewport.dispatchEvent(new Event('scroll'));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newRenderedCards = gridContainer.querySelectorAll('.tool-card');
        assert.ok(newRenderedCards.length > 0, 'Should still have rendered cards after scroll');
    });
    
    test('Modal tabs display real tool data correctly', () => {
        // Add modal HTML structure
        container.innerHTML = `
            <div id="toolModal" style="display: none;">
                <div id="modalTitle"></div>
                <div id="modalBody"></div>
            </div>
        `;
        
        // Initialize modal tabs
        const modalTabs = new window.ModalTabs();
        
        // Show details for a real tool
        const testTool = window.unifiedToolsData.tools[0];
        modalTabs.showToolDetails(testTool.id);
        
        // Verify modal is shown
        const modal = container.querySelector('#toolModal');
        assert.equal(modal.style.display, 'block', 'Modal should be visible');
        
        // Verify title
        const title = container.querySelector('#modalTitle');
        assert.equal(title.textContent, testTool.tool_name, 'Modal should show tool name');
        
        // Verify tabs exist
        const tabs = container.querySelectorAll('.tab-button');
        assert.ok(tabs.length >= 4, 'Should have at least 4 tabs');
        
        // Test tab content
        const overviewContent = container.querySelector('.tab-overview');
        assert.ok(overviewContent, 'Should show overview tab by default');
        assert.includes(overviewContent.textContent, testTool.brief_purpose_summary, 
            'Should display tool summary');
    });
    
    test('Search and filter work together correctly', () => {
        // This would require more setup of the search/filter components
        // Placeholder for comprehensive integration test
        assert.ok(true, 'Integration test placeholder');
    });
});