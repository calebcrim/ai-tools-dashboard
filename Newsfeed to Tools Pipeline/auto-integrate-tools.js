#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class AutoToolIntegrator {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
        this.backupDir = path.join(__dirname, '..', 'data', 'backups');
        this.sourcesDir = path.join(__dirname, '..', 'data', 'sources');
    }
    
    async initialize() {
        // Ensure backup directory exists
        await fs.mkdir(this.backupDir, { recursive: true });
    }
    
    async loadDatabase() {
        const content = await fs.readFile(this.dbPath, 'utf8');
        const wrappedCode = `
            ${content}
            return unifiedToolsData;
        `;
        const getData = new Function(wrappedCode);
        return getData();
    }
    
    async backupDatabase() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `unified-tools-data.backup.${timestamp}.js`);
        await fs.copyFile(this.dbPath, backupPath);
        console.log(`Database backed up to: ${backupPath}`);
        return backupPath;
    }
    
    async processExtractedTools(extractionPath) {
        console.log('\n=== PROCESSING EXTRACTED TOOLS ===');
        
        // Load extraction results
        const extractionData = JSON.parse(await fs.readFile(extractionPath, 'utf8'));
        
        // Backup current database
        await this.backupDatabase();
        
        // Load current database
        const database = await this.loadDatabase();
        
        // Process new tools
        const newToolsAdded = [];
        for (const tool of extractionData.newTools) {
            const toolEntry = await this.createToolEntry(tool);
            
            // Add to database
            toolEntry.id = database.tools.length + newToolsAdded.length + 1;
            newToolsAdded.push(toolEntry);
            
            console.log(`✓ Added new tool: ${toolEntry.tool_name}`);
        }
        
        // Process updates
        const updatesApplied = [];
        for (const update of extractionData.updates) {
            const toolIndex = database.tools.findIndex(t => 
                t.tool_name === update.tool_name || 
                t.tool_name.toLowerCase() === update.tool_name.toLowerCase()
            );
            
            if (toolIndex !== -1) {
                const appliedUpdate = await this.applyUpdate(database.tools[toolIndex], update);
                if (appliedUpdate) {
                    updatesApplied.push({
                        tool_name: update.tool_name,
                        updates: appliedUpdate
                    });
                    console.log(`✓ Updated: ${update.tool_name}`);
                }
            }
        }
        
        // Add new tools to database
        database.tools.push(...newToolsAdded);
        
        // Sort by name for consistency
        database.tools.sort((a, b) => a.tool_name.localeCompare(b.tool_name));
        
        // Re-index tools
        database.tools.forEach((tool, index) => {
            tool.id = index + 1;
        });
        
        // Update metadata
        database.metadata = database.metadata || {};
        database.metadata.totalCount = database.tools.length;
        database.metadata.lastUpdated = new Date().toISOString();
        database.metadata.lastAutomatedUpdate = {
            date: new Date().toISOString(),
            newTools: newToolsAdded.length,
            updates: updatesApplied.length,
            source: extractionData.source
        };
        
        // Save updated database
        await this.saveDatabase(database);
        
        // Generate change report
        const report = await this.generateChangeReport(newToolsAdded, updatesApplied, extractionData);
        
        return report;
    }
    
    async createToolEntry(extractedTool) {
        const AIToolExtractor = require('./news-tool-extractor');
        const extractor = new AIToolExtractor();
        
        const toolEntry = await extractor.generateToolEntry(extractedTool);
        
        // Add additional metadata
        toolEntry.needs_research = true;
        toolEntry.auto_generated = true;
        
        return toolEntry;
    }
    
    async applyUpdate(existingTool, update) {
        const appliedUpdates = {};
        
        // Mark fields that need updating
        if (update.updates.pricing_model_update) {
            existingTool.pricing_model_needs_update = true;
            appliedUpdates.pricing_model = 'Marked for update';
        }
        
        if (update.updates.feature_breakdown_update) {
            existingTool.feature_breakdown_needs_update = true;
            appliedUpdates.feature_breakdown = 'Marked for update';
        }
        
        if (update.updates.integration_potential_update) {
            existingTool.integration_potential_needs_update = true;
            appliedUpdates.integration_potential = 'Marked for update';
        }
        
        // Add update history
        existingTool.update_history = existingTool.update_history || [];
        existingTool.update_history.push({
            date: new Date().toISOString(),
            type: 'news_mention',
            updates: Object.keys(update.updates),
            source: update.updates.source_url,
            context: update.context
        });
        
        return Object.keys(appliedUpdates).length > 0 ? appliedUpdates : null;
    }
    
    async saveDatabase(database) {
        const output = `// Auto-generated unified tools data
// Last updated: ${database.metadata.lastUpdated}
// Total tools: ${database.metadata.totalCount}
// Last automated update: ${database.metadata.lastAutomatedUpdate.date}

const unifiedToolsData = ${JSON.stringify(database, null, 2)};

// Browser compatibility
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}

// CommonJS export for Node.js scripts  
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}`;
        
        await fs.writeFile(this.dbPath, output);
        console.log('\n✅ Database updated successfully!');
    }
    
    async generateChangeReport(newTools, updates, extractionData) {
        const report = {
            timestamp: new Date().toISOString(),
            source: extractionData.source,
            summary: {
                newToolsAdded: newTools.length,
                toolsUpdated: updates.length,
                totalTools: (await this.loadDatabase()).tools.length
            },
            newTools: newTools.map(t => ({
                name: t.tool_name,
                category: t.category,
                url: t.url,
                confidence: t.extraction_metadata.confidence
            })),
            updates: updates,
            recommendations: []
        };
        
        // Add recommendations
        if (newTools.length > 0) {
            report.recommendations.push({
                type: 'research_needed',
                message: `${newTools.length} new tools need detailed research for complete information`,
                tools: newTools.map(t => t.tool_name)
            });
        }
        
        if (updates.length > 0) {
            report.recommendations.push({
                type: 'verify_updates',
                message: `${updates.length} tools have potential updates that should be verified`,
                tools: updates.map(u => u.tool_name)
            });
        }
        
        // Save report
        const reportPath = path.join(
            __dirname, 
            '..', 
            'data', 
            'reports',
            `integration-report-${new Date().toISOString().split('T')[0]}.json`
        );
        
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📊 Report saved to: ${reportPath}`);
        
        return report;
    }
    
    async createBatchFile(newTools, updates) {
        // Create a batch file for manual review if needed
        const batchData = [
            ...newTools.map(tool => ({
                tool_name: tool.tool_name,
                action: 'add',
                data: tool
            })),
            ...updates.map(update => ({
                tool_name: update.tool_name,
                action: 'update',
                updates: update.updates
            }))
        ];
        
        const batchPath = path.join(
            this.sourcesDir,
            `auto-batch-${new Date().toISOString().split('T')[0]}.json`
        );
        
        await fs.writeFile(batchPath, JSON.stringify(batchData, null, 2));
        console.log(`\n📦 Batch file created: ${batchPath}`);
        
        return batchPath;
    }
}

// Main execution
async function main() {
    const integrator = new AutoToolIntegrator();
    await integrator.initialize();
    
    // Get extraction file path from argument or default
    const extractionPath = process.argv[2] || 
        path.join(__dirname, '..', 'data', 'extracted-tools-batch.json');
    
    try {
        // Check if extraction file exists
        await fs.access(extractionPath);
        
        // Process the extracted tools
        const report = await integrator.processExtractedTools(extractionPath);
        
        // Display summary
        console.log('\n=== INTEGRATION COMPLETE ===');
        console.log(`New tools added: ${report.summary.newToolsAdded}`);
        console.log(`Tools updated: ${report.summary.toolsUpdated}`);
        console.log(`Total tools in database: ${report.summary.totalTools}`);
        
        // Display recommendations
        if (report.recommendations.length > 0) {
            console.log('\n📋 Recommendations:');
            report.recommendations.forEach(rec => {
                console.log(`  - ${rec.message}`);
            });
        }
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('No extraction file found. Run news-tool-extractor.js first.');
        } else {
            console.error('Error during integration:', error);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = AutoToolIntegrator;