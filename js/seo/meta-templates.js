// Meta tag templates for different page types
const MetaTemplates = {
    // Homepage template
    homepage: {
        title: "CrimIntel.ai - AI Tools Database | 349+ Business-Focused AI Solutions",
        description: "Discover and compare 349+ AI tools with business impact scores, ROI analysis, and financial metrics. Find the perfect AI solution for your business needs with data-driven insights.",
        og: {
            title: "CrimIntel.ai - Comprehensive AI Tools Database for Business",
            description: "Explore 349+ AI tools with detailed business impact analysis, pricing comparisons, and ROI calculations. Make informed decisions with our data-driven AI tool directory.",
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: "CrimIntel.ai - 349+ AI Tools for Business Success",
            description: "Compare AI tools with business impact scores, financial analysis, and ROI metrics. Your data-driven guide to AI adoption."
        }
    },

    // Tool detail template (when viewing a specific tool)
    tool: {
        title: (toolName, category) => `${toolName} Review & Analysis | ${category} AI Tool - CrimIntel.ai`,
        description: (tool) => {
            const price = tool.pricing_model || "pricing available";
            const purpose = tool.brief_purpose_summary || tool.description || "";
            const truncatedPurpose = purpose.length > 120 ? purpose.substring(0, 117) + "..." : purpose;
            return `${tool.tool_name}: ${truncatedPurpose} Compare features, ${price}, and business impact scores.`;
        },
        og: {
            title: (toolName, category) => `${toolName} - ${category} AI Tool Analysis | CrimIntel.ai`,
            description: (tool) => {
                const features = tool.feature_breakdown ? tool.feature_breakdown.split('\n').slice(0, 2).join('. ') : "";
                return `Detailed analysis of ${tool.tool_name}. ${features} See pricing, pros/cons, and business impact metrics.`;
            },
            type: "article"
        },
        twitter: {
            card: "summary",
            title: (toolName) => `${toolName} Review - AI Tool Analysis`,
            description: (tool) => `In-depth review of ${tool.tool_name} with business impact scores, ROI analysis, and comparison data.`
        }
    },

    // Category page template
    category: {
        title: (category, count) => `Best ${category} AI Tools 2025 | ${count} Solutions Compared - CrimIntel.ai`,
        description: (category, count) => `Compare ${count} top ${category} AI tools with detailed analysis, pricing, and business impact scores. Find the perfect ${category.toLowerCase()} solution for your needs.`,
        og: {
            title: (category) => `Top ${category} AI Tools & Software | CrimIntel.ai`,
            description: (category, count) => `Comprehensive comparison of ${count} ${category} AI tools. Features, pricing, pros/cons, and business impact analysis in one place.`,
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: (category) => `Best ${category} AI Tools 2025`,
            description: (category, count) => `Compare ${count} ${category} AI solutions with business metrics and ROI analysis.`
        }
    },

    // Comparison page template
    comparison: {
        title: (tools) => `Compare ${tools.slice(0, 3).map(t => t.tool_name).join(' vs ')} - CrimIntel.ai`,
        description: (tools) => {
            const names = tools.slice(0, 3).map(t => t.tool_name).join(', ');
            return `Detailed comparison of ${names}. Compare features, pricing, business impact scores, and ROI metrics side-by-side.`;
        },
        og: {
            title: (tools) => `AI Tools Comparison: ${tools.slice(0, 2).map(t => t.tool_name).join(' vs ')}`,
            description: (tools) => `Compare ${tools.length} AI tools side-by-side. Features, pricing, pros/cons, and business impact analysis.`,
            type: "article"
        },
        twitter: {
            card: "summary",
            title: (tools) => `Compare: ${tools.slice(0, 2).map(t => t.tool_name).join(' vs ')}`,
            description: (tools) => `Detailed comparison of ${tools.length} AI tools with business metrics.`
        }
    },

    // Guide/Best practices template
    guide: {
        title: "AI Implementation Best Practices Guide | CrimIntel.ai",
        description: "Expert guide to AI tool selection and implementation. Learn best practices, avoid common pitfalls, and maximize ROI with data-driven strategies.",
        og: {
            title: "AI Implementation Best Practices - Expert Guide | CrimIntel.ai",
            description: "Comprehensive guide to selecting and implementing AI tools. Best practices, case studies, and ROI optimization strategies from industry experts.",
            type: "article"
        },
        twitter: {
            card: "summary_large_image",
            title: "AI Implementation Best Practices Guide",
            description: "Expert strategies for AI tool selection and implementation. Maximize ROI with proven best practices."
        }
    },

    // Financial analysis template
    financial: {
        title: "AI Tools Financial Analysis & ROI Calculator | CrimIntel.ai",
        description: "Analyze AI tool costs, calculate ROI, and compare financial metrics across 349+ solutions. Make data-driven investment decisions with comprehensive financial analysis.",
        og: {
            title: "AI Tools Financial Analysis - ROI & Cost Comparison | CrimIntel.ai",
            description: "Compare AI tool pricing, calculate ROI, and analyze financial impact. Comprehensive cost-benefit analysis for 349+ AI solutions.",
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: "AI Tools Financial Analysis & ROI Calculator",
            description: "Calculate ROI and compare costs across 349+ AI tools. Make informed investment decisions."
        }
    },

    // Newsletter/News template
    news: {
        title: "AI Industry News & Updates | CrimIntel.ai Newsletter",
        description: "Stay updated with the latest AI industry news, tool launches, and market trends. Weekly insights and analysis from CrimIntel.ai's expert team.",
        og: {
            title: "AI Industry News & Weekly Newsletter | CrimIntel.ai",
            description: "Latest AI industry updates, new tool launches, market analysis, and expert insights. Subscribe to our weekly newsletter.",
            type: "article"
        },
        twitter: {
            card: "summary_large_image",
            title: "AI Industry News & Updates",
            description: "Weekly AI industry insights, tool updates, and market trends from CrimIntel.ai."
        }
    }
};

// Utility function to get safe template
function getTemplate(pageType, subType = null) {
    if (!MetaTemplates[pageType]) {
        console.warn(`Unknown page type: ${pageType}, falling back to homepage`);
        return MetaTemplates.homepage;
    }
    
    if (subType && MetaTemplates[pageType][subType]) {
        return MetaTemplates[pageType][subType];
    }
    
    return MetaTemplates[pageType];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MetaTemplates, getTemplate };
}