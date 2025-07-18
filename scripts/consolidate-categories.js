import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to load the unified tools data
async function loadUnifiedToolsData() {
  const dataPath = join(__dirname, '../data/unified-tools-data.js');
  const content = await fs.readFile(dataPath, 'utf8');
  
  // Extract the data from the JS file
  const dataMatch = content.match(/const unifiedToolsData = ({[\s\S]*});/);
  if (!dataMatch) {
    throw new Error('Could not parse unified-tools-data.js');
  }
  
  // Parse the JSON-like structure
  const dataString = dataMatch[1];
  return JSON.parse(dataString);
}

async function consolidateCategories() {
  try {
    console.log('Starting category consolidation...');
    
    // Load existing data
    const unifiedData = await loadUnifiedToolsData();
    const tools = unifiedData.tools;
    
    // Load category mapping
    const mappingPath = join(__dirname, '../data/category-mapping.json');
    const mappingData = await fs.readFile(mappingPath, 'utf8');
    const { categoryMapping } = JSON.parse(mappingData);
    
    // Create backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(__dirname, `../data/unified-tools-data.backup-${timestamp}.js`);
    const originalPath = join(__dirname, '../data/unified-tools-data.js');
    const originalContent = await fs.readFile(originalPath, 'utf8');
    await fs.writeFile(backupPath, originalContent);
    console.log(`Backup created: ${backupPath}`);
    
    // Statistics
    const stats = {
      totalTools: tools.length,
      categoriesUpdated: 0,
      toolsWithoutCategory: [],
      oldCategories: new Set(),
      newCategories: new Set(),
      mappingDetails: []
    };
    
    // Update categories
    tools.forEach(tool => {
      const oldCategory = tool.category;
      if (oldCategory) {
        stats.oldCategories.add(oldCategory);
        
        if (categoryMapping.hasOwnProperty(oldCategory)) {
          const newCategory = categoryMapping[oldCategory];
          
          if (newCategory === null) {
            stats.toolsWithoutCategory.push({
              name: tool.tool_name,
              oldCategory: oldCategory
            });
            delete tool.category;
          } else {
            tool.category = newCategory;
            stats.newCategories.add(newCategory);
            stats.categoriesUpdated++;
            stats.mappingDetails.push({
              tool: tool.tool_name,
              from: oldCategory,
              to: newCategory
            });
          }
        } else {
          // Keep categories not in mapping (they might be already consolidated)
          stats.newCategories.add(oldCategory);
        }
      } else {
        stats.toolsWithoutCategory.push({
          name: tool.tool_name,
          oldCategory: 'none'
        });
      }
    });
    
    // Update the unified data object
    if (!unifiedData.metadata) {
      unifiedData.metadata = {};
    }
    unifiedData.metadata.categories = Array.from(stats.newCategories).sort();
    unifiedData.metadata.lastUpdated = new Date().toISOString();
    
    // Generate the new JS file content
    const output = `// Auto-generated unified tools data with consolidated categories
// Last updated: ${unifiedData.metadata.lastUpdated}
// Total tools: ${unifiedData.tools.length}
// Categories: ${unifiedData.metadata.categories.length} (reduced from ${stats.oldCategories.size})

const unifiedToolsData = ${JSON.stringify(unifiedData, null, 2)};

// Browser compatibility
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}

// CommonJS export for Node.js scripts  
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}`;
    
    // Save updated data
    const outputPath = join(__dirname, '../data/unified-tools-data.js');
    await fs.writeFile(outputPath, output);
    console.log('Updated tools data saved');
    
    // Generate detailed report
    const report = {
      summary: {
        totalTools: stats.totalTools,
        toolsUpdated: stats.categoriesUpdated,
        toolsWithoutCategory: stats.toolsWithoutCategory.length,
        oldCategoryCount: stats.oldCategories.size,
        newCategoryCount: stats.newCategories.size
      },
      oldCategories: Array.from(stats.oldCategories).sort(),
      newCategories: Array.from(stats.newCategories).sort(),
      unmappedTools: stats.toolsWithoutCategory,
      migrationDetails: stats.mappingDetails.slice(0, 10) // First 10 for preview
    };
    
    const reportPath = join(__dirname, '../data/migration-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total tools: ${report.summary.totalTools}`);
    console.log(`Categories before: ${report.summary.oldCategoryCount}`);
    console.log(`Categories after: ${report.summary.newCategoryCount}`);
    console.log(`Tools updated: ${report.summary.toolsUpdated}`);
    console.log(`Tools without category: ${report.summary.toolsWithoutCategory}`);
    console.log(`\nReport saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error during consolidation:', error);
    process.exit(1);
  }
}

// Run the consolidation
consolidateCategories();