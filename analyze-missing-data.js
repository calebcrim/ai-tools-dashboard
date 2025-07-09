#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load and execute the unified tools data file
const dataPath = path.join(__dirname, 'data', 'unified-tools-data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Create a function wrapper to execute the code and return the data
const wrappedCode = `
    ${dataContent}
    return unifiedToolsData;
`;

// Execute the code in a function context
const getData = new Function(wrappedCode);
const unifiedToolsData = getData();
const tools = unifiedToolsData.tools;

console.log(`Loaded ${tools.length} tools for analysis`);

// Define fields to check and their validation rules
const fieldsToCheck = {
    'brief_purpose_summary': { 
        minLength: 20, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified', 'None']
    },
    'feature_breakdown': { 
        minLength: 20, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified', 'None']
    },
    'pricing_model': { 
        minLength: 5, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Paid', 'Free']
    },
    'pros_cons_limitations': { 
        minLength: 20, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified', 'None']
    },
    'integration_potential': { 
        minLength: 20, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified', 'None']
    },
    'learning_curve': { 
        minLength: 10, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified']
    },
    'geo_regulatory_limitations': { 
        minLength: 10, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified']
    },
    'case_studies': { 
        minLength: 20, 
        checkEmpty: true,
        placeholders: ['TBD', 'N/A', 'Unknown', 'Coming soon', 'Not specified', 'None']
    },
    'use_cases_in_pr': { 
        checkArray: true,
        minItems: 1
    }
};

// Check if a field has valid data
function isFieldMissing(value, rules) {
    if (rules.checkArray) {
        return !Array.isArray(value) || value.length < (rules.minItems || 1);
    }
    
    if (!value || value === null || value === undefined) {
        return true;
    }
    
    if (rules.checkEmpty && value.trim() === '') {
        return true;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        return true;
    }
    
    if (rules.placeholders) {
        const valueLower = value.toLowerCase().trim();
        return rules.placeholders.some(placeholder => 
            valueLower === placeholder.toLowerCase() || 
            valueLower.includes(placeholder.toLowerCase())
        );
    }
    
    return false;
}

// Analyze each tool
const toolAnalysis = [];
const fieldMissingCounts = {};

// Initialize field counters
Object.keys(fieldsToCheck).forEach(field => {
    fieldMissingCounts[field] = 0;
});

tools.forEach(tool => {
    const missingFields = [];
    const insufficientFields = [];
    
    Object.entries(fieldsToCheck).forEach(([field, rules]) => {
        const value = tool[field];
        
        if (isFieldMissing(value, rules)) {
            missingFields.push(field);
            fieldMissingCounts[field]++;
        } else if (rules.minLength && value && value.length < rules.minLength * 2) {
            // Flag as insufficient if it's less than double the minimum (likely too brief)
            insufficientFields.push({
                field,
                length: value.length,
                value: value.substring(0, 50) + (value.length > 50 ? '...' : '')
            });
        }
    });
    
    toolAnalysis.push({
        tool_name: tool.tool_name,
        url: tool.url,
        category: tool.category,
        missingFields,
        insufficientFields,
        missingCount: missingFields.length
    });
});

// Sort tools by number of missing fields
toolAnalysis.sort((a, b) => b.missingCount - a.missingCount);

// Group tools by priority
const highPriority = toolAnalysis.filter(t => t.missingCount >= 5);
const mediumPriority = toolAnalysis.filter(t => t.missingCount >= 2 && t.missingCount <= 4);
const lowPriority = toolAnalysis.filter(t => t.missingCount === 1);
const completeTools = toolAnalysis.filter(t => t.missingCount === 0);

// Sort field missing counts
const sortedFieldCounts = Object.entries(fieldMissingCounts)
    .sort((a, b) => b[1] - a[1]);

// Generate the report
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(__dirname, `missing-data-audit-${timestamp}.txt`);

let report = `TOOL DATABASE MISSING DATA AUDIT
Generated: ${new Date().toISOString()}
Total Tools Analyzed: ${tools.length}

SUMMARY
=======
Tools with missing data: ${toolAnalysis.filter(t => t.missingCount > 0).length}
Tools with complete data: ${completeTools.length}
Overall completeness: ${((completeTools.length / tools.length) * 100).toFixed(1)}%

Most commonly missing fields:
${sortedFieldCounts.map(([ field, count ], index) => 
    `${index + 1}. ${field} - missing in ${count} tools (${((count / tools.length) * 100).toFixed(1)}%)`
).join('\n')}

DETAILED FINDINGS
================

HIGH PRIORITY (Missing 5+ fields)
---------------------------------
Total: ${highPriority.length} tools

`;

highPriority.forEach(tool => {
    report += `Tool: ${tool.tool_name}\n`;
    report += `URL: ${tool.url}\n`;
    report += `Category: ${tool.category}\n`;
    report += `Missing fields (${tool.missingCount}):\n`;
    tool.missingFields.forEach(field => {
        report += `- ${field}\n`;
    });
    if (tool.insufficientFields.length > 0) {
        report += `Insufficient data:\n`;
        tool.insufficientFields.forEach(item => {
            report += `- ${item.field} (${item.length} chars): "${item.value}"\n`;
        });
    }
    report += '\n';
});

report += `MEDIUM PRIORITY (Missing 2-4 fields)
------------------------------------
Total: ${mediumPriority.length} tools

`;

mediumPriority.forEach(tool => {
    report += `Tool: ${tool.tool_name}\n`;
    report += `URL: ${tool.url}\n`;
    report += `Category: ${tool.category}\n`;
    report += `Missing fields (${tool.missingCount}):\n`;
    tool.missingFields.forEach(field => {
        report += `- ${field}\n`;
    });
    if (tool.insufficientFields.length > 0) {
        report += `Insufficient data:\n`;
        tool.insufficientFields.forEach(item => {
            report += `- ${item.field} (${item.length} chars): "${item.value}"\n`;
        });
    }
    report += '\n';
});

report += `LOW PRIORITY (Missing 1 field)
------------------------------
Total: ${lowPriority.length} tools

`;

lowPriority.forEach(tool => {
    report += `Tool: ${tool.tool_name}\n`;
    report += `URL: ${tool.url}\n`;
    report += `Category: ${tool.category}\n`;
    report += `Missing field:\n`;
    tool.missingFields.forEach(field => {
        report += `- ${field}\n`;
    });
    if (tool.insufficientFields.length > 0) {
        report += `Insufficient data:\n`;
        tool.insufficientFields.forEach(item => {
            report += `- ${item.field} (${item.length} chars): "${item.value}"\n`;
        });
    }
    report += '\n';
});

report += `FIELD-BY-FIELD BREAKDOWN
========================

`;

// Add detailed breakdown for each field
Object.entries(fieldsToCheck).forEach(([field, rules]) => {
    const missingTools = toolAnalysis.filter(t => t.missingFields.includes(field));
    
    report += `Tools missing '${field}' (${missingTools.length} tools):\n`;
    report += '----------------------------------------\n';
    
    if (missingTools.length === 0) {
        report += 'None - all tools have this field!\n';
    } else {
        missingTools.forEach(tool => {
            report += `- ${tool.tool_name} (${tool.url})\n`;
        });
    }
    report += '\n';
});

// Add section for potential duplicates
report += `POTENTIAL DUPLICATES
====================

`;

// Check for tools with very similar names
const potentialDuplicates = [];
for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
        const name1 = tools[i].tool_name.toLowerCase();
        const name2 = tools[j].tool_name.toLowerCase();
        
        // Check if names are very similar
        if (name1.includes(name2) || name2.includes(name1) || 
            (name1.replace(/[^a-z0-9]/g, '') === name2.replace(/[^a-z0-9]/g, ''))) {
            potentialDuplicates.push({
                tool1: tools[i],
                tool2: tools[j]
            });
        }
    }
}

if (potentialDuplicates.length > 0) {
    potentialDuplicates.forEach(dup => {
        report += `Possible duplicate:\n`;
        report += `- ${dup.tool1.tool_name} (${dup.tool1.url})\n`;
        report += `- ${dup.tool2.tool_name} (${dup.tool2.url})\n\n`;
    });
} else {
    report += 'No obvious duplicates detected.\n';
}

// Write the report
fs.writeFileSync(reportPath, report);
console.log(`\nAudit report generated: ${reportPath}`);

// Print summary to console
console.log('\nSUMMARY:');
console.log(`- Tools with missing data: ${toolAnalysis.filter(t => t.missingCount > 0).length}`);
console.log(`- Tools with complete data: ${completeTools.length}`);
console.log(`- Overall completeness: ${((completeTools.length / tools.length) * 100).toFixed(1)}%`);
console.log('\nMost commonly missing fields:');
sortedFieldCounts.slice(0, 5).forEach(([field, count], index) => {
    console.log(`${index + 1}. ${field} - missing in ${count} tools`);
});