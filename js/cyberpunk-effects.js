// Cyberpunk Effects and Animations
// Particle system and enhanced interactions for the redesigned dashboard

// Particle System Class
class CyberParticles {
    constructor() {
        this.particles = [];
        this.colors = ['#14b8a6', '#10b981', '#22c55e'];
        this.maxParticles = 15; // Limited for performance
        this.container = null;
        this.isEnabled = true;
        this.init();
    }

    init() {
        // Check if particles should be disabled (mobile or performance mode)
        if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            return;
        }

        // Create particle container
        this.container = document.createElement('div');
        this.container.className = 'cyber-particles';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
        
        // Start particle generation
        this.generateParticles();
        setInterval(() => this.generateParticles(), 2000);
    }

    generateParticles() {
        if (!this.isEnabled || !this.container) return;
        
        // Limit particle count for performance
        if (this.container.children.length >= this.maxParticles) return;

        const particle = document.createElement('div');
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 3 + 1;
        const startX = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 100;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${startX}%;
            bottom: -10px;
            opacity: 0;
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: floatUp 8s linear forwards;
            --drift: ${drift}px;
        `;

        this.container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }

    destroy() {
        this.isEnabled = false;
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Enhanced Interactions Class
class CyberInteractions {
    constructor() {
        this.init();
    }

    init() {
        // Enhanced search input effects
        this.enhanceSearchInputs();
        
        // Enhanced card hover effects
        this.enhanceCards();
        
        // Enhanced button effects
        this.enhanceButtons();
        
        // Add title shimmer effect
        this.addTitleShimmer();
    }

    enhanceSearchInputs() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        searchInputs.forEach(input => {
            // Focus glow effect
            input.addEventListener('focus', function() {
                this.style.transition = 'all 0.3s ease';
                this.style.boxShadow = '0 0 30px rgba(20, 184, 166, 0.6), inset 0 0 10px rgba(20, 184, 166, 0.1)';
            });
            
            input.addEventListener('blur', function() {
                this.style.boxShadow = '';
            });

            // Typing effect
            let typingTimer;
            input.addEventListener('input', function() {
                clearTimeout(typingTimer);
                this.style.boxShadow = '0 0 35px rgba(20, 184, 166, 0.8), inset 0 0 15px rgba(20, 184, 166, 0.2)';
                typingTimer = setTimeout(() => {
                    this.style.boxShadow = '0 0 30px rgba(20, 184, 166, 0.6), inset 0 0 10px rgba(20, 184, 166, 0.1)';
                }, 100);
            });
        });
    }

    enhanceCards() {
        const cards = document.querySelectorAll('.tool-card, .card, .item-card, .feature-card');
        cards.forEach(card => {
            // Add data attributes for enhanced hover
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            card.addEventListener('mouseenter', function(e) {
                // Calculate mouse position for directional effects
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Add dynamic shadow based on mouse position
                const shadowX = (x - rect.width / 2) / 10;
                const shadowY = (y - rect.height / 2) / 10;
                
                this.style.boxShadow = `
                    ${shadowX}px ${shadowY}px 40px rgba(13, 148, 136, 0.3),
                    0 0 40px rgba(20, 184, 166, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
            });

            // Click ripple effect
            card.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(20, 184, 166, 0.3);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn, .nav-button');
        buttons.forEach(button => {
            // Pulse effect on hover
            button.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse 1s infinite';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.animation = '';
            });

            // Click effect
            button.addEventListener('click', function(e) {
                // Create ripple
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(20, 184, 166, 0.5);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: ripple 0.4s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 400);
            });
        });
    }

    addTitleShimmer() {
        const titles = document.querySelectorAll('.logo-text, h1, .dashboard-title');
        titles.forEach(title => {
            if (!title.classList.contains('shimmer-text')) {
                title.classList.add('shimmer-text');
                title.style.background = 'linear-gradient(90deg, #14b8a6, #22c55e, #14b8a6)';
                title.style.backgroundSize = '200% 100%';
                title.style.backgroundClip = 'text';
                title.style.webkitBackgroundClip = 'text';
                title.style.webkitTextFillColor = 'transparent';
                title.style.animation = 'shimmer 3s linear infinite';
            }
        });
    }
}

// CSS Animations (inject into page)
function injectAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-100vh) translateX(var(--drift, 0)) rotate(180deg);
                opacity: 0;
            }
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @keyframes shimmer {
            0% {
                background-position: 0% 50%;
            }
            100% {
                background-position: 200% 50%;
            }
        }

        /* Performance optimization for mobile */
        @media (max-width: 768px) {
            .cyber-particles {
                display: none !important;
            }
            
            * {
                animation-duration: 0s !important;
                transition-duration: 0.2s !important;
            }
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
            .cyber-particles {
                display: none !important;
            }
            
            * {
                animation: none !important;
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Inject CSS animations
    injectAnimations();
    
    // Initialize particle system
    const particles = new CyberParticles();
    
    // Initialize enhanced interactions
    const interactions = new CyberInteractions();
    
    // Performance monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // Disable effects if FPS drops below 30
            if (fps < 30 && particles.isEnabled) {
                console.log('Performance issue detected, disabling particles');
                particles.destroy();
            }
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    // Start performance monitoring
    requestAnimationFrame(checkPerformance);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        particles.destroy();
    });
});

// Export for use in other scripts if needed
window.CyberEffects = {
    CyberParticles,
    CyberInteractions
};