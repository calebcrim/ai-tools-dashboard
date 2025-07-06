#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Enhanced Tool Data Converter with Deduplication
class EnhancedToolDataConverter {
    constructor() {
        this.toolId = 1;
        this.categories = new Set();
        this.sources = new Set();
        this.duplicatesFound = new Map();
        this.mergeDecisions = [];
        this.buildStats = {
            totalProcessed: 0,
            duplicatesRemoved: 0,
            mergedTools: 0,
            categoriesFound: 0,
            sourcesFound: 0,
            qualityScores: []
        };
    }

    // Normalize URL for comparison
    normalizeUrl(url) {
        if (!url) return '';
        
        return url
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '') // Remove protocol
            .replace(/^www\./, '') // Remove www
            .replace(/\/$/, '') // Remove trailing slash
            .replace(/\/+/g, '/'); // Replace multiple slashes with single
    }

    // Normalize tool name for comparison
    normalizeToolName(name) {
        if (!name) return '';
        
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\b(ai|app|tool|platform|software)\b/g, '') // Remove common suffixes
            .trim();
    }

    // Calculate quality score for a tool
    calculateQualityScore(tool) {
        let score = 0;
        const weights = {
            tool_name: 10,
            url: 10,
            brief_purpose_summary: 15,
            feature_breakdown: 15,
            pricing_model: 10,
            pros_cons_limitations: 10,
            integration_potential: 10,
            learning_curve: 5,
            use_cases_in_pr: 10,
            tags: 5
        };

        for (const [field, weight] of Object.entries(weights)) {
            const value = tool[field];
            if (value) {
                if (Array.isArray(value)) {
                    score += value.length > 0 ? weight : 0;
                } else if (typeof value === 'string') {
                    score += value.trim().length > 10 ? weight : weight * 0.5;
                } else {
                    score += weight;
                }
            }
        }

        return score;
    }

    // Find duplicates in the tools array
    findDuplicates(tools) {
        const urlMap = new Map();
        const nameMap = new Map();

        tools.forEach((tool) => {
            const normalizedUrl = this.normalizeUrl(tool.url);
            const normalizedName = this.normalizeToolName(tool.tool_name || tool.name);

            // Check URL duplicates
            if (normalizedUrl && urlMap.has(normalizedUrl)) {
                const existing = urlMap.get(normalizedUrl);
                this.recordDuplicate(existing, tool, 'url');
            } else if (normalizedUrl) {
                urlMap.set(normalizedUrl, tool);
            }

            // Check name duplicates
            if (normalizedName && nameMap.has(normalizedName)) {
                const existing = nameMap.get(normalizedName);
                if (existing !== tool) { // Don't duplicate if already found by URL
                    this.recordDuplicate(existing, tool, 'name');
                }
            } else if (normalizedName) {
                nameMap.set(normalizedName, tool);
            }
        });
    }

    // Record a duplicate finding
    recordDuplicate(tool1, tool2, matchType) {
        const key = `${tool1.id || tool1.tool_name}-${tool2.id || tool2.tool_name}`;
        
        if (!this.duplicatesFound.has(key)) {
            this.duplicatesFound.set(key, {
                tools: [tool1, tool2],
                matchType,
                scores: [this.calculateQualityScore(tool1), this.calculateQualityScore(tool2)]
            });
        }
    }

    // Intelligently merge duplicate tools
    mergeDuplicates(tool1, tool2) {
        const score1 = this.calculateQualityScore(tool1);
        const score2 = this.calculateQualityScore(tool2);
        
        console.log(`  Merging: "${tool1.tool_name || tool1.name}" (score: ${score1}) with "${tool2.tool_name || tool2.name}" (score: ${score2})`);

        // Start with the higher quality tool as base
        const [primary, secondary] = score1 >= score2 ? [tool1, tool2] : [tool2, tool1];
        const merged = { ...primary };

        // Merge specific fields intelligently
        const mergeFields = [
            'brief_purpose_summary',
            'feature_breakdown',
            'pricing_model',
            'pros_cons_limitations',
            'integration_potential',
            'learning_curve',
            'geo_regulatory_limitations',
            'case_studies'
        ];

        mergeFields.forEach(field => {
            if (!merged[field] || merged[field].length < (secondary[field] || '').length) {
                merged[field] = secondary[field] || merged[field];
            }
        });

        // Merge arrays
        if (secondary.use_cases_in_pr && Array.isArray(secondary.use_cases_in_pr)) {
            merged.use_cases_in_pr = [...new Set([
                ...(merged.use_cases_in_pr || []),
                ...secondary.use_cases_in_pr
            ])];
        }

        if (secondary.tags && Array.isArray(secondary.tags)) {
            // Normalize all tags to Title Case when merging
            const formatTag = (tag) => tag.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('-');
            
            merged.tags = [...new Set([
                ...(merged.tags || []).map(formatTag),
                ...secondary.tags.map(formatTag)
            ])];
        }

        // Keep the better URL (prefer without www and with https)
        if (secondary.url && secondary.url.includes('https://') && !merged.url.includes('https://')) {
            merged.url = secondary.url;
        }

        this.mergeDecisions.push({
            kept: primary.tool_name || primary.name,
            removed: secondary.tool_name || secondary.name,
            reason: `Higher quality score (${Math.max(score1, score2)} vs ${Math.min(score1, score2)})`
        });

        this.buildStats.mergedTools++;
        return merged;
    }

    // Convert simple format to detailed format
    convertSimpleToDetailed(tool) {
        // Standardize category to lowercase
        const normalizedCategory = (tool.category || 'uncategorized').toLowerCase();
        
        // Standardize tags to Title Case
        const normalizedTags = (tool.tags || []).map(tag => 
            tag.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('-')
        );
        
        return {
            id: tool.id || this.toolId++,
            tool_name: tool.name,
            url: tool.url,
            category: normalizedCategory,
            source: tool.source,
            icon: tool.icon,
            brief_purpose_summary: tool.description,
            feature_breakdown: tool.features?.extensive || '',
            pricing_model: tool.features?.pricing || '',
            pros_cons_limitations: [
                tool.features?.pros ? `Pros: ${tool.features.pros}` : '',
                tool.features?.cons ? `Cons: ${tool.features.cons}` : ''
            ].filter(Boolean).join(' '),
            integration_potential: tool.features?.integration || '',
            learning_curve: tool.features?.learningCurve || '',
            use_cases_in_pr: tool.features?.useCases || [],
            tags: normalizedTags,
            ...tool.features
        };
    }

    // Normalize detailed tool
    normalizeDetailedTool(tool) {
        // Standardize category to lowercase
        const normalizedCategory = (tool.category || 'uncategorized').toLowerCase();
        this.categories.add(normalizedCategory);
        this.sources.add(tool.source || 'unknown');
        
        // Standardize tags to Title Case
        const normalizedTags = (tool.tags || this.generateTags(tool)).map(tag => 
            tag.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('-')
        );
        
        return {
            id: tool.id || this.toolId++,
            tool_name: tool.tool_name,
            url: tool.url,
            category: normalizedCategory,
            source: tool.source || 'ai-list',
            icon: tool.icon || this.getCategoryIcon(normalizedCategory),
            brief_purpose_summary: tool.brief_purpose_summary || '',
            feature_breakdown: tool.feature_breakdown || '',
            pricing_model: tool.pricing_model || '',
            pros_cons_limitations: tool.pros_cons_limitations || '',
            integration_potential: tool.integration_potential || '',
            learning_curve: tool.learning_curve || '',
            geo_regulatory_limitations: tool.geo_regulatory_limitations || '',
            case_studies: tool.case_studies || '',
            use_cases_in_pr: Array.isArray(tool.use_cases_in_pr) ? tool.use_cases_in_pr : [],
            tags: normalizedTags,
            cision_use_suggestions: tool.cision_use_suggestions || null
        };
    }

    getCategoryIcon(category) {
        const iconMap = {
            'ai-assistant': 'ai-assistant',
            'content-creation': 'content',
            'video-audio': 'video',
            'media-intelligence': 'media',
            'analytics': 'analytics',
            'transcription': 'transcription',
            'image-generation': 'image',
            'productivity': 'productivity',
            'research': 'research',
            'translation': 'translation'
        };
        return iconMap[category] || 'ai-assistant';
    }

    generateTags(tool) {
        const tags = [];
        
        // Standardize tag formatting
        const formatTag = (tag) => tag.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('-');
        
        if (tool.category) tags.push(formatTag(tool.category));
        if (tool.pricing_model?.toLowerCase().includes('free')) tags.push('Free-Tier');
        if (tool.integration_potential?.toLowerCase().includes('api')) tags.push('API');
        if (tool.brief_purpose_summary) {
            if (tool.brief_purpose_summary.toLowerCase().includes('video')) tags.push('Video');
            if (tool.brief_purpose_summary.toLowerCase().includes('image')) tags.push('Image');
            if (tool.brief_purpose_summary.toLowerCase().includes('ai')) tags.push('AI');
        }
        
        return [...new Set(tags)];
    }

    processAllTools() {
        const sourcesDir = path.join(__dirname, 'sources');
        let allTools = [];
        
        console.log('\n📊 Starting Enhanced Build Process...\n');
        
        if (!fs.existsSync(sourcesDir)) {
            console.error(`Sources directory not found: ${sourcesDir}`);
            return { tools: [], metadata: {} };
        }
        
        const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.js'));
        
        if (files.length === 0) {
            console.warn('No source files found in data/sources/');
            return { tools: [], metadata: {} };
        }
        
        // Phase 1: Load and convert all tools
        console.log('📁 Loading source files...');
        files.forEach(file => {
            console.log(`  Processing ${file}...`);
            try {
                delete require.cache[require.resolve(path.join(sourcesDir, file))];
                const data = require(path.join(sourcesDir, file));
                
                const tools = Array.isArray(data) ? data : data.tools || [data];
                
                tools.forEach(tool => {
                    this.buildStats.totalProcessed++;
                    let processedTool;
                    
                    if (tool.tool_name) {
                        processedTool = this.normalizeDetailedTool(tool);
                    } else if (tool.name) {
                        processedTool = this.convertSimpleToDetailed(tool);
                        processedTool = this.normalizeDetailedTool(processedTool);
                    }
                    
                    if (processedTool) {
                        allTools.push(processedTool);
                    }
                });
            } catch (error) {
                console.error(`  ❌ Error processing ${file}:`, error.message);
            }
        });
        
        console.log(`\n✅ Loaded ${allTools.length} tools from ${files.length} files`);
        
        // Phase 2: Find duplicates
        console.log('\n🔍 Detecting duplicates...');
        this.findDuplicates(allTools);
        console.log(`  Found ${this.duplicatesFound.size} potential duplicate pairs`);
        
        // Phase 3: Deduplicate
        console.log('\n🔧 Deduplicating tools...');
        const deduplicatedTools = this.deduplicateTools(allTools);
        
        // Phase 4: Final processing
        console.log('\n📈 Finalizing data...');
        deduplicatedTools.sort((a, b) => a.tool_name.localeCompare(b.tool_name));
        
        deduplicatedTools.forEach((tool, index) => {
            tool.id = index + 1;
            this.buildStats.qualityScores.push({
                name: tool.tool_name,
                score: this.calculateQualityScore(tool)
            });
        });
        
        this.buildStats.categoriesFound = this.categories.size;
        this.buildStats.sourcesFound = this.sources.size;
        
        // Print build statistics
        this.printBuildStats(allTools.length, deduplicatedTools.length);
        
        return {
            tools: deduplicatedTools,
            metadata: {
                totalCount: deduplicatedTools.length,
                originalCount: allTools.length,
                duplicatesRemoved: this.buildStats.duplicatesRemoved,
                categories: Array.from(this.categories),
                sources: Array.from(this.sources),
                lastUpdated: new Date().toISOString(),
                buildStats: this.buildStats
            }
        };
    }

    deduplicateTools(tools) {
        const processedIds = new Set();
        const deduplicatedTools = [];
        // Map for tracking processed tools

        tools.forEach(tool => {
            const toolKey = tool.tool_name || tool.name;
            
            if (processedIds.has(toolKey)) {
                return; // Skip already processed
            }

            let finalTool = tool;
            let duplicatesForThisTool = [];

            // Find all duplicates for this tool
            this.duplicatesFound.forEach((dupInfo) => {
                if (dupInfo.tools.some(t => (t.tool_name || t.name) === toolKey)) {
                    duplicatesForThisTool.push(dupInfo);
                }
            });

            // Merge all duplicates
            if (duplicatesForThisTool.length > 0) {
                const allRelatedTools = new Set([tool]);
                
                duplicatesForThisTool.forEach(dupInfo => {
                    dupInfo.tools.forEach(t => allRelatedTools.add(t));
                });

                // Convert to array and sort by quality score
                const relatedArray = Array.from(allRelatedTools)
                    .sort((a, b) => this.calculateQualityScore(b) - this.calculateQualityScore(a));

                // Merge all into the highest quality tool
                finalTool = relatedArray[0];
                for (let i = 1; i < relatedArray.length; i++) {
                    finalTool = this.mergeDuplicates(finalTool, relatedArray[i]);
                    processedIds.add(relatedArray[i].tool_name || relatedArray[i].name);
                    this.buildStats.duplicatesRemoved++;
                }
            }

            processedIds.add(finalTool.tool_name || finalTool.name);
            deduplicatedTools.push(finalTool);
        });

        return deduplicatedTools;
    }

    printBuildStats(originalCount, finalCount) {
        console.log('\n📊 BUILD STATISTICS');
        console.log('═══════════════════════════════════════');
        console.log(`📥 Total tools processed: ${this.buildStats.totalProcessed}`);
        console.log(`🔍 Duplicate pairs found: ${this.duplicatesFound.size}`);
        console.log(`🗑️  Duplicates removed: ${this.buildStats.duplicatesRemoved}`);
        console.log(`🔧 Tools merged: ${this.buildStats.mergedTools}`);
        console.log(`📤 Final tool count: ${finalCount} (reduced from ${originalCount})`);
        console.log(`📂 Categories: ${this.buildStats.categoriesFound}`);
        console.log(`📌 Sources: ${this.buildStats.sourcesFound}`);
        
        // Top quality tools
        const topTools = this.buildStats.qualityScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        console.log('\n🏆 TOP QUALITY TOOLS:');
        topTools.forEach((tool, i) => {
            console.log(`  ${i + 1}. ${tool.name} (score: ${tool.score}/100)`);
        });
        
        // Sample of merge decisions
        if (this.mergeDecisions.length > 0) {
            console.log('\n🔀 SAMPLE MERGE DECISIONS:');
            this.mergeDecisions.slice(0, 5).forEach(decision => {
                console.log(`  ✓ Kept "${decision.kept}", removed "${decision.removed}"`);
                console.log(`    Reason: ${decision.reason}`);
            });
            
            if (this.mergeDecisions.length > 5) {
                console.log(`  ... and ${this.mergeDecisions.length - 5} more merges`);
            }
        }
        
        console.log('\n✅ Build completed successfully!\n');
    }
}

// Main execution
const converter = new EnhancedToolDataConverter();
const result = converter.processAllTools();

// Write the unified data
const outputPath = path.join(__dirname, 'unified-tools-data.js');
const outputContent = `// Auto-generated unified tools data with deduplication
// Last updated: ${result.metadata.lastUpdated}
// Total tools: ${result.metadata.totalCount} (deduplicated from ${result.metadata.originalCount})
// Duplicates removed: ${result.metadata.duplicatesRemoved}

const unifiedToolsData = ${JSON.stringify(result, null, 2)};

// Export for Node.js (build scripts)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}
`;

fs.writeFileSync(outputPath, outputContent);
console.log(`💾 Output saved to: ${outputPath}`);