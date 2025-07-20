# Best Practices for AI/LLM Implementation
*Version 2.0 - As of July 18, 2025*

---

## 1. Introduction & Scope

### What This Guide Covers
- **LLM Selection**: Choosing the right model for your use case
- **Prompt Design**: Engineering effective prompts for optimal results
- **Tool Orchestration**: Integrating multiple AI tools effectively
- **Evaluation**: Measuring and improving AI system performance

### Version Information
- **Last Updated**: July 18, 2025
- **Major Changes**: New GPT-4o models, Claude 4 family, deprecated models removed
- **Next Review**: August 18, 2025

---

## 2. Choosing the Right LLM

### Updated Model Matrix (July 2025)

| Model           | Latency  | Context Window | Best For                         | Cost/1M Tokens |
|-----------------|----------|----------------|----------------------------------|----------------|
| ChatGPT o4-mini | ~50 ms   | 32K tokens     | Low-latency assistants          | $0.15/$0.60    |
| GPT-4o Arch     | ~150 ms  | 128K tokens    | Multimodal, large contexts      | $5.00/$15.00   |
| Claude 4 Sonnet | ~80 ms   | 100K tokens    | Creative generation             | $3.00/$15.00   |
| Claude 4 Opus   | ~120 ms  | 200K tokens    | Complex reasoning, summarization | $15.00/$75.00  |
| Gemini 1.5 Pro  | ~100 ms  | 1M tokens      | Ultra-long context processing   | $3.50/$10.50   |
| Llama 3.1 405B  | ~200 ms  | 128K tokens    | Open-source, self-hosted        | Self-hosted    |

### Migration Notes

#### Migrating from GPT-4 → o4-mini
- **Prompt Adjustments**: Reduce instruction complexity for better speed
- **Temperature**: Lower by 0.1-0.2 for similar creativity
- **New Parameters**: Enable `stream_v2` for improved streaming

#### Migrating from Claude 2 → Claude 4
- **Context Handling**: Leverage expanded windows (100K-200K)
- **System Prompts**: More nuanced instruction following
- **Output Formatting**: Better structured data generation

---

## 3. Tooling & Orchestration

### Dynamic Tool Integration

#### Loading Tools Programmatically
```javascript
import { loadTools } from './tools-v2025-07-18.json';

const tools = await loadTools({
  categories: ['search', 'analysis', 'generation'],
  minVersion: '2.0',
  verified: true
});
```

### Tool Version Migration Guide

#### searchEngine v1 → v2
**Breaking Changes**:
- Authentication now required
- Response schema updated
- Rate limits changed

**Migration Steps**:
```python
# Old (v1)
results = searchEngine.query(q="AI trends")

# New (v2)
results = searchEngine.search(
    query="AI trends",
    auth_token=TOKEN,
    max_results=10
)
```

### Auto-Generated Clients
Generate type-safe clients from OpenAPI specs:
```bash
openapi-generator-cli generate \
  -i https://api.tool.com/v2/spec.json \
  -g typescript-axios \
  -o ./src/clients/tool-v2
```

---

## 4. Prompt Engineering Patterns

### Updated Pattern Library

#### Pattern: Chain-of-Thought 2.0
*Optimized for new model architectures*

```yaml
pattern_id: cot_v2
models: [gpt-4o, claude-4-opus]
template: |
  <task>{task_description}</task>
  
  Think through this step-by-step:
  1. Understand the requirements
  2. Break down the problem
  3. Consider edge cases
  4. Provide solution
  
  <format>structured_json</format>
```

#### Pattern: Multi-Modal Analysis
*New for GPT-4o Arch*

```yaml
pattern_id: multimodal_v1
models: [gpt-4o-arch]
template: |
  Analyze the provided {media_type}:
  - Visual elements: {visual_prompts}
  - Context: {context}
  - Output format: {format}
```

### Deprecated Patterns
- ❌ `few_shot_v1`: Replace with `dynamic_examples_v2`
- ❌ `simple_cot`: Use `cot_v2` for all models
- ❌ `gpt4_specific`: Generalize for model families

---

## 5. Evaluation & Monitoring

### New Metrics for 2025

#### Latent Embedding Drift (LED)
*Critical for o4-mini deployments*

```python
def calculate_led(embeddings_t0, embeddings_t1):
    """Monitor semantic drift in model outputs"""
    return cosine_distance(
        embeddings_t0.mean(axis=0),
        embeddings_t1.mean(axis=0)
    )

# Alert if LED > 0.15
```

#### Context Utilization Efficiency
```python
def context_efficiency(tokens_used, context_window):
    """Measure how effectively context is used"""
    return {
        'utilization': tokens_used / context_window,
        'optimal_range': (0.6, 0.85),
        'warning_threshold': 0.95
    }
```

### Automated Freshness Pipeline
Link: `https://github.com/your-org/ai-freshness-checker`

---

## 6. Maintenance Workflow

### 📅 Scheduled Audits
**Frequency**: Monthly (1st Monday)
**Scope**: 
- Model availability check
- Tool API compatibility
- Performance benchmarks
- Cost analysis

### 🔔 CI/CD Integration

#### GitHub Action: Model Mention Scanner
```yaml
name: Check Model References
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Scan for outdated models
        run: |
          python scripts/scan_models.py
          if [ $? -ne 0 ]; then
            echo "::warning::Outdated model references found"
          fi
```

### 🗒️ Documentation Versioning
- **Format**: `best-practices-YYYY-MM-DD.html`
- **Retention**: 12 months
- **Changelog**: Auto-generated from git commits

---

## 7. Appendices

### A. Complete Model Changelog

#### Added (July 2025)
- ✅ ChatGPT o4-mini
- ✅ GPT-4o Arch  
- ✅ Claude 4 Sonnet
- ✅ Claude 4 Opus
- ✅ Gemini 1.5 Pro
- ✅ Llama 3.1 405B

#### Deprecated (July 2025)
- ❌ GPT-4 (all variants)
- ❌ Claude 2 (all variants)
- ❌ PaLM 2
- ❌ GPT-3.5-turbo-0301

### B. Verification Script Template

```bash
#!/bin/bash
# verify-models.sh

MODELS=(
  "gpt-o4-mini-2025-07"
  "gpt-4o-arch-2025-07"
  "claude-4-sonnet-20250514"
  "claude-4-opus-20250514"
)

for model in "${MODELS[@]}"; do
  echo "Checking $model..."
  curl -s "https://api.provider.com/v1/models/$model" \
    -H "Authorization: Bearer $API_KEY" | \
    jq '.status'
done
```

### C. Vendor Resources
- **OpenAI**: https://platform.openai.com/docs/models
- **Anthropic**: https://docs.anthropic.com/claude/docs/models
- **Google**: https://ai.google.dev/models
- **Meta**: https://llama.meta.com/docs

---

## Next Steps

1. **Immediate Actions**:
   - Update all production code to use new model names
   - Migrate deprecated tool integrations
   - Review and update prompt templates

2. **Within 1 Week**:
   - Complete performance benchmarking
   - Update cost projections
   - Train team on new features

3. **Within 1 Month**:
   - Full migration to v2 tools
   - Implement LED monitoring
   - Publish migration success metrics

---

*This document is automatically updated by our AI Freshness Pipeline. Last bot update: {{auto_timestamp}}*