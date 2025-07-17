# Claude Code Implementation Commands

## Quick Start Commands for GitHub Codespace

### 1. Create Directory Structure
```bash
# Create the necessary directories
mkdir -p js/components/best-practices/learning-paths
mkdir -p js/components/best-practices/tips
```

### 2. Create Learning Path Pages
Use these commands to create the learning path pages based on the existing template:

```bash
# Copy template and create AI Fundamentals page
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/learning-paths/ai-fundamentals.html

# Copy template and create Advanced Techniques page
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/learning-paths/advanced-techniques.html

# Copy template and create Industry Specialization page
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/learning-paths/industry-specialization.html
```

### 3. Create Featured Guide Pages
```bash
# Create Multi-Tool Workflows
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/guides/multi-tool-workflows.html

# Create Choosing the Right AI Tool
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/guides/choosing-right-ai-tool.html

# Create Custom Model Fine-Tuning
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/guides/custom-model-fine-tuning.html

# Create AI for Content Creation
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/guides/ai-content-creation.html

# Create Avoiding Common AI Pitfalls
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/guides/avoiding-ai-pitfalls.html
```

### 4. Create Tips Pages
```bash
# Create Context Windows Matter
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/tips/context-windows-matter.html

# Create Power of Examples
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/tips/power-of-examples.html

# Create Role-Based Prompting
cp js/components/best-practices/guides/prompt-engineering-basics.html js/components/best-practices/tips/role-based-prompting.html
```

### 5. Update guides.json
Add this to your `guides.json` file:

```json
{
  "categories": [
    // ... existing categories ...
  ],
  "guides": [
    // ... existing guides ...
    {
      "id": "multi-tool-workflows",
      "title": "Multi-Tool Workflows",
      "slug": "multi-tool-workflows",
      "category": "advanced",
      "difficulty": "intermediate",
      "readTime": 15,
      "excerpt": "Combine multiple AI tools to create powerful automated workflows that save hours",
      "tags": ["workflow", "automation", "integration"],
      "featured": true
    },
    {
      "id": "choosing-right-ai-tool",
      "title": "Choosing the Right AI Tool",
      "slug": "choosing-right-ai-tool",
      "category": "fundamentals",
      "difficulty": "beginner",
      "readTime": 12,
      "excerpt": "A practical framework for selecting the perfect AI tool for any task or project",
      "tags": ["tools", "decision-making", "comparison"],
      "featured": true
    },
    {
      "id": "custom-model-fine-tuning",
      "title": "Custom Model Fine-Tuning",
      "slug": "custom-model-fine-tuning",
      "category": "advanced",
      "difficulty": "advanced",
      "readTime": 20,
      "excerpt": "Step-by-step guide to training AI models on your specific data and use cases",
      "tags": ["fine-tuning", "customization", "advanced"],
      "featured": true
    },
    {
      "id": "ai-content-creation",
      "title": "AI for Content Creation",
      "slug": "ai-content-creation",
      "category": "industry",
      "difficulty": "intermediate",
      "readTime": 15,
      "excerpt": "Master techniques for generating high-quality content that maintains your brand voice",
      "tags": ["content", "writing", "creativity"],
      "featured": true
    },
    {
      "id": "avoiding-ai-pitfalls",
      "title": "Avoiding Common AI Pitfalls",
      "slug": "avoiding-ai-pitfalls",
      "category": "fundamentals",
      "difficulty": "beginner",
      "readTime": 10,
      "excerpt": "Learn from others' mistakes with this guide to the most common AI tool failures",
      "tags": ["mistakes", "debugging", "best-practices"],
      "featured": true
    }
  ],
  "tips": [
    {
      "id": "context-windows-matter",
      "title": "Context Windows Matter",
      "description": "Did you know? You can dramatically improve response quality by structuring your prompts to fit within optimal context windows.",
      "buttonText": "Try This Technique",
      "category": "optimization"
    },
    {
      "id": "power-of-examples",
      "title": "The Power of Examples",
      "description": "Few-shot learning can transform your results. Always provide 2-3 examples of what you want.",
      "buttonText": "Learn More",
      "category": "prompting"
    },
    {
      "id": "role-based-prompting",
      "title": "Role-Based Prompting",
      "description": "Assign a specific role to the AI for more focused and expert responses.",
      "buttonText": "See Examples",
      "category": "prompting"
    }
  ],
  "learningPaths": [
    {
      "id": "ai-fundamentals",
      "guides": ["prompt-engineering-basics", "choosing-right-ai-tool", "avoiding-ai-pitfalls"]
    },
    {
      "id": "advanced-techniques",
      "guides": ["multi-tool-workflows", "custom-model-fine-tuning"]
    },
    {
      "id": "industry-specialization",
      "guides": ["ai-content-creation"]
    }
  ]
}
```

### 6. Update index.html Navigation
Add this JavaScript to make the cards clickable:

```javascript
// Add to the existing script section or create new one
document.addEventListener('DOMContentLoaded', function() {
    // Learning Path Cards
    const pathCards = document.querySelectorAll('.bp-path-card');
    pathCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const title = this.querySelector('.bp-path-title').textContent;
            const path = title.toLowerCase().replace(/ /g, '-');
            window.location.href = `learning-paths/${path}.html`;
        });
    });

    // Hidden Gems Cards - Add data attributes first
    const tipsCards = document.querySelectorAll('.bp-tips-card');
    const tipIds = ['context-windows-matter', 'power-of-examples', 'role-based-prompting'];
    
    tipsCards.forEach((card, index) => {
        card.dataset.tipId = tipIds[index];
        const button = card.querySelector('.bp-tips-button');
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const tipId = this.closest('.bp-tips-card').dataset.tipId;
            window.location.href = `tips/${tipId}.html`;
        });
    });
});
```

### 7. Sample Content Update for One Page
Here's an example of how to update one of the copied files (use this pattern for all):

**For `multi-tool-workflows.html`:**
```html
<!-- Update the title -->
<title>Multi-Tool Workflows - AI Best Practices</title>

<!-- Update the main heading -->
<h1>Master Multi-Tool AI Workflows</h1>
<p class="guide-summary">Combine multiple AI tools to create powerful automated workflows that save hours of manual work</p>

<!-- Update the sidebar navigation -->
<ul>
    <li><a href="#workflow-basics">Workflow Basics</a></li>
    <li><a href="#tool-selection">Tool Selection</a></li>
    <li><a href="#data-handoff">Data Handoff</a></li>
    <li><a href="#automation">Automation Strategies</a></li>
    <li><a href="#examples">Real-World Examples</a></li>
</ul>

<!-- Update content sections -->
<h2 id="workflow-basics">Understanding Multi-Tool Workflows</h2>
<p>When a single AI tool isn't enough, combining multiple tools can unlock incredible productivity gains...</p>
```

## Quick Implementation Checklist

1. **Run directory creation commands** ✓
2. **Copy template files to all locations** ✓  
3. **Update guides.json with new entries** ✓
4. **Add JavaScript navigation to index.html** ✓
5. **Update content in each new file** (iterative)
6. **Test all navigation links** 
7. **Commit and push changes**

## Claude Code Helper Commands

When editing files with Claude Code, use these prompts:

```bash
# To update a specific guide page
"Update the multi-tool-workflows.html file with content about combining AI tools for automation. Include sections on workflow basics, tool selection, data handoff between tools, and real-world examples."

# To update the learning path page
"Update the ai-fundamentals.html file to be a learning path overview page that lists and links to all fundamental guides, shows progress tracking, and includes a recommended learning sequence."

# To update the tips page
"Update the context-windows-matter.html file with focused content about context window optimization, including interactive examples and a try-it-yourself section."
```

## Testing Commands

```bash
# Start local server to test
python -m http.server 8000
# or
npx http-server

# Then navigate to:
# http://localhost:8000/js/components/best-practices/
```