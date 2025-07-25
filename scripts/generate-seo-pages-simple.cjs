/**
 * Simple SEO page generator that creates a redirect template
 * This approach uses Netlify's _redirects file instead of generating individual pages
 */

const fs = require('fs');
const path = require('path');

// Create a catch-all HTML template for AI tools
const seoTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Tool - Loading | CriminTel.ai</title>
    <meta name="description" content="Loading AI tool information...">
    
    <!-- This page will be replaced by JavaScript -->
    <script>
        // Extract tool slug from URL
        const path = window.location.pathname;
        const slug = path.split('/').pop();
        
        // Store for app to use
        window.__INITIAL_ROUTE__ = path;
        
        // Redirect to unified dashboard with the path
        if (!window.location.href.includes('unified-dashboard.html')) {
            // This will trigger the Netlify redirect rule
            window.location.href = '/unified-dashboard.html' + window.location.pathname;
        }
    </script>
</head>
<body>
    <div style="text-align: center; padding: 2rem; font-family: sans-serif;">
        <h1>Loading AI Tool...</h1>
        <p>Please wait while we load the tool information.</p>
        <p><a href="/unified-dashboard.html">View all AI tools</a></p>
    </div>
</body>
</html>`;

// Create the ai-tools directory and template
const outputDir = path.join(__dirname, '../ai-tools');

try {
    // Create directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('Created ai-tools directory');
    }
    
    // Create a catch-all template
    fs.writeFileSync(path.join(outputDir, '_template.html'), seoTemplate);
    console.log('Created SEO template');
    
    // Create index redirect
    const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/unified-dashboard.html">
    <title>AI Tools Dashboard | CriminTel.ai</title>
</head>
<body>
    <p>Redirecting to AI Tools Dashboard...</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexContent);
    console.log('Created index redirect');
    
    console.log('✅ SEO setup complete!');
    
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}