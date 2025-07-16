# Claude Code Prompt: Fix Enterprise Report Architecture

## Fundamental Architecture Problem

The AI Tools Portfolio (all 317 tools) is currently in the RIGHT PANEL. This is completely wrong - the tools ARE the main content and should be in the CENTER of the page.

## Current (WRONG) Architecture:
```
┌─────────────────────────┬────────────────┐
│   Executive Summary     │  Tools List    │
│   (Taking up center)    │  (In sidebar)  │
│                         │  - Tool 1      │
│   Empty space           │  - Tool 2      │
│                         │  - Load More   │
└─────────────────────────┴────────────────┘
```

## Correct Architecture:
```
┌─────────────────────────────────────────┐
│         Executive Summary Cards          │
├────────┬─────────────────────┬──────────┤
│Filters │   TOOLS PORTFOLIO   │  Details │
│        │   (Main Content)    │  Panel   │
│        │   ┌────┐ ┌────┐    │          │
│        │   │Tool│ │Tool│    │ Selected │
│        │   │ 1  │ │ 2  │    │  Tool    │
│        │   └────┘ └────┘    │  Info    │
│        │   ┌────┐ ┌────┐    │          │
│        │   │Tool│ │Tool│    │          │
│        │   │ 3  │ │ 4  │    │          │
│        │   └────┘ └────┘    │          │
│        │   ... 317 tools    │          │
└────────┴─────────────────────┴──────────┘
```

## Required Changes

### 1. Move Tools Portfolio to Center
```javascript
// REMOVE tools from right panel
// ADD tools to main content area

<div className="main-container">
  {/* Executive Summary stays at top */}
  <div className="executive-summary">
    {/* Current cards are fine */}
  </div>
  
  {/* Main Content Area - THIS IS WHERE TOOLS SHOULD BE */}
  <div className="content-area">
    <aside className="filters-sidebar">
      {/* Filters here */}
    </aside>
    
    {/* TOOLS PORTFOLIO GOES HERE */}
    <main className="tools-portfolio">
      <div className="portfolio-header">
        <h2>AI Tools Portfolio</h2>
        <div className="portfolio-controls">
          <span>Showing {filteredTools.length} of 317 tools</span>
          <div className="view-toggle">
            <button className={view === 'grid' ? 'active' : ''}>Grid</button>
            <button className={view === 'list' ? 'active' : ''}>List</button>
          </div>
        </div>
      </div>
      
      {/* The actual tools grid/list */}
      <div className={`tools-${view}`}>
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onClick={() => setSelectedTool(tool)} />
        ))}
      </div>
      
      {/* Pagination or infinite scroll */}
      {filteredTools.length < totalTools && (
        <button className="load-more">Load More Tools</button>
      )}
    </main>
    
    {/* Details panel - only shows when tool selected */}
    <aside className="details-panel">
      {selectedTool ? (
        <ToolDetails tool={selectedTool} />
      ) : (
        <div className="empty-state">
          <p>Select a tool to view details</p>
        </div>
      )}
    </aside>
  </div>
</div>
```

### 2. Remove Strategic Roadmap from Main View
The Strategic Roadmap is taking up valuable space. Either:
- Move it below the tools grid
- Make it a collapsible section
- Move it to a separate tab

### 3. CSS Grid Layout
```css
.content-area {
  display: grid;
  grid-template-columns: 250px 1fr 350px;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 300px); /* Account for header and summary */
}

.tools-portfolio {
  overflow-y: auto;
  padding: 20px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Tool cards should be clickable and informative */
.tool-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.tool-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.tool-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.tool-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}
```

### 4. Simplified Filters (Left Sidebar)
```javascript
<aside className="filters-sidebar">
  <h3>Filters</h3>
  
  <div className="filter-group">
    <label>Impact Score</label>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={filters.impactRange}
      onChange={updateFilters}
    />
  </div>
  
  <div className="filter-group">
    <label>Complexity</label>
    {[1,2,3,4,5].map(level => (
      <label key={level}>
        <input type="checkbox" value={level} />
        <span>{level} - {getComplexityLabel(level)}</span>
      </label>
    ))}
  </div>
  
  <div className="filter-group">
    <label>Categories</label>
    <select multiple size="5">
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>
  
  <button onClick={resetFilters}>Reset Filters</button>
</aside>
```

## Implementation Steps

1. **Move the tools from right panel to center main content**
2. **Create proper 3-column layout: Filters | Tools | Details**
3. **Ensure all 317 tools are accessible (pagination or virtual scroll)**
4. **Make tool cards informative and clickable**
5. **Right panel should ONLY show details when a tool is selected**

## Success Criteria
- [ ] Tools portfolio is the MAIN CONTENT in the center
- [ ] Can browse all 317 tools without clicking "Load More" repeatedly
- [ ] Filters are easily accessible on the left
- [ ] Details panel updates when clicking a tool
- [ ] Page is scannable and tool-focused

The page is called "Enterprise Report" but should really be an "AI Tools Browser" - make the tools the star of the show!