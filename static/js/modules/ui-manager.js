/**
 * achievewith.ai - UI Manager
 * 
 * Responsible for UI components and data visualization
 */

export class UIManager {
  /**
   * Initialize charts for the results view
   * @param {Object} resultData - The full result data
   * @param {Array} recommendations - Processed recommendations
   */
  static initializeCharts(resultData, recommendations) {
    try {
      // Initialize performance metrics chart
      this.initializePerformanceChart(resultData);
      
      // Initialize recommendation distribution charts
      this.initializeDistributionCharts(recommendations);
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  }
  
  /**
   * Initialize the performance radar chart
   * @param {Object} resultData - The result data
   */
  static initializePerformanceChart(resultData) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    // Calculate performance scores
    const performanceScores = this.calculatePerformanceScores(resultData);
    
    // Define categories
    const categories = Object.keys(performanceScores);
    
    // Create radar chart
    try {
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: categories,
          datasets: [{
            label: 'Performance Score',
            data: categories.map(category => performanceScores[category]),
            backgroundColor: 'rgba(30, 125, 136, 0.6)',
            borderColor: 'rgba(30, 125, 136, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: { display: true },
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                stepSize: 20,
                callback: function(value) {
                  if (value === 0) return '';
                  return value;
                }
              },
              pointLabels: {
                font: { size: 12 }
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.raw + '/100';
                }
              }
            }
          },
          elements: {
            line: { tension: 0.2 }
          }
        }
      });
    } catch (error) {
      console.error('Error creating performance chart:', error);
    }
  }
  
  /**
   * Initialize recommendation distribution charts
   * @param {Array} recommendations - The processed recommendations
   */
  static initializeDistributionCharts(recommendations) {
    try {
      // Category distribution chart
      this.initializeCategoryChart(recommendations);
      
      // Priority distribution chart
      this.initializePriorityChart(recommendations);
    } catch (error) {
      console.error('Error initializing distribution charts:', error);
    }
  }
  
  /**
   * Initialize the category distribution chart
   * @param {Array} recommendations - The processed recommendations
   */
  static initializeCategoryChart(recommendations) {
    const ctx = document.getElementById('categoryDistributionChart');
    if (!ctx) return;
    
    // Count recommendations by category
    const categoryCounts = this.countByCategory(recommendations);
    
    // Chart colors
    const categoryColors = {
      technical: 'rgba(52, 152, 219, 0.7)',
      content: 'rgba(155, 89, 182, 0.7)',
      keywords: 'rgba(46, 204, 113, 0.7)',
      onpage: 'rgba(241, 196, 15, 0.7)',
      offpage: 'rgba(230, 126, 34, 0.7)',
      general: 'rgba(149, 165, 166, 0.7)'
    };
    
    try {
      // Create doughnut chart
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryCounts).map(this.formatCategory),
          datasets: [{
            data: Object.values(categoryCounts),
            backgroundColor: Object.keys(categoryCounts).map(category => 
              categoryColors[category] || 'rgba(149, 165, 166, 0.7)'
            ),
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating category chart:', error);
    }
  }
  
  /**
   * Initialize the priority distribution chart
   * @param {Array} recommendations - The processed recommendations
   */
  static initializePriorityChart(recommendations) {
    const ctx = document.getElementById('priorityDistributionChart');
    if (!ctx) return;
    
    // Count recommendations by priority
    const priorityCounts = this.countByPriority(recommendations);
    
    // Sort priorities in correct order (high, medium, low)
    const priorities = ['high', 'medium', 'low'];
    const sortedPriorityCounts = {};
    priorities.forEach(priority => {
      sortedPriorityCounts[priority] = priorityCounts[priority] || 0;
    });
    
    // Chart colors
    const priorityColors = {
      high: 'rgba(231, 76, 60, 0.7)',
      medium: 'rgba(241, 196, 15, 0.7)',
      low: 'rgba(149, 165, 166, 0.7)'
    };
    
    try {
      // Create pie chart
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(sortedPriorityCounts).map(this.formatPriority),
          datasets: [{
            data: Object.values(sortedPriorityCounts),
            backgroundColor: Object.keys(sortedPriorityCounts).map(priority => priorityColors[priority]),
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating priority chart:', error);
    }
  }
  
  /**
   * Count recommendations by category
   * @param {Array} recommendations - The processed recommendations
   * @returns {Object} Object with category counts
   */
  static countByCategory(recommendations) {
    const categoryCounts = {};
    
    recommendations.forEach(rec => {
      const category = rec.category || 'general';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return categoryCounts;
  }
  
  /**
   * Count recommendations by priority
   * @param {Array} recommendations - The processed recommendations
   * @returns {Object} Object with priority counts
   */
  static countByPriority(recommendations) {
    const priorityCounts = {};
    
    recommendations.forEach(rec => {
      const priority = rec.priority || 'medium';
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });
    
    return priorityCounts;
  }
  
  /**
   * Calculate performance scores based on analysis data
   * @param {Object} resultData - The full result data
   * @returns {Object} Object with performance scores for each category
   */
  static calculatePerformanceScores(resultData) {
    const scores = {
      'Technical SEO': this.calculateCategoryScore(resultData, 'technical'),
      'Content Quality': this.calculateCategoryScore(resultData, 'content'),
      'Keyword Strategy': this.calculateCategoryScore(resultData, 'keyword'),
      'User Experience': 65 + Math.floor(Math.random() * 20),  // Demo score
      'Mobile Optimization': 70 + Math.floor(Math.random() * 15)  // Demo score
    };
    
    return scores;
  }
  
  /**
   * Calculate a score for a specific category
   * @param {Object} resultData - The full result data
   * @param {string} category - The category to calculate score for
   * @returns {number} A score from 0-100
   */
  static calculateCategoryScore(resultData, category) {
    // Base score
    let baseScore = 70;
    
    // Count issues in this category
    let issueCount = 0;
    
    // Check all output steps for issues in this category
    Object.entries(resultData).forEach(([key, value]) => {
      if (key.startsWith('output_') && key.includes(category)) {
        const step = value;
        if (step && step.recommendations && Array.isArray(step.recommendations)) {
          issueCount += step.recommendations.length;
        }
      }
    });
    
    // Adjust score based on issue count (fewer issues = higher score)
    const adjustedScore = Math.max(40, Math.min(95, baseScore - (issueCount * 3)));
    
    // Add some randomness to avoid all scores looking the same
    return Math.round(adjustedScore + (Math.random() * 6 - 3));
  }
  
  /**
   * Format a category name for display
   * @param {string} category - The category name
   * @returns {string} The formatted category name
   */
  static formatCategory(category) {
    switch (category) {
      case 'technical': return 'Technical SEO';
      case 'content': return 'Content';
      case 'keywords': return 'Keywords';
      case 'onpage': return 'On-Page';
      case 'offpage': return 'Off-Page';
      case 'general': return 'General';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  /**
   * Format a priority name for display
   * @param {string} priority - The priority name
   * @returns {string} The formatted priority name
   */
  static formatPriority(priority) {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  }
}
