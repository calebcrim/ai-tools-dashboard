// Dashboard Click Fix - Ensures tool cards are clickable
console.log('[Dashboard Click Fix] Initializing...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Dashboard Click Fix] DOM loaded, setting up click handler fallback...');
    
    // Function to show tool details
    function showToolDetails(toolCard) {
        const toolId = toolCard.dataset.toolId;
        const toolName = toolCard.dataset.toolName || 'Unknown Tool';
        
        console.log('[Dashboard Click Fix] Showing details for:', toolName, 'ID:', toolId);
        
        // Try to use the UnifiedDashboard method if available
        if (window.unifiedDashboard && typeof window.unifiedDashboard.openDetailPanel === 'function') {
            console.log('[Dashboard Click Fix] Using UnifiedDashboard.openDetailPanel');
            window.unifiedDashboard.openDetailPanel(toolId);
            return;
        }
        
        // Fallback: Manually open the detail panel
        console.log('[Dashboard Click Fix] Using fallback detail panel display');
        
        const panel = document.getElementById('detailPanel');
        const title = document.getElementById('detailPanelTitle');
        const content = document.getElementById('detailPanelContent');
        
        if (!panel || !title || !content) {
            console.error('[Dashboard Click Fix] Detail panel elements not found');
            alert('Unable to show tool details. Detail panel not found.');
            return;
        }
        
        // Find the tool data
        let toolData = null;
        if (window.unifiedToolsData && window.unifiedToolsData.tools) {
            toolData = window.unifiedToolsData.tools.find(t => 
                t.tool_name === toolName || 
                t.id === toolId ||
                t.tool_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === toolId
            );
        }
        
        // Update panel content
        title.textContent = toolName;
        
        if (toolData) {
            content.innerHTML = `
                <div class="detail-section">
                    <h3>Overview</h3>
                    <p>${toolData.brief_purpose_summary || 'No description available'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Category</h3>
                    <p>${toolData.category || 'Uncategorized'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Website</h3>
                    <p><a href="${toolData.url || '#'}" target="_blank" rel="noopener">${toolData.url || 'Not available'}</a></p>
                </div>
                
                <div class="detail-section">
                    <h3>Pricing</h3>
                    <p>${toolData.pricing_model || 'Pricing information not available'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Features</h3>
                    <p>${toolData.feature_breakdown || 'No feature information available'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Learning Curve</h3>
                    <p>${toolData.learning_curve || 'Learning curve information not available'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Integration Potential</h3>
                    <p>${toolData.integration_potential || 'No integration information available'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Pros & Cons</h3>
                    <p>${toolData.pros_cons_limitations || 'No pros/cons information available'}</p>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="detail-section">
                    <p>Unable to load detailed information for this tool.</p>
                    <p>Tool ID: ${toolId}</p>
                </div>
            `;
        }
        
        // Open the panel
        panel.classList.add('open');
        console.log('[Dashboard Click Fix] Detail panel opened');
    }
    
    // Set up delegation for tool card clicks
    document.addEventListener('click', function(e) {
        // Check if clicked element is within a tool card
        const toolCard = e.target.closest('.tool-card');
        
        if (toolCard) {
            // Don't handle if it's an export button or other internal button
            if (e.target.closest('.export-btn') || e.target.closest('button')) {
                console.log('[Dashboard Click Fix] Ignoring button click within card');
                return;
            }
            
            console.log('[Dashboard Click Fix] Tool card clicked:', toolCard.dataset.toolName);
            e.preventDefault();
            e.stopPropagation();
            
            showToolDetails(toolCard);
        }
    }, true); // Use capture phase to ensure we handle it first
    
    // Also set up close button
    const closeBtn = document.getElementById('closeDetailPanel');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Dashboard Click Fix] Close button clicked');
            
            const panel = document.getElementById('detailPanel');
            if (panel) {
                panel.classList.remove('open');
                console.log('[Dashboard Click Fix] Detail panel closed');
            }
        });
    }
    
    console.log('[Dashboard Click Fix] Setup complete');
});

// Also try to set up after a delay in case DOM isn't ready
setTimeout(function() {
    const cards = document.querySelectorAll('.tool-card');
    console.log('[Dashboard Click Fix] Found', cards.length, 'tool cards after delay');
}, 2000);