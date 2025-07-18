# Manual Verification Required - AI Tools

**Generated:** July 18, 2025  
**Total Tools Requiring Manual Check:** 53

## Priority 1: Access Forbidden (403) - Authentication Required

These tools likely require login or have bot protection. Manual browser access recommended:

1. **Ada** (ada.cx) - Customer Service
2. **AnswerThePublic** (answerthepublic.com) - Content Research
3. **BuiltWith** (builtwith.com) - Web Analytics
4. **Canva** (www.canva.com/) - Audio/Video Processing
5. **CB Insights** (www.cbinsights.com) - Finance
6. **Business Wire** (www.businesswire.com) - Media Intelligence
7. **ChatGPT** (chatgpt.com) - AI Assistants
8. **Claude (Anthropic)** (claude.ai) - AI Assistants
9. **Craiyon** (www.craiyon.com) - Audio/Video Processing
10. **DALL-E 2** (openai.com/dall-e-2) - Audio/Video Processing

## Priority 2: Connection Errors - Possible Downtime

These tools couldn't be reached. Check if they've moved or require special access:

### Content Creation Tools (7)
- **Creature** (creature.run)
- **Ghostwriter** (ghostwriter.gitkraken.com)
- **Hyperwrite** (hyperwrite.ai)
- **Peppertype.ai** (peppertype.ai)
- **Surfer SEO** (surferseo.com)
- **Appen** (appen.com)
- **StoryBase** (mystorybase.com)

### Research & Analytics Tools (6)
- **Also Asked** (alsoasked.com)
- **Keyhole** (keyhole.co)
- **Regie.ai** (www.regie.ai)
- **Protrack** (www.protrack.com)
- **SEMrush** (semrush.com)
- **Similarweb** (pro.similarweb.com)

### Media Intelligence Tools (4)
- **ACE MediCom** (acemedicom.com)
- **Critica** (aecritica.com)
- **Commetric** (commetric.com)
- **Muck Rack** (muckrack.com)

### General/Specialized Tools (6)
- **GapScout (Formerly Signal AI)** (signalpharm.ai)
- **HoneyHive.ai** (honeyhive.ai)
- **Imagendry** (imagendry.com)
- **Microsoft Security Copilot** (microsoft.com/security/blog)
- **Oneforma** (oneforma.com)
- **Disney Hyperion Gray** (disneyhyperiongray.com)

## Priority 3: Already Marked as Deprecated (7)

These tools have been marked with [DEPRECATED] in their descriptions:

1. **Copilot Chat (Azure)** - 404 Not Found
2. **EarlyString** - 404 Not Found
3. **Google Public Data Explorer** - 404 Not Found
4. **Lexis+ AI** - 404 Not Found
5. **Rev AI** - 404 Not Found
6. **SimilarWeb** - 404 Not Found
7. **Thomson Reuters CoCounsel** - 404 Not Found

## Verification Steps

### For 403 Forbidden Tools:
1. Open in incognito browser window
2. Check if login page appears
3. Verify if free tier still exists
4. Update pricing_model if changes detected

### For Connection Error Tools:
1. Try alternative URLs (add/remove www, check for new domains)
2. Search for "[Tool Name] + new website" or "shutdown"
3. Check company social media for announcements
4. Look for acquisition news

### Documentation to Update:
- Note any tools that have been acquired/merged
- Update URLs for redirected tools
- Add authentication requirements in tool descriptions
- Update pricing information if changed

## Quick Actions Script

```bash
# Check a specific tool manually
check_tool() {
    echo "Checking $1..."
    curl -I -L --max-time 10 "$1" 2>/dev/null | head -n 1
}

# Example usage:
check_tool "https://ada.cx"
check_tool "https://www.ada.cx"
check_tool "https://app.ada.cx"
```

## Estimated Time
- 403 Errors: ~3 minutes per tool (10 tools = 30 minutes)
- Connection Errors: ~5 minutes per tool (36 tools = 180 minutes)
- Total: ~3.5 hours for complete manual verification