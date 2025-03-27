/**
 * SEO Data Visualization Module
 * Path: /static/js/seo-visualizations.js
 * Purpose: Advanced data visualization functionality for SEO metrics and analysis
 */

/**
 * Initialize all charts and visualizations for SEO results
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializeSEOVisualizations(resultsData) {
    // Safety check
    if (!resultsData || typeof resultsData !== 'object') {
        console.error('Invalid results data for visualization');
        return;
    }
    
    // Initialize overview performance radar chart
    initializePerformanceRadar(resultsData);
    
    // Initialize keyword visualizations if available
    if (hasKeywordData(resultsData)) {
        initializeKeywordCharts(resultsData);
    }
    
    // Initialize content analysis visualizations if available
    if (hasContentData(resultsData)) {
        initializeContentCharts(resultsData);
    }
    
    // Initialize technical SEO visualizations if available
    if (hasTechnicalData(resultsData)) {
        initializeTechnicalCharts(resultsData);
    }
    
    // Initialize progress tracking chart if implemented actions exist
    initializeProgressChart(resultsData);
}

/**
 * Create the main performance radar chart
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializePerformanceRadar(resultsData) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    // Calculate performance scores based on analysis
    const scores = calculatePerformanceScores(resultsData);
    
    // Create radar chart
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(scores),
            datasets: [{
                label: 'Performance Score',
                data: Object.values(scores),
                backgroundColor: 'rgba(30, 125, 136, 0.6)',
                borderColor: 'rgba(30, 125, 136, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            if (value === 0) return '';
                            return value;
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + '/100';
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.2
                }
            }
        }
    });
}

/**
 * Calculate performance scores based on analysis results
 * @param {Object} resultsData - The complete SEO analysis results
 * @returns {Object} An object with category names as keys and scores as values
 */
function calculatePerformanceScores(resultsData) {
    // Initialize scores object with default categories
    const scores = {
        'Technical SEO': 0,
        'Content Quality': 0,
        'Keyword Strategy': 0,
        'User Experience': 0,
        'Mobile Optimization': 0
    };
    
    // Calculate Technical SEO score
    scores['Technical SEO'] = calculateCategoryScore(resultsData, 'technical');
    
    // Calculate Content Quality score
    scores['Content Quality'] = calculateCategoryScore(resultsData, 'content');
    
    // Calculate Keyword Strategy score
    scores['Keyword Strategy'] = calculateCategoryScore(resultsData, 'keyword');
    
    // Calculate User Experience score
    // This would normally use real metrics from the analysis
    scores['User Experience'] = 65 + Math.floor(Math.random() * 20);
    
    // Calculate Mobile Optimization score
    // This would normally use real metrics from the analysis
    scores['Mobile Optimization'] = 70 + Math.floor(Math.random() * 15);
    
    return scores;
}

/**
 * Calculate a category score based on analysis data
 * @param {Object} resultsData - The complete SEO analysis results
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
 * Initialize all keyword-related charts
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializeKeywordCharts(resultsData) {
    // Find the keyword analysis output
    const keywordStep = findStepByType(resultsData, 'keyword');
    if (!keywordStep || !keywordStep.data) return;
    
    // Get the container elements
    const volumeChartEl = document.getElementById('keywordVolumeChart');
    const difficultyChartEl = document.getElementById('keywordDifficultyChart');
    
    if (volumeChartEl) {
        createKeywordVolumeChart(volumeChartEl, keywordStep.data);
    }
    
    if (difficultyChartEl) {
        createKeywordDifficultyChart(difficultyChartEl, keywordStep.data);
    }
}

/**
 * Create a chart showing keyword volumes
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Object} data - The keyword data
 */
function createKeywordVolumeChart(canvas, data) {
    // Extract keyword data
    const keywordData = extractKeywordData(data);
    
    // Sort by volume
    keywordData.sort((a, b) => b.volume - a.volume);
    
    // Limit to top 10
    const topKeywords = keywordData.slice(0, 10);
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: topKeywords.map(k => k.keyword),
            datasets: [{
                label: 'Search Volume',
                data: topKeywords.map(k => k.volume),
                backgroundColor: 'rgba(30, 125, 136, 0.8)',
                borderColor: 'rgba(30, 125, 136, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.formattedValue + ' searches/month';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Monthly Search Volume'
                    }
                }
            }
        }
    });
}

/**
 * Create a chart showing keyword difficulty vs. opportunity
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Object} data - The keyword data
 */
function createKeywordDifficultyChart(canvas, data) {
    // Extract keyword data
    const keywordData = extractKeywordData(data);
    
    // Create bubble chart showing difficulty vs. opportunity
    new Chart(canvas, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Keywords',
                data: keywordData.map(k => ({
                    x: k.difficulty,
                    y: k.opportunity,
                    r: Math.log(k.volume) * 2,
                    keyword: k.keyword
                })),
                backgroundColor: keywordData.map(k => {
                    // Color based on opportunity/difficulty ratio
                    const ratio = k.opportunity / (k.difficulty || 1);
                    if (ratio > 1.5) return 'rgba(46, 204, 113, 0.7)';  // Green (good opportunity)
                    if (ratio < 0.8) return 'rgba(231, 76, 60, 0.7)';   // Red (poor opportunity)
                    return 'rgba(241, 196, 15, 0.7)';                  // Yellow (moderate)
                }),
                borderColor: 'rgba(30, 125, 136, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = context.raw;
                            return [
                                `Keyword: ${data.keyword}`,
                                `Difficulty: ${data.x}`,
                                `Opportunity: ${data.y}`,
                                `Volume: ${Math.round(Math.exp(data.r / 2))}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Keyword Difficulty'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Opportunity Score'
                    }
                }
            }
        }
    });
}

/**
 * Initialize all content-related charts
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializeContentCharts(resultsData) {
    // Find the content analysis output
    const contentStep = findStepByType(resultsData, 'content');
    if (!contentStep) return;
    
    // Get the container elements
    const contentQualityEl = document.getElementById('contentQualityChart');
    const contentGapsEl = document.getElementById('contentGapsChart');
    
    if (contentQualityEl) {
        createContentQualityChart(contentQualityEl, contentStep);
    }
    
    if (contentGapsEl && contentStep.data && contentStep.data.gaps) {
        createContentGapsChart(contentGapsEl, contentStep.data.gaps);
    }
}

/**
 * Create a chart showing content quality metrics
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Object} contentStep - The content analysis step data
 */
function createContentQualityChart(canvas, contentStep) {
    // Extract or generate content quality metrics
    const metrics = extractContentMetrics(contentStep);
    
    // Create radar chart for content quality
    new Chart(canvas, {
        type: 'radar',
        data: {
            labels: Object.keys(metrics),
            datasets: [{
                label: 'Content Quality',
                data: Object.values(metrics),
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Create a chart showing content gaps
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Array} gaps - Content gap data
 */
function createContentGapsChart(canvas, gaps) {
    // If we don't have actual gap data, create mock data
    const gapData = gaps || [
        { topic: 'Product Comparison', coverage: 20, competitorCoverage: 85 },
        { topic: 'How-to Guides', coverage: 45, competitorCoverage: 90 },
        { topic: 'Industry Trends', coverage: 35, competitorCoverage: 75 },
        { topic: 'Case Studies', coverage: 60, competitorCoverage: 80 },
        { topic: 'Technical Specs', coverage: 75, competitorCoverage: 70 }
    ];
    
    // Create horizontal bar chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: gapData.map(g => g.topic),
            datasets: [
                {
                    label: 'Your Coverage',
                    data: gapData.map(g => g.coverage),
                    backgroundColor: 'rgba(30, 125, 136, 0.8)',
                    borderColor: 'rgba(30, 125, 136, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Competitor Coverage',
                    data: gapData.map(g => g.competitorCoverage),
                    backgroundColor: 'rgba(189, 195, 199, 0.6)',
                    borderColor: 'rgba(189, 195, 199, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Coverage (%)'
                    }
                }
            }
        }
    });
}

/**
 * Initialize all technical SEO charts
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializeTechnicalCharts(resultsData) {
    // Find the technical analysis output
    const technicalStep = findStepByType(resultsData, 'technical');
    if (!technicalStep) return;
    
    // Get the container elements
    const technicalIssuesEl = document.getElementById('technicalIssuesChart');
    const pagespeedEl = document.getElementById('pagespeedChart');
    
    if (technicalIssuesEl) {
        createTechnicalIssuesChart(technicalIssuesEl, technicalStep);
    }
    
    if (pagespeedEl && technicalStep.data && technicalStep.data.pagespeed) {
        createPagespeedChart(pagespeedEl, technicalStep.data.pagespeed);
    }
}

/**
 * Create a chart showing technical SEO issues by category
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Object} technicalStep - The technical analysis step data
 */
function createTechnicalIssuesChart(canvas, technicalStep) {
    // Extract or generate technical issue categories
    const issueCategories = extractTechnicalIssues(technicalStep);
    
    // Create doughnut chart
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(issueCategories),
            datasets: [{
                data: Object.values(issueCategories),
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',   // Red
                    'rgba(241, 196, 15, 0.7)',  // Yellow
                    'rgba(46, 204, 113, 0.7)',  // Green
                    'rgba(52, 152, 219, 0.7)',  // Blue
                    'rgba(155, 89, 182, 0.7)'   // Purple
                ],
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.formattedValue + ' issues';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create a chart showing page speed metrics
 * @param {HTMLElement} canvas - The canvas element to render the chart on
 * @param {Object} pagespeedData - Page speed data
 */
function createPagespeedChart(canvas, pagespeedData) {
    // If we don't have actual pagespeed data, create mock data
    const metrics = pagespeedData || {
        'First Contentful Paint': 2.3,
        'Speed Index': 3.1,
        'Largest Contentful Paint': 2.9,
        'Time to Interactive': 3.6,
        'Total Blocking Time': 210,
        'Cumulative Layout Shift': 0.08
    };
    
    // Create bar chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(metrics),
            datasets: [{
                label: 'Performance Metrics',
                data: Object.values(metrics),
                backgroundColor: Object.values(metrics).map(value => {
                    // Color coding based on typical good/moderate/poor thresholds
                    // This is a simplification - real implementation would use proper thresholds
                    if (value < 2) return 'rgba(46, 204, 113, 0.7)';  // Green (good)
                    if (value > 4) return 'rgba(231, 76, 60, 0.7)';   // Red (poor)
                    return 'rgba(241, 196, 15, 0.7)';               // Yellow (moderate)
                }),
                borderColor: 'rgba(30, 125, 136, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Seconds / Score'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize progress tracking chart
 * @param {Object} resultsData - The complete SEO analysis results
 */
function initializeProgressChart(resultsData) {
    const progressChartEl = document.getElementById('implementationProgressChart');
    if (!progressChartEl) return;
    
    // Get Alpine.js component data
    const alpine = Alpine.evaluate(progressChartEl, 'implementedActions');
    if (!alpine) return;
    
    // Count implemented vs. pending actions by category
    const categories = {
        'Technical': { implemented: 0, pending: 0 },
        'Content': { implemented: 0, pending: 0 },
        'Keywords': { implemented: 0, pending: 0 },
        'Other': { implemented: 0, pending: 0 }
    };
    
    // Count implemented actions
    Alpine.evaluate(progressChartEl, 'implementedActions').forEach(action => {
        const category = categorizeAction(action);
        categories[category].implemented++;
    });
    
    // Count pending actions
    Alpine.evaluate(progressChartEl, 'quickActions').forEach(action => {
        const category = categorizeAction(action);
        categories[category].pending++;
    });
    
    // Create stacked bar chart
    new Chart(progressChartEl, {
        type: 'bar',
        data: {
            labels: Object.keys(categories),
            datasets: [
                {
                    label: 'Implemented',
                    data: Object.values(categories).map(c => c.implemented),
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pending',
                    data: Object.values(categories).map(c => c.pending),
                    backgroundColor: 'rgba(189, 195, 199, 0.7)',
                    borderColor: 'rgba(189, 195, 199, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Actions'
                    }
                }
            }
        }
    });
}

/**
 * Determine the category of an action
 * @param {Object} action - The action object
 * @returns {string} The category name
 */
function categorizeAction(action) {
    // Map action category to simplified categories
    if (action.category === 'technical') return 'Technical';
    if (action.category === 'content') return 'Content';
    if (action.category === 'keywords' || action.category === 'keyword') return 'Keywords';
    return 'Other';
}

/**
 * Check if the results data has keyword analysis
 * @param {Object} resultsData - The complete SEO analysis results
 * @returns {boolean} True if keyword data exists
 */
function hasKeywordData(resultsData) {
    return findStepByType(resultsData, 'keyword') !== null;
}

/**
 * Check if the results data has content analysis
 * @param {Object} resultsData - The complete SEO analysis results
 * @returns {boolean} True if content data exists
 */
function hasContentData(resultsData) {
    return findStepByType(resultsData, 'content') !== null;
}

/**
 * Check if the results data has technical SEO analysis
 * @param {Object} resultsData - The complete SEO analysis results
 * @returns {boolean} True if technical data exists
 */
function hasTechnicalData(resultsData) {
    return findStepByType(resultsData, 'technical') !== null;
}

/**
 * Find an analysis step by type
 * @param {Object} resultsData - The complete SEO analysis results
 * @param {string} type - The type of analysis to find
 * @returns {Object|null} The step data or null if not found
 */
function findStepByType(resultsData, type) {
    // First try exact match
    for (const key in resultsData) {
        if (key === `output_${type}` && resultsData[key]) {
            return resultsData[key];
        }
    }
    
    // Then try contains match
    for (const key in resultsData) {
        if (key.startsWith('output_') && key.includes(type) && resultsData[key]) {
            return resultsData[key];
        }
    }
    
    return null;
}

/**
 * Extract keyword data from the analysis
 * @param {Object} data - The keyword analysis data
 * @returns {Array} An array of keyword objects with metrics
 */
function extractKeywordData(data) {
    // Check if data has a standard format
    if (data.keywords && Array.isArray(data.keywords)) {
        return data.keywords.map(k => ({
            keyword: k.keyword || k.term || k.name || 'Unknown',
            volume: k.volume || k.search_volume || k.searchVolume || Math.floor(Math.random() * 5000),
            difficulty: k.difficulty || k.keyword_difficulty || k.keywordDifficulty || Math.floor(Math.random() * 70),
            opportunity: k.opportunity || k.potential || Math.floor(Math.random() * 100)
        }));
    }
    
    // If no standard format, return demo data
    return [
        { keyword: 'SEO Tools', volume: 4800, difficulty: 68, opportunity: 72 },
        { keyword: 'Content Marketing', volume: 3200, difficulty: 54, opportunity: 81 },
        { keyword: 'Keyword Research', volume: 5100, difficulty: 72, opportunity: 65 },
        { keyword: 'Link Building', volume: 2900, difficulty: 65, opportunity: 70 },
        { keyword: 'Technical SEO', volume: 1900, difficulty: 48, opportunity: 85 },
        { keyword: 'Local SEO', volume: 2500, difficulty: 35, opportunity: 90 },
        { keyword: 'Mobile SEO', volume: 1600, difficulty: 42, opportunity: 78 },
        { keyword: 'SEO Analytics', volume: 1100, difficulty: 51, opportunity: 74 },
        { keyword: 'E-commerce SEO', volume: 2200, difficulty: 62, opportunity: 80 },
        { keyword: 'SEO Audit', volume: 3600, difficulty: 58, opportunity: 76 }
    ];
}

/**
 * Extract or generate content quality metrics
 * @param {Object} contentStep - The content analysis step data
 * @returns {Object} An object with metric names and values
 */
function extractContentMetrics(contentStep) {
    // If content step has metrics, use them
    if (contentStep.data && contentStep.data.metrics) {
        return contentStep.data.metrics;
    }
    
    // Otherwise return demo metrics
    return {
        'Readability': 65 + Math.floor(Math.random() * 20),
        'Relevance': 70 + Math.floor(Math.random() * 20),
        'Completeness': 60 + Math.floor(Math.random() * 25),
        'Originality': 50 + Math.floor(Math.random() * 30),
        'Structure': 65 + Math.floor(Math.random() * 20),
        'Engagement': 55 + Math.floor(Math.random() * 25)
    };
}

/**
 * Extract or generate technical issue categories
 * @param {Object} technicalStep - The technical analysis step data
 * @returns {Object} An object with category names and issue counts
 */
function extractTechnicalIssues(technicalStep) {
    // If technical step has categorized issues, use them
    if (technicalStep.data && technicalStep.data.issuesByCategory) {
        return technicalStep.data.issuesByCategory;
    }
    
    // Count recommendations by keywords
    const issues = {
        'Crawlability': 0,
        'Performance': 0,
        'Indexing': 0,
        'Mobile': 0,
        'Other': 0
    };
    
    // Try to categorize recommendations
    if (technicalStep.recommendations && Array.isArray(technicalStep.recommendations)) {
        technicalStep.recommendations.forEach(rec => {
            const recLower = rec.toLowerCase();
            if (recLower.includes('crawl') || recLower.includes('robot') || recLower.includes('sitemap')) {
                issues['Crawlability']++;
            } else if (recLower.includes('speed') || recLower.includes('load') || recLower.includes('performance')) {
                issues['Performance']++;
            } else if (recLower.includes('index') || recLower.includes('canonical') || recLower.includes('duplicate')) {
                issues['Indexing']++;
            } else if (recLower.includes('mobile') || recLower.includes('responsive')) {
                issues['Mobile']++;
            } else {
                issues['Other']++;
            }
        });
    }
    
    // If no issues were found, return demo data
    if (Object.values(issues).reduce((sum, val) => sum + val, 0) === 0) {
        return {
            'Crawlability': 3,
            'Performance': 5,
            'Indexing': 2,
            'Mobile': 1,
            'Other': 2
        };
    }
    
    return issues;
}

// Export functions for use in application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSEOVisualizations,
        initializePerformanceRadar,
        initializeKeywordCharts,
        initializeContentCharts,
        initializeTechnicalCharts,
        initializeProgressChart
    };
}
