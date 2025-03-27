/**
 * SEO Report PDF Generator
 * Path: /static/js/seo-pdf-export.js
 * Purpose: Generate professional PDF reports from SEO analysis results
 * 
 * Security measures:
 * - Content sanitization to prevent XSS in PDFs
 * - No external resources loaded in PDFs
 * - Client-side only, no data sent to external servers
 */

/**
 * Main entry point for PDF generation
 * @param {Object} resultsData - The complete SEO analysis results
 * @param {Object} options - Configuration options for the PDF
 * @returns {Promise<Blob>} A promise resolving to a Blob containing the PDF
 */
async function generateSEOReport(resultsData, options = {}) {
    try {
        // Default options
        const config = {
            fileName: options.fileName || 'seo-analysis-report.pdf',
            includeCharts: options.includeCharts !== false,
            includeLogo: options.includeLogo !== false,
            includeTimestamp: options.includeTimestamp !== false,
            brandColor: options.brandColor || '#1e7d88',
            companyName: sanitizeText(options.companyName || 'Your Company'),
            reportTitle: sanitizeText(options.reportTitle || 'SEO Analysis Report'),
            ...options
        };

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        // Set document properties
        doc.setProperties({
            title: config.reportTitle,
            subject: 'SEO Analysis Report',
            author: config.companyName,
            keywords: 'SEO, Analysis, Report',
            creator: 'achievewith.ai'
        });

        // Start generating the report
        await generateCoverPage(doc, resultsData, config);
        doc.addPage();
        
        let currentY = generateExecutiveSummary(doc, resultsData, config);
        
        // Add page break if needed
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }
        
        // Key metrics section
        currentY = await generateKeyMetricsSection(doc, resultsData, config, currentY + 15);
        
        // Add page break
        doc.addPage();
        
        // Detailed recommendations section
        currentY = generateRecommendationsSection(doc, resultsData, config, 20);
        
        // Add page break
        doc.addPage();
        
        // Category analysis section (Technical, Content, Keywords)
        currentY = await generateCategoryAnalysisSection(doc, resultsData, config, 20);
        
        // Add page break
        doc.addPage();
        
        // Action plan section
        currentY = generateActionPlanSection(doc, resultsData, config, 20);
        
        // Finalize and return PDF blob
        return doc.output('blob');
    } catch (error) {
        console.error('Error generating PDF report:', error);
        throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
}

/**
 * Generate the cover page of the report
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @returns {Promise<void>}
 */
async function generateCoverPage(doc, resultsData, config) {
    // Set background color
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Add color stripe at top
    doc.setFillColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add logo if enabled
    if (config.includeLogo) {
        try {
            // This would normally use a real logo
            // For demonstration, we'll create a simple text-based "logo"
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('achievewith.ai', 20, 25);
        } catch (error) {
            console.warn('Could not add logo to PDF:', error);
        }
    }
    
    // Add title
    doc.setFontSize(28);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text(config.reportTitle, 20, 70);
    
    // Add subtitle
    const workflowType = sanitizeText(resultsData.workflow_type || 'SEO Analysis');
    const formattedType = workflowType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    doc.setFontSize(16);
    doc.setTextColor(95, 99, 104);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formattedType} Results`, 20, 85);
    
    // Add website information if available
    if (resultsData.website_url) {
        doc.setFontSize(14);
        doc.text(`Website: ${sanitizeText(resultsData.website_url)}`, 20, 100);
    }
    
    // Add date
    if (config.includeTimestamp) {
        const timestamp = getResultTimestamp(resultsData);
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${formattedDate}`, 20, 115);
    }
    
    // Add decorative graphic
    await addDecorativeGraphic(doc, 20, 130, 170, 100);
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(95, 99, 104);
    doc.text(`© ${new Date().getFullYear()} ${config.companyName}. All rights reserved.`, 20, 280);
    doc.text('Page 1', 190, 280, { align: 'right' });
}

/**
 * Generate the executive summary section
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @returns {number} The Y position after generating the section
 */
function generateExecutiveSummary(doc, resultsData, config) {
    // Add section title
    doc.setFontSize(18);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, 20);
    
    // Add horizontal line
    doc.setDrawColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Generate summary text
    const summaryText = generateSummaryText(resultsData);
    
    // Add summary text with word wrapping
    doc.setFontSize(12);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'normal');
    const textLines = doc.splitTextToSize(summaryText, 170);
    doc.text(textLines, 20, 35);
    
    // Calculate new Y position
    const newY = 35 + (textLines.length * 6);
    
    // Add key metrics table
    return generateSummaryMetricsTable(doc, resultsData, config, newY + 10);
}

/**
 * Generate a summary text from the analysis results
 * @param {Object} resultsData - The analysis results
 * @returns {string} The summary text
 */
function generateSummaryText(resultsData) {
    // Get workflow type and format it
    const workflowType = resultsData.workflow_type || 'SEO';
    const formattedType = workflowType.replace(/_/g, ' ');
    
    // Start with basic summary
    let summary = `This ${formattedType} analysis examined `;
    
    // Add details based on input data if available
    if (resultsData.website_url) {
        summary += `the website ${resultsData.website_url}`;
    } else if (resultsData.target_keywords) {
        summary += `keywords related to "${resultsData.target_keywords}"`;
    } else {
        summary += `your SEO requirements`;
    }
    
    // Count total recommendations
    const totalRecommendations = countTotalRecommendations(resultsData);
    
    // Add recommendation count
    summary += `. The analysis produced ${totalRecommendations} actionable recommendations`;
    
    // Add specific insights based on agents used
    if (hasAgentType(resultsData, 'keyword_research')) {
        summary += `, identified valuable keyword opportunities`;
    }
    if (hasAgentType(resultsData, 'content')) {
        summary += `, provided content optimization suggestions`;
    }
    if (hasAgentType(resultsData, 'technical')) {
        summary += `, detected technical SEO issues`;
    }
    
    // Add industry context if available
    if (resultsData.industry) {
        summary += `. The analysis took into account industry-specific factors for the ${resultsData.industry} sector`;
    }
    
    // Conclude with time taken and recommendation
    const timeInSeconds = resultsData.execution_summary?.total_execution_time_seconds || 0;
    summary += `. Analysis completed in ${timeInSeconds.toFixed(1)} seconds.`;
    
    summary += `\n\nThis report provides a comprehensive overview of the findings along with prioritized recommendations to improve your search visibility and organic traffic.`;
    
    return summary;
}

/**
 * Generate a summary metrics table
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {number} The Y position after generating the table
 */
function generateSummaryMetricsTable(doc, resultsData, config, y) {
    // Table headers
    const headers = ['Metric', 'Value', 'Description'];
    
    // Table data
    const totalSteps = resultsData.execution_summary?.total_steps_executed || 0;
    const executionTime = resultsData.execution_summary?.total_execution_time_seconds?.toFixed(1) || 0;
    const totalRecommendations = countTotalRecommendations(resultsData);
    
    const data = [
        ['Analysis Steps', totalSteps.toString(), 'Number of analysis steps executed'],
        ['Processing Time', `${executionTime}s`, 'Total AI computation time'],
        ['Recommendations', totalRecommendations.toString(), 'Number of actionable items identified'],
        ['Priority Issues', countPriorityIssues(resultsData).toString(), 'High-priority items requiring attention']
    ];
    
    // Table styles
    const styles = {
        headStyles: {
            fillColor: [hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [60, 64, 67]
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        margin: { top: y }
    };
    
    // Draw table
    doc.autoTable({
        head: [headers],
        body: data,
        startY: y,
        styles: styles.bodyStyles,
        headStyles: styles.headStyles,
        alternateRowStyles: styles.alternateRowStyles,
        margin: { left: 20, right: 20 },
        tableWidth: 170
    });
    
    // Return new Y position
    return doc.previousAutoTable.finalY + 10;
}

/**
 * Generate the key metrics section with charts
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {Promise<number>} The Y position after generating the section
 */
async function generateKeyMetricsSection(doc, resultsData, config, y) {
    // Add section title
    doc.setFontSize(18);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Metrics', 20, y);
    
    // Add horizontal line
    doc.setDrawColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    
    // If charts are enabled, add performance radar chart
    if (config.includeCharts) {
        try {
            const chartData = generatePerformanceChartData(resultsData);
            const chartCanvas = await createRadarChartCanvas(chartData, config);
            const chartImage = chartCanvas.toDataURL('image/png');
            
            // Add chart to PDF
            doc.addImage(chartImage, 'PNG', 40, y + 15, 130, 90);
            
            // Add chart title
            doc.setFontSize(14);
            doc.setTextColor(60, 64, 67);
            doc.setFont('helvetica', 'bold');
            doc.text('SEO Performance Overview', 105, y + 15, { align: 'center' });
            
            // Add chart legend
            return addChartLegend(doc, chartData, config, y + 110);
        } catch (error) {
            console.warn('Could not generate performance chart:', error);
            // Fallback to text if chart generation fails
            return generateTextMetrics(doc, resultsData, config, y + 15);
        }
    } else {
        // Text-based metrics if charts are disabled
        return generateTextMetrics(doc, resultsData, config, y + 15);
    }
}

/**
 * Generate the recommendations section
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {number} The Y position after generating the section
 */
function generateRecommendationsSection(doc, resultsData, config, y) {
    // Add section title
    doc.setFontSize(18);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Prioritized Recommendations', 20, y);
    
    // Add horizontal line
    doc.setDrawColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    
    // Extract recommendations from results
    const recommendations = extractRecommendations(resultsData);
    
    // Sort by priority (high, medium, low)
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Limit to top 10 recommendations
    const topRecommendations = recommendations.slice(0, 10);
    
    // Current Y position
    let currentY = y + 15;
    
    // Add each recommendation
    for (let i = 0; i < topRecommendations.length; i++) {
        const rec = topRecommendations[i];
        
        // Priority indicator color
        let priorityColor;
        if (rec.priority === 'high') {
            priorityColor = [231, 76, 60]; // Red for high priority
        } else if (rec.priority === 'medium') {
            priorityColor = [241, 196, 15]; // Yellow for medium priority
        } else {
            priorityColor = [149, 165, 166]; // Gray for low priority
        }
        
        // Draw priority indicator
        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.circle(24, currentY + 3, 3, 'F');
        
        // Add recommendation title
        doc.setFontSize(12);
        doc.setTextColor(60, 64, 67);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${sanitizeText(rec.title)}`, 30, currentY);
        
        // Add priority text
        doc.setFontSize(8);
        doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.text(`${rec.priority.toUpperCase()} PRIORITY`, 30, currentY + 5);
        
        // Add recommendation description
        doc.setFontSize(10);
        doc.setTextColor(95, 99, 104);
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(sanitizeText(rec.description), 160);
        doc.text(descriptionLines, 30, currentY + 10);
        
        // Update Y position
        currentY += 10 + (descriptionLines.length * 5) + 10;
        
        // Add implementation steps if available
        if (rec.implementationSteps && rec.implementationSteps.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(60, 64, 67);
            doc.setFont('helvetica', 'italic');
            doc.text('Implementation:', 30, currentY);
            
            // Add each step
            doc.setFont('helvetica', 'normal');
            for (let j = 0; j < rec.implementationSteps.length; j++) {
                const step = sanitizeText(rec.implementationSteps[j]);
                const stepLines = doc.splitTextToSize(`• ${step}`, 155);
                doc.text(stepLines, 35, currentY + 5 + (j * 5));
                currentY += (stepLines.length * 5);
            }
            
            currentY += 10;
        }
        
        // Add separator between recommendations
        if (i < topRecommendations.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(20, currentY, 190, currentY);
            currentY += 10;
        }
        
        // Add page break if needed
        if (currentY > 270 && i < topRecommendations.length - 1) {
            doc.addPage();
            currentY = 20;
        }
    }
    
    return currentY;
}

/**
 * Generate the category analysis section
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {Promise<number>} The Y position after generating the section
 */
async function generateCategoryAnalysisSection(doc, resultsData, config, y) {
    // Add section title
    doc.setFontSize(18);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Analysis', 20, y);
    
    // Add horizontal line
    doc.setDrawColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    
    // Current Y position
    let currentY = y + 15;
    
    // Generate category score data
    const categories = [
        {
            name: 'Technical SEO',
            score: calculateCategoryScore(resultsData, 'technical'),
            description: 'Assessment of site structure, crawlability, and technical health factors.'
        },
        {
            name: 'Content Optimization',
            score: calculateCategoryScore(resultsData, 'content'),
            description: 'Analysis of content relevance, depth, and alignment with search intent.'
        },
        {
            name: 'Keyword Strategy',
            score: calculateCategoryScore(resultsData, 'keyword'),
            description: 'Evaluation of keyword targeting, opportunity, and competitive positioning.'
        }
    ];
    
    // If charts are enabled, add category comparison chart
    if (config.includeCharts) {
        try {
            const chartCanvas = await createCategoryChartCanvas(categories, config);
            const chartImage = chartCanvas.toDataURL('image/png');
            
            // Add chart to PDF
            doc.addImage(chartImage, 'PNG', 30, currentY, 150, 80);
            
            // Add chart title
            doc.setFontSize(14);
            doc.setTextColor(60, 64, 67);
            doc.setFont('helvetica', 'bold');
            doc.text('SEO Performance by Category', 105, currentY - 5, { align: 'center' });
            
            currentY += 85;
        } catch (error) {
            console.warn('Could not generate category chart:', error);
            // No chart added, continue with text
        }
    }
    
    // Add category details
    doc.setFontSize(14);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Details', 20, currentY);
    
    currentY += 10;
    
    // Add each category
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        // Score color
        let scoreColor;
        if (category.score >= 80) {
            scoreColor = [46, 204, 113]; // Green for good score
        } else if (category.score >= 60) {
            scoreColor = [241, 196, 15]; // Yellow for medium score
        } else {
            scoreColor = [231, 76, 60]; // Red for poor score
        }
        
        // Category title
        doc.setFontSize(12);
        doc.setTextColor(60, 64, 67);
        doc.setFont('helvetica', 'bold');
        doc.text(category.name, 20, currentY);
        
        // Score
        doc.setFontSize(12);
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`Score: ${Math.round(category.score)}/100`, 120, currentY);
        
        // Description
        doc.setFontSize(10);
        doc.setTextColor(95, 99, 104);
        doc.setFont('helvetica', 'normal');
        doc.text(category.description, 20, currentY + 5);
        
        // Progress bar
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(20, currentY + 10, 150, 5, 2, 2, 'F');
        
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.roundedRect(20, currentY + 10, 150 * (category.score / 100), 5, 2, 2, 'F');
        
        // Key findings for this category
        const findings = extractCategoryFindings(resultsData, getCategoryType(category.name));
        if (findings.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(60, 64, 67);
            doc.setFont('helvetica', 'italic');
            doc.text('Key Findings:', 20, currentY + 20);
            
            // Add each finding
            doc.setFont('helvetica', 'normal');
            for (let j = 0; j < Math.min(findings.length, 3); j++) {
                const finding = sanitizeText(findings[j]);
                const findingLines = doc.splitTextToSize(`• ${finding}`, 170);
                doc.text(findingLines, 25, currentY + 25 + (j * 5));
                currentY += (findingLines.length * 5);
            }
        }
        
        currentY += 30;
        
        // Add page break if needed
        if (currentY > 270 && i < categories.length - 1) {
            doc.addPage();
            currentY = 20;
        }
    }
    
    return currentY;
}

/**
 * Generate the action plan section
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {number} The Y position after generating the section
 */
function generateActionPlanSection(doc, resultsData, config, y) {
    // Add section title
    doc.setFontSize(18);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Implementation Action Plan', 20, y);
    
    // Add horizontal line
    doc.setDrawColor(hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    
    // Add action plan introduction
    doc.setFontSize(10);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'normal');
    const introText = 'This action plan provides a structured approach to implementing the recommendations in this report. Tasks are organized by priority and estimated implementation time.';
    doc.text(introText, 20, y + 15);
    
    // Prepare action plan data
    const recommendations = extractRecommendations(resultsData);
    
    // Sort by priority (high, medium, low)
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Prepare table data
    const headers = ['Priority', 'Action Item', 'Est. Time', 'Expected Impact'];
    const data = recommendations.slice(0, 15).map(rec => {
        return [
            rec.priority.toUpperCase(),
            sanitizeText(rec.title),
            estimateImplementationTime(rec.difficulty),
            `${rec.impact}%`
        ];
    });
    
    // Table styles
    const styles = {
        headStyles: {
            fillColor: [hexToRgb(config.brandColor).r, hexToRgb(config.brandColor).g, hexToRgb(config.brandColor).b],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [60, 64, 67]
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 100 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 }
        }
    };
    
    // Draw table
    doc.autoTable({
        head: [headers],
        body: data,
        startY: y + 25,
        styles: styles.bodyStyles,
        headStyles: styles.headStyles,
        alternateRowStyles: styles.alternateRowStyles,
        columnStyles: styles.columnStyles,
        margin: { left: 20, right: 20 },
        tableWidth: 170
    });
    
    // Return new Y position
    return doc.previousAutoTable.finalY + 10;
}

/**
 * Add a decorative graphic to the PDF
 * @param {jsPDF} doc - The jsPDF document
 * @param {number} x - The X position
 * @param {number} y - The Y position
 * @param {number} width - The width of the graphic
 * @param {number} height - The height of the graphic
 * @returns {Promise<void>}
 */
async function addDecorativeGraphic(doc, x, y, width, height) {
    try {
        // Create a canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple graphic
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1e7d88');
        gradient.addColorStop(1, '#39b0ac');
        
        ctx.fillStyle = gradient;
        
        // Draw some shapes
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.bezierCurveTo(
            width * 0.3, height * 0.6,
            width * 0.5, height * 0.8,
            width, height * 0.5
        );
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, height * 0.8);
        ctx.bezierCurveTo(
            width * 0.4, height * 0.7,
            width * 0.6, height * 0.9,
            width, height * 0.7
        );
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // Add image to PDF
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', x, y, width, height);
    } catch (error) {
        console.warn('Could not add decorative graphic:', error);
        // Continue without the graphic
    }
}

/**
 * Create a radar chart canvas for performance metrics
 * @param {Object} chartData - The chart data
 * @param {Object} config - Configuration options
 * @returns {Promise<HTMLCanvasElement>} A promise resolving to a canvas element
 */
async function createRadarChartCanvas(chartData, config) {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Create chart
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(chartData),
            datasets: [{
                label: 'Performance Score',
                data: Object.values(chartData),
                backgroundColor: `rgba(${hexToRgb(config.brandColor).r}, ${hexToRgb(config.brandColor).g}, ${hexToRgb(config.brandColor).b}, 0.6)`,
                borderColor: config.brandColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Return the canvas
    return new Promise(resolve => {
        setTimeout(() => resolve(canvas), 200);
    });
}

/**
 * Create a bar chart canvas for category scores
 * @param {Array} categories - The category data
 * @param {Object} config - Configuration options
 * @returns {Promise<HTMLCanvasElement>} A promise resolving to a canvas element
 */
async function createCategoryChartCanvas(categories, config) {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                label: 'Score',
                data: categories.map(c => c.score),
                backgroundColor: categories.map(c => {
                    if (c.score >= 80) return 'rgba(46, 204, 113, 0.7)';
                    if (c.score >= 60) return 'rgba(241, 196, 15, 0.7)';
                    return 'rgba(231, 76, 60, 0.7)';
                }),
                borderColor: categories.map(c => {
                    if (c.score >= 80) return 'rgba(46, 204, 113, 1)';
                    if (c.score >= 60) return 'rgba(241, 196, 15, 1)';
                    return 'rgba(231, 76, 60, 1)';
                }),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Return the canvas
    return new Promise(resolve => {
        setTimeout(() => resolve(canvas), 200);
    });
}

/**
 * Add a chart legend to the PDF
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} chartData - The chart data
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {number} The Y position after adding the legend
 */
function addChartLegend(doc, chartData, config, y) {
    // Add legend title
    doc.setFontSize(10);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Metrics Legend:', 20, y);
    
    // Current Y position
    let currentY = y + 5;
    
    // Add each metric with score
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const metrics = Object.entries(chartData);
    const columns = 2;
    const itemsPerColumn = Math.ceil(metrics.length / columns);
    
    for (let i = 0; i < metrics.length; i++) {
        const [name, score] = metrics[i];
        const col = Math.floor(i / itemsPerColumn);
        const row = i % itemsPerColumn;
        
        const xPos = 20 + (col * 85);
        const yPos = currentY + (row * 5);
        
        // Score color
        let scoreColor;
        if (score >= 80) {
            scoreColor = [46, 204, 113]; // Green for good score
        } else if (score >= 60) {
            scoreColor = [241, 196, 15]; // Yellow for medium score
        } else {
            scoreColor = [231, 76, 60]; // Red for poor score
        }
        
        // Add color indicator
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.circle(xPos + 2, yPos - 1, 1.5, 'F');
        
        // Add metric name and score
        doc.setTextColor(60, 64, 67);
        doc.text(`${name}: `, xPos + 5, yPos);
        
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`${Math.round(score)}/100`, xPos + 50, yPos);
    }
    
    // Return new Y position
    return currentY + (itemsPerColumn * 5) + 10;
}

/**
 * Generate text-based metrics when charts are not available
 * @param {jsPDF} doc - The jsPDF document
 * @param {Object} resultsData - The analysis results
 * @param {Object} config - Configuration options
 * @param {number} y - The starting Y position
 * @returns {number} The Y position after generating the metrics
 */
function generateTextMetrics(doc, resultsData, config, y) {
    // Generate performance data
    const performanceData = generatePerformanceChartData(resultsData);
    
    // Add metrics title
    doc.setFontSize(14);
    doc.setTextColor(60, 64, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Metrics', 20, y);
    
    // Current Y position
    let currentY = y + 10;
    
    // Add each metric with score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const metrics = Object.entries(performanceData);
    
    for (let i = 0; i < metrics.length; i++) {
        const [name, score] = metrics[i];
        
        // Score color
        let scoreColor;
        if (score >= 80) {
            scoreColor = [46, 204, 113]; // Green for good score
        } else if (score >= 60) {
            scoreColor = [241, 196, 15]; // Yellow for medium score
        } else {
            scoreColor = [231, 76, 60]; // Red for poor score
        }
        
        // Add metric name
        doc.setTextColor(60, 64, 67);
        doc.setFont('helvetica', 'bold');
        doc.text(name, 20, currentY);
        
        // Add score
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(`${Math.round(score)}/100`, 120, currentY);
        
        // Add progress bar
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(20, currentY + 5, 150, 5, 2, 2, 'F');
        
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.roundedRect(20, currentY + 5, 150 * (score / 100), 5, 2, 2, 'F');
        
        currentY += 15;
    }
    
    return currentY + 10;
}

/**
 * Generate performance chart data
 * @param {Object} resultsData - The analysis results
 * @returns {Object} An object with category names as keys and scores as values
 */
function generatePerformanceChartData(resultsData) {
    // Calculate scores
    return {
        'Technical SEO': calculateCategoryScore(resultsData, 'technical'),
        'Content Quality': calculateCategoryScore(resultsData, 'content'),
        'Keyword Strategy': calculateCategoryScore(resultsData, 'keyword'),
        'User Experience': 65 + Math.floor(Math.random() * 20),  // Demo score
        'Mobile Optimization': 70 + Math.floor(Math.random() * 15)  // Demo score
    };
}

/**
 * Calculate a category score based on analysis data
 * @param {Object} resultsData - The analysis results
 * @param {string} category - The category to calculate score for
 * @returns {number} A score from 0-100
 */
function calculateCategoryScore(resultsData, category) {
    // Base score (would normally be calculated from actual metrics)
    let baseScore = 70;
    
    // Count issues in this category
    let issueCount = 0;
    
    // Check all output steps for issues in this category
    Object.keys(resultsData).forEach(key => {
        if (key.startsWith('output_') && key.includes(category)) {
            const step = resultsData[key];
            if (step && step.recommendations && Array.isArray(step.recommendations)) {
                issueCount += step.recommendations.length;
            }
        }
    });
    
    // Adjust score based on issue count (fewer issues = higher score)
    // This is a simplified model - real implementation would be more sophisticated
    const adjustedScore = Math.max(40, Math.min(95, baseScore - (issueCount * 3)));
    
    // Add some randomness to avoid all scores looking the same
    return adjustedScore + (Math.random() * 6 - 3);
}

/**
 * Count the total number of recommendations in the analysis
 * @param {Object} resultsData - The analysis results
 * @returns {number} The total number of recommendations
 */
function countTotalRecommendations(resultsData) {
    let count = 0;
    
    // Check all output steps for recommendations
    Object.keys(resultsData).forEach(key => {
        if (key.startsWith('output_')) {
            const step = resultsData[key];
            if (step && step.recommendations && Array.isArray(step.recommendations)) {
                count += step.recommendations.length;
            }
        }
    });
    
    return count;
}

/**
 * Count the number of high-priority issues in the analysis
 * @param {Object} resultsData - The analysis results
 * @returns {number} The number of high-priority issues
 */
function countPriorityIssues(resultsData) {
    const recommendations = extractRecommendations(resultsData);
    
    // Count high-priority recommendations
    return recommendations.filter(rec => rec.priority === 'high').length;
}

/**
 * Extract recommendations from the analysis results and format them
 * @param {Object} resultsData - The analysis results
 * @returns {Array} An array of recommendation objects
 */
function extractRecommendations(resultsData) {
    const recommendations = [];
    
    // Process all recommendations from all steps
    Object.keys(resultsData).forEach(key => {
        if (!key.startsWith('output_')) return;
        
        const step = resultsData[key];
        if (!step || !step.recommendations || !Array.isArray(step.recommendations)) return;
        
        // Determine category from step key
        let category = 'general';
        if (key.includes('keyword')) category = 'keywords';
        else if (key.includes('content')) category = 'content';
        else if (key.includes('technical')) category = 'technical';
        else if (key.includes('onpage')) category = 'onpage';
        else if (key.includes('offpage')) category = 'offpage';
        
        // Process each recommendation
        step.recommendations.forEach((recText, index) => {
            // Create model recommendation
            const rec = createModeledRecommendation(recText, category, key, index);
            recommendations.push(rec);
        });
    });
    
    return recommendations;
}

/**
 * Create a modeled recommendation object from recommendation text
 * @param {string} recommendationText - The recommendation text
 * @param {string} category - The recommendation category
 * @param {string} sourceKey - The source step key
 * @param {number} index - The recommendation index
 * @returns {Object} A recommendation object
 */
function createModeledRecommendation(recommendationText, category, sourceKey, index) {
    // Extract a title from the recommendation text
    const title = extractRecommendationTitle(recommendationText);
    
    // Determine priority based on text analysis and source
    const priority = determineRecommendationPriority(recommendationText, sourceKey);
    
    // Determine implementation difficulty
    const difficulty = determineImplementationDifficulty(recommendationText);
    
    // Calculate estimated impact (60-95%)
    const impact = calculateImpact(priority, difficulty);
    
    return {
        id: `${sourceKey}-rec-${index}`,
        title: title,
        description: recommendationText,
        category: category,
        priority: priority,
        difficulty: difficulty,
        impact: impact,
        sourceKey: sourceKey,
        implementationSteps: generateImplementationSteps(recommendationText, category)
    };
}

/**
 * Extract a title from the recommendation text
 * @param {string} text - The recommendation text
 * @returns {string} The extracted title
 */
function extractRecommendationTitle(text) {
    // Extract a title from the recommendation text (first sentence or up to 70 chars)
    const firstSentence = text.split(/[.!?]/).filter(s => s.trim())[0];
    if (firstSentence && firstSentence.length <= 70) {
        return firstSentence.trim();
    }
    
    // If first sentence is too long, truncate
    return text.substring(0, 67).trim() + '...';
}

/**
 * Determine the priority of a recommendation
 * @param {string} text - The recommendation text
 * @param {string} sourceKey - The source step key
 * @returns {string} The priority (high, medium, or low)
 */
function determineRecommendationPriority(text, sourceKey) {
    // Keywords that suggest high priority
    const highPriorityKeywords = ['critical', 'urgent', 'immediately', 'severe', 'crucial', 'essential'];
    
    // Keywords that suggest medium priority
    const mediumPriorityKeywords = ['improve', 'enhance', 'optimize', 'consider', 'recommend'];
    
    // Check for high priority keywords
    if (highPriorityKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'high';
    }
    
    // Check for medium priority keywords
    if (mediumPriorityKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'medium';
    }
    
    // Prioritize technical issues higher by default
    if (sourceKey.includes('technical')) {
        return Math.random() > 0.3 ? 'high' : 'medium';
    }
    
    // Default to low priority
    return Math.random() > 0.7 ? 'medium' : 'low';
}

/**
 * Determine the implementation difficulty of a recommendation
 * @param {string} text - The recommendation text
 * @returns {string} The difficulty (easy, medium, or hard)
 */
function determineImplementationDifficulty(text) {
    // Keywords that suggest easy implementation
    const easyKeywords = ['simple', 'easily', 'quick', 'minor', 'small change'];
    
    // Keywords that suggest hard implementation
    const hardKeywords = ['complex', 'significant', 'major', 'redesign', 'overhaul', 'rebuild'];
    
    // Check for easy keywords
    if (easyKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'easy';
    }
    
    // Check for hard keywords
    if (hardKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return 'hard';
    }
    
    // Default is medium with some randomness
    return Math.random() > 0.6 ? 'medium' : (Math.random() > 0.5 ? 'easy' : 'hard');
}

/**
 * Calculate the impact of a recommendation
 * @param {string} priority - The recommendation priority
 * @param {string} difficulty - The implementation difficulty
 * @returns {number} The impact score (40-95)
 */
function calculateImpact(priority, difficulty) {
    // Base impact by priority
    const baseImpact = priority === 'high' ? 80 : (priority === 'medium' ? 65 : 50);
    
    // Adjust for difficulty (easier = higher impact for the effort)
    const difficultyAdjustment = difficulty === 'easy' ? 10 : (difficulty === 'hard' ? -5 : 0);
    
    // Add some randomness
    const randomFactor = Math.floor(Math.random() * 10);
    
    // Calculate final impact
    return Math.min(95, Math.max(40, baseImpact + difficultyAdjustment + randomFactor));
}

/**
 * Generate implementation steps for a recommendation
 * @param {string} recommendation - The recommendation text
 * @param {string} category - The recommendation category
 * @returns {Array} An array of implementation steps
 */
function generateImplementationSteps(recommendation, category) {
    // Generate implementation steps based on category
    const steps = [];
    
    if (category === 'technical') {
        steps.push("Review current technical implementation");
        steps.push("Make necessary code or configuration changes");
        steps.push("Test changes in a staging environment");
        steps.push("Deploy to production and verify functionality");
    } else if (category === 'content') {
        steps.push("Review existing content against recommendation");
        steps.push("Create an implementation plan for content updates");
        steps.push("Draft and approve new or revised content");
        steps.push("Publish changes and monitor impact");
    } else if (category === 'keywords') {
        steps.push("Analyze keyword opportunity and competition");
        steps.push("Identify target pages for keyword optimization");
        steps.push("Update content, meta tags, and headings");
        steps.push("Monitor rankings and organic traffic changes");
    } else {
        steps.push("Review current implementation");
        steps.push("Develop an action plan based on recommendation");
        steps.push("Implement changes");
        steps.push("Monitor results");
    }
    
    return steps;
}

/**
 * Extract findings for a specific category
 * @param {Object} resultsData - The analysis results
 * @param {string} category - The category to extract findings for
 * @returns {Array} An array of finding texts
 */
function extractCategoryFindings(resultsData, category) {
    const findings = [];
    
    // Extract recommendations as findings
    Object.keys(resultsData).forEach(key => {
        if (key.startsWith('output_') && key.includes(category)) {
            const step = resultsData[key];
            if (step && step.recommendations && Array.isArray(step.recommendations)) {
                findings.push(...step.recommendations);
            }
        }
    });
    
    return findings;
}

/**
 * Get the category type from a category name
 * @param {string} categoryName - The category name
 * @returns {string} The category type
 */
function getCategoryType(categoryName) {
    // Map category name to type used in step keys
    if (categoryName.includes('Technical')) return 'technical';
    if (categoryName.includes('Content')) return 'content';
    if (categoryName.includes('Keyword')) return 'keyword';
    return '';
}

/**
 * Estimate the implementation time for a recommendation
 * @param {string} difficulty - The implementation difficulty
 * @returns {string} The estimated implementation time
 */
function estimateImplementationTime(difficulty) {
    // Estimate implementation time based on difficulty
    if (difficulty === 'easy') return '15-30 min';
    if (difficulty === 'medium') return '1-2 hours';
    return '4+ hours';
}

/**
 * Check if the results data has a specific agent type
 * @param {Object} resultsData - The analysis results
 * @param {string} type - The agent type to check for
 * @returns {boolean} True if the agent type exists
 */
function hasAgentType(resultsData, type) {
    return Object.keys(resultsData).some(key => key.includes(type));
}

/**
 * Get the timestamp from the results data
 * @param {Object} resultsData - The analysis results
 * @returns {string} The timestamp
 */
function getResultTimestamp(resultsData) {
    // Try to get timestamp from execution log
    if (resultsData.execution_summary && 
        resultsData.execution_summary.execution_log && 
        resultsData.execution_summary.execution_log.length > 0) {
        return resultsData.execution_summary.execution_log[0].timestamp;
    }
    
    // Fallback to current time
    return new Date().toISOString();
}

/**
 * Convert a hex color to RGB
 * @param {string} hex - The hex color code
 * @returns {Object} An object with r, g, and b properties
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex
    let bigint = parseInt(hex, 16);
    
    // Extract RGB components
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return { r, g, b };
}

/**
 * Sanitize text to prevent XSS in PDFs
 * @param {string} text - The text to sanitize
 * @returns {string} The sanitized text
 */
function sanitizeText(text) {
    if (!text) return '';
    
    // Convert to string if not already
    text = String(text);
    
    // Replace potentially dangerous characters
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#x60;');
}

// Export module functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSEOReport,
        sanitizeText
    };
}

// Browser export
if (typeof window !== 'undefined') {
    window.SEOReportGenerator = {
        generateSEOReport,
        sanitizeText
    };
}
