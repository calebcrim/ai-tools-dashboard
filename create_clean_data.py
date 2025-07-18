import json
import re

# Read the backup file
with open('data/unified-tools-data.backup-fix.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JSON data
match = re.search(r'const unifiedToolsData = ({[\s\S]*});', content)
if not match:
    print("Error: Could not find data")
    exit(1)

data = json.loads(match.group(1))
print(f"Processing {len(data['tools'])} tools...")

# Clean problematic Unicode characters
def clean_text(text):
    if not isinstance(text, str):
        return text
    
    # Replace various dash types with regular dash
    text = text.replace('\u2013', '-')  # en dash
    text = text.replace('\u2014', '-')  # em dash
    text = text.replace('\u2212', '-')  # minus sign
    
    # Replace smart quotes
    text = text.replace('\u201c', '"')  # left double quote
    text = text.replace('\u201d', '"')  # right double quote
    text = text.replace('\u2018', "'")  # left single quote
    text = text.replace('\u2019', "'")  # right single quote
    
    # Replace other problematic characters
    text = text.replace('\u2026', '...')  # ellipsis
    text = text.replace('\u00a0', ' ')    # non-breaking space
    
    return text

# Clean all text fields in the data
def clean_obj(obj):
    if isinstance(obj, dict):
        return {k: clean_obj(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_obj(item) for item in obj]
    elif isinstance(obj, str):
        return clean_text(obj)
    return obj

data = clean_obj(data)

# Create the JavaScript file with proper structure
output = '''// Unified Tools Data - All 317 AI tools
// Last updated: {}
// Auto-generated file - do not edit directly

(function() {{
  'use strict';
  
  // The main data object
  const unifiedToolsData = {};
  
  // Make it available globally
  if (typeof window !== 'undefined') {{
    window.unifiedToolsData = unifiedToolsData;
  }}
  
  // CommonJS export
  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = unifiedToolsData;
  }}
  
  // AMD support
  if (typeof define === 'function' && define.amd) {{
    define([], function() {{ return unifiedToolsData; }});
  }}
}})();
'''.format(
    data.get('metadata', {}).get('lastUpdated', 'Unknown'),
    json.dumps(data, indent=2, ensure_ascii=True)
)

# Write the file
with open('data/unified-tools-data.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("✅ Created clean unified-tools-data.js file")