// Enterprise Dashboard JavaScript

// Dashboard data structure
let dashboardData = {
    mainTable: [],
    aiAssistants: [],
    analytics: [],
    contentCreation: [],
    security: [],
    finance: [],
    insufficientData: []
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    initializeEventListeners();
    updateLastUpdated();
    initializeTableOfContents();
});

// Load and parse the markdown data
async function loadDashboardData() {
    try {
        const response = await fetch('ai-tools-dashboard-report.md');
        const markdown = await response.text();
        parseMarkdownData(markdown);
        populateTables();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Parse markdown content into structured data
function parseMarkdownData(markdown) {
    // Parse main high-impact tools table
    const mainTableRegex = /\| (.+?) \| (.+?) \| (\d+) \| (\d+) \| (.+?) \| (.+?) \|/g;
    const lines = markdown.split('\n');
    
    let currentSection = '';
    let inTable = false;
    let skipHeader = true;
    
    lines.forEach(line => {
        // Detect section headers
        if (line.startsWith('## High-Impact Tools Dashboard')) {
            currentSection = 'mainTable';
            inTable = false;
            skipHeader = true;
        } else if (line.includes('## 🤖 AI Assistants & LLMs')) {
            currentSection = 'aiAssistants';
            inTable = false;
            skipHeader = true;
        } else if (line.includes('## 📊 Analytics & Intelligence')) {
            currentSection = 'analytics';
            inTable = false;
            skipHeader = true;
        } else if (line.includes('## 🎥 Content Creation')) {
            currentSection = 'contentCreation';
            inTable = false;
            skipHeader = true;
        } else if (line.includes('## 🔒 Security & Legal')) {
            currentSection = 'security';
            inTable = false;
            skipHeader = true;
        } else if (line.includes('## 🏦 Finance Tools')) {
            currentSection = 'finance';
            inTable = false;
            skipHeader = true;
        }
        
        // Parse table rows
        if (line.startsWith('|') && !line.includes('---')) {
            if (skipHeader) {
                skipHeader = false;
                return;
            }
            
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            if (currentSection === 'mainTable' && cells.length >= 6) {
                dashboardData.mainTable.push({
                    name: cells[0].replace(/\*\*/g, ''),
                    category: cells[1],
                    businessImpact: parseInt(cells[2]),
                    complexity: parseInt(cells[3]),
                    timeToValue: cells[4],
                    enterpriseFeatures: cells[5]
                });
            } else if (currentSection !== 'mainTable' && cells.length >= 5) {
                const categoryData = {
                    name: cells[0].replace(/\*\*/g, ''),
                    businessImpact: parseInt(cells[1]),
                    complexity: parseInt(cells[2]),
                    timeToValue: cells[3],
                    enterpriseFeatures: cells[4],
                    rationale: cells[5] || ''
                };
                
                if (currentSection === 'aiAssistants') dashboardData.aiAssistants.push(categoryData);
                else if (currentSection === 'analytics') dashboardData.analytics.push(categoryData);
                else if (currentSection === 'contentCreation') dashboardData.contentCreation.push(categoryData);
                else if (currentSection === 'security') dashboardData.security.push(categoryData);
                else if (currentSection === 'finance') dashboardData.finance.push(categoryData);
            }
        }
    });
}

// Populate all tables with data
function populateTables() {
    // Populate main table
    const mainTableBody = document.getElementById('mainTableBody');
    if (mainTableBody) {
        mainTableBody.innerHTML = dashboardData.mainTable.map(tool => `
            <tr>
                <td><span class="tool-name">${tool.name}</span></td>
                <td><span class="category-badge">${tool.category}</span></td>
                <td>${tool.businessImpact}</td>
                <td>${renderComplexity(tool.complexity)}</td>
                <td>${tool.timeToValue}</td>
                <td>${renderEnterpriseFeatures(tool.enterpriseFeatures)}</td>
            </tr>
        `).join('');
    }
    
    // Populate category tables
    populateCategoryTable('aiAssistantsTableBody', dashboardData.aiAssistants);
    populateCategoryTable('analyticsTableBody', dashboardData.analytics);
    populateCategoryTable('contentTableBody', dashboardData.contentCreation);
    populateCategoryTable('securityTableBody', dashboardData.security);
    populateCategoryTable('financeTableBody', dashboardData.finance);
}

// Populate category-specific tables
function populateCategoryTable(tableId, data) {
    const tableBody = document.getElementById(tableId);
    if (tableBody && data.length > 0) {
        tableBody.innerHTML = data.map(tool => `
            <tr>
                <td><span class="tool-name">${tool.name}</span></td>
                <td>${tool.businessImpact}</td>
                <td>${renderComplexity(tool.complexity)}</td>
                <td>${tool.timeToValue}</td>
                <td>${renderEnterpriseFeatures(tool.enterpriseFeatures)}</td>
                <td class="rationale-cell">${tool.rationale}</td>
            </tr>
        `).join('');
    }
}

// Render complexity as visual indicators
function renderComplexity(complexity) {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
        const filled = i <= complexity ? 'filled' : '';
        dots.push(`<span class="complexity-dot ${filled}"></span>`);
    }
    return `<div class="complexity-indicator">${dots.join('')} ${complexity}/5</div>`;
}

// Render enterprise features with checkmarks
function renderEnterpriseFeatures(features) {
    if (!features) return '';
    
    // Split features and create badges
    const featureList = features.split(',').map(feature => {
        const trimmed = feature.trim();
        if (trimmed.startsWith('✓')) {
            return `<span class="feature-badge"><span class="checkmark">✓</span>${trimmed.substring(1).trim()}</span>`;
        }
        return `<span class="feature-badge">${trimmed}</span>`;
    });
    
    return `<div class="enterprise-features">${featureList.join('')}</div>`;
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }
    
    // Complexity range slider
    const complexityRange = document.getElementById('complexityRange');
    if (complexityRange) {
        complexityRange.addEventListener('input', function(e) {
            document.getElementById('complexityValue').textContent = e.target.value;
            filterByComplexity(e.target.value);
        });
    }
}

// Table filtering functionality
function filterTable() {
    const searchValue = document.getElementById('tableSearch').value.toLowerCase();
    const table = document.getElementById('mainTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        
        if (text.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Filter by category
function filterByCategory(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const table = document.getElementById('mainTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const categoryCell = row.cells[1].textContent.toLowerCase();
        
        if (category === 'all') {
            row.style.display = '';
        } else if (categoryCell.includes(category.replace('-', ' '))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Filter by complexity
function filterByComplexity(maxComplexity) {
    const table = document.getElementById('mainTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const complexityText = row.cells[3].textContent;
        const complexity = parseInt(complexityText.match(/\d/)[0]);
        
        if (complexity <= maxComplexity) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Table sorting functionality
let sortDirection = {};

function sortTable(columnIndex) {
    const table = document.getElementById('mainTable');
    const rows = Array.from(table.rows).slice(1);
    const header = table.rows[0].cells[columnIndex];
    
    // Toggle sort direction
    const column = header.textContent;
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    
    // Update sort icons
    const headers = table.querySelectorAll('th');
    headers.forEach(th => {
        const icon = th.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sort';
        }
    });
    
    const currentIcon = header.querySelector('i');
    if (currentIcon) {
        currentIcon.className = sortDirection[column] === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent.trim();
        let bValue = b.cells[columnIndex].textContent.trim();
        
        // Handle numeric columns
        if (columnIndex === 2 || columnIndex === 3) {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        }
        
        if (sortDirection[column] === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Re-append sorted rows
    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
}

// Toggle collapsible sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle('collapsed');
}

// Toggle table of contents on mobile
function toggleTOC() {
    const sidebar = document.getElementById('tocSidebar');
    sidebar.classList.toggle('open');
}

// Initialize table of contents
function initializeTableOfContents() {
    // Highlight active section on scroll
    const sections = document.querySelectorAll('.content-section');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Close mobile TOC
                const sidebar = document.getElementById('tocSidebar');
                sidebar.classList.remove('open');
            }
        });
    });
}

// Update last updated date
function updateLastUpdated() {
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        lastUpdatedEl.textContent = today;
    }
}

// Export functionality
function exportDashboard() {
    // Create export menu
    const exportOptions = confirm('Export as CSV? (OK for CSV, Cancel for Copy to Clipboard)');
    
    if (exportOptions) {
        exportToCSV();
    } else {
        copyTableToClipboard();
    }
}

// Export table data to CSV
function exportToCSV() {
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');
    let csv = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        const rowData = Array.from(cells).map(cell => {
            // Clean cell text
            let text = cell.textContent.trim();
            // Escape quotes and wrap in quotes if contains comma
            if (text.includes(',') || text.includes('"')) {
                text = '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
        });
        csv.push(rowData.join(','));
    });
    
    // Download CSV
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-tools-enterprise-dashboard.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Copy table to clipboard
function copyTableToClipboard() {
    const table = document.getElementById('mainTable');
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        alert('Table copied to clipboard!');
    } catch (err) {
        alert('Failed to copy table');
    }
    
    window.getSelection().removeAllRanges();
}