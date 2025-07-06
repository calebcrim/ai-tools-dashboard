# Tool Update Guide

## Quick Start

To update existing tools with missing data:

1. **Add your updates to `data/sources/tool-updates.js`**
2. **Run the update script**: `./update-tools.sh`
3. **Refresh the website** to see changes

## Adding Tool Updates

### Option 1: Use tool-updates.js (Recommended for ongoing updates)

Edit `data/sources/tool-updates.js` and add tools in this format:

```javascript
{
    tool_name: "ChatGPT",  // Must match exactly
    feature_breakdown: "Advanced conversational AI with plugins, code interpreter, and web browsing...",
    pricing_model: "Free tier available, Plus $20/month, Team $25/user/month",
    pros_cons_limitations: "Pros: Versatile, constantly improving. Cons: Can hallucinate, knowledge cutoff",
    integration_potential: "API available, plugins ecosystem, GPT-4 Turbo API",
    learning_curve: "Easy - intuitive chat interface",
    geo_regulatory_limitations: "Not available in certain countries",
    case_studies: "Used by millions for coding, writing, analysis",
    use_cases_in_pr: [
        "Draft press releases and media pitches",
        "Analyze sentiment in media coverage",
        "Generate FAQ responses"
    ],
    tags: ["AI", "Chatbot", "Writing", "Analysis"],
    cision_use_suggestions: null
}
```

### Option 2: Continue using missing-data-fields-part1.js

Add new tools to the existing array in `data/sources/missing-data-fields-part1.js`

### Option 3: Create new batch files

Create `missing-data-fields-part2.js`, `missing-data-fields-part3.js`, etc. in `data/sources/`

## Important Notes

1. **Tool Name Matching**: The `tool_name` must match EXACTLY with the existing tool name in the database
2. **Partial Updates**: You only need to include fields you want to update - empty fields won't overwrite existing data
3. **Citation Cleanup**: The update script automatically removes citation references like `:contentReference[oaicite:0]{index=0}`
4. **Backups**: Each update creates an automatic backup

## Manual Update Process

If you prefer to run commands manually:

```bash
# 1. Create backup
cp data/unified-tools-data.js data/unified-tools-data.backup.$(date +%s).js

# 2. Run build process
node data/build-tools-data-enhanced.js

# 3. Clean citations
node clean-citations.js
```

## Checking Results

After updating, you can verify:

```bash
# Check total tools and completion rate
node -e "
const data = require('./data/unified-tools-data.js');
const complete = data.tools.filter(t => t.feature_breakdown && t.pricing_model);
console.log('Total tools:', data.tools.length);
console.log('Complete tools:', complete.length);
"
```

## Troubleshooting

### Tool not updating?
- Check the tool name matches exactly (case-sensitive)
- Look for the tool in the integration report: `data/missing-data-integration-report.txt`

### Citations still showing?
- Run `node clean-citations.js` again
- Check if new citations were added in your update

### Need to find exact tool names?
```bash
node -e "
const data = require('./data/unified-tools-data.js');
const search = 'chat'; // Change this to search term
data.tools.filter(t => t.tool_name.toLowerCase().includes(search))
  .forEach(t => console.log(t.tool_name));
"
```