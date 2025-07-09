class RoadmapBuilder {
  constructor(dataProcessor) {
    this.processor = dataProcessor;
    this.selectedTools = [];
    this.phases = {
      immediate: { tools: [], duration: '0-30 days' },
      shortTerm: { tools: [], duration: '1-3 months' },
      mediumTerm: { tools: [], duration: '3-6 months' },
      longTerm: { tools: [], duration: '6+ months' }
    };
  }

  addTool(tool) {
    if (!this.selectedTools.find(t => t.tool_name === tool.tool_name)) {
      this.selectedTools.push(tool);
      this.categorizeToolByPhase(tool);
      return true;
    }
    return false;
  }

  removeTool(toolName) {
    this.selectedTools = this.selectedTools.filter(t => t.tool_name !== toolName);
    this.recalculatePhases();
  }

  categorizeToolByPhase(tool) {
    const complexity = tool.complexity_score || 3;
    const timeToValue = tool.timeToValueDays || 30;
    
    if (timeToValue <= 30 && complexity <= 2) {
      this.phases.immediate.tools.push(tool);
    } else if (timeToValue <= 90 && complexity <= 3) {
      this.phases.shortTerm.tools.push(tool);
    } else if (timeToValue <= 180 || complexity <= 4) {
      this.phases.mediumTerm.tools.push(tool);
    } else {
      this.phases.longTerm.tools.push(tool);
    }
  }

  recalculatePhases() {
    // Reset phases
    Object.values(this.phases).forEach(phase => phase.tools = []);
    
    // Recategorize all tools
    this.selectedTools.forEach(tool => this.categorizeToolByPhase(tool));
  }

  generateRoadmap() {
    const roadmap = {
      summary: this.generateSummary(),
      phases: this.generatePhases(),
      dependencies: this.identifyDependencies(),
      risks: this.assessRisks(),
      budget: this.calculateBudget(),
      timeline: this.generateTimeline(),
      metrics: this.defineSuccessMetrics()
    };
    
    return roadmap;
  }

  generateSummary() {
    const totalTools = this.selectedTools.length;
    const totalCost = this.calculateTotalCost();
    const avgROI = this.calculateAverageROI();
    const implementationTime = this.estimateTotalTime();
    
    return {
      totalTools,
      totalCost,
      avgROI,
      implementationTime,
      quickWins: this.phases.immediate.tools.length,
      strategicInvestments: this.selectedTools.filter(t => t.quadrant === 'strategic').length
    };
  }

  generatePhases() {
    return Object.entries(this.phases).map(([key, phase]) => ({
      name: this.getPhaseTitle(key),
      duration: phase.duration,
      tools: phase.tools.map(tool => ({
        name: tool.tool_name,
        category: tool.category,
        impact: tool.business_impact_score,
        complexity: tool.complexity_score,
        cost: this.calculateToolCost(tool),
        actions: this.generateActionItems(tool),
        successCriteria: this.defineToolSuccess(tool)
      })),
      totalCost: this.calculatePhaseCost(phase),
      expectedBenefits: this.calculatePhaseBenefits(phase),
      milestones: this.definePhaseMilestones(phase, key)
    }));
  }

  getPhaseTitle(key) {
    const titles = {
      immediate: 'Phase 1: Quick Wins & Foundation',
      shortTerm: 'Phase 2: Core Capabilities',
      mediumTerm: 'Phase 3: Advanced Integration',
      longTerm: 'Phase 4: Strategic Transformation'
    };
    return titles[key];
  }

  identifyDependencies() {
    const dependencies = [];
    
    this.selectedTools.forEach(tool => {
      // Check for integration dependencies
      if (tool.integration_potential) {
        const integrations = tool.integration_potential.toLowerCase();
        
        this.selectedTools.forEach(otherTool => {
          if (tool.tool_name !== otherTool.tool_name) {
            if (integrations.includes(otherTool.tool_name.toLowerCase()) ||
                integrations.includes(otherTool.category)) {
              dependencies.push({
                tool: tool.tool_name,
                dependsOn: otherTool.tool_name,
                type: 'integration',
                description: `${tool.tool_name} can integrate with ${otherTool.tool_name}`
              });
            }
          }
        });
      }
      
      // Check for category dependencies
      const categoryDeps = this.getCategoryDependencies(tool.category);
      categoryDeps.forEach(depCategory => {
        const depTools = this.selectedTools.filter(t => t.category === depCategory);
        depTools.forEach(depTool => {
          dependencies.push({
            tool: tool.tool_name,
            dependsOn: depTool.tool_name,
            type: 'category',
            description: `${tool.category} tools typically require ${depCategory} infrastructure`
          });
        });
      });
    });
    
    return dependencies;
  }

  getCategoryDependencies(category) {
    const deps = {
      'analytics': ['data-integration', 'security'],
      'content-creation': ['storage', 'collaboration'],
      'customer-service': ['crm', 'analytics'],
      'security': ['monitoring', 'compliance']
    };
    
    return deps[category] || [];
  }

  assessRisks() {
    const risks = [];
    
    // Too many tools in immediate phase
    if (this.phases.immediate.tools.length > 5) {
      risks.push({
        level: 'high',
        type: 'capacity',
        description: 'Too many tools in immediate phase may overwhelm teams',
        mitigation: 'Consider staggering deployments over 2-3 weeks'
      });
    }
    
    // High complexity tools without foundation
    const highComplexity = this.selectedTools.filter(t => t.complexity_score >= 4);
    if (highComplexity.length > 0 && this.phases.immediate.tools.length === 0) {
      risks.push({
        level: 'medium',
        type: 'adoption',
        description: 'Starting with high-complexity tools may reduce adoption',
        mitigation: 'Add quick-win tools to build momentum first'
      });
    }
    
    // Budget concentration
    const totalBudget = this.calculateTotalCost().annual;
    const topToolsCost = this.selectedTools
      .sort((a, b) => (b.monthlyPrice || 0) - (a.monthlyPrice || 0))
      .slice(0, 3)
      .reduce((sum, t) => sum + (t.monthlyPrice || 0) * 12, 0);
    
    if (topToolsCost / totalBudget > 0.6) {
      risks.push({
        level: 'medium',
        type: 'financial',
        description: 'Budget heavily concentrated in few tools',
        mitigation: 'Negotiate enterprise agreements or consider alternatives'
      });
    }
    
    // Integration complexity
    const integrationCount = this.identifyDependencies().length;
    if (integrationCount > 10) {
      risks.push({
        level: 'high',
        type: 'technical',
        description: 'Complex integration requirements between tools',
        mitigation: 'Consider phased integration approach or middleware solution'
      });
    }
    
    return risks;
  }

  calculateBudget() {
    const budget = {
      immediate: { licensing: 0, implementation: 0, training: 0 },
      annual: { licensing: 0, maintenance: 0 },
      total: { firstYear: 0, threeYear: 0 }
    };
    
    this.selectedTools.forEach(tool => {
      const costs = this.calculateToolCost(tool);
      
      budget.immediate.licensing += costs.firstMonth;
      budget.immediate.implementation += costs.implementation;
      budget.immediate.training += costs.training;
      
      budget.annual.licensing += costs.annual;
      budget.annual.maintenance += costs.maintenance;
    });
    
    budget.total.firstYear = budget.immediate.licensing + 
                            budget.immediate.implementation + 
                            budget.immediate.training + 
                            budget.annual.licensing;
    
    budget.total.threeYear = budget.total.firstYear + (budget.annual.licensing * 2);
    
    return budget;
  }

  calculateToolCost(tool) {
    const monthlyPrice = tool.monthlyPrice || 100;
    const complexity = tool.complexity_score || 3;
    
    return {
      firstMonth: monthlyPrice,
      annual: monthlyPrice * 12,
      implementation: complexity * 1500,
      training: complexity * 500,
      maintenance: monthlyPrice * 12 * 0.2
    };
  }

  calculateTotalCost() {
    const costs = this.selectedTools.reduce((total, tool) => {
      const toolCost = this.calculateToolCost(tool);
      return {
        initial: total.initial + toolCost.implementation + toolCost.training,
        annual: total.annual + toolCost.annual
      };
    }, { initial: 0, annual: 0 });
    
    return costs;
  }

  calculateAverageROI() {
    if (this.selectedTools.length === 0) return 0;
    
    const totalROI = this.selectedTools.reduce((sum, tool) => 
      sum + (tool.estimatedROI?.percentage || 0), 0
    );
    
    return Math.round(totalROI / this.selectedTools.length);
  }

  estimateTotalTime() {
    const maxComplexity = Math.max(...this.selectedTools.map(t => t.complexity_score || 3));
    const toolCount = this.selectedTools.length;
    
    if (toolCount <= 5 && maxComplexity <= 3) return '3 months';
    if (toolCount <= 10 && maxComplexity <= 4) return '6 months';
    if (toolCount <= 15) return '9 months';
    return '12+ months';
  }

  calculatePhaseCost(phase) {
    return phase.tools.reduce((sum, tool) => {
      const costs = this.calculateToolCost(tool);
      return sum + costs.firstMonth + costs.implementation + costs.training;
    }, 0);
  }

  calculatePhaseBenefits(phase) {
    const avgImpact = phase.tools.reduce((sum, t) => sum + (t.business_impact_score || 0), 0) / 
                      (phase.tools.length || 1);
    
    const benefits = {
      productivity: Math.round(avgImpact * 0.3) + '%',
      efficiency: Math.round(avgImpact * 0.2) + '%',
      costSavings: Math.round(avgImpact * 0.15) + '%'
    };
    
    return benefits;
  }

  generateActionItems(tool) {
    const actions = [];
    
    // Standard actions
    actions.push(`Procure ${tool.tool_name} licenses`);
    actions.push(`Assign implementation team`);
    actions.push(`Complete technical setup`);
    
    // Complexity-based actions
    if (tool.complexity_score >= 3) {
      actions.push(`Conduct stakeholder alignment sessions`);
      actions.push(`Create detailed implementation plan`);
    }
    
    if (tool.complexity_score >= 4) {
      actions.push(`Hire/assign dedicated project manager`);
      actions.push(`Develop custom integration requirements`);
    }
    
    // Category-specific actions
    if (tool.category.includes('security')) {
      actions.push(`Complete security assessment`);
      actions.push(`Update security policies`);
    }
    
    if (tool.category.includes('analytics')) {
      actions.push(`Define KPIs and metrics`);
      actions.push(`Set up data pipelines`);
    }
    
    // Training actions
    actions.push(`Schedule user training sessions`);
    actions.push(`Create internal documentation`);
    
    return actions;
  }

  defineToolSuccess(tool) {
    const criteria = [];
    
    // Universal criteria
    criteria.push(`${tool.adoptionRate || 80}% user adoption within 60 days`);
    criteria.push(`Positive user feedback score > 4/5`);
    
    // ROI-based criteria
    if (tool.estimatedROI) {
      criteria.push(`Achieve ${Math.round(tool.estimatedROI.percentage * 0.7)}% of projected ROI`);
    }
    
    // Category-specific criteria
    if (tool.category.includes('productivity')) {
      criteria.push(`Measurable time savings of 20%+`);
    }
    
    if (tool.category.includes('analytics')) {
      criteria.push(`Generate actionable insights within 30 days`);
    }
    
    if (tool.category.includes('security')) {
      criteria.push(`Zero security incidents post-implementation`);
    }
    
    return criteria;
  }

  definePhaseMilestones(phase, phaseKey) {
    const milestones = [];
    
    const timings = {
      immediate: { week1: 'Week 1', week2: 'Week 2', week4: 'Week 4' },
      shortTerm: { month1: 'Month 1', month2: 'Month 2', month3: 'Month 3' },
      mediumTerm: { month3: 'Month 3', month4: 'Month 4', month6: 'Month 6' },
      longTerm: { month6: 'Month 6', month9: 'Month 9', month12: 'Month 12' }
    };
    
    const timing = timings[phaseKey];
    
    milestones.push({
      time: Object.values(timing)[0],
      goal: `Complete procurement and setup for ${phase.tools.length} tools`,
      success: 'All tools accessible to teams'
    });
    
    milestones.push({
      time: Object.values(timing)[1],
      goal: 'Complete initial training and onboarding',
      success: '80% of users trained'
    });
    
    milestones.push({
      time: Object.values(timing)[2],
      goal: 'Achieve target adoption and initial ROI',
      success: 'Meet defined success criteria'
    });
    
    return milestones;
  }

  generateTimeline() {
    const timeline = [];
    let currentWeek = 0;
    
    Object.entries(this.phases).forEach(([phaseKey, phase]) => {
      if (phase.tools.length === 0) return;
      
      const phaseDuration = this.getPhaseDuration(phaseKey);
      
      phase.tools.forEach(tool => {
        const toolTimeline = {
          tool: tool.tool_name,
          start: currentWeek,
          duration: Math.ceil(tool.complexity_score || 3),
          milestones: [
            { week: currentWeek, event: 'Kickoff' },
            { week: currentWeek + 1, event: 'Setup' },
            { week: currentWeek + 2, event: 'Training' },
            { week: currentWeek + Math.ceil(tool.complexity_score || 3), event: 'Go Live' }
          ]
        };
        
        timeline.push(toolTimeline);
        currentWeek += 2; // Stagger deployments
      });
      
      currentWeek = Math.max(currentWeek, phaseDuration);
    });
    
    return timeline;
  }

  getPhaseDuration(phaseKey) {
    const durations = {
      immediate: 4,
      shortTerm: 12,
      mediumTerm: 24,
      longTerm: 52
    };
    return durations[phaseKey];
  }

  defineSuccessMetrics() {
    return {
      adoption: {
        target: '85% across all tools',
        measurement: 'Monthly active users / Total licensed users'
      },
      productivity: {
        target: '30% improvement',
        measurement: 'Time saved on key processes'
      },
      roi: {
        target: `${this.calculateAverageROI()}% average`,
        measurement: 'Cost savings + Revenue impact / Total investment'
      },
      satisfaction: {
        target: '4.0+ average rating',
        measurement: 'Quarterly user surveys'
      },
      integration: {
        target: '90% of planned integrations',
        measurement: 'Completed integrations / Planned integrations'
      }
    };
  }

  exportRoadmap(format = 'pdf') {
    const roadmap = this.generateRoadmap();
    
    switch(format) {
      case 'pdf':
        this.exportToPDF(roadmap);
        break;
      case 'ppt':
        this.exportToPowerPoint(roadmap);
        break;
      case 'csv':
        this.exportToCSV(roadmap);
        break;
      case 'json':
        this.exportToJSON(roadmap);
        break;
    }
  }

  exportToPDF(roadmap) {
    // Implementation would use jsPDF or similar
    console.log('Exporting roadmap to PDF:', roadmap);
  }

  exportToPowerPoint(roadmap) {
    // Implementation would use PptxGenJS or similar
    console.log('Exporting roadmap to PowerPoint:', roadmap);
  }

  exportToCSV(roadmap) {
    const csv = this.convertToCSV(roadmap);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-tools-roadmap.csv';
    a.click();
  }

  exportToJSON(roadmap) {
    const json = JSON.stringify(roadmap, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-tools-roadmap.json';
    a.click();
  }

  convertToCSV(roadmap) {
    const rows = [
      ['AI Tools Implementation Roadmap'],
      [],
      ['Summary'],
      ['Total Tools', roadmap.summary.totalTools],
      ['Total Cost (First Year)', '$' + roadmap.summary.totalCost.annual],
      ['Average ROI', roadmap.summary.avgROI + '%'],
      ['Implementation Time', roadmap.summary.implementationTime],
      [],
      ['Phase', 'Tool', 'Category', 'Impact', 'Complexity', 'Cost']
    ];
    
    roadmap.phases.forEach(phase => {
      phase.tools.forEach(tool => {
        rows.push([
          phase.name,
          tool.name,
          tool.category,
          tool.impact,
          tool.complexity,
          '$' + tool.cost.annual
        ]);
      });
    });
    
    return rows.map(row => row.join(',')).join('\n');
  }
}

// Roadmap Builder Modal
class RoadmapBuilderModal {
  constructor(dataProcessor) {
    this.processor = dataProcessor;
    this.builder = new RoadmapBuilder(dataProcessor);
    this.selectedTools = window.roadmapTools || [];
  }

  show() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content roadmap-modal">
        <div class="modal-header">
          <h2>AI Implementation Roadmap Builder</h2>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${this.renderRoadmapBuilder()}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.initializeInteractions();
  }

  renderRoadmapBuilder() {
    // Add selected tools to builder
    this.selectedTools.forEach(tool => this.builder.addTool(tool));
    
    const roadmap = this.builder.generateRoadmap();
    
    return `
      <div class="roadmap-builder">
        <div class="roadmap-summary">
          <h3>Roadmap Summary</h3>
          <div class="summary-metrics">
            <div class="summary-metric">
              <label>Total Tools</label>
              <value>${roadmap.summary.totalTools}</value>
            </div>
            <div class="summary-metric">
              <label>Total Investment</label>
              <value>$${this.formatCurrency(roadmap.summary.totalCost.annual)}</value>
            </div>
            <div class="summary-metric">
              <label>Average ROI</label>
              <value>${roadmap.summary.avgROI}%</value>
            </div>
            <div class="summary-metric">
              <label>Timeline</label>
              <value>${roadmap.summary.implementationTime}</value>
            </div>
          </div>
        </div>
        
        <div class="roadmap-tools-selector">
          <h3>Selected Tools</h3>
          <div class="selected-tools-list">
            ${this.selectedTools.map(tool => `
              <div class="selected-tool-item">
                <span>${tool.tool_name}</span>
                <button onclick="roadmapModal.removeTool('${tool.tool_name}')">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `).join('')}
          </div>
          <button class="add-more-btn" onclick="roadmapModal.showToolSelector()">
            <i class="fas fa-plus"></i> Add More Tools
          </button>
        </div>
        
        <div class="roadmap-phases">
          <h3>Implementation Phases</h3>
          ${roadmap.phases.map(phase => this.renderPhase(phase)).join('')}
        </div>
        
        ${roadmap.risks.length > 0 ? `
          <div class="roadmap-risks">
            <h3>Risk Assessment</h3>
            ${roadmap.risks.map(risk => `
              <div class="risk-item ${risk.level}">
                <div class="risk-header">
                  <span class="risk-level">${risk.level.toUpperCase()}</span>
                  <span class="risk-type">${risk.type}</span>
                </div>
                <p>${risk.description}</p>
                <div class="risk-mitigation">
                  <strong>Mitigation:</strong> ${risk.mitigation}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="roadmap-actions">
          <button class="primary" onclick="roadmapModal.exportRoadmap('pdf')">
            <i class="fas fa-file-pdf"></i> Export as PDF
          </button>
          <button class="secondary" onclick="roadmapModal.exportRoadmap('ppt')">
            <i class="fas fa-file-powerpoint"></i> Export as PowerPoint
          </button>
          <button class="secondary" onclick="roadmapModal.saveRoadmap()">
            <i class="fas fa-save"></i> Save Roadmap
          </button>
        </div>
      </div>
    `;
  }

  renderPhase(phase) {
    return `
      <div class="roadmap-phase">
        <div class="phase-header">
          <h4>${phase.name}</h4>
          <span class="phase-duration">${phase.duration}</span>
        </div>
        <div class="phase-metrics">
          <span>Tools: ${phase.tools.length}</span>
          <span>Cost: $${this.formatCurrency(phase.totalCost)}</span>
          <span>Expected Benefits: ${Object.values(phase.expectedBenefits).join(', ')}</span>
        </div>
        <div class="phase-tools">
          ${phase.tools.map(tool => `
            <div class="phase-tool">
              <div class="tool-header">
                <strong>${tool.name}</strong>
                <span class="tool-category">${tool.category}</span>
              </div>
              <div class="tool-actions">
                <h5>Action Items:</h5>
                <ul>
                  ${tool.actions.slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="phase-milestones">
          <h5>Milestones:</h5>
          ${phase.milestones.map(milestone => `
            <div class="milestone">
              <span class="milestone-time">${milestone.time}</span>
              <span class="milestone-goal">${milestone.goal}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  formatCurrency(amount) {
    return Math.round(amount).toLocaleString();
  }

  removeTool(toolName) {
    this.selectedTools = this.selectedTools.filter(t => t.tool_name !== toolName);
    this.builder.removeTool(toolName);
    this.refresh();
  }

  showToolSelector() {
    // Implementation for tool selection modal
    console.log('Show tool selector');
  }

  exportRoadmap(format) {
    this.builder.exportRoadmap(format);
  }

  saveRoadmap() {
    const roadmap = this.builder.generateRoadmap();
    localStorage.setItem('saved_roadmap', JSON.stringify({
      roadmap,
      savedAt: new Date().toISOString()
    }));
    alert('Roadmap saved successfully!');
  }

  refresh() {
    const modalBody = document.querySelector('.roadmap-modal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = this.renderRoadmapBuilder();
    }
  }

  initializeInteractions() {
    window.roadmapModal = this;
  }
}

export { RoadmapBuilder, RoadmapBuilderModal };