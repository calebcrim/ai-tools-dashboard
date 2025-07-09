#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to load the main database
function loadMainDatabase() {
    const dbPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
    const content = fs.readFileSync(dbPath, 'utf8');
    
    // Create a function to execute and return the data
    const wrappedCode = `
        ${content}
        return unifiedToolsData;
    `;
    
    const getData = new Function(wrappedCode);
    return getData();
}

// Function to integrate a batch file
function integrateBatch(batchFile) {
    console.log(`\nIntegrating ${path.basename(batchFile)}...`);
    
    // Load the batch data
    const batchData = require(batchFile);
    
    // Load main database
    const mainDb = loadMainDatabase();
    
    let updatedCount = 0;
    
    // Process each tool update
    batchData.forEach(update => {
        const toolIndex = mainDb.tools.findIndex(t => 
            t.tool_name === update.tool_name || 
            t.tool_name.toLowerCase() === update.tool_name.toLowerCase()
        );
        
        if (toolIndex !== -1) {
            // Apply updates
            Object.entries(update.updates).forEach(([field, value]) => {
                mainDb.tools[toolIndex][field] = value;
            });
            updatedCount++;
            console.log(`✓ Updated: ${update.tool_name}`);
        } else {
            console.log(`✗ Not found: ${update.tool_name}`);
        }
    });
    
    // Save updated database
    const output = `// Auto-generated unified tools data with missing data integration
// Last updated: ${new Date().toISOString()}
// Total tools: ${mainDb.tools.length}

const unifiedToolsData = ${JSON.stringify(mainDb, null, 2)};

// Browser compatibility
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}

// CommonJS export for Node.js scripts  
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}`;
    
    const outputPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
    fs.writeFileSync(outputPath, output);
    
    console.log(`\n✅ Integration complete! Updated ${updatedCount} tools.`);
    
    return updatedCount;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
    // Find all batch files
    const sourcesDir = path.join(__dirname, '..', 'data', 'sources');
    const batchFiles = fs.readdirSync(sourcesDir)
        .filter(f => f.startsWith('missing-data-batch-') && f.endsWith('.js'))
        .map(f => path.join(sourcesDir, f));
    
    if (batchFiles.length === 0) {
        console.log('No missing data batch files found.');
        process.exit(0);
    }
    
    console.log(`Found ${batchFiles.length} batch file(s) to integrate:`);
    batchFiles.forEach(f => console.log(`- ${path.basename(f)}`));
    
    let totalUpdated = 0;
    batchFiles.forEach(file => {
        totalUpdated += integrateBatch(file);
    });
    
    console.log(`\n🎉 Total tools updated: ${totalUpdated}`);
} else {
    // Integrate specific file
    const batchFile = path.resolve(args[0]);
    if (!fs.existsSync(batchFile)) {
        console.error(`File not found: ${batchFile}`);
        process.exit(1);
    }
    
    integrateBatch(batchFile);
}