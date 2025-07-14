// Generate mock newsfeed to demonstrate the new HTML template
const fs = require('fs').promises;
const path = require('path');

// Mock newsletter data to demonstrate the new template
const mockNewsItems = [
  {
    source: "Ben's Bites",
    date: new Date().toISOString(),
    subject: "OpenAI's breakthrough model arrives",
    items: [
      {
        headline: "GPT-5 Rumors Heat Up",
        summary: "Sources close to OpenAI suggest the next generation model could arrive sooner than expected, with capabilities that far exceed current expectations.",
        link: "https://example.com/gpt5-rumors",
        timestamp: new Date().toISOString()
      },
      {
        headline: "Anthropic Raises $2B in New Funding",
        summary: "The AI safety-focused company has secured massive funding to accelerate Claude's development and expand research efforts.",
        link: "https://example.com/anthropic-funding",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    source: "The Rundown AI",
    date: new Date().toISOString(),
    subject: "AI Tools You Can't Miss This Week",
    items: [
      {
        headline: "Microsoft Integrates AI Across Office Suite",
        summary: "Copilot features are now rolling out to all Office 365 users, bringing AI assistance to Word, Excel, and PowerPoint.",
        link: "https://example.com/microsoft-copilot",
        timestamp: new Date().toISOString()
      },
      {
        headline: "New Open Source LLM Matches GPT-4 Performance",
        summary: "Mistral AI releases their latest model with impressive benchmarks, available for free download and commercial use.",
        link: "https://example.com/mistral-release",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    source: "TLDR AI",
    date: new Date().toISOString(),
    subject: "Daily AI News Digest",
    items: [
      {
        headline: "Google DeepMind Announces Gemini 2.0",
        summary: "The next iteration of Google's multimodal AI model promises better reasoning and reduced hallucinations.",
        link: "https://example.com/gemini-2",
        timestamp: new Date().toISOString()
      },
      {
        headline: "AI Startup Secures $100M Series B",
        summary: "Vector database company raises significant funding to expand their AI infrastructure platform.",
        link: "https://example.com/vector-funding",
        timestamp: new Date().toISOString()
      }
    ]
  }
];

// Mock newsletter senders count
const newsletterSenders = { size: 79 };

// Generate newsfeed HTML using the new enhanced template
async function generateEnhancedNewsfeed(newsItems) {
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
        
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: white;
            border: none;
            border-radius: 12px;
            padding: 12px 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            font-weight: 500;
            color: #667eea;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            z-index: 1000;
        }
        
        .back-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            
            .back-button {
                position: relative;
                top: auto;
                left: auto;
                margin-bottom: 20px;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background: #0f172a;
                color: #e2e8f0;
            }
            
            header, .newsletter-section, .filters, .back-button {
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
    <a href="../index.html" class="back-button">
        ← Back to Dashboard
    </a>
    
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

  // Save the enhanced newsfeed
  const outputPath = path.join(__dirname, '..', 'newsfeed', 'index.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, template);
  
  // Also save the mock data as JSON
  const jsonPath = path.join(__dirname, '..', 'newsfeed', 'data.json');
  await fs.writeFile(jsonPath, JSON.stringify(mockNewsItems, null, 2));
  
  console.log('✅ Enhanced newsfeed generated successfully!');
  console.log(`📄 HTML: ${outputPath}`);
  console.log(`📊 JSON: ${jsonPath}`);
  console.log('\n🎨 New features added:');
  console.log('• Modern gradient design with Inter font');
  console.log('• Interactive source filtering');
  console.log('• Statistics dashboard');
  console.log('• Color-coded newsletter sources');
  console.log('• Hover animations and transitions');
  console.log('• Dark mode support');
  console.log('• Mobile responsive design');
  console.log('• Back to dashboard button');
}

// Run the generator
generateEnhancedNewsfeed(mockNewsItems);