// Best Practices Hub Scripts

class BestPracticesHub {
    constructor() {
        this.guidesData = null;
        this.searchInput = null;
        this.init();
    }

    async init() {
        await this.loadGuidesData();
        this.setupSearch();
        this.setupCarousel();
        this.setupPathCards();
    }

    async loadGuidesData() {
        try {
            const response = await fetch('data/guides.json');
            this.guidesData = await response.json();
        } catch (error) {
            console.error('Error loading guides data:', error);
        }
    }

    setupSearch() {
        this.searchInput = document.querySelector('.bp-search-input');
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });
    }

    handleSearch(query) {
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.showSearchSuggestions(query);
            } else {
                this.hideSearchSuggestions();
            }
        }, 300);
    }

    showSearchSuggestions(query) {
        if (!this.guidesData) return;

        const suggestions = this.guidesData.guides.filter(guide => 
            guide.title.toLowerCase().includes(query.toLowerCase()) ||
            guide.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            guide.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);

        // Create suggestions dropdown (implement UI update)
        console.log('Search suggestions:', suggestions);
    }

    hideSearchSuggestions() {
        // Hide suggestions dropdown
    }

    performSearch(query) {
        // Navigate to search results or filter current view
        console.log('Performing search for:', query);
    }

    setupCarousel() {
        const carousel = document.querySelector('.bp-gems-carousel');
        if (!carousel) return;

        // Add smooth scrolling
        let isScrolling = false;
        carousel.addEventListener('wheel', (e) => {
            if (!isScrolling) {
                isScrolling = true;
                e.preventDefault();
                carousel.scrollBy({
                    left: e.deltaY > 0 ? 200 : -200,
                    behavior: 'smooth'
                });
                setTimeout(() => { isScrolling = false; }, 500);
            }
        });

        // Add touch support for mobile
        let touchStartX = 0;
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                carousel.scrollBy({
                    left: diff > 0 ? 200 : -200,
                    behavior: 'smooth'
                });
            }
        });
    }

    setupPathCards() {
        const pathCards = document.querySelectorAll('.bp-path-card');
        pathCards.forEach(card => {
            card.addEventListener('click', () => {
                const difficulty = card.classList.contains('beginner') ? 'beginner' :
                                 card.classList.contains('intermediate') ? 'intermediate' : 'advanced';
                this.navigateToPath(difficulty);
            });
        });
    }

    navigateToPath(difficulty) {
        // In a real implementation, this would navigate to a filtered view
        console.log('Navigating to path:', difficulty);
        // window.location.href = `#path=${difficulty}`;
    }

    // Try button handlers
    setupTryButtons() {
        document.querySelectorAll('.bp-try-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const gemCard = e.target.closest('.bp-gem-card');
                const example = gemCard.querySelector('.bp-gem-example').textContent;
                this.showTryModal(example);
            });
        });
    }

    showTryModal(example) {
        // In a real implementation, this would open a modal with the AI tool
        console.log('Opening try modal with example:', example);
        alert('This would open an AI tool interface with the example pre-loaded');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BestPracticesHub();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});