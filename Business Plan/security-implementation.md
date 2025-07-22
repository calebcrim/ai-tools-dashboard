# Security Implementation Guide for AI Tools Hub

## 1. Frontend Security Hardening

### Content Security Policy (CSP)

```javascript
// security-headers.js
const setSecurityHeaders = () => {
  // Add CSP meta tag dynamically
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: http:;
    connect-src 'self' https://www.google-analytics.com https://api.crimintel.ai;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
  
  document.head.appendChild(cspMeta);
};

// Additional security headers (configure on server)
const recommendedHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

### Input Sanitization

```javascript
// input-sanitizer.js
class InputSanitizer {
  constructor() {
    this.encoder = document.createElement('div');
  }

  // Sanitize HTML content
  sanitizeHTML(input) {
    // Basic HTML encoding
    this.encoder.textContent = input;
    return this.encoder.innerHTML;
  }

  // Sanitize for use in attributes
  sanitizeAttribute(input) {
    return input
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\//g, '&#x2F;');
  }

  // Sanitize search queries
  sanitizeSearchQuery(query) {
    // Remove potential XSS vectors while preserving search functionality
    return query
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s\-\.]/g, '')
      .trim()
      .substring(0, 100); // Limit length
  }

  // Sanitize URLs
  sanitizeURL(url) {
    try {
      const parsed = new URL(url);
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '#';
      }
      return parsed.href;
    } catch {
      return '#';
    }
  }

  // Validate and sanitize tool data
  sanitizeToolData(tool) {
    return {
      id: this.sanitizeAttribute(tool.id || ''),
      tool_name: this.sanitizeHTML(tool.tool_name || ''),
      category: this.sanitizeHTML(tool.category || ''),
      url: this.sanitizeURL(tool.url || ''),
      brief_purpose_summary: this.sanitizeHTML(tool.brief_purpose_summary || ''),
      pricing_model: this.sanitizeHTML(tool.pricing_model || ''),
      // Add other fields as needed
    };
  }
}

const sanitizer = new InputSanitizer();
```

### XSS Prevention in Dynamic Content

```javascript
// xss-prevention.js
class SafeRenderer {
  constructor() {
    this.sanitizer = new InputSanitizer();
  }

  // Safe tool card rendering
  renderToolCard(tool) {
    const safeData = this.sanitizer.sanitizeToolData(tool);
    
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.toolId = safeData.id;
    
    // Use textContent for user-provided data
    const title = document.createElement('h3');
    title.textContent = safeData.tool_name;
    card.appendChild(title);
    
    const category = document.createElement('span');
    category.className = 'category';
    category.textContent = safeData.category;
    card.appendChild(category);
    
    const description = document.createElement('p');
    description.textContent = safeData.brief_purpose_summary;
    card.appendChild(description);
    
    // Safe URL handling
    if (safeData.url && safeData.url !== '#') {
      const link = document.createElement('a');
      link.href = safeData.url;
      link.textContent = 'Visit Tool';
      link.rel = 'noopener noreferrer';
      link.target = '_blank';
      card.appendChild(link);
    }
    
    return card;
  }

  // Safe search results rendering
  renderSearchResults(results, query) {
    const container = document.createElement('div');
    container.className = 'search-results';
    
    const header = document.createElement('h2');
    header.textContent = `Search results for: ${this.sanitizer.sanitizeHTML(query)}`;
    container.appendChild(header);
    
    results.forEach(result => {
      container.appendChild(this.renderToolCard(result));
    });
    
    return container;
  }
}

const safeRenderer = new SafeRenderer();
```

### CSRF Protection

```javascript
// csrf-protection.js
class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
    this.token = this.generateToken();
  }

  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  getToken() {
    let token = sessionStorage.getItem(this.tokenKey);
    if (!token) {
      token = this.generateToken();
      sessionStorage.setItem(this.tokenKey, token);
    }
    return token;
  }

  addToRequest(options = {}) {
    const token = this.getToken();
    
    // Add to headers
    options.headers = options.headers || {};
    options.headers['X-CSRF-Token'] = token;
    
    // Add to body if POST request
    if (options.method === 'POST' && options.body) {
      if (options.body instanceof FormData) {
        options.body.append('csrf_token', token);
      } else if (typeof options.body === 'object') {
        options.body.csrf_token = token;
      }
    }
    
    return options;
  }

  validateToken(token) {
    return token === this.getToken();
  }
}

const csrf = new CSRFProtection();

// Enhanced fetch with CSRF protection
const secureFetch = (url, options = {}) => {
  return fetch(url, csrf.addToRequest(options));
};
```

## 2. Data Protection

### Local Storage Encryption

```javascript
// storage-encryption.js
class SecureStorage {
  constructor() {
    this.encryptionKey = this.getOrCreateKey();
  }

  async getOrCreateKey() {
    let key = sessionStorage.getItem('storage_key');
    if (!key) {
      key = await this.generateKey();
      sessionStorage.setItem('storage_key', key);
    }
    return key;
  }

  async generateKey() {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
  }

  async encrypt(data) {
    const key = await this.importKey();
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  }

  async decrypt(encryptedData) {
    const key = await this.importKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.data)
    );
    
    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  }

  async importKey() {
    const keyData = JSON.parse(await this.encryptionKey);
    return crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async setItem(key, value) {
    const encrypted = await this.encrypt(value);
    localStorage.setItem(key, JSON.stringify(encrypted));
  }

  async getItem(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
      const encrypted = JSON.parse(item);
      return await this.decrypt(encrypted);
    } catch {
      return null;
    }
  }
}

const secureStorage = new SecureStorage();
```

### API Security

```javascript
// api-security.js
class APISecurityManager {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.rateLimiter = new RateLimiter();
  }

  async makeSecureRequest(endpoint, options = {}) {
    // Rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers
      },
      credentials: 'same-origin'
    };

    // Add CSRF token
    secureOptions.headers['X-CSRF-Token'] = csrf.getToken();

    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, secureOptions);
      
      // Check for security headers in response
      this.validateResponseHeaders(response);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Security Error:', error);
      throw error;
    }
  }

  validateResponseHeaders(response) {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ];

    requiredHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    });
  }
}

// Rate limiting implementation
class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.maxRequests - this.requests.length;
  }
}
```

## 3. Authentication & Session Security

```javascript
// session-security.js
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.activityListeners = [];
    this.initializeSession();
  }

  initializeSession() {
    this.updateLastActivity();
    this.setupActivityListeners();
    this.startSessionMonitor();
  }

  setupActivityListeners() {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateLastActivity(), true);
    });
  }

  updateLastActivity() {
    sessionStorage.setItem('lastActivity', Date.now());
  }

  startSessionMonitor() {
    setInterval(() => {
      const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
      const now = Date.now();
      
      if (now - lastActivity > this.sessionTimeout) {
        this.expireSession();
      }
    }, 60000); // Check every minute
  }

  expireSession() {
    // Clear sensitive data
    sessionStorage.clear();
    
    // Notify user
    this.showSessionExpiredModal();
    
    // Redirect to login or home
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  }

  showSessionExpiredModal() {
    const modal = document.createElement('div');
    modal.className = 'session-expired-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Session Expired</h2>
        <p>Your session has expired due to inactivity. You will be redirected to the home page.</p>
        <button onclick="window.location.reload()">Refresh Now</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

const sessionManager = new SessionManager();
```

## 4. Security Monitoring & Logging

```javascript
// security-monitor.js
class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = [];
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    this.monitorXSSAttempts();
    this.monitorAnomalousRequests();
    this.monitorFailedAuthentications();
  }

  monitorXSSAttempts() {
    // Monitor for common XSS patterns in inputs
    document.addEventListener('input', (e) => {
      const value = e.target.value;
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/i
      ];

      xssPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          this.logSuspiciousActivity('XSS_ATTEMPT', {
            field: e.target.name || e.target.id,
            pattern: pattern.toString(),
            value: value.substring(0, 100)
          });
          
          // Prevent the input
          e.target.value = '';
          this.showSecurityWarning('Invalid input detected');
        }
      });
    });
  }

  monitorAnomalousRequests() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Check for suspicious patterns
      if (this.isSuspiciousRequest(url, options)) {
        this.logSuspiciousActivity('SUSPICIOUS_REQUEST', {
          url,
          method: options?.method || 'GET'
        });
      }

      try {
        const response = await originalFetch(...args);
        
        // Monitor failed requests
        if (!response.ok && response.status >= 400) {
          this.logSuspiciousActivity('FAILED_REQUEST', {
            url,
            status: response.status,
            method: options?.method || 'GET'
          });
        }

        return response;
      } catch (error) {
        this.logSuspiciousActivity('REQUEST_ERROR', {
          url,
          error: error.message
        });
        throw error;
      }
    };
  }

  isSuspiciousRequest(url, options) {
    // Check for unusual patterns
    const suspiciousPatterns = [
      /\.\.\//,  // Directory traversal
      /\0/,      // Null byte
      /%00/,     // Encoded null byte
      /union.*select/i,  // SQL injection
      /exec\(/i,         // Command execution
    ];

    const urlString = url.toString();
    return suspiciousPatterns.some(pattern => pattern.test(urlString));
  }

  logSuspiciousActivity(type, details) {
    const activity = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    this.suspiciousActivities.push(activity);

    // Send to server (implement based on your backend)
    this.reportToServer(activity);

    // Log to console in development
    if (window.location.hostname === 'localhost') {
      console.warn('Security Alert:', activity);
    }
  }

  async reportToServer(activity) {
    try {
      await fetch('/api/security/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf.getToken()
        },
        body: JSON.stringify(activity)
      });
    } catch (error) {
      console.error('Failed to report security activity:', error);
    }
  }

  showSecurityWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.textContent = message;
    document.body.appendChild(warning);

    setTimeout(() => warning.remove(), 5000);
  }

  getSecurityReport() {
    return {
      totalSuspiciousActivities: this.suspiciousActivities.length,
      activitiesByType: this.suspiciousActivities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}),
      recentActivities: this.suspiciousActivities.slice(-10)
    };
  }
}

const securityMonitor = new SecurityMonitor();
```

## 5. Implementation Checklist

### Immediate Actions (Day 1)
- [ ] Implement Content Security Policy
- [ ] Add input sanitization to all user inputs
- [ ] Enable HTTPS everywhere
- [ ] Set up basic rate limiting

### Short-term (Week 1)
- [ ] Implement CSRF protection
- [ ] Add session timeout management
- [ ] Set up security monitoring
- [ ] Configure security headers on server

### Medium-term (Month 1)
- [ ] Implement secure storage for sensitive data
- [ ] Add comprehensive XSS prevention
- [ ] Set up security logging and alerting
- [ ] Conduct security audit

### Long-term (Quarter 1)
- [ ] Implement Web Application Firewall (WAF)
- [ ] Set up DDoS protection
- [ ] Regular penetration testing
- [ ] Security training for team

## 6. Security Best Practices

### Code Review Checklist
```javascript
// security-checklist.js
const securityChecklist = {
  inputs: [
    'All user inputs are sanitized',
    'No innerHTML with user data',
    'URL parameters are validated',
    'File uploads are restricted'
  ],
  
  authentication: [
    'Sessions timeout after inactivity',
    'CSRF tokens on state-changing requests',
    'Secure password requirements',
    'Rate limiting on login attempts'
  ],
  
  data: [
    'Sensitive data is encrypted',
    'PII is properly handled',
    'Logs don\'t contain sensitive info',
    'Backups are encrypted'
  ],
  
  headers: [
    'CSP is configured',
    'X-Frame-Options is set',
    'X-Content-Type-Options is set',
    'HTTPS is enforced'
  ],
  
  thirdParty: [
    'Dependencies are up to date',
    'CDN resources use SRI',
    'API keys are not in code',
    'External scripts are reviewed'
  ]
};
```

### Security Testing Script
```javascript
// security-test.js
const runSecurityTests = () => {
  console.log('Running security tests...');
  
  // Test XSS prevention
  const xssTests = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>'
  ];
  
  xssTests.forEach(test => {
    const sanitized = sanitizer.sanitizeHTML(test);
    console.assert(!sanitized.includes('script'), `XSS test failed: ${test}`);
    console.assert(!sanitized.includes('alert'), `XSS test failed: ${test}`);
  });
  
  // Test CSRF token generation
  const token1 = csrf.getToken();
  const token2 = csrf.getToken();
  console.assert(token1 === token2, 'CSRF tokens should be consistent');
  console.assert(token1.length === 64, 'CSRF token should be 64 characters');
  
  // Test rate limiting
  const limiter = new RateLimiter(5, 1000);
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.canMakeRequest(), `Request ${i + 1} should be allowed`);
  }
  console.assert(!limiter.canMakeRequest(), 'Request 6 should be blocked');
  
  console.log('Security tests completed');
};

// Run tests in development
if (window.location.hostname === 'localhost') {
  runSecurityTests();
}
```