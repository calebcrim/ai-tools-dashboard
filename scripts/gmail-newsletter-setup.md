# Gmail Newsletter Processing Setup Instructions

## Overview
The updated `email-to-newsfeed-gmail.js` script now supports processing newsletters from your contacts.csv file, automatically applies Gmail labels, and includes smart content filtering to extract only high-quality news items.

## Setup Requirements

### 1. Gmail Configuration
- Ensure you have a Gmail app password set up
- Set the environment variable: `export GMAIL_APP_PASSWORD="your-app-password"`
- Create the "AI-Newsletters" label in Gmail (the script will remind you if it doesn't exist)

### 2. Data Files
The script expects these files in the project root:
- `contacts.csv` - Contains newsletter sender email addresses
- `AI Subscriptions.xlsx` - Contains newsletter subscription information (currently not parsed but reserved for future use)

### 3. Running the Script

```bash
# Navigate to scripts directory
cd scripts

# Run the script
node email-to-newsfeed-gmail.js
```

## Features Added

1. **Enhanced Newsletter Detection**
   - Parses contacts.csv to extract 79+ newsletter sender emails
   - Maintains backward compatibility with legacy newsletters (Ben's Bites, TLDR, etc.)
   - Identifies newsletters by exact email match or domain patterns

2. **Gmail Label Management**
   - Automatically applies "AI-Newsletters" label to identified newsletters
   - Shows warning if label doesn't exist (must be created manually in Gmail)

3. **Smart Content Filtering**
   - Removes navigation elements ("It's a map", "Click here", etc.)
   - Filters out subscription prompts and trial offers
   - Eliminates welcome messages and onboarding content
   - Excludes meta content like "In this issue:" headers
   - Removes author signatures and boilerplate text
   - Quality scoring system evaluates each item (0-100 score)
   - Preserves short but valid headlines (e.g., "GPT 4", company names)

4. **Improved Error Handling**
   - Gracefully handles missing contacts.csv file
   - Falls back to legacy newsletter list if data files are unavailable
   - Provides clear error messages for missing credentials

5. **Enhanced Reporting**
   - Shows total number of monitored newsletter sources
   - Generates detailed processing report in `newsfeed/newsletter-report.json`
   - Displays count of emails that were labeled
   - Reports pre-filter and post-filter item counts

## Output Files

The script generates:
- `/newsfeed/index.html` - HTML version of the aggregated newsletter
- `/newsfeed/data.json` - JSON data of extracted news items
- `/newsfeed/newsletter-report.json` - Processing statistics and summary

## Troubleshooting

1. **"Could not apply label" warnings**
   - Ensure the "AI-Newsletters" label exists in Gmail
   - Gmail IMAP has limited label management capabilities

2. **No newsletters found**
   - Check that emails are in INBOX or [Gmail]/All Mail
   - Verify sender addresses match those in contacts.csv
   - Try running without date restrictions (script does this automatically)

3. **Authentication errors**
   - Verify GMAIL_APP_PASSWORD is set correctly
   - Ensure 2-factor authentication is enabled on your Gmail account
   - Check that the app password has mail access permissions

## Configuration Options

The script includes configurable filtering options in the `config.filtering` object:

```javascript
filtering: {
  enableSmartFiltering: true,    // Toggle smart filtering on/off
  minContentLength: 50,          // Minimum characters for valid content
  minQualityScore: 60,          // Minimum quality score (0-100)
  preserveShortHeadlines: true, // Keep short but valid headlines
  debugMode: false,             // Enable detailed filtering logs
  customBlacklist: [],          // Add custom patterns to exclude
  customWhitelist: []           // Add custom patterns to always include
}
```

### Debugging Filters

To see what's being filtered and why:
1. Set `debugMode: true` in the config
2. Run the script to see detailed filtering statistics
3. Check which filter categories are removing the most items

## Future Enhancements

1. Parse AI Subscriptions.xlsx for additional metadata
2. Implement Gmail API for better label management
3. Add duplicate detection for cross-posted content
4. Support for newsletter unsubscribe management
5. Machine learning-based content relevance scoring
6. Customizable filter rules per newsletter source