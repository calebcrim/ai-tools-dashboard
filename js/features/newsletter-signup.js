// newsletter-signup.js
// Newsletter signup with exit intent popup and lead magnet

class NewsletterSignup {
    constructor() {
        this.hasShownExitIntent = false;
        this.signupFormShown = false;
        this.cookieExpiry = 30; // days
        this.initializeNewsletterFeatures();
    }

    initializeNewsletterFeatures() {
        // Check if user has already signed up or dismissed
        if (this.hasUserSignedUp() || this.hasUserDismissed()) {
            return;
        }

        // Add newsletter form to page
        this.addNewsletterSection();
        
        // Set up exit intent
        this.setupExitIntent();
        
        // Add styles
        this.addStyles();
    }

    // Check if user has already signed up
    hasUserSignedUp() {
        return localStorage.getItem('newsletter_signed_up') === 'true';
    }

    // Check if user has dismissed the popup recently
    hasUserDismissed() {
        const dismissedDate = localStorage.getItem('newsletter_dismissed_date');
        if (!dismissedDate) return false;
        
        const daysSinceDismissed = (new Date() - new Date(dismissedDate)) / (1000 * 60 * 60 * 24);
        return daysSinceDismissed < this.cookieExpiry;
    }

    // Add newsletter section to page
    addNewsletterSection() {
        const newsletterHTML = `
            <div class="newsletter-section" id="newsletterSection">
                <div class="newsletter-container">
                    <div class="newsletter-content">
                        <h3>🚀 Stay Ahead with AI Intelligence</h3>
                        <p>Get weekly insights on the latest AI tools, exclusive comparisons, and expert tips delivered to your inbox.</p>
                        <div class="newsletter-incentive">
                            <i class="fas fa-gift"></i>
                            <span>FREE BONUS: Download our "2025 AI Tools Selection Guide" (47-page PDF)</span>
                        </div>
                        <form class="newsletter-form" id="newsletterForm" name="newsletter-signup" method="POST" action="/" netlify>
                            <input type="hidden" name="form-name" value="newsletter-signup">
                            <div class="form-group">
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter your email address" 
                                    required 
                                    class="newsletter-input"
                                    id="newsletterEmail"
                                >
                                <button type="submit" class="newsletter-btn">
                                    Get Free Guide
                                </button>
                            </div>
                            <div class="newsletter-privacy">
                                <input type="checkbox" id="privacyConsent" name="privacy_consent" required>
                                <label for="privacyConsent">
                                    I agree to receive emails and accept the <a href="/privacy" target="_blank">privacy policy</a>
                                </label>
                            </div>
                        </form>
                        <div class="newsletter-success" id="newsletterSuccess" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <h4>Success! Check your email for the download link.</h4>
                            <p>You're now subscribed to AI Intelligence Weekly.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Find a good spot to insert the newsletter section
        const mainContainer = document.querySelector('.main-container, .content-wrapper, main');
        if (mainContainer) {
            const div = document.createElement('div');
            div.innerHTML = newsletterHTML;
            mainContainer.appendChild(div.firstElementChild);
        }

        // Set up form submission
        this.setupFormSubmission();
    }

    // Set up exit intent popup
    setupExitIntent() {
        const exitIntentHTML = `
            <div class="exit-intent-overlay" id="exitIntentOverlay" style="display: none;">
                <div class="exit-intent-popup">
                    <button class="exit-intent-close" id="exitIntentClose">×</button>
                    <div class="exit-intent-content">
                        <h2>Wait! Don't Leave Empty-Handed 🎁</h2>
                        <p class="exit-intent-subtitle">Get our exclusive AI Tools Selection Guide before you go!</p>
                        
                        <div class="exit-intent-benefits">
                            <div class="benefit-item">
                                <i class="fas fa-check"></i>
                                <span>Compare 317+ AI tools side-by-side</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-check"></i>
                                <span>ROI calculator for each tool category</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-check"></i>
                                <span>Expert selection criteria & frameworks</span>
                            </div>
                        </div>
                        
                        <form class="exit-intent-form" id="exitIntentForm" name="exit-intent-signup" method="POST" action="/" netlify>
                            <input type="hidden" name="form-name" value="exit-intent-signup">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Enter your email for instant access" 
                                required 
                                class="exit-intent-input"
                                id="exitIntentEmail"
                            >
                            <button type="submit" class="exit-intent-btn">
                                Send Me The Free Guide
                            </button>
                            <p class="exit-intent-privacy">
                                No spam, unsubscribe anytime. 
                                <label>
                                    <input type="checkbox" name="privacy_consent" required>
                                    I accept the <a href="/privacy" target="_blank">privacy policy</a>
                                </label>
                            </p>
                        </form>
                        
                        <div class="exit-intent-success" id="exitIntentSuccess" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <h3>Success! Guide sent to your email.</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', exitIntentHTML);

        // Set up exit intent triggers
        this.setupExitIntentTriggers();
        
        // Set up form submission for exit intent
        this.setupExitIntentForm();
    }

    // Set up exit intent triggers
    setupExitIntentTriggers() {
        // Mouse leave trigger
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !this.hasShownExitIntent && !this.hasUserSignedUp()) {
                this.showExitIntent();
            }
        });

        // Time-based trigger (30 seconds)
        setTimeout(() => {
            if (!this.hasShownExitIntent && !this.hasUserSignedUp()) {
                this.showExitIntent();
            }
        }, 30000);

        // Scroll trigger (70% of page)
        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            if (scrollTriggered) return;
            
            const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPercentage > 0.7 && !this.hasShownExitIntent && !this.hasUserSignedUp()) {
                scrollTriggered = true;
                this.showExitIntent();
            }
        });

        // Close button
        document.getElementById('exitIntentClose').addEventListener('click', () => {
            this.hideExitIntent();
            localStorage.setItem('newsletter_dismissed_date', new Date().toISOString());
        });

        // Click outside to close
        document.getElementById('exitIntentOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'exitIntentOverlay') {
                this.hideExitIntent();
                localStorage.setItem('newsletter_dismissed_date', new Date().toISOString());
            }
        });
    }

    // Show exit intent popup
    showExitIntent() {
        if (this.hasShownExitIntent) return;
        
        this.hasShownExitIntent = true;
        const overlay = document.getElementById('exitIntentOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            
            // Track popup shown
            if (window.gtag) {
                gtag('event', 'newsletter_popup_shown', {
                    event_category: 'engagement',
                    event_label: 'exit_intent'
                });
            }
        }
    }

    // Hide exit intent popup
    hideExitIntent() {
        const overlay = document.getElementById('exitIntentOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Set up form submission
    setupFormSubmission() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value;
            const privacyConsent = document.getElementById('privacyConsent').checked;

            if (!privacyConsent) {
                alert('Please accept the privacy policy to continue.');
                return;
            }

            // Submit to Netlify Forms
            try {
                const formData = new FormData(form);
                
                // Ensure form-name is included
                formData.set('form-name', 'newsletter-signup');
                
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    // Show success message
                    form.style.display = 'none';
                    document.getElementById('newsletterSuccess').style.display = 'block';
                    
                    // Mark as signed up
                    localStorage.setItem('newsletter_signed_up', 'true');
                    localStorage.setItem('newsletter_email', email);
                    
                    // Track signup
                    if (window.gtag) {
                        gtag('event', 'newsletter_signup', {
                            event_category: 'engagement',
                            event_label: 'inline_form',
                            value: 1
                        });
                    }

                    // Send download link (in real implementation, this would be handled by Netlify Functions)
                    this.sendDownloadLink(email);
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was an error submitting the form. Please try again or contact support.');
            }
        });
    }

    // Set up exit intent form submission
    setupExitIntentForm() {
        const form = document.getElementById('exitIntentForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('exitIntentEmail').value;
            const privacyCheckbox = form.querySelector('input[name="privacy_consent"]');
            const privacyConsent = privacyCheckbox ? privacyCheckbox.checked : false;

            if (!privacyConsent) {
                alert('Please accept the privacy policy to continue.');
                return;
            }

            // Submit to Netlify Forms
            try {
                const formData = new FormData(form);
                
                // Ensure form-name is included
                formData.set('form-name', 'exit-intent-signup');
                
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    // Show success message
                    form.style.display = 'none';
                    document.getElementById('exitIntentSuccess').style.display = 'block';
                    
                    // Mark as signed up
                    localStorage.setItem('newsletter_signed_up', 'true');
                    localStorage.setItem('newsletter_email', email);
                    
                    // Track signup
                    if (window.gtag) {
                        gtag('event', 'newsletter_signup', {
                            event_category: 'engagement',
                            event_label: 'exit_intent',
                            value: 1
                        });
                    }

                    // Hide popup after 3 seconds
                    setTimeout(() => this.hideExitIntent(), 3000);

                    // Send download link
                    this.sendDownloadLink(email);
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was an error submitting the form. Please try again or contact support.');
            }
        });
    }

    // Simulate sending download link (in production, use Netlify Functions)
    sendDownloadLink(email) {
        console.log(`Download link would be sent to: ${email}`);
        // In production, this would trigger a Netlify Function to send the email
    }

    // Add CSS styles
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Newsletter Section Styles */
            .newsletter-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 3rem 1rem;
                margin: 3rem 0;
                border-radius: 12px;
                color: white;
            }

            .newsletter-container {
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
            }

            .newsletter-content h3 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }

            .newsletter-content p {
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
                opacity: 0.95;
            }

            .newsletter-incentive {
                background: rgba(255, 255, 255, 0.2);
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .newsletter-incentive i {
                font-size: 1.5rem;
            }

            .newsletter-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .form-group {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                justify-content: center;
            }

            .newsletter-input {
                flex: 1;
                min-width: 250px;
                padding: 1rem;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
            }

            .newsletter-btn {
                padding: 1rem 2rem;
                background: #48bb78;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .newsletter-btn:hover {
                background: #38a169;
                transform: translateY(-2px);
            }

            .newsletter-privacy {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .newsletter-privacy a {
                color: white;
                text-decoration: underline;
            }

            .newsletter-success {
                text-align: center;
                padding: 2rem;
            }

            .newsletter-success i {
                font-size: 3rem;
                color: #48bb78;
                margin-bottom: 1rem;
            }

            /* Exit Intent Popup Styles */
            .exit-intent-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .exit-intent-popup {
                background: white;
                border-radius: 12px;
                padding: 3rem;
                max-width: 500px;
                width: 90%;
                position: relative;
                animation: slideIn 0.3s;
            }

            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .exit-intent-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #999;
            }

            .exit-intent-close:hover {
                color: #333;
            }

            .exit-intent-content h2 {
                margin-bottom: 0.5rem;
                color: #333;
            }

            .exit-intent-subtitle {
                font-size: 1.1rem;
                color: #666;
                margin-bottom: 1.5rem;
            }

            .exit-intent-benefits {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
            }

            .benefit-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                color: #333;
            }

            .benefit-item i {
                color: #48bb78;
            }

            .exit-intent-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .exit-intent-input {
                padding: 1rem;
                border: 2px solid #e0e0e0;
                border-radius: 6px;
                font-size: 1rem;
            }

            .exit-intent-input:focus {
                outline: none;
                border-color: #667eea;
            }

            .exit-intent-btn {
                padding: 1rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .exit-intent-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }

            .exit-intent-privacy {
                font-size: 0.875rem;
                color: #666;
                text-align: center;
            }

            .exit-intent-privacy a {
                color: #667eea;
            }

            .exit-intent-success {
                text-align: center;
                padding: 2rem;
            }

            .exit-intent-success i {
                font-size: 3rem;
                color: #48bb78;
                margin-bottom: 1rem;
                display: block;
            }

            @media (max-width: 768px) {
                .newsletter-section {
                    padding: 2rem 1rem;
                }

                .form-group {
                    flex-direction: column;
                }

                .newsletter-input {
                    min-width: auto;
                }

                .exit-intent-popup {
                    padding: 2rem 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize newsletter signup
const newsletterSignup = new NewsletterSignup();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterSignup;
}