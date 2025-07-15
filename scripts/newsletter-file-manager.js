#!/usr/bin/env node

/**
 * Newsletter File Manager
 * 
 * This utility helps manage newsletter files in the data/Newsletters directory.
 * It can validate file formats, list available newsletters, and provide statistics.
 */

const fs = require('fs').promises;
const path = require('path');

class NewsletterFileManager {
    constructor() {
        this.newsletterDir = path.join(__dirname, '..', 'data', 'Newsletters');
    }

    async ensureDirectoryExists() {
        try {
            await fs.mkdir(this.newsletterDir, { recursive: true });
            console.log(`✓ Newsletter directory exists: ${this.newsletterDir}`);
        } catch (error) {
            console.error(`✗ Failed to create directory: ${error.message}`);
            process.exit(1);
        }
    }

    async listNewsletters() {
        try {
            const files = await fs.readdir(this.newsletterDir);
            const newsletters = files.filter(f => f.endsWith('.txt'));
            
            console.log('\n📁 Available Newsletters:');
            console.log('------------------------');
            
            if (newsletters.length === 0) {
                console.log('No newsletter files found.');
                return [];
            }

            const newsletterData = [];
            
            for (const file of newsletters) {
                const date = this.parseDateFromFilename(file);
                if (date) {
                    newsletterData.push({ file, date });
                }
            }

            // Sort by date (newest first)
            newsletterData.sort((a, b) => b.date - a.date);

            newsletterData.forEach((item, index) => {
                console.log(`${index + 1}. ${item.file} - ${this.formatDate(item.date)}`);
            });

            return newsletterData;
        } catch (error) {
            console.error(`✗ Failed to list newsletters: ${error.message}`);
            return [];
        }
    }

    async validateFile(filename) {
        try {
            // Check filename format
            const date = this.parseDateFromFilename(filename);
            if (!date) {
                console.log(`✗ Invalid filename format: ${filename}`);
                console.log('  Expected format: MM-DD-YYYY.txt');
                return false;
            }

            // Check if file exists
            const filepath = path.join(this.newsletterDir, filename);
            const stats = await fs.stat(filepath);
            
            if (!stats.isFile()) {
                console.log(`✗ Not a file: ${filename}`);
                return false;
            }

            // Read and validate content
            const content = await fs.readFile(filepath, 'utf8');
            const validation = this.validateContent(content);
            
            if (validation.valid) {
                console.log(`✓ Valid newsletter file: ${filename}`);
                console.log(`  - ${validation.sources} sources found`);
                console.log(`  - ${validation.items} total news items`);
            } else {
                console.log(`✗ Invalid content in: ${filename}`);
                validation.errors.forEach(error => {
                    console.log(`  - ${error}`);
                });
            }

            return validation.valid;
        } catch (error) {
            console.log(`✗ Error validating ${filename}: ${error.message}`);
            return false;
        }
    }

    validateContent(content) {
        const errors = [];
        let sources = 0;
        let items = 0;

        // Check for required structure
        const lines = content.split('\n');
        let hasSourceHeader = false;
        let hasHighlights = false;

        for (const line of lines) {
            if (line.startsWith('### ')) {
                hasSourceHeader = true;
                sources++;
            }
            if (line.includes('**AI Highlights:**')) {
                hasHighlights = true;
            }
            if (line.trim().startsWith('- **') && line.includes('**')) {
                items++;
            }
        }

        if (!hasSourceHeader) {
            errors.push('No source headers found (### Newsletter Name)');
        }
        if (!hasHighlights) {
            errors.push('No AI Highlights section found');
        }
        if (items === 0) {
            errors.push('No news items found');
        }

        return {
            valid: errors.length === 0,
            errors,
            sources,
            items
        };
    }

    async generateStats() {
        const newsletters = await this.listNewsletters();
        
        if (newsletters.length === 0) {
            console.log('\nNo newsletters to analyze.');
            return;
        }

        console.log('\n📊 Newsletter Statistics:');
        console.log('------------------------');
        
        let totalItems = 0;
        const sourceCount = {};
        const categoryCount = {};
        
        for (const newsletter of newsletters) {
            const filepath = path.join(this.newsletterDir, newsletter.file);
            const content = await fs.readFile(filepath, 'utf8');
            
            // Parse content for stats
            const lines = content.split('\n');
            let currentSource = null;
            
            for (const line of lines) {
                if (line.startsWith('### ')) {
                    currentSource = line.substring(4).trim();
                    sourceCount[currentSource] = (sourceCount[currentSource] || 0) + 1;
                }
                if (line.trim().startsWith('- **')) {
                    totalItems++;
                }
                if (line.includes('*Category:*')) {
                    const category = line.split('*Category:*')[1].trim();
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                }
            }
        }

        console.log(`Total newsletters: ${newsletters.length}`);
        console.log(`Total news items: ${totalItems}`);
        console.log(`Average items per newsletter: ${(totalItems / newsletters.length).toFixed(1)}`);
        
        console.log('\nTop Sources:');
        Object.entries(sourceCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([source, count]) => {
                console.log(`  - ${source}: ${count} appearances`);
            });
        
        console.log('\nTop Categories:');
        Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([category, count]) => {
                console.log(`  - ${category}: ${count} items`);
            });

        // Date range
        if (newsletters.length > 0) {
            const dates = newsletters.map(n => n.date);
            const oldest = new Date(Math.min(...dates));
            const newest = new Date(Math.max(...dates));
            console.log(`\nDate range: ${this.formatDate(oldest)} to ${this.formatDate(newest)}`);
        }
    }

    parseDateFromFilename(filename) {
        const match = filename.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\.txt$/);
        if (!match) return null;
        
        const [_, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    async createSampleFile() {
        const sampleFilename = '7-16-2025.txt';
        const samplePath = path.join(this.newsletterDir, sampleFilename);
        
        const sampleContent = `### Sample Newsletter
**Date:** July 16, 2025  
**Source:** sample@newsletter.com  

**AI Highlights:**

- **Sample AI Development Headline**  
  *Category:* Research / Paper  
  *Tags:* [#AI, #Research, #Innovation]  
  This is a sample summary describing an important AI development. It provides context and key information about the news item.  
  [https://example.com/sample-article](https://example.com/sample-article)

- **Another Important AI News Item**  
  *Category:* Product / Tool  
  *Tags:* [#Product, #Launch, #Technology]  
  Another sample summary with details about a new AI product or tool that was announced.  
  [https://example.com/another-article](https://example.com/another-article)

---

### Second Newsletter Source
**Date:** July 16, 2025  
**Source:** another@source.com  

**AI Highlights:**

- **Breaking AI News**  
  *Category:* Company News  
  *Tags:* [#Company, #Funding, #Growth]  
  Summary of breaking news from the AI industry.  
  [https://example.com/breaking-news](https://example.com/breaking-news)

---`;

        try {
            await fs.writeFile(samplePath, sampleContent, 'utf8');
            console.log(`✓ Created sample newsletter file: ${sampleFilename}`);
            console.log(`  Location: ${samplePath}`);
        } catch (error) {
            console.error(`✗ Failed to create sample file: ${error.message}`);
        }
    }
}

// CLI Interface
async function main() {
    const manager = new NewsletterFileManager();
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('📰 Newsletter File Manager');
    console.log('=========================\n');

    await manager.ensureDirectoryExists();

    switch (command) {
        case 'list':
            await manager.listNewsletters();
            break;
        
        case 'validate':
            if (args[1]) {
                await manager.validateFile(args[1]);
            } else {
                const newsletters = await manager.listNewsletters();
                console.log('\nValidating all newsletters...\n');
                for (const newsletter of newsletters) {
                    await manager.validateFile(newsletter.file);
                    console.log('');
                }
            }
            break;
        
        case 'stats':
            await manager.generateStats();
            break;
        
        case 'sample':
            await manager.createSampleFile();
            break;
        
        default:
            console.log('Usage: node newsletter-file-manager.js <command> [options]');
            console.log('\nCommands:');
            console.log('  list              List all newsletter files');
            console.log('  validate [file]   Validate newsletter file(s)');
            console.log('  stats             Show newsletter statistics');
            console.log('  sample            Create a sample newsletter file');
            console.log('\nExamples:');
            console.log('  node newsletter-file-manager.js list');
            console.log('  node newsletter-file-manager.js validate 7-15-2025.txt');
            console.log('  node newsletter-file-manager.js stats');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = NewsletterFileManager;