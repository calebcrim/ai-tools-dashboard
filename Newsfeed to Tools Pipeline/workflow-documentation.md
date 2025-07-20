# AI News to Tools Automation Workflow

## Overview

This automated workflow extracts AI tools from news articles and updates your tools database automatically. When you add a newsletter to your newsfeed, the system will:

1. **Extract** - Identify AI tools mentioned in the news
2. **Validate** - Check confidence levels and data quality
3. **Integrate** - Add new tools or update existing ones
4. **Update** - Refresh both the newsfeed and tools database

## Quick Start

### Basic Usage

```bash
# Process the most recent newsletter
./update-tools-from-news.sh latest

# Process a specific newsletter
./update-tools-from-news.sh process data/Newsletters/7-20-2025.txt

# Watch for new newsletters (auto-process)
./update-tools-from-news.sh watch
```

### Manual Review Mode

For important newsletters where you want to review extractions:

```bash
./update-tools-from-news.sh manual data/Newsletters/7-20-2025.txt
```

## How It Works

### 1. Tool Extraction

The system looks for patterns indicating new tools or updates:

- **Launch patterns**: "launches", "unveils", "introduces", "announces"
- **Update patterns**: "adds features", "updates", "enhances"
- **Business patterns**: "acquires", "raises funding", "partners with"

### 2. Confidence Scoring

Each extracted tool gets a confidence score based on:
- Headline mentions (high confidence)
- Presence of URLs
- AI-related keywords nearby
- Category detection

Tools with confidence < 70% are automatically filtered out.

### 3. Database Integration

**New Tools** are added with:
- Basic information from the article
- "To be researched" placeholders for detailed fields
- Extraction metadata for tracking

**Updates** are marked as:
- Fields needing verification
- Update history with source and date
- Context from the news article

## Configuration

Edit `config/news-extraction-config.json` to customize:

```json
{
  "extraction": {
    "confidence_threshold": 0.7,  // Minimum confidence to accept
    "patterns": {...},            // Extraction patterns
    "ai_keywords": [...]          // AI-related terms
  },
  "integration": {
    "auto_approve_confidence": 0.85,  // Auto-approve if >= this
    "backup_before_integration": true  // Always backup first
  }
}
```

## Workflow Commands

### Process Single Newsletter

```bash
node scripts/news-to-tools-workflow.js process <file>
```

### Process All Newsletters

```bash
node scripts/news-to-tools-workflow.js process-all
```

### Watch Mode (Continuous)

```bash
node scripts/news-to-tools-workflow.js watch
```

## Output Files

### Extraction Results
`data/extracted-tools-batch.json` - Raw extraction results

### Integration Reports
`data/reports/workflow-report-YYYY-MM-DD.json` - Daily summaries

### Database Backups
`data/backups/unified-tools-data.backup.*.js` - Automatic backups

## Example Workflow

1. **Add Newsletter**
   ```bash
   # Create new newsletter file
   node scripts/create-newsletter.js
   # Paste content, save with Ctrl+D
   ```

2. **Process Automatically**
   ```bash
   ./update-tools-from-news.sh latest
   ```

3. **Review Results**
   ```
   ✓ Found 3 potential new tools
   ✓ Found 2 potential updates
   ✓ Added new tool: ChatGPT Enterprise
   ✓ Updated: Claude 3
   ```

## Best Practices

### High-Quality Extractions

1. **Include Full Context** - Copy complete news items with all details
2. **Preserve URLs** - Keep all links in the newsletter
3. **Maintain Structure** - Use consistent formatting

### Manual Review When Needed

Review extractions manually for:
- Major product launches
- Significant updates to popular tools
- Low-confidence extractions you want to include

### Regular Maintenance

1. **Check Reports** - Review daily workflow reports
2. **Verify Updates** - Spot-check automated updates
3. **Research New Tools** - Fill in "To be researched" fields

## Troubleshooting

### No Tools Extracted

- Check if the newsletter contains AI-related content
- Verify the file format matches expected structure
- Lower confidence threshold in config if needed

### Integration Failures

- Check for database backup files
- Verify no duplicate tool names
- Review error logs in reports directory

### Performance Issues

- Process newsletters individually instead of bulk
- Increase confidence threshold to reduce false positives
- Clear old report files periodically

## Advanced Usage

### Custom Extraction Patterns

Add new patterns to the config:

```json
"patterns": {
  "custom_action": ["your", "patterns", "here"]
}
```

### API Integration

The workflow can be triggered via API:

```javascript
const workflow = require('./scripts/news-to-tools-workflow');
await workflow.processNewsletter(newsletterPath);
```

### Scheduled Processing

Add to crontab for automatic processing:

```bash
# Process new newsletters every 6 hours
0 */6 * * * /path/to/update-tools-from-news.sh process-all
```

## Next Steps

After implementing this workflow:

1. **Test** with your existing newsletters
2. **Adjust** confidence thresholds based on results
3. **Customize** extraction patterns for your sources
4. **Monitor** the quality of automated updates
5. **Iterate** based on what works best

The goal is to save time while maintaining data quality. Start with manual review mode and gradually move to full automation as you trust the results.