# AI Tools Documentation Structure

## Directory Structure
```
ai-tools-documentation/
├── README.md                    # Project overview and navigation
├── config/
│   ├── categories.json         # Tool categories and taxonomy
│   ├── data-schema.json        # Schema for tool data validation
│   └── update-config.json      # Configuration for batch updates
│
├── tools/                      # Individual tool documentation
│   ├── _template.md           # Template for new tools
│   ├── by-category/           # Tools organized by category
│   │   ├── llm/
│   │   │   ├── gpt-4.md
│   │   │   ├── claude.md
│   │   │   └── ...
│   │   ├── image-generation/
│   │   │   ├── midjourney.md
│   │   │   ├── dalle-3.md
│   │   │   └── ...
│   │   ├── code-assistance/
│   │   │   ├── github-copilot.md
│   │   │   ├── cursor.md
│   │   │   └── ...
│   │   └── ...
│   │
│   └── by-id/                 # Tools indexed by unique ID
│       ├── tool-001.json
│       ├── tool-002.json
│       └── ...
│
├── data/
│   ├── master-list.json       # Complete list of all 317 tools
│   ├── incomplete-data.json   # Track the 5% incomplete data
│   ├── update-log.json        # Track all updates made
│   └── validation-report.json # Data validation results
│
├── scripts/
│   ├── validate-data.js       # Validate tool data completeness
│   ├── generate-index.js      # Generate index files
│   ├── update-tool.js         # Update individual tool
│   └── batch-update.js        # Batch update operations
│
├── views/
│   ├── dual-view-config.json  # Dual view page configuration
│   ├── layouts/
│   │   ├── grid-layout.json
│   │   ├── list-layout.json
│   │   └── comparison-layout.json
│   └── filters/
│       ├── category-filters.json
│       ├── feature-filters.json
│       └── pricing-filters.json
│
└── docs/
    ├── update-guide.md        # How to update tools
    ├── data-standards.md      # Data format standards
    └── claude-code-usage.md   # Claude Code integration guide
```

## File Formats

### 1. Tool Data Schema (`config/data-schema.json`)
```json
{
  "tool": {
    "id": "string",
    "name": "string",
    "category": "string",
    "subcategory": "string",
    "description": "string",
    "features": ["array"],
    "pricing": {
      "model": "string",
      "tiers": ["array"]
    },
    "urls": {
      "website": "string",
      "documentation": "string",
      "api": "string"
    },
    "metadata": {
      "lastUpdated": "date",
      "dataCompleteness": "percentage",
      "verified": "boolean"
    }
  }
}
```

### 2. Individual Tool Template (`tools/_template.md`)
```markdown
# [Tool Name]

## Overview
- **ID**: tool-xxx
- **Category**: [Category]
- **Website**: [URL]
- **Last Updated**: [Date]
- **Data Completeness**: [XX%]

## Description
[Detailed description]

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Pricing
- **Model**: [Freemium/Subscription/Pay-per-use]
- **Tiers**:
  - Free: [Details]
  - Pro: [Details]
  - Enterprise: [Details]

## Integration
- API: [Yes/No]
- SDK: [Languages]
- Webhooks: [Yes/No]

## Use Cases
1. [Use case 1]
2. [Use case 2]
3. [Use case 3]

## Notes
[Any additional notes or caveats]
```

### 3. Master List Structure (`data/master-list.json`)
```json
{
  "metadata": {
    "totalTools": 317,
    "lastUpdated": "2024-01-XX",
    "dataCompleteness": "95%"
  },
  "tools": [
    {
      "id": "tool-001",
      "name": "GPT-4",
      "category": "llm",
      "quickInfo": {
        "pricing": "Pay-per-use",
        "apiAvailable": true,
        "primaryUseCase": "Text generation"
      }
    }
  ]
}
```

### 4. Update Configuration (`config/update-config.json`)
```json
{
  "updateRules": {
    "requireApproval": ["pricing", "features"],
    "autoUpdate": ["lastUpdated", "metadata"],
    "validation": {
      "enabled": true,
      "strictMode": false
    }
  },
  "batchOperations": {
    "maxBatchSize": 50,
    "allowPartialUpdates": true
  }
}
```

## Claude Code Integration

### Quick Commands for Claude Code
```bash
# Navigate to project
cd ai-tools-documentation

# Validate all data
node scripts/validate-data.js

# Update a specific tool
node scripts/update-tool.js --id tool-001 --field pricing.tiers

# Batch update multiple tools
node scripts/batch-update.js --category llm --field metadata.verified=true

# Generate updated index
node scripts/generate-index.js

# Check incomplete data
cat data/incomplete-data.json | jq '.tools[] | select(.dataCompleteness < 100)'
```

### Sample Update Workflow
```javascript
// scripts/update-tool.js
const fs = require('fs');
const path = require('path');

function updateTool(toolId, updates) {
    const toolPath = path.join('tools/by-id', `${toolId}.json`);
    const tool = JSON.parse(fs.readFileSync(toolPath, 'utf8'));
    
    // Apply updates
    Object.assign(tool, updates);
    tool.metadata.lastUpdated = new Date().toISOString();
    
    // Validate
    validateTool(tool);
    
    // Save
    fs.writeFileSync(toolPath, JSON.stringify(tool, null, 2));
    
    // Update master list
    updateMasterList(toolId, tool);
    
    // Log update
    logUpdate(toolId, updates);
}
```

## Data Completeness Tracking

### Incomplete Data Structure (`data/incomplete-data.json`)
```json
{
  "summary": {
    "totalIncomplete": 16,
    "percentageIncomplete": "5%",
    "byCategory": {
      "llm": 2,
      "image-generation": 3,
      "code-assistance": 1
    }
  },
  "tools": [
    {
      "id": "tool-042",
      "name": "ToolName",
      "missingFields": ["pricing.tiers", "urls.documentation"],
      "completeness": "75%"
    }
  ]
}
```

## Best Practices

1. **Modular Updates**: Each tool has its own file for independent updates
2. **Version Control**: All changes tracked in `update-log.json`
3. **Validation**: Run validation before committing changes
4. **Batch Operations**: Use batch scripts for category-wide updates
5. **Data Integrity**: Schema validation ensures consistency
6. **Documentation**: Keep docs updated with any structural changes

## Getting Started

1. Clone/upload this structure to your codespace
2. Run initial validation: `node scripts/validate-data.js`
3. Review incomplete data: `cat data/incomplete-data.json`
4. Start updating tools using Claude Code
5. Generate updated views: `node scripts/generate-index.js`