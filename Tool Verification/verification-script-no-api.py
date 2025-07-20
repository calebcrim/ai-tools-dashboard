#!/usr/bin/env python3
"""
AI Tool Verification Script (No API Keys Required)
Version: 2.0
Date: July 18, 2025

This script verifies tool accessibility and generates reports for manual model verification.
Works with unified-tools-data.js structure.
"""

import json
import requests
import csv
from datetime import datetime
from typing import Dict, List, Tuple
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
from urllib.parse import urlparse

# Configuration
CONFIG = {
    "max_workers": 20,
    "timeout": 10,
    "rate_limit_delay": 0.1,
    "unified_tools_path": "/workspaces/ai-tools-dashboard/data/unified-tools-data.js"
}

# Known model deprecations (as of July 18, 2025)
KNOWN_MODEL_STATUS = {
    "gpt-4": {"status": "deprecated", "replacement": "gpt-4o or o4-mini"},
    "gpt-4-32k": {"status": "deprecated", "replacement": "gpt-4o-arch"},
    "gpt-3.5-turbo": {"status": "deprecated", "replacement": "o4-mini"},
    "claude-2": {"status": "deprecated", "replacement": "claude-4-sonnet or claude-4-opus"},
    "claude-2.1": {"status": "deprecated", "replacement": "claude-4-sonnet or claude-4-opus"},
    "palm-2": {"status": "deprecated", "replacement": "gemini-1.5-pro"},
    "gpt-4o": {"status": "up-to-date", "notes": "Current multimodal model"},
    "o4-mini": {"status": "up-to-date", "notes": "Low-latency model"},
    "claude-4-sonnet": {"status": "up-to-date", "notes": "Creative generation"},
    "claude-4-opus": {"status": "up-to-date", "notes": "Complex reasoning"},
    "gemini-1.5-pro": {"status": "up-to-date", "notes": "1M token context"}
}

class ToolVerifier:
    def __init__(self):
        self.results = {
            "metadata": {
                "report_date": datetime.now().isoformat(),
                "report_version": "2.0",
                "verification_method": "url_accessibility_check"
            },
            "tools": [],
            "model_mentions": [],
            "summary": {}
        }
        
    def load_unified_tools_data(self) -> Dict:
        """Load and parse the unified-tools-data.js file"""
        try:
            with open(CONFIG["unified_tools_path"], 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract the JSON object from the JavaScript file
            # Look for the pattern: const unifiedToolsData = {...}
            pattern = r'const\s+unifiedToolsData\s*=\s*(\{[\s\S]*?\});'
            match = re.search(pattern, content)
            
            if match:
                json_str = match.group(1)
                # Parse the JSON
                data = json.loads(json_str)
                return data
            else:
                # Try alternative parsing
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                json_str = content[json_start:json_end]
                return json.loads(json_str)
                
        except Exception as e:
            print(f"Error loading unified tools data: {e}")
            return {"tools": []}
    
    def normalize_url(self, url: str) -> str:
        """Normalize URL to ensure it has proper format"""
        if not url:
            return ""
            
        # Remove any trailing slashes
        url = url.strip().rstrip('/')
        
        # Add https:// if no protocol specified
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        return url
    
    def check_tool_accessibility(self, tool: Dict) -> Dict:
        """Check if a tool's URL is accessible"""
        result = {
            "id": tool.get("id"),
            "tool_name": tool.get("tool_name"),
            "url": tool.get("url"),
            "category": tool.get("category"),
            "status": "unknown",
            "http_status": None,
            "response_time": None,
            "notes": "",
            "requires_manual_check": False
        }
        
        try:
            url = self.normalize_url(tool.get("url", ""))
            if not url:
                result["status"] = "no_url"
                result["notes"] = "No URL provided"
                return result
            
            # Make the request
            start_time = time.time()
            response = requests.head(
                url,
                timeout=CONFIG["timeout"],
                allow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Tool Verification Bot)'
                }
            )
            response_time = time.time() - start_time
            
            result["http_status"] = response.status_code
            result["response_time"] = round(response_time, 2)
            
            # Determine status based on HTTP response
            if response.status_code == 200:
                result["status"] = "accessible"
                result["notes"] = "Tool website is accessible"
            elif 300 <= response.status_code < 400:
                result["status"] = "redirected"
                result["notes"] = f"Redirected to {response.url}"
                result["requires_manual_check"] = True
            elif response.status_code == 403:
                result["status"] = "access_forbidden"
                result["notes"] = "Access forbidden - may require authentication"
                result["requires_manual_check"] = True
            elif response.status_code == 404:
                result["status"] = "not_found"
                result["notes"] = "URL returns 404 - tool may be deprecated"
            else:
                result["status"] = "error"
                result["notes"] = f"HTTP {response.status_code}"
                result["requires_manual_check"] = True
                
        except requests.exceptions.Timeout:
            result["status"] = "timeout"
            result["notes"] = "Request timed out"
            result["requires_manual_check"] = True
        except requests.exceptions.ConnectionError:
            result["status"] = "connection_error"
            result["notes"] = "Could not connect to server"
            result["requires_manual_check"] = True
        except Exception as e:
            result["status"] = "error"
            result["notes"] = str(e)[:100]  # Limit error message length
            result["requires_manual_check"] = True
        
        time.sleep(CONFIG["rate_limit_delay"])  # Rate limiting
        return result
    
    def extract_model_mentions(self, tools: List[Dict]) -> List[Dict]:
        """Extract any LLM model mentions from tool descriptions"""
        model_mentions = []
        model_patterns = [
            r'gpt-\d+(\.\d+)?(-\w+)?',
            r'claude-?\d*(\.\d+)?(-\w+)?',
            r'gemini-?\d*(\.\d+)?(-\w+)?',
            r'palm-?\d*',
            r'llama-?\d*(\.\d+)?',
            r'o4-mini',
            r'gpt-4o'
        ]
        
        for tool in tools:
            # Check all text fields for model mentions
            text_fields = [
                tool.get("brief_purpose_summary", ""),
                tool.get("feature_breakdown", ""),
                " ".join(tool.get("use_cases_in_pr", [])),
                tool.get("case_studies", "")
            ]
            
            combined_text = " ".join(text_fields).lower()
            
            for pattern in model_patterns:
                matches = re.findall(pattern, combined_text, re.IGNORECASE)
                for match in matches:
                    model_name = match if isinstance(match, str) else match[0]
                    model_status = KNOWN_MODEL_STATUS.get(model_name, {
                        "status": "unknown",
                        "notes": "Requires manual verification"
                    })
                    
                    model_mentions.append({
                        "tool_id": tool.get("id"),
                        "tool_name": tool.get("tool_name"),
                        "model_mentioned": model_name,
                        "status": model_status.get("status"),
                        "replacement": model_status.get("replacement", ""),
                        "notes": model_status.get("notes", ""),
                        "found_in": "tool_description"
                    })
        
        return model_mentions
    
    def verify_all_tools(self, tools: List[Dict]) -> None:
        """Verify all tools in parallel"""
        print(f"Starting verification of {len(tools)} tools...")
        
        # Use ThreadPoolExecutor for parallel checks
        with ThreadPoolExecutor(max_workers=CONFIG["max_workers"]) as executor:
            # Submit all tasks
            future_to_tool = {
                executor.submit(self.check_tool_accessibility, tool): tool 
                for tool in tools
            }
            
            # Process completed tasks
            completed = 0
            for future in as_completed(future_to_tool):
                result = future.result()
                self.results["tools"].append(result)
                completed += 1
                
                # Progress indicator
                if completed % 10 == 0:
                    print(f"Progress: {completed}/{len(tools)} tools checked")
        
        # Extract model mentions
        print("Extracting model mentions from tool descriptions...")
        self.results["model_mentions"] = self.extract_model_mentions(tools)
        
        # Calculate summary statistics
        self.calculate_summary()
    
    def calculate_summary(self) -> None:
        """Calculate summary statistics"""
        tool_summary = {
            "total_tools": len(self.results["tools"]),
            "accessible": 0,
            "redirected": 0,
            "not_found": 0,
            "errors": 0,
            "no_url": 0,
            "requires_manual_check": 0
        }
        
        for tool in self.results["tools"]:
            status = tool["status"]
            if status == "accessible":
                tool_summary["accessible"] += 1
            elif status == "redirected":
                tool_summary["redirected"] += 1
            elif status == "not_found":
                tool_summary["not_found"] += 1
            elif status == "no_url":
                tool_summary["no_url"] += 1
            else:
                tool_summary["errors"] += 1
            
            if tool.get("requires_manual_check"):
                tool_summary["requires_manual_check"] += 1
        
        model_summary = {
            "total_mentions": len(self.results["model_mentions"]),
            "deprecated_models": len([m for m in self.results["model_mentions"] if m["status"] == "deprecated"]),
            "current_models": len([m for m in self.results["model_mentions"] if m["status"] == "up-to-date"]),
            "unknown_models": len([m for m in self.results["model_mentions"] if m["status"] == "unknown"])
        }
        
        self.results["summary"] = {
            "tools": tool_summary,
            "models": model_summary
        }
    
    def generate_json_report(self, filename: str) -> None:
        """Generate JSON report"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"✅ JSON report saved: {filename}")
    
    def generate_csv_report(self, filename: str) -> None:
        """Generate CSV report for tools"""
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                "ID", "Tool Name", "URL", "Category", "Status", 
                "HTTP Status", "Response Time (s)", "Notes", "Requires Manual Check"
            ])
            
            # Data
            for tool in self.results["tools"]:
                writer.writerow([
                    tool["id"],
                    tool["tool_name"],
                    tool["url"],
                    tool["category"],
                    tool["status"],
                    tool["http_status"],
                    tool["response_time"],
                    tool["notes"],
                    "Yes" if tool["requires_manual_check"] else "No"
                ])
        
        print(f"✅ CSV report saved: {filename}")
    
    def generate_markdown_report(self, filename: str) -> None:
        """Generate comprehensive Markdown report"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"""# AI Tools Verification Report

**Date**: {self.results['metadata']['report_date']}  
**Total Tools Analyzed**: {self.results['summary']['tools']['total_tools']}

## Executive Summary

### Tool Accessibility
- ✅ **Accessible**: {self.results['summary']['tools']['accessible']} tools
- 🔄 **Redirected**: {self.results['summary']['tools']['redirected']} tools  
- ❌ **Not Found**: {self.results['summary']['tools']['not_found']} tools
- ⚠️ **Errors/Issues**: {self.results['summary']['tools']['errors']} tools
- 📝 **No URL**: {self.results['summary']['tools']['no_url']} tools
- 🔍 **Requires Manual Check**: {self.results['summary']['tools']['requires_manual_check']} tools

### Model References in Tool Descriptions
- 📊 **Total Model Mentions**: {self.results['summary']['models']['total_mentions']}
- ❌ **Deprecated Models**: {self.results['summary']['models']['deprecated_models']}
- ✅ **Current Models**: {self.results['summary']['models']['current_models']}
- ❓ **Unknown Models**: {self.results['summary']['models']['unknown_models']}

## Critical Issues Requiring Immediate Attention

### Tools Not Found (Potential Deprecations)
""")
            
            # List tools that returned 404
            not_found = [t for t in self.results["tools"] if t["status"] == "not_found"]
            if not_found:
                for tool in not_found[:10]:  # Limit to first 10
                    f.write(f"- **{tool['tool_name']}** ({tool['url']})\n")
                if len(not_found) > 10:
                    f.write(f"- ... and {len(not_found) - 10} more\n")
            else:
                f.write("- None found\n")
            
            f.write("\n### Deprecated Model References\n")
            deprecated_models = [m for m in self.results["model_mentions"] if m["status"] == "deprecated"]
            if deprecated_models:
                # Group by model
                model_groups = {}
                for mention in deprecated_models:
                    model = mention["model_mentioned"]
                    if model not in model_groups:
                        model_groups[model] = []
                    model_groups[model].append(mention["tool_name"])
                
                for model, tools in model_groups.items():
                    replacement = deprecated_models[0]["replacement"]  # Get replacement info
                    f.write(f"\n#### {model} → {replacement}\n")
                    f.write(f"Found in {len(tools)} tools:\n")
                    for tool in tools[:5]:  # Show first 5 tools
                        f.write(f"- {tool}\n")
                    if len(tools) > 5:
                        f.write(f"- ... and {len(tools) - 5} more\n")
            else:
                f.write("- No deprecated models found\n")
            
            f.write("""
## Recommended Actions

### Immediate (Within 24 hours)
1. **Update Model References**: Replace all deprecated model mentions with current versions
2. **Verify 404 Tools**: Check if tools returning 404 have moved or been discontinued
3. **Review Redirected URLs**: Update tool URLs that have been redirected

### Short-term (Within 1 week)
1. **Manual Verification**: Check all tools marked as "Requires Manual Check"
2. **API Integration**: For tools with APIs, verify endpoint availability
3. **Documentation Update**: Update Best Practices pages with current model information

### Long-term (Within 1 month)
1. **Automation Setup**: Implement monthly verification schedule
2. **Monitoring Dashboard**: Create real-time tool status dashboard
3. **Deprecation Process**: Establish process for handling deprecated tools

## Detailed Results

Full results available in:
- JSON format: `verification_report_YYYYMMDD.json`
- CSV format: `tools_verification_YYYYMMDD.csv`

---
*Generated by AI Tools Verification Script v2.0*
""")
        
        print(f"✅ Markdown report saved: {filename}")

def main():
    """Main execution function"""
    print("🔍 AI Tools Verification Script")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    verifier = ToolVerifier()
    
    # Load unified tools data
    print("Loading unified tools data...")
    data = verifier.load_unified_tools_data()
    tools = data.get("tools", [])
    
    if not tools:
        print("❌ No tools found in the data file!")
        return
    
    print(f"✅ Loaded {len(tools)} tools")
    
    # Run verification
    verifier.verify_all_tools(tools)
    
    # Generate reports
    print("\n📊 Generating reports...")
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Generate all report formats
    verifier.generate_json_report(f"verification_report_{timestamp}.json")
    verifier.generate_csv_report(f"tools_verification_{timestamp}.csv")
    verifier.generate_markdown_report(f"verification_summary_{timestamp}.md")
    
    print("\n🎉 Verification complete!")
    print(f"\nSummary:")
    print(f"- Tools checked: {verifier.results['summary']['tools']['total_tools']}")
    print(f"- Accessible: {verifier.results['summary']['tools']['accessible']}")
    print(f"- Issues found: {verifier.results['summary']['tools']['requires_manual_check']}")
    print(f"- Deprecated models found: {verifier.results['summary']['models']['deprecated_models']}")

if __name__ == "__main__":
    main()