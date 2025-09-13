// Cyberpunk Layout Fix - Properly adds right panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Cyberpunk Layout Fix] Initializing...');
    
    // Wait a bit for the dashboard to fully load
    setTimeout(() => {
        // Find the dashboard body
        const dashboardBody = document.querySelector('.dashboard-body');
        
        if (!dashboardBody) {
            console.error('[Cyberpunk Layout Fix] Dashboard body not found');
            return;
        }

        // Check if right panel already exists
        if (document.querySelector('.cyber-right-panel')) {
            console.log('[Cyberpunk Layout Fix] Right panel already exists');
            return;
        }

        // Find the content wrapper (contains the tool grids)
        let contentWrapper = document.querySelector('.content-wrapper');
        
        // If content wrapper doesn't exist, we need to wrap the existing content
        if (!contentWrapper) {
            console.log('[Cyberpunk Layout Fix] Creating content wrapper...');
            
            // Find all the content that should be in the center column
            const browseGrid = document.getElementById('browseGrid');
            const executiveGrid = document.getElementById('executiveGrid');
            const technicalGrid = document.getElementById('technicalGrid');
            const viewControls = document.querySelector('.view-controls');
            
            // Create the content wrapper
            contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            
            // Move existing content into the wrapper
            if (viewControls && viewControls.parentNode === dashboardBody) {
                contentWrapper.appendChild(viewControls);
            }
            if (browseGrid && browseGrid.parentNode === dashboardBody) {
                contentWrapper.appendChild(browseGrid);
            }
            if (executiveGrid && executiveGrid.parentNode === dashboardBody) {
                contentWrapper.appendChild(executiveGrid);
            }
            if (technicalGrid && technicalGrid.parentNode === dashboardBody) {
                contentWrapper.appendChild(technicalGrid);
            }
            
            // Add the wrapper to the dashboard body
            dashboardBody.appendChild(contentWrapper);
        }

        // Create the right panel
        const rightPanel = document.createElement('aside');
        rightPanel.className = 'cyber-right-panel';
        rightPanel.innerHTML = `
            <!-- Weekly Stats -->
            <div class="cyber-stats-widget">
                <div class="cyber-stats-title">WEEKLY GROWTH</div>
                <div class="cyber-stats-value">+24%</div>
                <div class="cyber-stats-change">
                    <i class="fas fa-arrow-up"></i> 5.2% from last week
                </div>
            </div>
            
            <div class="cyber-stats-widget">
                <div class="cyber-stats-title">POPULAR CATEGORY</div>
                <div class="cyber-stats-value">AI Writing</div>
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
                <div class="cyber-stats-title">API STATUS</div>
                <div class="cyber-stats-value">98%</div>
                <div class="cyber-stats-change">
                    <i class="fas fa-check-circle"></i> All systems operational
                </div>
            </div>
            
            <div class="cyber-stats-widget">
                <div class="cyber-stats-title">USER ACTIVITY</div>
                <div class="cyber-stats-value">1.2K</div>
                <div class="cyber-stats-change">
                    <i class="fas fa-users"></i> Active now
                </div>
            </div>
            
            <!-- Activity Feed -->
            <div style="margin-top: 24px;">
                <div class="cyber-stats-title" style="margin-bottom: 16px;">RECENT ACTIVITY</div>
                
                <div class="cyber-activity-item">
                    <div>Claude 3 Opus added to catalog</div>
                    <div class="cyber-activity-time">2 hours ago</div>
                </div>
                
                <div class="cyber-activity-item">
                    <div>Midjourney updated to v6</div>
                    <div class="cyber-activity-time">5 hours ago</div>
                </div>
                
                <div class="cyber-activity-item">
                    <div>ChatGPT-4 pricing updated</div>
                    <div class="cyber-activity-time">1 day ago</div>
                </div>
                
                <div class="cyber-activity-item">
                    <div>New category: Voice AI Tools</div>
                    <div class="cyber-activity-time">2 days ago</div>
                </div>
                
                <div class="cyber-activity-item">
                    <div>DataRobot integration added</div>
                    <div class="cyber-activity-time">3 days ago</div>
                </div>
                
                <div class="cyber-activity-item">
                    <div>Stability AI tools updated</div>
                    <div class="cyber-activity-time">4 days ago</div>
                </div>
            </div>
        `;

        // Append the right panel to dashboard body
        dashboardBody.appendChild(rightPanel);
        
        // Apply grid layout to dashboard body
        dashboardBody.style.display = 'grid';
        dashboardBody.style.gridTemplateColumns = '250px 1fr 300px';
        dashboardBody.style.gap = '20px';
        
        // Ensure filter bar is in first column
        const filterBar = document.getElementById('filterBar');
        if (filterBar) {
            filterBar.style.gridColumn = '1';
            filterBar.style.gridRow = '1 / -1';
        }
        
        // Ensure content wrapper is in second column
        if (contentWrapper) {
            contentWrapper.style.gridColumn = '2';
            contentWrapper.style.gridRow = '1 / -1';
        }
        
        // Ensure right panel is in third column
        rightPanel.style.gridColumn = '3';
        rightPanel.style.gridRow = '1 / -1';
        
        // Animate the stats
        setTimeout(() => {
            const statsValues = rightPanel.querySelectorAll('.cyber-stats-value');
            statsValues.forEach((stat, index) => {
                setTimeout(() => {
                    stat.style.animation = 'pulse 2s infinite';
                }, index * 100);
            });
        }, 500);
        
        // Add animation styles if not present
        if (!document.querySelector('#cyberpunk-animations')) {
            const style = document.createElement('style');
            style.id = 'cyberpunk-animations';
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
        
        console.log('[Cyberpunk Layout Fix] Right panel added successfully');
        console.log('[Cyberpunk Layout Fix] Grid structure:', {
            filterBar: filterBar ? 'Found' : 'Missing',
            contentWrapper: contentWrapper ? 'Found' : 'Missing',
            rightPanel: rightPanel ? 'Found' : 'Missing'
        });
        
    }, 1000); // Wait for dashboard to initialize
});