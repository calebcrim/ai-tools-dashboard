// privacy-compliance.js
// Privacy-compliant analytics for crimintel.ai

class PrivacyCompliantAnalytics {
  constructor() {
    this.consentGiven = this.checkConsent();
    this.consentTypes = {
      analytics: false,
      functional: true,
      marketing: false
    };
    
    // Check for consent on init
    this.loadConsentPreferences();
  }

  checkConsent() {
    return localStorage.getItem('analytics_consent') === 'true';
  }

  loadConsentPreferences() {
    const stored = localStorage.getItem('consent_preferences');
    if (stored) {
      try {
        this.consentTypes = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading consent preferences:', e);
      }
    }
  }

  saveConsentPreferences() {
    localStorage.setItem('consent_preferences', JSON.stringify(this.consentTypes));
  }

  showConsentBanner() {
    // Check if banner was already shown
    if (localStorage.getItem('consent_banner_shown')) {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    
    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-header">
          <h3>🍪 We value your privacy</h3>
          <button class="consent-close" aria-label="Close consent banner">×</button>
        </div>
        
        <div class="consent-body">
          <p>We use cookies to improve your experience and analyze site usage. No personal data is collected without your consent.</p>
          
          <div class="consent-options">
            <label class="consent-option">
              <input type="checkbox" id="consent-functional" checked disabled>
              <span class="consent-option-label">
                <strong>Essential</strong>
                <small>Required for site functionality</small>
              </span>
            </label>
            
            <label class="consent-option">
              <input type="checkbox" id="consent-analytics">
              <span class="consent-option-label">
                <strong>Analytics</strong>
                <small>Help us improve by understanding usage</small>
              </span>
            </label>
            
            <label class="consent-option">
              <input type="checkbox" id="consent-marketing">
              <span class="consent-option-label">
                <strong>Marketing</strong>
                <small>Show relevant content and offers</small>
              </span>
            </label>
          </div>
        </div>
        
        <div class="consent-actions">
          <button class="consent-button consent-accept-all">Accept All</button>
          <button class="consent-button consent-accept-selected">Accept Selected</button>
          <button class="consent-button consent-reject">Reject All</button>
          <a href="/privacy" class="consent-link">Privacy Policy</a>
        </div>
      </div>
    `;
    
    // Add styles
    this.addConsentStyles();
    
    document.body.appendChild(banner);
    
    // Focus management for accessibility
    const firstButton = banner.querySelector('.consent-accept-all');
    firstButton.focus();
    
    // Event listeners
    banner.querySelector('.consent-close').addEventListener('click', () => {
      this.hideConsentBanner(banner);
    });
    
    banner.querySelector('.consent-accept-all').addEventListener('click', () => {
      this.acceptAll();
      this.hideConsentBanner(banner);
    });
    
    banner.querySelector('.consent-accept-selected').addEventListener('click', () => {
      this.acceptSelected(banner);
      this.hideConsentBanner(banner);
    });
    
    banner.querySelector('.consent-reject').addEventListener('click', () => {
      this.rejectAll();
      this.hideConsentBanner(banner);
    });
    
    // Mark banner as shown
    localStorage.setItem('consent_banner_shown', 'true');
  }

  hideConsentBanner(banner) {
    banner.classList.add('consent-banner-hiding');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }

  acceptAll() {
    this.consentTypes = {
      analytics: true,
      functional: true,
      marketing: true
    };
    this.saveConsentPreferences();
    this.setConsent(true);
    this.applyConsentSettings();
  }

  acceptSelected(banner) {
    this.consentTypes = {
      analytics: banner.querySelector('#consent-analytics').checked,
      functional: true,
      marketing: banner.querySelector('#consent-marketing').checked
    };
    this.saveConsentPreferences();
    this.setConsent(this.consentTypes.analytics);
    this.applyConsentSettings();
  }

  rejectAll() {
    this.consentTypes = {
      analytics: false,
      functional: true,
      marketing: false
    };
    this.saveConsentPreferences();
    this.setConsent(false);
    this.applyConsentSettings();
  }

  setConsent(granted) {
    this.consentGiven = granted;
    localStorage.setItem('analytics_consent', granted);
    
    if (granted) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
  }

  applyConsentSettings() {
    // Apply consent settings to various services
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': this.consentTypes.analytics ? 'granted' : 'denied',
        'ad_storage': this.consentTypes.marketing ? 'granted' : 'denied',
        'functionality_storage': 'granted',
        'personalization_storage': this.consentTypes.marketing ? 'granted' : 'denied',
        'security_storage': 'granted'
      });
    }
    
    // Trigger consent change event for other scripts
    window.dispatchEvent(new CustomEvent('consentChanged', {
      detail: this.consentTypes
    }));
  }

  enableAnalytics() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      
      // Send page view after consent is granted
      if (window.GA_MEASUREMENT_ID) {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname
        });
      }
    }
    
    // Initialize analytics if not already done
    if (!window.analyticsInitialized && window.initializeAnalytics) {
      window.initializeAnalytics();
      window.analyticsInitialized = true;
    }
  }

  disableAnalytics() {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // Clear any analytics cookies
    this.clearAnalyticsCookies();
  }

  clearAnalyticsCookies() {
    // Clear Google Analytics cookies
    const gaCookies = ['_ga', '_gid', '_gat', '_ga_*'];
    gaCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  // Add consent banner styles
  addConsentStyles() {
    if (document.getElementById('consent-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'consent-styles';
    style.textContent = `
      .consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        padding: 20px;
        animation: slideUp 0.3s ease-out;
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
      
      .consent-banner-hiding {
        animation: slideDown 0.3s ease-out;
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(100%);
        }
      }
      
      .consent-content {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .consent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .consent-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .consent-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        color: #666;
      }
      
      .consent-close:hover {
        color: #000;
      }
      
      .consent-body {
        margin-bottom: 20px;
      }
      
      .consent-body p {
        margin: 0 0 15px 0;
        color: #333;
        line-height: 1.5;
      }
      
      .consent-options {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
      
      .consent-option {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        flex: 1;
        min-width: 200px;
      }
      
      .consent-option input {
        margin-right: 10px;
        margin-top: 3px;
      }
      
      .consent-option-label {
        display: flex;
        flex-direction: column;
      }
      
      .consent-option-label strong {
        display: block;
        margin-bottom: 2px;
      }
      
      .consent-option-label small {
        color: #666;
        font-size: 12px;
      }
      
      .consent-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .consent-button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .consent-accept-all {
        background: #007bff;
        color: white;
      }
      
      .consent-accept-all:hover {
        background: #0056b3;
      }
      
      .consent-accept-selected {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #333;
      }
      
      .consent-accept-selected:hover {
        background: #e9ecef;
      }
      
      .consent-reject {
        background: transparent;
        border: 1px solid #dee2e6;
        color: #666;
      }
      
      .consent-reject:hover {
        background: #f8f9fa;
      }
      
      .consent-link {
        color: #007bff;
        text-decoration: none;
        margin-left: auto;
      }
      
      .consent-link:hover {
        text-decoration: underline;
      }
      
      @media (max-width: 768px) {
        .consent-options {
          flex-direction: column;
          gap: 10px;
        }
        
        .consent-actions {
          flex-direction: column;
          width: 100%;
        }
        
        .consent-button {
          width: 100%;
        }
        
        .consent-link {
          margin: 10px auto 0;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .consent-banner {
          background: #1a1a1a;
          color: #e0e0e0;
        }
        
        .consent-body p {
          color: #ccc;
        }
        
        .consent-close {
          color: #999;
        }
        
        .consent-close:hover {
          color: #fff;
        }
        
        .consent-accept-selected,
        .consent-reject {
          background: #2a2a2a;
          border-color: #444;
          color: #e0e0e0;
        }
        
        .consent-accept-selected:hover,
        .consent-reject:hover {
          background: #333;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // Check if user is in EU (basic check)
  isEUUser() {
    // This is a simple check based on timezone
    // In production, you might want to use a proper geolocation service
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = ['Europe/', 'Africa/Ceuta', 'Africa/Canary', 'Atlantic/Canary', 'Atlantic/Madeira'];
    return euTimezones.some(tz => timezone.startsWith(tz));
  }

  // Get consent status
  getConsentStatus() {
    return {
      hasConsented: this.consentGiven,
      consentTypes: this.consentTypes,
      consentDate: localStorage.getItem('consent_date'),
      isEU: this.isEUUser()
    };
  }
}

// Initialize privacy compliance
const privacyAnalytics = new PrivacyCompliantAnalytics();

// Show consent banner on page load if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!privacyAnalytics.checkConsent() && !localStorage.getItem('consent_banner_shown')) {
      setTimeout(() => {
        privacyAnalytics.showConsentBanner();
      }, 1000);
    }
  });
} else {
  if (!privacyAnalytics.checkConsent() && !localStorage.getItem('consent_banner_shown')) {
    setTimeout(() => {
      privacyAnalytics.showConsentBanner();
    }, 1000);
  }
}