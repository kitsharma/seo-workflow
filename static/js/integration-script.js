/**
 * SEO Workflow System Integration Script
 * Path: /static/js/seo-integration.js
 * Purpose: Integrates all UX enhancement components and handles their initialization
 */

// Import all components
import { initializeSEOVisualizations } from './seo-visualizations.js';
import { generateSEOReport } from './seo-pdf-export.js';
import SEOGuidanceSystem from './seo-user-guidance.js';

/**
 * Main integration class for SEO Workflow System
 */
class SEOWorkflowSystem {
    /**
     * Initialize the SEO Workflow System
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Default settings
        this.settings = {
            enableVisualizations: options.enableVisualizations !== false,
            enablePdfExport: options.enablePdfExport !== false,
            enableUserGuidance: options.enableUserGuidance !== false,
            theme: options.theme || 'default',
            language: options.language || 'en',
            autoInitialize: options.autoInitialize !== false,
            ...options
        };
        
        // References to component instances
        this.components = {
            guidanceSystem: null
        };
        
        // Status indicators
        this.isInitialized = false;
        this.hasErrors = false;
        this.resultsData = null;
        
        // Auto initialize if enabled
        if (this.settings.autoInitialize) {
            // Wait for DOM to load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
            } else {
                this.initialize();
            }
        }
    }
    
    /**
     * Initialize the system
     * @returns {boolean} True if initialization succeeded
     */
    initialize() {
        try {
            console.log('Initializing SEO Workflow System...');
            
            // Apply theme if specified
            if (this.settings.theme !== 'default') {
                this.applyTheme(this.settings.theme);
            }
            
            // Initialize user guidance if enabled
            if (this.settings.enableUserGuidance) {
                this.initializeUserGuidance();
            }
            
            // Load existing results data from page
            this.loadResultsData();
            
            // Initialize visualizations if enabled and data is available
            if (this.settings.enableVisualizations && this.resultsData) {
                this.initializeVisualizations();
            }
            
            // Setup export functionality if enabled
            if (this.settings.enablePdfExport) {
                this.setupExportFunctionality();
            }
            
            // Initialize tab switching functionality
            this.initializeTabSwitching();
            
            // Initialize recommendation filters
            this.initializeRecommendationFilters();
            
            // Initialize quick action functionality
            this.initializeQuickActions();
            
            // Mark as initialized
            this.isInitialized = true;
            console.log('SEO Workflow System initialization complete');
            
            return true;
        } catch (error) {
            console.error('Error initializing SEO Workflow System:', error);
            this.hasErrors = true;
            this.showErrorMessage(error);
            
            return false;
        }
    }
    
    /**
     * Apply a theme to the system
     * @param {string} theme - The theme to apply
     */
    applyTheme(theme) {
        try {
            // Add theme class to body
            document.body.classList.add(`theme-${theme}`);
            
            // Apply theme-specific styles
            const themeColors = this.getThemeColors(theme);
            
            // Create CSS variables
            let cssVars = '';
            for (const [key, value] of Object.entries(themeColors)) {
                cssVars += `--seo-${key}: ${value};\n`;
            }
            
            // Add CSS variables to document root
            const styleElement = document.createElement('style');
            styleElement.textContent = `:root {\n${cssVars}}`;
            document.head.appendChild(styleElement);
            
            console.log(`Applied theme: ${theme}`);
        } catch (error) {
            console.warn('Error applying theme:', error);
            // Continue without theme - not critical
        }
    }
    
    /**
     * Get theme colors
     * @param {string} theme - The theme name
     * @returns {Object} Theme colors
     */
    getThemeColors(theme) {
        // Define theme colors
        const themes = {
            default: {
                'primary': '#1e7d88',
                'primary-light': '#39b0ac',
                'primary-dark': '#136570',
                'secondary': '#39b0ac',
                'accent': '#ff9800',
                'success': '#4caf50',
                'warning': '#ff9800',
                'error': '#f44336',
                'text-primary': '#333333',
                'text-secondary': '#666666',
                'background': '#f5f7fa'
            },
            dark: {
                'primary': '#1e7d88',
                'primary-light': '#39b0ac',
                'primary-dark': '#136570',
                'secondary': '#39b0ac',
                'accent': '#ff9800',
                'success': '#4caf50',
                'warning': '#ff9800',
                'error': '#f44336',
                'text-primary': '#ffffff',
                'text-secondary': '#cccccc',
                'background': '#1e1e1e'
            },
            genie: {
                'primary': '#004165',
                'primary-light': '#00A3E0',
                'primary-dark': '#002d47',
                'secondary': '#00A3E0',
                'accent': '#E6A845',
                'success': '#4caf50',
                'warning': '#E6A845',
                'error': '#f44336',
                'text-primary': '#333333',
                'text-secondary': '#666666',
                'background': '#f5f7fa'
            }
        };
        
        // Return theme colors or default if theme not found
        return themes[theme] || themes.default;
    }
    
    /**
     * Initialize user guidance system
     */
    initializeUserGuidance() {
        try {
            // Create guidance system instance
            this.components.guidanceSystem = new SEOGuidanceSystem({
                language: this.settings.language
            });
            
            // Initialize guidance system
            this.components.guidanceSystem.initialize();
            
            console.log('User guidance system initialized');
        } catch (error) {
            console.warn('Error initializing user guidance:', error);
            // Continue without guidance - not critical
        }
    }
    
    /**
     * Load results data from the page
     */
    loadResultsData() {
        try {
            // Get results data from Alpine.js component or global variable
            if (window.Alpine) {
                // Try to get from Alpine.js component
                const resultElement = document.querySelector('[x-data]');
                if (resultElement) {
                    this.resultsData = window.Alpine.evaluate(resultElement, 'result');
                }
            }
            
            // Check if data loaded from Alpine
            if (!this.resultsData) {
                // Try to get from global variable
                if (window.seoAnalysisResults) {
                    this.resultsData = window.seoAnalysisResults;
                }
                
                // Try to get from data attribute
                const dataElement = document.querySelector('[data-seo-results]');
                if (dataElement) {
                    const dataJson = dataElement.getAttribute('data-seo-results');
                    this.resultsData = JSON.parse(dataJson);
                }
            }
            
            // If still no data, check for a results JSON script tag
            if (!this.resultsData) {
                const scriptElement = document.getElementById('seo-results-data');
                if (scriptElement) {
                    this.resultsData = JSON.parse(scriptElement.textContent);
                }
            }
            
            if (this.resultsData) {
                console.log('Results data loaded successfully');
            } else {
                console.warn('No results data found on the page');
            }
        } catch (error) {
            console.warn('Error loading results data:', error);
            this.resultsData = null;
        }
    }
    
    /**
     * Initialize data visualizations
     */
    initializeVisualizations() {
        try {
            // Initialize visualizations with results data
            if (this.resultsData) {
                initializeSEOVisualizations(this.resultsData);
                console.log('Data visualizations initialized');
            } else {
                console.warn('Cannot initialize visualizations without results data');
            }
        } catch (error) {
            console.warn('Error initializing visualizations:', error);
            // Continue without visualizations - not critical
        }
    }
    
    /**
     * Setup export functionality
     */
    setupExportFunctionality() {
        try {
            // Setup PDF export
            const pdfButtons = document.querySelectorAll('.export-pdf, [data-export="pdf"]');
            pdfButtons.forEach(button => {
                button.addEventListener('click', () => this.exportToPDF());
            });
            
            // Setup CSV export
            const csvButtons = document.querySelectorAll('.export-csv, [data-export="csv"]');
            csvButtons.forEach(button => {
                button.addEventListener('click', () => this.exportToCSV());
            });
            
            // Setup Excel export
            const excelButtons = document.querySelectorAll('.export-excel, [data-export="excel"]');
            excelButtons.forEach(button => {
                button.addEventListener('click', () => this.exportToExcel());
            });
            
            // Setup JSON export
            const jsonButtons = document.querySelectorAll('.export-json, [data-export="json"]');
            jsonButtons.forEach(button => {
                button.addEventListener('click', () => this.exportToJSON());
            });
            
            console.log('Export functionality initialized');
        } catch (error) {
            console.warn('Error setting up export functionality:', error);
            // Continue without export - not critical
        }
    }
    
    /**
     * Initialize tab switching functionality
     */
    initializeTabSwitching() {
        try {
            // Get all tabs
            const tabs = document.querySelectorAll('.tab, [data-tab]');
            
            // Add click event to each tab
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Get target tab content ID
                    const targetId = tab.getAttribute('data-tab') || 
                                    tab.getAttribute('id')?.replace('-tab', '-content');
                    
                    if (!targetId) return;
                    
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active', 'tab-active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active', 'tab-active');
                    
                    // Hide all tab content
                    const allContent = document.querySelectorAll('.tab-content, [data-tab-content]');
                    allContent.forEach(content => content.classList.remove('active'));
                    
                    // Show target tab content
                    const targetContent = document.getElementById(targetId);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                    
                    // If this is a step tab in detailed analysis
                    if (tab.hasAttribute('data-step')) {
                        const stepKey = tab.getAttribute('data-step');
                        if (window.Alpine) {
                            const component = document.querySelector('[x-data]');
                            if (component) {
                                window.Alpine.evaluate(component, `setActiveStep('${stepKey}')`);
                            }
                        }
                    }
                });
            });
            
            console.log('Tab switching functionality initialized');
        } catch (error) {
            console.warn('Error initializing tab switching:', error);
            // Continue without tab switching - not critical
        }
    }
    
    /**
     * Initialize recommendation filters
     */
    initializeRecommendationFilters() {
        try {
            // Priority filter
            const priorityFilter = document.getElementById('priority-filter');
            if (priorityFilter) {
                priorityFilter.addEventListener('change', () => this.filterRecommendations());
            }
            
            // Category filter
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => this.filterRecommendations());
            }
            
            // Difficulty filter
            const difficultyFilter = document.getElementById('difficulty-filter');
            if (difficultyFilter) {
                difficultyFilter.addEventListener('change', () => this.filterRecommendations());
            }
            
            // Reset filters button
            const resetButton = document.querySelector('[data-reset-filters]');
            if (resetButton) {
                resetButton.addEventListener('click', () => this.resetFilters());
            }
            
            console.log('Recommendation filters initialized');
        } catch (error) {
            console.warn('Error initializing recommendation filters:', error);
            // Continue without filters - not critical
        }
    }
    
    /**
     * Filter recommendations based on current filter values
     */
    filterRecommendations() {
        try {
            // Get filter values
            const priorityValue = document.getElementById('priority-filter')?.value || 'all';
            const categoryValue = document.getElementById('category-filter')?.value || 'all';
            const difficultyValue = document.getElementById('difficulty-filter')?.value || 'all';
            
            // Get all recommendations
            const recommendations = document.querySelectorAll('.recommendation');
            
            // Filter recommendations
            recommendations.forEach(rec => {
                const priority = rec.getAttribute('data-priority');
                const category = rec.getAttribute('data-category');
                const difficulty = rec.getAttribute('data-difficulty');
                
                const priorityMatch = priorityValue === 'all' || priority === priorityValue;
                const categoryMatch = categoryValue === 'all' || category === categoryValue;
                const difficultyMatch = difficultyValue === 'all' || difficulty === difficultyValue;
                
                // Show/hide based on filter match
                if (priorityMatch && categoryMatch && difficultyMatch) {
                    rec.style.display = '';
                } else {
                    rec.style.display = 'none';
                }
            });
            
            // If Alpine.js is available, update component state
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    // Update filter values in Alpine component
                    window.Alpine.evaluate(component, `recommendationFilters.priority = '${priorityValue}'`);
                    window.Alpine.evaluate(component, `recommendationFilters.category = '${categoryValue}'`);
                    window.Alpine.evaluate(component, `recommendationFilters.difficulty = '${difficultyValue}'`);
                }
            }
        } catch (error) {
            console.warn('Error filtering recommendations:', error);
        }
    }
    
    /**
     * Reset all recommendation filters
     */
    resetFilters() {
        try {
            // Reset filter elements
            const priorityFilter = document.getElementById('priority-filter');
            if (priorityFilter) priorityFilter.value = 'all';
            
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) categoryFilter.value = 'all';
            
            const difficultyFilter = document.getElementById('difficulty-filter');
            if (difficultyFilter) difficultyFilter.value = 'all';
            
            // Apply filter reset
            this.filterRecommendations();
            
            // If Alpine.js is available, reset component state
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    window.Alpine.evaluate(component, 'resetFilters()');
                }
            }
        } catch (error) {
            console.warn('Error resetting filters:', error);
        }
    }
    
    /**
     * Initialize quick action functionality
     */
    initializeQuickActions() {
        try {
            // Get all quick action items
            const quickActions = document.querySelectorAll('.quick-action-item');
            
            // Add click event to expand/collapse details
            quickActions.forEach((item, index) => {
                const detailsToggle = item.querySelector('[data-toggle-details]');
                if (detailsToggle) {
                    detailsToggle.addEventListener('click', () => {
                        // If Alpine.js is available, use Alpine function
                        if (window.Alpine) {
                            const component = document.querySelector('[x-data]');
                            if (component) {
                                window.Alpine.evaluate(component, `toggleActionDetails(${index})`);
                                return;
                            }
                        }
                        
                        // Fallback if Alpine not available
                        const details = item.querySelector('.action-details');
                        if (details) {
                            details.classList.toggle('hidden');
                        }
                    });
                }
                
                // Add click event to mark implemented
                const implementButton = item.querySelector('[data-mark-implemented]');
                if (implementButton) {
                    implementButton.addEventListener('click', () => {
                        // If Alpine.js is available, use Alpine function
                        if (window.Alpine) {
                            const component = document.querySelector('[x-data]');
                            if (component) {
                                window.Alpine.evaluate(component, `markActionImplemented(${index})`);
                                return;
                            }
                        }
                        
                        // Fallback if Alpine not available
                        item.classList.add('implemented');
                        item.style.display = 'none';
                        
                        // Move to implemented section
                        const implementedSection = document.querySelector('.implemented-actions');
                        if (implementedSection) {
                            const clone = item.cloneNode(true);
                            clone.classList.add('bg-gray-50');
                            implementedSection.appendChild(clone);
                        }
                    });
                }
            });
            
            console.log('Quick action functionality initialized');
        } catch (error) {
            console.warn('Error initializing quick actions:', error);
            // Continue without quick actions - not critical
        }
    }
    
    /**
     * Export results to PDF
     */
    async exportToPDF() {
        try {
            // Show loading indicator
            this.showLoadingIndicator('Generating PDF...');
            
            // Get export options
            const options = {
                fileName: `seo-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
                companyName: document.querySelector('meta[name="company-name"]')?.content || 'Your Company',
                includeCharts: true
            };
            
            // Generate PDF
            const pdfBlob = await generateSEOReport(this.resultsData, options);
            
            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = options.fileName;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.hideLoadingIndicator();
            }, 100);
            
            console.log('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage('Failed to generate PDF. Please try again later.');
        }
    }
    
    /**
     * Export results to CSV
     */
    exportToCSV() {
        try {
            // Show loading indicator
            this.showLoadingIndicator('Generating CSV...');
            
            // Get recommendations data
            let csvData = 'Title,Category,Priority,Difficulty,Impact\n';
            
            // If Alpine.js is available, use Alpine data
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    const recommendations = window.Alpine.evaluate(component, 'recommendations');
                    if (recommendations && recommendations.length > 0) {
                        recommendations.forEach(rec => {
                            csvData += `"${this.escapeCsvField(rec.title)}","${rec.category}","${rec.priority}","${rec.difficulty}",${rec.impact}\n`;
                        });
                    }
                }
            } else {
                // Fallback to DOM scraping
                const recommendations = document.querySelectorAll('.recommendation');
                recommendations.forEach(rec => {
                    const title = rec.querySelector('.recommendation-title')?.textContent || '';
                    const category = rec.getAttribute('data-category') || '';
                    const priority = rec.getAttribute('data-priority') || '';
                    const difficulty = rec.getAttribute('data-difficulty') || '';
                    const impact = rec.getAttribute('data-impact') || '0';
                    
                    csvData += `"${this.escapeCsvField(title)}","${category}","${priority}","${difficulty}",${impact}\n`;
                });
            }
            
            // Create download link
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seo-recommendations-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.hideLoadingIndicator();
            }, 100);
            
            console.log('CSV exported successfully');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage('Failed to generate CSV. Please try again later.');
        }
    }
    
    /**
     * Export results to Excel
     */
    exportToExcel() {
        try {
            // Show loading indicator
            this.showLoadingIndicator('Generating Excel file...');
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Create worksheet for recommendations
            let wsData = [['Title', 'Category', 'Priority', 'Difficulty', 'Impact']];
            
            // If Alpine.js is available, use Alpine data
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    const recommendations = window.Alpine.evaluate(component, 'recommendations');
                    if (recommendations && recommendations.length > 0) {
                        recommendations.forEach(rec => {
                            wsData.push([rec.title, rec.category, rec.priority, rec.difficulty, rec.impact]);
                        });
                    }
                }
            } else {
                // Fallback to DOM scraping
                const recommendations = document.querySelectorAll('.recommendation');
                recommendations.forEach(rec => {
                    const title = rec.querySelector('.recommendation-title')?.textContent || '';
                    const category = rec.getAttribute('data-category') || '';
                    const priority = rec.getAttribute('data-priority') || '';
                    const difficulty = rec.getAttribute('data-difficulty') || '';
                    const impact = rec.getAttribute('data-impact') || '0';
                    
                    wsData.push([title, category, priority, difficulty, impact]);
                });
            }
            
            // Add worksheet to workbook
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Recommendations');
            
            // Create worksheet for metrics
            const metricsData = [['Metric', 'Value']];
            
            // Add execution summary metrics
            if (this.resultsData && this.resultsData.execution_summary) {
                metricsData.push(['Total Steps Executed', this.resultsData.execution_summary.total_steps_executed]);
                metricsData.push(['Total Execution Time (s)', this.resultsData.execution_summary.total_execution_time_seconds]);
                metricsData.push(['Average Step Time (s)', this.resultsData.execution_summary.average_step_time_seconds]);
            }
            
            // Add worksheet to workbook
            const metricsWs = XLSX.utils.aoa_to_sheet(metricsData);
            XLSX.utils.book_append_sheet(wb, metricsWs, 'Metrics');
            
            // Export workbook
            XLSX.writeFile(wb, `seo-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            console.log('Excel exported successfully');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage('Failed to generate Excel file. Please try again later.');
        }
    }
    
    /**
     * Export raw results to JSON
     */
    exportToJSON() {
        try {
            // Show loading indicator
            this.showLoadingIndicator('Generating JSON...');
            
            // Create JSON data
            const jsonString = JSON.stringify(this.resultsData, null, 2);
            
            // Create download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.hideLoadingIndicator();
            }, 100);
            
            console.log('JSON exported successfully');
        } catch (error) {
            console.error('Error exporting JSON:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage('Failed to generate JSON. Please try again later.');
        }
    }
    
    /**
     * Show loading indicator
     * @param {string} message - Loading message to display
     */
    showLoadingIndicator(message = 'Loading...') {
        try {
            // Try to use Alpine.js loading if available
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    window.Alpine.evaluate(component, `isLoading = true`);
                    window.Alpine.evaluate(component, `loadingMessage = '${message}'`);
                    return;
                }
            }
            
            // Fallback to creating our own loading overlay
            let loadingOverlay = document.getElementById('seo-loading-overlay');
            
            // Create overlay if it doesn't exist
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'seo-loading-overlay';
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.style.position = 'fixed';
                loadingOverlay.style.top = '0';
                loadingOverlay.style.left = '0';
                loadingOverlay.style.width = '100%';
                loadingOverlay.style.height = '100%';
                loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                loadingOverlay.style.display = 'flex';
                loadingOverlay.style.justifyContent = 'center';
                loadingOverlay.style.alignItems = 'center';
                loadingOverlay.style.zIndex = '9999';
                
                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                spinner.innerHTML = `
                    <svg class="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="mt-2 text-gray-700 font-medium" id="loading-message">${message}</p>
                `;
                
                loadingOverlay.appendChild(spinner);
                document.body.appendChild(loadingOverlay);
            } else {
                // Update message if overlay exists
                const messageElement = loadingOverlay.querySelector('#loading-message');
                if (messageElement) {
                    messageElement.textContent = message;
                }
                
                // Show overlay
                loadingOverlay.style.display = 'flex';
            }
        } catch (error) {
            console.warn('Error showing loading indicator:', error);
        }
    }
    
    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        try {
            // Try to use Alpine.js loading if available
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    window.Alpine.evaluate(component, `isLoading = false`);
                    return;
                }
            }
            
            // Fallback to hiding our own loading overlay
            const loadingOverlay = document.getElementById('seo-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        } catch (error) {
            console.warn('Error hiding loading indicator:', error);
        }
    }
    
    /**
     * Show error message
     * @param {string|Error} error - Error message or object
     */
    showErrorMessage(error) {
        const errorMessage = error instanceof Error ? error.message : error;
        
        try {
            // Try to use Alpine.js error handling if available
            if (window.Alpine) {
                const component = document.querySelector('[x-data]');
                if (component) {
                    window.Alpine.evaluate(component, `hasError = true`);
                    window.Alpine.evaluate(component, `errorMessage = '${errorMessage.replace(/'/g, "\\'")}'`);
                    return;
                }
            }
            
            // Fallback to creating our own error message
            let errorElement = document.getElementById('seo-error-message');
            
            // Create error element if it doesn't exist
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = 'seo-error-message';
                errorElement.className = 'bg-red-50 border-l-4 border-red-500 p-4 rounded-md';
                errorElement.style.margin = '20px 0';
                
                const content = document.createElement('div');
                content.className = 'flex';
                content.innerHTML = `
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p id="error-message-text">${errorMessage}</p>
                        </div>
                    </div>
                `;
                
                errorElement.appendChild(content);
                
                // Add to DOM
                const container = document.querySelector('.container') || document.body;
                container.prepend(errorElement);
            } else {
                // Update message if error element exists
                const messageElement = errorElement.querySelector('#error-message-text');
                if (messageElement) {
                    messageElement.textContent = errorMessage;
                }
                
                // Show error element
                errorElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error showing error message:', error);
            // Last resort - alert
            alert(`Error: ${errorMessage}`);
        }
    }
    
    /**
     * Escape CSV field to handle quotes and commas
     * @param {string} field - Field value to escape
     * @returns {string} Escaped field value
     */
    escapeCsvField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        
        const stringField = String(field);
        
        // If the field contains a quote, a comma, or a newline, wrap it in quotes and escape quotes
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
            return stringField.replace(/"/g, '""');
        }
        
        return stringField;
    }
}

// Create global instance if autoload attribute is present
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('[data-seo-autoload]')) {
        window.seoWorkflowSystem = new SEOWorkflowSystem();
    }
});

// Export the class
export default SEOWorkflowSystem;
