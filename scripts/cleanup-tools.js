#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cleanupTools() {
    try {
        // Read the unified tools data
        const filePath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract the data object
        const dataMatch = content.match(/const unifiedToolsData = ({[\s\S]*});/);
        if (!dataMatch) {
            throw new Error('Could not parse unified-tools-data.js');
        }
        
        // Create a function to safely evaluate the data
        const evalData = new Function('return ' + dataMatch[1]);
        const unifiedToolsData = evalData();
        
        console.log(`Current tool count: ${unifiedToolsData.tools.length}`);
        
        // Sort tools alphabetically by tool_name (case-insensitive)
        unifiedToolsData.tools.sort((a, b) => {
            return a.tool_name.toLowerCase().localeCompare(b.tool_name.toLowerCase());
        });
        
        // Re-number tools sequentially
        unifiedToolsData.tools.forEach((tool, index) => {
            tool.id = index + 1;
        });
        
        // Create the new file content
        const newContent = `const unifiedToolsData = ${JSON.stringify(unifiedToolsData, null, 2)};`;
        
        // Write back to file
        await fs.writeFile(filePath, newContent, 'utf8');
        
        console.log(`✅ Tools sorted and renumbered successfully`);
        console.log(`Final tool count: ${unifiedToolsData.tools.length}`);
        
        // Show first 10 tools to verify
        console.log('\nFirst 10 tools after sorting:');
        unifiedToolsData.tools.slice(0, 10).forEach(tool => {
            console.log(`  ${tool.id}. ${tool.tool_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error cleaning up tools:', error.message);
        process.exit(1);
    }
}

// Run the cleanup
console.log('🧹 Cleaning up unified-tools-data.js...\n');
cleanupTools();