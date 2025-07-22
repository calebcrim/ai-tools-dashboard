// security-init.js
// Security initialization for crimintel.ai

// Load all security modules
const loadSecurityModules = () => {
  const scripts = [
    '/js/security/input-sanitizer.js',
    '/js/security/xss-prevention.js',
    '/js/security/csrf-protection.js',
    '/js/security/rate-limiter.js',
    '/js/security/security-monitor.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
};

// Initialize security features
const initializeSecurity = () => {
  // Wait for modules to load
  setTimeout(() => {
    console.log('Security modules loaded');
    
    // Run security tests in development
    if (isDevelopment()) {
      runSecurityTests();
    }
    
    // Set up global error handler
    setupGlobalErrorHandler();
    
    // Initialize secure defaults
    setSecureDefaults();
    
    // Start security monitoring
    console.log('🔒 Security features active');
  }, 100);
};

// Set up global error handler
const setupGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    // Check for security-related errors
    const securityErrors = [
      'Refused to execute',
      'Content Security Policy',
      'Blocked by CORS',
      'XSS',
      'injection'
    ];
    
    const errorMessage = event.message || '';
    const isSecurityError = securityErrors.some(pattern => 
      errorMessage.includes(pattern)
    );
    
    if (isSecurityError && window.securityMonitor) {
      window.securityMonitor.logSecurityEvent('global_security_error', {
        message: errorMessage,
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || 'Unknown';
    
    if (reason.includes('CSRF') || reason.includes('403')) {
      if (window.securityMonitor) {
        window.securityMonitor.logSecurityEvent('promise_security_rejection', {
          reason: reason
        });
      }
    }
  });
};

// Set secure defaults
const setSecureDefaults = () => {
  // Disable autocomplete on sensitive inputs
  document.querySelectorAll('input[type="password"], input[type="email"]').forEach(input => {
    input.setAttribute('autocomplete', 'off');
  });
  
  // Add rel="noopener noreferrer" to external links
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
  
  // Disable right-click in production (optional)
  if (!isDevelopment()) {
    document.addEventListener('contextmenu', (e) => {
      // Allow right-click on input fields
      if (!e.target.matches('input, textarea')) {
        e.preventDefault();
      }
    });
  }
};

// Run security tests (development only)
const runSecurityTests = () => {
  console.group('🔒 Security Tests');
  
  // Test 1: Input Sanitization
  console.log('Test 1: Input Sanitization');
  if (window.sanitizer) {
    const xssTest = '<script>alert("xss")</script>';
    const sanitized = window.sanitizer.sanitize(xssTest);
    console.log('XSS test input:', xssTest);
    console.log('Sanitized output:', sanitized);
    console.assert(!sanitized.includes('<script>'), 'Script tags should be removed');
  }
  
  // Test 2: XSS Prevention
  console.log('\nTest 2: XSS Prevention');
  if (window.xssPrevention) {
    const maliciousUrl = 'javascript:alert("xss")';
    const safeUrl = window.xssPrevention.sanitizeURL(maliciousUrl);
    console.log('Malicious URL:', maliciousUrl);
    console.log('Safe URL:', safeUrl);
    console.assert(safeUrl === '#', 'JavaScript URLs should be blocked');
  }
  
  // Test 3: CSRF Token
  console.log('\nTest 3: CSRF Protection');
  if (window.csrfProtection) {
    const token = window.csrfProtection.getToken();
    console.log('CSRF token generated:', token);
    console.assert(token && token.length === 64, 'CSRF token should be 64 characters');
  }
  
  // Test 4: Rate Limiting
  console.log('\nTest 4: Rate Limiting');
  if (window.rateLimiter) {
    let blocked = false;
    for (let i = 0; i < 15; i++) {
      const result = window.rateLimiter.checkLimit('search', 'test-user');
      if (!result.allowed) {
        blocked = true;
        console.log(`Rate limit hit after ${i + 1} requests`);
        break;
      }
    }
    console.assert(blocked, 'Rate limiter should block after 10 requests');
  }
  
  // Test 5: Security Monitoring
  console.log('\nTest 5: Security Monitoring');
  if (window.securityMonitor) {
    window.securityMonitor.logSecurityEvent('test_event', { test: true });
    const report = window.securityMonitor.getSecurityReport();
    console.log('Security report:', report);
  }
  
  console.groupEnd();
};

// Check if development environment
const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('.local');
};

// Load modules and initialize
loadSecurityModules();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSecurity);
} else {
  initializeSecurity();
}

// Export security utilities
window.securityInit = {
  test: runSecurityTests,
  report: () => {
    if (window.securityMonitor) {
      return window.securityMonitor.getSecurityReport();
    }
    return 'Security monitor not loaded';
  },
  checkXSS: (input) => {
    if (window.sanitizer) {
      const sanitized = window.sanitizer.sanitize(input);
      return {
        original: input,
        sanitized: sanitized,
        safe: input === sanitized
      };
    }
    return 'Sanitizer not loaded';
  }
};