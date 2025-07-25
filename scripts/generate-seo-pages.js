#!/usr/bin/env node

/**
 * Generate lightweight SEO-friendly static pages for AI tools
 * These pages provide basic HTML content for search engine crawlers
 * while the full interactive experience loads via JavaScript
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import tools data (we'll need to read it as the module exports window.unifiedToolsData)
const toolsDataPath = path.join(__dirname, '../data/unified-tools-data.js');
const toolsDataContent = await fs.readFile(toolsDataPath, 'utf8');

// Extract tools array from the file content
const toolsMatch = toolsDataContent.match(/tools:\s*\[([\s\S]*?)\s*\]\s*\}/);
if (!toolsMatch) {
  console.error('Could not parse tools data');
  process.exit(1);
}

// Parse the tools array
const tools = eval(`[${toolsMatch[1]}]`);

// Slugify function to match URL router
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate structured data for a tool
function generateStructuredData(tool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.tool_name,
    "url": tool.url,
    "description": tool.brief_purpose_summary || '',
    "applicationCategory": tool.category,
    "offers": tool.pricing_model ? {
      "@type": "Offer",
      "description": tool.pricing_model
    } : undefined,
    "featureList": tool.feature_breakdown ? 
      tool.feature_breakdown.split('\n').filter(f => f.trim()) : [],
    "softwareRequirements": tool.integration_potential || undefined
  };
}

// Generate meta tags for a tool
function generateMetaTags(tool) {
  const title = `${tool.tool_name} - AI Tool Review & Analysis | CriminTel.ai`;
  const description = tool.brief_purpose_summary ? 
    tool.brief_purpose_summary.slice(0, 155) : 
    `Discover ${tool.tool_name}, an AI tool in the ${tool.category} category. Get detailed analysis, pricing, and integration information.`;
  
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="https://crimintel.ai/ai-tools/${slugify(tool.tool_name)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CriminTel.ai">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://crimintel.ai/ai-tools/${slugify(tool.tool_name)}">
  `;
}

// Generate SEO-friendly HTML content
function generateSEOContent(tool) {
  const structuredData = generateStructuredData(tool);
  const metaTags = generateMetaTags(tool);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/data/unified-tools-data.js" as="script">
    <link rel="preload" href="/js/unified-dashboard.js" as="script">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/css/unified-dashboard.css">
    
    <style>
        /* Basic SEO content styling */
        .seo-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .seo-content h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .seo-meta {
            color: #666;
            margin-bottom: 2rem;
        }
        .seo-section {
            margin-bottom: 2rem;
        }
        .seo-section h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        .loading-message {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
    </style>
</head>
<body>
    <!-- SEO Content - Visible immediately for crawlers -->
    <div class="seo-content" id="seo-content">
        <h1>${tool.tool_name}</h1>
        <div class="seo-meta">
            <span>Category: ${tool.category}</span> | 
            <span><a href="${tool.url}" rel="noopener" target="_blank">Visit Official Website</a></span>
        </div>
        
        <div class="seo-section">
            <h2>Overview</h2>
            <p>${tool.brief_purpose_summary || 'Detailed information available in the interactive view.'}</p>
        </div>
        
        ${tool.feature_breakdown ? `
        <div class="seo-section">
            <h2>Key Features</h2>
            <ul>
                ${tool.feature_breakdown.split('\n')
                  .filter(f => f.trim())
                  .map(f => `<li>${f.trim()}</li>`)
                  .join('\n                ')}
            </ul>
        </div>
        ` : ''}
        
        ${tool.pricing_model ? `
        <div class="seo-section">
            <h2>Pricing</h2>
            <p>${tool.pricing_model}</p>
        </div>
        ` : ''}
        
        ${tool.use_cases_in_pr && tool.use_cases_in_pr.length > 0 ? `
        <div class="seo-section">
            <h2>Use Cases</h2>
            <ul>
                ${tool.use_cases_in_pr
                  .slice(0, 5)
                  .map(uc => `<li>${uc}</li>`)
                  .join('\n                ')}
            </ul>
        </div>
        ` : ''}
        
        <div class="loading-message">
            <p>Loading interactive features...</p>
        </div>
    </div>
    
    <!-- Main app container - will be populated by JavaScript -->
    <div id="app" style="display: none;"></div>
    
    <!-- Load the full app -->
    <script>
        // Store tool data for the app to use
        window.__INITIAL_TOOL_DATA__ = ${JSON.stringify({
            tool_name: tool.tool_name,
            slug: slugify(tool.tool_name)
        })};
        
        // Hide SEO content and show app when loaded
        window.addEventListener('DOMContentLoaded', function() {
            // The app will handle hiding SEO content when ready
            const checkApp = setInterval(() => {
                if (window.unifiedDashboard && window.router) {
                    clearInterval(checkApp);
                    document.getElementById('seo-content').style.display = 'none';
                    document.getElementById('app').style.display = 'block';
                }
            }, 100);
        });
    </script>
    
    <!-- Load unified dashboard app -->
    <script src="/data/unified-tools-data.js"></script>
    <script src="/js/seo/url-router.js"></script>
    <script src="/js/unified-dashboard.js"></script>
</body>
</html>`;
}

// Main function to generate all pages
async function generatePages() {
  const outputDir = path.join(__dirname, '../ai-tools');
  
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
    
    // Generate pages for each tool
    let successCount = 0;
    let errorCount = 0;
    
    for (const tool of tools) {
      try {
        if (!tool.tool_name) {
          console.warn(`Skipping tool without name:`, tool);
          continue;
        }
        
        const slug = slugify(tool.tool_name);
        const content = generateSEOContent(tool);
        const filePath = path.join(outputDir, `${slug}.html`);
        
        await fs.writeFile(filePath, content, 'utf8');
        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`Generated ${successCount} pages...`);
        }
      } catch (error) {
        console.error(`Error generating page for ${tool.tool_name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Generation complete!`);
    console.log(`   - Successfully generated: ${successCount} pages`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Output directory: ${outputDir}`);
    
    // Generate index file for /ai-tools/
    const indexContent = generateAIToolsIndex();
    await fs.writeFile(path.join(outputDir, 'index.html'), indexContent, 'utf8');
    console.log(`   - Generated AI tools index page`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Generate index page for /ai-tools/
function generateAIToolsIndex() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All AI Tools - Browse ${tools.length}+ AI Solutions | CriminTel.ai</title>
    <meta name="description" content="Browse our complete database of ${tools.length}+ AI tools. Find detailed reviews, pricing, and integration information for AI solutions across all categories.">
    
    <script>
        // Redirect to main dashboard
        window.location.href = '/unified-dashboard.html';
    </script>
</head>
<body>
    <p>Redirecting to AI Tools Dashboard...</p>
    <p><a href="/unified-dashboard.html">Click here if not redirected</a></p>
</body>
</html>`;
}

// Run the generator
generatePages().catch(console.error);

export { generatePages, generateSEOContent };