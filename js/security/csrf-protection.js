// csrf-protection.js
// CSRF protection for crimintel.ai

class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
    this.tokenHeader = 'X-CSRF-Token';
    this.tokenLifetime = 3600000; // 1 hour in milliseconds
    this.tokenLength = 32;
    
    // Initialize token on load
    this.initializeToken();
  }

  // Initialize CSRF token
  initializeToken() {
    const existingToken = this.getStoredToken();
    
    if (!existingToken || this.isTokenExpired(existingToken)) {
      this.generateNewToken();
    }
  }

  // Generate a new CSRF token
  generateNewToken() {
    const token = {
      value: this.generateRandomToken(),
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    // Store in session storage
    sessionStorage.setItem(this.tokenKey, JSON.stringify(token));
    
    // Also set as meta tag for easy access
    this.setMetaToken(token.value);
    
    return token.value;
  }

  // Generate random token string
  generateRandomToken() {
    const array = new Uint8Array(this.tokenLength);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get stored token
  getStoredToken() {
    try {
      const stored = sessionStorage.getItem(this.tokenKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error retrieving CSRF token:', e);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token || !token.timestamp) return true;
    return Date.now() - token.timestamp > this.tokenLifetime;
  }

  // Get current valid token
  getToken() {
    const token = this.getStoredToken();
    
    if (!token || this.isTokenExpired(token)) {
      return this.generateNewToken();
    }
    
    return token.value;
  }

  // Validate token
  validateToken(providedToken) {
    const storedToken = this.getStoredToken();
    
    if (!storedToken || this.isTokenExpired(storedToken)) {
      console.warn('CSRF token expired or missing');
      return false;
    }
    
    if (providedToken !== storedToken.value) {
      console.error('CSRF token mismatch');
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('csrf_validation_failed', {
          provided: providedToken ? 'present' : 'missing',
          reason: providedToken ? 'mismatch' : 'missing'
        });
      }
      return false;
    }
    
    return true;
  }

  // Set token in meta tag
  setMetaToken(token) {
    let meta = document.querySelector('meta[name="csrf-token"]');
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'csrf-token';
      document.head.appendChild(meta);
    }
    
    meta.content = token;
  }

  // Get token from meta tag
  getMetaToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : null;
  }

  // Add token to form
  addTokenToForm(form) {
    // Remove any existing token input
    const existing = form.querySelector('input[name="_csrf"]');
    if (existing) {
      existing.remove();
    }
    
    // Add hidden input with token
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = '_csrf';
    input.value = this.getToken();
    form.appendChild(input);
  }

  // Add token to AJAX request
  addTokenToRequest(options = {}) {
    const token = this.getToken();
    
    // Add to headers
    if (!options.headers) {
      options.headers = {};
    }
    options.headers[this.tokenHeader] = token;
    
    // For form data, add to body
    if (options.body instanceof FormData) {
      options.body.append('_csrf', token);
    } else if (typeof options.body === 'object' && options.body !== null) {
      options.body._csrf = token;
    }
    
    return options;
  }

  // Protect fetch requests
  protectedFetch(url, options = {}) {
    // Only add CSRF for state-changing requests
    const method = (options.method || 'GET').toUpperCase();
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      options = this.addTokenToRequest(options);
    }
    
    return fetch(url, options).then(response => {
      // Check for CSRF error response
      if (response.status === 403) {
        const errorText = response.headers.get('X-CSRF-Error');
        if (errorText) {
          console.error('CSRF validation failed:', errorText);
          // Regenerate token and retry once
          this.generateNewToken();
          options = this.addTokenToRequest(options);
          return fetch(url, options);
        }
      }
      
      return response;
    });
  }

  // Get session ID (for additional validation)
  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    
    if (!sessionId) {
      sessionId = this.generateRandomToken();
      sessionStorage.setItem('session_id', sessionId);
    }
    
    return sessionId;
  }

  // Protect all forms on the page
  protectForms() {
    document.querySelectorAll('form').forEach(form => {
      // Skip if already protected
      if (form.dataset.csrfProtected) return;
      
      // Add token on submit
      form.addEventListener('submit', (e) => {
        // Skip GET forms
        if (form.method.toUpperCase() === 'GET') return;
        
        this.addTokenToForm(form);
      });
      
      // Mark as protected
      form.dataset.csrfProtected = 'true';
    });
  }

  // Create protected XMLHttpRequest
  createProtectedXHR() {
    const xhr = new XMLHttpRequest();
    const originalOpen = xhr.open.bind(xhr);
    const originalSend = xhr.send.bind(xhr);
    
    xhr.open = function(method, url, ...args) {
      this._method = method;
      return originalOpen(method, url, ...args);
    };
    
    xhr.send = function(body) {
      // Add CSRF token for state-changing requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(this._method.toUpperCase())) {
        xhr.setRequestHeader(csrfProtection.tokenHeader, csrfProtection.getToken());
      }
      
      return originalSend(body);
    };
    
    return xhr;
  }

  // Verify origin (additional protection)
  verifyOrigin(request) {
    const origin = request.headers.get('Origin') || request.headers.get('Referer');
    
    if (!origin) {
      console.warn('No origin header in request');
      return false;
    }
    
    try {
      const originUrl = new URL(origin);
      const currentUrl = new URL(window.location.href);
      
      // Check if same origin
      if (originUrl.origin !== currentUrl.origin) {
        console.error('Cross-origin request detected');
        if (window.securityMonitor) {
          window.securityMonitor.logSecurityEvent('csrf_cross_origin', {
            origin: originUrl.origin,
            current: currentUrl.origin
          });
        }
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Invalid origin URL:', e);
      return false;
    }
  }

  // Double submit cookie pattern (alternative/additional protection)
  setDoubleSubmitCookie() {
    const token = this.getToken();
    
    // Set cookie with SameSite attribute
    document.cookie = `csrf_token=${token}; path=/; SameSite=Strict; Secure`;
  }

  // Get token from cookie
  getTokenFromCookie() {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : null;
  }

  // Validate double submit
  validateDoubleSubmit(headerToken) {
    const cookieToken = this.getTokenFromCookie();
    
    if (!cookieToken || cookieToken !== headerToken) {
      console.error('Double submit validation failed');
      return false;
    }
    
    return true;
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

// Protect forms when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    csrfProtection.protectForms();
    
    // Re-protect forms added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'FORM') {
                csrfProtection.protectForms();
              } else if (node.querySelector && node.querySelector('form')) {
                csrfProtection.protectForms();
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
} else {
  csrfProtection.protectForms();
}

// Override fetch to add CSRF protection
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  return csrfProtection.protectedFetch(url, options);
};

// Add to window for access
window.csrfProtection = csrfProtection;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSRFProtection;
}