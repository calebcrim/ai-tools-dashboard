import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the backup file which we know is good
const backupContent = fs.readFileSync('data/unified-tools-data.backup-fix.js', 'utf8');

// Extract the data
const match = backupContent.match(/const unifiedToolsData = ({[\s\S]*});/);
if (!match) {
    console.error('Could not parse backup file');
    process.exit(1);
}

// Parse the data
const data = JSON.parse(match[1]);
console.log(`Found ${data.tools.length} tools`);

// Write a clean version
const output = `// Auto-generated unified tools data - Fixed loading issues
// Last updated: ${new Date().toISOString()}
// Total tools: ${data.tools.length}

// Define in global scope for browser compatibility
var unifiedToolsData = ${JSON.stringify(data, null, 2)};

// Ensure it's available on window object
if (typeof window !== 'undefined') {
    window.unifiedToolsData = unifiedToolsData;
}

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unifiedToolsData;
}`;

fs.writeFileSync('data/unified-tools-data.js', output);
console.log('✅ Fixed unified-tools-data.js with proper global access');