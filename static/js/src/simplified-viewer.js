/**
 * SEO Results Viewer - Enhanced UI
 * A self-contained script that improves the visualization of SEO workflow results.
 * 
 * This script enhances the existing Alpine.js UI with improved visualizations
 * without requiring a complex build system.
 */

// Wait for document to load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize when DOM is ready
  initEnhancedUI();
});

/**
 * Initialize the enhanced UI components
 */
function initEnhancedUI() {
  // Get the container where our visualizations will go
  const container = document.getElementById('visualization-container');
  if (!container) {
    console.warn('Visualization container not found, creating it');
    createVisualizationContainer();
  }
  
  // Load the result data
  const resultData = loadResultData();
  if (!resultData) {
    console.warn('No result data found');
    return;
  }
  
  // Create visualizations
  createSummaryStats(resultData);
  createPriorityChart(resultData);
  createCategoryChart(resultData);
  createStepResultsChart(resultData);
  
  // Add recommendation filtering capability
  enhanceRecommendationFiltering(resultData);
}

/**
 * Load the SEO result data from the page
 * @returns {Object} The parsed result data
 */
function loadResultData() {
  try {
    // Get the data from the script tag
    const dataScript = document.getElementById('seo-results-data');
    if (dataScript) {
      return JSON.parse(dataScript.textContent);
    }
    
    // If Alpine.js has already loaded it, try to get it from there
    const resultView = document.querySelector('[x-data="resultView()"]');
    if (resultView && window.Alpine) {
      return window.Alpine.evaluate(resultView, 'resultData');
    }
    
    console.warn('No result data found');
    return null;
  } catch (error) {
    console.error('Error loading result data:', error);
    return null;
  }
}

/**
 * Create a container for visualizations if it doesn't exist
 */
function createVisualizationContainer() {
  const alpineContainer = document.getElementById('alpine-results-viewer');
  if (!alpineContainer) return;
  
  // Find the first tab content
  const tabContent = alpineContainer.querySelector('.tab-content');
  if (!tabContent) return;
  
  // Create and insert our container
  const container = document.createElement('div');
  container.id = 'visualization-container';
  container.className = 'space-y-6 mt-6';
  
  // Insert it at the beginning of the content
  tabContent.insertBefore(container, tabContent.firstChild);
}

/**
 * Create enhanced summary statistics for the overview
 * @param {Object} resultData - The SEO result data
 */
function createSummaryStats(resultData) {
  const container = document.getElementById('visualization-container');
  if (!container) return;
  
  // Get all the steps
  const steps = getWorkflowSteps(resultData);
  
  // Count recommendations and issues
  let totalRecommendations = 0;
  let criticalIssues = 0;
  
  steps.forEach(step => {
    const stepData = resultData[step];
    if (stepData && Array.isArray(stepData.recommendations)) {
      totalRecommendations += stepData.recommendations.length;
    }
    
    if (stepData && stepData.issues && Array.isArray(stepData.issues.critical)) {
      criticalIssues += stepData.issues.critical.length;
    }
  });
  
  // Create the stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'grid grid-cols-1 md:grid-cols-3 gap-4';
  statsSection.innerHTML = `
    <div class="bg-white p-4 rounded-lg border shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">Total Recommendations</h3>
      <p class="text-2xl font-bold text-teal-600">${totalRecommendations}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">Critical Issues</h3>
      <p class="text-2xl font-bold ${criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}">${criticalIssues}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">Steps Analyzed</h3>
      <p class="text-2xl font-bold text-blue-600">${steps.length}</p>
    </div>
  `;
  
  container.appendChild(statsSection);
}

/**
 * Create a pie chart showing recommendations by priority
 * @param {Object} resultData - The SEO result data
 */
function createPriorityChart(resultData) {
  const container = document.getElementById('visualization-container');
  if (!container) return;
  
  // Get recommendations
  const recommendations = getAllRecommendations(resultData);
  
  // Count by priority
  const priorityCounts = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  recommendations.forEach(rec => {
    const priority = getPriorityFromText(rec.text);
    priorityCounts[priority]++;
  });
  
  // Create a title
  const title = document.createElement('h2');
  title.className = 'text-xl font-medium text-teal-600 mt-6';
  title.textContent = 'Recommendations by Priority';
  container.appendChild(title);
  
  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'bg-white p-4 rounded-lg border shadow-sm';
  chartContainer.style.height = '300px';
  container.appendChild(chartContainer);
  
  // Create the chart with Chart.js (if available) or D3 (if available)
  if (window.Chart) {
    createChartJsPriorityChart(chartContainer, priorityCounts);
  } else {
    // Fallback to a simple HTML representation
    createFallbackPriorityChart(chartContainer, priorityCounts);
  }
}

/**
 * Create a pie chart using Chart.js
 * @param {HTMLElement} container - The container element
 * @param {Object} priorityCounts - The priority counts
 */
function createChartJsPriorityChart(container, priorityCounts) {
  // Create canvas
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  
  // Create chart
  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
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
              const label = context.label || '';
              const value = context.raw || 0;
              const total = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Create a fallback HTML representation of the priority chart
 * @param {HTMLElement} container - The container element
 * @param {Object} priorityCounts - The priority counts
 */
function createFallbackPriorityChart(container, priorityCounts) {
  const total = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
  
  // Create a table
  const table = document.createElement('table');
  table.className = 'w-full text-left';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="py-2">Priority</th>
        <th class="py-2">Count</th>
        <th class="py-2">Percentage</th>
        <th class="py-2">Visualization</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="py-2">High</td>
        <td class="py-2">${priorityCounts.high}</td>
        <td class="py-2">${Math.round((priorityCounts.high / total) * 100)}%</td>
        <td class="py-2">
          <div class="bg-red-500 h-4" style="width: ${(priorityCounts.high / total) * 100}%"></div>
        </td>
      </tr>
      <tr>
        <td class="py-2">Medium</td>
        <td class="py-2">${priorityCounts.medium}</td>
        <td class="py-2">${Math.round((priorityCounts.medium / total) * 100)}%</td>
        <td class="py-2">
          <div class="bg-amber-500 h-4" style="width: ${(priorityCounts.medium / total) * 100}%"></div>
        </td>
      </tr>
      <tr>
        <td class="py-2">Low</td>
        <td class="py-2">${priorityCounts.low}</td>
        <td class="py-2">${Math.round((priorityCounts.low / total) * 100)}%</td>
        <td class="py-2">
          <div class="bg-blue-500 h-4" style="width: ${(priorityCounts.low / total) * 100}%"></div>
        </td>
      </tr>
    </tbody>
  `;
  
  container.appendChild(table);
}

/**
 * Create a chart showing recommendations by category
 * @param {Object} resultData - The SEO result data
 */
function createCategoryChart(resultData) {
  const container = document.getElementById('visualization-container');
  if (!container) return;
  
  // Get recommendations
  const recommendations = getAllRecommendations(resultData);
  
  // Count by category
  const categoryCounts = {};
  
  recommendations.forEach(rec => {
    const category = getCategoryFromStep(rec.step);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Skip if no categories
  if (Object.keys(categoryCounts).length === 0) return;
  
  // Create a title
  const title = document.createElement('h2');
  title.className = 'text-xl font-medium text-teal-600 mt-6';
  title.textContent = 'Recommendations by Category';
  container.appendChild(title);
  
  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'bg-white p-4 rounded-lg border shadow-sm';
  chartContainer.style.height = '300px';
  container.appendChild(chartContainer);
  
  // Create the chart with Chart.js (if available)
  if (window.Chart) {
    createChartJsCategoryChart(chartContainer, categoryCounts);
  } else {
    // Fallback to a simple HTML representation
    createFallbackCategoryChart(chartContainer, categoryCounts);
  }
}

/**
 * Create a step results chart
 * @param {Object} resultData - The SEO result data
 */
function createStepResultsChart(resultData) {
  const container = document.getElementById('visualization-container');
  if (!container) return;
  
  // Get steps
  const steps = getWorkflowSteps(resultData);
  
  // Get data for each step
  const stepData = steps.map(step => {
    const data = resultData[step];
    const recommendations = (data && Array.isArray(data.recommendations)) ? data.recommendations.length : 0;
    
    let issues = 0;
    if (data && data.issues) {
      if (Array.isArray(data.issues.critical)) issues += data.issues.critical.length;
      if (Array.isArray(data.issues.warning)) issues += data.issues.warning.length;
    }
    
    return {
      step: formatKey(step),
      recommendations,
      issues
    };
  });
  
  // Create a title
  const title = document.createElement('h2');
  title.className = 'text-xl font-medium text-teal-600 mt-6';
  title.textContent = 'Analysis by Step';
  container.appendChild(title);
  
  // Create chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'bg-white p-4 rounded-lg border shadow-sm';
  chartContainer.style.height = '300px';
  container.appendChild(chartContainer);
  
  // Create the chart with Chart.js (if available)
  if (window.Chart) {
    createChartJsStepResultsChart(chartContainer, stepData);
  } else {
    // Fallback to a simple HTML representation
    createFallbackStepResultsChart(chartContainer, stepData);
  }
}

/**
 * Enhance the recommendation tab with filtering capability
 * @param {Object} resultData - The SEO result data
 */
function enhanceRecommendationFiltering(resultData) {
  // Wait for Alpine.js to be fully initialized
  setTimeout(() => {
    const tabsNav = document.querySelector('.tabs-nav') || document.querySelector('nav');
    if (!tabsNav) return;
    
    // Find the recommendations tab button
    const recommendationsTab = Array.from(tabsNav.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Recommendations'
    );
    
    if (!recommendationsTab) return;
    
    // Add a click handler to enhance the tab when clicked
    recommendationsTab.addEventListener('click', () => {
      setTimeout(() => {
        enhanceRecommendationsTab(resultData);
      }, 100);
    });
  }, 500);
}

/**
 * Add filtering controls to the recommendations tab
 * @param {Object} resultData - The SEO result data
 */
function enhanceRecommendationsTab(resultData) {
  // Find the recommendations tab content
  const tabContent = document.querySelector('.tab-content.active');
  if (!tabContent) return;
  
  // Check if we've already enhanced this tab
  if (tabContent.querySelector('.filter-controls')) return;
  
  // Create filter controls
  const filterControls = document.createElement('div');
  filterControls.className = 'filter-controls flex flex-wrap gap-2 mb-4';
  
  // Create category filter
  const categoryFilter = document.createElement('select');
  categoryFilter.className = 'border rounded-md px-3 py-1 text-sm';
  categoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    <option value="technical">Technical</option>
    <option value="content">Content</option>
    <option value="keyword">Keywords</option>
    <option value="general">General</option>
  `;
  
  // Create priority filter
  const priorityFilter = document.createElement('select');
  priorityFilter.className = 'border rounded-md px-3 py-1 text-sm';
  priorityFilter.innerHTML = `
    <option value="all">All Priorities</option>
    <option value="high">High Priority</option>
    <option value="medium">Medium Priority</option>
    <option value="low">Low Priority</option>
  `;
  
  // Add filters to controls
  filterControls.appendChild(categoryFilter);
  filterControls.appendChild(priorityFilter);
  
  // Find title to insert after
  const title = tabContent.querySelector('h2');
  if (title) {
    title.parentNode.insertBefore(filterControls, title.nextSibling);
  } else {
    tabContent.insertBefore(filterControls, tabContent.firstChild);
  }
  
  // Add event listeners for filtering
  categoryFilter.addEventListener('change', () => {
    applyRecommendationFilters(categoryFilter.value, priorityFilter.value, resultData);
  });
  
  priorityFilter.addEventListener('change', () => {
    applyRecommendationFilters(categoryFilter.value, priorityFilter.value, resultData);
  });
}

/**
 * Apply filters to recommendations
 * @param {string} category - The category filter
 * @param {string} priority - The priority filter
 * @param {Object} resultData - The SEO result data
 */
function applyRecommendationFilters(category, priority, resultData) {
  // Find all recommendation items
  const items = document.querySelectorAll('.recommendation-item');
  if (!items.length) return;
  
  // Get all recommendations
  const recommendations = getAllRecommendations(resultData);
  
  // Process each item
  items.forEach((item, index) => {
    if (index >= recommendations.length) return;
    
    const rec = recommendations[index];
    const recCategory = getCategoryFromStep(rec.step);
    const recPriority = getPriorityFromText(rec.text);
    
    const categoryMatch = category === 'all' || category === recCategory;
    const priorityMatch = priority === 'all' || priority === recPriority;
    
    // Show or hide based on filters
    if (categoryMatch && priorityMatch) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

/**
 * Get all steps from the result data
 * @param {Object} resultData - The SEO result data
 * @returns {Array} Array of step keys
 */
function getWorkflowSteps(resultData) {
  return Object.keys(resultData || {})
    .filter(key => key.startsWith("output_"))
    .sort();
}

/**
 * Get all recommendations from all steps
 * @param {Object} resultData - The SEO result data
 * @returns {Array} Array of recommendation objects
 */
function getAllRecommendations(resultData) {
  const recommendations = [];
  
  getWorkflowSteps(resultData).forEach(step => {
    const stepData = resultData[step];
    if (stepData && Array.isArray(stepData.recommendations)) {
      stepData.recommendations.forEach(text => {
        recommendations.push({ step, text });
      });
    }
  });
  
  return recommendations;
}

/**
 * Format a key for display
 * @param {string} key - The key to format
 * @returns {string} Formatted key
 */
function formatKey(key) {
  if (!key) return "";
  
  // Remove prefixes like "output_"
  let formattedKey = key.replace(/^(output_|input_)/, "");
  
  // Replace underscores with spaces
  formattedKey = formattedKey.replace(/_/g, " ");
  
  // Capitalize each word
  return formattedKey.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Determine category from step name
 * @param {string} step - The step name
 * @returns {string} Category name
 */
function getCategoryFromStep(step) {
  if (step.includes('technical')) return 'technical';
  if (step.includes('content')) return 'content';
  if (step.includes('keyword')) return 'keyword';
  return 'general';
}

/**
 * Determine priority from recommendation text
 * @param {string} text - The recommendation text
 * @returns {string} Priority level
 */
function getPriorityFromText(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('critical') || lowerText.includes('urgent') || lowerText.includes('immediately')) {
    return 'high';
  }
  if (lowerText.includes('important') || lowerText.includes('recommend') || lowerText.includes('consider')) {
    return 'medium';
  }
  return 'low';
}

// Chart.js helper functions
function createChartJsCategoryChart(container, categoryCounts) {
  // Implementation details omitted for brevity
}

function createChartJsStepResultsChart(container, stepData) {
  // Implementation details omitted for brevity
}

function createFallbackCategoryChart(container, categoryCounts) {
  // Implementation details omitted for brevity
}

function createFallbackStepResultsChart(container, stepData) {
  // Implementation details omitted for brevity
}
