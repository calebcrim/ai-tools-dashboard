#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

class NewsToToolsWorkflow {
    constructor() {
        this.scriptsDir = __dirname;
        this.dataDir = path.join(__dirname, '..', 'data');
        this.newsletterDir = path.join(this.dataDir, 'Newsletters');
        this.reportsDir = path.join(this.dataDir, 'reports');
    }
    
    async initialize() {
        // Ensure required directories exist
        await fs.mkdir(this.reportsDir, { recursive: true });
        
        console.log('🚀 News to Tools Automation Workflow');
        console.log('===================================\n');
    }
    
    async processNewsletter(newsletterPath) {
        console.log(`📰 Processing newsletter: ${path.basename(newsletterPath)}`);
        
        try {
            // Step 1: Extract tools from newsletter
            console.log('\n1️⃣ Extracting AI tools from news content...');
            const extractionResult = await this.extractTools(newsletterPath);
            
            // Step 2: Review extraction results
            console.log('\n2️⃣ Reviewing extraction results...');
            const reviewedData = await this.reviewExtraction(extractionResult);
            
            // Step 3: Integrate into database
            console.log('\n3️⃣ Integrating tools into database...');
            const integrationResult = await this.integrateTools(reviewedData);
            
            // Step 4: Update newsfeed
            console.log('\n4️⃣ Updating newsfeed page...');
            await this.updateNewsfeed();
            
            // Step 5: Run verification to check data completeness
            console.log('\n5️⃣ Running data verification check...');
            const verificationResult = await this.runVerification();
            
            // Step 6: Generate summary report
            console.log('\n6️⃣ Generating summary report...');
            const report = await this.generateSummaryReport(
                newsletterPath,
                extractionResult,
                integrationResult,
                verificationResult
            );
            
            return report;
            
        } catch (error) {
            console.error('❌ Workflow error:', error);
            throw error;
        }
    }
    
    async extractTools(newsletterPath) {
        const { stdout, stderr } = await execAsync(
            `node ${path.join(this.scriptsDir, 'news-tool-extractor.js')} "${newsletterPath}"`
        );
        
        if (stderr) {
            console.error('Extraction warnings:', stderr);
        }
        
        // Load extraction results
        const extractionPath = path.join(this.dataDir, 'extracted-tools-batch.json');
        const extractionData = JSON.parse(await fs.readFile(extractionPath, 'utf8'));
        
        console.log(`  ✓ Found ${extractionData.newTools.length} potential new tools`);
        console.log(`  ✓ Found ${extractionData.updates.length} potential updates`);
        
        return extractionData;
    }
    
    async reviewExtraction(extractionData) {
        // Apply automated review rules
        const reviewed = {
            newTools: [],
            updates: [],
            rejected: [],
            timestamp: extractionData.timestamp,
            source: extractionData.source
        };
        
        // Review new tools
        for (const tool of extractionData.newTools) {
            if (this.validateNewTool(tool)) {
                reviewed.newTools.push(tool);
            } else {
                reviewed.rejected.push({
                    tool: tool,
                    reason: 'Low confidence or invalid data'
                });
            }
        }
        
        // Review updates
        for (const update of extractionData.updates) {
            if (this.validateUpdate(update)) {
                reviewed.updates.push(update);
            } else {
                reviewed.rejected.push({
                    update: update,
                    reason: 'Insufficient update information'
                });
            }
        }
        
        console.log(`  ✓ Approved ${reviewed.newTools.length} new tools`);
        console.log(`  ✓ Approved ${reviewed.updates.length} updates`);
        console.log(`  ⚠️  Rejected ${reviewed.rejected.length} items`);
        
        // Save reviewed data
        const reviewPath = path.join(this.dataDir, 'reviewed-tools-batch.json');
        await fs.writeFile(reviewPath, JSON.stringify(reviewed, null, 2));
        
        // Store for verification step
        this.lastReviewedData = reviewed;
        
        return reviewed;
    }
    
    validateNewTool(tool) {
        // Validation rules for new tools
        if (tool.confidence < 0.7) return false;
        if (!tool.name || tool.name.length < 2) return false;
        if (!tool.category) return false;
        
        // Check for common false positives
        const falsePositives = ['the', 'and', 'for', 'with', 'using'];
        if (falsePositives.includes(tool.name.toLowerCase())) return false;
        
        return true;
    }
    
    validateUpdate(update) {
        // Validation rules for updates
        if (!update.tool_name) return false;
        if (!update.updates || Object.keys(update.updates).length === 0) return false;
        
        return true;
    }
    
    async integrateTools(reviewedData) {
        // Save reviewed data for integration
        const reviewPath = path.join(this.dataDir, 'extracted-tools-batch.json');
        await fs.writeFile(reviewPath, JSON.stringify(reviewedData, null, 2));
        
        // Run integration script
        const { stdout, stderr } = await execAsync(
            `node ${path.join(this.scriptsDir, 'auto-integrate-tools.js')} "${reviewPath}"`
        );
        
        if (stderr) {
            console.error('Integration warnings:', stderr);
        }
        
        // Parse integration results from stdout
        const newToolsMatch = stdout.match(/New tools added: (\d+)/);
        const updatesMatch = stdout.match(/Tools updated: (\d+)/);
        const totalMatch = stdout.match(/Total tools in database: (\d+)/);
        
        return {
            newToolsAdded: newToolsMatch ? parseInt(newToolsMatch[1]) : 0,
            toolsUpdated: updatesMatch ? parseInt(updatesMatch[1]) : 0,
            totalTools: totalMatch ? parseInt(totalMatch[1]) : 0
        };
    }
    
    async updateNewsfeed() {
        // Run the newsletter list generator
        const { stdout, stderr } = await execAsync(
            `node ${path.join(this.scriptsDir, 'generate-newsletter-list.js')}`
        );
        
        if (stderr) {
            console.error('Newsfeed update warnings:', stderr);
        }
        
        console.log('  ✓ Newsfeed updated');
    }
    
    async runVerification() {
        // Run the verification script to check data completeness
        const { stdout, stderr } = await execAsync(
            `node ${path.join(this.scriptsDir, 'verify-integration.js')}`
        );
        
        if (stderr) {
            console.error('Verification warnings:', stderr);
        }
        
        // Parse verification results from stdout
        const lines = stdout.split('\n');
        const result = {
            totalTools: 0,
            completeTools: 0,
            incompleteTools: 0,
            newlyAddedIncomplete: [],
            fieldStats: {}
        };
        
        // Parse total tools
        const totalMatch = stdout.match(/Total tools in database: (\d+)/);
        if (totalMatch) result.totalTools = parseInt(totalMatch[1]);
        
        // Parse complete/incomplete counts
        const completeMatch = stdout.match(/Tools with complete data: (\d+)/);
        if (completeMatch) result.completeTools = parseInt(completeMatch[1]);
        
        const incompleteMatch = stdout.match(/Tools with missing data: (\d+)/);
        if (incompleteMatch) result.incompleteTools = parseInt(incompleteMatch[1]);
        
        // Parse field statistics
        const fieldLines = lines.filter(line => line.includes(':') && line.includes('/'));
        fieldLines.forEach(line => {
            const match = line.match(/\s*(\w+): (\d+)\/(\d+) \((\d+\.\d+)% complete\)/);
            if (match) {
                result.fieldStats[match[1]] = {
                    present: parseInt(match[2]),
                    total: parseInt(match[3]),
                    percentage: parseFloat(match[4])
                };
            }
        });
        
        // Load the database to find newly added tools with missing data
        const dbPath = path.join(this.dataDir, 'unified-tools-data.js');
        const content = await fs.readFile(dbPath, 'utf8');
        const wrappedCode = `
            ${content}
            return unifiedToolsData;
        `;
        const getData = new Function(wrappedCode);
        const data = getData();
        
        // Get newly added tools from this workflow run
        const newlyAddedNames = [];
        if (this.lastReviewedData && this.lastReviewedData.newTools) {
            this.lastReviewedData.newTools.forEach(tool => {
                newlyAddedNames.push(tool.name);
            });
        }
        
        // Get all tools and check the newly added ones
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
        
        data.tools.forEach(tool => {
            // Check if this is a newly added tool or one of the last 10 tools
            const isNewlyAdded = newlyAddedNames.includes(tool.tool_name);
            const isRecent = data.tools.indexOf(tool) >= data.tools.length - 10;
            
            if (isNewlyAdded || isRecent) {
                const missingFields = [];
                const minimalFields = [];
                
                fieldsToCheck.forEach(field => {
                    const value = tool[field];
                    if (!value || value.length === 0 || value === 'Not publicly disclosed') {
                        missingFields.push(field);
                    } else if (value.length < 50 && field !== 'learning_curve') {
                        // Check if field has minimal/placeholder content
                        minimalFields.push(field);
                    }
                });
                
                if (missingFields.length > 0 || minimalFields.length > 2) {
                    result.newlyAddedIncomplete.push({
                        name: tool.tool_name,
                        url: tool.url,
                        missingFields: missingFields,
                        minimalFields: minimalFields,
                        missingCount: missingFields.length,
                        isNewlyAdded: isNewlyAdded
                    });
                }
            }
        });
        
        // Display verification summary
        console.log(`\n  📊 Verification Results:`);
        console.log(`  • Total tools: ${result.totalTools}`);
        console.log(`  • Complete: ${result.completeTools} (${(result.completeTools / result.totalTools * 100).toFixed(1)}%)`);
        console.log(`  • Incomplete: ${result.incompleteTools} (${(result.incompleteTools / result.totalTools * 100).toFixed(1)}%)`);
        
        if (result.newlyAddedIncomplete.length > 0) {
            console.log(`\n  ⚠️  Newly added tools needing research:`);
            result.newlyAddedIncomplete.forEach(tool => {
                console.log(`  • ${tool.name} (${tool.url})`);
                console.log(`    Missing ${tool.missingCount} fields: ${tool.missingFields.slice(0, 3).join(', ')}${tool.missingFields.length > 3 ? '...' : ''}`);
            });
        }
        
        return result;
    }
    
    async generateSummaryReport(newsletterPath, extractionData, integrationResult, verificationResult) {
        const report = {
            workflow: 'news-to-tools',
            timestamp: new Date().toISOString(),
            newsletter: {
                file: path.basename(newsletterPath),
                date: this.extractDateFromFilename(newsletterPath)
            },
            extraction: {
                potentialNewTools: extractionData.newTools.length,
                potentialUpdates: extractionData.updates.length
            },
            integration: integrationResult,
            verification: {
                totalTools: verificationResult.totalTools,
                completeTools: verificationResult.completeTools,
                incompleteTools: verificationResult.incompleteTools,
                newlyAddedIncomplete: verificationResult.newlyAddedIncomplete
            },
            summary: {
                success: true,
                message: `Successfully processed newsletter. Added ${integrationResult.newToolsAdded} new tools and updated ${integrationResult.toolsUpdated} existing tools.`
            }
        };
        
        // Save report
        const reportPath = path.join(
            this.reportsDir,
            `workflow-report-${new Date().toISOString().split('T')[0]}.json`
        );
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Display summary
        console.log('\n✅ WORKFLOW COMPLETE!');
        console.log('====================');
        console.log(report.summary.message);
        console.log(`Report saved to: ${path.basename(reportPath)}`);
        
        // Display research recommendations if there are incomplete tools
        if (verificationResult.newlyAddedIncomplete.length > 0) {
            console.log('\n📋 MANUAL RESEARCH NEEDED:');
            console.log('========================');
            console.log(`${verificationResult.newlyAddedIncomplete.length} newly added tools require additional data:`);
            verificationResult.newlyAddedIncomplete.forEach(tool => {
                console.log(`\n• ${tool.name}`);
                console.log(`  URL: ${tool.url}`);
                console.log(`  Missing fields (${tool.missingCount}): ${tool.missingFields.join(', ')}`);
            });
            console.log('\nRun the research batch generator to complete these tools.');
        }
        
        return report;
    }
    
    extractDateFromFilename(filepath) {
        const filename = path.basename(filepath, '.txt');
        const match = filename.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        if (match) {
            return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        }
        return null;
    }
    
    async processAllNewsletters() {
        console.log('📚 Processing all newsletters...\n');
        
        const files = await fs.readdir(this.newsletterDir);
        const newsletters = files
            .filter(f => f.endsWith('.txt'))
            .sort()
            .reverse(); // Most recent first
        
        const results = [];
        
        for (const newsletter of newsletters) {
            const newsletterPath = path.join(this.newsletterDir, newsletter);
            console.log(`\n--- Processing ${newsletter} ---`);
            
            try {
                const result = await this.processNewsletter(newsletterPath);
                results.push(result);
            } catch (error) {
                console.error(`Failed to process ${newsletter}:`, error.message);
                results.push({
                    newsletter: newsletter,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    async watchNewsletters() {
        console.log('👀 Watching for new newsletters...\n');
        console.log(`Monitoring: ${this.newsletterDir}`);
        console.log('Press Ctrl+C to stop\n');
        
        const processedFiles = new Set();
        
        // Get initial files
        const initialFiles = await fs.readdir(this.newsletterDir);
        initialFiles.forEach(f => processedFiles.add(f));
        
        // Poll for changes
        setInterval(async () => {
            try {
                const currentFiles = await fs.readdir(this.newsletterDir);
                
                for (const file of currentFiles) {
                    if (!processedFiles.has(file) && file.endsWith('.txt')) {
                        console.log(`\n🆕 New newsletter detected: ${file}`);
                        processedFiles.add(file);
                        
                        const newsletterPath = path.join(this.newsletterDir, file);
                        await this.processNewsletter(newsletterPath);
                    }
                }
            } catch (error) {
                console.error('Watch error:', error);
            }
        }, 5000); // Check every 5 seconds
    }
}

// CLI Interface
async function main() {
    const workflow = new NewsToToolsWorkflow();
    await workflow.initialize();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'process':
            // Process a specific newsletter
            const newsletterPath = args[1];
            if (!newsletterPath) {
                console.error('Usage: news-to-tools-workflow.js process <newsletter-file>');
                process.exit(1);
            }
            await workflow.processNewsletter(newsletterPath);
            break;
            
        case 'process-all':
            // Process all newsletters
            await workflow.processAllNewsletters();
            break;
            
        case 'watch':
            // Watch for new newsletters
            await workflow.watchNewsletters();
            break;
            
        case 'latest':
            // Process the most recent newsletter
            const files = await fs.readdir(workflow.newsletterDir);
            const latest = files
                .filter(f => f.endsWith('.txt'))
                .sort()
                .pop();
                
            if (latest) {
                const latestPath = path.join(workflow.newsletterDir, latest);
                await workflow.processNewsletter(latestPath);
            } else {
                console.error('No newsletters found');
            }
            break;
            
        default:
            console.log('Usage: news-to-tools-workflow.js <command> [options]');
            console.log('\nCommands:');
            console.log('  process <file>  - Process a specific newsletter');
            console.log('  process-all     - Process all newsletters');
            console.log('  latest          - Process the most recent newsletter');
            console.log('  watch           - Watch for new newsletters');
            process.exit(0);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default NewsToToolsWorkflow;