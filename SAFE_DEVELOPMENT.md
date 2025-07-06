# Safe Development Practices

## Current Stable Version
- **Tag**: v1.1-stable
- **Features**: Compressed filter bar, 317 tools, category fixes
- **Last Updated**: 2025-07-05

## Recovery Commands

### If something breaks, restore to stable version:
```bash
git checkout v1.1-stable
git checkout -b main-recovery
```

### View what changed since stable:
```bash
git diff v1.1-stable..HEAD
```

## Safe Development Workflow

### 1. Always Create a Feature Branch
```bash
# Start new feature
git checkout main
git checkout -b feature/description-of-change

# Example:
git checkout -b feature/add-export-pdf
git checkout -b fix/search-not-working
```

### 2. Test Your Changes
- Open http://localhost:8000
- Test all major features:
  - [ ] Search functionality
  - [ ] Filter badges (Media, Assistants, Google)
  - [ ] Category dropdown
  - [ ] Tool cards display
  - [ ] Virtual scrolling
  - [ ] Dark theme intact

### 3. Commit Frequently
```bash
# Save your progress often
git add -A
git commit -m "Work in progress: describe what you did"
```

### 4. Merge Only When Ready
```bash
# When everything works
git checkout main
git merge feature/your-branch-name

# Create a new stable tag if it's a major feature
git tag -a v1.2-stable -m "Description of what's new"
```

### 5. Abandon If Broken
```bash
# If things went wrong
git checkout main
git branch -D feature/broken-branch
```

## Quick Backup Before Risky Changes

```bash
# Create a quick backup branch
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git checkout main
```

## Testing Checklist

Before merging any changes to main:

1. **UI Components**
   - [ ] Compressed filter bar loads
   - [ ] Search works
   - [ ] Filters work
   - [ ] Tool count is correct (317)

2. **Data Integrity**
   - [ ] All tools load
   - [ ] Categories are lowercase
   - [ ] No duplicate tools

3. **Performance**
   - [ ] Virtual scroll works
   - [ ] No console errors
   - [ ] Page loads quickly

## Emergency Rollback

If main branch is broken:
```bash
# Option 1: Reset to stable tag
git checkout main
git reset --hard v1.1-stable

# Option 2: Restore specific files
git checkout v1.1-stable -- scripts.js
git checkout v1.1-stable -- index.html
```

## Important Files to Never Break

Critical files for functionality:
- `index.html` - Main dashboard structure
- `scripts.js` - Core functionality
- `data/unified-tools-data.js` - Tool database
- `components/compressed-filter-bar.js` - Filter system
- `css/compressed-filter-bar.css` - Filter styling

Always test changes to these files thoroughly!