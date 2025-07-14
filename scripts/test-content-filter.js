// Test script for the NewsletterContentFilter
const { NewsletterContentFilter } = require('./email-to-newsfeed-gmail.js');

// Test configuration with debug mode enabled
const testConfig = {
  filtering: {
    enableSmartFiltering: true,
    minContentLength: 50,
    minQualityScore: 60,
    preserveShortHeadlines: true,
    debugMode: true,
    customBlacklist: [],
    customWhitelist: []
  }
};

// Create filter instance
const filter = new NewsletterContentFilter(testConfig);

// Test cases from the actual problematic content
const testItems = [
  // Navigation elements
  { headline: "It's a map", summary: "" },
  { headline: "It's a door", summary: "" },
  { headline: "It's a link", summary: "" },
  { headline: "Read more", summary: "" },
  { headline: "Click here", summary: "to view the full article" },
  
  // Welcome/onboarding content
  { headline: "Who this newsletter is for:", summary: "AI enthusiasts and professionals" },
  { headline: "Here's what you just unlocked", summary: "Premium features and content" },
  { headline: "Welcome to AI Weekly", summary: "Thanks for subscribing!" },
  
  // Subscription prompts
  { headline: "Keep reading with a 7-day free trial", summary: "" },
  { headline: "Upgrade to Premium", summary: "Get unlimited access for $9/month" },
  
  // Meta content
  { headline: "Every week, you'll get:", summary: "The latest AI news and insights" },
  { headline: "To Make the Most of It:", summary: "Tips for using our newsletter" },
  { headline: "In this issue:", summary: "" },
  
  // Author signatures
  { headline: "Paras Karmacharya, MD MS", summary: "" },
  { headline: "Best regards,", summary: "The AI Team" },
  
  // Valid news content (should pass)
  { headline: "OpenAI Announces GPT-5 with Breakthrough Capabilities", summary: "The latest model shows significant improvements in reasoning and multimodal understanding." },
  { headline: "Google Launches New AI Research Lab in Europe", summary: "The tech giant invests $100M in expanding its AI research presence." },
  { headline: "Study Reveals AI Can Detect Cancer Earlier Than Traditional Methods", summary: "Researchers at MIT demonstrate 95% accuracy in early detection." },
  { headline: "Microsoft Partners with Anthropic for Enterprise AI Solutions", summary: "" },
  { headline: "GPT 4", summary: "New features include enhanced code generation and debugging capabilities." },
  { headline: "Claude 3 Opus", summary: "Anthropic's latest model sets new benchmarks in AI safety." }
];

console.log('Testing NewsletterContentFilter\n');
console.log('='.repeat(80));
console.log('\nProcessing test items...\n');

// Process each test item
testItems.forEach((item, index) => {
  const isValid = filter.isValidContent(item);
  const status = isValid ? '✅ KEPT' : '❌ FILTERED';
  console.log(`${index + 1}. ${status}: "${item.headline}"`);
});

// Show filtering statistics
console.log('\n' + '='.repeat(80));
console.log('\nFiltering Statistics:');
console.log(`Total items processed: ${filter.filterStats.total}`);
console.log(`Items filtered out: ${filter.filterStats.filtered}`);
console.log(`Items kept: ${filter.filterStats.total - filter.filterStats.filtered}`);
console.log(`\nFilter reasons breakdown:`);
Object.entries(filter.filterStats.reasons).forEach(([reason, count]) => {
  console.log(`  ${reason}: ${count}`);
});

// Test the quality scoring system
console.log('\n' + '='.repeat(80));
console.log('\nQuality Scores for Sample Items:\n');

const scoringExamples = [
  { headline: "It's a map", summary: "" },
  { headline: "GPT 4", summary: "New model released" },
  { headline: "OpenAI Announces Major Breakthrough in AGI Research", summary: "The company reveals significant progress toward artificial general intelligence with new safety measures." },
  { headline: "Subscribe now", summary: "Get our premium newsletter" },
  { headline: "Microsoft", summary: "" }
];

scoringExamples.forEach(item => {
  const score = filter.scoreContent(item.headline, item.summary);
  console.log(`Score: ${score}/100 - "${item.headline}"`);
});

console.log('\n' + '='.repeat(80));
console.log('\nFilter test completed!');