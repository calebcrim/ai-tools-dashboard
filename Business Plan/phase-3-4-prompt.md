# Claude Code Prompts for Remaining Phases

## Phase 3: Security Implementation

```
Excellent work on analytics and SEO! Now please implement Phase 3 (Security) from Business Plan/security-implementation.md.

Focus on these security features:
1. Input Sanitization (js/security/input-sanitizer.js)
   - Sanitize search queries
   - Clean filter inputs  
   - Prevent XSS in dynamic content
   
2. XSS Prevention (js/security/xss-prevention.js)
   - Safe rendering of tool cards
   - Secure dynamic HTML generation
   - Escape user-provided content

3. CSRF Protection (js/security/csrf-protection.js)
   - Generate tokens for forms
   - Validate on submission
   
4. Rate Limiting (js/security/rate-limiter.js)
   - Limit search queries (10 per minute)
   - Prevent rapid filter changes
   - Track by session

5. Security Monitoring (js/security/security-monitor.js)
   - Log XSS attempts
   - Track suspicious patterns
   - Monitor failed requests

Remember: 
- Don't implement security headers (netlify.toml handles those)
- Test with inputs like <script>alert('test')</script>
- Ensure legitimate use isn't blocked
- Add console warnings for blocked attempts
```

## Phase 4: Feature Enhancements

```
Great security implementation! Now let's add Phase 4 features from implementation-checklist.md:

1. Performance Optimizations:
   - Lazy Loading: Load tool cards as user scrolls (IntersectionObserver)
   - Search Debouncing: 300ms delay on search input
   - Local Storage Caching: Cache tool data for 1 hour
   
2. User Experience:
   - Recently Viewed Tools: Track last 10 viewed tools in localStorage
   - Show "Recently Viewed" section on homepage
   - Shareable URLs: Make comparison URLs copyable
   - Smooth scroll animations

3. Search Enhancements:
   - Autocomplete: Show top 5 matching tools as user types
   - Search suggestions: "Did you mean..." for typos
   - Highlight search terms in results
   
4. Export Features:
   - Export Comparisons to PDF using jsPDF
   - Download tool data as CSV
   - Print-friendly comparison view

5. Email Capture:
   - Newsletter signup form using Netlify Forms
   - Lead magnet: "2025 AI Tools Guide" PDF
   - Exit-intent popup (tasteful, once per session)

6. Premium Features Preview:
   - Show locked features with upgrade prompt
   - "Unlock unlimited comparisons" 
   - "Export to PDF - Premium only"

Focus on user value and conversion optimization!
```

## Quick Test Commands After Each Phase

### After Phase 3 (Security):
```javascript
// Test in browser console:

// Test XSS prevention
document.querySelector('#search-input').value = '<script>alert("xss")</script>';
document.querySelector('#search-input').dispatchEvent(new Event('input'));

// Check sanitization
console.log('Sanitizer loaded:', typeof sanitizer !== 'undefined');

// Test rate limiting
for(let i = 0; i < 15; i++) {
  fetch('/api/search?q=test');
}
```

### After Phase 4 (Features):
```javascript
// Test lazy loading
console.log('Visible tool cards:', document.querySelectorAll('.tool-card:not(.lazy)').length);

// Check recently viewed
console.log('Recently viewed:', localStorage.getItem('recentlyViewed'));

// Test debouncing
console.log('Search debounced:', window.searchDebounceTimer !== undefined);
```

## Final Integration Test

```
After completing both phases, please run a full integration test:

1. Clear all browser data
2. Load the homepage
3. Accept cookie consent
4. Search for "AI writing" (should debounce)
5. Click on 3 different tools
6. Check "Recently Viewed" section appears
7. Try XSS: <img src=x onerror=alert('xss')>
8. Create a tool comparison
9. Try to export to PDF
10. Sign up for newsletter

Verify:
- No XSS vulnerabilities
- Analytics events firing
- Performance stays fast
- Features work smoothly
- Security monitoring logs attempts

Great job building a professional AI tools platform!
```