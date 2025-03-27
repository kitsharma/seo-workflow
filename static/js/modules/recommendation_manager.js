/**
 * SEO Workflow System - Recommendation Manager Module
 * 
 * Extracts, processes, and manages recommendations from the analysis results.
 * 
 * @module recommendation_manager
 * @author achievewith.ai team
 */

/**
 * Recommendation Manager class
 * 
 * Manages the recommendations from the SEO workflow result.
 */
export class RecommendationManager {
    /**
     * Create a new RecommendationManager instance
     * @param {Object} resultData - The result data
     */
    constructor(resultData) {
        this.resultData = resultData;
        
        // Extract steps from result data
        this.steps = this.extractSteps();
        
        // All recommendations
        this.recommendations = [];
        
        // Filtered recommendations based on current filters
        this.filteredRecommendations = [];
        
        // Total recommendations count
        this.totalRecommendations = 0;
        
        // Filter state
        this.filters = {
            priority: 'all',
            category: 'all',
            difficulty: 'all'
        };
        
        // Initialize recommendations
        this.extractRecommendations();
    }
    
    /**
     * Extract steps from the result data
     * @returns {Object} The extracted steps
     */
    extractSteps() {
        const steps = {};
        
        try {
            // Find all step outputs in the result
            for (const key in this.resultData) {
                // Accept both "output_step" and direct "step" keys
                if (key.startsWith('output_')) {
                    steps[key] = this.resultData[key];
                } else if (
                    typeof this.resultData[key] === 'object' && 
                    !Array.isArray(this.resultData[key]) &&
                    !key.startsWith('execution_') && 
                    !['workflow_type', 'workflow_description', 'workflow_steps'].includes(key)
                ) {
                    // For keys that might be step results but do