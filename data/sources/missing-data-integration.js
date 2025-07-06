// Missing data integration file
// This file contains comprehensive data fields for 30 tools that need to be merged into the main database

const fs = require('fs');
const path = require('path');

// Read the JSON data from missing-data-fields-part1.js (which is actually a JSON file)
const jsonData = fs.readFileSync(path.join(__dirname, 'missing-data-fields-part1.js'), 'utf8');
const missingDataTools = JSON.parse(jsonData);

// Export in the format expected by build-tools-data.js
module.exports = missingDataTools.map(tool => ({
    // Core fields that should match existing tools
    tool_name: tool.tool_name,
    url: tool.url,
    
    // Comprehensive fields to be merged
    feature_breakdown: tool.feature_breakdown,
    pricing_model: tool.pricing_model,
    pros_cons_limitations: tool.pros_cons_limitations,
    integration_potential: tool.integration_potential,
    learning_curve: tool.learning_curve,
    geo_regulatory_limitations: tool.geo_regulatory_limitations,
    case_studies: tool.case_studies,
    use_cases_in_pr: tool.use_cases_in_pr,
    tags: tool.tags,
    cision_use_suggestions: tool.cision_use_suggestions,
    
    // Include other fields for completeness
    category: tool.category,
    source: tool.source,
    icon: tool.icon,
    brief_purpose_summary: tool.brief_purpose_summary
}));