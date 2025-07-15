#!/usr/bin/env node

/**
 * Newsletter Creation Helper
 * 
 * This script helps create a new newsletter file with the correct format
 * and structure for today's date.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createNewsletter() {
    const newsletterDir = path.join(__dirname, '..', 'data', 'Newsletters');
    
    // Ensure directory exists
    await fs.mkdir(newsletterDir, { recursive: true });
    
    // Get date
    const today = new Date();
    const month = String(today.getMonth() + 1);
    const day = String(today.getDate());
    const year = today.getFullYear();
    
    const dateStr = await question(`Enter date (MM-DD-YYYY) [${month}-${day}-${year}]: `);
    const finalDate = dateStr.trim() || `${month}-${day}-${year}`;
    
    const filename = `${finalDate}.txt`;
    const filepath = path.join(newsletterDir, filename);
    
    // Check if file already exists
    try {
        await fs.access(filepath);
        const overwrite = await question(`File ${filename} already exists. Overwrite? (y/N): `);
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Cancelled.');
            process.exit(0);
        }
    } catch (error) {
        // File doesn't exist, which is good
    }
    
    console.log('\n📰 Creating newsletter for ' + finalDate);
    console.log('Enter newsletter sources (press Enter twice to finish):\n');
    
    const sources = [];
    let sourceCount = 1;
    
    while (true) {
        console.log(`\n--- Source ${sourceCount} ---`);
        const sourceName = await question('Newsletter name (e.g., "The Rundown AI"): ');
        if (!sourceName.trim()) break;
        
        const sourceEmail = await question('Source email/URL: ');
        const itemCount = parseInt(await question('How many news items? '));
        
        const items = [];
        for (let i = 1; i <= itemCount; i++) {
            console.log(`\nItem ${i}:`);
            const headline = await question('Headline: ');
            const category = await question('Category (Research/Product/Company News/etc.): ');
            const tags = await question('Tags (comma-separated, e.g., #AI,#LLM): ');
            const summary = await question('Summary (1-2 sentences): ');
            const url = await question('URL: ');
            
            items.push({
                headline,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                summary,
                url
            });
        }
        
        sources.push({
            name: sourceName,
            email: sourceEmail,
            items
        });
        
        sourceCount++;
    }
    
    // Generate the newsletter content
    let content = '';
    const displayDate = new Date(finalDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        
        content += `### ${source.name}\n`;
        content += `**Date:** ${displayDate}  \n`;
        content += `**Source:** ${source.email}  \n\n`;
        content += `**AI Highlights:**\n\n`;
        
        for (const item of source.items) {
            content += `- **${item.headline}**  \n`;
            content += `  *Category:* ${item.category}  \n`;
            content += `  *Tags:* ${item.tags.join(', ')}  \n`;
            content += `  ${item.summary}  \n`;
            content += `  [${item.url}](${item.url})\n\n`;
        }
        
        if (i < sources.length - 1) {
            content += `---\n\n`;
        }
    }
    
    content += `---`;
    
    // Write the file
    await fs.writeFile(filepath, content, 'utf8');
    console.log(`\n✓ Newsletter created: ${filename}`);
    
    // Ask if user wants to update the list
    const updateList = await question('\nUpdate newsletter list? (Y/n): ');
    if (updateList.toLowerCase() !== 'n') {
        const generateList = require('./generate-newsletter-list');
        await generateList();
    }
    
    rl.close();
}

// Interactive mode for quick entry
async function quickEntry() {
    const newsletterDir = path.join(__dirname, '..', 'data', 'Newsletters');
    await fs.mkdir(newsletterDir, { recursive: true });
    
    const today = new Date();
    const filename = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}.txt`;
    const filepath = path.join(newsletterDir, filename);
    
    console.log('📰 Quick Newsletter Entry');
    console.log('========================');
    console.log(`Creating: ${filename}\n`);
    console.log('Paste the newsletter content and press Ctrl+D when done:\n');
    
    let content = '';
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        content += chunk;
    });
    
    process.stdin.on('end', async () => {
        await fs.writeFile(filepath, content, 'utf8');
        console.log(`\n✓ Newsletter saved: ${filename}`);
        
        const generateList = require('./generate-newsletter-list');
        await generateList();
        
        process.exit(0);
    });
}

// Main
async function main() {
    const args = process.argv.slice(2);
    
    if (args[0] === '--quick' || args[0] === '-q') {
        await quickEntry();
    } else {
        await createNewsletter();
    }
}

main().catch(console.error);