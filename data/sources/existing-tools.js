// Existing tools from the original dashboard
// This demonstrates the format for source files

module.exports = [
    {
        id: 1,
        name: "Claude (Anthropic)",
        url: "claude.ai",
        category: "ai-assistant",
        source: "pdf",
        description: "Large language model assistant developed by Anthropic, designed to handle complex questions, generate content, write and debug code, and analyze documents.",
        icon: "ai-assistant",
        tags: ["LLM", "Coding", "Analysis", "Chat"],
        features: {
            extensive: "Claude can chat on web or mobile and perform a wide array of tasks: writes and edits content, generates and debugs code, analyzes images and charts for data extraction. Very large context window (100k+ tokens).",
            pricing: "Free tier with limited messages, Pro at $20/month for individuals with 5x more usage, Team plan at $25/month per user (minimum 5 users) includes central admin features.",
            pros: "Very large context window for analyzing long documents. Strong reasoning abilities. Good at following complex instructions. Relatively safe and aligned responses.",
            cons: "No internet browsing capability. Cannot generate images. Message limits even on paid tiers. No API access on consumer plans.",
            integration: "API available for developers (separate from consumer plans). Can be integrated into workflows via API.",
            learningCurve: "Low - conversational interface is intuitive. Some learning needed for effective prompting.",
            useCases: [
                "Analyzing lengthy contracts and documents",
                "Writing and editing various content types",
                "Debugging and explaining code",
                "Research assistance and summarization",
                "Data extraction from images and charts"
            ]
        }
    },
    {
        id: 2,
        name: "Cision",
        url: "www.cision.com",
        category: "media-intelligence",
        source: "pdf",
        description: "Comprehensive PR and earned media software platform offering media monitoring, analytics, media database access, press release distribution, and campaign measurement tools.",
        icon: "media",
        tags: ["PR", "Media Monitoring", "Analytics", "Distribution"],
        features: {
            extensive: "Full PR workflow platform including media database with journalist contacts, media monitoring across online/print/broadcast, press release distribution, social listening, analytics and reporting, influencer identification.",
            pricing: "Enterprise pricing only - custom quotes based on needs. Typical packages range from $7,000-$15,000+ per year.",
            pros: "Most comprehensive PR platform available. Largest media database. Strong analytics. Integrated workflow.",
            cons: "Very expensive. Steep learning curve. Some users report database accuracy issues. Contract lock-ins.",
            integration: "APIs available. Integrates with major marketing platforms.",
            learningCurve: "High - extensive training recommended. Many features require significant time to master.",
            useCases: [
                "Media monitoring and coverage tracking",
                "Journalist and influencer outreach",
                "Press release distribution",
                "Campaign performance measurement",
                "Competitive intelligence"
            ]
        }
    },
    {
        id: 3,
        name: "ChatGPT",
        url: "chat.openai.com",
        category: "ai-assistant",
        source: "ai-list",
        description: "OpenAI's conversational AI assistant that can help with writing, analysis, coding, math, and creative tasks. It uses advanced language models to understand context and provide detailed, helpful responses.",
        icon: "ai-assistant",
        tags: ["AI", "LLM", "Chat", "Content Creation", "Analysis"],
        features: {
            pricing: "Free tier available. ChatGPT Plus at $20/month includes GPT-4, DALL-E, browsing, and advanced data analysis.",
            integration: "API available for developers. Can be integrated into various applications and workflows."
        }
    },
    {
        id: 4,
        name: "Perplexity AI",
        url: "www.perplexity.ai",
        category: "ai-assistant",
        source: "pdf",
        description: "AI-powered search engine that provides direct answers to questions with cited sources. It combines language models with real-time web search to deliver accurate, up-to-date information.",
        icon: "ai-assistant",
        tags: ["Search", "Research", "Citations", "Q&A"],
        features: {
            pricing: "Free tier, Pro subscription available",
            integration: "API available",
            useCases: ["Fact-checking", "Research", "Source verification", "Quick answers with citations"]
        }
    }
];