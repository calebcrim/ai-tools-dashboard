#!/usr/bin/env python3
import PyPDF2
import json
import re

def extract_pdf_content(pdf_path):
    """Extract text content from PDF file"""
    extracted_text = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            print(f"Total pages in PDF: {num_pages}")
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                extracted_text.append({
                    'page': page_num + 1,
                    'content': text
                })
                
        return extracted_text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def analyze_tool_structure(text_pages):
    """Analyze the structure of tool documentation in the PDF"""
    # Look for patterns in the text
    tool_entries = []
    current_tool = None
    
    # Common patterns to look for
    patterns = {
        'tool_name': r'^([A-Z][A-Za-z0-9\s\-\.]+)(?:\s*[-–—]\s*|:)',
        'features': r'(?:Features?|Capabilities|Functions?):\s*(.*?)(?=\n\n|\Z)',
        'pricing': r'(?:Pricing|Cost|Price):\s*(.*?)(?=\n|\Z)',
        'pros': r'(?:Pros?|Advantages?|Benefits?):\s*(.*?)(?=\n\n|\Z)',
        'cons': r'(?:Cons?|Disadvantages?|Limitations?):\s*(.*?)(?=\n\n|\Z)',
        'integration': r'(?:Integration|Integrates? with):\s*(.*?)(?=\n|\Z)',
        'learning': r'(?:Learning [Cc]urve|Ease of [Uu]se):\s*(.*?)(?=\n|\Z)',
        'use_cases': r'(?:Use [Cc]ases?|Applications?):\s*(.*?)(?=\n\n|\Z)'
    }
    
    # Process each page
    for page_data in text_pages[:5]:  # Look at first 5 pages for structure
        content = page_data['content']
        lines = content.split('\n')
        
        print(f"\n--- Page {page_data['page']} Preview (first 500 chars) ---")
        print(content[:500])
        print("...")
        
    return tool_entries

def save_extracted_content(text_pages, output_path):
    """Save extracted content to a text file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for page_data in text_pages:
            f.write(f"\n{'='*60}\n")
            f.write(f"PAGE {page_data['page']}\n")
            f.write(f"{'='*60}\n\n")
            f.write(page_data['content'])
            f.write('\n')

if __name__ == "__main__":
    pdf_path = "/workspaces/TOOLS/data/sources/AI Tool Data Enrichment.pdf"
    
    # Extract content
    extracted_content = extract_pdf_content(pdf_path)
    
    if extracted_content:
        # Save raw extracted text
        output_path = "/workspaces/TOOLS/data/sources/extracted_pdf_content.txt"
        save_extracted_content(extracted_content, output_path)
        print(f"\nExtracted content saved to: {output_path}")
        
        # Analyze structure
        print("\nAnalyzing document structure...")
        analyze_tool_structure(extracted_content)