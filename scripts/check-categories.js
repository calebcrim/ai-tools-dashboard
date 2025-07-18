import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkCategories() {
  const dataPath = join(__dirname, '../data/unified-tools-data.js');
  const content = await fs.readFile(dataPath, 'utf8');
  
  // Extract the data from the JS file
  const dataMatch = content.match(/const unifiedToolsData = ({[\s\S]*});/);
  if (!dataMatch) {
    throw new Error('Could not parse unified-tools-data.js');
  }
  
  // Parse the JSON-like structure
  const dataString = dataMatch[1];
  const data = JSON.parse(dataString);
  
  const categories = {};
  data.tools.forEach(t => {
    if (t.category) categories[t.category] = (categories[t.category] || 0) + 1;
  });
  
  console.log(`New Categories (${Object.keys(categories).length} total):`);
  console.log('===================');
  Object.entries(categories)
    .sort((a,b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`${count.toString().padStart(3)} - ${cat}`));
}

checkCategories();