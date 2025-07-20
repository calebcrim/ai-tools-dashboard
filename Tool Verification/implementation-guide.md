# Verification Implementation Guide

## 🏃 Quick Start

### Step 1: Save the Verification Script
Save the Python script as `verify_tools.py` in your project root:
```bash
/workspaces/ai-tools-dashboard/verify_tools.py
```

### Step 2: Install Required Dependencies
```bash
pip install requests
```

### Step 3: Run the Verification
```bash
cd /workspaces/ai-tools-dashboard
python verify_tools.py
```

## 📊 Expected Output

The script will generate three files:

1. **verification_report_YYYYMMDD_HHMMSS.json**
   - Complete data for all 317 tools
   - Model mention analysis
   - Detailed status for each tool

2. **tools_verification_YYYYMMDD_HHMMSS.csv**
   - Spreadsheet-friendly format
   - Easy to sort and filter
   - Import into Excel/Google Sheets

3. **verification_summary_YYYYMMDD_HHMMSS.md**
   - Executive summary
   - Critical issues highlighted
   - Action items organized by priority

## 🔍 What the Script Checks

### For Each Tool:
- ✅ URL accessibility (HTTP status)
- ⏱️ Response time
- 🔄 Redirect detection
- ❌ 404/deprecation detection
- 📝 Tools with missing URLs

### For Model References:
- 🔎 Scans all text fields for model mentions
- 🏷️ Identifies deprecated models
- 💡 Suggests replacements
- 📍 Shows which tools need updates

## 📋 Post-Verification Actions

### 1. Review the Summary Report
Open `verification_summary_YYYYMMDD_HHMMSS.md` for:
- Executive summary
- Critical issues
- Prioritized action items

### 2. Handle 404 Errors
For tools showing "not_found":
```bash
# Extract not found tools
grep "not_found" tools_verification_*.csv
```
- Check if the company was acquired
- Search for new URL
- Mark as deprecated if discontinued

### 3. Update Redirected URLs
For tools showing "redirected":
```bash
# Extract redirected tools
grep "redirected" tools_verification_*.csv
```
- Update the URL in unified-tools-data.js
- Verify the new destination is correct

### 4. Fix Model References
From the JSON report, find deprecated models:
```bash
# Using jq (if installed)
jq '.model_mentions[] | select(.status == "deprecated")' verification_report_*.json

# Or use the markdown summary for a formatted list
```

### 5. Manual Model Verification
Use the Manual Model Verification Checklist to:
- Visit vendor documentation
- Confirm model availability
- Update the model matrix in Best Practices

## 🔄 Regular Maintenance Schedule

### Weekly
- Quick scan of critical tools (top 50 by usage)
- Check for any urgent deprecation notices

### Monthly (Recommended)
- Full verification of all 317 tools
- Model documentation review
- Update Best Practices pages
- Generate trending report

### Quarterly
- Deep dive on integration changes
- Review and update tool categories
- Benchmark performance metrics

## 🛠️ Customization Options

### Modify Verification Scope
In `verify_tools.py`, adjust:
```python
# Check only specific categories
tools = [t for t in tools if t['category'] in ['Media Intelligence', 'AI']]

# Check only tools with certain tags
tools = [t for t in tools if 'ai' in [tag.lower() for tag in t.get('tags', [])]]
```

### Add Custom Checks
```python
# Add API endpoint checking
def check_api_endpoint(tool):
    api_url = f"https://api.{tool['url']}/v1/status"
    # Custom API verification logic
```

### Export Additional Formats
```python
# Add Excel export
import pandas as pd
df = pd.DataFrame(self.results['tools'])
df.to_excel('verification_results.xlsx', index=False)
```

## 📈 Success Metrics

After running verification:
- **< 5% tools with 404**: Healthy state
- **< 10% requiring manual check**: Good automation
- **0 deprecated models in use**: Fully updated
- **< 2s average response time**: Good performance

## 🚨 Troubleshooting

### Common Issues:

1. **"Module not found: requests"**
   ```bash
   pip install requests
   ```

2. **"Permission denied"**
   ```bash
   chmod +x verify_tools.py
   ```

3. **"Too many requests" errors**
   - Increase rate_limit_delay in CONFIG
   - Reduce max_workers

4. **Memory issues with 317 tools**
   - Process in batches
   - Reduce max_workers to 5

## 📞 Next Steps

1. **Run the verification script**
2. **Review the reports**
3. **Update tool URLs as needed**
4. **Manually verify models**
5. **Update Best Practices documentation**
6. **Schedule next verification**

---

*This guide ensures smooth verification of all 317 tools and model references.*