// Gmail version of email-to-newsfeed script with enhanced newsletter support and smart filtering
// This script connects to Gmail, reads newsletters, and generates newsfeed content

const fs = require('fs').promises;
const path = require('path');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cheerio = require('cheerio');

// Configuration for Gmail
const config = {
  gmail: {
    email: process.env.GMAIL_EMAIL || 'daviscal541@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD,
    labelName: 'AI-Newsletters'
  },
  dataFiles: {
    subscriptions: path.join(__dirname, '..', 'AI Subscriptions.xlsx'),
    contacts: path.join(__dirname, '..', 'contacts.csv')
  },
  imap: {
    user: process.env.GMAIL_EMAIL || 'daviscal541@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000
  },
  // Legacy newsletters (kept for backward compatibility)
  legacyNewsletters: [
    'bensbites',
    'therundown',
    'tldr',
    'theneuron',
    'superhuman'
  ],
  // Content filtering configuration
  filtering: {
    enableSmartFiltering: true,
    minContentLength: 50,
    minQualityScore: 60,
    preserveShortHeadlines: true,
    debugMode: false,
    customBlacklist: [],
    customWhitelist: []
  }
};

// Newsletter Content Filter Class
class NewsletterContentFilter {
  constructor(config = {}) {
    this.config = { ...config.filtering };
    this.setupFilters();
    this.filterStats = {
      total: 0,
      filtered: 0,
      reasons: {}
    };
  }

  setupFilters() {
    // Navigation patterns
    this.navigationPatterns = [
      /^it['']s\s+a\s+\w+$/i,
      /^(read more|click here|view more|see more|learn more)$/i,
      /^(next|previous|back|forward|home|menu)$/i,
      /^[→›▸▶←‹◂◀↑↓˄˅]\s*$/,
      /^(view|open|close|expand|collapse)$/i
    ];

    // Subscription/payment patterns
    this.subscriptionPatterns = [
      /keep reading with.*trial/i,
      /upgrade to.*premium/i,
      /subscribe.*newsletter/i,
      /become a (paid|premium|pro) (member|subscriber)/i,
      /\$\d+.*per (month|year)/i,
      /start your free trial/i,
      /unlock.*access/i,
      /support.*journalism/i
    ];

    // Welcome/onboarding patterns
    this.welcomePatterns = [
      /^welcome to/i,
      /^you['']re in/i,
      /^you just unlocked/i,
      /^thanks for (subscribing|joining)/i,
      /^here['']s what you (get|can expect)/i,
      /^how to (use|get started)/i,
      /^getting started/i,
      /who this newsletter is for/i
    ];

    // Meta content patterns
    this.metaPatterns = [
      /^(in this issue|this week|today['']s topics|what['']s inside):?$/i,
      /^every (week|day|month), you['']ll (get|receive)/i,
      /^(quick links|resources|sections|contents):?$/i,
      /^to make the most of/i,
      /^here['']s what['']s/i,
      /^table of contents/i
    ];

    // Author signature patterns
    this.signaturePatterns = [
      /^(best|kind|warm) regards,?$/i,
      /^(sincerely|thanks|cheers),?$/i,
      /^-+\s*[\w\s]+$/,  // --- Name
      /^\w+\s+\w+,?\s*(MD|PhD|MBA|MSc|MS|MA|BA|BS|JD|CPA|CEO|CTO|CFO)/i,
      /^sent from my/i
    ];

    // Boilerplate/legal patterns
    this.boilerplatePatterns = [
      /unsubscribe|opt.?out/i,
      /this email was sent to/i,
      /privacy policy|terms of service/i,
      /copyright \d{4}/i,
      /all rights reserved/i,
      /update your preferences/i,
      /view in browser/i,
      /forward to a friend/i
    ];

    // Common UI/navigation words
    this.navigationWords = new Set([
      'home', 'about', 'contact', 'menu', 'search', 'login', 'logout',
      'profile', 'settings', 'help', 'faq', 'support', 'share', 'tweet',
      'follow', 'like', 'comment', 'reply', 'more', 'less', 'show', 'hide'
    ]);

    // Valid news content starters
    this.validContentStarters = [
      /^(researchers|scientists|engineers) (at|from|in)/i,
      /^a (new|recent|latest) (study|report|survey|analysis)/i,
      /^(google|microsoft|apple|amazon|meta|openai|anthropic)/i,
      /^\w+ (announced|revealed|launched|released|introduced)/i,
      /^according to/i,
      /^in a (move|bid|push) to/i,
      /^the (latest|newest|upcoming)/i
    ];
  }

  // Main filtering method
  isValidContent(item) {
    const headline = item.headline || '';
    const summary = item.summary || '';
    const combinedText = `${headline} ${summary}`.trim();

    // Track statistics
    this.filterStats.total++;

    // Check if whitelisted
    if (this.isWhitelisted(combinedText)) {
      return true;
    }

    // Run quality scoring
    const score = this.scoreContent(headline, summary);
    
    if (score < this.config.minQualityScore) {
      this.addFilterReason('low_quality_score');
      if (this.config.debugMode) {
        console.log(`Filtered out (score: ${score}): "${headline}"`);
      }
      return false;
    }

    // Check specific filters
    const filterReason = this.getFilterReason(headline, summary);
    if (filterReason) {
      this.addFilterReason(filterReason);
      if (this.config.debugMode) {
        console.log(`Filtered out (${filterReason}): "${headline}"`);
      }
      return false;
    }

    return true;
  }

  // Quality scoring system
  scoreContent(headline, summary) {
    let score = 100;
    const combinedText = `${headline} ${summary}`.trim();
    const headlineLength = headline.length;

    // Length-based scoring
    if (headlineLength < 10) score -= 40;
    else if (headlineLength < 30) score -= 20;
    else if (headlineLength > 200) score -= 15;

    if (combinedText.length < this.config.minContentLength) {
      score -= 30;
    }

    // Pattern-based deductions
    if (this.matchesAnyPattern(headline, this.navigationPatterns)) score -= 50;
    if (this.matchesAnyPattern(combinedText, this.subscriptionPatterns)) score -= 40;
    if (this.matchesAnyPattern(combinedText, this.welcomePatterns)) score -= 35;
    if (this.matchesAnyPattern(headline, this.metaPatterns)) score -= 30;
    if (this.matchesAnyPattern(headline, this.signaturePatterns)) score -= 45;
    if (this.matchesAnyPattern(combinedText, this.boilerplatePatterns)) score -= 35;

    // Check for navigation words
    const words = headline.toLowerCase().split(/\s+/);
    const navWordCount = words.filter(w => this.navigationWords.has(w)).length;
    score -= navWordCount * 15;

    // Positive signals
    if (this.matchesAnyPattern(combinedText, this.validContentStarters)) score += 25;
    if (this.hasProperSentenceStructure(headline)) score += 15;
    if (this.containsNewsKeywords(combinedText)) score += 20;
    if (summary && summary.length > 50) score += 10;
    if (headline.includes(':') && headlineLength > 30) score += 10; // Likely a proper title

    // Special case: preserve short headlines if they look valid
    if (this.config.preserveShortHeadlines && headlineLength < 50 && headlineLength > 20) {
      if (this.looksLikeValidHeadline(headline)) {
        score += 30;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  // Get specific filter reason
  getFilterReason(headline, summary) {
    const combinedText = `${headline} ${summary}`.trim();

    // Check blacklist
    if (this.isBlacklisted(combinedText)) return 'blacklisted';

    // Check each filter category
    if (this.matchesAnyPattern(headline, this.navigationPatterns)) return 'navigation';
    if (this.matchesAnyPattern(combinedText, this.subscriptionPatterns)) return 'subscription';
    if (this.matchesAnyPattern(combinedText, this.welcomePatterns)) return 'welcome';
    if (this.matchesAnyPattern(headline, this.metaPatterns)) return 'meta';
    if (this.matchesAnyPattern(headline, this.signaturePatterns)) return 'signature';
    if (this.matchesAnyPattern(combinedText, this.boilerplatePatterns)) return 'boilerplate';

    // Single word checks
    if (headline.split(/\s+/).length === 1 && this.navigationWords.has(headline.toLowerCase())) {
      return 'single_nav_word';
    }

    // Too short
    if (headline.length < 10 && !this.looksLikeValidHeadline(headline)) {
      return 'too_short';
    }

    return null;
  }

  // Helper methods
  matchesAnyPattern(text, patterns) {
    return patterns.some(pattern => pattern.test(text));
  }

  hasProperSentenceStructure(text) {
    // Check if it looks like a proper sentence/headline
    const startsWithCapital = /^[A-Z]/.test(text);
    const hasMultipleWords = text.split(/\s+/).length >= 3;
    const notAllCaps = text !== text.toUpperCase();
    
    return startsWithCapital && hasMultipleWords && notAllCaps;
  }

  containsNewsKeywords(text) {
    const newsKeywords = [
      'announce', 'launch', 'release', 'reveal', 'introduce', 'develop',
      'research', 'study', 'report', 'discover', 'breakthrough', 'innovation',
      'partnership', 'acquisition', 'funding', 'investment', 'raise',
      'update', 'upgrade', 'improve', 'enhance', 'expand'
    ];
    
    const lowerText = text.toLowerCase();
    return newsKeywords.some(keyword => lowerText.includes(keyword));
  }

  looksLikeValidHeadline(headline) {
    // Check if short text could be a valid headline
    const validShortPatterns = [
      /^[A-Z][a-z]+\s+\d+/,  // "GPT 4", "Claude 3"
      /^[A-Z]{2,}/,          // Acronyms
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/, // Proper names
    ];
    
    return this.matchesAnyPattern(headline, validShortPatterns) ||
           this.containsNewsKeywords(headline);
  }

  isBlacklisted(text) {
    return this.config.customBlacklist.some(pattern => 
      new RegExp(pattern, 'i').test(text)
    );
  }

  isWhitelisted(text) {
    return this.config.customWhitelist.some(pattern => 
      new RegExp(pattern, 'i').test(text)
    );
  }

  addFilterReason(reason) {
    this.filterStats.filtered++;
    this.filterStats.reasons[reason] = (this.filterStats.reasons[reason] || 0) + 1;
  }

  // Filter an array of news items
  filterNewsItems(items) {
    const filtered = items.filter(item => this.isValidContent(item));
    
    if (this.config.debugMode) {
      console.log(`\nFiltering Statistics:`);
      console.log(`Total items: ${this.filterStats.total}`);
      console.log(`Filtered out: ${this.filterStats.filtered}`);
      console.log(`Kept: ${filtered.length}`);
      console.log(`Filter reasons:`, this.filterStats.reasons);
    }

    return filtered;
  }

  // Reset statistics
  resetStats() {
    this.filterStats = {
      total: 0,
      filtered: 0,
      reasons: {}
    };
  }
}

// Newsletter sender management
const newsletterSenders = new Map();
const newsletterNames = new Map();

// Parse CSV file to extract newsletter contacts
async function parseContactsCSV() {
  try {
    const csvContent = await fs.readFile(config.dataFiles.contacts, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing - assuming email is in the last column
      const parts = line.split(',');
      if (parts.length < 2) continue;
      
      const email = parts[parts.length - 1].trim();
      // Extract a meaningful name from the row
      const firstName = parts[0].trim();
      const middleName = parts[1].trim();
      const lastName = parts[2].trim();
      
      let newsletterName = '';
      if (firstName && !firstName.includes('@')) {
        newsletterName = firstName;
        if (middleName && !middleName.includes('@')) {
          newsletterName += ' ' + middleName;
        }
        if (lastName && !lastName.includes('@')) {
          newsletterName += ' ' + lastName;
        }
      }
      
      // Clean up the name
      newsletterName = newsletterName.replace(/from /g, '').trim();
      
      if (email && email.includes('@')) {
        newsletterSenders.set(email.toLowerCase(), true);
        if (newsletterName) {
          newsletterNames.set(email.toLowerCase(), newsletterName);
        }
      }
    }
    
    console.log(`✅ Loaded ${newsletterSenders.size} newsletter sender emails from contacts.csv`);
    return true;
  } catch (error) {
    console.error('⚠️ Warning: Could not parse contacts.csv:', error.message);
    console.log('Continuing with legacy newsletter list...');
    return false;
  }
}

// Initialize newsletter data
async function initializeNewsletterData() {
  await parseContactsCSV();
  
  // Add legacy newsletters to the map
  const legacyMap = {
    'bensbites': "Ben's Bites",
    'therundown': 'The Rundown AI',
    'tldr': 'TLDR AI',
    'theneuron': 'The Neuron',
    'superhuman': 'Superhuman AI'
  };
  
  // These are common patterns for the legacy newsletters
  Object.entries(legacyMap).forEach(([key, name]) => {
    newsletterSenders.set(key, true);
    newsletterNames.set(key, name);
  });
}

// Initialize IMAP connection
function createImapConnection() {
  return new Imap(config.imap);
}

// Check if email is from a known newsletter
function isNewsletterEmail(from) {
  const fromLower = from.toLowerCase();
  
  // Check exact email match
  if (newsletterSenders.has(fromLower)) {
    return true;
  }
  
  // Check if the from contains any known newsletter patterns
  for (const [pattern] of newsletterSenders) {
    if (fromLower.includes(pattern)) {
      return true;
    }
  }
  
  // Check legacy patterns
  for (const pattern of config.legacyNewsletters) {
    if (fromLower.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// Get newsletter name from email
function getNewsletterName(from) {
  const fromLower = from.toLowerCase();
  
  // Check exact email match
  if (newsletterNames.has(fromLower)) {
    return newsletterNames.get(fromLower);
  }
  
  // Check patterns
  for (const [email, name] of newsletterNames) {
    if (fromLower.includes(email) && name) {
      return name;
    }
  }
  
  // Check legacy patterns
  const legacyMap = {
    'bensbites': "Ben's Bites",
    "ben's bites": "Ben's Bites",
    'therundown': 'The Rundown AI',
    'rundown': 'The Rundown AI',
    'tldr': 'TLDR AI',
    'theneuron': 'The Neuron',
    'neuron': 'The Neuron',
    'superhuman': 'Superhuman AI'
  };
  
  for (const [key, name] of Object.entries(legacyMap)) {
    if (fromLower.includes(key)) {
      return name;
    }
  }
  
  return null;
}

// Create or get Gmail label
async function ensureGmailLabel(imap) {
  return new Promise((resolve) => {
    // For now, we'll just try to use the label
    // Gmail IMAP doesn't have a direct way to create labels
    // Labels need to be created via Gmail interface or API
    console.log(`ℹ️ Using label: ${config.gmail.labelName}`);
    console.log('Note: If the label does not exist, please create it in Gmail first.');
    resolve();
  });
}

// Apply label to email
function applyLabel(imap, uid, callback) {
  // Gmail uses IMAP extensions to manage labels
  // Labels are applied using the STORE command with Gmail-specific flags
  imap.seq.addFlags(uid, ['\\Seen', config.gmail.labelName], (err) => {
    if (err) {
      console.log(`⚠️ Could not apply label to message ${uid}:`, err.message);
    } else {
      console.log(`✅ Applied label "${config.gmail.labelName}" to message ${uid}`);
    }
    callback();
  });
}

// Process emails
async function processEmails() {
  return new Promise((resolve, reject) => {
    const newsItems = [];
    const imap = createImapConnection();
    let processedNewsletterCount = 0;
    
    // Initialize content filter
    const contentFilter = new NewsletterContentFilter(config);
    
    imap.once('ready', () => {
      console.log('✅ Connected to Gmail successfully!');
      
      // Ensure label exists
      ensureGmailLabel(imap).then(() => {
        // Try different folder names for Gmail
        const folderNames = ['INBOX', '[Gmail]/All Mail', config.gmail.labelName];
        
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
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            console.log(`Searching for emails since: ${oneWeekAgo.toDateString()}`);
            console.log(`Checking against ${newsletterSenders.size} known newsletter senders...`);
            
            // Search for recent emails
            imap.search([['SINCE', oneWeekAgo]], (err, results) => {
              if (err) {
                console.error('Error searching emails:', err);
                imap.end();
                reject(err);
                return;
              }

              if (!results || !results.length) {
                console.log('No emails found in the last 7 days');
                console.log('Trying to search without date restriction...');
                
                // Try searching without date restriction (last 20 emails)
                imap.search(['ALL'], (err2, results2) => {
                  if (!err2 && results2 && results2.length > 0) {
                    console.log(`Found ${results2.length} total emails`);
                    processSearchResults(results2.slice(-20)); // Process last 20
                  } else {
                    console.log('No emails found at all');
                    imap.end();
                    resolve(newsItems);
                  }
                });
                return;
              }

              console.log(`Found ${results.length} emails in the last 7 days`);
              processSearchResults(results);
            });
            
            function processSearchResults(results) {
              const fetch = imap.fetch(results, { 
                bodies: '', 
                markSeen: false
              });

              let processedCount = 0;
              let needsLabelCount = 0;

              fetch.on('message', (msg, seqno) => {
                console.log(`Processing message #${seqno}`);
                
                msg.on('body', (stream) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) {
                      console.error('Error parsing email:', err);
                      processedCount++;
                      if (processedCount === results.length) {
                        finishProcessing();
                      }
                      return;
                    }

                    try {
                      const from = parsed.from?.text || '';
                      const fromEmail = parsed.from?.value?.[0]?.address || '';
                      console.log(`Email from: ${from}`);
                      console.log(`Subject: ${parsed.subject}`);
                      
                      // Check if this is a newsletter
                      if (isNewsletterEmail(fromEmail) || isNewsletterEmail(from)) {
                        processedNewsletterCount++;
                        
                        const newsItem = await extractNewsContent(parsed, contentFilter);
                        if (newsItem && newsItem.items.length > 0) {
                          newsItems.push(newsItem);
                          console.log(`✅ Extracted ${newsItem.items.length} quality news items from ${newsItem.source}`);
                          
                          // Mark that this email needs the label
                          if (folderName === 'INBOX') {
                            needsLabelCount++;
                            // Apply label to this message
                            applyLabel(imap, seqno, () => {
                              // Continue processing
                            });
                          }
                        }
                      } else {
                        console.log('Not identified as a newsletter email');
                      }
                    } catch (error) {
                      console.error('Error extracting content:', error);
                    }
                    
                    processedCount++;
                    if (processedCount === results.length) {
                      finishProcessing();
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
                  finishProcessing();
                }
              });
              
              function finishProcessing() {
                console.log(`\n📊 Processing Summary:`);
                console.log(`Total emails checked: ${results.length}`);
                console.log(`Newsletter emails found: ${processedNewsletterCount}`);
                console.log(`Emails that needed labeling: ${needsLabelCount}`);
                console.log(`Total news items extracted: ${newsItems.reduce((sum, nl) => sum + nl.items.length, 0)}`);
                imap.end();
                resolve(newsItems);
              }
            }
          });
        }
      });
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

// Extract news content from email with filtering
async function extractNewsContent(email, contentFilter) {
  const from = email.from?.text?.toLowerCase() || '';
  const fromEmail = email.from?.value?.[0]?.address?.toLowerCase() || '';
  const subject = email.subject || '';
  const html = email.html || email.textAsHtml || '';
  const text = email.text || '';
  
  console.log(`\nAnalyzing email from: ${email.from?.text || 'Unknown'}`);
  console.log(`Subject: ${subject}`);
  
  // Identify newsletter source
  let source = getNewsletterName(fromEmail) || getNewsletterName(from);
  
  if (!source) {
    // If not a known newsletter, check if it's AI-related
    const content = (subject + ' ' + from + ' ' + text.substring(0, 500)).toLowerCase();
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'claude', 
                       'openai', 'anthropic', 'llm', 'neural', 'deepmind', 'chatbot'];
    
    const hasAIContent = aiKeywords.some(keyword => content.includes(keyword));
    
    if (hasAIContent) {
      source = 'AI Newsletter';
      console.log('Identified as generic AI Newsletter based on content');
    } else {
      console.log('Not identified as AI-related, skipping');
      return null;
    }
  } else {
    console.log(`Identified as: ${source}`);
  }

  // Parse HTML content
  const $ = cheerio.load(html || text);
  
  const newsItem = {
    source: source,
    date: email.date || new Date(),
    subject: subject,
    items: []
  };

  // Reset filter statistics for this newsletter
  contentFilter.resetStats();

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

  // Apply smart filtering
  console.log(`Pre-filter: ${newsItem.items.length} items extracted`);
  newsItem.items = contentFilter.filterNewsItems(newsItem.items);
  console.log(`Post-filter: ${newsItem.items.length} quality items retained`);

  // Limit items per newsletter (after filtering)
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

// Helper function for statistics
function getMostFrequentSources(history) {
  const sourceCount = {};
  
  history.forEach(run => {
    run.sources.forEach(source => {
      sourceCount[source.name] = (sourceCount[source.name] || 0) + source.items;
    });
  });
  
  return Object.entries(sourceCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, totalItems: count }));
}

// Generate newsfeed HTML
async function generateNewsfeed(newsItems) {
  const totalItems = newsItems.reduce((sum, nl) => sum + nl.items.length, 0);
  const updateTime = new Date();
  
  // Group newsletters by source for better organization
  const sourceColors = {
    "Ben's Bites": '#FF6B6B',
    'The Rundown AI': '#4ECDC4',
    'TLDR AI': '#45B7D1',
    'The Neuron': '#96CEB4',
    'Superhuman AI': '#DDA0DD',
    'AI Newsletter': '#6C5CE7'
  };
  
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI News Feed - ${updateTime.toLocaleDateString()}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f7f9fc;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: white;
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        h1 {
            font-size: 3em;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .update-info {
            color: #6b7280;
            font-size: 1.1em;
            margin-bottom: 20px;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: 700;
            color: #667eea;
            display: block;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .filters {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .filter-chips {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .filter-chip {
            padding: 8px 16px;
            border-radius: 20px;
            background: #f3f4f6;
            color: #4b5563;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        
        .filter-chip:hover {
            background: #e5e7eb;
        }
        
        .filter-chip.active {
            background: #667eea;
            color: white;
            border-color: #5a52d5;
        }
        
        main {
            display: grid;
            gap: 30px;
        }
        
        .newsletter-section {
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .newsletter-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .newsletter-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .newsletter-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .source-indicator {
            width: 6px;
            height: 40px;
            border-radius: 3px;
        }
        
        .newsletter-section h2 {
            font-size: 1.8em;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .newsletter-meta {
            text-align: right;
        }
        
        .date {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .item-count {
            color: #667eea;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .news-items {
            display: grid;
            gap: 20px;
        }
        
        .news-item {
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            border-left: 4px solid #e5e7eb;
            transition: all 0.2s;
        }
        
        .news-item:hover {
            background: #f3f4f6;
            border-left-color: #667eea;
            transform: translateX(4px);
        }
        
        .news-item h3 {
            font-size: 1.2em;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .news-item p {
            color: #4b5563;
            margin-bottom: 12px;
            line-height: 1.7;
        }
        
        .news-item a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: gap 0.2s;
        }
        
        .news-item a:hover {
            gap: 8px;
            text-decoration: underline;
        }
        
        .no-news {
            text-align: center;
            padding: 60px;
            color: #6b7280;
            font-size: 1.2em;
        }
        
        footer {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
            font-size: 0.9em;
        }
        
        footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2em;
            }
            
            .stats {
                flex-direction: column;
                gap: 20px;
            }
            
            .newsletter-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .newsletter-meta {
                text-align: left;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background: #0f172a;
                color: #e2e8f0;
            }
            
            header, .newsletter-section, .filters {
                background: #1e293b;
            }
            
            .news-item {
                background: #334155;
            }
            
            .news-item:hover {
                background: #475569;
            }
            
            h1 {
                background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .newsletter-section h2, .news-item h3 {
                color: #f1f5f9;
            }
            
            .news-item p, .date, .update-info, .stat-label {
                color: #cbd5e1;
            }
            
            .filter-chip {
                background: #334155;
                color: #e2e8f0;
            }
            
            .filter-chip:hover {
                background: #475569;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>AI News Feed</h1>
            <p class="update-info">Last updated: ${updateTime.toLocaleString()}</p>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number">${newsletterSenders.size}</span>
                    <span class="stat-label">Newsletters Monitored</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${newsItems.length}</span>
                    <span class="stat-label">Active Sources</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${totalItems}</span>
                    <span class="stat-label">Quality News Items</span>
                </div>
            </div>
        </header>
        
        <div class="filters">
            <div class="filter-chips">
                <span class="filter-chip active" onclick="filterNewsletters('all')">All Sources</span>
                ${[...new Set(newsItems.map(n => n.source))].map(source => 
                    `<span class="filter-chip" onclick="filterNewsletters('${source}')">${source}</span>`
                ).join('')}
            </div>
        </div>
        
        <main>
            ${newsItems.length > 0 ? newsItems.map(newsletter => {
                const sourceColor = sourceColors[newsletter.source] || '#6C5CE7';
                return `
                <section class="newsletter-section" data-source="${newsletter.source}">
                    <div class="newsletter-header">
                        <div class="newsletter-title">
                            <div class="source-indicator" style="background: ${sourceColor}"></div>
                            <h2>${newsletter.source}</h2>
                        </div>
                        <div class="newsletter-meta">
                            <p class="date">${new Date(newsletter.date).toLocaleDateString()}</p>
                            <p class="item-count">${newsletter.items.length} items</p>
                        </div>
                    </div>
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
                `;
            }).join('') : '<p class="no-news">No new AI newsletters found in the last 7 days.</p>'}
        </main>
        
        <footer>
            <p>Aggregated from ${newsletterSenders.size} AI newsletter sources</p>
            <p>Powered by Gmail integration with smart content filtering</p>
            <p><a href="https://github.com/calebcrim/ai-tools-dashboard" target="_blank">View on GitHub</a></p>
        </footer>
    </div>
    
    <script>
        function filterNewsletters(source) {
            const sections = document.querySelectorAll('.newsletter-section');
            const chips = document.querySelectorAll('.filter-chip');
            
            chips.forEach(chip => {
                chip.classList.remove('active');
                if (chip.textContent === source || (source === 'all' && chip.textContent === 'All Sources')) {
                    chip.classList.add('active');
                }
            });
            
            sections.forEach(section => {
                if (source === 'all' || section.dataset.source === source) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    </script>
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
  
  // Save a report of processed newsletters
  const reportPath = path.join(__dirname, '..', 'newsfeed', 'newsletter-report.json');
  const report = {
    processedAt: new Date().toISOString(),
    totalNewsletters: newsletterSenders.size,
    newslettersWithContent: newsItems.length,
    totalNewsItems: totalItems,
    averageItemsPerNewsletter: newsItems.length > 0 ? (totalItems / newsItems.length).toFixed(1) : 0,
    sources: newsItems.map(nl => ({
      name: nl.source,
      itemCount: nl.items.length
    }))
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  // Save detailed statistics
  const statsPath = path.join(__dirname, '..', 'newsfeed', 'stats.json');
  let existingStats = { history: [] };
  
  try {
    const statsContent = await fs.readFile(statsPath, 'utf-8');
    existingStats = JSON.parse(statsContent);
  } catch (err) {
    // File doesn't exist yet, use default
  }
  
  // Add current run to history
  const currentRun = {
    timestamp: new Date().toISOString(),
    emailsProcessed: newsItems.length,
    totalItemsExtracted: totalItems,
    filteringEnabled: config.filtering.enableSmartFiltering,
    sources: newsItems.map(nl => ({
      name: nl.source,
      items: nl.items.length
    })),
    processingTimeMs: Date.now() - startTime
  };
  
  existingStats.history.unshift(currentRun);
  
  // Keep only last 30 runs
  existingStats.history = existingStats.history.slice(0, 30);
  
  // Calculate aggregated statistics
  existingStats.aggregated = {
    totalRuns: existingStats.history.length,
    averageItemsPerRun: (existingStats.history.reduce((sum, run) => sum + run.totalItemsExtracted, 0) / existingStats.history.length).toFixed(1),
    averageProcessingTimeMs: (existingStats.history.reduce((sum, run) => sum + (run.processingTimeMs || 0), 0) / existingStats.history.length).toFixed(0),
    mostFrequentSources: getMostFrequentSources(existingStats.history),
    lastUpdated: new Date().toISOString()
  };
  
  await fs.writeFile(statsPath, JSON.stringify(existingStats, null, 2));
  
  console.log('✅ Newsfeed generated successfully!');
  console.log(`HTML: ${outputPath}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Report: ${reportPath}`);
}

// Global variable for tracking processing time
let startTime;

// Main execution
async function main() {
  try {
    startTime = Date.now();
    
    // Check for Gmail credentials
    if (!config.imap.password) {
      console.error('❌ GMAIL_APP_PASSWORD environment variable is not set!');
      console.log('Please set: export GMAIL_APP_PASSWORD="your-app-password"');
      process.exit(1);
    }
    
    console.log('🚀 Starting Gmail email processing with smart filtering...');
    console.log(`📧 Using email: ${config.gmail.email}`);
    console.log(`🏷️ Will apply label: ${config.gmail.labelName}`);
    console.log(`🧹 Smart filtering: ${config.filtering.enableSmartFiltering ? 'Enabled' : 'Disabled'}`);
    
    // Initialize newsletter data
    console.log('\n📂 Loading newsletter data...');
    await initializeNewsletterData();
    
    const newsItems = await processEmails();
    
    console.log(`\n📊 Summary:`);
    console.log(`Found ${newsItems.length} newsletters with quality content`);
    
    if (newsItems.length > 0) {
      const totalItems = newsItems.reduce((sum, nl) => sum + nl.items.length, 0);
      console.log(`Total quality news items extracted: ${totalItems}`);
      
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
    
    // Final summary
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️ Processing completed in ${processingTime} seconds`);
    console.log(`📈 Statistics saved to newsfeed/stats.json`);
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processEmails, generateNewsfeed, NewsletterContentFilter };