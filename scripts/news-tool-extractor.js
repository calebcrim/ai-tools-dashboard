#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIToolExtractor {
    constructor() {
        this.config = null;
        
        // Common patterns for identifying AI tools in text
        this.toolPatterns = {
            launch: /(?:launches?|unveiled?|introduces?|announced?|released?)\s+(?:its\s+)?(?:new\s+)?([A-Z][A-Za-z0-9\s\-\.]+?)(?:\s+AI|\s+platform|\s+tool|\s+model)/gi,
            update: /([A-Z][A-Za-z0-9\s\-\.]{2,30}?)\s+(?:adds?|updates?|upgrades?|enhances?|improves?|expands?)\s+(?:its|their|new|support|feature)/gi,
            acquisition: /(?:acquires?|acquired)\s+(?:AI\s+)?(?:startup\s+)?([A-Z][A-Za-z0-9\s\-\.]+)/gi,
            funding: /([A-Z][A-Za-z0-9\s\-\.]+?)\s+(?:raises?|raised|secures?|secured)\s+\$?\d+[BMK]?/gi,
            partnership: /([A-Z][A-Za-z0-9\s\-\.]+?)\s+(?:partners?|partnership|collaborates?|collaboration|integrates?)\s+with/gi,
            feature: /([A-Z][A-Za-z0-9\s\-\.]+?)\s+(?:now\s+)?(?:features?|capabilities?|functionality)/gi
        };
        
        // Keywords that indicate AI/ML tools
        this.aiKeywords = [
            'AI', 'artificial intelligence', 'machine learning', 'ML', 'deep learning',
            'neural network', 'NLP', 'natural language', 'computer vision', 'LLM',
            'large language model', 'generative AI', 'chatbot', 'automation',
            'predictive', 'analytics', 'algorithm', 'model', 'training'
        ];
        
        // Load existing tools database
        this.existingTools = new Map();
        this.knownTools = new Set();
    }
    
    async loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'news-extraction-config.json');
            const configContent = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configContent);
            
            // Load known tools into a Set for quick lookup
            if (this.config.known_tools) {
                this.config.known_tools.forEach(tool => {
                    this.knownTools.add(tool.toLowerCase());
                });
            }
        } catch (error) {
            console.warn('Could not load config, using defaults:', error.message);
            this.config = {
                extraction: {
                    confidence_threshold: 0.7,
                    exclude_patterns: []
                }
            };
        }
    }
    
    async loadExistingTools() {
        try {
            const dbPath = path.join(__dirname, '..', 'data', 'unified-tools-data.js');
            const content = await fs.readFile(dbPath, 'utf8');
            
            // Use dynamic import to load the module
            const module = await import(dbPath);
            const data = module.default || module.unifiedToolsData || {};
            
            // If data is not found, try to eval it
            if (!data.tools) {
                const wrappedCode = `
                    'use strict';
                    ${content}
                    return typeof unifiedToolsData !== 'undefined' ? unifiedToolsData : {};
                `;
                const getData = new Function(wrappedCode);
                const evalData = getData();
                if (evalData.tools) {
                    Object.assign(data, evalData);
                }
            }
            
            // Create a map for quick lookup
            if (data && data.tools && Array.isArray(data.tools)) {
                data.tools.forEach(tool => {
                    this.existingTools.set(tool.tool_name.toLowerCase(), tool);
                    // Also map common variations
                    const nameWithoutSpaces = tool.tool_name.replace(/\s+/g, '').toLowerCase();
                    this.existingTools.set(nameWithoutSpaces, tool);
                });
            } else {
                console.warn('No tools found in database');
            }
            
            console.log(`Loaded ${data.tools ? data.tools.length : 0} existing tools`);
        } catch (error) {
            console.error('Error loading existing tools:', error);
        }
    }
    
    async extractFromNewsletter(newsletterPath) {
        const content = await fs.readFile(newsletterPath, 'utf8');
        const findings = {
            newTools: [],
            updates: [],
            timestamp: new Date().toISOString(),
            source: path.basename(newsletterPath)
        };
        
        // Parse newsletter sections
        const sections = this.parseNewsletterSections(content);
        
        // Extract tools from each news item
        for (const section of sections) {
            const extracted = await this.extractToolsFromSection(section);
            
            for (const tool of extracted) {
                // Check if tool exists
                const existing = this.findExistingTool(tool.name);
                
                if (existing) {
                    // Check for updates
                    const updates = this.identifyUpdates(existing, tool, section);
                    if (updates) {
                        findings.updates.push({
                            tool_name: existing.tool_name,
                            updates: updates,
                            context: tool.context,
                            confidence: tool.confidence
                        });
                    }
                } else if (tool.confidence > 0.7) {
                    // New tool with high confidence
                    findings.newTools.push(tool);
                }
            }
        }
        
        return findings;
    }
    
    parseNewsletterSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect news item start (various formats)
            if (line.startsWith('- **') || line.startsWith('**') || line.match(/^\d+\.\s+\*\*/)) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                
                currentSection = {
                    headline: this.extractHeadline(line),
                    content: [],
                    metadata: {}
                };
            } else if (currentSection) {
                // Collect section content
                if (line.startsWith('*Category:*')) {
                    currentSection.metadata.category = line.substring(11).trim();
                } else if (line.startsWith('*Tags:*')) {
                    currentSection.metadata.tags = line.substring(7).trim();
                } else if (line.match(/\[https?:\/\/[^\]]+\]/)) {
                    // Extract URL from markdown link format
                    const urlMatch = line.match(/\[(https?:\/\/[^\]]+)\]/);
                    if (urlMatch) {
                        currentSection.metadata.url = urlMatch[1];
                    }
                } else if (line.includes('http')) {
                    currentSection.metadata.url = line.match(/https?:\/\/[^\s\]]+/)?.[0];
                } else if (line.length > 0) {
                    currentSection.content.push(line);
                }
            }
        }
        
        if (currentSection) {
            sections.push(currentSection);
        }
        
        return sections;
    }
    
    extractHeadline(line) {
        // Remove markdown formatting
        return line.replace(/^[-\d.]\s*\*\*/, '')
                  .replace(/\*\*/g, '')
                  .trim();
    }
    
    async extractToolsFromSection(section) {
        const tools = [];
        const fullText = [section.headline, ...section.content].join(' ');
        
        // First check if the headline itself is a tool name
        const headline = section.headline;
        
        // Check if headline matches tool-like patterns
        const shouldExclude = this.isExcludedPattern(headline);
        
        
        if (headline && 
            !headline.toLowerCase().includes('acqui') && 
            !headline.toLowerCase().includes('raises') &&
            !headline.toLowerCase().includes('announces') &&
            !shouldExclude &&
            headline.length < 50) {
            
            // Check if it's in Product/Tool category
            if (section.metadata.category && section.metadata.category.includes('Product / Tool')) {
                // Clean up headlines that include actions
                let toolName = headline;
                
                // Remove common prefixes like "OpenAI Releases"
                const releaseMatch = headline.match(/^(?:[A-Z][a-zA-Z\s]+?\s+)?(?:Releases?|Launches?|Introduces?|Unveils?|Creates?|Builds?|Develops?)\s+(.+)/i);
                if (releaseMatch) {
                    toolName = releaseMatch[1];
                } else {
                    // Extract tool name from headlines like "Pickle AI Creates..."
                    const toolFirstMatch = headline.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z]?[a-zA-Z]+)?)\s+(?:Creates?|Builds?|Offers?|Provides?|Develops?|Launches?)/i);
                    if (toolFirstMatch) {
                        toolName = toolFirstMatch[1];
                    }
                }
                
                tools.push({
                    name: toolName,
                    action: 'feature',
                    context: fullText.substring(0, 200),
                    category: this.inferCategory(section, fullText),
                    url: section.metadata.url || '',
                    confidence: 0.9,
                    metadata: section.metadata
                });
            }
        }
        
        // Handle special cases like "Google rolls out..." or "Meta launches..."
        const rolloutMatch = headline.match(/^([A-Z][a-zA-Z]+)\s+(?:rolls out|launches|introduces|releases)\s+(.+)/);
        if (rolloutMatch && section.metadata.category && section.metadata.category.includes('Product / Tool')) {
            const company = rolloutMatch[1];
            const feature = rolloutMatch[2];
            
            // Check if it's describing a new tool/feature
            if (feature.toLowerCase().includes('ai') || feature.toLowerCase().includes('tool') || 
                feature.toLowerCase().includes('feature') || feature.toLowerCase().includes('model')) {
                // Try to extract the tool name from the description
                const toolNameMatch = feature.match(/(?:called\s+|named\s+)?([A-Z][a-zA-Z0-9\s]+?)(?:\s+for|\s+to|\s+that|,|$)/);
                if (toolNameMatch) {
                    tools.push({
                        name: this.cleanToolName(toolNameMatch[1]) || `${company} ${feature}`,
                        action: 'launch',
                        context: fullText.substring(0, 200),
                        category: this.inferCategory(section, fullText),
                        url: section.metadata.url || '',
                        confidence: 0.8,
                        metadata: section.metadata
                    });
                }
            }
        }
        
        // Check each pattern type
        for (const [actionType, pattern] of Object.entries(this.toolPatterns)) {
            const matches = [...fullText.matchAll(pattern)];
            
            for (const match of matches) {
                const toolName = this.cleanToolName(match[1]);
                
                if (toolName && this.isLikelyAITool(fullText, toolName)) {
                    tools.push({
                        name: toolName,
                        action: actionType,
                        context: this.extractContext(fullText, match.index),
                        category: this.inferCategory(section, fullText),
                        url: section.metadata.url || this.extractUrl(fullText, toolName),
                        confidence: this.calculateConfidence(section, fullText, toolName),
                        metadata: section.metadata
                    });
                }
            }
        }
        
        // Also check for tools mentioned by name only if they're in our database
        const knownToolMentions = this.findKnownToolMentions(fullText);
        tools.push(...knownToolMentions);
        
        return this.deduplicateTools(tools);
    }
    
    cleanToolName(name) {
        if (!name) return null;
        
        // Clean up the extracted name
        let cleaned = name
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[,.!?;:]+$/, '')
            .replace(/^(the|an?)\s+/i, '');
            
        // Remove common suffixes
        cleaned = cleaned.replace(/\s+(platform|tool|app|application|system|software|service|solution)$/i, '');
        
        // Don't return very long names (likely sentences)
        if (cleaned.length > 40) return null;
        
        return cleaned;
    }
    
    isLikelyAITool(text, toolName) {
        const context = text.toLowerCase();
        const toolContext = this.extractContext(text, text.indexOf(toolName)).toLowerCase();
        
        // Check if it's a known tool
        if (this.knownTools.has(toolName.toLowerCase())) {
            return true;
        }
        
        // Check if AI-related keywords appear near the tool mention
        return this.aiKeywords.some(keyword => 
            toolContext.includes(keyword.toLowerCase())
        );
    }
    
    isExcludedPattern(text) {
        if (!this.config || !this.config.extraction || !this.config.extraction.exclude_patterns) {
            return false;
        }
        
        const textLower = text.toLowerCase();
        const isExcluded = this.config.extraction.exclude_patterns.some(pattern => 
            textLower.includes(pattern.toLowerCase())
        );
        
        return isExcluded;
    }
    
    extractContext(text, position, contextSize = 200) {
        const start = Math.max(0, position - contextSize);
        const end = Math.min(text.length, position + contextSize);
        return text.substring(start, end);
    }
    
    inferCategory(section, fullText) {
        const text = fullText.toLowerCase();
        const categories = {
            'customer-service': ['customer', 'support', 'chat', 'service desk'],
            'content-creation': ['content', 'writing', 'generation', 'creative', 'copywriting'],
            'analytics': ['analytics', 'analysis', 'insights', 'data', 'metrics'],
            'cybersecurity': ['security', 'threat', 'protection', 'cyber'],
            'productivity': ['productivity', 'workflow', 'automation', 'efficiency'],
            'research': ['research', 'search', 'discovery', 'knowledge'],
            'developer-tools': ['developer', 'coding', 'programming', 'api', 'sdk'],
            'marketing': ['marketing', 'campaign', 'advertising', 'seo'],
            'ai-assistant': ['assistant', 'chatbot', 'conversational', 'companion']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'ai-tools'; // default
    }
    
    extractUrl(text, toolName) {
        // Try to find URL near tool mention
        const urlPattern = /https?:\/\/[^\s\]]+/g;
        const urls = text.match(urlPattern) || [];
        
        // Check if any URL contains the tool name
        const toolNameLower = toolName.toLowerCase().replace(/\s+/g, '');
        for (const url of urls) {
            if (url.toLowerCase().includes(toolNameLower)) {
                return url;
            }
        }
        
        return urls[0] || ''; // Return first URL if no match
    }
    
    calculateConfidence(section, fullText, toolName) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on various factors
        if (section.headline.includes(toolName)) confidence += 0.2;
        if (section.metadata.url) confidence += 0.1;
        if (section.metadata.category) confidence += 0.1;
        
        // Check for specific action words
        const actionWords = ['launches', 'releases', 'introduces', 'announces'];
        if (actionWords.some(word => fullText.toLowerCase().includes(word))) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }
    
    findExistingTool(toolName) {
        const normalized = toolName.toLowerCase();
        return this.existingTools.get(normalized) || 
               this.existingTools.get(normalized.replace(/\s+/g, ''));
    }
    
    findKnownToolMentions(text) {
        const mentions = [];
        const textLower = text.toLowerCase();
        
        for (const [key, tool] of this.existingTools) {
            if (textLower.includes(tool.tool_name.toLowerCase())) {
                const context = this.extractContext(text, textLower.indexOf(tool.tool_name.toLowerCase()));
                
                // Check if this is a significant mention
                if (this.isSignificantMention(context)) {
                    mentions.push({
                        name: tool.tool_name,
                        action: 'mention',
                        context: context,
                        category: tool.category,
                        url: tool.url,
                        confidence: 0.8,
                        existing: true
                    });
                }
            }
        }
        
        return mentions;
    }
    
    isSignificantMention(context) {
        const updateIndicators = [
            'update', 'new feature', 'enhancement', 'improvement',
            'partnership', 'integration', 'acquisition', 'funding',
            'launch', 'release', 'announce'
        ];
        
        const contextLower = context.toLowerCase();
        return updateIndicators.some(indicator => contextLower.includes(indicator));
    }
    
    identifyUpdates(existingTool, extractedInfo, section) {
        const updates = {};
        const fullText = [section.headline, ...section.content].join(' ').toLowerCase();
        
        // Check for pricing updates
        if (fullText.includes('pricing') || fullText.includes('price') || fullText.includes('cost')) {
            updates.pricing_model_update = true;
        }
        
        // Check for feature updates
        if (fullText.includes('new feature') || fullText.includes('enhancement') || fullText.includes('capability')) {
            updates.feature_breakdown_update = true;
        }
        
        // Check for integration updates
        if (fullText.includes('integration') || fullText.includes('partnership')) {
            updates.integration_potential_update = true;
        }
        
        // Extract specific update content
        if (Object.keys(updates).length > 0) {
            updates.context = extractedInfo.context;
            updates.source_url = section.metadata.url;
            updates.date = new Date().toISOString();
        }
        
        return Object.keys(updates).length > 0 ? updates : null;
    }
    
    deduplicateTools(tools) {
        const seen = new Map();
        
        for (const tool of tools) {
            const key = tool.name.toLowerCase();
            if (!seen.has(key) || tool.confidence > seen.get(key).confidence) {
                seen.set(key, tool);
            }
        }
        
        return Array.from(seen.values());
    }
    
    async generateToolEntry(extractedTool) {
        // Generate a new tool entry in the unified format
        return {
            tool_name: extractedTool.name,
            url: extractedTool.url || '',
            category: extractedTool.category || 'ai-tools',
            source: 'news-extraction',
            icon: extractedTool.category || 'ai-assistant',
            brief_purpose_summary: extractedTool.context.substring(0, 200).trim(),
            feature_breakdown: 'To be researched',
            pricing_model: 'To be researched',
            pros_cons_limitations: 'To be researched',
            integration_potential: 'To be researched',
            learning_curve: 'To be researched',
            geo_regulatory_limitations: 'To be researched',
            case_studies: 'To be researched',
            use_cases_in_pr: [],
            tags: this.generateTags(extractedTool),
            needs_research: true,
            extraction_metadata: {
                extracted_date: new Date().toISOString(),
                source_article: extractedTool.metadata.url,
                confidence: extractedTool.confidence,
                action_type: extractedTool.action,
                newsletter_source: extractedTool.metadata.newsletter_name || 'Unknown'
            }
        };
    }
    
    generateTags(tool) {
        const tags = ['AI'];
        
        // Add category-based tags
        const categoryTags = {
            'content-creation': ['Content', 'Writing'],
            'analytics': ['Analytics', 'Data'],
            'customer-service': ['Customer Support', 'Chatbot'],
            'cybersecurity': ['Security', 'Protection'],
            'productivity': ['Productivity', 'Automation']
        };
        
        if (categoryTags[tool.category]) {
            tags.push(...categoryTags[tool.category]);
        }
        
        // Add action-based tags
        if (tool.action === 'launch') tags.push('New');
        if (tool.action === 'update') tags.push('Updated');
        
        return tags;
    }
}

// Main execution
async function main() {
    const extractor = new AIToolExtractor();
    await extractor.loadConfig();
    await extractor.loadExistingTools();
    
    // Process newsletter file passed as argument
    const newsletterPath = process.argv[2];
    
    if (!newsletterPath) {
        console.error('Usage: node news-tool-extractor.js <newsletter-file>');
        process.exit(1);
    }
    
    try {
        const findings = await extractor.extractFromNewsletter(newsletterPath);
        
        // Generate output file
        const outputPath = path.join(__dirname, '..', 'data', 'extracted-tools-batch.json');
        await fs.writeFile(outputPath, JSON.stringify(findings, null, 2));
        
        console.log('\n=== EXTRACTION SUMMARY ===');
        console.log(`New tools found: ${findings.newTools.length}`);
        console.log(`Updates found: ${findings.updates.length}`);
        console.log(`Output saved to: ${outputPath}`);
        
        // Display findings
        if (findings.newTools.length > 0) {
            console.log('\nNew Tools:');
            findings.newTools.forEach(tool => {
                console.log(`  - ${tool.name} (${tool.category}) - Confidence: ${(tool.confidence * 100).toFixed(0)}%`);
            });
        }
        
        if (findings.updates.length > 0) {
            console.log('\nUpdates:');
            findings.updates.forEach(update => {
                console.log(`  - ${update.tool_name}: ${Object.keys(update.updates).join(', ')}`);
            });
        }
        
    } catch (error) {
        console.error('Error processing newsletter:', error);
        process.exit(1);
    }
}

// Run if called directly
main();

export default AIToolExtractor;