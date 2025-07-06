#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Enhanced PDF Tools Processor
 * Processes multiple PDF files to extract and integrate tool data
 * Can both add new tools and enrich existing ones
 */

class PDFToolsProcessor {
    constructor() {
        this.processedTools = new Map();
        this.newToolsAdded = 0;
        this.existingToolsEnriched = 0;
        this.duplicatesSkipped = 0;
        this.nextAvailableId = 1;
    }

    // Load unified tools data
    loadUnifiedData() {
        const filePath = path.join(__dirname, 'unified-tools-data.js');
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the JSON data
        const jsonMatch = content.match(/const unifiedToolsData = (\{[\s\S]*\});/);
        if (!jsonMatch) {
            throw new Error('Could not parse unified-tools-data.js');
        }
        
        const data = eval('(' + jsonMatch[1] + ')');
        
        // Find the highest ID to continue from
        if (data.tools && data.tools.length > 0) {
            this.nextAvailableId = Math.max(...data.tools.map(t => t.id)) + 1;
        }
        
        return data;
    }

    // Normalize text for comparison
    normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    }

    // Find tool in unified data
    findTool(unifiedTools, pdfTool) {
        const normalizedName = this.normalizeText(pdfTool.name);
        const normalizedUrl = this.normalizeText(pdfTool.url);
        
        return unifiedTools.find(tool => {
            const toolName = this.normalizeText(tool.tool_name);
            const toolUrl = this.normalizeText(tool.url);
            
            return toolName === normalizedName || 
                   (normalizedUrl && toolUrl === normalizedUrl);
        });
    }

    // Map PDF tool structure to unified format
    mapPdfToUnified(pdfTool, existingTool = null) {
        const mapped = {
            id: existingTool?.id || this.nextAvailableId++,
            tool_name: pdfTool.name || existingTool?.tool_name || '',
            url: pdfTool.url || existingTool?.url || '',
            category: pdfTool.category || existingTool?.category || 'uncategorized',
            source: pdfTool.source || existingTool?.source || 'pdf',
            icon: pdfTool.icon || existingTool?.icon || 'ai-assistant',
            brief_purpose_summary: existingTool?.brief_purpose_summary || pdfTool.description || '',
            feature_breakdown: existingTool?.feature_breakdown || pdfTool.features?.extensive || '',
            pricing_model: existingTool?.pricing_model || pdfTool.features?.pricing || '',
            pros_cons_limitations: existingTool?.pros_cons_limitations || pdfTool.features?.pros || '',
            integration_potential: existingTool?.integration_potential || pdfTool.features?.integration || '',
            learning_curve: existingTool?.learning_curve || pdfTool.features?.learningCurve || '',
            geo_regulatory_limitations: existingTool?.geo_regulatory_limitations || '',
            case_studies: existingTool?.case_studies || '',
            use_cases_in_pr: this.mergeUseCases(
                existingTool?.use_cases_in_pr || [],
                pdfTool.features?.useCases || []
            ),
            tags: this.mergeTags(
                existingTool?.tags || [],
                pdfTool.tags || []
            ),
            cision_use_suggestions: existingTool?.cision_use_suggestions || null
        };

        // Only update fields that are empty in existing tool
        if (existingTool) {
            Object.keys(mapped).forEach(key => {
                if (existingTool[key] && existingTool[key] !== '' && 
                    existingTool[key] !== null && 
                    (Array.isArray(existingTool[key]) ? existingTool[key].length > 0 : true)) {
                    // Keep existing non-empty value
                    mapped[key] = existingTool[key];
                }
            });
            
            // Special handling for fields that should be enriched/merged
            mapped.feature_breakdown = existingTool.feature_breakdown || mapped.feature_breakdown;
            mapped.pricing_model = existingTool.pricing_model || mapped.pricing_model;
            mapped.integration_potential = existingTool.integration_potential || mapped.integration_potential;
            mapped.use_cases_in_pr = this.mergeUseCases(existingTool.use_cases_in_pr, pdfTool.features?.useCases || []);
            mapped.tags = this.mergeTags(existingTool.tags, pdfTool.tags || []);
        }

        return mapped;
    }

    // Merge use cases without duplicates
    mergeUseCases(existing, newCases) {
        const cleanCase = (useCase) => useCase.trim().replace(/\n/g, ' ');
        const normalized = new Set(existing.map(cleanCase));
        
        newCases.forEach(useCase => {
            const cleaned = cleanCase(useCase);
            if (cleaned && !normalized.has(cleaned)) {
                existing.push(cleaned);
                normalized.add(cleaned);
            }
        });
        
        return existing;
    }

    // Merge tags without duplicates
    mergeTags(existing, newTags) {
        const normalized = new Set(existing.map(tag => tag.toLowerCase()));
        
        newTags.forEach(tag => {
            if (tag && !normalized.has(tag.toLowerCase())) {
                existing.push(tag);
                normalized.add(tag.toLowerCase());
            }
        });
        
        return existing;
    }

    // Process a single PDF extracted file
    processPdfFile(pdfFilePath, unifiedData) {
        console.log(`\n📄 Processing: ${path.basename(pdfFilePath)}`);
        
        try {
            // Load the PDF extracted data
            delete require.cache[require.resolve(pdfFilePath)];
            const pdfTools = require(pdfFilePath);
            
            const toolsArray = Array.isArray(pdfTools) ? pdfTools : 
                            (pdfTools.default || pdfTools.tools || []);
            
            console.log(`   Found ${toolsArray.length} tools in PDF file`);
            
            toolsArray.forEach(pdfTool => {
                const existingTool = this.findTool(unifiedData.tools, pdfTool);
                
                if (existingTool) {
                    // Enrich existing tool
                    const enrichedTool = this.mapPdfToUnified(pdfTool, existingTool);
                    const index = unifiedData.tools.findIndex(t => t.id === existingTool.id);
                    unifiedData.tools[index] = enrichedTool;
                    this.existingToolsEnriched++;
                    console.log(`   ✓ Enriched: ${pdfTool.name}`);
                } else {
                    // Add new tool
                    const newTool = this.mapPdfToUnified(pdfTool);
                    unifiedData.tools.push(newTool);
                    this.newToolsAdded++;
                    console.log(`   + Added new: ${pdfTool.name}`);
                }
            });
            
        } catch (error) {
            console.error(`   ❌ Error processing ${pdfFilePath}: ${error.message}`);
        }
    }

    // Save updated unified data
    saveUnifiedData(data) {
        const filePath = path.join(__dirname, 'unified-tools-data.js');
        
        // Update metadata
        data.metadata = data.metadata || {};
        data.metadata.totalCount = data.tools.length;
        data.metadata.lastUpdated = new Date().toISOString();
        data.metadata.categories = [...new Set(data.tools.map(t => t.category))].sort();
        data.metadata.sources = [...new Set(data.tools.map(t => t.source))].sort();
        
        // Generate file content
        const content = `// Auto-generated unified tools data
// Last updated: ${data.metadata.lastUpdated}
// Total tools: ${data.metadata.totalCount}
// New tools added: ${this.newToolsAdded}
// Existing tools enriched: ${this.existingToolsEnriched}

const unifiedToolsData = ${JSON.stringify(data, null, 2)};

export default unifiedToolsData;
`;
        
        fs.writeFileSync(filePath, content, 'utf8');
    }

    // Main processing function
    async process(pdfFiles = []) {
        console.log('🚀 PDF Tools Processor Starting...\n');
        
        // Create backup
        const backupPath = path.join(__dirname, `unified-tools-data.backup.${Date.now()}.js`);
        fs.copyFileSync(
            path.join(__dirname, 'unified-tools-data.js'),
            backupPath
        );
        console.log(`📦 Backup created: ${path.basename(backupPath)}`);
        
        // Load current unified data
        console.log('\n📊 Loading unified tools data...');
        const unifiedData = this.loadUnifiedData();
        console.log(`   Loaded ${unifiedData.tools.length} existing tools`);
        
        // If no specific files provided, look for all PDF extracted files
        if (pdfFiles.length === 0) {
            const sourcesDir = path.join(__dirname, 'sources');
            pdfFiles = fs.readdirSync(sourcesDir)
                .filter(f => f.includes('pdf') && f.endsWith('.js'))
                .map(f => path.join(sourcesDir, f));
        }
        
        // Process each PDF file
        pdfFiles.forEach(file => this.processPdfFile(file, unifiedData));
        
        // Save updated data
        console.log('\n💾 Saving updated unified data...');
        this.saveUnifiedData(unifiedData);
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ PROCESSING COMPLETE');
        console.log('='.repeat(50));
        console.log(`📈 New tools added: ${this.newToolsAdded}`);
        console.log(`🔧 Existing tools enriched: ${this.existingToolsEnriched}`);
        console.log(`📊 Total tools now: ${unifiedData.tools.length}`);
        console.log(`💾 Backup saved at: ${path.basename(backupPath)}`);
        console.log('='.repeat(50));
    }
}

// CLI usage
if (require.main === module) {
    const processor = new PDFToolsProcessor();
    
    // Get PDF files from command line arguments
    const pdfFiles = process.argv.slice(2);
    
    processor.process(pdfFiles).catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = PDFToolsProcessor;