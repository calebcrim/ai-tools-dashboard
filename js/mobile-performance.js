/**
 * Mobile Performance Optimizations
 * Lazy loading, intersection observer, and mobile-specific performance enhancements
 */

class MobilePerformance {
    constructor() {
        this.imageObserver = null;
        this.cardObserver = null;
        this.isLowEndDevice = this.detectLowEndDevice();
        this.init();
    }
    
    init() {
        // Set up intersection observers
        this.setupImageLazyLoading();
        this.setupCardLazyLoading();
        
        // Optimize animations for low-end devices
        this.optimizeAnimations();
        
        // Set up touch event optimizations
        this.optimizeTouchEvents();
        
        // Monitor performance
        this.monitorPerformance();
    }
    
    detectLowEndDevice() {
        // Check various indicators of a low-end device
        const checks = {
            // Low memory (less than 4GB)
            lowMemory: navigator.deviceMemory && navigator.deviceMemory < 4,
            // Slow connection
            slowConnection: navigator.connection && 
                           (navigator.connection.effectiveType === 'slow-2g' || 
                            navigator.connection.effectiveType === '2g' ||
                            navigator.connection.effectiveType === '3g'),
            // High device pixel ratio but small screen (budget phones)
            budgetPhone: window.devicePixelRatio > 2 && window.screen.width < 400,
            // Low hardware concurrency
            lowCores: navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
        };
        
        // If any two conditions are met, consider it low-end
        const checkResults = Object.values(checks).filter(check => check);
        return checkResults.length >= 2;
    }
    
    setupImageLazyLoading() {
        // Skip if native lazy loading is supported
        if ('loading' in HTMLImageElement.prototype) {
            // Add loading="lazy" to all images
            document.querySelectorAll('img:not([loading])').forEach(img => {
                img.loading = 'lazy';
            });
            return;
        }
        
        // Fallback intersection observer for older browsers
        const imageObserverOptions = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, imageObserverOptions);
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }
    
    setupCardLazyLoading() {
        const cardObserverOptions = {
            rootMargin: '100px 0px',
            threshold: 0.1
        };
        
        this.cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    
                    // Add visible class for animation
                    card.classList.add('card-visible');
                    
                    // Load any lazy content within the card
                    this.loadCardContent(card);
                    
                    // Stop observing once loaded
                    this.cardObserver.unobserve(card);
                }
            });
        }, cardObserverOptions);
        
        // Observe all tool cards
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            // Add stagger delay for smooth appearance
            card.style.transitionDelay = `${index * 50}ms`;
            this.cardObserver.observe(card);
        });
    }
    
    loadCardContent(card) {
        // Load any images in the card
        card.querySelectorAll('img[data-src]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
        
        // Load any iframes (for embedded content)
        card.querySelectorAll('iframe[data-src]').forEach(iframe => {
            if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
            }
        });
    }
    
    optimizeAnimations() {
        if (this.isLowEndDevice) {
            // Add class to body for CSS to target
            document.body.classList.add('reduce-motion');
            
            // Reduce animation durations via CSS custom property
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.style.setProperty('--transition-duration', '0.1s');
        }
        
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('prefers-reduced-motion');
        }
    }
    
    optimizeTouchEvents() {
        // Add passive event listeners for better scroll performance
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            passiveSupported = false;
        }
        
        const passiveOption = passiveSupported ? { passive: true } : false;
        
        // Make scroll events passive
        document.addEventListener('touchstart', this.handleTouchStart, passiveOption);
        document.addEventListener('touchmove', this.handleTouchMove, passiveOption);
        
        // Optimize click delay on mobile
        this.eliminateClickDelay();
    }
    
    eliminateClickDelay() {
        // FastClick alternative for modern browsers
        let touchStartTime;
        let touchStartX;
        let touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Check if it's a tap (not a swipe or long press)
            const timeDiff = touchEndTime - touchStartTime;
            const distX = Math.abs(touchEndX - touchStartX);
            const distY = Math.abs(touchEndY - touchStartY);
            
            if (timeDiff < 200 && distX < 10 && distY < 10) {
                e.preventDefault();
                
                // Trigger click immediately
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: touchEndX,
                    clientY: touchEndY
                });
                e.target.dispatchEvent(clickEvent);
            }
        });
    }
    
    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            // Monitor long tasks
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Log tasks that block the main thread for more than 50ms
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry);
                            
                            // Could send to analytics
                            if (window.gtag) {
                                window.gtag('event', 'performance', {
                                    event_category: 'Long Task',
                                    event_label: entry.name,
                                    value: Math.round(entry.duration)
                                });
                            }
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task observer not supported
            }
        }
        
        // Monitor FPS on mobile
        this.monitorFPS();
    }
    
    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                // If FPS drops below 30, reduce animations
                if (fps < 30 && !document.body.classList.contains('reduce-motion')) {
                    console.warn('Low FPS detected:', fps);
                    document.body.classList.add('reduce-motion');
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        // Only monitor during interactions
        let isMonitoring = false;
        ['touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                if (!isMonitoring) {
                    isMonitoring = true;
                    measureFPS();
                    
                    // Stop monitoring after 5 seconds of no interaction
                    setTimeout(() => {
                        isMonitoring = false;
                    }, 5000);
                }
            });
        });
    }
    
    // Utility methods
    prefetchLinks() {
        // Prefetch links on hover/touch for faster navigation
        const prefetchLink = (url) => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        };
        
        document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
            let prefetched = false;
            
            const handlePrefetch = () => {
                if (!prefetched) {
                    prefetched = true;
                    prefetchLink(link.href);
                }
            };
            
            // Prefetch on hover (desktop) or touchstart (mobile)
            link.addEventListener('mouseenter', handlePrefetch);
            link.addEventListener('touchstart', handlePrefetch, { passive: true });
        });
    }
    
    // Clean up observers
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.cardObserver) {
            this.cardObserver.disconnect();
        }
    }
}

// Add loading skeletons CSS
const skeletonStyles = `
    .skeleton-card {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
        height: 200px;
        margin-bottom: 1rem;
    }
    
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    .card-visible {
        animation: fadeInUp 0.4s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .reduce-motion * {
        animation-duration: 0.01s !important;
        transition-duration: 0.01s !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01s !important;
            transition-duration: 0.01s !important;
        }
    }
`;

// Add skeleton styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = skeletonStyles;
document.head.appendChild(styleSheet);

// Initialize performance optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobilePerformance = new MobilePerformance();
    });
} else {
    window.mobilePerformance = new MobilePerformance();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePerformance;
}