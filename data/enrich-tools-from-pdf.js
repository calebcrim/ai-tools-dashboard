#!/usr/bin/env node

/**
 * Tool Data Enrichment Script
 * 
 * This script enriches the unified-tools-data.js file with additional information
 * from the PDF extracted data (pdf_extracted_tools.js).
 * 
 * It matches tools by name (and URL as secondary check) and updates only empty fields
 * in the unified data, preserving all existing information.
 * 
 * Field Mapping:
 * - features.extensive → feature_breakdown
 * - features.pricing → pricing_model
 * - features.integration → integration_potential
 * - features.useCases → use_cases_in_pr (merge with existing)
 * - tags → merge with existing tags (avoid duplicates)
 * 
 * Note: description is NOT used (keeping existing brief_purpose_summary)
 */

const fs = require('fs');
const path = require('path');

// File paths
const UNIFIED_FILE = path.join(__dirname, 'unified-tools-data.js');
const PDF_FILE = path.join(__dirname, 'sources', 'pdf_extracted_tools.js');
const BACKUP_FILE = path.join(__dirname, `unified-tools-data.backup.${Date.now()}.js`);

// Helper function to normalize tool names for matching
function normalizeToolName(name) {
    return name.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
}

// Helper function to normalize URLs for matching
function normalizeUrl(url) {
    if (!url) return '';
    return url.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();
}

// Helper function to clean use cases (remove newlines)
function cleanUseCases(useCases) {
    if (!Array.isArray(useCases)) return [];
    return useCases.map(useCase => 
        useCase.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    );
}

// Helper function to merge arrays without duplicates
function mergeArrays(arr1, arr2) {
    const combined = [...(arr1 || []), ...(arr2 || [])];
    return [...new Set(combined)];
}

// Main enrichment function
async function enrichToolsData() {
    console.log('Starting tool data enrichment...');
    console.log(`Enrichment performed on: ${new Date().toISOString()}\n`);

    try {
        // Create backup of current unified data
        console.log('Creating backup of unified-tools-data.js...');
        const unifiedContent = fs.readFileSync(UNIFIED_FILE, 'utf8');
        fs.writeFileSync(BACKUP_FILE, unifiedContent);
        console.log(`Backup created: ${BACKUP_FILE}\n`);

        // Load unified tools data
        console.log('Loading unified tools data...');
        // Extract the unifiedToolsData object from the file content
        const unifiedDataMatch = unifiedContent.match(/const unifiedToolsData = ({[\s\S]*?});/);
        if (!unifiedDataMatch) {
            throw new Error('Could not parse unifiedToolsData from file');
        }
        const unifiedToolsData = JSON.parse(unifiedDataMatch[1]);
        const unifiedTools = unifiedToolsData.tools;
        console.log(`Loaded ${unifiedTools.length} tools from unified data\n`);

        // Load PDF extracted tools data
        console.log('Loading PDF extracted tools data...');
        const pdfContent = fs.readFileSync(PDF_FILE, 'utf8');
        // Extract the pdfExtractedTools array from the file content
        const pdfDataMatch = pdfContent.match(/const pdfExtractedTools = (\[[\s\S]*?\]);/);
        if (!pdfDataMatch) {
            throw new Error('Could not parse pdfExtractedTools from file');
        }
        const pdfExtractedTools = JSON.parse(pdfDataMatch[1]);
        console.log(`Loaded ${pdfExtractedTools.length} tools from PDF data\n`);

        // Create lookup maps for efficient matching
        const pdfToolsMap = new Map();
        pdfExtractedTools.forEach(tool => {
            const normalizedName = normalizeToolName(tool.name);
            const normalizedUrl = normalizeUrl(tool.url);
            pdfToolsMap.set(normalizedName, tool);
            
            // Also store by URL for secondary matching
            if (normalizedUrl) {
                pdfToolsMap.set(normalizedUrl, tool);
            }
        });

        // Process each tool in unified data
        let enrichedCount = 0;
        const enrichmentLog = [];

        unifiedTools.forEach((tool, index) => {
            const normalizedName = normalizeToolName(tool.tool_name);
            const normalizedUrl = normalizeUrl(tool.url);
            
            // Try to find matching PDF tool
            let pdfTool = pdfToolsMap.get(normalizedName);
            
            // If not found by name, try URL
            if (!pdfTool && normalizedUrl) {
                pdfTool = pdfToolsMap.get(normalizedUrl);
            }
            
            if (pdfTool) {
                const updates = [];
                
                // Update feature_breakdown if empty
                if (!tool.feature_breakdown && pdfTool.features?.extensive) {
                    tool.feature_breakdown = pdfTool.features.extensive.trim();
                    updates.push('feature_breakdown');
                }
                
                // Update pricing_model if empty
                if (!tool.pricing_model && pdfTool.features?.pricing) {
                    tool.pricing_model = pdfTool.features.pricing.trim();
                    updates.push('pricing_model');
                }
                
                // Update integration_potential if empty
                if (!tool.integration_potential && pdfTool.features?.integration) {
                    tool.integration_potential = pdfTool.features.integration.trim();
                    updates.push('integration_potential');
                }
                
                // Merge use_cases_in_pr
                if (pdfTool.features?.useCases && Array.isArray(pdfTool.features.useCases)) {
                    const cleanedUseCases = cleanUseCases(pdfTool.features.useCases);
                    const existingUseCases = tool.use_cases_in_pr || [];
                    const mergedUseCases = mergeArrays(existingUseCases, cleanedUseCases);
                    
                    if (mergedUseCases.length > existingUseCases.length) {
                        tool.use_cases_in_pr = mergedUseCases;
                        updates.push('use_cases_in_pr');
                    }
                }
                
                // Merge tags
                if (pdfTool.tags && Array.isArray(pdfTool.tags)) {
                    const existingTags = tool.tags || [];
                    const mergedTags = mergeArrays(existingTags, pdfTool.tags);
                    
                    if (mergedTags.length > existingTags.length) {
                        tool.tags = mergedTags;
                        updates.push('tags');
                    }
                }
                
                if (updates.length > 0) {
                    enrichedCount++;
                    enrichmentLog.push({
                        toolName: tool.tool_name,
                        fieldsUpdated: updates
                    });
                }
            }
        });

        // Generate updated file content
        console.log('\nGenerating updated unified-tools-data.js...');
        
        const header = `// Auto-generated unified tools data with deduplication
// Last updated: ${new Date().toISOString()}
// Total tools: ${unifiedTools.length} (deduplicated from original count)
// Last enrichment from PDF: ${new Date().toISOString()}
// Tools enriched: ${enrichedCount}

`;

        const updatedContent = header + 
            'const unifiedToolsData = ' + 
            JSON.stringify({ tools: unifiedTools }, null, 2) + 
            ';\n\n' +
            'if (typeof module !== \'undefined\' && module.exports) {\n' +
            '  module.exports = unifiedToolsData;\n' +
            '}\n';

        // Write updated data
        fs.writeFileSync(UNIFIED_FILE, updatedContent);
        console.log('Updated unified-tools-data.js successfully!\n');

        // Print enrichment summary
        console.log('=== ENRICHMENT SUMMARY ===');
        console.log(`Total tools processed: ${unifiedTools.length}`);
        console.log(`Tools enriched: ${enrichedCount}`);
        console.log(`Tools unchanged: ${unifiedTools.length - enrichedCount}\n`);

        if (enrichmentLog.length > 0) {
            console.log('Enriched tools:');
            enrichmentLog.forEach(log => {
                console.log(`  - ${log.toolName}: ${log.fieldsUpdated.join(', ')}`);
            });
        }

        console.log('\nEnrichment completed successfully!');
        console.log(`Backup saved at: ${BACKUP_FILE}`);

    } catch (error) {
        console.error('Error during enrichment:', error);
        
        // Attempt to restore backup if something went wrong
        if (fs.existsSync(BACKUP_FILE)) {
            console.log('\nAttempting to restore from backup...');
            try {
                const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
                fs.writeFileSync(UNIFIED_FILE, backupContent);
                console.log('Backup restored successfully.');
            } catch (restoreError) {
                console.error('Failed to restore backup:', restoreError);
            }
        }
        
        process.exit(1);
    }
}

// Run the enrichment
enrichToolsData();