// analytics-config.js
// Google Analytics 4 Configuration for crimintel.ai

// Get GA4 ID from window (set by HTML) or use actual measurement ID
const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-VYERSN9JQR';

// Initialize Google Analytics
const initializeAnalytics = () => {
  // Check if analytics is already initialized
  if (window.gtag) {
    console.log('Analytics already initialized');
    return window.gtag;
  }

  // Don't load analytics if placeholder ID
  if (GA_MEASUREMENT_ID === 'G-PLACEHOLDER') {
    console.warn('Analytics: Using placeholder GA4 ID. Set GA_MEASUREMENT_ID in Netlify environment variables.');
    // Create a mock gtag function for development
    window.gtag = function() {
      console.log('Analytics Event (dev mode):', arguments);
    };
    window.dataLayer = window.dataLayer || [];
    return window.gtag;
  }

  // Add Google tag (gtag.js)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  
  // Configure gtag
  gtag('js', new Date());
  
  // Set up consent mode (default to denied until user consents)
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'functionality_storage': 'granted',
    'personalization_storage': 'denied',
    'security_storage': 'granted'
  });
  
  // Configure GA4 with custom settings
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send custom page views
    cookie_flags: 'SameSite=None;Secure',
    custom_map: {
      'dimension1': 'user_type',
      'dimension2': 'user_industry',
      'dimension3': 'preferred_categories',
      'dimension4': 'engagement_level'
    }
  });
  
  return gtag;
};

// Check and update consent
const updateAnalyticsConsent = (granted) => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': granted ? 'granted' : 'denied'
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeAnalytics, updateAnalyticsConsent, GA_MEASUREMENT_ID };
}