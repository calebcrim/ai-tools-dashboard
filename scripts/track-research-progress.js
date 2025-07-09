#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the audit report
const auditPath = path.join(__dirname, '..', 'missing-data-audit-2025-07-08T14-18-44-748Z.txt');
const auditContent = fs.readFileSync(auditPath, 'utf8');

// Extract high priority tools
const highPrioritySection = auditContent.match(/HIGH PRIORITY.*?MEDIUM PRIORITY/s)[0];
const toolMatches = highPrioritySection.matchAll(/Tool: (.+?)\nURL: (.+?)\n/g);

const highPriorityTools = [];
for (const match of toolMatches) {
    highPriorityTools.push({
        name: match[1],
        url: match[2]
    });
}

// Check existing research files
const sourcesDir = path.join(__dirname, '..', 'data', 'sources');
const existingBatches = fs.readdirSync(sourcesDir)
    .filter(f => f.startsWith('missing-data-batch-'))
    .map(f => path.join(sourcesDir, f));

// Track which tools have been researched
const researchedTools = new Set();
existingBatches.forEach(batchFile => {
    try {
        const content = fs.readFileSync(batchFile, 'utf8');
        const toolNameMatches = content.matchAll(/tool_name:\s*"([^"]+)"/g);
        for (const match of toolNameMatches) {
            researchedTools.add(match[1]);
        }
    } catch (e) {
        console.error(`Error reading ${batchFile}:`, e.message);
    }
});

// Generate progress report
console.log('=== RESEARCH PROGRESS REPORT ===\n');
console.log(`Total high priority tools: ${highPriorityTools.length}`);
console.log(`Tools researched: ${researchedTools.size}`);
console.log(`Remaining: ${highPriorityTools.length - researchedTools.size}\n`);

console.log('=== NEXT BATCH TO RESEARCH ===\n');
const batchSize = 5;
let batchCount = 0;
const nextBatch = [];

for (const tool of highPriorityTools) {
    if (!researchedTools.has(tool.name) && batchCount < batchSize) {
        nextBatch.push(tool);
        batchCount++;
    }
}

if (nextBatch.length > 0) {
    console.log('Next batch of tools to research:\n');
    nextBatch.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        console.log(`   URL: ${tool.url}\n`);
    });
    
    // Generate next batch number
    const existingBatchNumbers = existingBatches
        .map(f => parseInt(f.match(/batch-(\d+)/)?.[1] || 0))
        .filter(n => !isNaN(n));
    const nextBatchNumber = Math.max(0, ...existingBatchNumbers) + 1;
    
    console.log(`\nSuggested filename: data/sources/missing-data-batch-${nextBatchNumber}.js`);
} else {
    console.log('All high priority tools have been researched!');
    console.log('\nConsider moving to MEDIUM PRIORITY tools next.');
}

// Show research command suggestion
console.log('\n=== SUGGESTED PROMPT FOR CLAUDE ===\n');
console.log('Please research these tools and create the missing data file:');
console.log('1. Use WebSearch and WebFetch to gather information');
console.log('2. Visit each tool\'s website');
console.log('3. Find pricing, features, case studies, etc.');
console.log('4. Create the output file with all missing fields filled');
console.log('\nTools to research:');
nextBatch.forEach(tool => {
    console.log(`- ${tool.name} (${tool.url})`);
});