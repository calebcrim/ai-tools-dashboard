#!/bin/bash
# Cleanup script for old HTML pages that have been replaced by unified-dashboard

echo "🧹 Archiving old HTML pages..."
echo "Current directory size: $(du -sh . | cut -f1)"

# Create archive directory if it doesn't exist
mkdir -p archive/old-pages

# Archive old dual-view pages (replaced by unified dashboard)
echo "📄 Archiving dual-view pages..."
mv dual-view-enhanced.html archive/old-pages/ 2>/dev/null
mv dual-view-simple.html archive/old-pages/ 2>/dev/null

# Archive enterprise pages (replaced by unified dashboard)
echo "📊 Archiving enterprise pages..."
mv enterprise-dashboard.html archive/old-pages/ 2>/dev/null
mv enterprise-report.html archive/old-pages/ 2>/dev/null

# Archive SaaS financial analysis (replaced by financial-analysis/index.html)
echo "💰 Archiving old financial analysis..."
mv saas-financial-analysis.html archive/old-pages/ 2>/dev/null

# Archive old navigation pages
echo "🗺️ Archiving old navigation pages..."
mv newsfeed.html archive/old-pages/ 2>/dev/null  # Replaced by newsfeed/newsletter.html

# Archive related CSS files
echo "🎨 Archiving related CSS files..."
mv css/dual-view-enhanced.css archive/old-pages/ 2>/dev/null
mv css/dual-view-complete.css archive/old-pages/ 2>/dev/null
mv css/dual-view-mobile.css archive/old-pages/ 2>/dev/null
mv css/enterprise-dashboard.css archive/old-pages/ 2>/dev/null
mv css/enterprise-report.css archive/old-pages/ 2>/dev/null
mv css/enterprise-report-mobile.css archive/old-pages/ 2>/dev/null

# Archive related JS files
echo "📜 Archiving related JS files..."
mv js/dual-view-enhanced.js archive/old-pages/ 2>/dev/null
mv js/enterprise-dashboard.js archive/old-pages/ 2>/dev/null
mv js/enterprise-dashboard-fixed-clean.js archive/old-pages/ 2>/dev/null

echo ""
echo "✅ Old pages archived!"
echo "New directory size: $(du -sh . | cut -f1)"
echo ""
echo "📦 Files archived to: archive/old-pages/"
echo ""
echo "⚠️  Note: index.html still contains links to these old pages in its navigation."
echo "The index.html redirects to unified-dashboard.html, so users won't see those links."
echo "However, you may want to update index.html navigation to match unified-dashboard.html"