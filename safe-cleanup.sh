#!/bin/bash
# Safe cleanup script for AI Tools Dashboard
# Only removes files that are definitely not in use

echo "🧹 Starting safe cleanup..."
echo "Current directory size: $(du -sh . | cut -f1)"

# Create archive directory for backup
mkdir -p archive/old-files

# 1. Test and debug HTML files (NOT imported anywhere)
echo "📄 Archiving test files..."
mv debug-enhanced.html archive/old-files/ 2>/dev/null
mv test-data-loading.html archive/old-files/ 2>/dev/null
mv test-dual-view.html archive/old-files/ 2>/dev/null
mv visual-annotations.html archive/old-files/ 2>/dev/null

# 2. Old versions and mockups
echo "📐 Archiving old versions..."
mv index.new.html archive/old-files/ 2>/dev/null
mv optimized-dashboard-mockup.html archive/old-files/ 2>/dev/null

# 3. Development documentation
echo "📚 Archiving development docs..."
mv claude-code-*.md archive/old-files/ 2>/dev/null

# 4. Old backup files (keep the most recent one)
echo "💾 Cleaning old backups..."
mv data/unified-tools-data.backup.175153681*.js archive/old-files/ 2>/dev/null
mv data/unified-tools-data.backup.175153683*.js archive/old-files/ 2>/dev/null
mv data/unified-tools-data.backup.175153690*.js archive/old-files/ 2>/dev/null

# 5. Python scripts (if not using Python)
echo "🐍 Archiving Python scripts..."
mv *.py archive/old-files/ 2>/dev/null

# 6. Data processing scripts
echo "🔧 Archiving data processing scripts..."
mv analyze-missing-data.js archive/old-files/ 2>/dev/null
mv clean-citations.js archive/old-files/ 2>/dev/null
mv missing-data-fields-part2.js archive/old-files/ 2>/dev/null

# 7. Log files
echo "📝 Removing log files..."
rm -f server.log

# 8. Temporary files
echo "🗑️ Removing temp files..."
rm -f temp-tools-data.js

echo ""
echo "✅ Cleanup complete!"
echo "New directory size: $(du -sh . | cut -f1)"
echo ""
echo "📦 Files archived to: archive/old-files/"
echo "You can safely delete the archive folder after verifying everything works."