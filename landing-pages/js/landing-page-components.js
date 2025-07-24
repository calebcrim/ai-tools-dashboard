// Landing Page Components - Shared functionality for all landing pages

class LandingPageComponents {
    constructor() {
        this.tools = window.unifiedToolsData?.tools || [];
        console.log('LandingPageComponents initialized with', this.tools.length, 'tools');
    }

    // Filter tools based on criteria
    filterTools(criteria) {
        return this.tools.filter(tool => {
            // Category filter
            if (criteria.categories && criteria.categories.length > 0) {
                const toolCategory = (tool.category || '').toLowerCase();
                if (!criteria.categories.some(cat => toolCategory.includes(cat.toLowerCase()))) {
                    return false;
                }
            }

            // Tags filter
            if (criteria.tags && criteria.tags.length > 0) {
                const toolTags = (tool.tags || []).map(t => t.toLowerCase());
                const toolName = (tool.tool_name || '').toLowerCase();
                const toolDesc = (tool.brief_purpose_summary || '').toLowerCase();
                
                if (!criteria.tags.some(tag => 
                    toolTags.includes(tag.toLowerCase()) ||
                    toolName.includes(tag.toLowerCase()) ||
                    toolDesc.includes(tag.toLowerCase())
                )) {
                    return false;
                }
            }

            // Complexity filter
            if (criteria.complexity && criteria.complexity.length > 0) {
                if (!criteria.complexity.includes(tool.learning_curve)) {
                    return false;
                }
            }

            // Pricing filter
            if (criteria.pricing && criteria.pricing.length > 0) {
                const pricing = (tool.pricing_model || '').toLowerCase();
                if (!criteria.pricing.some(p => pricing.includes(p.toLowerCase()))) {
                    return false;
                }
            }

            // Business impact filter
            if (criteria.minImpactScore && tool.business_impact_score < criteria.minImpactScore) {
                return false;
            }

            // Exclude specific tools
            if (criteria.exclude && criteria.exclude.length > 0) {
                if (criteria.exclude.some(name => 
                    tool.tool_name.toLowerCase() === name.toLowerCase()
                )) {
                    return false;
                }
            }

            return true;
        });
    }

    // Calculate business impact score (0-5 scale)
    calculateBusinessImpactScore(tool) {
        // If already has a score, use it
        if (tool.business_impact_score) {
            return tool.business_impact_score;
        }

        // Calculate based on available data
        let score = 2.5; // Base score

        // Pricing model affects score
        const pricing = (tool.pricing_model || '').toLowerCase();
        if (pricing.includes('free')) score += 0.5;
        if (pricing.includes('enterprise')) score += 0.5;
        
        // Integration potential
        if (tool.integration_potential) score += 0.5;
        
        // Use cases
        if (tool.use_cases_in_pr && tool.use_cases_in_pr.length > 3) score += 0.5;
        
        // Learning curve
        if (tool.learning_curve === 'Low') score += 0.5;
        if (tool.learning_curve === 'High') score -= 0.5;

        return Math.min(5, Math.max(1, score));
    }

    // Render comparison table
    renderComparisonTable(tools, containerId, columns = ['name', 'pricing', 'impact', 'complexity']) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const table = document.createElement('table');
        table.className = 'comparison-table-inner';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const columnConfig = {
            rank: { label: '#', width: '60px' },
            name: { label: 'Tool Name', width: '250px' },
            pricing: { label: 'Pricing', width: '200px' },
            impact: { label: 'Business Impact', width: '150px' },
            complexity: { label: 'Complexity', width: '120px' },
            features: { label: 'Key Features', width: 'auto' }
        };

        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = columnConfig[col]?.label || col;
            if (columnConfig[col]?.width) {
                th.style.width = columnConfig[col].width;
            }
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        
        tools.forEach((tool, index) => {
            const row = document.createElement('tr');
            
            columns.forEach(col => {
                const td = document.createElement('td');
                
                switch(col) {
                    case 'rank':
                        td.innerHTML = `<strong>#${index + 1}</strong>`;
                        break;
                    
                    case 'name':
                        td.innerHTML = `<a href="#tool-detail-${index + 1}" class="tool-name" onclick="event.preventDefault(); document.getElementById('tool-detail-${index + 1}').scrollIntoView({ behavior: 'smooth', block: 'start' });">${tool.tool_name}</a>`;
                        break;
                    
                    case 'pricing':
                        td.textContent = this.formatPricing(tool.pricing_model);
                        break;
                    
                    case 'impact':
                        const score = this.calculateBusinessImpactScore(tool);
                        const scoreClass = score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low';
                        td.innerHTML = `<span class="impact-score ${scoreClass}">${score.toFixed(1)}/5.0</span>`;
                        break;
                    
                    case 'complexity':
                        td.textContent = tool.learning_curve || 'Medium';
                        break;
                    
                    case 'features':
                        const features = this.extractKeyFeatures(tool);
                        td.innerHTML = features.slice(0, 2).join(', ');
                        break;
                }
                
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Wrap in scrollable container
        container.innerHTML = `
            <div class="comparison-table">
                ${table.outerHTML}
            </div>
        `;
    }

    // Format pricing for display
    formatPricing(pricingModel) {
        if (!pricingModel) return 'Contact for pricing';
        
        const pricing = pricingModel.toLowerCase();
        
        if (pricing.includes('free') && pricing.includes('$')) {
            return 'Free + Paid tiers';
        } else if (pricing.includes('free')) {
            return 'Free tier available';
        } else if (pricing.includes('contact') || pricing.includes('custom')) {
            return 'Enterprise pricing';
        }
        
        // Extract price if available
        const priceMatch = pricingModel.match(/\$(\d+)/);
        if (priceMatch) {
            return `From $${priceMatch[1]}/mo`;
        }
        
        return pricingModel.substring(0, 30) + '...';
    }

    // Extract key features from tool data
    extractKeyFeatures(tool) {
        const features = [];
        
        if (tool.feature_breakdown) {
            features.push(...tool.feature_breakdown.split('\n').filter(f => f.trim()));
        }
        
        if (tool.use_cases_in_pr && tool.use_cases_in_pr.length > 0) {
            features.push(...tool.use_cases_in_pr.slice(0, 2));
        }
        
        return features.filter(f => f && f.length < 100);
    }

    // Render tool review cards
    renderToolReviews(tools, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = tools.map((tool, index) => 
            this.createToolReviewCard(tool, index + 1)
        ).join('');

        // Add click handlers for CTA buttons
        container.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = button.dataset.toolId;
                this.openToolDetail(toolId);
            });
        });
    }

    // Create individual tool review card
    createToolReviewCard(tool, rank) {
        const score = this.calculateBusinessImpactScore(tool);
        const features = this.extractKeyFeatures(tool);
        
        return `
            <div class="tool-review-card" id="tool-detail-${rank}">
                <div class="tool-header">
                    <span class="rank">#${rank}</span>
                    <h3>${tool.tool_name}</h3>
                    <span class="business-score">Impact Score: ${score.toFixed(1)}/5</span>
                </div>
                
                <div class="tool-content">
                    <p class="tool-description">${tool.brief_purpose_summary || 'AI-powered tool for enhanced productivity'}</p>
                    
                    <div class="tool-metrics">
                        <div class="metric">
                            <span class="label">Pricing</span>
                            <span class="value">${this.formatPricing(tool.pricing_model)}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Complexity</span>
                            <span class="value">${tool.learning_curve || 'Medium'}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Category</span>
                            <span class="value">${tool.category}</span>
                        </div>
                    </div>
                    
                    ${features.length > 0 ? `
                        <div class="tool-features">
                            <h4>Key Features:</h4>
                            <ul>
                                ${features.slice(0, 3).map(feature => 
                                    `<li>${feature}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <a href="${tool.url}" target="_blank" class="cta-button" data-tool-id="${tool.id}">
                        Visit ${tool.tool_name} →
                    </a>
                </div>
            </div>
        `;
    }

    // Initialize FAQ accordion
    initializeFAQ(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all items
                container.querySelectorAll('.faq-item').forEach(faq => {
                    faq.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Open tool detail (integrate with main dashboard if needed)
    openToolDetail(toolId) {
        // For now, just navigate to the tool's website
        const tool = this.tools.find(t => t.id == toolId);
        if (tool && tool.url) {
            window.open(tool.url.startsWith('http') ? tool.url : `https://${tool.url}`, '_blank');
        }
    }

    // Generate FAQ schema
    generateFAQSchema(faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }

    // Add FAQ schema to page
    addFAQSchema(faqs) {
        const schema = this.generateFAQSchema(faqs);
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }
}

// Create global instance
window.landingPageComponents = new LandingPageComponents();