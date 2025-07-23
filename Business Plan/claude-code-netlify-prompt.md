# Claude Code Implementation Prompt (Netlify-Optimized)

## Context
I'm working on crimintel.ai - an AI Tools Intelligence Hub with 345 AI tools. The site is hosted on **Netlify** with domain from **GoDaddy**.

Read the implementation guides in `/Business Plan/` folder, plus use Netlify-specific features where applicable.

## Netlify-Specific Implementation

### Phase 1: Netlify Configuration
1. **Create `netlify.toml`** in root directory with:
   - Security headers (CSP, X-Frame-Options, etc.)
   - Redirect rules for clean URLs
   - Build settings
   - Caching rules

2. **Set up redirects** for:
   - Force HTTPS
   - Remove www
   - `/ai-tools/*` → client-side routing
   - `/category/*` → client-side routing

### Phase 2: Analytics (Netlify-Compatible)
Using `analytics-implementation.md`:
1. Add GA4 code using environment variable:
   ```javascript
   const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-PLACEHOLDER';
   ```
2. Implement all tracking from the guide
3. Consider adding Netlify Analytics snippet

### Phase 3: SEO with Netlify Features
1. Use Netlify's pretty URLs (automatic)
2. Generate `_redirects` file for any specific redirects
3. Create dynamic sitemap (can use Netlify post-processing)
4. Ensure meta tags work with Netlify's HTML processing

### Phase 4: Security via netlify.toml
Instead of JavaScript security headers, add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    Content-Security-Policy = "default-src 'self'..."
```

### Phase 5: Serverless Functions (Optional)
Create `netlify/functions/` directory for:
- Affiliate click tracking
- Email signup processing
- Advanced analytics

## Key Differences for Netlify

1. **Don't add security headers via JavaScript** - Use netlify.toml
2. **Use environment variables** from Netlify dashboard
3. **Leverage Netlify Forms** for email capture
4. **Use `_redirects` or netlify.toml** for URL management
5. **Test with `netlify dev`** locally

## Files to Create/Modify

### New Files:
- `/netlify.toml` - Main Netlify configuration
- `/_redirects` - Additional redirect rules (if needed)
- `/netlify/functions/` - Serverless functions directory
- All files from original implementation guides

### Implementation Order:
1. Create netlify.toml with headers and redirects
2. Implement analytics (Phase 1 from guides)
3. Add SEO features
4. Implement security (via netlify.toml, not JS)
5. Test with `netlify dev`

## Testing on Netlify
```bash
# Install Netlify CLI first
npm install -g netlify-cli

# Test locally with Netlify environment
netlify dev

# Deploy a preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

Please start by creating the netlify.toml file, then proceed with analytics implementation from the Business Plan guides.