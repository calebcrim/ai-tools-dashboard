#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate a ready-to-use prompt for Claude
function generateResearchPrompt(batchSize = 5) {
    // Load the audit report
    const auditPath = path.join(__dirname, '..', 'missing-data-audit-2025-07-08T14-18-44-748Z.txt');
    const auditContent = fs.readFileSync(auditPath, 'utf8');
    
    // Extract tools from different priority sections
    const extractTools = (sectionStart, sectionEnd) => {
        const regex = new RegExp(`${sectionStart}.*?${sectionEnd}`, 's');
        const section = auditContent.match(regex)?.[0] || '';
        const toolMatches = section.matchAll(/Tool: (.+?)\nURL: (.+?)\nCategory: (.+?)\nMissing fields.*?\n((?:- .+\n)+)/gs);
        
        const tools = [];
        for (const match of toolMatches) {
            const missingFields = match[4].split('\n')
                .filter(line => line.startsWith('- '))
                .map(line => line.substring(2).trim());
            
            tools.push({
                name: match[1],
                url: match[2],
                category: match[3],
                missingFields
            });
        }
        return tools;
    };
    
    // Get all priority tools
    const highPriority = extractTools('HIGH PRIORITY', 'MEDIUM PRIORITY');
    const mediumPriority = extractTools('MEDIUM PRIORITY', 'LOW PRIORITY');
    const lowPriority = extractTools('LOW PRIORITY', 'FIELD-BY-FIELD');
    
    // Check what's already been researched
    const sourcesDir = path.join(__dirname, '..', 'data', 'sources');
    const researchedTools = new Set();
    
    if (fs.existsSync(sourcesDir)) {
        const files = fs.readdirSync(sourcesDir)
            .filter(f => f.startsWith('missing-data-batch-'));
        
        files.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(sourcesDir, file), 'utf8');
                const matches = content.matchAll(/tool_name:\s*"([^"]+)"/g);
                for (const match of matches) {
                    researchedTools.add(match[1]);
                }
            } catch (e) {
                // Ignore errors
            }
        });
    }
    
    // Find next batch to research
    const findNextBatch = (tools, size) => {
        const batch = [];
        for (const tool of tools) {
            if (!researchedTools.has(tool.name) && batch.length < size) {
                batch.push(tool);
            }
        }
        return batch;
    };
    
    let nextBatch = findNextBatch(highPriority, batchSize);
    let priority = 'HIGH';
    
    if (nextBatch.length < batchSize) {
        const mediumBatch = findNextBatch(mediumPriority, batchSize - nextBatch.length);
        nextBatch = [...nextBatch, ...mediumBatch];
        if (mediumBatch.length > 0) priority = 'MIXED HIGH/MEDIUM';
    }
    
    if (nextBatch.length < batchSize) {
        const lowBatch = findNextBatch(lowPriority, batchSize - nextBatch.length);
        nextBatch = [...nextBatch, ...lowBatch];
        if (lowBatch.length > 0) priority = 'MIXED';
    }
    
    // Calculate next batch number
    const existingNumbers = fs.readdirSync(sourcesDir || '.')
        .filter(f => f.match(/missing-data-batch-(\d+)\.js/))
        .map(f => parseInt(f.match(/\d+/)[0]))
        .filter(n => !isNaN(n));
    
    const nextBatchNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    // Generate the prompt
    const prompt = `# Research Request for AI Tools Missing Data

## Instructions
Please research the following ${nextBatch.length} tools and gather all missing data fields. Use WebSearch and WebFetch to:
1. Visit each tool's official website
2. Find pricing information (check pricing pages)
3. Look for documentation and feature lists
4. Search for case studies and user reviews
5. Check API documentation for integrations
6. Determine geographic availability

## Tools to Research (Batch ${nextBatchNumber} - ${priority} PRIORITY)

${nextBatch.map((tool, index) => `
### ${index + 1}. ${tool.name}
- **URL**: ${tool.url}
- **Category**: ${tool.category}
- **Missing fields**: ${tool.missingFields.join(', ')}
`).join('')}

## Required Output
Create a file at \`data/sources/missing-data-batch-${nextBatchNumber}.js\` with this structure:

\`\`\`javascript
const missingDataBatch${nextBatchNumber} = [
${nextBatch.map(tool => `  {
    tool_name: "${tool.name}",
    updates: {
${tool.missingFields.map(field => `      ${field}: "// Research and fill this field",`).join('\n')}
    }
  }`).join(',\n')}
];

module.exports = missingDataBatch${nextBatchNumber};
\`\`\`

## Field Guidelines
- **pricing_model**: Include all tiers, prices, free options (e.g., "Free tier: up to X, Pro: $Y/month, Enterprise: Contact sales")
- **learning_curve**: Rate as "Low", "Medium", or "High" with explanation
- **feature_breakdown**: List 3-5 key features with descriptions
- **pros_cons_limitations**: "Pros: ... Cons: ... Limitations: ..."
- **integration_potential**: List specific platforms, APIs, webhooks
- **geo_regulatory_limitations**: Any geographic restrictions or compliance notes
- **case_studies**: Include company names and results if available
- **use_cases_in_pr**: Array of 3-5 specific PR/marketing use cases

After creating the file, I'll run the integration script to update the main database.`;
    
    return {
        prompt,
        batchNumber: nextBatchNumber,
        toolCount: nextBatch.length,
        priority
    };
}

// Generate and output the prompt
const result = generateResearchPrompt(5);

console.log('=== RESEARCH BATCH GENERATOR ===\n');
console.log(`Next batch number: ${result.batchNumber}`);
console.log(`Tools in batch: ${result.toolCount}`);
console.log(`Priority level: ${result.priority}`);
console.log('\n' + '='.repeat(80) + '\n');
console.log(result.prompt);

// Save prompt to file for easy copying
const promptFile = path.join(__dirname, `research-prompt-batch-${result.batchNumber}.md`);
fs.writeFileSync(promptFile, result.prompt);
console.log('\n' + '='.repeat(80));
console.log(`\n✅ Prompt saved to: ${promptFile}`);