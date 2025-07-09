#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the updated database
const dbPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
const content = fs.readFileSync(dbPath, 'utf8');

const wrappedCode = `
    ${content}
    return unifiedToolsData;
`;

const getData = new Function(wrappedCode);
const data = getData();

console.log('=== INTEGRATION VERIFICATION REPORT ===\n');
console.log(`Total tools in database: ${data.tools.length}`);

// Count tools with complete vs missing data
const fieldsToCheck = [
    'feature_breakdown',
    'pricing_model', 
    'pros_cons_limitations',
    'integration_potential',
    'learning_curve',
    'geo_regulatory_limitations',
    'case_studies',
    'use_cases_in_pr'
];

let completeTools = 0;
let fieldStats = {};

fieldsToCheck.forEach(field => {
    fieldStats[field] = { present: 0, missing: 0 };
});

data.tools.forEach(tool => {
    let isComplete = true;
    
    fieldsToCheck.forEach(field => {
        if (tool[field] && tool[field].length > 0 && tool[field] !== 'Not publicly disclosed') {
            fieldStats[field].present++;
        } else {
            fieldStats[field].missing++;
            isComplete = false;
        }
    });
    
    if (isComplete) completeTools++;
});

console.log(`\nTools with complete data: ${completeTools} (${(completeTools / data.tools.length * 100).toFixed(1)}%)`);
console.log(`Tools with missing data: ${data.tools.length - completeTools} (${((data.tools.length - completeTools) / data.tools.length * 100).toFixed(1)}%)\n`);

console.log('Field completion statistics:');
fieldsToCheck.forEach(field => {
    const stats = fieldStats[field];
    const percentage = (stats.present / data.tools.length * 100).toFixed(1);
    console.log(`  ${field}: ${stats.present}/${data.tools.length} (${percentage}% complete)`);
});

// Check for recently updated tools
const recentlyUpdated = data.tools.filter(tool => {
    return fieldsToCheck.some(field => 
        tool[field] && tool[field].includes('2024') || 
        tool[field] && tool[field].includes('2025')
    );
});

console.log(`\nTools with recent updates (2024/2025 mentions): ${recentlyUpdated.length}`);