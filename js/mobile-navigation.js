/**
 * Mobile Navigation JavaScript
 * Handles hamburger menu, mobile interactions, and navigation state
 */

class MobileNavigation {
    constructor() {
        this.menuBtn = null;
        this.menuOverlay = null;
        this.mobileMenu = null;
        this.closeBtn = null;
        this.menuLinks = null;
        this.bottomTabs = null;
        this.isMenuOpen = false;
        this.currentPage = this.getCurrentPage();
        
        this.init();
    }
    
    init() {
        // Create mobile navigation elements
        this.createMobileElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set active states
        this.setActiveStates();
        
        // Handle viewport changes
        this.handleViewportChanges();
    }
    
    createMobileElements() {
        // Create hamburger button
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'mobile-menu-btn';
        hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
        hamburgerBtn.setAttribute('aria-label', 'Open menu');
        
        // Insert hamburger button at the beginning of header
        const headerContent = document.querySelector('.header-content');
        const headerTopRow = document.querySelector('.header-top-row');
        if (headerTopRow) {
            headerTopRow.insertBefore(hamburgerBtn, headerTopRow.firstChild);
        }
        
        // Create mobile menu overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        
        // Create mobile menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-header">
                <h2 class="mobile-menu-title">Menu</h2>
                <button class="mobile-menu-close" aria-label="Close menu">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="mobile-search-container">
                <div style="position: relative;">
                    <i class="fas fa-search mobile-search-icon"></i>
                    <input type="text" 
                           class="mobile-search-input" 
                           placeholder="Search tools..."
                           id="mobileSearchInput">
                </div>
            </div>
            
            <nav class="mobile-menu-nav">
                <a href="index.html" class="nav-link" data-page="dashboard">
                    <i class="fas fa-th-large"></i>
                    <span>Dashboard</span>
                </a>
                <a href="dual-view-enhanced.html" class="nav-link" data-page="dual-view">
                    <i class="fas fa-columns"></i>
                    <span>Dual View</span>
                </a>
                <a href="enterprise-report.html" class="nav-link" data-page="enterprise">
                    <i class="fas fa-building"></i>
                    <span>Enterprise Report</span>
                </a>
                <a href="financial-analysis/index.html" class="nav-link" data-page="financial">
                    <i class="fas fa-chart-line"></i>
                    <span>Financial Analysis</span>
                </a>
                <a href="best-practices.html" class="nav-link" data-page="best-practices">
                    <i class="fas fa-lightbulb"></i>
                    <span>Best Practices</span>
                </a>
            </nav>
            
            <div class="mobile-menu-actions">
                <button class="mobile-action-btn" onclick="window.mobileNav.openFilters()">
                    <i class="fas fa-filter"></i>
                    <span>Filters</span>
                </button>
                <button class="mobile-action-btn secondary" onclick="window.mobileNav.openExport()">
                    <i class="fas fa-download"></i>
                    <span>Export</span>
                </button>
            </div>
        `;
        
        // Create bottom tab bar
        const bottomBar = document.createElement('nav');
        bottomBar.className = 'mobile-bottom-bar';
        bottomBar.innerHTML = `
            <a href="index.html" class="bottom-tab" data-page="dashboard">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="dual-view-enhanced.html" class="bottom-tab" data-page="dual-view">
                <i class="fas fa-columns"></i>
                <span>Dual</span>
            </a>
            <a href="enterprise-report.html" class="bottom-tab" data-page="enterprise">
                <i class="fas fa-building"></i>
                <span>Enterprise</span>
            </a>
            <a href="financial-analysis/index.html" class="bottom-tab" data-page="financial">
                <i class="fas fa-chart-line"></i>
                <span>Financial</span>
            </a>
        `;
        
        // Create filter FAB (for pages with filters)
        const filterFab = document.createElement('button');
        filterFab.className = 'mobile-filter-fab';
        filterFab.innerHTML = '<i class="fas fa-filter"></i>';
        filterFab.setAttribute('aria-label', 'Open filters');
        
        // Append elements to body
        document.body.appendChild(overlay);
        document.body.appendChild(mobileMenu);
        document.body.appendChild(bottomBar);
        
        // Only add filter FAB on pages that have filters
        if (this.currentPage === 'dashboard' || this.currentPage === 'enterprise') {
            document.body.appendChild(filterFab);
        }
        
        // Store references
        this.menuBtn = hamburgerBtn;
        this.menuOverlay = overlay;
        this.mobileMenu = mobileMenu;
        this.closeBtn = mobileMenu.querySelector('.mobile-menu-close');
        this.menuLinks = mobileMenu.querySelectorAll('.nav-link');
        this.bottomTabs = bottomBar.querySelectorAll('.bottom-tab');
        this.filterFab = filterFab;
    }
    
    setupEventListeners() {
        // Hamburger menu toggle
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeMenu());
        }
        
        // Overlay click
        if (this.menuOverlay) {
            this.menuOverlay.addEventListener('click', () => this.closeMenu());
        }
        
        // Menu links
        this.menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
        
        // Filter FAB
        if (this.filterFab) {
            this.filterFab.addEventListener('click', () => this.openFilters());
        }
        
        // Mobile search input
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                // Trigger same search as desktop
                const event = new CustomEvent('mobileSearch', { 
                    detail: { query: e.target.value } 
                });
                window.dispatchEvent(event);
            });
        }
        
        // Handle swipe gestures
        this.setupSwipeGestures();
        
        // Handle resize events
        window.addEventListener('resize', () => this.handleViewportChanges());
        
        // Handle back button
        window.addEventListener('popstate', () => {
            if (this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Swipe from left edge to open menu
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const edgeThreshold = 20;
            
            // Swipe right from left edge - open menu
            if (touchStartX < edgeThreshold && touchEndX > touchStartX + swipeThreshold) {
                this.openMenu();
            }
            
            // Swipe left on open menu - close menu
            if (this.isMenuOpen && touchStartX > touchEndX + swipeThreshold) {
                this.closeMenu();
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.isMenuOpen = true;
        this.mobileMenu.classList.add('active');
        this.menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update button
        this.menuBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        // Add to history for back button support
        history.pushState({ menuOpen: true }, '');
    }
    
    closeMenu() {
        this.isMenuOpen = false;
        this.mobileMenu.classList.remove('active');
        this.menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Update button
        this.menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    setActiveStates() {
        // Set active menu link
        this.menuLinks.forEach(link => {
            if (link.getAttribute('data-page') === this.currentPage) {
                link.classList.add('active');
            }
        });
        
        // Set active bottom tab
        this.bottomTabs.forEach(tab => {
            if (tab.getAttribute('data-page') === this.currentPage) {
                tab.classList.add('active');
            }
        });
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('dual-view')) return 'dual-view';
        if (path.includes('enterprise-report')) return 'enterprise';
        if (path.includes('financial-analysis')) return 'financial';
        if (path.includes('best-practices')) return 'best-practices';
        
        return 'dashboard';
    }
    
    handleViewportChanges() {
        // Close menu if viewport becomes desktop size
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
        
        // Adjust for orientation changes
        this.adjustForOrientation();
    }
    
    adjustForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape && window.innerWidth <= 768) {
            document.body.classList.add('mobile-landscape');
        } else {
            document.body.classList.remove('mobile-landscape');
        }
    }
    
    openFilters() {
        // Trigger filter panel opening
        const event = new CustomEvent('openMobileFilters');
        window.dispatchEvent(event);
        
        // For now, toggle advanced filters if they exist
        if (typeof toggleAdvancedFilters === 'function') {
            toggleAdvancedFilters();
        }
    }
    
    openExport() {
        // Trigger export modal
        if (typeof openExportModal === 'function') {
            openExportModal();
        }
    }
    
    updateFilterCount(count) {
        // Update filter FAB badge
        if (this.filterFab) {
            let badge = this.filterFab.querySelector('.filter-count-badge');
            
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'filter-count-badge';
                    this.filterFab.appendChild(badge);
                }
                badge.textContent = count;
                this.filterFab.classList.add('has-filters');
            } else {
                if (badge) badge.remove();
                this.filterFab.classList.remove('has-filters');
            }
        }
    }
}

// Initialize mobile navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNavigation();
    
    // Listen for filter changes
    window.addEventListener('filtersChanged', (e) => {
        if (window.mobileNav && e.detail) {
            window.mobileNav.updateFilterCount(e.detail.count || 0);
        }
    });
    
    // Connect mobile search to main search functionality
    window.addEventListener('mobileSearch', (e) => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput && e.detail) {
            searchInput.value = e.detail.query;
            searchInput.dispatchEvent(new Event('input'));
        }
    });
});