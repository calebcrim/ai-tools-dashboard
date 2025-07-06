const fs = require('fs');
const path = require('path');

// Read the current unified data
const dataPath = path.join(__dirname, 'data/unified-tools-data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Function to clean citation references
function cleanCitations(text) {
    if (typeof text !== 'string') return text;
    
    // Remove :contentReference[oaicite:X]{index=Y} patterns
    return text.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
}

// Function to clean all fields in a tool
function cleanToolData(tool) {
    const cleanedTool = { ...tool };
    
    // Clean string fields
    const stringFields = [
        'brief_purpose_summary',
        'feature_breakdown',
        'pricing_model',
        'pros_cons_limitations',
        'integration_potential',
        'learning_curve',
        'geo_regulatory_limitations',
        'case_studies'
    ];
    
    stringFields.forEach(field => {
        if (cleanedTool[field]) {
            cleanedTool[field] = cleanCitations(cleanedTool[field]);
        }
    });
    
    // Clean array fields
    if (cleanedTool.use_cases_in_pr && Array.isArray(cleanedTool.use_cases_in_pr)) {
        cleanedTool.use_cases_in_pr = cleanedTool.use_cases_in_pr.map(useCase => 
            cleanCitations(useCase)
        );
    }
    
    if (cleanedTool.tags && Array.isArray(cleanedTool.tags)) {
        cleanedTool.tags = cleanedTool.tags.map(tag => 
            cleanCitations(tag)
        );
    }
    
    return cleanedTool;
}

// Parse the data
const match = dataContent.match(/const unifiedToolsData = ({[\s\S]*});/);
if (!match) {
    console.error('Could not parse unified tools data');
    process.exit(1);
}

const data = eval('(' + match[1] + ')');

// Clean all tools
console.log('Cleaning citation references from tools data...');
let citationsFound = 0;

data.tools = data.tools.map(tool => {
    const cleanedTool = cleanToolData(tool);
    
    // Count citations cleaned
    const toolJson = JSON.stringify(tool);
    const cleanedJson = JSON.stringify(cleanedTool);
    if (toolJson !== cleanedJson) {
        const matches = toolJson.match(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g);
        if (matches) {
            citationsFound += matches.length;
            console.log(`- Cleaned ${matches.length} citations from: ${tool.tool_name}`);
        }
    }
    
    return cleanedTool;
});

console.log(`\nTotal citations cleaned: ${citationsFound}`);

// Write the cleaned data back
const outputContent = `// Auto-generated unified tools data with deduplication and missing data integration
// Last updated: ${new Date().toISOString()}
// Total tools: ${data.metadata.totalCount} (deduplicated from ${data.metadata.originalCount})
// Duplicates removed: ${data.metadata.duplicatesRemoved}
// Missing data integration: ${data.metadata.missingDataIntegration?.toolsMatched || 0} tools enhanced
// Citations cleaned: ${citationsFound}

const unifiedToolsData = ${JSON.stringify(data, null, 2)};

// Export for Node.js (build scripts)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}
`;

// Backup current file
const backupPath = dataPath.replace('.js', `.backup.${Date.now()}.js`);
fs.copyFileSync(dataPath, backupPath);
console.log(`\nBackup created: ${backupPath}`);

// Write cleaned data
fs.writeFileSync(dataPath, outputContent);
console.log(`Cleaned data written to: ${dataPath}`);

// Also clean the source file to prevent future issues
const missingDataPath = path.join(__dirname, 'data/sources/missing-data-integration.js');
if (fs.existsSync(missingDataPath)) {
    console.log('\nCleaning source integration file...');
    let sourceContent = fs.readFileSync(missingDataPath, 'utf8');
    const cleanedSource = sourceContent.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
    fs.writeFileSync(missingDataPath, cleanedSource);
    console.log('Source file cleaned.');
}