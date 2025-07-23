// export-pdf.js
// Export tools and comparisons to PDF format

class ExportPDF {
    constructor() {
        this.jsPDFLoaded = false;
        this.loadJsPDF();
    }

    // Dynamically load jsPDF library
    loadJsPDF() {
        if (window.jspdf || this.jsPDFLoaded) {
            this.jsPDFLoaded = true;
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                this.jsPDFLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Export single tool to PDF
    async exportToolToPDF(toolData) {
        try {
            await this.loadJsPDF();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Set up document
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Add header
            doc.setFontSize(24);
            doc.setTextColor(33, 150, 243); // Blue color
            doc.text(toolData.tool_name || 'AI Tool Report', margin, yPosition);
            yPosition += 15;

            // Add date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin);

            // Add category
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Category: ${toolData.category || 'N/A'}`, margin, yPosition);
            yPosition += 15;

            // Add description
            if (toolData.brief_purpose_summary) {
                doc.setFontSize(12);
                doc.setTextColor(50);
                const lines = doc.splitTextToSize(toolData.brief_purpose_summary, pageWidth - 2 * margin);
                doc.text(lines, margin, yPosition);
                yPosition += lines.length * 6 + 10;
            }

            // Add pricing
            this.addSection(doc, 'Pricing', toolData.pricing_model, margin, yPosition);
            yPosition += this.calculateSectionHeight(doc, toolData.pricing_model, pageWidth - 2 * margin) + 15;

            // Add features
            if (toolData.feature_breakdown) {
                this.addSection(doc, 'Key Features', toolData.feature_breakdown, margin, yPosition);
                yPosition += this.calculateSectionHeight(doc, toolData.feature_breakdown, pageWidth - 2 * margin) + 15;
            }

            // Check if we need a new page
            if (yPosition > pageHeight - 80) {
                doc.addPage();
                yPosition = margin;
            }

            // Add pros and cons
            if (toolData.pros_cons_limitations) {
                this.addSection(doc, 'Pros & Cons', toolData.pros_cons_limitations, margin, yPosition);
                yPosition += this.calculateSectionHeight(doc, toolData.pros_cons_limitations, pageWidth - 2 * margin) + 15;
            }

            // Add integration info
            if (toolData.integration_potential) {
                this.addSection(doc, 'Integration Capabilities', toolData.integration_potential, margin, yPosition);
                yPosition += this.calculateSectionHeight(doc, toolData.integration_potential, pageWidth - 2 * margin) + 15;
            }

            // Add footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('AI Tools Intelligence Hub - crimintel.ai', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save the PDF
            doc.save(`${toolData.tool_name.replace(/\s+/g, '_')}_report.pdf`);

            // Track export event
            if (window.gtag) {
                gtag('event', 'export_pdf', {
                    event_category: 'engagement',
                    event_label: 'tool_export',
                    tool_name: toolData.tool_name
                });
            }

        } catch (error) {
            console.error('Error exporting tool to PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    }

    // Export comparison to PDF
    async exportComparisonToPDF(tools) {
        try {
            await this.loadJsPDF();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape'); // Landscape for comparison

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Add header
            doc.setFontSize(24);
            doc.setTextColor(33, 150, 243);
            doc.text('AI Tools Comparison Report', margin, yPosition);
            yPosition += 10;

            // Add date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin);
            yPosition += 10;

            // Add tools being compared
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Comparing: ${tools.map(t => t.tool_name).join(' vs ')}`, margin, yPosition);
            yPosition += 15;

            // Create comparison table
            const columnWidth = (pageWidth - 2 * margin - 60) / tools.length;
            const rowHeight = 25;
            let xPosition = margin + 60;

            // Table header
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
            
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text('Feature', margin + 5, yPosition + 15);

            tools.forEach((tool, index) => {
                doc.text(this.truncateText(tool.tool_name, 20), xPosition + 5, yPosition + 15);
                xPosition += columnWidth;
            });

            yPosition += rowHeight;

            // Comparison rows
            const features = [
                { label: 'Category', key: 'category' },
                { label: 'Pricing', key: 'pricing_model' },
                { label: 'Learning Curve', key: 'learning_curve' },
                { label: 'Integration', key: 'integration_potential' }
            ];

            features.forEach((feature, featureIndex) => {
                // Alternate row colors
                if (featureIndex % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
                }

                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.text(feature.label, margin + 5, yPosition + 15);

                xPosition = margin + 60;
                tools.forEach(tool => {
                    const value = tool[feature.key] || 'N/A';
                    const truncated = this.truncateText(value, 30);
                    doc.setFontSize(10);
                    doc.text(truncated, xPosition + 5, yPosition + 15);
                    xPosition += columnWidth;
                });

                yPosition += rowHeight;

                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin;
                }
            });

            // Add summary section
            yPosition += 10;
            doc.setFontSize(14);
            doc.setTextColor(33, 150, 243);
            doc.text('Summary', margin, yPosition);
            yPosition += 10;

            // Add brief summary for each tool
            tools.forEach((tool, index) => {
                doc.setFontSize(12);
                doc.setTextColor(0);
                doc.text(`${tool.tool_name}:`, margin, yPosition);
                yPosition += 5;

                if (tool.brief_purpose_summary) {
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    const lines = doc.splitTextToSize(tool.brief_purpose_summary, pageWidth - 2 * margin - 20);
                    doc.text(lines, margin + 20, yPosition);
                    yPosition += lines.length * 5 + 10;
                }
            });

            // Add footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('AI Tools Intelligence Hub - crimintel.ai', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save the PDF
            doc.save(`AI_Tools_Comparison_${new Date().getTime()}.pdf`);

            // Track export event
            if (window.gtag) {
                gtag('event', 'export_pdf', {
                    event_category: 'engagement',
                    event_label: 'comparison_export',
                    tools_count: tools.length
                });
            }

        } catch (error) {
            console.error('Error exporting comparison to PDF:', error);
            alert('Failed to export comparison PDF. Please try again.');
        }
    }

    // Export filtered tools list to CSV
    async exportToCSV(tools, filename = 'ai_tools_export.csv') {
        try {
            const headers = [
                'Tool Name',
                'Category',
                'Description',
                'Pricing',
                'Website',
                'Learning Curve',
                'Integration Potential'
            ];

            const rows = tools.map(tool => [
                tool.tool_name || '',
                tool.category || '',
                (tool.brief_purpose_summary || '').replace(/,/g, ';'),
                (tool.pricing_model || '').replace(/,/g, ';'),
                tool.url || '',
                tool.learning_curve || '',
                (tool.integration_potential || '').replace(/,/g, ';')
            ]);

            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            // Track export event
            if (window.gtag) {
                gtag('event', 'export_csv', {
                    event_category: 'engagement',
                    event_label: 'tools_export',
                    tools_count: tools.length
                });
            }

        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('Failed to export CSV. Please try again.');
        }
    }

    // Helper: Add section to PDF
    addSection(doc, title, content, x, y) {
        if (!content) return;

        doc.setFontSize(14);
        doc.setTextColor(33, 150, 243);
        doc.text(title + ':', x, y);

        doc.setFontSize(11);
        doc.setTextColor(50);
        const lines = doc.splitTextToSize(content, doc.internal.pageSize.getWidth() - 2 * x);
        doc.text(lines, x, y + 7);
    }

    // Helper: Calculate section height
    calculateSectionHeight(doc, content, maxWidth) {
        if (!content) return 0;
        const lines = doc.splitTextToSize(content, maxWidth);
        return lines.length * 6 + 7;
    }

    // Helper: Truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    // Add export buttons to UI
    addExportButtons() {
        // Add to tool cards
        document.addEventListener('DOMContentLoaded', () => {
            // Add CSS
            const style = document.createElement('style');
            style.textContent = `
                .export-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(33, 150, 243, 0.9);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 5px 10px;
                    font-size: 12px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .tool-card:hover .export-btn {
                    opacity: 1;
                }

                .export-btn:hover {
                    background: rgba(33, 150, 243, 1);
                }

                .comparison-export-btn {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 10px 20px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 20px;
                }

                .comparison-export-btn:hover {
                    background: #45a049;
                }
            `;
            document.head.appendChild(style);
        });
    }
}

// Initialize export functionality
const exportPDF = new ExportPDF();
exportPDF.addExportButtons();

// Global functions for easy access
window.exportToolToPDF = (toolData) => exportPDF.exportToolToPDF(toolData);
window.exportComparisonToPDF = (tools) => exportPDF.exportComparisonToPDF(tools);
window.exportToCSV = (tools, filename) => exportPDF.exportToCSV(tools, filename);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportPDF;
}