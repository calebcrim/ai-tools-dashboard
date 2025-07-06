#!/bin/bash

echo "🔄 Starting tool update process..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Create a backup of the current data
echo "📦 Creating backup..."
cp data/unified-tools-data.js "data/unified-tools-data.backup.$(date +%s).js"

# Run the enhanced build process
echo "🔧 Building unified tools data..."
node data/build-tools-data-enhanced.js

# Clean any citation references
echo "🧹 Cleaning citation references..."
node clean-citations.js

# Show statistics
echo ""
echo "✅ Update complete!"
node -e "
const data = require('./data/unified-tools-data.js');
const complete = data.tools.filter(t => t.feature_breakdown && t.pricing_model && t.use_cases_in_pr?.length > 0);
console.log('Total tools: ' + data.tools.length);
console.log('Tools with complete data: ' + complete.length + ' (' + Math.round(complete.length/data.tools.length*100) + '%)');
"