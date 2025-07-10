# Executive View Components Specification

## Overview
The Executive View focuses on business impact, ROI, and strategic value. With 317 tools and rich data, we need to present information that drives decision-making.

## Component Architecture

### 1. Executive Tool Card
```javascript
class ExecutiveToolCard extends Component {
  render() {
    const { tool } = this.props;
    const impactClass = this.getImpactClass(tool.business_impact_score);
    const roiEstimate = this.calculateROI(tool);
    
    return (
      <div className={`executive-card ${impactClass}`}>
        {/* Header Section */}
        <div className="card-header">
          <h3>{tool.tool_name}</h3>
          <span className="category-badge">{tool.category}</span>
        </div>
        
        {/* Impact Visualization */}
        <div className="impact-section">
          <CircularProgress 
            value={tool.business_impact_score}
            size={120}
            strokeWidth={8}
            color={this.getImpactColor(tool.business_impact_score)}
          >
            <div className="impact-score">
              <span className="score">{tool.business_impact_score}</span>
              <span className="label">Impact</span>
            </div>
          </CircularProgress>
        </div>
        
        {/* Key Metrics */}
        <div className="metrics-grid">
          <MetricItem
            icon="clock"
            label="Time to Value"
            value={this.estimateTimeToValue(tool)}
          />
          <MetricItem
            icon="dollar"
            label="Est. Annual ROI"
            value={roiEstimate}
            highlight={roiEstimate > 200}
          />
          <MetricItem
            icon="gauge"
            label="Complexity"
            value={`${tool.complexity_score}/5`}
            color={this.getComplexityColor(tool.complexity_score)}
          />
          <MetricItem
            icon="shield"
            label="Risk Level"
            value={this.assessRisk(tool)}
            color={this.getRiskColor(tool)}
          />
        </div>
        
        {/* Business Value Summary */}
        <div className="value-summary">
          <p className="description">{this.extractBusinessValue(tool.description)}</p>
          {this.renderTopFeatures(tool.feature_breakdown)}
        </div>
        
        {/* Quick Actions */}
        <div className="card-actions">
          <button className="btn-primary">View Details</button>
          <button className="btn-secondary">Compare</button>
          <button className="btn-ghost">Add to Portfolio</button>
        </div>
      </div>
    );
  }
}
```

### 2. Business Impact Gauge Component
```javascript
class BusinessImpactGauge extends Component {
  render() {
    const { score, size = 'medium' } = this.props;
    
    return (
      <div className={`impact-gauge ${size}`}>
        <svg viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={this.getGradientId()}
            strokeWidth="10"
            strokeDasharray={`${this.calculateArcLength(score)} 251.2`}
            className="animated-arc"
          />
          
          {/* Score display */}
          <text x="100" y="90" textAnchor="middle" className="score-text">
            <tspan className="score-value">{score}</tspan>
            <tspan x="100" dy="20" className="score-label">Business Impact</tspan>
          </text>
        </svg>
        
        {/* Impact level indicator */}
        <div className="impact-level">
          {this.getImpactLevel(score)}
        </div>
      </div>
    );
  }
}
```

### 3. ROI Calculator Component
```javascript
class ROICalculator extends Component {
  calculateROI(tool) {
    const { pricing_model, business_impact_score } = tool;
    
    // Parse pricing to get annual cost
    const annualCost = this.parseAnnualCost(pricing_model);
    
    // Estimate savings based on impact score and category
    const categoryMultiplier = this.getCategoryMultiplier(tool.category);
    const baseSavings = business_impact_score * 1000 * categoryMultiplier;
    
    // Factor in implementation complexity
    const complexityFactor = 1 - (tool.complexity_score - 1) * 0.15;
    const adjustedSavings = baseSavings * complexityFactor;
    
    // Calculate ROI percentage
    const roi = ((adjustedSavings - annualCost) / annualCost) * 100;
    
    return {
      annualCost,
      estimatedSavings: adjustedSavings,
      roiPercentage: Math.round(roi),
      paybackPeriod: this.calculatePaybackPeriod(annualCost, adjustedSavings)
    };
  }
  
  render() {
    const { tool } = this.props;
    const roi = this.calculateROI(tool);
    
    return (
      <div className="roi-calculator">
        <div className="roi-metrics">
          <div className="metric">
            <span className="label">Annual Cost</span>
            <span className="value">${roi.annualCost.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="label">Est. Annual Savings</span>
            <span className="value highlight">${roi.estimatedSavings.toLocaleString()}</span>
          </div>
          <div className="metric featured">
            <span className="label">ROI</span>
            <span className="value">{roi.roiPercentage}%</span>
          </div>
          <div className="metric">
            <span className="label">Payback Period</span>
            <span className="value">{roi.paybackPeriod}</span>
          </div>
        </div>
      </div>
    );
  }
}
```

### 4. Executive Summary Panel
```javascript
class ExecutiveSummaryPanel extends Component {
  render() {
    const { tools } = this.props;
    const metrics = this.calculateExecutiveMetrics(tools);
    
    return (
      <div className="executive-summary-panel">
        <h2>Executive Dashboard</h2>
        
        {/* Key Metrics */}
        <div className="summary-metrics">
          <SummaryCard
            title="Portfolio Value"
            value={`$${metrics.totalValue}M`}
            trend={metrics.valueTrend}
            icon="trending-up"
          />
          <SummaryCard
            title="Avg. ROI"
            value={`${metrics.avgROI}%`}
            subtitle="Across all tools"
            icon="percent"
          />
          <SummaryCard
            title="Quick Wins"
            value={metrics.quickWins}
            subtitle="High impact, low complexity"
            icon="zap"
          />
          <SummaryCard
            title="Strategic Tools"
            value={metrics.strategic}
            subtitle="Transform operations"
            icon="rocket"
          />
        </div>
        
        {/* Top Opportunities */}
        <div className="opportunities-section">
          <h3>Top Opportunities</h3>
          <OpportunitiesList 
            opportunities={this.identifyTopOpportunities(tools)}
            onSelect={this.handleOpportunitySelect}
          />
        </div>
        
        {/* Risk Assessment */}
        <div className="risk-section">
          <h3>Risk Overview</h3>
          <RiskMatrix 
            tools={tools}
            onQuadrantClick={this.handleRiskQuadrantClick}
          />
        </div>
      </div>
    );
  }
}
```

### 5. Comparison Matrix Component
```javascript
class ComparisonMatrix extends Component {
  render() {
    const { selectedTools } = this.props;
    
    return (
      <div className="comparison-matrix">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Criteria</th>
              {selectedTools.map(tool => (
                <th key={tool.id}>{tool.tool_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Business Impact */}
            <tr>
              <td>Business Impact</td>
              {selectedTools.map(tool => (
                <td key={tool.id}>
                  <ScoreCell score={tool.business_impact_score} />
                </td>
              ))}
            </tr>
            
            {/* Complexity */}
            <tr>
              <td>Implementation Complexity</td>
              {selectedTools.map(tool => (
                <td key={tool.id}>
                  <ComplexityIndicator level={tool.complexity_score} />
                </td>
              ))}
            </tr>
            
            {/* Pricing */}
            <tr>
              <td>Pricing Model</td>
              {selectedTools.map(tool => (
                <td key={tool.id}>
                  <PricingSummary model={tool.pricing_model} />
                </td>
              ))}
            </tr>
            
            {/* Time to Value */}
            <tr>
              <td>Time to Value</td>
              {selectedTools.map(tool => (
                <td key={tool.id}>
                  {this.estimateTimeToValue(tool)}
                </td>
              ))}
            </tr>
            
            {/* Integration */}
            <tr>
              <td>Integration Capability</td>
              {selectedTools.map(tool => (
                <td key={tool.id}>
                  <IntegrationScore potential={tool.integration_potential} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
```

## Visual Design Guidelines

### Color Schemes for Impact Levels
```css
/* Impact score colors */
.impact-high { /* 80-100 */
  --impact-color: #10b981; /* Green */
  --impact-bg: #d1fae5;
}

.impact-medium { /* 50-79 */
  --impact-color: #f59e0b; /* Amber */
  --impact-bg: #fef3c7;
}

.impact-low { /* 0-49 */
  --impact-color: #ef4444; /* Red */
  --impact-bg: #fee2e2;
}

/* Quick win indicators */
.quick-win {
  border: 2px solid #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.strategic {
  border: 2px solid #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
```

### Animation and Transitions
```css
/* Smooth gauge animations */
.animated-arc {
  stroke-dashoffset: 251.2;
  animation: fillArc 1.5s ease-out forwards;
}

@keyframes fillArc {
  to {
    stroke-dashoffset: 0;
  }
}

/* Card hover effects */
.executive-card {
  transition: all 0.3s ease;
}

.executive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

## Data Visualization Components

### 1. Portfolio Overview Chart
```javascript
class PortfolioOverviewChart extends Component {
  initChart() {
    const ctx = this.chartRef.current.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Tools Portfolio',
          data: this.props.tools.map(tool => ({
            x: tool.business_impact_score,
            y: tool.complexity_score,
            r: this.calculateBubbleSize(tool),
            tool: tool
          })),
          backgroundColor: this.getBubbleColors()
        }]
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'Business Impact Score' },
            min: 0,
            max: 100
          },
          y: {
            title: { display: true, text: 'Complexity' },
            min: 1,
            max: 5,
            reverse: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const tool = context.raw.tool;
                return [
                  `${tool.tool_name}`,
                  `Impact: ${tool.business_impact_score}`,
                  `Complexity: ${tool.complexity_score}/5`,
                  `Category: ${tool.category}`
                ];
              }
            }
          }
        }
      }
    });
  }
}
```