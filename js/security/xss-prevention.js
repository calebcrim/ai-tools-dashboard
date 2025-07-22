// xss-prevention.js
// XSS prevention for crimintel.ai

class XSSPrevention {
  constructor() {
    this.trustedTypes = this.initializeTrustedTypes();
    this.domPurifyConfig = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title', 'class'],
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true
    };
  }

  // Initialize Trusted Types if available
  initializeTrustedTypes() {
    if (typeof window.trustedTypes !== 'undefined' && window.trustedTypes.createPolicy) {
      try {
        return window.trustedTypes.createPolicy('default', {
          createHTML: (string) => this.sanitizeHTML(string),
          createScriptURL: (string) => this.validateScriptURL(string),
          createScript: (string) => this.validateScript(string)
        });
      } catch (e) {
        console.warn('Trusted Types not available:', e);
      }
    }
    return null;
  }

  // Safe element creation
  createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);
    
    // Safely set attributes
    for (const [key, value] of Object.entries(attributes)) {
      this.setSafeAttribute(element, key, value);
    }
    
    // Safely set content
    if (content) {
      this.setSafeContent(element, content);
    }
    
    return element;
  }

  // Safe attribute setting
  setSafeAttribute(element, attribute, value) {
    // Block dangerous attributes
    const dangerousAttrs = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'
    ];
    
    if (dangerousAttrs.includes(attribute.toLowerCase())) {
      console.warn(`Blocked dangerous attribute: ${attribute}`);
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('xss_attribute_blocked', {
          attribute,
          value: value.substring(0, 50)
        });
      }
      return;
    }
    
    // Special handling for href
    if (attribute.toLowerCase() === 'href') {
      const safeUrl = this.sanitizeURL(value);
      if (safeUrl) {
        element.setAttribute(attribute, safeUrl);
      }
      return;
    }
    
    // Special handling for src
    if (attribute.toLowerCase() === 'src') {
      const safeUrl = this.sanitizeURL(value);
      if (safeUrl) {
        element.setAttribute(attribute, safeUrl);
      }
      return;
    }
    
    // For other attributes, sanitize the value
    const sanitizedValue = this.sanitizeAttributeValue(value);
    element.setAttribute(attribute, sanitizedValue);
  }

  // Safe content setting
  setSafeContent(element, content, isHTML = false) {
    if (isHTML) {
      // For HTML content, use innerHTML with sanitization
      element.innerHTML = this.sanitizeHTML(content);
    } else {
      // For text content, use textContent (automatically safe)
      element.textContent = content;
    }
  }

  // Sanitize HTML content
  sanitizeHTML(html) {
    if (!html) return '';
    
    // Remove script tags and event handlers
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '');
    
    // Create a temporary container
    const temp = document.createElement('div');
    temp.innerHTML = clean;
    
    // Remove dangerous elements
    const dangerous = temp.querySelectorAll('script, iframe, object, embed, form, input, textarea, button');
    dangerous.forEach(el => el.remove());
    
    // Clean remaining elements
    this.cleanElement(temp);
    
    return temp.innerHTML;
  }

  // Recursively clean an element and its children
  cleanElement(element) {
    // Remove dangerous attributes
    const attributes = element.attributes;
    if (attributes) {
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];
        if (attr.name.startsWith('on') || attr.value.includes('javascript:')) {
          element.removeAttribute(attr.name);
        }
      }
    }
    
    // Clean children
    for (const child of element.children) {
      this.cleanElement(child);
    }
  }

  // Sanitize URLs
  sanitizeURL(url) {
    if (!url) return '';
    
    try {
      // Remove whitespace
      const trimmed = url.trim();
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
      const lowerUrl = trimmed.toLowerCase();
      
      for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
          console.warn(`Blocked dangerous URL protocol: ${protocol}`);
          if (window.securityMonitor) {
            window.securityMonitor.logSecurityEvent('xss_url_blocked', {
              url: url.substring(0, 50),
              protocol
            });
          }
          return '#';
        }
      }
      
      // Validate URL structure
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
      }
      
      // For relative URLs, ensure they're safe
      if (!trimmed.includes(':')) {
        return trimmed;
      }
      
      // Default to safe URL
      return '#';
    } catch (e) {
      console.error('Error sanitizing URL:', e);
      return '#';
    }
  }

  // Sanitize attribute values
  sanitizeAttributeValue(value) {
    if (!value) return '';
    
    // Convert to string and encode quotes
    return String(value)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Validate script URLs
  validateScriptURL(url) {
    // Only allow same-origin scripts or trusted CDNs
    const trustedOrigins = [
      window.location.origin,
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com',
      'https://www.googletagmanager.com'
    ];
    
    try {
      const urlObj = new URL(url, window.location.origin);
      if (trustedOrigins.some(origin => url.startsWith(origin))) {
        return url;
      }
    } catch (e) {
      console.error('Invalid script URL:', url);
    }
    
    console.warn('Blocked untrusted script URL:', url);
    return '';
  }

  // Validate inline scripts
  validateScript(script) {
    // Block all inline scripts by default
    console.warn('Inline scripts are not allowed');
    return '';
  }

  // Safe DOM manipulation methods
  safelyUpdateElement(selector, content, isHTML = false) {
    const element = document.querySelector(selector);
    if (element) {
      this.setSafeContent(element, content, isHTML);
    }
  }

  // Safe append child
  safeAppendChild(parent, child) {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      parent.appendChild(child);
    }
  }

  // Create safe tool card
  createSafeToolCard(tool) {
    const card = this.createElement('div', {
      class: 'tool-card',
      'data-tool-id': tool.id,
      'data-tool-name': tool.tool_name,
      'data-category': tool.category
    });
    
    // Tool name
    const title = this.createElement('h3', { class: 'tool-name' }, tool.tool_name);
    card.appendChild(title);
    
    // Category
    const category = this.createElement('span', { class: 'tool-category' }, tool.category);
    card.appendChild(category);
    
    // Description
    const description = this.createElement('p', { class: 'tool-description' }, tool.brief_purpose_summary);
    card.appendChild(description);
    
    // Link
    const link = this.createElement('a', {
      href: tool.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'tool-link'
    }, 'Visit Tool');
    card.appendChild(link);
    
    return card;
  }

  // Escape HTML for display
  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Unescape HTML entities
  unescapeHTML(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
  }

  // Highlight search terms safely
  highlightSearchTerms(text, searchTerm) {
    if (!searchTerm) return this.escapeHTML(text);
    
    const escaped = this.escapeHTML(text);
    const escapedTerm = this.escapeHTML(searchTerm);
    
    // Use a safe regex pattern
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  // Monitor DOM for XSS attempts
  monitorDOM() {
    // Set up MutationObserver to watch for dangerous changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementSafety(node);
            }
          });
        } else if (mutation.type === 'attributes') {
          this.checkAttributeSafety(mutation.target, mutation.attributeName);
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'href', 'src']
    });
  }

  // Check element safety
  checkElementSafety(element) {
    // Check for script tags
    if (element.tagName === 'SCRIPT') {
      console.warn('Script tag detected and removed');
      element.remove();
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('xss_script_blocked', {
          src: element.src || 'inline'
        });
      }
    }
    
    // Check for dangerous elements
    const dangerous = ['IFRAME', 'OBJECT', 'EMBED'];
    if (dangerous.includes(element.tagName)) {
      console.warn(`Dangerous element detected and removed: ${element.tagName}`);
      element.remove();
    }
  }

  // Check attribute safety
  checkAttributeSafety(element, attributeName) {
    if (attributeName && attributeName.startsWith('on')) {
      console.warn(`Dangerous attribute detected and removed: ${attributeName}`);
      element.removeAttribute(attributeName);
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('xss_attribute_removed', {
          attribute: attributeName,
          element: element.tagName
        });
      }
    }
  }
}

// Create singleton instance
const xssPrevention = new XSSPrevention();

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    xssPrevention.monitorDOM();
  });
} else {
  xssPrevention.monitorDOM();
}

// Attach to window for global access
window.xssPrevention = xssPrevention;

// Override dangerous methods in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      console.warn('Direct innerHTML usage detected. Consider using xssPrevention.setSafeContent()');
      originalInnerHTML.set.call(this, value);
    },
    get: originalInnerHTML.get
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XSSPrevention;
}