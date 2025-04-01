/**
 * SEO Workflow System - Result View Module
 * 
 * Main entry point for the result view page. Initializes the Alpine.js component
 * and loads all required modules.
 * 
 * @module result_view
 * @author achievewith.ai team
 */

import { DataManager } from './modules/data_manager.js';
import { UIManager } from './modules/ui_manager.js';
import { RecommendationManager } from './modules/recommendation_manager.js';
import { ChartManager } from './modules/chart_manager.js';
import { ExportManager } from './modules/export_manager.js';
import { UtilityManager } from './modules/utility_manager.js';

/**
 * Alpine.js component for the result view page
 * @function resultView
 * @returns {Object} The Alpine.js component configuration
 */
window.resultView = function() {
    return {
        // Core state
        result: {},
        resultId: '',
        isLoading: false,
        loadingMessage: '',
        hasValidResults: false,
        errorMessage: '',
        exportMenuOpen: false,
        activeTab: "overview",
        selectedStep: "",
        showModal: false,
        modalStep: "",
        jsonEditor: null,
        
        // Module instances
        dataManager: null,
        uiManager: null,
        recommendationManager: null,
        chartManager: null,
        utilityManager: null,
        exportManager: null,
        
        /**
         * Initialize the component
         */
        init() {
            try {
                this.isLoading = true;
                this.loadingMessage = 'Loading analysis results...';
                
                // Get result ID from URL
                this.resultId = window.location.pathname.split('/').pop();
                
                // Create utility manager first as other modules depend on it
                this.utilityManager = new UtilityManager();
                
                // Initialize data manager and load data
                this.dataManager = new DataManager();
                this.result = this.dataManager.loadResultData();
                
                if (!this.result || typeof this.result !== 'object') {
                    this.errorMessage = "No valid result data found";
                    console.error("Invalid result data:", this.result);
                    this.isLoading = false;
                    return;
                }
                
                // Initialize all managers
                this.initializeManagers();
                
                // Check if results are valid
                if (this.validateResults()) {
                    // Render UI components
                    this.uiManager.renderComponents();
                    
                    // Initialize charts
                    this.$nextTick(() => {
                        this.chartManager.initializeCharts();
                    });
                    
                    this.hasValidResults = true;
                }
                
                this.isLoading = false;
                console.log("Result view initialized successfully");
            } catch (error) {
                console.error("Error initializing result view:", error);
                this.errorMessage = "Error initializing result view: " + error.message;
                this.isLoading = false;
            }
        },
        
        /**
         * Initialize all manager objects
         */
        initializeManagers() {
            // Initialize recommendation manager
            this.recommendationManager = new RecommendationManager(this.result);
            
            // Initialize chart manager
            this.chartManager = new ChartManager(this.result, this.recommendationManager);
            
            // Initialize export manager
            this.exportManager = new ExportManager(this.result, this.recommendationManager);
            
            // Initialize UI manager (depends on other managers)
            this.uiManager = new UIManager(
                this.result, 
                this.recommendationManager,
                this.chartManager,
                this.exportManager,
                this.utilityManager
            );
        },
        
        /**
         * Validate the result data
         * @returns {boolean} True if the data is valid
         */
        validateResults() {
            try {
                // Check if we have valid data
                if (!this.result || Object.keys(this.result).length === 0) {
                    this.errorMessage = "No result data was found";
                    return false;
                }
                
                // Check if we have steps data
                const hasSteps = this.recommendationManager.hasValidSteps();
                if (!hasSteps) {
                    this.errorMessage = "No analysis steps found in the result data";
                    return false;
                }
                
                return true;
            } catch (error) {
                this.errorMessage = "Error validating result data: " + error.message;
                console.error("Error validating results:", error);
                return false;
            }
        },
        
        /**
         * Get a message to display when no valid results are found
         * @returns {string} The error message
         */
        getNoResultsMessage() {
            if (this.errorMessage) {
                return this.errorMessage;
            }
            
            if (Object.keys(this.result).length === 0) {
                return "No result data was found. The analysis may have failed to complete.";
            }
            
            return "The result data has an unexpected format. Please check the raw JSON download.";
        },
        
        /**
         * Format a key for display (convert snake_case to Title Case)
         * @param {string} key - The key to format
         * @returns {string} The formatted key
         */
        formatKey(key) {
            if (!key) return "";
            
            // Remove prefixes like "output_"
            let formattedKey = key.replace(/^(output_|input_)/, "");
            
            // Replace underscores with spaces
            formattedKey = formattedKey.replace(/_/g, " ");
            
            // Capitalize each word
            return formattedKey.split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        },
        
        /**
         * Get all workflow steps
         * @returns {string[]} Array of step keys
         */
        getWorkflowSteps() {
            return Object.keys(this.result || {})
                .filter(key => key.startsWith("output_"))
                .sort();
        },
        
        /**
         * Get analysis text for a step
         * @param {string} step - The step key
         * @returns {string} The analysis text
         */
        getStepAnalysis(step) {
            if (!step || !this.result[step]) return "";
            
            const stepData = this.result[step];
            
            if (typeof stepData === "object") {
                // If analysis is a string, return it directly
                if (typeof stepData.analysis === "string") {
                    return stepData.analysis;
                }
                // If analysis is an object, stringify it
                else if (typeof stepData.analysis === "object") {
                    return JSON.stringify(stepData.analysis);
                }
                // Try response_text as fallback
                else if (typeof stepData.response_text === "string") {
                    return stepData.response_text;
                }
            }
            
            // If we get here, we couldn't find a suitable text representation
            return "No analysis available";
        },
        
        /**
         * Get recommendations for a step
         * @param {string} step - The step key
         * @returns {Array} Array of recommendations
         */
        getStepRecommendations(step) {
            if (!step || !this.result[step]) return [];
            
            const stepData = this.result[step];
            
            if (typeof stepData === "object" && Array.isArray(stepData.recommendations)) {
                return stepData.recommendations;
            }
            
            return [];
        },
        
        /**
         * Format a recommendation for display
         * @param {*} rec - The recommendation
         * @returns {string} The formatted recommendation
         */
        formatRecommendation(rec) {
            if (typeof rec === "string") {
                return rec;
            } else if (typeof rec === "object") {
                return JSON.stringify(rec);
            }
            return String(rec);
        },
        
        /**
         * Check if a step has additional data
         * @param {string} step - The step key
         * @returns {boolean} True if the step has additional data
         */
        hasAdditionalData(step) {
            if (!step || !this.result[step]) return false;
            
            const stepData = this.result[step];
            
            if (typeof stepData !== "object") return false;
            
            // Check if there are keys other than analysis, recommendations, and response_text
            for (const key in stepData) {
                if (key !== "analysis" && key !== "recommendations" && key !== "response_text" && key !== "_api_info") {
                    return true;
                }
            }
            
            return false;
        },
        
        /**
         * Get additional data for a step
         * @param {string} step - The step key
         * @returns {Object} The additional data
         */
        getAdditionalData(step) {
            if (!step || !this.result[step]) return {};
            
            return this.result[step];
        },
        
        /**
         * View step details in a modal
         * @param {string} step - The step key
         */
        viewStepDetails(step) {
            this.modalStep = step;
            this.showModal = true;
        },
        
        /**
         * Initialize the JSON editor
         */
        initJsonEditor() {
            if (this.activeTab === 'json' && !this.jsonEditor) {
                this.$nextTick(() => {
                    const container = document.getElementById('jsoneditor');
                    if (container) {
                        const options = {
                            mode: 'view',
                            modes: ['view', 'code', 'tree', 'form'],
                            onModeChange: function(newMode, oldMode) {
                                console.log('Mode switched from', oldMode, 'to', newMode);
                            }
                        };
                        this.jsonEditor = new JSONEditor(container, options);
                        this.jsonEditor.set(this.result);
                    }
                });
            }
        }
    };
};
