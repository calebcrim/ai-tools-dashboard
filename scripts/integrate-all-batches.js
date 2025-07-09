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
function integrateBatch(batchFile, mainDb) {
    console.log(`\nIntegrating ${path.basename(batchFile)}...`);
    
    try {
        // Clear require cache to ensure fresh load
        delete require.cache[require.resolve(batchFile)];
        
        // Load the batch data
        const batchData = require(batchFile);
        
        let updatedCount = 0;
        let notFoundTools = [];
        
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
                notFoundTools.push(update.tool_name);
                console.log(`✗ Not found: ${update.tool_name}`);
            }
        });
        
        if (notFoundTools.length > 0) {
            console.log(`  ⚠️  Tools not found in database: ${notFoundTools.join(', ')}`);
        }
        
        return { updatedCount, notFoundCount: notFoundTools.length };
    } catch (error) {
        console.error(`  ❌ Error processing ${path.basename(batchFile)}: ${error.message}`);
        return { updatedCount: 0, notFoundCount: 0 };
    }
}

// Main execution
console.log('=== MISSING DATA INTEGRATION SCRIPT ===\n');

// Find all batch files with underscore pattern
const sourcesDir = path.join(__dirname, '..', 'data', 'sources');
const batchFiles = fs.readdirSync(sourcesDir)
    .filter(f => f.match(/^missing_data_batch_\d+\.js$/))
    .sort((a, b) => {
        // Sort numerically by batch number
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
    })
    .map(f => path.join(sourcesDir, f));

if (batchFiles.length === 0) {
    console.log('No missing data batch files found.');
    process.exit(0);
}

console.log(`Found ${batchFiles.length} batch file(s) to integrate:`);
batchFiles.forEach(f => console.log(`- ${path.basename(f)}`));

// Load main database once
console.log('\nLoading main database...');
const mainDb = loadMainDatabase();
console.log(`Loaded ${mainDb.tools.length} tools from unified-tools-data.js`);

// Process all batch files
let totalUpdated = 0;
let totalNotFound = 0;
let processedFiles = 0;

batchFiles.forEach(file => {
    const result = integrateBatch(file, mainDb);
    totalUpdated += result.updatedCount;
    totalNotFound += result.notFoundCount;
    processedFiles++;
});

// Save updated database
console.log('\n📝 Saving updated database...');
const output = `// Auto-generated unified tools data with missing data integration
// Last updated: ${new Date().toISOString()}
// Total tools: ${mainDb.tools.length}
// Integration: Processed ${processedFiles} batch files, updated ${totalUpdated} tools

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

// Print summary
console.log('\n=== INTEGRATION SUMMARY ===');
console.log(`✅ Batch files processed: ${processedFiles}`);
console.log(`✅ Tools updated: ${totalUpdated}`);
console.log(`⚠️  Tools not found: ${totalNotFound}`);
console.log(`📊 Total tools in database: ${mainDb.tools.length}`);
console.log('\n🎉 Integration complete!');