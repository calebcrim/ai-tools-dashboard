/**
 * Navigation Dropdown Functionality
 * Handles the Popular Searches dropdown menu
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown functionality
    function initializeDropdown() {
        const dropdownTrigger = document.querySelector('.dropdown-trigger');
        const navDropdown = document.querySelector('.nav-dropdown');
        
        if (!dropdownTrigger || !navDropdown) return;
        
        // Click handler for dropdown
        dropdownTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            navDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!navDropdown.contains(e.target)) {
                navDropdown.classList.remove('active');
            }
        });
        
        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                navDropdown.classList.remove('active');
            }
        });
        
        // Handle dropdown item clicks
        const dropdownLinks = navDropdown.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                navDropdown.classList.remove('active');
            });
        });
    }
    
    // Initialize on page load
    initializeDropdown();
});