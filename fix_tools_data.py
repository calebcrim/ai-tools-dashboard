import json
import re

# Read the current file
with open('data/unified-tools-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON data
match = re.search(r'const unifiedToolsData = ({[\s\S]*});', content)
if not match:
    print("Error: Could not find unifiedToolsData")
    exit(1)

# Parse and re-serialize to ensure clean JSON
data = json.loads(match.group(1))

# Clean any problematic characters in strings
def clean_string(s):
    if isinstance(s, str):
        # Replace smart quotes and other problematic characters
        s = s.replace('"', '"').replace('"', '"')
        s = s.replace(''', "'").replace(''', "'")
        s = s.replace('–', '-').replace('—', '-')
        s = s.replace('\u2013', '-').replace('\u2014', '-')
        s = s.replace('\u201c', '"').replace('\u201d', '"')
        s = s.replace('\u2018', "'").replace('\u2019', "'")
    return s

def clean_data(obj):
    if isinstance(obj, dict):
        return {k: clean_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_data(item) for item in obj]
    elif isinstance(obj, str):
        return clean_string(obj)
    else:
        return obj

# Clean the data
data = clean_data(data)

# Generate the cleaned file
output = f'''// Auto-generated unified tools data
// Last updated: {data.get('metadata', {}).get('lastUpdated', 'Unknown')}
// Total tools: {len(data['tools'])}
// Fixed encoding issues

const unifiedToolsData = {json.dumps(data, indent=2, ensure_ascii=False)};

// Browser compatibility - ensure global access
if (typeof window !== 'undefined') {{
    window.unifiedToolsData = unifiedToolsData;
}}

// CommonJS export for Node.js scripts  
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = unifiedToolsData;
}}

// AMD module support
if (typeof define === 'function' && define.amd) {{
    define([], function() {{
        return unifiedToolsData;
    }});
}}'''

# Write the fixed file
with open('data/unified-tools-data.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("✅ Fixed unified-tools-data.js - cleaned special characters and ensured proper loading")