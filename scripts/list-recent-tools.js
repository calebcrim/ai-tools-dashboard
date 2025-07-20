#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function listRecentTools() {
    try {
        // Read all workflow reports
        const reportsDir = path.join(__dirname, '..', 'data', 'reports');
        const files = await fs.readdir(reportsDir);
        
        // Get today's reports
        const today = new Date().toISOString().split('T')[0];
        const todayReports = files.filter(f => f.includes(today) && f.endsWith('.json'));
        
        if (todayReports.length === 0) {
            console.log('No reports found for today.');
            return;
        }
        
        // Read the database to get tool details
        const dbPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
        const dbContent = await fs.readFile(dbPath, 'utf8');
        
        // Extract the tools data
        const moduleObj = { exports: {} };
        const func = new Function('module', 'exports', dbContent + '\nreturn typeof unifiedToolsData !== "undefined" ? unifiedToolsData : module.exports;');
        const database = func(moduleObj, moduleObj.exports);
        
        // Get the last N tools (based on the number of tools added today)
        let totalNewTools = 0;
        let totalUpdatedTools = 0;
        
        // Read workflow reports to get counts
        for (const reportFile of todayReports) {
            const reportPath = path.join(reportsDir, reportFile);
            const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
            if (report.integration) {
                totalNewTools += report.integration.newToolsAdded || 0;
                totalUpdatedTools += report.integration.toolsUpdated || 0;
            }
        }
        
        console.log(`\n📊 TOOLS PROCESSING SUMMARY - ${today}`);
        console.log('=' .repeat(50));
        console.log(`✅ New tools added: ${totalNewTools}`);
        console.log(`🔄 Tools updated: ${totalUpdatedTools}`);
        console.log(`📚 Total tools in database: ${database.tools.length}`);
        
        // List the new tools (last N tools in the database)
        if (totalNewTools > 0) {
            console.log(`\n🆕 NEW TOOLS ADDED:`);
            console.log('-' .repeat(50));
            
            const newTools = database.tools.slice(-totalNewTools);
            newTools.forEach((tool, index) => {
                console.log(`\n${index + 1}. ${tool.tool_name}`);
                console.log(`   URL: ${tool.url}`);
                console.log(`   Category: ${tool.category}`);
                console.log(`   Description: ${tool.brief_purpose_summary?.substring(0, 100)}...`);
            });
        }
        
        // For updated tools, we need to check the extracted-tools-batch.json
        const extractedPath = path.join(__dirname, '..', 'data', 'extracted-tools-batch.json');
        try {
            const extractedData = JSON.parse(await fs.readFile(extractedPath, 'utf8'));
            
            if (extractedData.updates && extractedData.updates.length > 0) {
                console.log(`\n🔄 TOOLS UPDATED:`);
                console.log('-' .repeat(50));
                
                extractedData.updates.forEach((update, index) => {
                    console.log(`\n${index + 1}. ${update.tool_name}`);
                    console.log(`   Updates: ${Object.keys(update.updates).join(', ')}`);
                });
            }
        } catch (error) {
            // extracted-tools-batch.json might be empty or missing
        }
        
    } catch (error) {
        console.error('Error listing recent tools:', error);
    }
}

// Run the script
listRecentTools();