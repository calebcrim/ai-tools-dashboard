/**
 * Comparison Integration Module
 * Enhances the existing comparison functionality with the new comprehensive view
 */

// Global variables for comparison
let comparisonAdapter = null;
let comparisonView = null;
let comparisonModal = null;

// Initialize comparison components
function initializeComparisonView() {
    // Create adapter
    if (typeof ToolComparisonAdapter !== 'undefined') {
        comparisonAdapter = new ToolComparisonAdapter();
    }
    
    // Add comparison view button to the panel
    enhanceComparisonPanel();
    
    // Check URL parameters for shared comparisons
    checkComparisonUrlParams();
}

// Enhance the existing comparison panel
function enhanceComparisonPanel() {
    const panel = document.getElementById('comparisonPanel');
    if (!panel) return;
    
    // Find the comparison actions div
    const actionsDiv = panel.querySelector('.comparison-actions');
    if (actionsDiv) {
        // Add new button before export button
        const viewButton = document.createElement('button');
        viewButton.className = 'btn-primary';
        viewButton.innerHTML = '<i class="fas fa-columns"></i> View Comparison';
        viewButton.onclick = openComparisonView;
        
        // Insert before the first button
        actionsDiv.insertBefore(viewButton, actionsDiv.firstChild);
    }
}

// Open the comprehensive comparison view
function openComparisonView() {
    if (comparisonTools.length === 0) {
        showNotification('No tools selected for comparison', 'warning');
        return;
    }
    
    // Create modal if it doesn't exist
    if (!comparisonModal) {
        createComparisonModal();
    }
    
    // Initialize view if needed
    if (!comparisonView) {
        const container = document.getElementById('comparisonViewContainer');
        comparisonView = new ToolComparisonView(container, comparisonAdapter);
    }
    
    // Update with current tools
    comparisonView.updateTools(comparisonTools);
    
    // Show modal
    comparisonModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Track event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_comparison', {
            'tool_count': comparisonTools.length,
            'tool_names': comparisonTools.map(t => t.tool_name).join(', ')
        });
    }
}

// Create the comparison modal
function createComparisonModal() {
    // Create modal structure
    const modal = document.createElement('div');
    modal.id = 'comparisonModal';
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="comparison-modal-content">
            <div class="comparison-modal-header">
                <button class="modal-close" onclick="closeComparisonView()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="comparisonViewContainer"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    comparisonModal = modal;
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeComparisonView();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeComparisonView();
        }
    });
}

// Close comparison view
window.closeComparisonView = function() {
    if (comparisonModal) {
        comparisonModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Export comparison data with format options
window.exportComparisonData = function() {
    if (!comparisonView) return;
    
    // Create export menu
    const exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';
    exportMenu.innerHTML = `
        <button onclick="exportComparisonFormat('json')">
            <i class="fas fa-file-code"></i> Export as JSON
        </button>
        <button onclick="exportComparisonFormat('csv')">
            <i class="fas fa-file-csv"></i> Export as CSV
        </button>
        <button onclick="exportComparisonFormat('markdown')">
            <i class="fas fa-file-alt"></i> Export as Markdown
        </button>
        <button onclick="shareComparison()">
            <i class="fas fa-share-alt"></i> Share Link
        </button>
    `;
    
    // Position menu
    const exportBtn = event.currentTarget;
    exportBtn.parentElement.style.position = 'relative';
    exportBtn.parentElement.appendChild(exportMenu);
    
    // Close menu on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!exportMenu.contains(e.target) && e.target !== exportBtn) {
                exportMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Export in specific format
window.exportComparisonFormat = function(format) {
    if (!comparisonView) return;
    
    comparisonView.exportData(format);
    
    // Close menu
    const menu = document.querySelector('.export-menu');
    if (menu) menu.remove();
    
    showNotification(`Comparison exported as ${format.toUpperCase()}`, 'success');
}

// Share comparison
window.shareComparison = function() {
    if (!comparisonView) return;
    
    comparisonView.copyShareUrl();
    
    // Close menu
    const menu = document.querySelector('.export-menu');
    if (menu) menu.remove();
}

// Check URL parameters for shared comparisons
function checkComparisonUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const compareIds = urlParams.get('compare');
    
    if (compareIds) {
        const ids = compareIds.split(',').map(id => parseInt(id));
        const toolsToCompare = allTools.filter(tool => ids.includes(tool.id));
        
        if (toolsToCompare.length > 0) {
            // Clear existing comparison
            comparisonTools = [];
            
            // Add tools to comparison
            toolsToCompare.forEach(tool => {
                if (comparisonTools.length < 3) {
                    comparisonTools.push(tool);
                }
            });
            
            updateComparisonCount();
            updateComparisonPanel();
            
            // Auto-open comparison view
            setTimeout(() => {
                openComparisonView();
            }, 1000);
        }
    }
}

// Override the existing updateComparisonPanel to add view button visibility
const originalUpdateComparisonPanel = window.updateComparisonPanel;
window.updateComparisonPanel = function() {
    // Call original function
    if (originalUpdateComparisonPanel) {
        originalUpdateComparisonPanel();
    }
    
    // Update view button visibility
    const panel = document.getElementById('comparisonPanel');
    if (panel) {
        const viewBtn = panel.querySelector('.btn-primary');
        if (viewBtn && comparisonTools.length > 0) {
            viewBtn.style.display = 'inline-flex';
        } else if (viewBtn) {
            viewBtn.style.display = 'none';
        }
    }
}

// Add initialization to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for main app to initialize
    setTimeout(() => {
        initializeComparisonView();
    }, 500);
});

// Add modal styles
const modalStyles = `
<style>
.comparison-modal {
    display: none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.3s ease;
}

.comparison-modal-content {
    background-color: #fefefe;
    margin: 2% auto;
    width: 95%;
    max-width: 1600px;
    height: 94vh;
    max-height: 94vh;
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;
}

.comparison-modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #718096;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #f7fafc;
    color: #2d3748;
}

#comparisonViewContainer {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 2rem; /* Add padding at bottom for better scrolling */
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Update comparison panel styles */
.comparison-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.comparison-actions .btn-primary {
    background: #3182ce;
    color: white;
    display: none;
}

.comparison-actions .btn-primary:hover {
    background: #2c5282;
}

.comparison-actions .btn-primary i {
    margin-right: 0.5rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .comparison-modal-content {
        width: 100%;
        height: 100vh;
        margin: 0;
        border-radius: 0;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', modalStyles);