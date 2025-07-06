/**
 * Tests for Data Builder and Processing
 * Using real data files, no mocks
 */

describe('Data Builder: Tool Data Processing', () => {
    test('Unified data structure is valid', () => {
        assert.ok(window.unifiedToolsData, 'Unified data should exist');
        assert.ok(window.unifiedToolsData.tools, 'Should have tools array');
        assert.ok(window.unifiedToolsData.metadata, 'Should have metadata');
        
        const { tools, metadata } = window.unifiedToolsData;
        
        // Validate metadata
        assert.ok(metadata.totalCount > 200, 'Should have 200+ tools count');
        assert.ok(metadata.categories.length > 5, 'Should have multiple categories');
        assert.ok(metadata.sources.length >= 2, 'Should have multiple sources');
        assert.ok(metadata.lastUpdated, 'Should have last updated timestamp');
    });
    
    test('All tools have required fields', () => {
        const requiredFields = [
            'id', 'tool_name', 'url', 'category', 'source', 
            'brief_purpose_summary'
        ];
        
        window.unifiedToolsData.tools.forEach((tool, index) => {
            requiredFields.forEach(field => {
                assert.ok(tool[field] !== undefined && tool[field] !== null, 
                    `Tool at index ${index} missing required field: ${field}`);
            });
            
            // Validate field types
            assert.equal(typeof tool.id, 'number', `Tool ${tool.tool_name} has invalid id type`);
            assert.equal(typeof tool.tool_name, 'string', `Tool at index ${index} has invalid name type`);
            assert.equal(typeof tool.url, 'string', `Tool ${tool.tool_name} has invalid url type`);
            assert.ok(tool.url.length > 0, `Tool ${tool.tool_name} has empty URL`);
        });
    });
    
    test('Tool IDs are unique and sequential', () => {
        const ids = window.unifiedToolsData.tools.map(t => t.id);
        const uniqueIds = new Set(ids);
        
        assert.equal(uniqueIds.size, ids.length, 'All IDs should be unique');
        
        // Check sequential
        ids.forEach((id, index) => {
            assert.equal(id, index + 1, `ID should be sequential at index ${index}`);
        });
    });
    
    test('Categories are normalized and valid', () => {
        const validCategories = [
            'ai-assistant', 'content-creation', 'video-audio', 
            'media-intelligence', 'analytics', 'transcription',
            'image-generation', 'productivity', 'research', 
            'translation', 'uncategorized'
        ];
        
        window.unifiedToolsData.tools.forEach(tool => {
            assert.includes(validCategories, tool.category, 
                `Tool ${tool.tool_name} has invalid category: ${tool.category}`);
        });
    });
    
    test('URLs are properly formatted', () => {
        const urlPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;
        
        window.unifiedToolsData.tools.forEach(tool => {
            assert.ok(urlPattern.test(tool.url), 
                `Tool ${tool.tool_name} has invalid URL format: ${tool.url}`);
            
            // Ensure no protocols in URL
            assert.notOk(tool.url.includes('http://'), 
                `Tool ${tool.tool_name} URL should not include http://`);
            assert.notOk(tool.url.includes('https://'), 
                `Tool ${tool.tool_name} URL should not include https://`);
        });
    });
    
    test('Tags are properly formatted arrays', () => {
        window.unifiedToolsData.tools.forEach(tool => {
            if (tool.tags) {
                assert.ok(Array.isArray(tool.tags), 
                    `Tool ${tool.tool_name} tags should be an array`);
                
                tool.tags.forEach(tag => {
                    assert.equal(typeof tag, 'string', 
                        `Tool ${tool.tool_name} has non-string tag`);
                    assert.ok(tag.length > 0, 
                        `Tool ${tool.tool_name} has empty tag`);
                });
            }
        });
    });
    
    test('Use cases are properly formatted', () => {
        window.unifiedToolsData.tools.forEach(tool => {
            if (tool.use_cases_in_pr) {
                assert.ok(Array.isArray(tool.use_cases_in_pr), 
                    `Tool ${tool.tool_name} use_cases_in_pr should be an array`);
                
                tool.use_cases_in_pr.forEach((useCase, index) => {
                    assert.equal(typeof useCase, 'string', 
                        `Tool ${tool.tool_name} use case ${index} should be string`);
                    assert.ok(useCase.length > 10, 
                        `Tool ${tool.tool_name} use case ${index} too short`);
                });
            }
        });
    });
    
    test('Pricing information is consistent', () => {
        const pricingKeywords = ['free', 'freemium', 'paid', 'subscription', 'enterprise'];
        
        window.unifiedToolsData.tools.forEach(tool => {
            if (tool.pricing_model) {
                const lowerPricing = tool.pricing_model.toLowerCase();
                
                // Check for at least one pricing keyword
                const hasPricingInfo = pricingKeywords.some(keyword => 
                    lowerPricing.includes(keyword)
                );
                
                if (!hasPricingInfo && lowerPricing.length > 20) {
                    // Only warn if there's substantial text but no keywords
                    console.log(`Note: Tool ${tool.tool_name} may have non-standard pricing description`);
                }
            }
        });
    });
});