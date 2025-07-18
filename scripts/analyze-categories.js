const data = require('../data/unified-tools-data.js');

console.log('=== CATEGORY ANALYSIS ===\n');

const categories = {};
let toolsWithoutCategory = 0;

data.tools.forEach(tool => {
  if (tool.category) {
    categories[tool.category] = (categories[tool.category] || 0) + 1;
  } else {
    toolsWithoutCategory++;
  }
});

const sortedCategories = Object.entries(categories)
  .sort((a, b) => b[1] - a[1]);

console.log(`Total unique categories: ${sortedCategories.length}`);
console.log(`Tools without category: ${toolsWithoutCategory}\n`);

console.log('All categories with tool counts:');
console.log('================================');
sortedCategories.forEach(([cat, count]) => {
  console.log(`${count.toString().padStart(3)} - ${cat}`);
});

// Find potentially redundant categories
console.log('\n\nPotentially redundant categories:');
console.log('=================================');
const aiCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('ai'));
console.log('\nAI-related:', aiCategories.map(([cat]) => cat).join(', '));

const contentCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('content'));
console.log('\nContent-related:', contentCategories.map(([cat]) => cat).join(', '));

const securityCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('security'));
console.log('\nSecurity-related:', securityCategories.map(([cat]) => cat).join(', '));

const legalCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('legal'));
console.log('\nLegal-related:', legalCategories.map(([cat]) => cat).join(', '));

const socialCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('social'));
console.log('\nSocial-related:', socialCategories.map(([cat]) => cat).join(', '));

const mediaCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('media'));
console.log('\nMedia-related:', mediaCategories.map(([cat]) => cat).join(', '));

const dataCategories = sortedCategories.filter(([cat]) => cat.toLowerCase().includes('data'));
console.log('\nData-related:', dataCategories.map(([cat]) => cat).join(', '));