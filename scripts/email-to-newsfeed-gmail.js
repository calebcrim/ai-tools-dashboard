// Gmail version of email-to-newsfeed script
// This script connects to Gmail, reads newsletters, and generates newsfeed content

const fs = require('fs').promises;
const path = require('path');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');

// Configuration for Gmail
const config = {
  email: process.env.GMAIL_EMAIL || 'daviscal541@gmail.com',
  password: process.env.GMAIL_APP_PASSWORD,
  imap: {
    user: process.env.GMAIL_EMAIL || 'daviscal541@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000
  },
  newsletters: [
    'bensbites',
    'therundown',
    'tldr',
    'theneuron',
    'superhuman'
  ]
};

// Initialize IMAP connection
function createImapConnection() {
  return new Imap(config.imap);
}

// Process emails
async function processEmails() {
  return new Promise((resolve, reject) => {
    const newsItems = [];
    const imap = createImapConnection();
    
    imap.once('ready', () => {
      console.log('✅ Connected to Gmail successfully!');
      
      // Try different folder names for Gmail
      const folderNames = ['AI-Newsletters', '[Gmail]/All Mail', 'INBOX'];
      
      tryOpenFolder(0);
      
      function tryOpenFolder(index) {
        if (index >= folderNames.length) {
          console.log('Could not find appropriate folder');
          imap.end();
          resolve(newsItems);
          return;
        }
        
        const folderName = folderNames[index];
        console.log(`Trying to open folder: ${folderName}`);
        
        imap.openBox(folderName, false, (err, box) => {
          if (err) {
            console.log(`Could not open ${folderName}:`, err.message);
            tryOpenFolder(index + 1);
            return;
          }
          
          console.log(`✅ Opened ${folderName} successfully!`);
          console.log(`Total messages in ${folderName}: ${box.messages.total}`);
          
          // Search for emails from the last 7 days
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          // Build search criteria for newsletter emails
          const searchCriteria = [
            ['SINCE', oneWeekAgo],
            ['OR',
              ['FROM', 'bensbites'],
              ['OR',
                ['FROM', 'rundown'],
                ['OR',
                  ['FROM', 'tldr'],
                  ['OR',
                    ['FROM', 'neuron'],
                    ['FROM', 'superhuman']
                  ]
                ]
              ]
            ]
          ];
          
          console.log('Searching for newsletter emails from the last 7 days...');
          
          imap.search(searchCriteria, (err, results) => {
            if (err) {
              console.error('Error searching emails:', err);
              imap.end();
              reject(err);
              return;
            }

            if (!results || !results.length) {
              console.log('No newsletter emails found in the last 7 days');
              // Try just searching for any emails in the last 7 days
              imap.search(['SINCE', oneWeekAgo], (err2, allResults) => {
                if (!err2 && allResults && allResults.length > 0) {
                  console.log(`Found ${allResults.length} total emails in the last 7 days`);
                  processSearchResults(allResults.slice(0, 10)); // Process first 10
                } else {
                  imap.end();
                  resolve(newsItems);
                }
              });
              return;
            }

            console.log(`Found ${results.length} newsletter emails`);
            processSearchResults(results);
          });
          
          function processSearchResults(results) {
            const fetch = imap.fetch(results, { 
              bodies: '', 
              markSeen: false // Don't mark as read during testing
            });

            let processedCount = 0;

            fetch.on('message', (msg, seqno) => {
              console.log(`Processing message #${seqno}`);
              
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error('Error parsing email:', err);
                    return;
                  }

                  try {
                    console.log(`Email from: ${parsed.from?.text}`);
                    console.log(`Subject: ${parsed.subject}`);
                    
                    const newsItem = await extractNewsContent(parsed);
                    if (newsItem) {
                      newsItems.push(newsItem);
                      console.log(`✅ Extracted ${newsItem.items.length} news items from ${newsItem.source}`);
                    }
                  } catch (error) {
                    console.error('Error extracting content:', error);
                  }
                  
                  processedCount++;
                  if (processedCount === results.length) {
                    console.log('All messages processed');
                    imap.end();
                    resolve(newsItems);
                  }
                });
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
              reject(err);
            });

            fetch.once('end', () => {
              console.log('Fetch completed');
              if (processedCount === 0) {
                imap.end();
                resolve(newsItems);
              }
            });
          }
        });
      }
    });

    imap.once('error', (err) => {
      console.error('IMAP error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    console.log('Connecting to Gmail...');
    imap.connect();
  });
}

// Extract news content from email
async function extractNewsContent(email) {
  const from = email.from?.text?.toLowerCase() || '';
  const subject = email.subject || '';
  const html = email.html || email.textAsHtml || '';
  const text = email.text || '';
  
  // Identify newsletter source
  let source = 'Unknown';
  for (const newsletter of config.newsletters) {
    if (from.includes(newsletter)) {
      source = newsletter.charAt(0).toUpperCase() + newsletter.slice(1);
      break;
    }
  }

  // If not a known newsletter, check subject and content
  if (source === 'Unknown') {
    const content = (subject + ' ' + from).toLowerCase();
    if (content.includes('ai') || content.includes('artificial intelligence') || 
        content.includes('machine learning') || content.includes('gpt')) {
      source = 'AI Newsletter';
    } else {
      return null; // Skip non-AI emails
    }
  }

  // Parse HTML content
  const $ = cheerio.load(html || text);
  
  const newsItem = {
    source: source,
    date: email.date || new Date(),
    subject: subject,
    items: []
  };

  // Try different extraction strategies based on common newsletter patterns
  
  // Strategy 1: Look for article/section tags
  $('article, section').each((i, elem) => {
    const $elem = $(elem);
    const headline = $elem.find('h1, h2, h3, h4').first().text().trim();
    const summary = $elem.find('p').first().text().trim();
    const link = $elem.find('a').first().attr('href');
    
    if (headline && (summary || link)) {
      newsItem.items.push({
        headline: headline,
        summary: summary || '',
        link: link || '',
        timestamp: new Date()
      });
    }
  });

  // Strategy 2: Look for headlines followed by content
  if (newsItem.items.length === 0) {
    $('h2, h3, h4').each((i, elem) => {
      const headline = $(elem).text().trim();
      const $next = $(elem).next();
      let summary = '';
      let link = '';
      
      if ($next.is('p')) {
        summary = $next.text().trim();
        link = $next.find('a').attr('href') || $(elem).find('a').attr('href');
      } else if ($next.is('a')) {
        link = $next.attr('href');
        summary = $next.text().trim();
      }
      
      if (headline && headline.length > 5 && headline.length < 200) {
        newsItem.items.push({
          headline: headline,
          summary: summary.substring(0, 300) + (summary.length > 300 ? '...' : ''),
          link: link || '',
          timestamp: new Date()
        });
      }
    });
  }

  // Strategy 3: Look for list items with links
  if (newsItem.items.length === 0) {
    $('li').each((i, elem) => {
      const $elem = $(elem);
      const $link = $elem.find('a').first();
      if ($link.length > 0) {
        const headline = $link.text().trim();
        const link = $link.attr('href');
        const summary = $elem.text().replace(headline, '').trim();
        
        if (headline && isRelevantLink(link || '', headline)) {
          newsItem.items.push({
            headline: headline,
            summary: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
            link: link || '',
            timestamp: new Date()
          });
        }
      }
    });
  }

  // Limit items per newsletter
  newsItem.items = newsItem.items.slice(0, 10);

  return newsItem.items.length > 0 ? newsItem : null;
}

// Filter for relevant AI news
function isRelevantLink(link, text) {
  const relevantKeywords = ['ai', 'gpt', 'claude', 'machine learning', 'llm', 'openai', 
                           'anthropic', 'google', 'microsoft', 'artificial intelligence',
                           'neural', 'model', 'chatbot', 'generative'];
  const lowercaseText = text.toLowerCase();
  const lowercaseLink = link.toLowerCase();
  
  return relevantKeywords.some(keyword => 
    lowercaseText.includes(keyword) || lowercaseLink.includes(keyword)
  );
}

// Generate newsfeed HTML
async function generateNewsfeed(newsItems) {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI News Feed - ${new Date().toLocaleDateString()}</title>
    <link rel="stylesheet" href="/css/newsfeed-css.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>AI News Feed</h1>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </header>
        
        <main>
            ${newsItems.length > 0 ? newsItems.map(newsletter => `
                <section class="newsletter-section">
                    <h2>${newsletter.source}</h2>
                    <p class="date">${new Date(newsletter.date).toLocaleDateString()}</p>
                    <p class="subject">${newsletter.subject}</p>
                    <div class="news-items">
                        ${newsletter.items.map(item => `
                            <article class="news-item">
                                <h3>${item.headline}</h3>
                                ${item.summary ? `<p>${item.summary}</p>` : ''}
                                ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Read more →</a>` : ''}
                            </article>
                        `).join('')}
                    </div>
                </section>
            `).join('') : '<p class="no-news">No new AI newsletters found in the last 7 days.</p>'}
        </main>
        
        <footer>
            <p>Aggregated from: Ben's Bites, The Rundown AI, TLDR AI, The Neuron, Superhuman AI</p>
            <p>Powered by Gmail integration</p>
        </footer>
    </div>
</body>
</html>
  `;

  // Save the newsfeed
  const outputPath = path.join(__dirname, '..', 'newsfeed', 'index.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, template);
  
  // Also save as JSON for potential future use
  const jsonPath = path.join(__dirname, '..', 'newsfeed', 'data.json');
  await fs.writeFile(jsonPath, JSON.stringify(newsItems, null, 2));
  
  console.log('✅ Newsfeed generated successfully!');
  console.log(`HTML: ${outputPath}`);
  console.log(`JSON: ${jsonPath}`);
}

// Main execution
async function main() {
  try {
    // Check for Gmail credentials
    if (!config.password) {
      console.error('❌ GMAIL_APP_PASSWORD environment variable is not set!');
      console.log('Please set: export GMAIL_APP_PASSWORD="your-app-password"');
      process.exit(1);
    }
    
    console.log('🚀 Starting Gmail email processing...');
    console.log(`📧 Using email: ${config.email}`);
    
    const newsItems = await processEmails();
    
    console.log(`\n📊 Summary:`);
    console.log(`Found ${newsItems.length} newsletters with content`);
    
    if (newsItems.length > 0) {
      const totalItems = newsItems.reduce((sum, nl) => sum + nl.items.length, 0);
      console.log(`Total news items extracted: ${totalItems}`);
      
      newsItems.forEach(nl => {
        console.log(`\n📰 ${nl.source}: ${nl.items.length} items`);
        nl.items.slice(0, 3).forEach(item => {
          console.log(`  - ${item.headline.substring(0, 60)}${item.headline.length > 60 ? '...' : ''}`);
        });
      });
      
      await generateNewsfeed(newsItems);
    } else {
      console.log('No newsletter content found - generating empty newsfeed');
      await generateNewsfeed([]);
    }
  } catch (error) {
    console.error('❌ Error in main process:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processEmails, generateNewsfeed };