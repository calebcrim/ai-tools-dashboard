import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
});

// Read the markdown file
const markdownPath = path.join(__dirname, '..', 'ai-tools-guide-outline.md');
const markdown = fs.readFileSync(markdownPath, 'utf8');

// Convert markdown to HTML
let html = marked(markdown);

// Create the HTML template with professional styling
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Tools Selection Guide 2025</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            font-size: 11pt;
        }
        
        /* Page setup */
        @page {
            size: letter;
            margin: 1in;
        }
        
        @media print {
            .page-break {
                page-break-after: always;
            }
            
            /* Page numbers */
            @page {
                @bottom-right {
                    content: counter(page);
                }
            }
        }
        
        /* Cover page styling */
        .cover-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            page-break-after: always;
        }
        
        .cover-page h1 {
            font-size: 48pt;
            font-weight: 700;
            color: #3B82F6;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: -1px;
        }
        
        .cover-page .subtitle {
            font-size: 24pt;
            color: #64748B;
            margin-bottom: 40px;
        }
        
        .cover-page .tagline {
            font-size: 16pt;
            color: #475569;
            margin-bottom: 60px;
            font-style: italic;
        }
        
        .cover-page .meta {
            font-size: 14pt;
            color: #64748B;
            margin-top: auto;
        }
        
        /* Headers */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            color: #3B82F6;
            margin-top: 24px;
            margin-bottom: 16px;
        }
        
        h1 {
            font-size: 28pt;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 12px;
            margin-top: 0;
        }
        
        h2 {
            font-size: 22pt;
            margin-top: 36px;
        }
        
        h3 {
            font-size: 16pt;
            color: #1E40AF;
        }
        
        h4 {
            font-size: 14pt;
            color: #2563EB;
        }
        
        /* Paragraphs and text */
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        strong {
            font-weight: 600;
            color: #0F172A;
        }
        
        em {
            font-style: italic;
            color: #475569;
        }
        
        /* Lists */
        ul, ol {
            margin-left: 24px;
            margin-bottom: 16px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }
        
        th {
            background-color: #3B82F6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        tr:nth-child(even) {
            background-color: #F3F4F6;
        }
        
        /* Code blocks */
        pre {
            background-color: #F8FAFC;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
            margin: 16px 0;
        }
        
        code {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 10pt;
            background-color: #F1F5F9;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid #3B82F6;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #475569;
        }
        
        /* Special formatting for the exclusive bonus */
        .exclusive-bonus {
            background-color: #EFF6FF;
            border: 3px solid #3B82F6;
            border-radius: 10px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .exclusive-bonus h3 {
            color: #1E40AF;
            margin-top: 0;
        }
        
        /* Table of contents */
        .toc {
            margin: 40px 0;
        }
        
        .toc-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 12pt;
        }
        
        .toc-title {
            flex: 1;
        }
        
        .toc-dots {
            flex: 0 0 auto;
            margin: 0 8px;
            border-bottom: 1px dotted #94A3B8;
            min-width: 50px;
        }
        
        .toc-page {
            flex: 0 0 auto;
            color: #64748B;
        }
        
        /* Decision matrix styling */
        .decision-matrix table {
            font-size: 9pt;
        }
        
        .decision-matrix td:first-child {
            font-weight: 600;
        }
        
        /* Checkbox lists */
        input[type="checkbox"] {
            margin-right: 8px;
        }
        
        /* Links */
        a {
            color: #3B82F6;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            color: #64748B;
            font-size: 10pt;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
        }
        
        /* Page breaks */
        hr {
            margin: 40px 0;
            border: none;
            page-break-after: always;
        }
        
        /* Warning boxes */
        .warning {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 16px;
            margin: 16px 0;
        }
        
        .warning::before {
            content: "⚠️ ";
            font-size: 16pt;
        }
        
        /* Red flags */
        .red-flag {
            color: #DC2626;
            font-weight: 600;
        }
        
        /* Crimintel.ai branding */
        .branding {
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: #94A3B8;
            font-size: 9pt;
        }
    </style>
</head>
<body>
    ${html
        // Convert the cover page
        .replace(/<h1[^>]*>Quick AI Tools Selection Guide \(2025 Edition\)[^<]*<\/h1>/, '')
        .replace(/<h2[^>]*>Page 1: Cover Page[^<]*<\/h2>[\s\S]*?<hr>/m, `
            <div class="cover-page">
                <h1>AI Tools Selection Guide</h1>
                <div class="subtitle">2025 Edition</div>
                <div class="tagline">Your 5-Step Framework to Choose the Right AI Tool in Minutes</div>
                <div class="meta">
                    <p>By: CrimIntel.ai Team</p>
                    <p>Updated: January 2025</p>
                </div>
            </div>
            <hr>
        `)
        // Format the exclusive bonus box
        .replace(/<div style="border: 3px solid #3B82F6[^>]*>([\s\S]*?)<\/div>/g, '<div class="exclusive-bonus">$1</div>')
        // Add page breaks after each major section
        .replace(/(<h2[^>]*>Page \d+:[^<]*<\/h2>)/g, '<hr>$1')
        // Format checkboxes
        .replace(/\[ \]/g, '<input type="checkbox">')
        // Format red flags
        .replace(/🚩/g, '<span class="red-flag">🚩</span>')
        // Add decision matrix class to the comparison table
        .replace(/(<h3[^>]*>Quick Decision Matrix[^<]*<\/h3>[\s\S]*?<table)/m, '<div class="decision-matrix">$1')
        .replace(/(<\/table>[\s\S]*?)<h3/m, '$1</div><h3')
    }
    
    <div class="branding">crimintel.ai</div>
</body>
</html>
`;

// Create the downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// Generate PDF
async function generatePDF() {
    console.log('Starting PDF generation...');
    
    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set content
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        await page.pdf({
            path: path.join(downloadsDir, 'ai-tools-selection-guide-2025.pdf'),
            format: 'Letter',
            margin: {
                top: '1in',
                right: '1in',
                bottom: '1in',
                left: '1in'
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="width: 100%; font-size: 9pt; color: #94A3B8; padding: 0 1in;">
                    <div style="text-align: right;">
                        <span class="pageNumber"></span> | crimintel.ai
                    </div>
                </div>
            `
        });
        
        await browser.close();
        
        console.log('PDF generated successfully!');
        console.log('Location: downloads/ai-tools-selection-guide-2025.pdf');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

// Run the PDF generation
generatePDF();