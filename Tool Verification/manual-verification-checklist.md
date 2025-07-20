# Manual Model Verification Checklist
*As of July 18, 2025*

## 🔍 How to Use This Checklist

Since API keys are not available, use this checklist to manually verify model status by visiting vendor documentation pages.

## 📊 Model Verification URLs

### OpenAI Models
**Documentation**: https://platform.openai.com/docs/models

| Model | Expected Status | Verify At | Notes |
|-------|----------------|-----------|-------|
| gpt-4 | ❌ Deprecated | /docs/deprecations | Replaced by GPT-4o |
| gpt-4-32k | ❌ Deprecated | /docs/deprecations | Replaced by GPT-4o Arch |
| gpt-3.5-turbo | ❌ Deprecated | /docs/deprecations | Replaced by o4-mini |
| gpt-4o | ✅ Current | /docs/models | Multimodal model |
| o4-mini | ✅ Current | /docs/models | Low-latency model |
| gpt-4o-arch | ✅ Current | /docs/models | 128K context |

### Anthropic Models
**Documentation**: https://docs.anthropic.com/claude/docs/models

| Model | Expected Status | Verify At | Notes |
|-------|----------------|-----------|-------|
| claude-2 | ❌ Deprecated | /docs/model-deprecations | Replaced by Claude 4 |
| claude-2.1 | ❌ Deprecated | /docs/model-deprecations | Replaced by Claude 4 |
| claude-instant-1.2 | ❌ Deprecated | /docs/model-deprecations | Replaced by Claude 4 |
| claude-4-sonnet | ✅ Current | /docs/models | Creative tasks |
| claude-4-opus | ✅ Current | /docs/models | Complex reasoning |

### Google Models
**Documentation**: https://ai.google.dev/models

| Model | Expected Status | Verify At | Notes |
|-------|----------------|-----------|-------|
| palm-2 | ❌ Deprecated | /gemini-api/docs | Replaced by Gemini |
| gemini-pro | ⚠️ Check Version | /models/gemini | May have updates |
| gemini-1.5-pro | ✅ Current | /models/gemini | 1M token context |
| gemini-ultra | ✅ Current | /models/gemini | Most capable |

### Other Models
| Model | Vendor | Documentation URL | Expected Status |
|-------|--------|-------------------|-----------------|
| llama-2 | Meta | https://llama.meta.com | ⚠️ Check for Llama 3 |
| llama-3.1 | Meta | https://llama.meta.com | ✅ Current |
| mistral-7b | Mistral | https://mistral.ai | ⚠️ Check versions |
| cohere-command | Cohere | https://cohere.com/models | ⚠️ Check versions |

## 📝 Verification Steps

### For Each Model:
1. **Visit the vendor documentation page**
2. **Check the models list** for current offerings
3. **Look for deprecation notices** or sunset dates
4. **Note any new models** not in our list
5. **Verify context window sizes** and capabilities
6. **Check pricing changes** if applicable

### Record Findings:
```markdown
## Model: [Model Name]
- **Status**: [Current/Deprecated/Updated]
- **Verified Date**: [Today's date]
- **Source URL**: [Documentation URL]
- **Notes**: [Any important changes or updates]
- **Replacement** (if deprecated): [New model name]
```

## 🚨 Common Deprecation Patterns

### Signs a Model is Deprecated:
- Listed in "Legacy Models" section
- Has a sunset date announced
- No longer appears in main models list
- Documentation moved to archive section
- Pricing no longer displayed
- "Use [newer model] instead" notices

### Signs a Model is Current:
- Featured in main documentation
- Active pricing information
- Recent update announcements
- Included in quickstart guides
- Active in playground/console

## 📋 Best Practices Page Updates Needed

Based on your verification, update these sections:

### 1. Model Comparison Table
Location: `Section 2: Choosing the Right LLM`
- Update model names
- Verify context windows
- Update latency estimates
- Confirm pricing

### 2. Migration Guides
Location: `Section 2: Migration Notes`
- Add migration paths for newly deprecated models
- Update parameter changes
- Note breaking changes

### 3. Code Examples
Search for model names in:
- Prompt templates
- API examples
- Integration guides
- Tutorial code

### 4. Tool Descriptions
Search `unified-tools-data.js` for:
- Model names in `feature_breakdown`
- Model names in `use_cases_in_pr`
- Model names in `case_studies`

## 🔄 Verification Tracking

| Category | Total | Verified | Updated | Deprecated |
|----------|-------|----------|---------|------------|
| OpenAI Models | | | | |
| Anthropic Models | | | | |
| Google Models | | | | |
| Other Models | | | | |
| **Totals** | | | | |

## 📅 Next Verification Date

Schedule next manual verification for: **August 18, 2025**

---

*Use this checklist alongside the automated tool verification script for comprehensive updates.*