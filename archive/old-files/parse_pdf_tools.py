#!/usr/bin/env python3
import json
import re

def clean_javascript_to_json(js_text):
    """Convert JavaScript object notation to valid JSON"""
    # Remove JavaScript variable declaration
    js_text = re.sub(r'const\s+\w+\s*=\s*', '', js_text)
    
    # Replace single quotes with double quotes (careful with apostrophes)
    # First protect apostrophes in text
    js_text = re.sub(r"(\w)'(\w)", r"\1APOSTROPHE\2", js_text)
    # Then replace single quotes
    js_text = re.sub(r"'", '"', js_text)
    # Restore apostrophes
    js_text = re.sub(r"APOSTROPHE", "'", js_text)
    
    # Remove trailing commas before closing braces/brackets
    js_text = re.sub(r',(\s*[}\]])', r'\1', js_text)
    
    # Handle unquoted keys (simple cases)
    js_text = re.sub(r'(\w+):', r'"\1":', js_text)
    
    # Fix double-quoted keys that got double-double-quoted
    js_text = re.sub(r'""(\w+)"":', r'"\1":', js_text)
    
    return js_text

def extract_tools_from_text(file_path):
    """Extract tool data from the text file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all tool objects
    tools = []
    
    # Pattern to match individual tool objects
    # Look for patterns starting with { and containing id, name, etc.
    tool_pattern = r'\{\s*id\s*:\s*\d+\s*,\s*name\s*:\s*"[^"]+".*?\}\s*\}'
    
    # Split by page markers to process page by page
    pages = content.split('============================================================')
    
    current_tool_text = ""
    in_tool = False
    brace_count = 0
    
    for page in pages:
        lines = page.split('\n')
        for line in lines:
            # Skip page headers
            if line.strip().startswith('PAGE') or line.strip() == '':
                continue
                
            # Track braces to find complete objects
            if '{' in line:
                if 'id:' in line and 'name:' in line:
                    in_tool = True
                    current_tool_text = ""
                    brace_count = 0
                
            if in_tool:
                current_tool_text += line + '\n'
                brace_count += line.count('{') - line.count('}')
                
                if brace_count == 0 and current_tool_text.strip():
                    # We have a complete tool object
                    try:
                        # Clean up the text
                        tool_text = current_tool_text.strip()
                        if tool_text.endswith(','):
                            tool_text = tool_text[:-1]
                        
                        # Try to convert to JSON
                        json_text = clean_javascript_to_json(tool_text)
                        tool_data = json.loads(json_text)
                        tools.append(tool_data)
                        print(f"Successfully extracted tool: {tool_data.get('name', 'Unknown')}")
                    except json.JSONDecodeError as e:
                        print(f"Failed to parse tool, trying manual extraction...")
                        # Try manual extraction
                        tool_data = extract_tool_manually(current_tool_text)
                        if tool_data:
                            tools.append(tool_data)
                            print(f"Manually extracted tool: {tool_data.get('name', 'Unknown')}")
                    
                    in_tool = False
                    current_tool_text = ""
    
    return tools

def extract_tool_manually(text):
    """Manually extract tool data from text when JSON parsing fails"""
    tool = {}
    
    # Extract basic fields
    patterns = {
        'id': r'id\s*:\s*(\d+)',
        'name': r'name\s*:\s*"([^"]+)"',
        'url': r'url\s*:\s*"([^"]+)"',
        'category': r'category\s*:\s*"([^"]+)"',
        'source': r'source\s*:\s*"([^"]+)"',
        'description': r'description\s*:\s*"([^"]+)"',
        'icon': r'icon\s*:\s*"([^"]+)"'
    }
    
    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            tool[field] = match.group(1).strip()
    
    # Extract tags
    tags_match = re.search(r'tags\s*:\s*\[(.*?)\]', text, re.DOTALL)
    if tags_match:
        tags_text = tags_match.group(1)
        tags = re.findall(r'"([^"]+)"', tags_text)
        tool['tags'] = tags
    
    # Extract features object
    features_match = re.search(r'features\s*:\s*\{(.*?)\n\s*\}', text, re.DOTALL)
    if features_match:
        features_text = features_match.group(1)
        tool['features'] = {}
        
        # Extract extensive description
        extensive_match = re.search(r'extensive\s*:\s*"(.*?)"(?:\s*,|\s*$)', features_text, re.DOTALL)
        if extensive_match:
            tool['features']['extensive'] = extensive_match.group(1).strip()
        
        # Extract pricing
        pricing_match = re.search(r'pricing\s*:\s*"(.*?)"(?:\s*,|\s*$)', features_text, re.DOTALL)
        if pricing_match:
            tool['features']['pricing'] = pricing_match.group(1).strip()
        
        # Extract integration
        integration_match = re.search(r'integration\s*:\s*"(.*?)"(?:\s*,|\s*$)', features_text, re.DOTALL)
        if integration_match:
            tool['features']['integration'] = integration_match.group(1).strip()
        
        # Extract use cases
        use_cases_match = re.search(r'useCases\s*:\s*\[(.*?)\]', features_text, re.DOTALL)
        if use_cases_match:
            use_cases_text = use_cases_match.group(1)
            use_cases = re.findall(r'"([^"]+)"', use_cases_text)
            tool['features']['useCases'] = use_cases
    
    return tool if tool.get('name') else None

def save_tools_data(tools, output_path):
    """Save the extracted tools data to a JavaScript file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('// Extracted tools data from PDF\n')
        f.write('const extractedToolsData = ')
        f.write(json.dumps(tools, indent=2))
        f.write(';\n\nexport default extractedToolsData;')

if __name__ == "__main__":
    input_file = "/workspaces/TOOLS/data/sources/extracted_pdf_content.txt"
    output_file = "/workspaces/TOOLS/data/sources/extracted_tools_data.js"
    
    print("Extracting tools from PDF content...")
    tools = extract_tools_from_text(input_file)
    
    print(f"\nTotal tools extracted: {len(tools)}")
    
    if tools:
        save_tools_data(tools, output_file)
        print(f"Tools data saved to: {output_file}")
        
        # Show sample of extracted data
        print("\nSample of extracted tools:")
        for i, tool in enumerate(tools[:3]):
            print(f"\n--- Tool {i+1} ---")
            print(f"Name: {tool.get('name')}")
            print(f"Category: {tool.get('category')}")
            print(f"URL: {tool.get('url')}")
            print(f"Tags: {tool.get('tags', [])}")
            if 'features' in tool:
                print(f"Has extensive features: {'extensive' in tool['features']}")
                print(f"Has pricing info: {'pricing' in tool['features']}")
                print(f"Has integration info: {'integration' in tool['features']}")
                print(f"Use cases count: {len(tool['features'].get('useCases', []))}")