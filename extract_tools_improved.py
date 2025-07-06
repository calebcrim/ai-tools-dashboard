#!/usr/bin/env python3
import json
import re

def read_extracted_content(file_path):
    """Read the extracted PDF content and return as single string"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

def extract_all_tools(content):
    """Extract all tool objects from the content"""
    tools = []
    
    # Remove page headers and separators
    content = re.sub(r'={60,}\nPAGE \d+\n={60,}\n', '', content)
    
    # The content appears to be a JavaScript array of objects
    # Let's try to extract everything between const toolsData = [ and the final ]
    
    # Find the start of the array
    start_match = re.search(r'const\s*toolsData\s*=\s*\[', content)
    if not start_match:
        # If not found, just start from the beginning
        start_pos = 0
    else:
        start_pos = start_match.end()
    
    # Process the content character by character to extract complete objects
    current_object = ""
    brace_count = 0
    in_object = False
    i = start_pos
    
    while i < len(content):
        char = content[i]
        
        if char == '{' and not in_object:
            # Start of a new object
            in_object = True
            brace_count = 1
            current_object = char
        elif in_object:
            current_object += char
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    # End of object
                    tool = parse_single_tool(current_object)
                    if tool and tool.get('id'):
                        tools.append(tool)
                        print(f"Extracted tool {tool.get('id')}: {tool.get('name')}")
                    in_object = False
                    current_object = ""
        
        i += 1
    
    return tools

def parse_single_tool(tool_text):
    """Parse a single tool object from JavaScript notation"""
    try:
        # Clean up the JavaScript object notation
        tool = {}
        
        # Extract simple fields
        fields = {
            'id': r'id\s*:\s*(\d+)',
            'name': r'name\s*:\s*"([^"]*)"',
            'url': r'url\s*:\s*"([^"]*)"',
            'category': r'category\s*:\s*"([^"]*)"',
            'source': r'source\s*:\s*"([^"]*)"',
            'icon': r'icon\s*:\s*"([^"]*)"'
        }
        
        for field, pattern in fields.items():
            match = re.search(pattern, tool_text)
            if match:
                value = match.group(1)
                if field == 'id':
                    tool[field] = int(value)
                else:
                    tool[field] = value
        
        # Extract description (might be multi-line)
        desc_match = re.search(r'description\s*:\s*"([^"]*(?:\n[^"]*)*)"', tool_text, re.DOTALL)
        if desc_match:
            tool['description'] = desc_match.group(1).replace('\n', ' ').strip()
        
        # Extract tags array
        tags_match = re.search(r'tags\s*:\s*\[(.*?)\]', tool_text, re.DOTALL)
        if tags_match:
            tags_content = tags_match.group(1)
            tags = re.findall(r'"([^"]*)"', tags_content)
            tool['tags'] = tags
        
        # Extract features object
        features_match = re.search(r'features\s*:\s*\{(.*?)\n\s*\}', tool_text, re.DOTALL)
        if features_match:
            features_content = features_match.group(1)
            tool['features'] = {}
            
            # Extract each feature field
            feature_fields = ['extensive', 'pricing', 'integration', 'pros', 'cons', 'learningCurve']
            for field in feature_fields:
                pattern = rf'{field}\s*:\s*"([^"]*(?:\n[^"]*)*)"'
                match = re.search(pattern, features_content, re.DOTALL)
                if match:
                    value = match.group(1).replace('\n', ' ').strip()
                    if value:  # Only add non-empty values
                        tool['features'][field] = value
            
            # Extract useCases array
            use_cases_match = re.search(r'useCases\s*:\s*\[(.*?)\]', features_content, re.DOTALL)
            if use_cases_match:
                use_cases_content = use_cases_match.group(1)
                use_cases = re.findall(r'"([^"]*)"', use_cases_content)
                tool['features']['useCases'] = use_cases
        
        return tool
        
    except Exception as e:
        print(f"Error parsing tool: {e}")
        return None

def save_as_javascript(tools, output_path):
    """Save tools as JavaScript module"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('// Tools data extracted from AI Tool Data Enrichment PDF\n')
        f.write('// Generated automatically from PDF content\n\n')
        f.write('const pdfExtractedTools = [\n')
        
        for i, tool in enumerate(tools):
            f.write('  ')
            f.write(json.dumps(tool, indent=2).replace('\n', '\n  '))
            if i < len(tools) - 1:
                f.write(',')
            f.write('\n')
        
        f.write('];\n\n')
        f.write('export default pdfExtractedTools;\n')

def create_summary_report(tools):
    """Create a summary report of extracted tools"""
    report = []
    report.append("PDF EXTRACTION SUMMARY")
    report.append("=" * 50)
    report.append(f"Total tools extracted: {len(tools)}")
    report.append("")
    
    # Group by category
    categories = {}
    for tool in tools:
        cat = tool.get('category', 'unknown')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(tool)
    
    report.append("Tools by category:")
    for cat, cat_tools in sorted(categories.items()):
        report.append(f"\n{cat.upper()} ({len(cat_tools)} tools):")
        for tool in cat_tools:
            report.append(f"  - {tool.get('name')} ({tool.get('url', 'no url')})")
    
    report.append("\n" + "=" * 50)
    report.append("EXTRACTED FIELDS STRUCTURE:")
    if tools:
        sample = tools[0]
        report.append(f"- id: {type(sample.get('id')).__name__ if 'id' in sample else 'missing'}")
        report.append(f"- name: {type(sample.get('name')).__name__ if 'name' in sample else 'missing'}")
        report.append(f"- url: {type(sample.get('url')).__name__ if 'url' in sample else 'missing'}")
        report.append(f"- category: {type(sample.get('category')).__name__ if 'category' in sample else 'missing'}")
        report.append(f"- description: {type(sample.get('description')).__name__ if 'description' in sample else 'missing'}")
        report.append(f"- tags: {type(sample.get('tags')).__name__ if 'tags' in sample else 'missing'}")
        report.append(f"- features: {type(sample.get('features')).__name__ if 'features' in sample else 'missing'}")
        
        if 'features' in sample and isinstance(sample['features'], dict):
            report.append("\n  Features sub-fields:")
            for key in sample['features']:
                report.append(f"    - {key}: {type(sample['features'][key]).__name__}")
    
    return '\n'.join(report)

if __name__ == "__main__":
    input_file = "/workspaces/TOOLS/data/sources/extracted_pdf_content.txt"
    output_js = "/workspaces/TOOLS/data/sources/pdf_extracted_tools.js"
    output_report = "/workspaces/TOOLS/data/sources/extraction_report.txt"
    
    print("Reading extracted PDF content...")
    content = read_extracted_content(input_file)
    
    print("Extracting tools...")
    tools = extract_all_tools(content)
    
    if tools:
        # Save as JavaScript
        save_as_javascript(tools, output_js)
        print(f"\nSaved {len(tools)} tools to: {output_js}")
        
        # Create summary report
        report = create_summary_report(tools)
        with open(output_report, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Summary report saved to: {output_report}")
        
        # Print summary
        print("\n" + report)
    else:
        print("No tools found in the content!")