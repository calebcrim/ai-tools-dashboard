# Newsletter Page Architecture Changes

## Overview
Transitioning from automated GitHub Actions-based newsletter aggregation to a manual upload system for better reliability and control.

## Current System (To Be Replaced)
- GitHub Actions scripts attempting to automatically fetch and parse AI newsletters
- Unreliable automation causing missed updates and parsing errors
- Complex dependencies on external APIs and email services
- Difficult to debug when failures occur

## New System Architecture

### 1. File-Based Storage
- **Location**: `data/Newsletters/` directory in the repository
- **Format**: Plain text files with markdown formatting
- **Naming Convention**: `MM-DD-YYYY.txt` (e.g., `7-15-2025.txt`)
- **Manual Process**: Daily upload of curated newsletter content

### 2. Newsletter File Structure
Each newsletter file will contain:
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

---
```

### 3. Frontend Changes Required

#### A. Newsletter Loader Component
- Remove all GitHub Actions integration code
- Create new file system reader to scan `data/Newsletters/` directory
- Parse filenames to extract dates
- Sort newsletters by date (newest first)

#### B. Display Components
- Newsletter list view showing all available newsletters
- Individual newsletter viewer with proper markdown rendering
- Category and tag filtering capabilities
- Date-based navigation (calendar picker or archive list)

#### C. Error Handling
- Handle missing files gracefully
- Validate file format before displaying
- Show user-friendly error messages
- Fallback to "No newsletters available" state

### 4. Benefits of New Architecture
- **Reliability**: No dependency on external automation
- **Control**: Manual curation ensures quality
- **Simplicity**: Easy to debug and maintain
- **Flexibility**: Can easily edit or update past newsletters
- **Performance**: Static files load faster than API calls

### 5. Migration Steps
1. Remove all GitHub Actions workflow files related to newsletters
2. Remove automated email fetching code
3. Implement new file-based loader
4. Update UI components to work with new data structure
5. Add navigation and filtering features
6. Test with existing sample file (`7-15-2025.txt`)

### 6. Future Enhancements (Optional)
- Search functionality across all newsletters
- RSS feed generation from newsletter files
- Email subscription system
- Automated backup system
- Newsletter analytics (most viewed, etc.)