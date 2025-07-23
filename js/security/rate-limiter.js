// rate-limiter.js
// Rate limiting for crimintel.ai

class RateLimiter {
  constructor() {
    this.limits = {
      search: {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
        message: 'Too many searches. Please wait a moment before searching again.'
      },
      filter: {
        maxRequests: 30,
        windowMs: 60000, // 1 minute
        message: 'Too many filter changes. Please slow down.'
      },
      api: {
        maxRequests: 100,
        windowMs: 300000, // 5 minutes
        message: 'API rate limit exceeded. Please try again later.'
      },
      formSubmit: {
        maxRequests: 5,
        windowMs: 300000, // 5 minutes
        message: 'Too many form submissions. Please wait before trying again.'
      },
      toolView: {
        maxRequests: 50,
        windowMs: 60000, // 1 minute
        message: 'Viewing tools too quickly. Please slow down.'
      }
    };
    
    // Storage for request tracking
    this.requests = {};
    
    // Initialize cleanup interval
    this.startCleanup();
  }

  // Check if action is rate limited
  checkLimit(action, identifier = 'global') {
    const limit = this.limits[action];
    
    if (!limit) {
      console.warn(`No rate limit defined for action: ${action}`);
      return { allowed: true };
    }
    
    const key = `${action}:${identifier}`;
    const now = Date.now();
    
    // Initialize request tracking for this key
    if (!this.requests[key]) {
      this.requests[key] = [];
    }
    
    // Remove old requests outside the window
    this.requests[key] = this.requests[key].filter(
      timestamp => now - timestamp < limit.windowMs
    );
    
    // Check if limit exceeded
    if (this.requests[key].length >= limit.maxRequests) {
      const oldestRequest = this.requests[key][0];
      const waitTime = Math.ceil((limit.windowMs - (now - oldestRequest)) / 1000);
      
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('rate_limit_exceeded', {
          action,
          identifier,
          requests: this.requests[key].length,
          limit: limit.maxRequests
        });
      }
      
      return {
        allowed: false,
        message: limit.message,
        waitTime: waitTime,
        retryAfter: oldestRequest + limit.windowMs
      };
    }
    
    // Add current request
    this.requests[key].push(now);
    
    return {
      allowed: true,
      remaining: limit.maxRequests - this.requests[key].length,
      resetTime: this.requests[key][0] + limit.windowMs
    };
  }

  // Track an action
  track(action, identifier = 'global') {
    const result = this.checkLimit(action, identifier);
    
    if (!result.allowed) {
      this.handleRateLimitExceeded(action, result);
    }
    
    return result;
  }

  // Handle rate limit exceeded
  handleRateLimitExceeded(action, result) {
    // Show user-friendly message
    this.showRateLimitMessage(result.message, result.waitTime);
    
    // Log for monitoring
    console.warn(`Rate limit exceeded for ${action}:`, result);
    
    // Track in analytics
    if (window.analyticsTracker) {
      window.analyticsTracker.trackError('rate_limit', result.message, action);
    }
  }

  // Show rate limit message to user
  showRateLimitMessage(message, waitTime) {
    // Remove any existing message
    const existing = document.querySelector('.rate-limit-message');
    if (existing) {
      existing.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'rate-limit-message';
    messageEl.innerHTML = `
      <div class="rate-limit-content">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        ${waitTime ? `<p class="wait-time">Please wait ${waitTime} seconds.</p>` : ''}
      </div>
    `;
    
    // Add styles
    this.addRateLimitStyles();
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.classList.add('fade-out');
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }

  // Add rate limit styles
  addRateLimitStyles() {
    if (document.getElementById('rate-limit-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rate-limit-styles';
    style.textContent = `
      .rate-limit-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f8d7da;
        color: #721c24;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
        max-width: 400px;
      }
      
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      .rate-limit-message.fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }
      
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }
      
      .rate-limit-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .rate-limit-content i {
        font-size: 20px;
      }
      
      .rate-limit-content p {
        margin: 0;
      }
      
      .rate-limit-content .wait-time {
        font-size: 14px;
        opacity: 0.8;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Get rate limit info for an action
  getInfo(action, identifier = 'global') {
    const limit = this.limits[action];
    if (!limit) return null;
    
    const key = `${action}:${identifier}`;
    const now = Date.now();
    
    const requests = (this.requests[key] || []).filter(
      timestamp => now - timestamp < limit.windowMs
    );
    
    return {
      limit: limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - requests.length),
      resetTime: requests.length > 0 ? requests[0] + limit.windowMs : null,
      windowMs: limit.windowMs
    };
  }

  // Reset limits for an action/identifier
  reset(action, identifier = 'global') {
    const key = `${action}:${identifier}`;
    delete this.requests[key];
  }

  // Clean up old request data periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      
      Object.keys(this.requests).forEach(key => {
        const [action] = key.split(':');
        const limit = this.limits[action];
        
        if (limit) {
          this.requests[key] = this.requests[key].filter(
            timestamp => now - timestamp < limit.windowMs
          );
          
          // Remove empty arrays
          if (this.requests[key].length === 0) {
            delete this.requests[key];
          }
        }
      });
    }, 60000); // Clean up every minute
  }

  // Create rate-limited function
  createLimitedFunction(fn, action, options = {}) {
    const identifier = options.identifier || 'global';
    const onLimit = options.onLimit || (() => {});
    
    return (...args) => {
      const result = this.checkLimit(action, identifier);
      
      if (result.allowed) {
        return fn(...args);
      } else {
        onLimit(result);
        return null;
      }
    };
  }

  // Middleware for fetch requests
  limitedFetch(url, options = {}) {
    const action = options.rateLimitAction || 'api';
    const identifier = options.rateLimitId || 'global';
    
    const result = this.checkLimit(action, identifier);
    
    if (!result.allowed) {
      return Promise.reject(new Error(`Rate limit exceeded: ${result.message}`));
    }
    
    // Add rate limit headers to response
    return fetch(url, options).then(response => {
      response.headers.append('X-RateLimit-Limit', this.limits[action].maxRequests);
      response.headers.append('X-RateLimit-Remaining', result.remaining);
      
      if (result.resetTime) {
        response.headers.append('X-RateLimit-Reset', Math.floor(result.resetTime / 1000));
      }
      
      return response;
    });
  }

  // Get session identifier (for per-session limits)
  getSessionId() {
    let sessionId = sessionStorage.getItem('rate_limit_session');
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('rate_limit_session', sessionId);
    }
    
    return sessionId;
  }

  // Get user identifier (IP-based would require server-side)
  getUserId() {
    // In a real implementation, this might use:
    // - User account ID if logged in
    // - IP address (from server)
    // - Fingerprinting (with user consent)
    
    // For now, use session-based identification
    return this.getSessionId();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Apply rate limiting to common actions
document.addEventListener('DOMContentLoaded', () => {
  // Rate limit search input
  const searchInputs = document.querySelectorAll('.search-input, #searchInput, #globalSearchInput');
  searchInputs.forEach(input => {
    const limitedSearch = rateLimiter.createLimitedFunction(
      (value) => {
        // Original search logic would go here
        console.log('Search allowed:', value);
      },
      'search',
      {
        identifier: rateLimiter.getUserId(),
        onLimit: (result) => {
          console.warn('Search rate limited:', result.message);
        }
      }
    );
    
    let searchTimeout;
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        limitedSearch(e.target.value);
      }, 300);
    });
  });
  
  // Rate limit filter changes
  document.addEventListener('change', (e) => {
    if (e.target.matches('.filter-checkbox, .filter-select, input[type="checkbox"][data-filter]')) {
      const result = rateLimiter.track('filter', rateLimiter.getUserId());
      
      if (!result.allowed) {
        // Revert the change
        if (e.target.type === 'checkbox') {
          e.target.checked = !e.target.checked;
        } else {
          // For selects, would need to track previous value
        }
        
        e.preventDefault();
      }
    }
  });
  
  // Rate limit form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const result = rateLimiter.track('formSubmit', rateLimiter.getUserId());
    
    if (!result.allowed) {
      e.preventDefault();
    }
  });
});

// Attach to window for access
window.rateLimiter = rateLimiter;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimiter;
}