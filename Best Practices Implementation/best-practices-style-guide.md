# Best Practices Hub Style Guide

## 🎨 Visual Design System

### Color Palette

#### Primary Colors
```css
--primary-blue: #4a9eff;      /* Main CTAs, links, highlights */
--primary-dark: #0a1628;      /* Dark backgrounds */
--secondary-blue: #00d4ff;    /* Accents, hover states */
--text-light: #e0e0e0;        /* Primary text */
--text-muted: #b0b0b0;        /* Secondary text */
```

#### Background Colors
```css
--bg-primary: #0a1628;        /* Main background */
--bg-card: #1a2440;           /* Card backgrounds */
--bg-card-hover: #243b6b;     /* Card hover state */
--bg-dark: #0f1829;           /* Darker sections */
--bg-gradient: linear-gradient(135deg, #1a2f5a 0%, #243b6b 100%);
```

#### Status Colors
```css
--success: #00d084;           /* Completed, success */
--warning: #ff9800;           /* Warnings, medium priority */
--error: #ff4444;             /* Errors, critical issues */
--info: #4a9eff;              /* Information, tips */
--gold: #ffd700;              /* Premium, special features */
```

### Typography

#### Font Stack
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'Monaco', 'Consolas', 'Courier New', monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;     /* 12px - Small labels */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Emphasized text */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 2rem;       /* 32px - Page headings */
--text-4xl: 2.5rem;     /* 40px - Hero headings */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
```

#### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Readable content */
```

### Spacing System

#### Base Unit: 0.25rem (4px)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Component Patterns

#### Cards
```css
.card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: var(--space-6);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(74, 158, 255, 0.2);
}
```

#### Buttons
```css
.btn-primary {
    background: var(--primary-blue);
    color: var(--primary-dark);
    padding: var(--space-3) var(--space-6);
    border-radius: 8px;
    font-weight: var(--font-bold);
}

.btn-secondary {
    background: transparent;
    border: 2px solid var(--primary-blue);
    color: var(--primary-blue);
}
```

## ✍️ Content Guidelines

### Voice & Tone

#### Brand Voice Attributes
- **Expert but Approachable**: We know our stuff but explain it simply
- **Encouraging**: Focus on possibilities, not problems
- **Practical**: Always actionable, never just theoretical
- **Human**: Conversational, not robotic

#### Tone Variations by Content Type
- **Learning Paths**: Supportive teacher
- **Guides**: Knowledgeable colleague
- **Pro Tips**: Excited friend sharing secrets
- **Error States**: Helpful assistant

### Writing Principles

#### 1. Clarity First
- Short sentences (15-20 words average)
- One idea per paragraph
- Active voice preferred
- Jargon explained on first use

#### 2. Scannable Structure
- Descriptive headings
- Bullet points for lists
- Bold key concepts
- Visual breaks every 3-4 paragraphs

#### 3. Progressive Disclosure
- Start with the "what"
- Then explain the "why"
- Finally show the "how"
- End with "what's next"

### Content Patterns

#### Guide Introduction Template
```markdown
"[Hook: Problem or opportunity]. [Context: Why this matters]. [Promise: What you'll learn]."

Example:
"Stop wasting hours on repetitive tasks. AI automation can handle 80% of your routine work, freeing you for strategic thinking. Learn the 5-step process to automate any workflow."
```

#### Section Headers
- **Question Format**: "How Do I Choose the Right AI Tool?"
- **Benefit Format**: "Save 10 Hours Per Week with Automation"
- **Action Format**: "Building Your First Workflow"

#### Call-to-Action Patterns
- **Learning Path**: "Start Your Journey →"
- **Guide**: "Try This Technique"
- **Pro Tip**: "See It In Action"
- **Navigation**: "Next: [Topic] →"

### Emoji Usage Guidelines

#### When to Use Emojis
- Section headers (sparingly)
- Stat highlights
- Pro tips and warnings
- Visual categorization

#### Standard Emoji Mappings
```
🎯 Goals, objectives, targets
💡 Tips, ideas, insights
🚀 Getting started, launching
📊 Data, analytics, metrics
⚡ Quick tips, shortcuts
🔧 Tools, configuration
📚 Learning, education
⏱️ Time-related content
💰 Cost, pricing, ROI
✅ Success, completion
⚠️ Warnings, cautions
🎨 Creative, design
🤖 AI/automation specific
```

## 🏗️ Page Structure Standards

### Page Hierarchy

#### 1. Hub Pages (Overview)
```
Header
├── Hero Section
├── Feature Grid (3 columns)
├── Content Sections (2-3)
├── CTA Section
└── Footer Navigation
```

#### 2. Learning Path Pages
```
Header
├── Path Overview (stats, description)
├── Prerequisites
├── Learning Objectives
├── Curriculum Modules
├── Resources
├── Certification Info
└── Next Steps
```

#### 3. Guide Pages
```
Header
├── Meta Information
├── Introduction
├── Table of Contents (sidebar)
├── Main Content Sections
├── Interactive Elements
├── Related Resources
└── Navigation
```

#### 4. Pro Tip Pages
```
Header
├── Tip Summary
├── Impact Stats
├── Main Explanation
├── Interactive Demo
├── Examples/Templates
├── Related Resources
└── Navigation
```

### Component Usage

#### When to Use Each Component

**Cards**
- Feature highlights
- Learning modules
- Tool comparisons
- Case studies

**Tables**
- Direct comparisons
- Specifications
- Pricing information
- Feature matrices

**Code Blocks**
- Prompts examples
- API usage
- Configuration
- Templates

**Interactive Elements**
- Calculators for ROI/metrics
- Builders for prompts/workflows
- Selectors for options
- Live demos

## 📐 Layout Guidelines

### Grid System
- **Desktop**: 12-column grid
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid

### Breakpoints
```css
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1440px;
```

### Container Widths
```css
--container-sm: 640px;   /* Text-heavy content */
--container-md: 960px;   /* Mixed content */
--container-lg: 1200px;  /* Full layouts */
```

### Responsive Patterns

#### Desktop → Mobile
1. **Multi-column → Single column**
2. **Side navigation → Top navigation**
3. **Hover states → Tap states**
4. **Dense → Spacious**

## 🎯 Interaction Patterns

### Hover States
- Cards: Lift + shadow
- Buttons: Brightness + scale
- Links: Underline + color
- Images: Zoom + overlay

### Click Feedback
- Buttons: Scale down briefly
- Cards: Quick pulse
- Toggles: Smooth transition
- Tabs: Slide indicator

### Loading States
- Skeleton screens for content
- Spinners for actions
- Progress bars for processes
- Shimmer for placeholders

### Error Handling
- Inline validation messages
- Toast notifications for actions
- Empty states with actions
- 404 pages with suggestions

## 📋 Content Checklist

### Before Publishing Any Page

#### Content Quality
- [ ] Spell check completed
- [ ] Grammar verified
- [ ] Facts verified
- [ ] Links tested
- [ ] Images optimized
- [ ] Alt text added

#### Brand Consistency
- [ ] Voice guidelines followed
- [ ] Visual style matches
- [ ] Emoji use appropriate
- [ ] Terminology consistent

#### User Experience
- [ ] Scannable structure
- [ ] Clear CTAs
- [ ] Navigation logical
- [ ] Mobile-friendly
- [ ] Load time acceptable

#### Technical
- [ ] SEO metadata added
- [ ] Analytics tagged
- [ ] Schema markup (if applicable)
- [ ] Social sharing setup

## 🔄 Maintenance Guidelines

### Regular Reviews
- **Weekly**: Check for broken links
- **Monthly**: Update statistics/data
- **Quarterly**: Content accuracy review
- **Yearly**: Full design refresh consideration

### Version Control
- Document all major changes
- Keep style guide updated
- Archive old versions
- Track performance metrics

### Team Collaboration
- Style guide accessible to all
- Regular training sessions
- Feedback loops established
- Contribution guidelines clear

## 📚 Resources & Tools

### Design Tools
- **Figma**: Component library
- **ColorBox**: Palette generation
- **Contrast Checker**: WCAG compliance

### Content Tools
- **Grammarly**: Grammar checking
- **Hemingway**: Readability
- **CoSchedule**: Headline analysis

### Development Tools
- **Chrome DevTools**: Testing
- **WAVE**: Accessibility
- **PageSpeed Insights**: Performance

## 🎉 Examples of Excellence

### Best-in-Class Pages
1. **Prompt Engineering Basics**: Clear progression, interactive elements
2. **Multi-Tool Workflows**: Visual workflow, practical examples
3. **AI Fundamentals Path**: Comprehensive yet approachable

### What Makes Them Great
- Clear value proposition
- Engaging interactivity
- Practical takeaways
- Smooth user journey
- Consistent experience

---

*This style guide is a living document. Update it as the Best Practices Hub evolves.*