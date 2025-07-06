#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Convert the Complete Tools Data Array file
const toolsArrayFile = path.join(__dirname, 'sources', 'Complete Tools Data Array (180+ Tools).txt');
const outputFile = path.join(__dirname, 'sources', 'tools-array.js');

try {
    const content = fs.readFileSync(toolsArrayFile, 'utf8');
    
    // The file already contains JavaScript array syntax, so we just need to wrap it
    const jsContent = `// Auto-converted from Complete Tools Data Array (180+ Tools).txt
${content.trim()}

// Export for Node.js
module.exports = toolsData;
`;
    
    fs.writeFileSync(outputFile, jsContent);
    console.log('✓ Converted Complete Tools Data Array to tools-array.js');
} catch (error) {
    console.error('Error converting tools array file:', error.message);
}

// Convert the other-new-tools.txt file (JSON format)
const otherToolsFile = path.join(__dirname, 'sources', 'other-new-tools.txt');
const otherOutputFile = path.join(__dirname, 'sources', 'other-tools.js');

try {
    const content = fs.readFileSync(otherToolsFile, 'utf8');
    
    // Extract JSON objects from the markdown-formatted file
    const jsonMatches = content.match(/```json\n([\s\S]*?)\n```/g);
    const tools = [];
    
    if (jsonMatches) {
        jsonMatches.forEach(match => {
            const jsonStr = match.replace(/```json\n/, '').replace(/\n```/, '');
            try {
                const tool = JSON.parse(jsonStr);
                tools.push(tool);
            } catch (e) {
                console.warn('Failed to parse JSON:', e.message);
            }
        });
    }
    
    const jsContent = `// Auto-converted from other-new-tools.txt
module.exports = ${JSON.stringify(tools, null, 2)};
`;
    
    fs.writeFileSync(otherOutputFile, jsContent);
    console.log(`✓ Converted other-new-tools.txt to other-tools.js (${tools.length} tools)`);
} catch (error) {
    console.error('Error converting other tools file:', error.message);
}

console.log('\nNext step: Run "node data/build-tools-data.js" to rebuild the unified data.');