# Technical View Components Specification

## Overview
The Technical View provides developers and IT teams with implementation details, API information, integration capabilities, and technical requirements for the 317 AI tools.

## Component Architecture

### 1. Technical Tool Card
```javascript
class TechnicalToolCard extends Component {
  render() {
    const { tool } = this.props;
    const integrationLevel = this.assessIntegrationLevel(tool.integration_potential);
    
    return (
      <div className="technical-card">
        {/* Header with Technical Badges */}
        <div className="tech-header">
          <h3>{tool.tool_name}</h3>
          <div className="tech-badges">
            {this.renderIntegrationBadge(integrationLevel)}
            {this.renderLearningCurveBadge(tool.learning_curve)}
            {tool.has_api && <Badge type="api" label="API Available" />}
          </div>
        </div>
        
        {/* Integration Capabilities */}
        <div className="integration-section">
          <h4>Integration Capabilities</h4>
          <p className="integration-desc">{tool.integration_potential}</p>
          <div className="integration-features">
            {this.extractIntegrationFeatures(tool).map(feature => (
              <IntegrationFeature key={feature} type={feature} />
            ))}
          </div>
        </div>
        
        {/* Technical Specifications */}
        <div className="tech-specs">
          <SpecItem
            label="Learning Curve"
            value={tool.learning_curve}
            icon="graduation-cap"
          />
          <SpecItem
            label="Deployment Model"
            value={this.extractDeploymentModel(tool)}
            icon="cloud"
          />
          <SpecItem
            label="Data Security"
            value={this.assessSecurityLevel(tool)}
            icon="shield"
          />
        </div>
        
        {/* Code Example (if available) */}
        {this.hasCodeExample(tool) && (
          <div className="code-section">
            <h4>Quick Start</h4>
            <CodeExample
              language={this.detectLanguage(tool)}
              code={this.generateCodeExample(tool)}
            />
          </div>
        )}
        
        {/* Compliance & Regulations */}
        <div className="compliance-section">
          <h4>Compliance & Regulations</h4>
          <ComplianceInfo 
            geoLimitations={tool.geo_regulatory_limitations}
            certifications={this.extractCertifications(tool)}
          />
        </div>
        
        {/* Technical Actions */}
        <div className="tech-actions">
          <button className="btn-primary">View Documentation</button>
          <button className="btn-secondary">Test API</button>
          <button className="btn-ghost">Download SDK</button>
        </div>
      </div>
    );
  }
}
```

### 2. API Documentation Component
```javascript
class APIDocumentation extends Component {
  render() {
    const { tool } = this.props;
    const apiInfo = this.extractAPIInfo(tool);
    
    return (
      <div className="api-documentation">
        <div className="api-header">
          <h3>API Reference</h3>
          <div className="api-version">v{apiInfo.version || '1.0'}</div>
        </div>
        
        {/* Authentication */}
        <section className="api-section">
          <h4>Authentication</h4>
          <CodeBlock language="bash">
            {this.generateAuthExample(apiInfo)}
          </CodeBlock>
        </section>
        
        {/* Endpoints */}
        <section className="api-section">
          <h4>Common Endpoints</h4>
          <EndpointList endpoints={apiInfo.endpoints} />
        </section>
        
        {/* Rate Limits */}
        <section className="api-section">
          <h4>Rate Limits</h4>
          <RateLimitInfo limits={apiInfo.rateLimits} />
        </section>
        
        {/* SDKs */}
        <section className="api-section">
          <h4>Available SDKs</h4>
          <div className="sdk-grid">
            {apiInfo.sdks?.map(sdk => (
              <SDKCard
                key={sdk.language}
                language={sdk.language}
                version={sdk.version}
                installCommand={sdk.installCommand}
              />
            ))}
          </div>
        </section>
        
        {/* Code Examples */}
        <section className="api-section">
          <h4>Quick Start Examples</h4>
          <CodeExampleTabs examples={apiInfo.examples} />
        </section>
      </div>
    );
  }
}
```

### 3. Integration Matrix Component
```javascript
class IntegrationMatrix extends Component {
  render() {
    const { tool } = this.props;
    const integrations = this.parseIntegrations(tool);
    
    return (
      <div className="integration-matrix">
        <h4>Integration Compatibility Matrix</h4>
        
        <div className="matrix-grid">
          {/* Development Frameworks */}
          <div className="matrix-section">
            <h5>Frameworks</h5>
            <div className="compatibility-items">
              {['React', 'Vue', 'Angular', 'Next.js', 'Node.js'].map(framework => (
                <CompatibilityItem
                  key={framework}
                  name={framework}
                  supported={integrations.frameworks?.includes(framework)}
                  level={this.getCompatibilityLevel(tool, framework)}
                />
              ))}
            </div>
          </div>
          
          {/* Cloud Platforms */}
          <div className="matrix-section">
            <h5>Cloud Platforms</h5>
            <div className="compatibility-items">
              {['AWS', 'Azure', 'GCP', 'Heroku', 'Vercel'].map(platform => (
                <CompatibilityItem
                  key={platform}
                  name={platform}
                  supported={integrations.platforms?.includes(platform)}
                  level={this.getCompatibilityLevel(tool, platform)}
                />
              ))}
            </div>
          </div>
          
          {/* Enterprise Systems */}
          <div className="matrix-section">
            <h5>Enterprise Systems</h5>
            <div className="compatibility-items">
              {['Salesforce', 'SAP', 'Oracle', 'Microsoft 365', 'Slack'].map(system => (
                <CompatibilityItem
                  key={system}
                  name={system}
                  supported={integrations.enterprise?.includes(system)}
                  level={this.getCompatibilityLevel(tool, system)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
```

### 4. Technical Requirements Component
```javascript
class TechnicalRequirements extends Component {
  analyzeRequirements(tool) {
    return {
      infrastructure: this.extractInfrastructureReqs(tool),
      security: this.extractSecurityReqs(tool),
      performance: this.extractPerformanceReqs(tool),
      compliance: this.extractComplianceReqs(tool)
    };
  }
  
  render() {
    const { tool } = this.props;
    const requirements = this.analyzeRequirements(tool);
    
    return (
      <div className="technical-requirements">
        <h3>Technical Requirements</h3>
        
        {/* Infrastructure Requirements */}
        <RequirementSection
          title="Infrastructure"
          icon="server"
          items={requirements.infrastructure}
          level={this.assessInfrastructureComplexity(requirements.infrastructure)}
        />
        
        {/* Security Requirements */}
        <RequirementSection
          title="Security"
          icon="shield"
          items={requirements.security}
          level="high"
          highlight={true}
        />
        
        {/* Performance Requirements */}
        <RequirementSection
          title="Performance"
          icon="zap"
          items={requirements.performance}
        />
        
        {/* Compliance Requirements */}
        <RequirementSection
          title="Compliance"
          icon="check-circle"
          items={requirements.compliance}
        />
        
        {/* Deployment Checklist */}
        <div className="deployment-checklist">
          <h4>Deployment Checklist</h4>
          <DeploymentChecklist 
            requirements={requirements}
            onItemCheck={this.handleChecklistUpdate}
          />
        </div>
      </div>
    );
  }
}
```

### 5. Code Examples Component
```javascript
class CodeExamples extends Component {
  generateExamples(tool) {
    const examples = [];
    
    // Python example
    if (this.supportsPython(tool)) {
      examples.push({
        language: 'python',
        title: 'Python Integration',
        code: this.generatePythonExample(tool)
      });
    }
    
    // JavaScript example
    if (this.supportsJavaScript(tool)) {
      examples.push({
        language: 'javascript',
        title: 'JavaScript/Node.js',
        code: this.generateJavaScriptExample(tool)
      });
    }
    
    // REST API example
    examples.push({
      language: 'bash',
      title: 'REST API',
      code: this.generateRestExample(tool)
    });
    
    return examples;
  }
  
  render() {
    const { tool } = this.props;
    const examples = this.generateExamples(tool);
    
    return (
      <div className="code-examples">
        <Tabs>
          {examples.map((example, index) => (
            <TabPanel key={index} label={example.title}>
              <CodeBlock
                language={example.language}
                showLineNumbers={true}
                copyButton={true}
              >
                {example.code}
              </CodeBlock>
            </TabPanel>
          ))}
        </Tabs>
        
        {/* Environment Variables */}
        <div className="env-vars">
          <h5>Required Environment Variables</h5>
          <EnvVarsList tool={tool} />
        </div>
      </div>
    );
  }
}
```

## Technical Data Visualization

### 1. Learning Curve Indicator
```javascript
class LearningCurveIndicator extends Component {
  parselearningCurve(curveText) {
    const levels = {
      'low': { value: 1, color: '#10b981', label: 'Easy' },
      'moderate': { value: 2, color: '#f59e0b', label: 'Moderate' },
      'high': { value: 3, color: '#ef4444', label: 'Steep' },
      'variable': { value: 2, color: '#3b82f6', label: 'Variable' }
    };
    
    const normalized = curveText.toLowerCase();
    for (const [key, config] of Object.entries(levels)) {
      if (normalized.includes(key)) {
        return config;
      }
    }
    
    return levels.moderate; // Default
  }
  
  render() {
    const { learningCurve } = this.props;
    const curve = this.parselearningCurve(learningCurve);
    
    return (
      <div className="learning-curve-indicator">
        <div className="curve-visual">
          <svg width="100" height="60">
            <path
              d={this.generateCurvePath(curve.value)}
              stroke={curve.color}
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>
        <div className="curve-details">
          <span className="curve-label">{curve.label}</span>
          <span className="curve-description">{learningCurve}</span>
        </div>
      </div>
    );
  }
}
```

### 2. Integration Potential Gauge
```javascript
class IntegrationPotentialGauge extends Component {
  assessIntegrationScore(potential) {
    const keywords = {
      excellent: 100,
      'very good': 90,
      good: 80,
      robust: 85,
      moderate: 60,
      limited: 40,
      basic: 30,
      poor: 20
    };
    
    const normalized = potential.toLowerCase();
    for (const [keyword, score] of Object.entries(keywords)) {
      if (normalized.includes(keyword)) {
        return score;
      }
    }
    
    // Default based on API mentions
    if (normalized.includes('api')) return 70;
    if (normalized.includes('sdk')) return 75;
    if (normalized.includes('webhook')) return 80;
    
    return 50; // Default moderate
  }
  
  render() {
    const { integrationPotential } = this.props;
    const score = this.assessIntegrationScore(integrationPotential);
    
    return (
      <div className="integration-gauge">
        <RadialProgress
          value={score}
          size={80}
          strokeWidth={6}
          color={this.getScoreColor(score)}
        >
          <span className="score">{score}</span>
        </RadialProgress>
        <div className="gauge-label">Integration Score</div>
      </div>
    );
  }
}
```

## Technical View Specific Styles

```css
/* Technical card styling */
.technical-card {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Monaco', monospace;
  background: var(--bg-card);
  border: 1px solid var(--border-tech);
  border-radius: var(--radius-md);
}

.tech-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech-badge {
  padding: 0.25rem 0.75rem;
  background: var(--bg-badge);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Code block styling */
.code-block {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-block.has-line-numbers {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
}

/* Integration matrix */
.matrix-grid {
  display: grid;
  gap: 2rem;
}

.compatibility-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.compatibility-item.supported {
  background: var(--success-bg);
  color: var(--success);
}

.compatibility-item.not-supported {
  background: var(--muted-bg);
  color: var(--muted);
}

/* Technical specifications */
.tech-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}
```