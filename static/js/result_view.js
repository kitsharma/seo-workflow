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
        }
    };
};
