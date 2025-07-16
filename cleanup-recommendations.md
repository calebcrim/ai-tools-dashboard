# Codespace Cleanup Recommendations

## Safe to Delete (High Confidence)

### 1. Test & Debug Files
```bash
# Test HTML files
rm debug-enhanced.html
rm test-data-loading.html
rm test-dual-view.html
rm visual-annotations.html

# Diagnostic JavaScript
rm js/autocomplete-diagnostic.js
```

### 2. Temporary Fix Files
```bash
rm fix-data-loading.js
rm temp-tools-data.js
```

### 3. Backup Files
```bash
# Old backup files (keeping newest just in case)
rm data/unified-tools-data.backup.1751536813871.js
rm data/unified-tools-data.backup.1751536839176.js
rm data/unified-tools-data.backup.1751536906808.js
```

### 4. Development Documentation
```bash
# Claude prompts and architecture docs
rm claude-code-architecture-fix.md
rm claude-code-fix-v2-prompt.md
rm claude-code-prompts.md
```

### 5. Old Versions & Mockups
```bash
rm index.new.html
rm optimized-dashboard-mockup.html
```

### 6. Data Processing Scripts (if data migration is complete)
```bash
rm analyze-missing-data.js
rm clean-citations.js
rm missing-data-fields-part2.js
```

### 7. Python Scripts (if not using Python anymore)
```bash
rm extract_pdf.py
rm extract_tools_improved.py
rm parse_pdf_tools.py
```

### 8. Log Files
```bash
rm server.log
```

## Review Before Deleting (Medium Confidence)

These might still be in use - check your main HTML files first:

### CSS Fix Files
- `css/autocomplete-stacking-fix.css`
- `css/z-index-fixes.css`
- `css/comparison-fixes.css`

Check if these are imported in any HTML files:
```bash
grep -r "autocomplete-stacking-fix\|z-index-fixes\|comparison-fixes" *.html
```

### Duplicate Components
Check which search/filter components are actually being used:
```bash
# Check which components are imported
grep -r "enhanced-search-bar\|search-bar-integration\|header-search-autocomplete" *.html
grep -r "compressed-filter-bar\|unified-filter-bar" *.html
```

## Keep For Now

1. **All main HTML files** (index.html, unified-dashboard.html, etc.)
2. **Core JavaScript** in js/ directory
3. **All CSS** that's actively imported
4. **Data files** in data/ directory
5. **Components** that are actively imported
6. **Images** and assets
7. **Documentation** like README.md

## Cleanup Script

Here's a safe cleanup script that only removes high-confidence items:

```bash
#!/bin/bash
# Safe cleanup script - only removes clearly unnecessary files

echo "Removing test and debug files..."
rm -f debug-enhanced.html test-data-loading.html test-dual-view.html visual-annotations.html
rm -f js/autocomplete-diagnostic.js

echo "Removing temporary files..."
rm -f fix-data-loading.js temp-tools-data.js

echo "Removing old backups (keeping most recent)..."
rm -f data/unified-tools-data.backup.175153*.js

echo "Removing development docs..."
rm -f claude-code-*.md

echo "Removing old versions..."
rm -f index.new.html optimized-dashboard-mockup.html

echo "Removing data processing scripts..."
rm -f analyze-missing-data.js clean-citations.js missing-data-fields-part2.js

echo "Removing Python scripts..."
rm -f *.py

echo "Removing log files..."
rm -f server.log

echo "Cleanup complete!"
echo "Space saved: $(du -sh . | cut -f1)"
```

## Before Running Cleanup

1. **Make a backup** of your entire repository
2. **Check active imports** in your HTML files
3. **Verify your site works** after cleanup
4. **Consider archiving** instead of deleting if unsure

## Space Analysis

Current space usage by directory:
```bash
du -sh */ | sort -hr
```

This will show you which directories use the most space.