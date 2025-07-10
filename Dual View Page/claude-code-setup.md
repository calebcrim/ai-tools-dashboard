# Claude Code Setup & Usage Guide

## Initial Setup

### 1. Create the Directory Structure
```bash
# In your codespace terminal
mkdir -p ai-tools-documentation/{config,tools/{by-category/{llm,image-generation,code-assistance},by-id},data,scripts,views/{layouts,filters},docs}

# Create initial files
touch ai-tools-documentation/README.md
touch ai-tools-documentation/config/{categories.json,data-schema.json,update-config.json}
touch ai-tools-documentation/data/{master-list.json,incomplete-data.json,update-log.json}
touch ai-tools-documentation/tools/_template.md
```

### 2. Initialize with Sample Data
```bash
# Create a sample tool file
cat > ai-tools-documentation/tools/by-id/tool-001.json << 'EOF'
{
  "id": "tool-001",
  "name": "GPT-4",
  "category": "llm",
  "subcategory": "text-generation",
  "description": "Advanced language model by OpenAI",
  "features": ["Text generation", "Code completion", "Analysis"],
  "pricing": {
    "model": "Pay-per-use",
    "tiers": [
      {"name": "GPT-4", "price": "$0.03/1K tokens"},
      {"name": "GPT-4-32k", "price": "$0.06/1K tokens"}
    ]
  },
  "urls": {
    "website": "https://openai.com",
    "documentation": "https://platform.openai.com/docs",
    "api": "https://api.openai.com"
  },
  "metadata": {
    "lastUpdated": "2024-01-20",
    "dataCompleteness": 100,
    "verified": true
  }
}
EOF
```

## Claude Code Commands

### Essential Commands for Updates

```bash
# 1. Find tools with incomplete data
claude-code "Find all tools in ai-tools-documentation/data/incomplete-data.json with completeness < 100% and list their missing fields"

# 2. Update a specific tool
claude-code "Update tool-042 in ai-tools-documentation/tools/by-id/tool-042.json with pricing tiers: Free ($0), Pro ($29/mo), Enterprise (custom)"

# 3. Batch update by category
claude-code "Update all tools in ai-tools-documentation/tools/by-category/llm/ to set metadata.verified = true"

# 4. Generate category summary
claude-code "Analyze all tools in ai-tools-documentation/tools/by-category/ and create a summary of tools per category"

# 5. Validate data structure
claude-code "Check all JSON files in ai-tools-documentation/tools/by-id/ against the schema in config/data-schema.json"
```

### Advanced Workflows

#### Workflow 1: Complete Missing Data
```bash
# Step 1: Identify incomplete tools
claude-code "List all tools from incomplete-data.json with their missing fields in a table format"

# Step 2: Research and update
claude-code "For tool-042, research and add the missing pricing.tiers and urls.documentation fields"

# Step 3: Update completeness
claude-code "Recalculate dataCompleteness for tool-042 and update both the tool file and incomplete-data.json"

# Step 4: Log the update
claude-code "Add an entry to update-log.json for the changes made to tool-042"
```

#### Workflow 2: Add New Tools
```bash
# Step 1: Create from template
claude-code "Create a new tool file for 'Cursor AI' (tool-318) using the template, category: code-assistance"

# Step 2: Add to master list
claude-code "Add tool-318 to master-list.json with quickInfo"

# Step 3: Update category index
claude-code "Add tool-318 reference to the code-assistance category index"
```

#### Workflow 3: Bulk Updates
```bash
# Update pricing model for multiple tools
claude-code "Find all tools with pricing.model = 'Freemium' and add a new tier 'Team' with price '$49/mo' between Pro and Enterprise tiers"

# Standardize feature lists
claude-code "Analyze all LLM tools and standardize their features list to use consistent terminology"

# Update URLs
claude-code "Check all tool URLs for 404s and update any broken documentation links"
```

## Data Validation Scripts

### Create validation script
```bash
cat > ai-tools-documentation/scripts/validate-data.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function validateTools() {
    const toolsDir = path.join(__dirname, '../tools/by-id');
    const schema = require('../config/data-schema.json');
    const results = { valid: 0, invalid: 0, errors: [] };
    
    fs.readdirSync(toolsDir).forEach(file => {
        if (file.endsWith('.json')) {
            try {
                const tool = JSON.parse(fs.readFileSync(path.join(toolsDir, file)));
                // Add validation logic here
                results.valid++;
            } catch (e) {
                results.invalid++;
                results.errors.push({ file, error: e.message });
            }
        }
    });
    
    console.log(JSON.stringify(results, null, 2));
}

validateTools();
EOF

chmod +x ai-tools-documentation/scripts/validate-data.js
```

## Quick Reference Card

### File Locations
- **Individual tools**: `tools/by-id/tool-XXX.json`
- **Category groups**: `tools/by-category/[category]/`
- **Master list**: `data/master-list.json`
- **Incomplete tracking**: `data/incomplete-data.json`
- **Update history**: `data/update-log.json`

### Common Claude Code Patterns
```bash
# Search pattern
claude-code "Find all [items] in [location] where [condition]"

# Update pattern
claude-code "Update [item] in [location] set [field] = [value]"

# Create pattern
claude-code "Create new [type] named [name] with [properties] in [location]"

# Analyze pattern
claude-code "Analyze all [items] and report on [metrics]"

# Validate pattern
claude-code "Check all [items] in [location] for [criteria]"
```

### Batch Operation Examples
```bash
# Update all tools in a category
claude-code "For each tool in tools/by-category/image-generation/, add 'AI-powered' to the beginning of the description if not already present"

# Standardize pricing format
claude-code "Convert all pricing.tiers arrays to have consistent structure: {name, price, features[]}"

# Add missing timestamps
claude-code "For all tools missing metadata.lastUpdated, set it to today's date"
```

## Tips for Efficient Updates

1. **Start with validation**: Always run validation before making bulk changes
2. **Use dry runs**: Test commands on a few tools before applying to all
3. **Maintain backups**: Keep a backup of master-list.json before major updates
4. **Log everything**: Ensure update-log.json captures all changes
5. **Incremental updates**: Update in batches of 20-30 tools for easier rollback

## Monitoring Progress

```bash
# Check overall completion
claude-code "Calculate the percentage of tools with 100% data completeness"

# Track daily progress
claude-code "Show how many tools were updated today based on update-log.json"

# Find priority updates
claude-code "List the 10 tools with lowest dataCompleteness scores"
```