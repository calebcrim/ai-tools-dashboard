// Newsletter-specific parsers for better content extraction
const cheerio = require('cheerio');

class NewsletterParser {
  constructor() {
    this.parsers = {
      'The Rundown AI': this.parseRundownAI.bind(this),
      'Ben\'s Bites': this.parseBensBites.bind(this),
      'TLDR AI': this.parseTLDRAI.bind(this),
      'The Neuron': this.parseTheNeuron.bind(this),
      'AI Breakfast': this.parseAIBreakfast.bind(this),
      'Superhuman AI': this.parseSuperhumanAI.bind(this),
      'The AI Report': this.parseTheAIReport.bind(this),
      'default': this.parseDefault.bind(this)
    };
  }

  parse(html, source) {
    const parser = this.parsers[source] || this.parsers.default;
    return parser(html);
  }

  // The Rundown AI uses emoji indicators and consistent formatting
  parseRundownAI(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Strategy 1: Look for strong/bold headlines with following content
    $('p').each((i, elem) => {
      const $elem = $(elem);
      const html = $elem.html();
      const text = $elem.text();
      
      // Check if paragraph contains strong/bold text
      const strongMatch = html.match(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/i);
      if (strongMatch) {
        const headline = this.cleanText(strongMatch[1]);
        
        // Get text after the strong tag
        const afterStrong = html.split(/<\/(?:strong|b)>/i)[1];
        let summary = '';
        
        if (afterStrong) {
          // Check for colon or dash separator
          const cleanAfter = this.cleanText(afterStrong);
          summary = cleanAfter.replace(/^[:–-]\s*/, '').trim();
        }
        
        // If no summary in same paragraph, check next element
        if (!summary || summary.length < 20) {
          const $next = $elem.next();
          if ($next.length && $next.is('p')) {
            summary = $next.text().trim();
          }
        }
        
        // Extract any links
        const linkMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        const link = linkMatch ? linkMatch[1] : '';
        
        if (headline && this.isValidHeadline(headline) && (summary || link)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: link,
            timestamp: new Date()
          });
        }
      }
    });
    
    // Strategy 2: Look for list items with strong text
    $('li').each((i, elem) => {
      const $elem = $(elem);
      const html = $elem.html();
      
      // Check for strong/bold headline
      const strongMatch = html.match(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/i);
      if (strongMatch) {
        const headline = this.cleanText(strongMatch[1]);
        
        // Get remaining text as summary
        const fullText = $elem.text();
        const headlineText = strongMatch[1];
        const summary = fullText.substring(fullText.indexOf(headlineText) + headlineText.length)
          .replace(/^[:–-]\s*/, '').trim();
        
        // Extract links
        const linkMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        const link = linkMatch ? linkMatch[1] : '';
        
        if (headline && this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: link,
            timestamp: new Date()
          });
        }
      }
    });
    
    // Strategy 3: Look for heading + paragraph patterns
    $('h2, h3, h4').each((i, elem) => {
      const $elem = $(elem);
      const heading = $elem.text().trim();
      
      // Skip section headers with emojis
      if (/^[🚀💡📰🔮⚡]/.test(heading)) {
        return;
      }
      
      // Check next element for content
      const $next = $elem.next();
      if ($next.is('p')) {
        const summary = $next.text().trim();
        const link = $next.find('a').attr('href') || '';
        
        if (this.isValidHeadline(heading) && summary) {
          items.push({
            headline: heading,
            summary: summary.substring(0, 300),
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // Ben's Bites uses consistent div structure
  parseBensBites(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for news items in specific div patterns
    $('div').each((i, elem) => {
      const $elem = $(elem);
      const $link = $elem.find('a').first();
      
      if ($link.length > 0) {
        const headline = $link.text().trim();
        const link = $link.attr('href');
        
        // Look for description in next sibling or parent
        let summary = '';
        const $nextP = $elem.next('p');
        const $parentNext = $elem.parent().next('p');
        
        if ($nextP.length > 0) {
          summary = $nextP.text().trim();
        } else if ($parentNext.length > 0) {
          summary = $parentNext.text().trim();
        } else {
          // Try to get any text after the link
          const elemText = $elem.text();
          const linkText = $link.text();
          summary = elemText.replace(linkText, '').trim();
        }
        
        if (headline && this.isValidHeadline(headline) && (summary || link)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: link || '',
            timestamp: new Date()
          });
        }
      }
    });

    // Also check for bullet points
    $('li').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      const html = $elem.html();
      
      // Extract headline and summary from bullet point
      const $strong = $elem.find('strong, b').first();
      if ($strong.length > 0) {
        const headline = $strong.text().trim();
        const summary = text.replace(headline, '').replace(/^[-–—:]\s*/, '').trim();
        const linkMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        
        if (this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: linkMatch ? linkMatch[1] : '',
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // TLDR AI uses numbered lists and consistent formatting
  parseTLDRAI(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for numbered list items
    $('li').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      const html = $elem.html();
      
      // TLDR often uses "Headline (X minute read)" format
      const headlineMatch = text.match(/^([^(]+)(?:\s*\(\d+\s*minute?\s*read\))?/);
      if (headlineMatch) {
        const headline = this.cleanText(headlineMatch[1]);
        
        // Look for description after the headline
        const $p = $elem.find('p').first();
        let summary = '';
        if ($p.length > 0) {
          summary = $p.text().trim();
        } else {
          // Get remaining text
          const remainingText = text.substring(headlineMatch[0].length).trim();
          summary = remainingText.replace(/^[-–—:]\s*/, '');
        }
        
        const linkMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        
        if (headline && this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: linkMatch ? linkMatch[1] : '',
            timestamp: new Date()
          });
        }
      }
    });

    // Also check for section headers followed by content
    $('h3, h4').each((i, elem) => {
      const $elem = $(elem);
      const headline = $elem.text().trim();
      const $next = $elem.next();
      
      if ($next.is('p') || $next.is('div')) {
        const summary = $next.text().trim();
        const linkMatch = $next.html().match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        
        if (this.isValidHeadline(headline) && summary) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: linkMatch ? linkMatch[1] : '',
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // The Neuron uses card-like structures
  parseTheNeuron(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for news cards or sections
    $('table td, div[style*="border"], div[style*="background"]').each((i, elem) => {
      const $elem = $(elem);
      const $heading = $elem.find('h2, h3, h4, strong').first();
      
      if ($heading.length > 0) {
        const headline = $heading.text().trim();
        const $link = $elem.find('a');
        const link = $link.attr('href') || '';
        
        // Get all text after the heading
        const allText = $elem.text();
        const headingText = $heading.text();
        const summary = allText.substring(allText.indexOf(headingText) + headingText.length)
          .trim()
          .substring(0, 300);
        
        if (this.isValidHeadline(headline) && (summary || link)) {
          items.push({
            headline: headline,
            summary: summary,
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // AI Breakfast uses consistent article structure
  parseAIBreakfast(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for article-like structures
    $('article, div[class*="article"], div[class*="post"]').each((i, elem) => {
      const $elem = $(elem);
      const $title = $elem.find('h1, h2, h3').first();
      const $summary = $elem.find('p').first();
      const $link = $elem.find('a[href*="http"]').first();
      
      if ($title.length > 0) {
        const headline = $title.text().trim();
        const summary = $summary.text().trim();
        const link = $link.attr('href') || '';
        
        if (this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    // Also check for list-based news
    $('ul li, ol li').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      
      // Look for "• Headline: Description" pattern
      const bulletMatch = text.match(/^[•·]\s*([^:]+):\s*(.+)/);
      if (bulletMatch) {
        const headline = this.cleanText(bulletMatch[1]);
        const summary = this.cleanText(bulletMatch[2]);
        const $link = $elem.find('a');
        
        if (this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: $link.attr('href') || '',
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // Superhuman AI uses a clean, structured format
  parseSuperhumanAI(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for main content sections
    $('div, td').each((i, elem) => {
      const $elem = $(elem);
      
      // Check if this looks like a news item container
      const hasHeading = $elem.find('h2, h3, h4, strong').length > 0;
      const hasContent = $elem.text().length > 100;
      
      if (hasHeading && hasContent) {
        const $heading = $elem.find('h2, h3, h4, strong').first();
        const headline = $heading.text().trim();
        
        // Get text content excluding the heading
        const fullText = $elem.text();
        const headingText = $heading.text();
        const summary = fullText.replace(headingText, '').trim().substring(0, 300);
        
        const $link = $elem.find('a[href*="http"]').first();
        const link = $link.attr('href') || '';
        
        if (this.isValidHeadline(headline) && summary) {
          items.push({
            headline: headline,
            summary: summary,
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // The AI Report uses a news article format
  parseTheAIReport(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Look for news sections with consistent patterns
    const selectors = [
      'article',
      'div[class*="news"]',
      'div[class*="story"]',
      'div[class*="item"]'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const $elem = $(elem);
        const $title = $elem.find('h1, h2, h3, h4').first();
        const $desc = $elem.find('p').first();
        const $link = $elem.find('a').first();
        
        if ($title.length > 0) {
          const headline = $title.text().trim();
          const summary = $desc.text().trim();
          const link = $link.attr('href') || '';
          
          if (this.isValidHeadline(headline)) {
            items.push({
              headline: headline,
              summary: summary.substring(0, 300),
              link: link,
              timestamp: new Date()
            });
          }
        }
      });
    });

    return this.deduplicateItems(items);
  }

  // Default parser for unknown newsletters
  parseDefault(html) {
    const $ = cheerio.load(html);
    const items = [];
    
    // Strategy 1: Look for heading + paragraph combinations
    $('h2, h3, h4').each((i, elem) => {
      const $elem = $(elem);
      const headline = $elem.text().trim();
      
      // Look for content after the heading
      let summary = '';
      let link = '';
      
      // Check next sibling
      const $next = $elem.next();
      if ($next.is('p')) {
        summary = $next.text().trim();
        link = $next.find('a').attr('href') || '';
      }
      
      // Check for link in heading
      if (!link) {
        link = $elem.find('a').attr('href') || '';
      }
      
      if (headline && this.isValidHeadline(headline) && (summary || link)) {
        items.push({
          headline: headline,
          summary: summary.substring(0, 300),
          link: link,
          timestamp: new Date()
        });
      }
    });
    
    // Strategy 2: Look for divs with strong/heading + paragraph structure
    $('div').each((i, elem) => {
      const $elem = $(elem);
      const $strong = $elem.find('strong, b').first();
      
      if ($strong.length > 0) {
        const headline = $strong.text().trim();
        
        // Look for paragraph after the strong element
        const $p = $elem.find('p').first();
        let summary = '';
        
        if ($p.length > 0) {
          summary = $p.text().trim();
        } else {
          // Get text content after the strong tag
          const elemHtml = $elem.html();
          const afterStrong = elemHtml.split(/<\/(?:strong|b)>/i)[1];
          if (afterStrong) {
            summary = this.cleanText(afterStrong).substring(0, 300);
          }
        }
        
        const link = $elem.find('a').attr('href') || '';
        
        if (headline && this.isValidHeadline(headline) && summary) {
          items.push({
            headline: headline,
            summary: summary,
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    // Strategy 3: Look for paragraphs with strong text inside
    $('p').each((i, elem) => {
      const $elem = $(elem);
      const html = $elem.html();
      
      // Check if paragraph contains strong/bold text
      const strongMatch = html.match(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/i);
      if (strongMatch) {
        const headline = this.cleanText(strongMatch[1]);
        
        // Get text after the strong tag
        const afterStrong = html.split(/<\/(?:strong|b)>/i)[1];
        let summary = '';
        
        if (afterStrong) {
          summary = this.cleanText(afterStrong).replace(/^[:–-]\s*/, '').trim();
        }
        
        const linkMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        const link = linkMatch ? linkMatch[1] : '';
        
        if (headline && this.isValidHeadline(headline) && (summary || link)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: link,
            timestamp: new Date()
          });
        }
      }
    });

    // Strategy 4: Look for list items with structure
    $('li').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      
      // Skip if too short or too long
      if (text.length < 30 || text.length > 500) return;
      
      // Look for structured content
      const $link = $elem.find('a').first();
      if ($link.length > 0) {
        const headline = $link.text().trim();
        const href = $link.attr('href') || '';
        const summary = text.replace(headline, '').trim();
        
        if (this.isValidHeadline(headline)) {
          items.push({
            headline: headline,
            summary: summary.substring(0, 300),
            link: href,
            timestamp: new Date()
          });
        }
      } else {
        // Try to parse dash/colon patterns
        const dashMatch = text.match(/^(.+?)\s*[-–—]\s*(.+)/);
        const colonMatch = text.match(/^(.+?):\s*(.+)/);
        
        if (dashMatch) {
          const headline = dashMatch[1].trim();
          const summary = dashMatch[2].trim();
          if (this.isValidHeadline(headline)) {
            items.push({
              headline: headline,
              summary: summary.substring(0, 300),
              link: '',
              timestamp: new Date()
            });
          }
        } else if (colonMatch) {
          const headline = colonMatch[1].trim();
          const summary = colonMatch[2].trim();
          if (this.isValidHeadline(headline)) {
            items.push({
              headline: headline,
              summary: summary.substring(0, 300),
              link: '',
              timestamp: new Date()
            });
          }
        }
      }
    });

    return this.deduplicateItems(items);
  }

  // Helper methods
  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^[-–—•·]\s*/, '') // Remove leading dashes/bullets
      .trim();
  }

  isValidHeadline(headline) {
    if (!headline || headline.length < 10 || headline.length > 200) return false;
    
    // Filter out common non-news patterns
    const invalidPatterns = [
      /^(view in browser|unsubscribe|update preferences|privacy policy)/i,
      /^(follow us|share this|forward to|click here)/i,
      /^(sponsored by|advertisement|promoted)/i,
      /^(hi|hello|dear|good morning)/i,
      /^(copyright|all rights reserved)/i,
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /^(in today's|this week's|welcome to)/i,
      /^(table of contents|in this issue)/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(headline));
  }

  deduplicateItems(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = item.headline.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = NewsletterParser;