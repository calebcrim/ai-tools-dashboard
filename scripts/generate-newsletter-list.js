#!/usr/bin/env node

/**
 * Generate Newsletter List
 * 
 * This script scans the data/Newsletters directory and generates a JSON file
 * listing all available newsletters. This helps the frontend know which files
 * are available without needing server-side directory access.
 */

const fs = require('fs').promises;
const path = require('path');

async function generateNewsletterList() {
    const newsletterDir = path.join(__dirname, '..', 'data', 'Newsletters');
    const outputFile = path.join(__dirname, '..', 'newsfeed', 'newsletter-list.json');
    
    try {
        // Ensure directory exists
        await fs.mkdir(newsletterDir, { recursive: true });
        
        // Read all files
        const files = await fs.readdir(newsletterDir);
        
        // Filter for .txt files with correct naming format
        const newsletters = [];
        
        for (const file of files) {
            if (file.endsWith('.txt')) {
                const match = file.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\.txt$/);
                if (match) {
                    const [_, month, day, year] = match;
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    
                    // Get file stats
                    const stats = await fs.stat(path.join(newsletterDir, file));
                    
                    newsletters.push({
                        filename: file,
                        date: date.toISOString(),
                        displayDate: date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        size: stats.size,
                        lastModified: stats.mtime.toISOString()
                    });
                }
            }
        }
        
        // Sort by date (newest first)
        newsletters.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create the list object
        const listData = {
            generated: new Date().toISOString(),
            count: newsletters.length,
            newsletters: newsletters
        };
        
        // Write to JSON file
        await fs.writeFile(outputFile, JSON.stringify(listData, null, 2), 'utf8');
        
        console.log(`✓ Generated newsletter list with ${newsletters.length} entries`);
        console.log(`  Output: ${outputFile}`);
        
        // Also create a simple array of filenames for backward compatibility
        const simpleList = newsletters.map(n => n.filename);
        const simpleListFile = path.join(__dirname, '..', 'newsfeed', 'available-newsletters.json');
        await fs.writeFile(simpleListFile, JSON.stringify(simpleList, null, 2), 'utf8');
        
        console.log(`✓ Generated simple file list`);
        console.log(`  Output: ${simpleListFile}`);
        
    } catch (error) {
        console.error(`✗ Failed to generate newsletter list: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    console.log('📰 Newsletter List Generator');
    console.log('===========================\n');
    generateNewsletterList();
}

module.exports = generateNewsletterList;