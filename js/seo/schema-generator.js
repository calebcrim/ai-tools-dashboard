// schema-generator.js
// Comprehensive schema.org structured data generator for CrimIntel.ai

class SchemaGenerator {
    constructor() {
        this.baseUrl = 'https://crimintel.ai';
        this.organizationName = 'CrimIntel.ai';
    }

    // Generate SoftwareApplication schema for a single tool
    generateToolSchema(tool) {
        if (!tool) return null;
        
        const toolName = tool.tool_name || tool.name || 'Unknown Tool';
        
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': toolName,
            'description': tool.brief_purpose_summary || tool.description || `${toolName} - AI tool for ${tool.category || 'AI'}`,
            'applicationCategory': tool.category || 'AI Software',
            'url': tool.url,
            'image': tool.image || `${this.baseUrl}/images/tools/${this.slugify(toolName)}.png`,
            'author': {
                '@type': 'Organization',
                'name': tool.company || tool.developer || 'Unknown'
            },
            'datePublished': tool.release_date || new Date().toISOString(),
            'dateModified': tool.last_updated || new Date().toISOString(),
            'operatingSystem': tool.platforms || 'Web-based',
            'softwareVersion': tool.version || '1.0'
        };

        // Add pricing information
        if (tool.pricing_model) {
            schema.offers = this.generatePricingSchema(tool.pricing_model);
        }

        // Add aggregate rating if available
        if (tool.rating || tool.business_impact_score) {
            schema.aggregateRating = {
                '@type': 'AggregateRating',
                'ratingValue': tool.rating || (tool.business_impact_score / 20), // Convert 0-100 to 0-5
                'bestRating': '5',
                'worstRating': '0',
                'ratingCount': tool.rating_count || tool.review_count || 1,
                'reviewCount': tool.review_count || 1
            };
        }

        // Add features
        if (tool.feature_breakdown) {
            const features = tool.feature_breakdown.split('\n').filter(f => f.trim());
            if (features.length > 0) {
                schema.featureList = features;
            }
        }

        // Add software requirements
        if (tool.integration_potential || tool.technical_requirements) {
            schema.softwareRequirements = tool.integration_potential || tool.technical_requirements;
        }

        // Add review if pros/cons available
        if (tool.pros_cons_limitations) {
            schema.review = {
                '@type': 'Review',
                'reviewBody': tool.pros_cons_limitations,
                'author': {
                    '@type': 'Organization',
                    'name': this.organizationName
                },
                'datePublished': new Date().toISOString(),
                'reviewRating': {
                    '@type': 'Rating',
                    'ratingValue': tool.rating || (tool.business_impact_score / 20) || 4,
                    'bestRating': '5',
                    'worstRating': '1'
                }
            };
        }

        // Add additional properties if available
        if (tool.learning_curve) {
            schema.learningResourceType = this.mapLearningCurve(tool.learning_curve);
        }

        if (tool.use_cases_in_pr && Array.isArray(tool.use_cases_in_pr)) {
            schema.potentialAction = tool.use_cases_in_pr.map(useCase => ({
                '@type': 'UseAction',
                'name': useCase
            }));
        }

        return schema;
    }

    // Generate pricing schema from pricing model text
    generatePricingSchema(pricingModel) {
        if (!pricingModel) return undefined;

        const offers = [];
        const pricingLower = pricingModel.toLowerCase();

        // Check for free tier
        if (pricingLower.includes('free')) {
            offers.push({
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
                'name': 'Free Plan',
                'description': 'Free tier with basic features'
            });
        }

        // Extract specific price patterns
        const pricePatterns = [
            { regex: /\$(\d+(?:\.\d+)?)\s*\/?\s*(?:per\s+)?month/gi, period: 'MONTH' },
            { regex: /\$(\d+(?:\.\d+)?)\s*\/?\s*(?:per\s+)?year/gi, period: 'YEAR' },
            { regex: /\$(\d+(?:\.\d+)?)\s*\/?\s*(?:per\s+)?user/gi, period: 'USER' },
            { regex: /\$(\d+(?:\.\d+)?)\s*one[- ]?time/gi, period: 'ONE_TIME' }
        ];

        pricePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(pricingModel)) !== null) {
                const price = match[1];
                const planName = this.extractPlanName(pricingModel, match.index);
                
                offers.push({
                    '@type': 'Offer',
                    'price': price,
                    'priceCurrency': 'USD',
                    'name': planName || `${pattern.period === 'ONE_TIME' ? 'One-time' : 'Subscription'} Plan`,
                    'priceSpecification': pattern.period !== 'ONE_TIME' ? {
                        '@type': 'UnitPriceSpecification',
                        'price': price,
                        'priceCurrency': 'USD',
                        'unitText': pattern.period
                    } : undefined
                });
            }
        });

        // Check for enterprise/custom pricing
        if (pricingLower.includes('enterprise') || pricingLower.includes('custom') || pricingLower.includes('contact')) {
            offers.push({
                '@type': 'Offer',
                'name': 'Enterprise Plan',
                'description': 'Custom pricing for enterprise customers',
                'priceSpecification': {
                    '@type': 'PriceSpecification',
                    'price': 'Contact for pricing'
                }
            });
        }

        return offers.length > 0 ? offers : undefined;
    }

    // Extract plan name from pricing text
    extractPlanName(pricingText, priceIndex) {
        // Look for plan names before the price
        const beforePrice = pricingText.substring(Math.max(0, priceIndex - 50), priceIndex);
        const planPatterns = [
            /(\w+)\s+plan:/i,
            /(\w+)\s+tier:/i,
            /(\w+):\s*$/i,
            /^(\w+)\s+/i
        ];

        for (const pattern of planPatterns) {
            const match = beforePrice.match(pattern);
            if (match) {
                return match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' Plan';
            }
        }

        return null;
    }

    // Map learning curve to schema.org learning resource type
    mapLearningCurve(learningCurve) {
        const curve = learningCurve.toLowerCase();
        if (curve.includes('low') || curve.includes('easy') || curve.includes('beginner')) {
            return 'Beginner-friendly';
        } else if (curve.includes('medium') || curve.includes('moderate')) {
            return 'Intermediate';
        } else if (curve.includes('high') || curve.includes('difficult') || curve.includes('advanced')) {
            return 'Advanced';
        }
        return 'Varies';
    }

    // Generate ItemList schema for multiple tools
    generateToolListSchema(tools, listName = 'AI Tools Collection') {
        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': listName,
            'description': `Collection of ${tools.length} AI tools curated by ${this.organizationName}`,
            'numberOfItems': tools.length,
            'itemListElement': tools.map((tool, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'item': this.generateToolSchema(tool)
            }))
        };
    }

    // Generate category page schema
    generateCategorySchema(category, tools) {
        return {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': `${category} AI Tools - ${this.organizationName}`,
            'description': `Comprehensive collection of ${tools.length} ${category} AI tools with detailed analysis, pricing, and business impact scores.`,
            'url': `${this.baseUrl}/category/${this.slugify(category)}`,
            'mainEntity': this.generateToolListSchema(tools, `${category} AI Tools`),
            'breadcrumb': {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': this.baseUrl
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'Categories',
                        'item': `${this.baseUrl}/categories`
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': category,
                        'item': `${this.baseUrl}/category/${this.slugify(category)}`
                    }
                ]
            }
        };
    }

    // Generate comparison page schema
    generateComparisonSchema(tools) {
        const toolNames = tools.map(t => t.tool_name).join(' vs ');
        
        return {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': `Compare ${toolNames} - ${this.organizationName}`,
            'description': `Detailed comparison of ${toolNames}. Compare features, pricing, pros/cons, and business impact scores.`,
            'url': `${this.baseUrl}/compare/${tools.map(t => this.slugify(t.tool_name)).join('-vs-')}`,
            'mainEntity': {
                '@type': 'ComparativeReview',
                'name': `${toolNames} Comparison`,
                'author': {
                    '@type': 'Organization',
                    'name': this.organizationName
                },
                'itemReviewed': tools.map(tool => this.generateToolSchema(tool)),
                'reviewAspect': [
                    'Features',
                    'Pricing',
                    'Business Impact',
                    'Integration Capabilities',
                    'Learning Curve',
                    'Use Cases'
                ],
                'datePublished': new Date().toISOString()
            }
        };
    }

    // Generate FAQ schema
    generateFAQSchema(faqs) {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqs.map(faq => ({
                '@type': 'Question',
                'name': faq.question,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.answer
                }
            }))
        };
    }

    // Generate Article schema for guides and best practices
    generateArticleSchema(article) {
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': article.title,
            'description': article.description,
            'image': article.image || `${this.baseUrl}/images/articles/default.jpg`,
            'author': {
                '@type': 'Organization',
                'name': this.organizationName
            },
            'publisher': {
                '@type': 'Organization',
                'name': this.organizationName,
                'logo': {
                    '@type': 'ImageObject',
                    'url': `${this.baseUrl}/images/logo.png`
                }
            },
            'datePublished': article.publishDate || new Date().toISOString(),
            'dateModified': article.modifiedDate || new Date().toISOString(),
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': article.url || window.location.href
            }
        };
    }

    // Add structured data to the page
    addStructuredData(schema) {
        if (!schema) return;
        
        try {
            // Remove any existing schema with the same type
            const schemaType = Array.isArray(schema) ? 'multiple' : (schema['@type'] || 'unknown');
            const existingScripts = document.querySelectorAll(`script[data-schema-type="${schemaType}"]`);
            existingScripts.forEach(script => script.remove());

            // Add new schema
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-schema-type', schemaType);
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error adding structured data:', error);
        }
    }

    // Helper function to convert string to slug
    slugify(text) {
        if (!text) return '';
        return String(text)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    // Initialize schema for current page
    initializePageSchema() {
        const path = window.location.pathname;
        
        // Add base schemas that apply to all pages
        this.addBaseSchemas();
        
        // Add page-specific schemas based on path
        if (path === '/' || path.includes('unified-dashboard')) {
            this.addHomepageSchema();
        } else if (path.includes('/category/')) {
            this.addCategorySchema();
        } else if (path.includes('/tool/')) {
            this.addToolSchema();
        } else if (path.includes('/compare/')) {
            this.addComparisonSchema();
        } else if (path.includes('best-practices')) {
            this.addBestPracticesSchema();
        } else if (path.includes('financial-analysis')) {
            this.addFinancialAnalysisSchema();
        }
    }

    // Add base organization and website schemas
    addBaseSchemas() {
        // Organization schema
        const orgSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': this.organizationName,
            'alternateName': 'AI Tools Intelligence Hub',
            'url': this.baseUrl,
            'logo': `${this.baseUrl}/images/logo.png`,
            'description': 'Comprehensive database and analysis platform for AI tools and software',
            'sameAs': [
                'https://twitter.com/crimintel_ai',
                'https://linkedin.com/company/crimintel-ai',
                'https://github.com/crimintel-ai'
            ]
        };

        // WebSite schema with search action
        const websiteSchema = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': `${this.organizationName} - AI Tools Intelligence Hub`,
            'url': this.baseUrl,
            'potentialAction': {
                '@type': 'SearchAction',
                'target': {
                    '@type': 'EntryPoint',
                    'urlTemplate': `${this.baseUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
            }
        };

        this.addStructuredData([orgSchema, websiteSchema]);
    }

    // Add homepage-specific schema
    addHomepageSchema() {
        if (window.unifiedToolsData && window.unifiedToolsData.length > 0) {
            // Add ItemList schema for featured tools
            const featuredTools = window.unifiedToolsData.slice(0, 10);
            this.addStructuredData(this.generateToolListSchema(featuredTools, 'Featured AI Tools'));
        }
    }

    // Add category page schema
    addCategorySchema() {
        // This would be called with actual category data
        // Implementation depends on how category data is loaded
    }

    // Add individual tool schema
    addToolSchema() {
        // This would be called with actual tool data
        // Implementation depends on how tool data is loaded
    }

    // Add comparison page schema
    addComparisonSchema() {
        // This would be called with actual comparison data
        // Implementation depends on how comparison data is loaded
    }

    // Add best practices article schema
    addBestPracticesSchema() {
        const article = {
            title: 'AI Implementation Best Practices Guide',
            description: 'Expert guide to AI tool selection and implementation. Learn best practices, avoid common pitfalls, and maximize ROI with data-driven strategies.',
            publishDate: '2024-01-01T00:00:00Z',
            url: `${this.baseUrl}/best-practices.html`
        };
        this.addStructuredData(this.generateArticleSchema(article));
    }

    // Add financial analysis schema
    addFinancialAnalysisSchema() {
        const article = {
            title: 'AI Tools Financial Analysis & ROI Calculator',
            description: 'Analyze AI tool costs, calculate ROI, and compare financial metrics across 349+ solutions. Make data-driven investment decisions.',
            publishDate: '2024-01-01T00:00:00Z',
            url: `${this.baseUrl}/financial-analysis/`
        };
        this.addStructuredData(this.generateArticleSchema(article));
    }
}

// Create global instance
window.schemaGenerator = new SchemaGenerator();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.schemaGenerator.initializePageSchema());
} else {
    window.schemaGenerator.initializePageSchema();
}