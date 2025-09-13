// Cyberpunk Layout Final - Properly structures the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Cyberpunk Layout Final] Starting initialization...');
    
    // Wait for dashboard to fully load
    setTimeout(() => {
        setupLayout();
    }, 1500);
});

function setupLayout() {
    console.log('[Cyberpunk Layout Final] Setting up layout...');
    
    // Find the dashboard body
    const dashboardBody = document.querySelector('.dashboard-body');
    
    if (!dashboardBody) {
        console.error('[Cyberpunk Layout Final] Dashboard body not found');
        return;
    }
    
    // Check if layout already applied
    if (document.querySelector('.cyber-right-panel')) {
        console.log('[Cyberpunk Layout Final] Layout already applied');
        return;
    }
    
    // Find all the content elements
    const filterBar = document.getElementById('filterBar');
    const viewControls = document.querySelector('.view-controls');
    const browseGrid = document.getElementById('browseGrid');
    const executiveGrid = document.getElementById('executiveGrid');
    const technicalGrid = document.getElementById('technicalGrid');
    
    console.log('[Cyberpunk Layout Final] Found elements:', {
        filterBar: !!filterBar,
        viewControls: !!viewControls,
        browseGrid: !!browseGrid,
        executiveGrid: !!executiveGrid,
        technicalGrid: !!technicalGrid
    });
    
    // Create content wrapper if it doesn't exist
    let contentWrapper = document.querySelector('.content-wrapper');
    if (!contentWrapper) {
        contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        
        // Move view controls and grids into wrapper
        const elementsToWrap = [];
        
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
        
        // Move elements into wrapper
        elementsToWrap.forEach(element => {
            contentWrapper.appendChild(element);
        });
        
        // Insert wrapper after filter bar
        if (filterBar && filterBar.nextSibling) {
            dashboardBody.insertBefore(contentWrapper, filterBar.nextSibling);
        } else {
            dashboardBody.appendChild(contentWrapper);
        }
        
        console.log('[Cyberpunk Layout Final] Created content wrapper with', elementsToWrap.length, 'elements');
    }
    
    // Create right panel
    const rightPanel = document.createElement('aside');
    rightPanel.className = 'cyber-right-panel';
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
        
        <div class="cyber-stats-widget">
            <div class="cyber-stats-title">ACTIVE USERS</div>
            <div class="cyber-stats-value">1.2K</div>
            <div class="cyber-stats-change">
                <i class="fas fa-users"></i> Currently online
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
                <div style="font-weight: 500;">GPT-4 pricing update</div>
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
    
    // Append right panel to dashboard body
    dashboardBody.appendChild(rightPanel);
    
    // Force proper grid layout
    dashboardBody.style.cssText = `
        display: grid !important;
        grid-template-columns: 250px 1fr 300px !important;
        gap: 20px !important;
        width: 100% !important;
        align-items: start !important;
    `;
    
    // Set grid positions
    if (filterBar) {
        filterBar.style.cssText += `
            grid-column: 1 !important;
            grid-row: 1 !important;
            margin: 0 !important;
        `;
    }
    
    if (contentWrapper) {
        contentWrapper.style.cssText = `
            grid-column: 2 !important;
            grid-row: 1 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
        `;
    }
    
    rightPanel.style.cssText += `
        grid-column: 3 !important;
        grid-row: 1 !important;
    `;
    
    // Ensure tool grids are properly styled
    [browseGrid, executiveGrid, technicalGrid].forEach(grid => {
        if (grid) {
            grid.style.cssText += `
                display: grid !important;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                gap: 20px !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
        }
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
    if (!document.querySelector('#cyberpunk-final-animations')) {
        const style = document.createElement('style');
        style.id = 'cyberpunk-final-animations';
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
            
            /* Ensure tool cards are visible */
            .tool-card {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('[Cyberpunk Layout Final] Layout setup complete');
}