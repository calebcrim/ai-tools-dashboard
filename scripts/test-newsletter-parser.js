// Test script for newsletter parser improvements
const NewsletterParser = require('./newsletter-parsers');
const cheerio = require('cheerio');

// Test cases with sample newsletter HTML content
const testCases = [
  {
    name: 'The Rundown AI - Emoji Headers',
    source: 'The Rundown AI',
    html: `
      <div>
        <h3>🚀 Top Stories</h3>
        <p><strong>Google swoops in as OpenAI, Windsurf deal collapses</strong><br>
        Google's parent company Alphabet is reportedly in talks to acquire Windsurf after 
        negotiations with OpenAI fell through. The AI coding assistant startup was valued 
        at $2B in recent funding rounds. Sources say the deal could close as early as next month.</p>
        
        <p><strong>Moonshot AI's K2 takes open-source crown</strong>: The Chinese AI startup's 
        latest model K2 has topped open-source benchmarks, outperforming Meta's Llama 3.1 
        in reasoning tasks. The model uses a novel architecture that reduces training costs by 40%.</p>
        
        <h3>💡 Quick Hits</h3>
        <ul>
          <li><strong>Microsoft adds AI agents to Teams</strong> - New autonomous agents can schedule meetings, 
          take notes, and follow up on action items without human intervention.</li>
          <li><strong>OpenAI launches $100M grant program</strong> - Funding for startups building 
          beneficial AI applications in healthcare and education.</li>
        </ul>
      </div>
    `,
    expectedItems: 4,
    expectedHeadlines: [
      'Google swoops in as OpenAI, Windsurf deal collapses',
      'Moonshot AI\'s K2 takes open-source crown',
      'Microsoft adds AI agents to Teams',
      'OpenAI launches $100M grant program'
    ]
  },
  {
    name: 'TLDR AI - Numbered List Format',
    source: 'TLDR AI',
    html: `
      <div>
        <h2>AI News</h2>
        <ol>
          <li><a href="https://example.com/nvidia">NVIDIA's new H200 chip breaks records</a> (3 minute read)<br>
          The latest GPU delivers 2.4x performance improvement over H100 for LLM inference, 
          with availability starting Q2 2025.</li>
          
          <li><a href="https://example.com/anthropic">Anthropic raises $2B at $60B valuation</a> (5 minute read)<br>
          The Claude maker's latest funding round led by Google positions it as OpenAI's 
          main competitor in the enterprise AI market.</li>
        </ol>
      </div>
    `,
    expectedItems: 2,
    expectedHeadlines: [
      'NVIDIA\'s new H200 chip breaks records',
      'Anthropic raises $2B at $60B valuation'
    ]
  },
  {
    name: 'Ben\'s Bites - Bullet Points',
    source: 'Ben\'s Bites',
    html: `
      <div>
        <h3>Today's top stories</h3>
        <ul>
          <li>• <strong>Apple's AI strategy revealed:</strong> The company plans to integrate 
          advanced AI across all devices by 2026, with on-device processing as a key differentiator.</li>
          
          <li>• <strong>ChatGPT hits 300M users:</strong> OpenAI's chatbot reaches new milestone 
          just two years after launch, adding 100M users in the last 6 months alone.</li>
        </ul>
        
        <p>Plus: Amazon's new AI chip challenges NVIDIA, Meta open-sources video generation model.</p>
      </div>
    `,
    expectedItems: 2,
    expectedHeadlines: [
      'Apple\'s AI strategy revealed',
      'ChatGPT hits 300M users'
    ]
  },
  {
    name: 'Generic Newsletter - Mixed Format',
    source: 'AI Newsletter',
    html: `
      <div>
        <h2>Breaking: Major AI Breakthrough at MIT</h2>
        <p>Researchers at MIT have developed a new neural network architecture that can 
        learn from 90% less data than current models. The breakthrough could make AI 
        accessible to smaller companies and researchers.</p>
        
        <h3>Industry Updates</h3>
        <div>
          <strong>Tesla's FSD v12 rolls out nationwide</strong>
          <p>The latest Full Self-Driving update uses end-to-end neural networks for 
          the first time, showing significant improvements in city driving.</p>
        </div>
        
        <div>That's all for today! <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></div>
      </div>
    `,
    expectedItems: 2,
    expectedHeadlines: [
      'Breaking: Major AI Breakthrough at MIT',
      'Tesla\'s FSD v12 rolls out nationwide'
    ]
  }
];

// Test the parser
async function runTests() {
  const parser = new NewsletterParser();
  let passedTests = 0;
  let totalTests = testCases.length;
  
  console.log('Testing Newsletter Parser Improvements\n' + '='.repeat(50) + '\n');
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      // Parse the HTML
      const items = parser.parse(testCase.html, testCase.source);
      
      // Check number of items
      console.log(`Expected items: ${testCase.expectedItems}, Found: ${items.length}`);
      
      // Display extracted items
      items.forEach((item, index) => {
        console.log(`\nItem ${index + 1}:`);
        console.log(`  Headline: ${item.headline}`);
        console.log(`  Summary: ${item.summary ? item.summary.substring(0, 100) + '...' : '(no summary)'}`);
        console.log(`  Link: ${item.link || '(no link)'}`);
      });
      
      // Validate headlines
      const extractedHeadlines = items.map(item => item.headline);
      let matchedHeadlines = 0;
      
      testCase.expectedHeadlines.forEach(expected => {
        const found = extractedHeadlines.some(extracted => 
          extracted.toLowerCase().includes(expected.toLowerCase()) ||
          expected.toLowerCase().includes(extracted.toLowerCase())
        );
        if (found) matchedHeadlines++;
      });
      
      const passed = items.length >= testCase.expectedItems * 0.8 && 
                     matchedHeadlines >= testCase.expectedHeadlines.length * 0.8;
      
      console.log(`\nTest Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (passed) passedTests++;
      
    } catch (error) {
      console.log(`\nTest Result: ❌ ERROR - ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\nOverall Results: ${passedTests}/${totalTests} tests passed`);
  console.log(passedTests === totalTests ? '✅ All tests passed!' : '❌ Some tests failed');
}

// Test the enhanced generic extraction function
function testEnhancedExtraction() {
  console.log('\n\nTesting Enhanced Generic Extraction\n' + '='.repeat(50) + '\n');
  
  // This would normally be imported from email-to-newsfeed-gmail.js
  // For testing, we'll create a simplified version
  const testHtml = `
    <div>
      <strong>AI Startup Raises $50M Series B</strong>: Leading venture firms back 
      new computer vision platform that promises to revolutionize manufacturing quality control.
      
      <h3>Research Breakthrough</h3>
      <p>Scientists at Stanford develop new algorithm that reduces AI training time by 70% 
      while maintaining accuracy. The technique could democratize access to large language models.</p>
      
      <ul>
        <li>Meta releases Code Llama 3 - New coding model outperforms GPT-4 on benchmark tests</li>
        <li>Google DeepMind's Gemini Ultra scores 90% on MMLU - Highest score ever recorded</li>
      </ul>
      
      <div>View in browser | Unsubscribe</div>
    </div>
  `;
  
  const $ = cheerio.load(testHtml);
  
  // Test content extraction patterns
  console.log('Testing pattern extraction:');
  
  // Strong tags
  $('strong').each((i, elem) => {
    const $elem = $(elem);
    const headline = $elem.text().trim();
    const parent = $elem.parent();
    const parentText = parent.text();
    const headlineIndex = parentText.indexOf(headline);
    const summary = parentText.substring(headlineIndex + headline.length).trim().substring(0, 200);
    
    if (headline && !headline.match(/view in browser|unsubscribe/i)) {
      console.log(`\nStrong tag pattern:`);
      console.log(`  Headline: ${headline}`);
      console.log(`  Summary: ${summary}`);
    }
  });
  
  // Heading + paragraph
  $('h3').each((i, elem) => {
    const $elem = $(elem);
    const headline = $elem.text().trim();
    const $next = $elem.next('p');
    const summary = $next.text().trim();
    
    console.log(`\nHeading + paragraph pattern:`);
    console.log(`  Headline: ${headline}`);
    console.log(`  Summary: ${summary.substring(0, 100)}...`);
  });
  
  // List items
  $('li').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    const dashMatch = text.match(/^(.+?)\s*-\s*(.+)/);
    
    if (dashMatch) {
      console.log(`\nList item pattern:`);
      console.log(`  Headline: ${dashMatch[1]}`);
      console.log(`  Summary: ${dashMatch[2].substring(0, 100)}...`);
    }
  });
}

// Run all tests
async function main() {
  await runTests();
  testEnhancedExtraction();
}

main().catch(console.error);