#!/usr/bin/env node

/**
 * SEO Implementation Test Script
 * Run this to verify Phase 1 SEO implementations
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');

// If puppeteer is not installed, provide manual testing instructions
try {
    require.resolve('puppeteer');
} catch (e) {
    console.log(`
${chalk.yellow('Automated testing requires Puppeteer.')}
${chalk.cyan('To install: npm install puppeteer')}

${chalk.green.bold('Manual Testing Instructions:')}

1. ${chalk.bold('Test Meta Tags:')}
   - Open ${chalk.cyan('http://localhost:8000/test-seo-verification.html')}
   - Click each test button to verify meta updates
   - Check that titles and descriptions change dynamically

2. ${chalk.bold('Test Dashboard Integration:')}
   - Open ${chalk.cyan('http://localhost:8000/unified-dashboard.html')}
   - Open browser developer tools (F12)
   - Go to Console and run: ${chalk.cyan('window.seoInit.checkSEO()')}
   - Filter by category and check meta updates
   - Search for a tool and verify meta changes
   - Click on a tool to see tool-specific meta

3. ${chalk.bold('Verify Structured Data:')}
   - In developer tools, go to Elements/Inspector
   - Search for ${chalk.cyan('<script type="application/ld+json">')}
   - Copy the JSON content
   - Paste into ${chalk.cyan('https://search.google.com/test/rich-results')}
   - Verify no errors

4. ${chalk.bold('Test All Pages:')}
   ${chalk.gray('Run these commands in the browser console on each page:')}
   
   ${chalk.cyan('// Check meta tags')}
   document.title
   document.querySelector('meta[name="description"]').content
   document.querySelectorAll('meta[property^="og:"]').length
   document.querySelectorAll('meta[name^="twitter:"]').length
   
   ${chalk.cyan('// Check structured data')}
   document.querySelectorAll('script[type="application/ld+json"]').length
   
   ${chalk.cyan('// View all structured data')}
   Array.from(document.querySelectorAll('script[type="application/ld+json"]')).forEach((s, i) => {
     console.log(\`Schema \${i+1}:\`, JSON.parse(s.textContent));
   });

5. ${chalk.bold('External Validation:')}
   - ${chalk.cyan('Google Rich Results Test:')} https://search.google.com/test/rich-results
   - ${chalk.cyan('Facebook Debugger:')} https://developers.facebook.com/tools/debug/
   - ${chalk.cyan('Twitter Card Validator:')} https://cards-dev.twitter.com/validator
   - ${chalk.cyan('Schema Validator:')} https://validator.schema.org/

${chalk.green.bold('Expected Results:')}
✓ Dynamic meta descriptions that change with filters
✓ Structured data for Organization, WebSite, and Tools
✓ Open Graph tags for social sharing
✓ Twitter Card tags
✓ Unique descriptions for each page state
✓ Valid JSON-LD that passes Google validation

${chalk.yellow('Quick Test Command:')}
${chalk.gray('Run this in your terminal to start the server and open the test page:')}
${chalk.cyan('python3 -m http.server 8000 & sleep 2 && open http://localhost:8000/test-seo-verification.html')}
`);
    process.exit(0);
}

// Automated tests with Puppeteer
async function runAutomatedTests() {
    console.log(chalk.blue.bold('\n🔍 Running Automated SEO Tests...\n'));
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const tests = {
        passed: 0,
        failed: 0,
        results: []
    };

    // Test 1: Homepage Meta Tags
    try {
        await page.goto('http://localhost:8000/unified-dashboard.html', { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', el => el.content);
        const ogTags = await page.$$eval('meta[property^="og:"]', els => els.length);
        const twitterTags = await page.$$eval('meta[name^="twitter:"]', els => els.length);
        
        const homepageTest = {
            name: 'Homepage Meta Tags',
            passed: title.includes('AI Tools') && description.length > 50 && ogTags > 0 && twitterTags > 0
        };
        
        tests.results.push(homepageTest);
        if (homepageTest.passed) tests.passed++; else tests.failed++;
        
        console.log(homepageTest.passed ? chalk.green('✓') : chalk.red('✗'), homepageTest.name);
        console.log(chalk.gray(`  Title: ${title.substring(0, 50)}...`));
        console.log(chalk.gray(`  OG Tags: ${ogTags}, Twitter Tags: ${twitterTags}`));
        
    } catch (error) {
        console.log(chalk.red('✗ Homepage Meta Tags - Error:', error.message));
        tests.failed++;
    }

    // Test 2: Structured Data
    try {
        const schemas = await page.$$eval('script[type="application/ld+json"]', scripts => 
            scripts.map(s => {
                try {
                    return JSON.parse(s.textContent);
                } catch {
                    return null;
                }
            }).filter(Boolean)
        );
        
        const schemaTest = {
            name: 'Structured Data Present',
            passed: schemas.length > 0
        };
        
        tests.results.push(schemaTest);
        if (schemaTest.passed) tests.passed++; else tests.failed++;
        
        console.log(schemaTest.passed ? chalk.green('✓') : chalk.red('✗'), schemaTest.name);
        console.log(chalk.gray(`  Found ${schemas.length} schema(s)`));
        schemas.forEach((schema, i) => {
            console.log(chalk.gray(`  Schema ${i + 1}: ${schema['@type'] || 'Unknown'}`));
        });
        
    } catch (error) {
        console.log(chalk.red('✗ Structured Data - Error:', error.message));
        tests.failed++;
    }

    // Test 3: Category Filter Meta Update
    try {
        // Click on category filter
        await page.waitForSelector('#categoryFilter', { timeout: 5000 });
        await page.select('#categoryFilter', 'Customer Service');
        await page.waitForTimeout(1000); // Wait for meta update
        
        const categoryTitle = await page.title();
        const categoryDesc = await page.$eval('meta[name="description"]', el => el.content);
        
        const categoryTest = {
            name: 'Category Meta Update',
            passed: categoryTitle.includes('Customer Service') || categoryDesc.includes('Customer Service')
        };
        
        tests.results.push(categoryTest);
        if (categoryTest.passed) tests.passed++; else tests.failed++;
        
        console.log(categoryTest.passed ? chalk.green('✓') : chalk.red('✗'), categoryTest.name);
        console.log(chalk.gray(`  Title includes category: ${categoryTitle.includes('Customer Service')}`));
        
    } catch (error) {
        console.log(chalk.red('✗ Category Meta Update - Error:', error.message));
        tests.failed++;
    }

    // Test 4: Search Meta Update
    try {
        await page.goto('http://localhost:8000/unified-dashboard.html', { waitUntil: 'networkidle2' });
        
        // Perform search
        await page.type('#globalSearchInput', 'chatbot');
        await page.waitForTimeout(1000); // Wait for search and meta update
        
        const searchTitle = await page.title();
        const searchDesc = await page.$eval('meta[name="description"]', el => el.content);
        
        const searchTest = {
            name: 'Search Meta Update',
            passed: searchTitle.includes('Search Results') || searchDesc.includes('Showing')
        };
        
        tests.results.push(searchTest);
        if (searchTest.passed) tests.passed++; else tests.failed++;
        
        console.log(searchTest.passed ? chalk.green('✓') : chalk.red('✗'), searchTest.name);
        
    } catch (error) {
        console.log(chalk.red('✗ Search Meta Update - Error:', error.message));
        tests.failed++;
    }

    // Test 5: Other Pages
    const pagesToTest = [
        { url: '/financial-analysis/', name: 'Financial Analysis Page' },
        { url: '/best-practices.html', name: 'Best Practices Page' },
        { url: '/newsfeed/newsletter.html', name: 'Newsletter Page' }
    ];

    for (const pageTest of pagesToTest) {
        try {
            await page.goto(`http://localhost:8000${pageTest.url}`, { waitUntil: 'networkidle2' });
            
            const hasMetaManager = await page.evaluate(() => window.metaManager !== undefined);
            const hasSchemaGenerator = await page.evaluate(() => window.schemaGenerator !== undefined);
            
            const test = {
                name: `${pageTest.name} SEO Scripts`,
                passed: hasMetaManager && hasSchemaGenerator
            };
            
            tests.results.push(test);
            if (test.passed) tests.passed++; else tests.failed++;
            
            console.log(test.passed ? chalk.green('✓') : chalk.red('✗'), test.name);
            
        } catch (error) {
            console.log(chalk.red('✗'), pageTest.name, '- Error:', error.message);
            tests.failed++;
        }
    }

    await browser.close();

    // Summary
    console.log(chalk.blue.bold('\n📊 Test Summary:\n'));
    console.log(chalk.green(`Passed: ${tests.passed}`));
    console.log(chalk.red(`Failed: ${tests.failed}`));
    console.log(chalk.yellow(`Total: ${tests.passed + tests.failed}`));
    
    const percentage = Math.round((tests.passed / (tests.passed + tests.failed)) * 100);
    console.log(chalk.bold(`\nSuccess Rate: ${percentage}%`));
    
    if (percentage === 100) {
        console.log(chalk.green.bold('\n✅ All SEO tests passed! Phase 1 implementation is working correctly.'));
    } else {
        console.log(chalk.yellow.bold('\n⚠️  Some tests failed. Please review the results above.'));
    }
}

// Check if server is running
const http = require('http');

http.get('http://localhost:8000', (res) => {
    console.log(chalk.green('✓ Server is running on port 8000'));
    runAutomatedTests().catch(console.error);
}).on('error', (err) => {
    console.log(chalk.red('✗ Server is not running on port 8000'));
    console.log(chalk.yellow('Please start the server with: python3 -m http.server 8000'));
    process.exit(1);
});