// Cyberpunk Layout Enhancement - Adds Right Panel
document.addEventListener('DOMContentLoaded', function() {
    // Find the main container
    const mainContainer = document.querySelector('.main-container') || 
                         document.querySelector('.container') || 
                         document.querySelector('.dashboard-container');
    
    if (!mainContainer) {
        console.log('[Cyberpunk Layout] Main container not found, creating one');
        return;
    }

    // Check if right panel already exists
    if (document.querySelector('.right-panel-cyberpunk')) {
        console.log('[Cyberpunk Layout] Right panel already exists');
        return;
    }

    // Create the right panel
    const rightPanel = document.createElement('aside');
    rightPanel.className = 'right-panel-cyberpunk';
    rightPanel.innerHTML = `
        <!-- Stats Section -->
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
        
        <!-- Activity Feed -->
        <div class="cyber-activity-feed">
            <div class="cyber-stats-title" style="margin-bottom: 16px;">RECENT ACTIVITY</div>
            
            <div class="cyber-activity-item">
                <div>New tool added: Claude 3 Opus</div>
                <div class="cyber-activity-time">2 hours ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div>Midjourney updated to v6</div>
                <div class="cyber-activity-time">5 hours ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div>ChatGPT pricing changed</div>
                <div class="cyber-activity-time">1 day ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div>New category: Voice AI</div>
                <div class="cyber-activity-time">2 days ago</div>
            </div>
            
            <div class="cyber-activity-item">
                <div>DataRobot integration added</div>
                <div class="cyber-activity-time">3 days ago</div>
            </div>
        </div>
    `;

    // Append the right panel to the main container
    mainContainer.appendChild(rightPanel);
    
    // Force the container to use grid layout
    mainContainer.style.display = 'grid';
    mainContainer.style.gridTemplateColumns = '250px 1fr 300px';
    mainContainer.style.gap = '20px';
    
    // Ensure the filter sidebar is in the first column
    const filterSidebar = document.querySelector('.filter-sidebar, .sidebar, aside');
    if (filterSidebar) {
        filterSidebar.style.gridColumn = '1';
    }
    
    // Ensure the main content is in the second column
    const mainContent = document.querySelector('.content-area, .tools-container, main');
    if (mainContent) {
        mainContent.style.gridColumn = '2';
    }
    
    // Animate the stats values
    setTimeout(() => {
        document.querySelectorAll('.cyber-stats-value').forEach(stat => {
            stat.style.animation = 'pulse 2s infinite';
        });
    }, 500);
    
    // Add pulse animation if it doesn't exist
    if (!document.querySelector('#cyber-pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'cyber-pulse-animation';
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
            
            /* Ensure proper styling for the right panel */
            .right-panel-cyberpunk {
                background: rgba(13, 148, 136, 0.05) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                border: 1px solid rgba(20, 184, 166, 0.2) !important;
                border-radius: 16px !important;
                padding: 20px !important;
                height: calc(100vh - 120px) !important;
                overflow-y: auto !important;
                position: sticky !important;
                top: 100px !important;
            }
            
            .cyber-stats-widget {
                background: rgba(10, 15, 10, 0.4) !important;
                border: 1px solid rgba(34, 197, 94, 0.2) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                margin-bottom: 16px !important;
                transition: all 0.3s ease !important;
            }
            
            .cyber-stats-widget:hover {
                background: rgba(20, 184, 166, 0.1) !important;
                border-color: #14b8a6 !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 10px 30px rgba(20, 184, 166, 0.2) !important;
            }
            
            .cyber-stats-title {
                font-size: 12px !important;
                text-transform: uppercase !important;
                letter-spacing: 2px !important;
                color: #8bb89a !important;
                margin-bottom: 12px !important;
            }
            
            .cyber-stats-value {
                font-size: 28px !important;
                font-weight: 700 !important;
                color: #14b8a6 !important;
                text-shadow: 0 0 20px rgba(20, 184, 166, 0.5) !important;
                margin-bottom: 8px !important;
                line-height: 1 !important;
            }
            
            .cyber-stats-change {
                font-size: 14px !important;
                color: #22c55e !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
            }
            
            .cyber-activity-item {
                padding: 12px !important;
                background: rgba(10, 15, 10, 0.3) !important;
                border-left: 3px solid #14b8a6 !important;
                margin-bottom: 12px !important;
                border-radius: 4px !important;
                font-size: 14px !important;
                color: #8bb89a !important;
                transition: all 0.3s ease !important;
            }
            
            .cyber-activity-item:hover {
                background: rgba(20, 184, 166, 0.1) !important;
                transform: translateX(4px) !important;
            }
            
            .cyber-activity-time {
                font-size: 12px !important;
                color: #6b7c6f !important;
                margin-top: 4px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('[Cyberpunk Layout] Right panel added successfully');
});