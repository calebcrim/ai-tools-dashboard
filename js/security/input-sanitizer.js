// input-sanitizer.js
// Input sanitization for crimintel.ai

class InputSanitizer {
  constructor() {
    // Patterns for detecting malicious input
    this.patterns = {
      xss: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      htmlTags: /<[^>]+>/g,
      sqlInjection: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      jsEvents: /on\w+\s*=/gi,
      dataUri: /data:[^,]+,[^"'\s]+/gi,
      javascript: /javascript:/gi,
      cssExpression: /expression\s*\(/gi,
      metaRefresh: /<meta[^>]+http-equiv[^>]+refresh/gi
    };
    
    // Whitelist of allowed characters for different input types
    this.allowedChars = {
      search: /[^a-zA-Z0-9\s\-_.]/g,
      alphanumeric: /[^a-zA-Z0-9]/g,
      numeric: /[^0-9]/g,
      email: /[^a-zA-Z0-9@._\-]/g,
      url: /[^a-zA-Z0-9:\/\-._~!$&'()*+,;=?#\[\]@]/g
    };
    
    // Maximum lengths for different input types
    this.maxLengths = {
      search: 100,
      name: 50,
      email: 254,
      url: 2048,
      general: 500
    };
  }

  // Main sanitization method
  sanitize(input, type = 'general') {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    // Step 1: Trim and limit length
    let sanitized = input.trim();
    const maxLength = this.maxLengths[type] || this.maxLengths.general;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      console.warn(`Input truncated to ${maxLength} characters`);
    }
    
    // Step 2: Remove dangerous patterns
    sanitized = this.removeDangerousPatterns(sanitized);
    
    // Step 3: Apply type-specific filtering
    sanitized = this.applyTypeFilter(sanitized, type);
    
    // Step 4: Encode remaining HTML entities
    sanitized = this.encodeHtmlEntities(sanitized);
    
    // Step 5: Final validation
    if (this.containsMaliciousContent(sanitized)) {
      console.error('Malicious content detected after sanitization');
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('input_sanitization_failed', {
          original: input.substring(0, 50),
          type: type
        });
      }
      return '';
    }
    
    return sanitized;
  }

  // Sanitize search queries
  sanitizeSearchQuery(query) {
    if (!query) return '';
    
    // Allow more characters in search but still be safe
    let sanitized = query.trim();
    
    // Remove script tags and event handlers
    sanitized = sanitized.replace(this.patterns.xss, '');
    sanitized = sanitized.replace(this.patterns.jsEvents, '');
    sanitized = sanitized.replace(this.patterns.javascript, '');
    
    // Allow basic punctuation but encode special chars
    sanitized = this.encodeHtmlEntities(sanitized);
    
    // Limit length
    if (sanitized.length > this.maxLengths.search) {
      sanitized = sanitized.substring(0, this.maxLengths.search);
    }
    
    // Log if input was modified
    if (sanitized !== query) {
      console.warn('Search query was sanitized', { original: query, sanitized });
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('search_query_sanitized', {
          original: query.substring(0, 50),
          sanitized: sanitized.substring(0, 50)
        });
      }
    }
    
    return sanitized;
  }

  // Sanitize filter values
  sanitizeFilterValue(value, filterType) {
    if (!value) return '';
    
    // For predefined filter values (categories, pricing, etc.)
    if (filterType === 'category' || filterType === 'pricing') {
      // Only allow alphanumeric, spaces, and hyphens
      return value.toString().replace(/[^a-zA-Z0-9\s\-]/g, '').trim();
    }
    
    // For other filters, apply general sanitization
    return this.sanitize(value, 'general');
  }

  // Sanitize URLs
  sanitizeUrl(url) {
    if (!url) return '';
    
    try {
      // Parse URL to validate structure
      const parsed = new URL(url);
      
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        console.warn('Invalid protocol in URL:', parsed.protocol);
        return '';
      }
      
      // Reconstruct URL from parsed components
      return parsed.toString();
    } catch (e) {
      // If not a valid URL, return empty
      console.warn('Invalid URL format:', url);
      return '';
    }
  }

  // Sanitize HTML content (for rendering)
  sanitizeHTML(html) {
    if (!html) return '';
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html; // This encodes all HTML
    
    // Return encoded version
    return temp.innerHTML;
  }

  // Remove dangerous patterns
  removeDangerousPatterns(input) {
    let sanitized = input;
    
    // Remove script tags
    sanitized = sanitized.replace(this.patterns.xss, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(this.patterns.jsEvents, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(this.patterns.javascript, '');
    
    // Remove data URIs (can contain scripts)
    sanitized = sanitized.replace(this.patterns.dataUri, '');
    
    // Remove CSS expressions
    sanitized = sanitized.replace(this.patterns.cssExpression, '');
    
    // Remove meta refresh tags
    sanitized = sanitized.replace(this.patterns.metaRefresh, '');
    
    return sanitized;
  }

  // Apply type-specific filtering
  applyTypeFilter(input, type) {
    switch (type) {
      case 'search':
        // Allow letters, numbers, spaces, hyphens, underscores, dots
        return input.replace(this.allowedChars.search, '');
        
      case 'alphanumeric':
        return input.replace(this.allowedChars.alphanumeric, '');
        
      case 'numeric':
        return input.replace(this.allowedChars.numeric, '');
        
      case 'email':
        return input.toLowerCase().replace(this.allowedChars.email, '');
        
      case 'url':
        return input.replace(this.allowedChars.url, '');
        
      default:
        // For general input, just return after dangerous pattern removal
        return input;
    }
  }

  // Encode HTML entities
  encodeHtmlEntities(str) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    return String(str).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
  }

  // Check if content still contains malicious patterns
  containsMaliciousContent(input) {
    const dangerous = [
      this.patterns.xss,
      this.patterns.jsEvents,
      this.patterns.javascript,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i
    ];
    
    return dangerous.some(pattern => pattern.test(input));
  }

  // Validate email format
  validateEmail(email) {
    const sanitized = this.sanitize(email, 'email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : null;
  }

  // Sanitize array of values
  sanitizeArray(array, type = 'general') {
    if (!Array.isArray(array)) return [];
    return array.map(item => this.sanitize(String(item), type));
  }

  // Sanitize object properties
  sanitizeObject(obj, rules = {}) {
    if (!obj || typeof obj !== 'object') return {};
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const type = rules[key] || 'general';
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value, type);
      } else if (Array.isArray(value)) {
        sanitized[key] = this.sanitizeArray(value, type);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, rules[key] || {});
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Create safe text node (for DOM manipulation)
  createSafeTextNode(text) {
    return document.createTextNode(this.sanitize(text));
  }

  // Safe setAttribute
  setSafeAttribute(element, attribute, value) {
    const safeName = this.sanitize(attribute, 'alphanumeric');
    const safeValue = this.sanitize(value);
    
    // Block dangerous attributes
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
    if (dangerousAttrs.some(attr => safeName.toLowerCase().includes(attr))) {
      console.warn('Blocked dangerous attribute:', attribute);
      return false;
    }
    
    element.setAttribute(safeName, safeValue);
    return true;
  }
}

// Create singleton instance
const sanitizer = new InputSanitizer();

// Attach to window for global access
window.sanitizer = sanitizer;

// Auto-sanitize common inputs on page load
document.addEventListener('DOMContentLoaded', () => {
  // Auto-sanitize search inputs
  document.querySelectorAll('input[type="search"], input.search-input, #searchInput, #globalSearchInput').forEach(input => {
    input.addEventListener('input', (e) => {
      const original = e.target.value;
      const sanitized = sanitizer.sanitizeSearchQuery(original);
      
      if (sanitized !== original) {
        e.target.value = sanitized;
        console.warn('Input was sanitized');
      }
    });
  });
  
  // Auto-sanitize form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.type === 'email') {
        input.value = sanitizer.sanitize(input.value, 'email');
      } else if (input.type === 'url') {
        input.value = sanitizer.sanitizeUrl(input.value);
      } else if (input.type === 'text' || input.type === 'textarea') {
        input.value = sanitizer.sanitize(input.value);
      }
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputSanitizer;
}