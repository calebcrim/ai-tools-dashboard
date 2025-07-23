// security-monitor.js
// Security monitoring for crimintel.ai

class SecurityMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
    this.alertThresholds = {
      xss_attempts: 5,
      csrf_failures: 3,
      rate_limit_exceeded: 10,
      suspicious_patterns: 3
    };
    
    this.eventCounts = {};
    this.alertCallbacks = [];
    
    // Initialize monitoring
    this.initializeMonitoring();
  }

  // Initialize security monitoring
  initializeMonitoring() {
    // Monitor console errors for security issues
    this.monitorConsoleErrors();
    
    // Monitor network requests
    this.monitorNetworkRequests();
    
    // Monitor DOM mutations for suspicious changes
    this.monitorDOMMutations();
    
    // Start periodic reporting
    this.startPeriodicReporting();
  }

  // Log security event
  logSecurityEvent(type, details = {}) {
    const event = {
      id: this.generateEventId(),
      type: type,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      details: details,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };
    
    // Add to events array
    this.events.push(event);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Update event counts
    this.eventCounts[type] = (this.eventCounts[type] || 0) + 1;
    
    // Check for alerts
    this.checkAlertThresholds(type);
    
    // Log to console in development
    if (this.isDevelopment()) {
      console.warn(`[Security Event] ${type}:`, details);
    }
    
    // Send to analytics
    if (window.analyticsTracker) {
      window.analyticsTracker.trackError('security_event', type, JSON.stringify(details));
    }
    
    // Store in session storage for debugging
    this.storeRecentEvents();
    
    return event;
  }

  // Check alert thresholds
  checkAlertThresholds(eventType) {
    const threshold = this.alertThresholds[eventType];
    
    if (threshold && this.eventCounts[eventType] >= threshold) {
      this.triggerSecurityAlert(eventType, this.eventCounts[eventType]);
      
      // Reset count after alert
      this.eventCounts[eventType] = 0;
    }
  }

  // Trigger security alert
  triggerSecurityAlert(eventType, count) {
    const alert = {
      type: 'security_alert',
      eventType: eventType,
      count: count,
      timestamp: Date.now(),
      message: `Security alert: ${count} ${eventType} events detected`
    };
    
    console.error('[SECURITY ALERT]', alert.message);
    
    // Call registered callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (e) {
        console.error('Error in alert callback:', e);
      }
    });
    
    // Send high-priority analytics event
    if (window.analyticsTracker) {
      window.analyticsTracker.trackError('security_alert', alert.message, eventType);
    }
    
    // Show user notification for critical events
    if (this.isCriticalEvent(eventType)) {
      this.showSecurityNotification(alert.message);
    }
  }

  // Monitor console errors
  monitorConsoleErrors() {
    const originalError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      
      // Check for security-related errors
      const securityPatterns = [
        /content security policy/i,
        /refused to execute/i,
        /cross-origin/i,
        /blocked.*script/i,
        /xss/i,
        /csrf/i
      ];
      
      if (securityPatterns.some(pattern => pattern.test(errorString))) {
        this.logSecurityEvent('console_security_error', {
          error: errorString.substring(0, 200)
        });
      }
      
      // Call original console.error
      originalError.apply(console, args);
    };
  }

  // Monitor network requests
  monitorNetworkRequests() {
    // Monitor fetch
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const [url, options = {}] = args;
      
      return originalFetch.apply(window, args)
        .then(response => {
          // Check for security-related responses
          if (response.status === 403) {
            this.logSecurityEvent('forbidden_request', {
              url: url,
              method: options.method || 'GET'
            });
          }
          
          if (response.headers.get('X-XSS-Protection') === '0') {
            this.logSecurityEvent('xss_protection_disabled', { url });
          }
          
          return response;
        })
        .catch(error => {
          // Log network security errors
          if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
            this.logSecurityEvent('cors_error', {
              url: url,
              error: error.message
            });
          }
          
          throw error;
        });
    };
    
    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this.addEventListener('load', () => {
        if (this.status === 403) {
          securityMonitor.logSecurityEvent('forbidden_xhr', {
            url: url,
            method: method
          });
        }
      });
      
      return originalXHROpen.apply(this, [method, url, ...args]);
    };
  }

  // Monitor DOM mutations
  monitorDOMMutations() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for suspicious elements
              if (node.tagName === 'SCRIPT') {
                const src = node.src || 'inline';
                this.logSecurityEvent('script_injection_attempt', {
                  src: src,
                  inline: !node.src
                });
              }
              
              // Check for suspicious iframes
              if (node.tagName === 'IFRAME') {
                this.logSecurityEvent('iframe_injection_attempt', {
                  src: node.src
                });
              }
            }
          });
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Get security report
  getSecurityReport() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > last24Hours);
    
    const report = {
      summary: {
        totalEvents: recentEvents.length,
        uniqueTypes: [...new Set(recentEvents.map(e => e.type))].length,
        criticalEvents: recentEvents.filter(e => this.isCriticalEvent(e.type)).length
      },
      byType: {},
      timeline: this.generateTimeline(recentEvents),
      topPatterns: this.analyzePatterns(recentEvents)
    };
    
    // Group by type
    recentEvents.forEach(event => {
      if (!report.byType[event.type]) {
        report.byType[event.type] = {
          count: 0,
          events: []
        };
      }
      
      report.byType[event.type].count++;
      report.byType[event.type].events.push(event);
    });
    
    return report;
  }

  // Generate timeline of events
  generateTimeline(events) {
    const hourlyBuckets = {};
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
    });
    
    return hourlyBuckets;
  }

  // Analyze patterns in security events
  analyzePatterns(events) {
    const patterns = {
      repeatedAttempts: {},
      suspiciousUserAgents: [],
      targetedUrls: {}
    };
    
    // Find repeated attempts from same session
    const sessionGroups = {};
    events.forEach(event => {
      const key = `${event.sessionId}:${event.type}`;
      sessionGroups[key] = (sessionGroups[key] || 0) + 1;
    });
    
    Object.entries(sessionGroups).forEach(([key, count]) => {
      if (count > 3) {
        const [sessionId, type] = key.split(':');
        patterns.repeatedAttempts[type] = patterns.repeatedAttempts[type] || [];
        patterns.repeatedAttempts[type].push({ sessionId, count });
      }
    });
    
    // Check for suspicious user agents
    const botPatterns = /bot|crawler|spider|scraper/i;
    events.forEach(event => {
      if (botPatterns.test(event.userAgent)) {
        patterns.suspiciousUserAgents.push(event.userAgent);
      }
    });
    
    // Find targeted URLs
    const urlCounts = {};
    events.forEach(event => {
      urlCounts[event.url] = (urlCounts[event.url] || 0) + 1;
    });
    
    Object.entries(urlCounts).forEach(([url, count]) => {
      if (count > 5) {
        patterns.targetedUrls[url] = count;
      }
    });
    
    return patterns;
  }

  // Store recent events in session storage
  storeRecentEvents() {
    const recentEvents = this.events.slice(-50);
    
    try {
      sessionStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (e) {
      // Storage might be full
      console.warn('Failed to store security events:', e);
    }
  }

  // Register alert callback
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  // Check if event is critical
  isCriticalEvent(eventType) {
    const criticalTypes = [
      'xss_script_blocked',
      'csrf_validation_failed',
      'script_injection_attempt',
      'iframe_injection_attempt'
    ];
    
    return criticalTypes.includes(eventType);
  }

  // Show security notification
  showSecurityNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'security-notification';
    notification.innerHTML = `
      <div class="security-notification-content">
        <i class="fas fa-shield-alt"></i>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles
    this.addNotificationStyles();
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 10000);
  }

  // Add notification styles
  addNotificationStyles() {
    if (document.getElementById('security-notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'security-notification-styles';
    style.textContent = `
      .security-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #fff3cd;
        color: #856404;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10001;
        animation: slideUp 0.3s ease-out;
        max-width: 350px;
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .security-notification.fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }
      
      .security-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .security-notification-content i {
        font-size: 20px;
      }
      
      .security-notification-content p {
        margin: 0;
        flex: 1;
      }
      
      .security-notification-content button {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Start periodic reporting
  startPeriodicReporting() {
    // Report to console every 5 minutes in development
    if (this.isDevelopment()) {
      setInterval(() => {
        const report = this.getSecurityReport();
        if (report.summary.totalEvents > 0) {
          console.log('[Security Report]', report);
        }
      }, 300000);
    }
    
    // Clean old events every hour
    setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      this.events = this.events.filter(e => e.timestamp > cutoff);
    }, 3600000);
  }

  // Helper methods
  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    return sessionStorage.getItem('session_id') || 'unknown';
  }

  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('.local');
  }

  // Export events for analysis
  exportEvents() {
    const data = {
      exported: new Date().toISOString(),
      events: this.events,
      report: this.getSecurityReport()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const securityMonitor = new SecurityMonitor();

// Register alert handler
securityMonitor.onAlert((alert) => {
  console.error('[SECURITY ALERT]', alert);
  
  // Could send to external monitoring service here
  // Example: sendToMonitoringService(alert);
});

// Attach to window for access
window.securityMonitor = securityMonitor;

// Add console command for security report
console.log('%c🔒 Security Monitor Active', 'color: green; font-weight: bold');
console.log('Get security report: securityMonitor.getSecurityReport()');
console.log('Export events: securityMonitor.exportEvents()');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityMonitor;
}