#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the current tools data
const dataPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
const content = fs.readFileSync(dataPath, 'utf8');

// Extract the full data object
const dataMatch = content.match(/const unifiedToolsData = (\{[\s\S]*\});/);
if (!dataMatch) {
    console.error('Could not find unifiedToolsData in file');
    process.exit(1);
}

const fullData = eval(`(${dataMatch[1]})`);
const tools = fullData.tools;
console.log(`\n📊 Current tool count: ${tools.length}`);

// Define duplicates to remove and merge
const duplicatesToRemove = [
    'Kiro AI Development Tool',
    'Kiro IDE', 
    'Kiro, AI Code Editor',
    'AgentCore for Enterprise AI',
    'new Kimi',
    'OpenAI' // Too generic
];

const mergeMap = {
    'Kiro': {
        keep: 'Kiro',
        merge: ['Kiro AI Development Tool', 'Kiro IDE', 'Kiro, AI Code Editor'],
        updateFields: {
            tool_name: 'Kiro',
            brief_purpose_summary: 'Amazon\'s AI-powered integrated development environment (IDE) targeting the agentic coding tools market. A specification-driven IDE built on Code OSS that creates requirements and system designs before writing code. Offers $50 free monthly credits during preview.',
            category: 'code-development'
        }
    },
    'AgentCore': {
        keep: 'AgentCore for Enterprise',
        merge: ['AgentCore for Enterprise AI'],
        updateFields: {
            tool_name: 'AgentCore',
            brief_purpose_summary: 'Amazon\'s enterprise AI agent platform - a suite of services for deploying and managing AI agents at enterprise scale. Built on Amazon Bedrock, it supports production-ready agent deployment with enterprise-grade security and scalability.'
        }
    },
    'Kimi': {
        keep: 'Alibaba\'s Moonshot Releases Kimi AI Model',
        merge: ['new Kimi'],
        updateFields: {
            tool_name: 'Kimi',
            brief_purpose_summary: 'AI model from Alibaba\'s Moonshot division, offering advanced language capabilities and multi-modal features for various AI applications.'
        }
    }
};

// Remove duplicates and update remaining tools
let removedCount = 0;
let updatedCount = 0;

const filteredTools = tools.filter(tool => {
    // Check if this tool should be removed
    if (duplicatesToRemove.includes(tool.tool_name)) {
        console.log(`❌ Removing duplicate: ${tool.tool_name}`);
        removedCount++;
        return false;
    }
    
    // Check if this tool needs updating
    for (const [key, config] of Object.entries(mergeMap)) {
        if (tool.tool_name === config.keep) {
            // Update the tool with better information
            Object.assign(tool, config.updateFields);
            console.log(`✏️  Updated: ${tool.tool_name}`);
            updatedCount++;
        }
    }
    
    return true;
});

console.log(`\n📈 Results:`);
console.log(`   - Removed: ${removedCount} duplicate tools`);
console.log(`   - Updated: ${updatedCount} tools`);
console.log(`   - New total: ${filteredTools.length} tools`);

// Update tools and metadata
fullData.tools = filteredTools;
fullData.metadata.totalCount = filteredTools.length;
fullData.metadata.lastDeduplication = {
    date: new Date().toISOString(),
    removed: removedCount,
    updated: updatedCount
};

// Reconstruct the file
const newContent = `// unified-tools-data.js
// Unified database of AI tools with comprehensive information
// Generated from multiple sources and deduplicated
// Last updated: ${new Date().toISOString()}

const unifiedToolsData = ${JSON.stringify(fullData, null, 2)};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = unifiedToolsData;
}`;

// Write the updated file
fs.writeFileSync(dataPath, newContent);
console.log(`\n✅ Successfully updated ${dataPath}`);

// Create a deduplication report
const reportPath = path.join(__dirname, '..', 'deduplication-report-' + new Date().toISOString().split('T')[0] + '.json');
const report = {
    date: new Date().toISOString(),
    duplicatesRemoved: duplicatesToRemove,
    toolsUpdated: Object.keys(mergeMap),
    removedCount,
    updatedCount,
    oldTotal: tools.length,
    newTotal: filteredTools.length
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Report saved to: ${path.basename(reportPath)}`);