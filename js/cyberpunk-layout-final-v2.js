// Cyberpunk Layout Final V2 - Waits for dashboard to fully render
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Cyberpunk Layout V2] Starting initialization...');
    
    // Watch for when the dashboard finishes rendering
    waitForDashboardReady();
});

function waitForDashboardReady() {
    let checkCount = 0;
    const maxChecks = 20; // Max 10 seconds
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        // Check if browse grid has tool cards
        const browseGrid = document.getElementById('browseGrid');
        const toolCards = browseGrid ? browseGrid.querySelectorAll('.tool-card') : [];
        
        console.log(`[Cyberpunk Layout V2] Check ${checkCount}: Found ${toolCards.length} tool cards`);
        
        // If we have tool cards or max checks reached, setup layout
        if (toolCards.length > 0 || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.log(`[Cyberpunk Layout V2] Dashboard ready with ${toolCards.length} cards, setting up layout...`);
            setTimeout(() => setupLayout(), 100); // Small delay to ensure DOM is stable
        }
    }, 500);
}

function setupLayout() {
    console.log('[Cyberpunk Layout V2] Setting up 3-column layout...');
    
    // Find the dashboard body
    const dashboardBody = document.querySelector('.dashboard-body');
    
    if (!dashboardBody) {
        console.error('[Cyberpunk Layout V2] Dashboard body not found');
        return;
    }
    
    // Check if layout already applied
    if (document.querySelector('.cyber-right-panel')) {
        console.log('[Cyberpunk Layout V2] Layout already applied');
        return;
    }
    
    // Find all the content elements
    const filterBar = document.getElementById('filterBar');
    const viewControls = document.querySelector('.view-controls');
    const browseGrid = document.getElementById('browseGrid');
    const executiveGrid = document.getElementById('executiveGrid');
    const technicalGrid = document.getElementById('technicalGrid');
    
    console.log('[Cyberpunk Layout V2] Found elements:', {
        filterBar: !!filterBar,
        viewControls: !!viewControls,
        browseGrid: !!browseGrid,
        executiveGrid: !!executiveGrid,
        technicalGrid: !!technicalGrid,
        toolCards: browseGrid ? browseGrid.querySelectorAll('.tool-card').length : 0
    });
    
    // Create content wrapper if it doesn't exist
    let contentWrapper = document.querySelector('.content-wrapper');
    if (!contentWrapper) {
        contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        contentWrapper.style.cssText = `
            grid-column: 2 !important;
            grid-row: 1 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            min-height: 100% !important;
        `;
        
        // Collect elements to wrap
        const elementsToWrap = [];
        
        // Only move elements that are direct children of dashboard body
        if (viewControls && viewControls.parentNode === dashboardBody) {
            elementsToWrap.push(viewControls);
        }
        if (browseGrid && browseGrid.parentNode === dashboardBody) {
            elementsToWrap.push(browseGrid);
        }
        if (executiveGrid && executiveGrid.parentNode === dashboardBody) {
            elementsToWrap.push(executiveGrid);
        }
        if (technicalGrid && technicalGrid.parentNode === dashboardBody) {
            elementsToWrap.push(technicalGrid);
        }
        
        // If no elements are direct children, they might be in another wrapper
        if (elementsToWrap.length === 0) {
            // Find any div that contains the grids
            const existingWrapper = Array.from(dashboardBody.children).find(child => {
                return child.contains(browseGrid) || child.contains(executiveGrid) || child.contains(technicalGrid);
            });
            
            if (existingWrapper && existingWrapper !== filterBar) {
                console.log('[Cyberpunk Layout V2] Using existing wrapper:', existingWrapper.className);
                contentWrapper = existingWrapper;
                contentWrapper.classList.add('content-wrapper');
            }
        } else {
            // Move elements into new wrapper
            elementsToWrap.forEach(element => {
                contentWrapper.appendChild(element);
            });
            
            // Insert wrapper into dashboard body
            if (filterBar && filterBar.nextSibling) {
                dashboardBody.insertBefore(contentWrapper, filterBar.nextSibling);
            } else {
                dashboardBody.appendChild(contentWrapper);
            }
            
            console.log('[Cyberpunk Layout V2] Created content wrapper with', elementsToWrap.length, 'elements');
        }
    }
    
    // Create right panel
    const rightPanel = document.createElement('aside');
    rightPanel.className = 'cyber-right-panel';
    rightPanel.style.cssText = `
        grid-column: 3 !important;
        grid-row: 1 !important;
        position: sticky !important;
        top: 100px !important;
        height: fit-content !important;
        max-height: calc(100vh - 140px) !important;
        overflow-y: auto !important;
        background: rgba(13, 148, 136, 0.05) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(20, 184, 166, 0.2) !important;
        border-radius: 16px !important;
        padding: 20px !important;
        margin: 0 !important;
    `;
    
    rightPanel.innerHTML = `
        <!-- System Stats -->
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">SYSTEM STATUS</div>
            <div class="cyber-stats-value" style="color: #22c55e;">ONLINE</div>
            <div class="cyber-stats-change">
                <i class="fas fa-check-circle"></i> All systems operational
            </div>
        </div>
        
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">TOOLS LOADED</div>
            <div class="cyber-stats-value">${document.querySelectorAll('.tool-card').length}</div>
            <div class="cyber-stats-change">
                <i class="fas fa-database"></i> In current view
            </div>
        </div>
        
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">WEEKLY GROWTH</div>
            <div class="cyber-stats-value">+24%</div>
            <div class="cyber-stats-change">
                <i class="fas fa-arrow-up"></i> 5.2% from last week
            </div>
        </div>
        
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">POPULAR CATEGORY</div>
            <div class="cyber-stats-value" style="font-size: 20px;">AI Writing</div>
            <div class="cyber-stats-change">
                <i class="fas fa-fire"></i> 2.4K searches today
            </div>
        </div>
        
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">NEW TOOLS</div>
            <div class="cyber-stats-value">12</div>
            <div class="cyber-stats-change">
                <i class="fas fa-plus"></i> Added this week
            </div>
        </div>
        
        <!-- Activity Feed -->
        <div style="margin-top: 24px;">
            <div class="cyber-stats-title" style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(20, 184, 166, 0.2);">
                RECENT ACTIVITY
            </div>
            
            <div class="cyber-activity-item">
                <div style="font-weight: 500;">Claude 3 Opus added</div>
                <div class="cyber-activity-time">2 hours ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div style="font-weight: 500;">Midjourney v6 released</div>
                <div class="cyber-activity-time">5 hours ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div style="font-weight: 500;">GPT-4 Turbo update</div>
                <div class="cyber-activity-time">1 day ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div style="font-weight: 500;">Voice AI category added</div>
                <div class="cyber-activity-time">2 days ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div style="font-weight: 500;">DataRobot integrated</div>
                <div class="cyber-activity-time">3 days ago</div>
            </div>
        </div>
    `;
    
    // Apply grid layout to dashboard body
    dashboardBody.style.cssText = `
        display: grid !important;
        grid-template-columns: 250px 1fr 300px !important;
        gap: 20px !important;
        width: 100% !important;
        align-items: start !important;
        min-height: calc(100vh - 200px) !important;
    `;
    
    // Position filter bar
    if (filterBar) {
        filterBar.style.cssText += `
            grid-column: 1 !important;
            grid-row: 1 !important;
            margin: 0 !important;
            position: sticky !important;
            top: 100px !important;
            height: fit-content !important;
            max-height: calc(100vh - 140px) !important;
            overflow-y: auto !important;
        `;
    }
    
    // Position content wrapper
    if (contentWrapper) {
        contentWrapper.style.cssText += `
            grid-column: 2 !important;
            grid-row: 1 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
        `;
    }
    
    // Append right panel
    dashboardBody.appendChild(rightPanel);
    
    // Fix tool grids to ensure they display properly
    [browseGrid, executiveGrid, technicalGrid].forEach(grid => {
        if (grid) {
            // Preserve existing display state
            const currentDisplay = window.getComputedStyle(grid).display;
            if (currentDisplay !== 'none') {
                grid.style.cssText += `
                    display: grid !important;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                    gap: 20px !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;
            }
        }
    });
    
    // Ensure tool cards are visible
    const allToolCards = document.querySelectorAll('.tool-card');
    allToolCards.forEach(card => {
        card.style.visibility = 'visible';
        card.style.opacity = '1';
        card.style.position = 'relative';
    });
    
    // Add animations
    setTimeout(() => {
        const statsValues = rightPanel.querySelectorAll('.cyber-stats-value');
        statsValues.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'pulse 2s infinite';
            }, index * 100);
        });
    }, 500);
    
    // Add animation styles
    if (!document.querySelector('#cyberpunk-v2-animations')) {
        const style = document.createElement('style');
        style.id = 'cyberpunk-v2-animations';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { 
                    transform: scale(1);
                    text-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
                }
                50% { 
                    transform: scale(1.05);
                    text-shadow: 0 0 30px rgba(20, 184, 166, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('[Cyberpunk Layout V2] Layout setup complete!');
    console.log('[Cyberpunk Layout V2] Final structure:', {
        dashboardBody: dashboardBody.style.display,
        filterBar: filterBar ? 'Column 1' : 'Missing',
        contentWrapper: contentWrapper ? 'Column 2' : 'Missing',
        rightPanel: 'Column 3',
        toolCardsVisible: allToolCards.length
    });
}