// Navigation JavaScript for Best Practices Hub Index Page

document.addEventListener('DOMContentLoaded', function() {
    // Learning Path Cards Navigation
    const pathCards = document.querySelectorAll('.bp-path-card');
    pathCards.forEach(card => {
        // Make the entire card clickable
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on stat elements
            if (e.target.closest('.bp-path-stats')) {
                return;
            }
            
            const title = this.querySelector('.bp-path-title').textContent;
            const pathMap = {
                'AI Fundamentals': 'learning-paths/ai-fundamentals.html',
                'Advanced Techniques': 'learning-paths/advanced-techniques.html',
                'Industry Specialization': 'learning-paths/industry-specialization.html'
            };
            
            const path = pathMap[title];
            if (path) {
                window.location.href = path;
            }
        });
    });

    // Featured Guide Cards - Already working but let's ensure consistency
    const guideCards = document.querySelectorAll('.bp-guide-card');
    guideCards.forEach(card => {
        // These already have href attributes, so they work
        // But we can add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Hidden Gems & Pro Tips Cards
    const tipsCards = document.querySelectorAll('.bp-tips-card');
    const tipData = [
        {
            title: 'Context Windows Matter',
            file: 'tips/context-windows-matter.html',
            buttonClass: 'bp-tips-button-primary'
        },
        {
            title: 'The Power of Examples',
            file: 'tips/power-of-examples.html',
            buttonClass: 'bp-tips-button-secondary'
        },
        {
            title: 'Role-Based Prompting',
            file: 'tips/role-based-prompting.html',
            buttonClass: 'bp-tips-button-tertiary'
        }
    ];
    
    tipsCards.forEach((card, index) => {
        if (tipData[index]) {
            // Store the file path in a data attribute
            card.dataset.tipFile = tipData[index].file;
            
            // Find the button within the card
            const button = card.querySelector('.bp-tips-button');
            if (button) {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent card click if we add that later
                    const file = card.dataset.tipFile;
                    if (file) {
                        window.location.href = file;
                    }
                });
            }
        }
    });

    // Add visual feedback for all interactive elements
    const allClickableCards = document.querySelectorAll('.bp-path-card, .bp-tips-card');
    allClickableCards.forEach(card => {
        card.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Progress tracking (if you want to show completion status)
    function updateProgressIndicators() {
        // Check localStorage for completed guides
        const completedGuides = JSON.parse(localStorage.getItem('completedGuides') || '[]');
        
        // Update visual indicators
        completedGuides.forEach(guideId => {
            const card = document.querySelector(`[data-guide-id="${guideId}"]`);
            if (card) {
                card.classList.add('completed');
                // Could add a checkmark icon
                const checkmark = document.createElement('i');
                checkmark.className = 'fas fa-check-circle completion-icon';
                card.appendChild(checkmark);
            }
        });
    }

    // Call on page load
    updateProgressIndicators();

    // Search functionality for the hub
    const searchInput = document.querySelector('.bp-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            // Filter all cards based on search
            const allCards = document.querySelectorAll('.bp-guide-card, .bp-path-card, .bp-tips-card');
            allCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm) || searchTerm === '') {
                    card.style.display = '';
                    card.style.opacity = '1';
                } else {
                    card.style.opacity = '0.3';
                }
            });
        });
    }

    // Analytics tracking (optional)
    function trackCardClick(cardType, cardTitle) {
        // Send to your analytics platform
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'Best Practices Hub',
                'event_label': cardType,
                'value': cardTitle
            });
        }
    }

    // Add tracking to all navigation
    document.querySelectorAll('[data-track]').forEach(element => {
        element.addEventListener('click', function() {
            const trackData = this.dataset.track.split(':');
            trackCardClick(trackData[0], trackData[1]);
        });
    });
});

// Utility function to mark a guide as completed
function markGuideCompleted(guideId) {
    const completedGuides = JSON.parse(localStorage.getItem('completedGuides') || '[]');
    if (!completedGuides.includes(guideId)) {
        completedGuides.push(guideId);
        localStorage.setItem('completedGuides', JSON.stringify(completedGuides));
    }
}

// Export for use in individual guide pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { markGuideCompleted };
}