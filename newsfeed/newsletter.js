// Newsletter File-Based System
class NewsletterManager {
    constructor() {
        this.newslettersPath = '../data/Newsletters/';
        this.newsletters = [];
        this.currentFilter = 'all';
        this.currentDate = null;
    }

    async init() {
        try {
            await this.loadNewsletters();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Failed to initialize newsletter manager:', error);
            this.showError('Failed to load newsletters. Please try again later.');
        }
    }

    async loadNewsletters() {
        try {
            // In a real implementation, this would scan the directory
            // For now, we'll manually list known files
            const newsletterFiles = await this.getNewsletterFiles();
            
            this.newsletters = [];
            
            for (const filename of newsletterFiles) {
                const newsletter = await this.loadNewsletterFile(filename);
                if (newsletter) {
                    this.newsletters.push(newsletter);
                }
            }
            
            // Sort by date (newest first)
            this.newsletters.sort((a, b) => b.date - a.date);
            
        } catch (error) {
            console.error('Error loading newsletters:', error);
            throw error;
        }
    }

    async getNewsletterFiles() {
        try {
            // First try to load the generated newsletter list
            const response = await fetch('./available-newsletters.json');
            if (response.ok) {
                const files = await response.json();
                console.log(`Loaded ${files.length} newsletters from list`);
                return files;
            }
        } catch (error) {
            console.warn('Failed to load newsletter list, falling back to manual check');
        }
        
        // Fallback: try to fetch files based on date patterns
        const files = [];
        const today = new Date();
        
        // Check for newsletters from the past 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const filename = this.formatDateForFilename(date);
            
            try {
                const response = await fetch(`${this.newslettersPath}${filename}`);
                if (response.ok) {
                    files.push(filename);
                }
            } catch (error) {
                // File doesn't exist, continue
            }
        }
        
        // Always include our known sample file
        if (!files.includes('7-15-2025.txt')) {
            files.push('7-15-2025.txt');
        }
        
        return files;
    }

    formatDateForFilename(date) {
        const month = String(date.getMonth() + 1);
        const day = String(date.getDate());
        const year = date.getFullYear();
        return `${month}-${day}-${year}.txt`;
    }

    async loadNewsletterFile(filename) {
        try {
            const response = await fetch(`${this.newslettersPath}${filename}`);
            if (!response.ok) {
                console.warn(`Failed to load newsletter: ${filename}`);
                return null;
            }
            
            const content = await response.text();
            const date = this.parseDateFromFilename(filename);
            
            if (!date) {
                console.warn(`Invalid filename format: ${filename}`);
                return null;
            }
            
            return {
                filename,
                date,
                content,
                parsed: this.parseNewsletterContent(content)
            };
            
        } catch (error) {
            console.error(`Error loading newsletter ${filename}:`, error);
            return null;
        }
    }

    parseDateFromFilename(filename) {
        // Expected format: MM-DD-YYYY.txt
        const match = filename.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\.txt$/);
        if (!match) return null;
        
        const [_, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    parseNewsletterContent(content) {
        const sources = [];
        let currentSource = null;
        
        const lines = content.split('\n');
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i].trim();
            
            // Check for new newsletter source (### header)
            if (line.startsWith('### ')) {
                if (currentSource && currentSource.items.length > 0) {
                    sources.push(currentSource);
                }
                
                currentSource = {
                    name: line.substring(4).trim(),
                    date: '',
                    source: '',
                    items: []
                };
            }
            // Parse metadata
            else if (currentSource && line.startsWith('**Date:**')) {
                currentSource.date = line.substring(9).trim();
            }
            else if (currentSource && line.startsWith('**Source:**')) {
                currentSource.source = line.substring(11).trim();
            }
            // Parse AI Highlights section
            else if (currentSource && line === '**AI Highlights:**') {
                i = this.parseHighlights(lines, i + 1, currentSource);
                continue;
            }
            
            i++;
        }
        
        // Don't forget the last source
        if (currentSource && currentSource.items.length > 0) {
            sources.push(currentSource);
        }
        
        return sources;
    }

    parseHighlights(lines, startIndex, source) {
        let i = startIndex;
        let currentItem = null;
        
        while (i < lines.length) {
            const line = lines[i].trim();
            
            // Check for section end
            if (line === '---') {
                if (currentItem) {
                    source.items.push(currentItem);
                    currentItem = null;
                }
                return i;
            }
            
            // Check for new item (starts with -)
            if (line.startsWith('- **') && line.includes('**')) {
                if (currentItem) {
                    source.items.push(currentItem);
                }
                
                // Extract headline
                const headlineMatch = line.match(/- \*\*(.*?)\*\*/);
                currentItem = {
                    headline: headlineMatch ? headlineMatch[1] : '',
                    category: '',
                    tags: [],
                    summary: '',
                    url: ''
                };
            }
            // Parse item metadata
            else if (currentItem) {
                if (line.startsWith('*Category:*')) {
                    currentItem.category = line.substring(11).trim();
                }
                else if (line.startsWith('*Tags:*')) {
                    const tagsStr = line.substring(7).trim();
                    currentItem.tags = tagsStr.match(/#\w+/g) || [];
                }
                else if (line.startsWith('[http')) {
                    // URL line
                    currentItem.url = line.match(/\[(https?:\/\/.*?)\]/)?.[1] || '';
                }
                else if (line && !line.startsWith('*') && !line.startsWith('[')) {
                    // Summary line
                    currentItem.summary = (currentItem.summary + ' ' + line).trim();
                }
            }
            
            i++;
        }
        
        // Handle case where we reach end of file
        if (currentItem) {
            source.items.push(currentItem);
        }
        
        return i;
    }

    setupEventListeners() {
        // Category filter listeners will be set up after rendering
    }

    render() {
        const container = document.getElementById('newsletter-container');
        if (!container) {
            console.error('Newsletter container not found');
            return;
        }
        
        if (this.newsletters.length === 0) {
            container.innerHTML = `
                <div class="no-newsletters">
                    <h2>No Newsletters Available</h2>
                    <p>No newsletter files were found in the data/Newsletters directory.</p>
                    <p>Newsletter files should be named in the format: MM-DD-YYYY.txt</p>
                </div>
            `;
            return;
        }
        
        // Create date navigation
        const dateNav = this.createDateNavigation();
        
        // Create category filters
        const filters = this.createFilters();
        
        // Create newsletter display
        const newsletterDisplay = this.createNewsletterDisplay();
        
        container.innerHTML = '';
        container.appendChild(dateNav);
        container.appendChild(filters);
        container.appendChild(newsletterDisplay);
        
        // Set up filter event listeners
        this.setupFilterListeners();
    }

    createDateNavigation() {
        const nav = document.createElement('div');
        nav.className = 'date-navigation';
        
        // Create date selector
        const dateList = document.createElement('select');
        dateList.className = 'date-selector';
        dateList.innerHTML = '<option value="">Select a date...</option>';
        
        this.newsletters.forEach(newsletter => {
            const option = document.createElement('option');
            option.value = newsletter.filename;
            option.textContent = this.formatDateForDisplay(newsletter.date);
            if (this.currentDate === newsletter.filename) {
                option.selected = true;
            }
            dateList.appendChild(option);
        });
        
        dateList.addEventListener('change', (e) => {
            if (e.target.value) {
                this.currentDate = e.target.value;
                this.updateDisplay();
            }
        });
        
        // Create navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.textContent = '← Previous';
        prevBtn.onclick = () => this.navigateDate(-1);
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.textContent = 'Next →';
        nextBtn.onclick = () => this.navigateDate(1);
        
        nav.appendChild(prevBtn);
        nav.appendChild(dateList);
        nav.appendChild(nextBtn);
        
        // Auto-select the most recent newsletter
        if (!this.currentDate && this.newsletters.length > 0) {
            this.currentDate = this.newsletters[0].filename;
            dateList.value = this.currentDate;
        }
        
        return nav;
    }

    navigateDate(direction) {
        if (!this.currentDate || this.newsletters.length === 0) return;
        
        const currentIndex = this.newsletters.findIndex(n => n.filename === this.currentDate);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.newsletters.length) {
            this.currentDate = this.newsletters[newIndex].filename;
            document.querySelector('.date-selector').value = this.currentDate;
            this.updateDisplay();
        }
    }

    createFilters() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filters';
        
        // Get all unique categories and tags
        const categories = new Set();
        const tags = new Set();
        
        this.newsletters.forEach(newsletter => {
            newsletter.parsed.forEach(source => {
                source.items.forEach(item => {
                    if (item.category) categories.add(item.category);
                    item.tags.forEach(tag => tags.add(tag));
                });
            });
        });
        
        // Create category filters
        const categoryFilters = document.createElement('div');
        categoryFilters.className = 'filter-section';
        categoryFilters.innerHTML = '<h3>Filter by Category:</h3>';
        
        const categoryChips = document.createElement('div');
        categoryChips.className = 'filter-chips';
        
        // Add "All" chip
        const allChip = document.createElement('span');
        allChip.className = 'filter-chip active';
        allChip.textContent = 'All';
        allChip.dataset.filter = 'all';
        categoryChips.appendChild(allChip);
        
        // Add category chips
        Array.from(categories).sort().forEach(category => {
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.textContent = category;
            chip.dataset.filter = category;
            categoryChips.appendChild(chip);
        });
        
        categoryFilters.appendChild(categoryChips);
        filterContainer.appendChild(categoryFilters);
        
        return filterContainer;
    }

    setupFilterListeners() {
        const chips = document.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active class from all chips
                chips.forEach(c => c.classList.remove('active'));
                // Add active class to clicked chip
                chip.classList.add('active');
                // Update filter
                this.currentFilter = chip.dataset.filter;
                this.updateDisplay();
            });
        });
    }

    createNewsletterDisplay() {
        const display = document.createElement('div');
        display.className = 'newsletter-display';
        display.id = 'newsletter-display';
        
        this.updateDisplay();
        
        return display;
    }

    updateDisplay() {
        const display = document.getElementById('newsletter-display');
        if (!display) return;
        
        if (!this.currentDate) {
            display.innerHTML = '<p class="select-date">Please select a date from the navigation above.</p>';
            return;
        }
        
        const newsletter = this.newsletters.find(n => n.filename === this.currentDate);
        if (!newsletter) {
            display.innerHTML = '<p class="error">Newsletter not found.</p>';
            return;
        }
        
        let html = `<h2>Newsletter for ${this.formatDateForDisplay(newsletter.date)}</h2>`;
        
        newsletter.parsed.forEach(source => {
            const filteredItems = this.filterItems(source.items);
            
            if (filteredItems.length === 0 && this.currentFilter !== 'all') {
                return; // Skip this source if no items match the filter
            }
            
            html += `
                <section class="newsletter-section">
                    <div class="newsletter-header">
                        <div class="newsletter-title">
                            <div class="source-indicator" style="background: ${this.getSourceColor(source.name)}"></div>
                            <h3>${source.name}</h3>
                        </div>
                        <div class="newsletter-meta">
                            <p class="date">${source.date}</p>
                            <p class="item-count">${filteredItems.length} items</p>
                        </div>
                    </div>
                    <div class="news-items">
            `;
            
            filteredItems.forEach(item => {
                html += `
                    <article class="news-item">
                        <h4>${item.headline}</h4>
                        <div class="item-meta">
                            <span class="category">${item.category}</span>
                            <span class="tags">${item.tags.join(' ')}</span>
                        </div>
                        <p>${item.summary}</p>
                        ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener">Read more →</a>` : ''}
                    </article>
                `;
            });
            
            html += `
                    </div>
                </section>
            `;
        });
        
        display.innerHTML = html;
    }

    filterItems(items) {
        if (this.currentFilter === 'all') {
            return items;
        }
        
        return items.filter(item => {
            return item.category === this.currentFilter || 
                   item.tags.some(tag => tag === this.currentFilter);
        });
    }

    formatDateForDisplay(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getSourceColor(sourceName) {
        const colors = {
            'Unsupervised Learning': '#667eea',
            'MIT Technology Review': '#48bb78',
            '8020AI Newsletter': '#ed8936',
            'Mindstream Newsletter': '#38b2ac',
            'The Rundown AI': '#4ECDC4',
            'Ben\'s Bites': '#FF6B6B',
            'TLDR AI': '#45B7D1'
        };
        
        return colors[sourceName] || '#718096';
    }

    showError(message) {
        const container = document.getElementById('newsletter-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = new NewsletterManager();
    manager.init();
});