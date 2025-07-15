# Newsletter Manual System Guide

## Overview

The AI Newsletter system has been refactored from an automated GitHub Actions-based approach to a manual file-based system for improved reliability and control.

## System Architecture

### File Storage
- **Location**: `data/Newsletters/`
- **Format**: Plain text files with markdown formatting
- **Naming Convention**: `MM-DD-YYYY.txt` (e.g., `7-15-2025.txt`)

### File Structure

Each newsletter file follows this format:

```markdown
### [Newsletter Source Name]
**Date:** [Date]  
**Source:** [Email/Source]  

**AI Highlights:**

- **[Headline]**  
  *Category:* [Category Type]  
  *Tags:* [#Tag1, #Tag2, #Tag3]  
  [1-2 sentence summary]  
  [Source URL]

- **[Another Headline]**  
  *Category:* [Category Type]  
  *Tags:* [#Tag1, #Tag2]  
  [Summary]  
  [URL]

---

### [Another Newsletter Source]
**Date:** [Date]  
**Source:** [Email]  

**AI Highlights:**

[... more items ...]

---
```

## Categories

Standard categories for organizing news items:
- `Research / Paper`
- `Product / Tool`
- `Company News`
- `Policy / Ethics`
- `Funding / Investment`
- `Industry Trends`
- `Technical Breakthrough`
- `Open Source`

## How to Use

### 1. Adding a New Newsletter

1. Create a new text file in `data/Newsletters/`
2. Name it using the format: `MM-DD-YYYY.txt`
3. Copy content following the structure above
4. Save the file

### 2. Updating the Newsletter List

After adding new newsletters, run:

```bash
node scripts/generate-newsletter-list.js
```

This generates JSON files that the frontend uses to know which newsletters are available.

### 3. Managing Newsletter Files

Use the newsletter file manager utility:

```bash
# List all newsletters
node scripts/newsletter-file-manager.js list

# Validate newsletter files
node scripts/newsletter-file-manager.js validate
node scripts/newsletter-file-manager.js validate 7-15-2025.txt

# Show statistics
node scripts/newsletter-file-manager.js stats

# Create a sample file
node scripts/newsletter-file-manager.js sample
```

### 4. Viewing Newsletters

Navigate to: `/newsfeed/newsletter.html`

Features:
- Date navigation with dropdown and prev/next buttons
- Category filtering
- Responsive design
- Dark mode support

## Benefits of Manual System

1. **Reliability**: No dependency on external APIs or automation
2. **Control**: Full editorial control over content
3. **Quality**: Manual curation ensures accuracy
4. **Simplicity**: Easy to debug and maintain
5. **Performance**: Static files load faster
6. **Flexibility**: Easy to edit or update past newsletters

## Workflow

### Daily Newsletter Process

1. **Collect**: Gather AI newsletters from various sources
2. **Extract**: Pull out key highlights and developments
3. **Format**: Structure content following the template
4. **Save**: Create new file with today's date
5. **Update**: Run `generate-newsletter-list.js`
6. **Commit**: Push changes to repository

### Example Workflow

```bash
# 1. Create today's newsletter
cd data/Newsletters/
nano 7-16-2025.txt

# 2. Add content following the template
# ... edit and save ...

# 3. Validate the file
node ../../scripts/newsletter-file-manager.js validate 7-16-2025.txt

# 4. Update the list
node ../../scripts/generate-newsletter-list.js

# 5. Commit changes
git add .
git commit -m "Add newsletter for July 16, 2025"
git push
```

## Troubleshooting

### Newsletter Not Showing Up

1. Check filename format (MM-DD-YYYY.txt)
2. Validate file content: `node scripts/newsletter-file-manager.js validate [filename]`
3. Regenerate list: `node scripts/generate-newsletter-list.js`
4. Check browser console for errors

### Validation Errors

Common issues:
- Missing `### ` source headers
- Missing `**AI Highlights:**` section
- Incorrect markdown formatting
- Invalid date format

### Performance Issues

If loading many newsletters:
1. Consider pagination (future enhancement)
2. Implement lazy loading
3. Cache parsed content

## Future Enhancements

Potential improvements:
- Search functionality across all newsletters
- RSS feed generation
- Email subscription system
- Newsletter analytics
- Automated backup system
- Import/export tools
- Tag cloud visualization

## Migration from Old System

The old automated system files have been removed:
- GitHub Actions workflows
- Email fetching scripts
- IMAP connection utilities

The new system is completely self-contained and requires no external dependencies or credentials.