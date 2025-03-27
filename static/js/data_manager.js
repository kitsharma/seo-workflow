/**
 * SEO Workflow System - Data Manager Module
 * 
 * Responsible for loading and managing the result data.
 * 
 * @module data_manager
 * @author achievewith.ai team
 */

/**
 * Data Manager class
 * 
 * Loads and manages the result data for the SEO workflow system.
 */
export class DataManager {
    /**
     * Create a new DataManager instance
     */
    constructor() {
        this.resultData = null;
    }
    
    /**
     * Load result data from the page
     * @returns {Object} The result data
     */
    loadResultData() {
        try {
            // Get the data from the script tag
            const dataScript = document.getElementById('seo-results-data');
            if (dataScript) {
                this.resultData = JSON.parse(dataScript.textContent);
                return this.resultData;
            }
            
            // If not found, check for a global variable
            if (window.seoAnalysisResults) {
                this.resultData = window.seoAnalysisResults;
                return this.resultData;
            }
            
            console.warn('No result data found');
            return {};
        } catch (error) {
            console.error('Error loading result data:', error);
            return {};