/**
 * SEO Results Viewer - Enhanced UI
 * 
 * This script enhances the default SEO workflow results view with interactive
 * visualizations and improved user experience. It's designed to work alongside
 * the existing Alpine.js implementation without conflicts.
 * 
 * @version 1.0.0
 */

// Configuration
const config = {
  colors: {
    primary: '#1e7d88',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    dark: '#1f2937',
    light: '#f3f4f6'
  },
  chartDefaults: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }
};

// Track initialization status
let initialized = false;
let chartJsLoadFailed = false;

// Wait for document to load
document.addEventListener('DOMContentLoaded', function() {
  // Check if Chart.js loaded successfully
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded - falling back to text representation');
    chartJsLoadFailed = true;
  }
  
  // Initialize when DOM is ready
  initEnhancedUI();
  
  // Listen for tab changes to refresh visualizations
  document.addEventListener('refresh-visualizations', function() {
    if (initialized) {
      refreshVisualizations();
    }
  });
});

/**
 * Initialize the enhanced UI components
 * @param {Object} externalData - Data passed from Alpine.js (optional)
 */
function initEnhancedUI(externalData) {
  // Avoid duplicate initialization
  if (initialized) return;
  
  // Get or create the container where our visualizations will go
  const container = document.getElementById('visualization-container');
  if (!container) {
    console.log('Visualization container not found, creating it');
    createVisualizationContainer();
  }
  
  // Load the result data
  const resultData = externalData || loadResultData();
  if (!resultData) {
    console.warn('No result data found, cannot initialize enhanced UI');
    return;
  }
  
  // Add AlpineJS tab change listener
  setupTabChangeListeners();
  
  // Create visualizations
  createAllVisualizations(resultData);
  
  // Add recommendation filtering capability
  enhanceRecommendationFiltering(resultData);
  
  // Mark as initialized
  initialized = true;
  console.log('Enhanced SEO Results UI initialized successfully');
}

/**
 * Create all visualizations for the overview tab
 * @param {Object} resultData - The SEO result data
 */
function createAllVisualizations(resultData) {
  try {
    createSummaryStats(resultData);
    createPriorityChart(resultData);
    createCategoryChart(resultData);
    createStepResultsChart(resultData);
  } catch (error) {
    console.error('Error creating visualizations:', error);
  }
}

/**
 * Refresh all visualizations (used after tab changes)
 */
function refreshVisualizations() {
  // Clear existing visualizations
  const container = document.getElementById('visualization-container');
  if (container) {
    container.innerHTML = '';
    
    // Reload data and recreate visualizations
    const resultData = loadResultData();
    if (resultData) {
      createAllVisualizations(resultData);
    }
  }
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
 * Set up listeners for Alpine.js tab changes
 */
function setupTabChangeListeners() {
  // Find all tab buttons
  const tabButtons = document.querySelectorAll('.tabs-nav button, nav button');
  
  // Add click listeners
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // If this is the overview tab, refresh visualizations
      if (button.textContent.trim() === 'Overview') {
        // Give Alpine.js time to update the DOM
        setTimeout(refreshVisualizations, 50);
      }
    });
  });
}

/**
 * Create a container for visualizations if it doesn't exist
 */
function createVisualizationContainer() {
  // First, find the overview tab content
  const tabContents = document.querySelectorAll('.tab-content');
  let overviewTab = null;
  
  // Try to find it by checking if it's active or by looking for specific content
  for (let i = 0; i < tabContents.length; i++) {
    const tab = tabContents[i];
    if (tab.classList.contains('active') || tab.textContent.includes('Workflow Overview')) {
      overviewTab = tab;
      break;
    }
  }
  
  // If we couldn't find it, try a different approach
  if (!overviewTab) {
    const tabButtons = document.querySelectorAll('button');
    for (let i = 0; i < tabButtons.length; i++) {
      if (tabButtons[i].textContent.trim() === 'Overview') {
        // Simulate a click to make sure the tab is shown
        tabButtons[i].click();
        break;
      }
    }
    
    // Try again after giving it time to render
    setTimeout(() => {
      const activeTab = document.querySelector('.tab-content.active');
      if (activeTab) {
        createAndInsertContainer(activeTab);
      }
    }, 100);
    
    return;
  }
  
  createAndInsertContainer(overviewTab);
}

/**
 * Create and insert the visualization container into a tab
 * @param {Element} tab - The tab element to insert the container into
 */
function createAndInsertContainer(tab) {
  // Check if it already exists
  if (document.getElementById('visualization-container')) return;
  
  // Create the container
  const container = document.createElement('div');
  container.id = 'visualization-container';
  container.className = 'space-y-6 mt-6';
  
  // Find the best place to insert it
  const h2 = tab.querySelector('h2');
  if (h2) {
    // Insert before the heading
    tab.insertBefore(container, h2);
  } else {
    // Just insert at the beginning
    tab.insertBefore(container, tab.firstChild);
  }
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
  let highPriorityRecs = 0;
  
  steps.forEach(step => {
    const stepData = resultData[step];
    if (stepData && Array.isArray(stepData.recommendations)) {
      totalRecommendations += stepData.recommendations.length;
      
      // Count high priority recommendations
      stepData.recommendations.forEach(rec => {
        if (getPriorityFromText(rec) === 'high') {
          highPriorityRecs++;
        }
      });
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
      <p class="text-sm text-gray-500 mt-1">${highPriorityRecs} high priority</p>
    </div>
    <div class="bg-white p-4 rounded-lg border shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">Critical Issues</h3>
      <p class="text-2xl font-bold ${criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}">${criticalIssues}</p>
      <p class="text-sm text-gray-500 mt-1">${criticalIssues > 0 ? 'Needs attention' : 'All clear'}</p>
    </div>
    <div class="bg-white p-4 rounded-lg border shadow-sm">
      <h3 class="font-medium text-gray-800 mb-2">Steps Analyzed</h3>
      <p class="text-2xl font-bold text-blue-600">${steps.length}</p>
      <p class="text-sm text-gray-500 mt-1">Workflow complete</p>
    </div>
  `;
  
  // Add a title
  const title = document.createElement('h2');
  title.className = 'text-xl font-medium text-teal-600';
  title.textContent = 'Key Metrics';
  
  // Add elements to container
  container.appendChild(title);
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
  
  // Skip if no recommendations
  if (recommendations.length === 0) return;
  
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
  
  // Create the chart with Chart.js (if available) or fallback
  if (!chartJsLoadFailed && typeof Chart !== 'undefined') {
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
  
  // Calculate total for percentage
  const total = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
  
  // Create chart
  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['High Priority', 'Medium Priority', 'Low Priority'],
      datasets: [{
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: [config.colors.danger, config.colors.warning, config.colors.info],
        borderWidth: 1
      }]
    },
    options: {
      ...config.chartDefaults,
      plugins: {
        ...config.chartDefaults.plugins,
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
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
        <td class="py-2">${total > 0 ? Math.round((priorityCounts.high / total) * 100) : 0}%</td>
        <td class="py-2">
          <div class="bg-red-500 h-4" style="width: ${total > 0 ? (priorityCounts.high / total) * 100 : 0}%"></div>
        </td>
      </tr>
      <tr>
        <td class="py-2">Medium</td>
        <td class="py-2">${priorityCounts.medium}</td>
        <td class="py-2">${total > 0 ? Math.round((priorityCounts.medium / total) * 100) : 0}%</td>
        <td class="py-2">
          <div class="bg-amber-500 h-4" style="width: ${total > 0 ? (priorityCounts.medium / total) * 100 : 0}%"></div>
        </td>
      </tr>
      <tr>
        <td class="py-2">Low</td>
        <td class="py-2">${priorityCounts.low}</td>
        <td class="py-2">${total > 0 ? Math.round((priorityCounts.low / total) * 100) : 0}%</td>
        <td class="py-2">
          <div class="bg-blue-500 h-4" style="width: ${total > 0 ? (priorityCounts.low / total) * 100 : 0}%"></div>
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
  if (!chartJsLoadFailed && typeof Chart !== 'undefined') {
    createChartJsCategoryChart(chartContainer, categoryCounts);
  } else {
    // Fallback to a simple HTML representation
    createFallbackCategoryChart(chartContainer, categoryCounts);
  }
}

/**
 * Create a category chart using Chart.js
 * @param {HTMLElement} container - The container element
 * @param {Object} categoryCounts - The category counts
 */
function createChartJsCategoryChart(container, categoryCounts) {
  // Create canvas
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  
  // Prepare data for chart
  const labels = [];
  const data = [];
  const colors = [];
  
  // Map category names to display names and colors
  const categoryMap = {
    'technical': { name: 'Technical', color: config.colors.danger },
    'content': { name: 'Content', color: config.colors.success },
    'keyword': { name: 'Keywords', color: config.colors.info },
    'keywords': { name: 'Keywords', color: config.colors.info },
    'general': { name: 'General', color: config.colors.secondary }
  };
  
  // Build chart data
  for (const category in categoryCounts) {
    const displayInfo = categoryMap[category] || { name: formatKey(category), color: config.colors.secondary };
    labels.push(displayInfo.name);
    data.push(categoryCounts[category]);
    colors.push(displayInfo.color);
  }
  
  // Create chart
  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: config.chartDefaults
  });
}

/**
 * Create a fallback HTML representation of the category chart
 * @param {HTMLElement} container - The container element
 * @param {Object} categoryCounts - The category counts
 */
function createFallbackCategoryChart(container, categoryCounts) {
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Create a table
  const table = document.createElement('table');
  table.className = 'w-full text-left';
  
  // Create table header
  let tableHTML = `
    <thead>
      <tr>
        <th class="py-2">Category</th>
        <th class="py-2">Count</th>
        <th class="py-2">Percentage</th>
        <th class="py-2">Visualization</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  // Category display config
  const categoryConfig = {
    'technical': { name: 'Technical', class: 'bg-red-500' },
    'content': { name: 'Content', class: 'bg-green-500' },
    'keyword': { name: 'Keywords', class: 'bg-blue-500' },
    'keywords': { name: 'Keywords', class: 'bg-blue-500' },
    'general': { name: 'General', class: 'bg-gray-500' }
  };
  
  // Build rows
  for (const category in categoryCounts) {
    const config = categoryConfig[category] || { name: formatKey(category), class: 'bg-gray-500' };
    const count = categoryCounts[category];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    tableHTML += `
      <tr>
        <td class="py-2">${config.name}</td>
        <td class="py-2">${count}</td>
        <td class="py-2">${percentage}%</td>
        <td class="py-2">
          <div class="${config.class} h-4" style="width: ${percentage}%"></div>
        </td>
      </tr>
    `;
  }
  
  tableHTML += '</tbody>';
  table.innerHTML = tableHTML;
  
  container.appendChild(table);
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
  
  // Skip if no data
  if (stepData.length === 0) return;
  
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
  if (!chartJsLoadFailed && typeof Chart !== 'undefined') {
    createChartJsStepResultsChart(chartContainer, stepData);
  } else {
    // Fallback to a simple HTML representation
    createFallbackStepResultsChart(chartContainer, stepData);
  }
}

/**
 * Create a step results chart using Chart.js
 * @param {HTMLElement} container - The container element
 * @param {Array} stepData - The step data
 */
function createChartJsStepResultsChart(container, stepData) {
  // Create canvas
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  
  // Extract labels and data
  const labels = stepData.map(item => item.step);
  const recommendationsData = stepData.map(item => item.recommendations);
  const issuesData = stepData.map(item => item.issues);
  
  // Create chart
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Recommendations',
          data: recommendationsData,
          backgroundColor: config.colors.info,
          borderColor: config.colors.info,
          borderWidth: 1
        },
        {
          label: 'Issues',
          data: issuesData,
          backgroundColor: config.colors.danger,
          borderColor: config.colors.danger,
          borderWidth: 1
        }
      ]
    },
    options: {
      ...config.chartDefaults,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Step'
          }
        }
      }
    }
  });
}

/**
 * Create a fallback HTML representation of the step results chart
 * @param {HTMLElement} container - The container element
 * @param {Array} stepData - The step data
 */
function createFallbackStepResultsChart(container, stepData) {
  // Find the maximum value for scaling
  const maxValue = stepData.reduce((max, item) => {
    return Math.max(max, item.recommendations, item.issues);
  }, 0);
  
  // Create a table
  const table = document.createElement('table');
  table.className = 'w-full text-left';
  
  // Create table header
  let tableHTML = `
    <thead>
      <tr>
        <th class="py-2">Step</th>
        <th class="py-2">Recommendations</th>
        <th class="py-2">Issues</th>
        <th class="py-2">Visualization</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  // Build rows
  stepData.forEach(item => {
    const recWidth = maxValue > 0 ? (item.recommendations / maxValue) * 100 : 0;
    const issuesWidth = maxValue > 0 ? (item.issues / maxValue) * 100 : 0;
    
    tableHTML += `
      <tr>
        <td class="py-2">${item.step}</td>
        <td class="py-2">${item.recommendations}</td>
        <td class="py-2">${item.issues}</td>
        <td class="py-2">
          <div class="flex items-center">
            <div class="bg-blue-500 h-4 mr-1" style="width: ${recWidth}%"></div>
            <div class="bg-red-500 h-4" style="width: ${issuesWidth}%"></div>
          </div>
        </td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody>';
  table.innerHTML = tableHTML;
  
  // Add a legend
  const legend = document.createElement('div');
  legend.className = 'flex items-center mt-2 text-xs';
  legend.innerHTML = `
    <div class="flex items-center mr-4">
      <div class="w-3 h-3 bg-blue-500 mr-1"></div>
      <span>Recommendations</span>
    </div>
    <div class="flex items-center">
      <div class="w-3 h-3 bg-red-500 mr-1"></div>
      <span>Issues</span>
    </div>
  `;
  
  container.appendChild(table);
  container.appendChild(legend);
}

/**
 * Enhance the recommendation tab with filtering capability
 * @param {Object} resultData - The SEO result data
 */
function enhanceRecommendationFiltering(resultData) {
  // Wait for Alpine.js and DOM to be fully ready
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
  const activeTabContent = document.querySelector('.tab-content.active');
  if (!activeTabContent) return;
  
  // Verify this is the recommendations tab
  const title = activeTabContent.querySelector('h2');
  if (!title || !title.textContent.includes('Recommendations')) return;
  
  // Check if we've already enhanced this tab
  if (activeTabContent.querySelector('.filter-controls')) return;
  
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
  
  // Add labels
  const categoryLabel = document.createElement('label');
  categoryLabel.className = 'text-sm text-gray-700 mr-1';
  categoryLabel.textContent = 'Category:';
  
  const priorityLabel = document.createElement('label');
  priorityLabel.className = 'text-sm text-gray-700 mr-1 ml-4';
  priorityLabel.textContent = 'Priority:';
  
  // Add elements to controls
  filterControls.appendChild(categoryLabel);
  filterControls.appendChild(categoryFilter);
  filterControls.appendChild(priorityLabel);
  filterControls.appendChild(priorityFilter);
  
  // Add a clear filter button
  const clearButton = document.createElement('button');
  clearButton.className = 'ml-2 px-2 py-1 border rounded-md text-xs text-gray-600 hover:bg-gray-100';
  clearButton.textContent = 'Clear Filters';
  filterControls.appendChild(clearButton);
  
  // Find title to insert after
  if (title) {
    title.parentNode.insertBefore(filterControls, title.nextSibling);
  } else {
    activeTabContent.insertBefore(filterControls, activeTabContent.firstChild);
  }
  
  