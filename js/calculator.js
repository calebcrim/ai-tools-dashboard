class ROICalculator {
  constructor() {
    this.assumptions = {
      avgEmployeeCost: 75000,
      workingHoursPerYear: 2080,
      adoptionRate: 0.8,
      implementationEfficiency: 0.7,
      teamSize: 10
    };
  }

  calculateToolROI(tool, customAssumptions = {}) {
    const assumptions = { ...this.assumptions, ...customAssumptions };
    const costs = this.calculateTotalCosts(tool, assumptions);
    const benefits = this.calculateTotalBenefits(tool, assumptions);
    const timeline = this.projectTimeline(tool, costs, benefits);
    
    return {
      toolName: tool.tool_name,
      initialInvestment: costs.initial,
      annualCosts: costs.annual,
      annualBenefits: benefits.annual,
      breakEvenMonths: this.calculateBreakEven(costs, benefits),
      threeYearROI: this.calculateMultiYearROI(costs, benefits, 3),
      fiveYearROI: this.calculateMultiYearROI(costs, benefits, 5),
      netPresentValue: this.calculateNPV(costs, benefits, 5, 0.1),
      confidenceScore: this.assessConfidence(tool),
      timeline: timeline,
      assumptions: assumptions,
      costs: costs,
      benefits: benefits
    };
  }

  calculateTotalCosts(tool, assumptions) {
    const monthlyPrice = tool.monthlyPrice || this.extractMonthlyPrice(tool.pricing_model);
    const annualLicensing = monthlyPrice * 12 * assumptions.teamSize;
    
    const complexity = tool.complexity_score || 3;
    const implementationCost = complexity * 2000 * (assumptions.teamSize / 10);
    
    const learningCurve = tool.learning_curve || 'medium';
    let trainingCostPerPerson = 500;
    if (learningCurve.toLowerCase().includes('high')) trainingCostPerPerson = 1500;
    if (learningCurve.toLowerCase().includes('low')) trainingCostPerPerson = 200;
    
    const trainingCost = trainingCostPerPerson * assumptions.teamSize;
    const maintenanceCost = annualLicensing * 0.2;
    
    const opportunityCost = this.calculateOpportunityCost(tool, assumptions);
    
    return {
      initial: implementationCost + trainingCost,
      annual: annualLicensing + maintenanceCost,
      breakdown: {
        licensing: annualLicensing,
        implementation: implementationCost,
        training: trainingCost,
        maintenance: maintenanceCost,
        opportunity: opportunityCost
      }
    };
  }

  calculateTotalBenefits(tool, assumptions) {
    const metrics = this.extractMetrics(tool.case_studies);
    
    const hourlyRate = assumptions.avgEmployeeCost / assumptions.workingHoursPerYear;
    const effectiveTeamSize = assumptions.teamSize * assumptions.adoptionRate;
    
    const productivityHoursSaved = (metrics.productivity / 100) * 
                                   assumptions.workingHoursPerYear * 0.2;
    const productivityGains = productivityHoursSaved * hourlyRate * effectiveTeamSize;
    
    const processEfficiency = metrics.efficiency ? 
      (metrics.efficiency / 100) * assumptions.avgEmployeeCost * effectiveTeamSize * 0.15 : 0;
    
    const costSavings = (metrics.cost / 100) * assumptions.avgEmployeeCost * effectiveTeamSize * 0.2;
    
    const revenueImpact = metrics.revenue ? 
      (metrics.revenue / 100) * (assumptions.avgEmployeeCost * assumptions.teamSize * 5) : 0;
    
    const qualityImprovement = this.estimateQualityImpact(tool, assumptions);
    const riskReduction = this.estimateRiskReduction(tool, assumptions);
    
    return {
      annual: productivityGains + processEfficiency + costSavings + revenueImpact + 
              qualityImprovement + riskReduction,
      breakdown: {
        productivity: productivityGains,
        efficiency: processEfficiency,
        costSavings: costSavings,
        revenue: revenueImpact,
        quality: qualityImprovement,
        riskReduction: riskReduction
      },
      assumptions: {
        productivityHoursSaved: productivityHoursSaved,
        effectiveTeamSize: effectiveTeamSize,
        hourlyRate: hourlyRate
      }
    };
  }

  extractMetrics(caseStudies) {
    if (!caseStudies) return { productivity: 20, cost: 10, revenue: 0, efficiency: 15 };
    
    const text = caseStudies.toLowerCase();
    const metrics = {
      productivity: 20,
      cost: 10, 
      revenue: 0,
      efficiency: 15
    };
    
    const patterns = {
      productivity: /(\d+)%?\s*(productivity|productive|faster|speed|quick)/i,
      efficiency: /(\d+)%?\s*(efficiency|efficient|streamline|optimize)/i,
      cost: /(\d+)%?\s*(cost|savings|save|reduce|reduction)/i,
      revenue: /(\d+)%?\s*(revenue|sales|growth|increase)/i,
      time: /(\d+)%?\s*(time|hours|days)\s*(saved|reduction)/i
    };
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        metrics[key] = parseInt(match[1]);
      }
    });
    
    if (text.includes('2x') || text.includes('double')) {
      metrics.productivity = Math.max(metrics.productivity, 100);
    }
    if (text.includes('3x') || text.includes('triple')) {
      metrics.productivity = Math.max(metrics.productivity, 200);
    }
    
    return metrics;
  }

  calculateOpportunityCost(tool, assumptions) {
    const implementationTime = tool.timeToValueDays || 30;
    const dailyProductivity = assumptions.avgEmployeeCost / 365;
    return implementationTime * dailyProductivity * assumptions.teamSize * 0.2;
  }

  estimateQualityImpact(tool, assumptions) {
    const category = tool.category.toLowerCase();
    const qualityCategories = ['analytics', 'testing', 'monitoring', 'security', 'compliance'];
    
    if (qualityCategories.some(cat => category.includes(cat))) {
      return assumptions.avgEmployeeCost * assumptions.teamSize * 0.05;
    }
    
    return 0;
  }

  estimateRiskReduction(tool, assumptions) {
    const category = tool.category.toLowerCase();
    const riskCategories = ['security', 'compliance', 'backup', 'monitoring', 'legal'];
    
    if (riskCategories.some(cat => category.includes(cat))) {
      return assumptions.avgEmployeeCost * assumptions.teamSize * 0.08;
    }
    
    return 0;
  }

  calculateBreakEven(costs, benefits) {
    const totalFirstYearCost = costs.initial + costs.annual;
    const monthlyBenefit = benefits.annual / 12;
    
    if (monthlyBenefit <= 0) return 999;
    
    return Math.ceil(totalFirstYearCost / monthlyBenefit);
  }

  calculateMultiYearROI(costs, benefits, years) {
    const totalCost = costs.initial + (costs.annual * years);
    const totalBenefit = benefits.annual * years;
    
    if (totalCost <= 0) return 0;
    
    return Math.round(((totalBenefit - totalCost) / totalCost) * 100);
  }

  calculateNPV(costs, benefits, years, discountRate) {
    let npv = -costs.initial;
    
    for (let year = 1; year <= years; year++) {
      const netCashFlow = benefits.annual - costs.annual;
      const discountFactor = Math.pow(1 + discountRate, year);
      npv += netCashFlow / discountFactor;
    }
    
    return Math.round(npv);
  }

  projectTimeline(tool, costs, benefits) {
    const monthlyBenefit = benefits.annual / 12;
    const timeline = [];
    let cumulativeCost = costs.initial;
    let cumulativeBenefit = 0;
    
    for (let month = 1; month <= 36; month++) {
      if (month > 1) {
        cumulativeCost += costs.annual / 12;
      }
      
      if (month > (tool.timeToValueDays || 30) / 30) {
        cumulativeBenefit += monthlyBenefit;
      }
      
      timeline.push({
        month: month,
        cumulativeCost: Math.round(cumulativeCost),
        cumulativeBenefit: Math.round(cumulativeBenefit),
        netValue: Math.round(cumulativeBenefit - cumulativeCost)
      });
    }
    
    return timeline;
  }

  assessConfidence(tool) {
    let confidence = 50;
    
    if (tool.case_studies && tool.case_studies.length > 100) confidence += 20;
    if (tool.completenessScore >= 90) confidence += 15;
    if (tool.pricing_model && !tool.pricing_model.toLowerCase().includes('contact')) confidence += 10;
    if (tool.integration_potential && tool.integration_potential.length > 50) confidence += 5;
    
    return Math.min(100, confidence);
  }

  extractMonthlyPrice(pricingModel) {
    if (!pricingModel) return 100;
    
    const text = pricingModel.toLowerCase();
    const patterns = {
      perUserMonth: /\$(\d+)\s*\/\s*user\s*\/\s*month/i,
      flatMonth: /\$(\d+)\s*\/\s*month/i,
      annual: /\$(\d+)\s*\/\s*year/i
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        if (type === 'perUserMonth') return parseInt(match[1]);
        if (type === 'flatMonth') return parseInt(match[1]);
        if (type === 'annual') return Math.round(parseInt(match[1]) / 12);
      }
    }
    
    if (text.includes('free')) return 0;
    if (text.includes('enterprise') || text.includes('custom')) return 500;
    
    return 100;
  }

  renderCalculator(tool) {
    const roi = this.calculateToolROI(tool);
    
    return `
      <div class="roi-calculator-modal">
        <div class="calculator-header">
          <h2>ROI Analysis: ${tool.tool_name}</h2>
          <div class="confidence-indicator">
            <span>Confidence Score: ${roi.confidenceScore}%</span>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${roi.confidenceScore}%"></div>
            </div>
          </div>
        </div>
        
        <div class="roi-summary-grid">
          <div class="roi-metric highlight">
            <div class="metric-icon"><i class="fas fa-percentage"></i></div>
            <label>3-Year ROI</label>
            <value class="${roi.threeYearROI > 0 ? 'positive' : 'negative'}">${roi.threeYearROI}%</value>
          </div>
          <div class="roi-metric">
            <div class="metric-icon"><i class="fas fa-calendar-check"></i></div>
            <label>Payback Period</label>
            <value>${roi.breakEvenMonths} months</value>
          </div>
          <div class="roi-metric">
            <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
            <label>Annual Benefit</label>
            <value>$${this.formatCurrency(roi.annualBenefits)}</value>
          </div>
          <div class="roi-metric">
            <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
            <label>NPV (5 years)</label>
            <value class="${roi.netPresentValue > 0 ? 'positive' : 'negative'}">
              $${this.formatCurrency(Math.abs(roi.netPresentValue))}
            </value>
          </div>
        </div>
        
        <div class="roi-details-grid">
          <div class="cost-breakdown">
            <h3><i class="fas fa-minus-circle"></i> Investment Required</h3>
            <table class="breakdown-table">
              <tr>
                <td>Implementation</td>
                <td class="amount">$${this.formatCurrency(roi.costs.breakdown.implementation)}</td>
              </tr>
              <tr>
                <td>Training</td>
                <td class="amount">$${this.formatCurrency(roi.costs.breakdown.training)}</td>
              </tr>
              <tr>
                <td>Annual Licensing</td>
                <td class="amount">$${this.formatCurrency(roi.costs.breakdown.licensing)}</td>
              </tr>
              <tr>
                <td>Maintenance (20%)</td>
                <td class="amount">$${this.formatCurrency(roi.costs.breakdown.maintenance)}</td>
              </tr>
              <tr class="total">
                <td>Total First Year</td>
                <td class="amount">$${this.formatCurrency(roi.initialInvestment + roi.annualCosts)}</td>
              </tr>
            </table>
          </div>
          
          <div class="benefit-breakdown">
            <h3><i class="fas fa-plus-circle"></i> Expected Benefits</h3>
            <table class="breakdown-table">
              <tr>
                <td>Productivity Gains</td>
                <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.productivity)}/yr</td>
              </tr>
              <tr>
                <td>Process Efficiency</td>
                <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.efficiency)}/yr</td>
              </tr>
              <tr>
                <td>Cost Reduction</td>
                <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.costSavings)}/yr</td>
              </tr>
              <tr>
                <td>Revenue Impact</td>
                <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.revenue)}/yr</td>
              </tr>
              ${roi.benefits.breakdown.quality > 0 ? `
                <tr>
                  <td>Quality Improvement</td>
                  <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.quality)}/yr</td>
                </tr>
              ` : ''}
              ${roi.benefits.breakdown.riskReduction > 0 ? `
                <tr>
                  <td>Risk Reduction</td>
                  <td class="amount">$${this.formatCurrency(roi.benefits.breakdown.riskReduction)}/yr</td>
                </tr>
              ` : ''}
              <tr class="total">
                <td>Total Annual Benefit</td>
                <td class="amount">$${this.formatCurrency(roi.annualBenefits)}/yr</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div class="roi-timeline">
          <h3><i class="fas fa-chart-area"></i> Projected Value Timeline</h3>
          <canvas id="roi-chart-${tool.tool_name.replace(/\s+/g, '-')}"></canvas>
        </div>
        
        <div class="roi-assumptions">
          <h3><i class="fas fa-info-circle"></i> Key Assumptions</h3>
          <div class="assumptions-grid">
            <div class="assumption-item">
              <label>Team Size</label>
              <input type="number" id="team-size" value="${roi.assumptions.teamSize}" 
                     onchange="calculator.recalculate('${tool.tool_name}')">
            </div>
            <div class="assumption-item">
              <label>Avg Employee Cost</label>
              <input type="number" id="avg-cost" value="${roi.assumptions.avgEmployeeCost}" 
                     onchange="calculator.recalculate('${tool.tool_name}')">
            </div>
            <div class="assumption-item">
              <label>Adoption Rate</label>
              <input type="range" min="0" max="100" value="${roi.assumptions.adoptionRate * 100}" 
                     id="adoption-rate" onchange="calculator.recalculate('${tool.tool_name}')">
              <span>${Math.round(roi.assumptions.adoptionRate * 100)}%</span>
            </div>
          </div>
          
          <div class="assumption-details">
            <h4>Calculation Details:</h4>
            <ul>
              <li>Productivity hours saved: ${Math.round(roi.benefits.assumptions.productivityHoursSaved)} hours/year per person</li>
              <li>Effective team size: ${roi.benefits.assumptions.effectiveTeamSize.toFixed(1)} people</li>
              <li>Hourly rate: $${roi.benefits.assumptions.hourlyRate.toFixed(2)}</li>
              <li>Implementation efficiency: ${(roi.assumptions.implementationEfficiency * 100)}%</li>
            </ul>
          </div>
        </div>
        
        <div class="roi-actions">
          <button class="primary" onclick="calculator.exportROIReport('${tool.tool_name}')">
            <i class="fas fa-file-export"></i> Export Report
          </button>
          <button class="secondary" onclick="calculator.compareWithOthers('${tool.tool_name}')">
            <i class="fas fa-balance-scale"></i> Compare Tools
          </button>
          <button class="secondary" onclick="calculator.createScenarios('${tool.tool_name}')">
            <i class="fas fa-project-diagram"></i> Scenario Analysis
          </button>
        </div>
      </div>
    `;
  }

  renderChart(canvasId, timeline) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const labels = timeline.map(t => `Month ${t.month}`);
    const costs = timeline.map(t => t.cumulativeCost);
    const benefits = timeline.map(t => t.cumulativeBenefit);
    const netValue = timeline.map(t => t.netValue);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cumulative Cost',
          data: costs,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4
        }, {
          label: 'Cumulative Benefit',
          data: benefits,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4
        }, {
          label: 'Net Value',
          data: netValue,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '36-Month ROI Projection'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + 
                       context.parsed.y.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  formatCurrency(amount) {
    return Math.abs(amount).toLocaleString();
  }

  recalculate(toolName) {
    const tool = window.dataProcessor.processedData.get(toolName);
    const teamSize = parseInt(document.getElementById('team-size').value);
    const avgCost = parseInt(document.getElementById('avg-cost').value);
    const adoptionRate = parseInt(document.getElementById('adoption-rate').value) / 100;
    
    const customAssumptions = {
      teamSize,
      avgEmployeeCost: avgCost,
      adoptionRate
    };
    
    const newROI = this.calculateToolROI(tool, customAssumptions);
    this.updateROIDisplay(newROI);
  }

  updateROIDisplay(roi) {
    // Update the display with new ROI calculations
    // This would update the DOM elements with new values
  }

  exportROIReport(toolName) {
    const tool = window.dataProcessor.processedData.get(toolName);
    const roi = this.calculateToolROI(tool);
    
    // Generate PDF report
    const doc = new jsPDF();
    doc.text(`ROI Analysis Report: ${toolName}`, 20, 20);
    // Add more content to PDF...
    
    doc.save(`${toolName}_ROI_Report.pdf`);
  }

  compareWithOthers(toolName) {
    // Open comparison modal
    const modal = new ComparisonModal(toolName);
    modal.show();
  }

  createScenarios(toolName) {
    // Open scenario analysis modal
    const modal = new ScenarioAnalysisModal(toolName);
    modal.show();
  }
}

export default ROICalculator;