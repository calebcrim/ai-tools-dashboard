#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the base extractor
import AIToolExtractor from './news-tool-extractor.js';

class EnhancedAIToolExtractor extends AIToolExtractor {
    constructor() {
        super();
        
        // Duplicate detection patterns
        this.duplicatePatterns = {
            // Tool name variations that should be merged
            variations: [
                { pattern: /^(.+?)\s+AI\s+Development\s+Tool$/i, replacement: '$1' },
                { pattern: /^(.+?)\s+for\s+Enterprise\s+AI$/i, replacement: '$1 for Enterprise' },
                { pattern: /^(.+?)\s+for\s+Enterprise$/i, replacement: '$1' },
                { pattern: /^new\s+(.+)$/i, replacement: '$1' },
                { pattern: /^(.+?),\s+AI\s+Code\s+Editor$/i, replacement: '$1' },
                { pattern: /^(.+?)\s+IDE$/i, replacement: '$1' },
                { pattern: /^(.+?)\s+AI\s+Model$/i, replacement: '$1' },
                { pattern: /^Alibaba's\s+Moonshot\s+Releases\s+(.+)$/i, replacement: '$1' },
                { pattern: /^(.+?)\s+After\s+Google$/i, replacement: '$1' }
            ],
            
            // Common suffixes to remove for comparison
            suffixesToStrip: [
                ' AI', ' Tool', ' Platform', ' Model', ' System', ' Framework',
                ' Application', ' Software', ' Solution', ' Service'
            ],
            
            // Prefixes that indicate actions, not tool names
            actionPrefixes: [
                'Launches', 'Releases', 'Announces', 'Introduces', 'Unveils',
                'Creates', 'Builds', 'Develops', 'Updates', 'Upgrades'
            ]
        };
        
        // Enhanced exclusion patterns
        this.enhancedExclusions = [
            /^OpenAI$/i,  // Too generic
            /^Google$/i,  // Too generic
            /^Meta$/i,    // Too generic
            /^Amazon$/i,  // Too generic
            /^Microsoft$/i, // Too generic
            /^Transparency Framework$/i, // Not a specific tool
            /^.{1,3}$/,   // Too short (less than 4 characters)
            /^\d+/,       // Starts with numbers
        ];
    }
    
    // Override the main extraction method to add deduplication
    async extractToolsFromNewsletter(newsletterPath) {
        const tools = await super.extractToolsFromNewsletter(newsletterPath);
        return this.enhancedDeduplication(tools);
    }
    
    // Enhanced deduplication with smarter logic
    enhancedDeduplication(tools) {
        const normalizedTools = new Map();
        const skippedDuplicates = [];
        
        for (const tool of tools) {
            // Skip if matches exclusion pattern
            if (this.shouldExcludeTool(tool.name)) {
                console.log(`  ⚠️  Excluding generic/invalid tool: ${tool.name}`);
                continue;
            }
            
            // Normalize the tool name
            const normalized = this.normalizeToolName(tool.name);
            const key = normalized.toLowerCase();
            
            // Check if we've seen this tool or a variation
            const existingKey = this.findSimilarToolKey(key, normalizedTools);
            
            if (existingKey) {
                // We have a duplicate - keep the better one
                const existing = normalizedTools.get(existingKey);
                
                if (this.shouldReplace(existing, tool)) {
                    normalizedTools.set(existingKey, {
                        ...tool,
                        name: this.chooseBestName(existing.name, tool.name),
                        alternativeNames: [...(existing.alternativeNames || []), existing.name]
                    });
                    skippedDuplicates.push({
                        kept: tool.name,
                        removed: existing.name,
                        reason: 'Higher confidence or better data'
                    });
                } else {
                    skippedDuplicates.push({
                        kept: existing.name,
                        removed: tool.name,
                        reason: 'Existing entry is better'
                    });
                }
            } else {
                // New tool
                normalizedTools.set(key, {
                    ...tool,
                    name: normalized,
                    originalName: tool.name,
                    alternativeNames: []
                });
            }
        }
        
        // Log deduplication results
        if (skippedDuplicates.length > 0) {
            console.log('\n📋 Deduplication Results:');
            skippedDuplicates.forEach(dup => {
                console.log(`  - Kept "${dup.kept}", removed "${dup.removed}" (${dup.reason})`);
            });
        }
        
        return Array.from(normalizedTools.values());
    }
    
    // Check if tool should be excluded
    shouldExcludeTool(toolName) {
        return this.enhancedExclusions.some(pattern => pattern.test(toolName));
    }
    
    // Normalize tool name by removing variations
    normalizeToolName(name) {
        let normalized = name.trim();
        
        // Apply variation patterns
        for (const {pattern, replacement} of this.duplicatePatterns.variations) {
            if (pattern.test(normalized)) {
                normalized = normalized.replace(pattern, replacement);
            }
        }
        
        // Remove action prefixes if they exist
        for (const prefix of this.duplicatePatterns.actionPrefixes) {
            const regex = new RegExp(`^${prefix}\\s+`, 'i');
            if (regex.test(normalized)) {
                normalized = normalized.replace(regex, '');
            }
        }
        
        return normalized;
    }
    
    // Find similar tool keys using fuzzy matching
    findSimilarToolKey(key, normalizedTools) {
        // Direct match
        if (normalizedTools.has(key)) {
            return key;
        }
        
        // Check for substring matches
        for (const [existingKey, tool] of normalizedTools) {
            // Check if one contains the other
            if (key.includes(existingKey) || existingKey.includes(key)) {
                return existingKey;
            }
            
            // Check without common suffixes
            const keyBase = this.stripSuffixes(key);
            const existingBase = this.stripSuffixes(existingKey);
            
            if (keyBase === existingBase) {
                return existingKey;
            }
            
            // Check Levenshtein distance for very similar names
            if (this.calculateSimilarity(key, existingKey) > 0.85) {
                return existingKey;
            }
        }
        
        return null;
    }
    
    // Strip common suffixes for comparison
    stripSuffixes(name) {
        let stripped = name;
        for (const suffix of this.duplicatePatterns.suffixesToStrip) {
            const regex = new RegExp(suffix.toLowerCase() + '$', 'i');
            stripped = stripped.replace(regex, '');
        }
        return stripped.trim();
    }
    
    // Calculate string similarity (simple implementation)
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // Simple Levenshtein distance implementation
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Decide if we should replace existing tool with new one
    shouldReplace(existing, newTool) {
        // Higher confidence wins
        if (newTool.confidence > existing.confidence + 0.2) {
            return true;
        }
        
        // More complete data wins
        const existingCompleteness = existing.context?.length || 0;
        const newCompleteness = newTool.context?.length || 0;
        
        if (newCompleteness > existingCompleteness * 1.5) {
            return true;
        }
        
        // Prefer entries with URLs
        if (newTool.url && !existing.url) {
            return true;
        }
        
        return false;
    }
    
    // Choose the best name between alternatives
    chooseBestName(name1, name2) {
        // Prefer shorter, cleaner names
        const clean1 = this.normalizeToolName(name1);
        const clean2 = this.normalizeToolName(name2);
        
        // Prefer names without "for Enterprise" etc.
        if (clean1.includes('for') && !clean2.includes('for')) {
            return clean2;
        }
        if (!clean1.includes('for') && clean2.includes('for')) {
            return clean1;
        }
        
        // Prefer shorter names
        return clean1.length <= clean2.length ? clean1 : clean2;
    }
    
    // Override to check existing database for duplicates
    async processExtractedTools(tools) {
        const results = {
            newTools: [],
            updates: [],
            duplicatesSkipped: []
        };
        
        for (const tool of tools) {
            // Check if tool already exists in database
            const existing = this.findExistingTool(tool.name);
            
            if (existing) {
                // Check if this is an update
                const updates = this.identifyUpdates(existing, tool, tool.metadata);
                if (updates) {
                    results.updates.push({
                        tool_name: existing.tool_name,
                        updates: updates,
                        context: tool.context
                    });
                } else {
                    results.duplicatesSkipped.push({
                        name: tool.name,
                        existingName: existing.tool_name,
                        reason: 'Already in database'
                    });
                }
            } else {
                // Check for similar tools in database
                const similar = this.findSimilarExistingTool(tool.name);
                if (similar) {
                    results.duplicatesSkipped.push({
                        name: tool.name,
                        existingName: similar.tool_name,
                        reason: 'Similar tool exists',
                        similarity: this.calculateSimilarity(
                            tool.name.toLowerCase(),
                            similar.tool_name.toLowerCase()
                        )
                    });
                } else {
                    // Genuinely new tool
                    results.newTools.push(tool);
                }
            }
        }
        
        return results;
    }
    
    // Find similar existing tools using fuzzy matching
    findSimilarExistingTool(toolName) {
        const normalized = this.normalizeToolName(toolName).toLowerCase();
        
        for (const [key, tool] of this.existingTools) {
            const similarity = this.calculateSimilarity(normalized, key);
            if (similarity > 0.8) {
                return tool;
            }
        }
        
        return null;
    }
}

// Export the enhanced extractor
export default EnhancedAIToolExtractor;

// If running as main script
if (import.meta.url === `file://${process.argv[1]}`) {
    const extractor = new EnhancedAIToolExtractor();
    const newsletterPath = process.argv[2];
    
    if (!newsletterPath) {
        console.error('Usage: node news-tool-extractor-enhanced.js <newsletter-file>');
        process.exit(1);
    }
    
    (async () => {
        try {
            await extractor.loadConfig();
            await extractor.loadExistingTools();
            const tools = await extractor.extractToolsFromNewsletter(newsletterPath);
            const results = await extractor.processExtractedTools(tools);
            
            // Save results
            const outputPath = path.join(__dirname, '..', 'data', 'extracted-tools-enhanced.json');
            await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
            
            console.log('\n📊 Extraction Summary:');
            console.log(`  - New tools: ${results.newTools.length}`);
            console.log(`  - Updates: ${results.updates.length}`);
            console.log(`  - Duplicates skipped: ${results.duplicatesSkipped.length}`);
            
            if (results.duplicatesSkipped.length > 0) {
                console.log('\n⚠️  Skipped Duplicates:');
                results.duplicatesSkipped.forEach(dup => {
                    console.log(`  - "${dup.name}" → "${dup.existingName}" (${dup.reason})`);
                });
            }
            
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}