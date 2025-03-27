// Enhanced ResultView Alpine.js component
function resultView() {
    return {
        result: {},
        steps: {},
        activeStep: null,
        expandedAgent: null,
        agentFindings: {},
        totalRecommendations: 0,
        analysisWordCount: 0,
        executiveSummary: "",
        expandedSections: {
            analysis: true,
            recommendations: true,
            reasoning: false,
            data: false
        },
        charts: {},
        hasValidResults: false,
        errorMessage: "",
        
        init() {
            // Validate result data
            if (!this.result || typeof this.result !== 'object') {
                this.errorMessage = "No valid result data found";
                console.error("Invalid result data:", this.result);
                return;
            }
            
            // Extract step outputs with better error handling
            try {
                this.extractSteps();
                
                // Check if steps were found
                const stepKeys = Object.keys(this.steps);
                if (stepKeys.length > 0) {
                    this.activeStep = stepKeys[0];
                    this.hasValidResults = true;
                } else {
                    this.errorMessage = "No analysis steps found in the result data";
                    console.warn("No steps found in result data:", this.result);
                }
                
                // Process and organize findings for each agent
                this.processAgentFindings();
                
                // Generate summary even if some data is missing
                this.generateExecutiveSummary();
                
                // Initialize charts when data is available
                if (this.hasValidResults) {
                    this.$nextTick(() => {
                        this.initializeCharts();
                    });
                }
            } catch (error) {
                this.errorMessage = "Error processing result data: " + error.message;
                console.error("Error initializing result view:", error);
            }
            
            console.log("Initialized with steps:", this.steps);
        },
        
        extractSteps() {
            // Find all step outputs in the result with more flexible matching
            for (const key in this.result) {
                // Accept both "output_step" and direct "step" keys
                if (key.startsWith('output_')) {
                    this.steps[key] = this.result[key];
                } else if (
                    typeof this.result[key] === 'object' && 
                    !Array.isArray(this.result[key]) &&
                    !key.startsWith('execution_') && 
                    !['workflow_type', 'workflow_description', 'workflow_steps'].includes(key)
                ) {
                    // For keys that might be step results but don't have the output_ prefix
                    // Add them with the prefix for consistency
                    this.steps[`output_${key}`] = this.result[key];
                }
            }
            
            // If no steps were found but there's a clear structure in the result,
            // try to intelligently extract step data
            if (Object.keys(this.steps).length === 0) {
                this.attemptDataRecovery();
            }
        },
        
        attemptDataRecovery() {
            // If this is a single-step result, create a synthetic step
            if (this.result.analysis || this.result.recommendations || this.result.reasoning) {
                const stepName = this.result.workflow_type || "analysis";
                this.steps[`output_${stepName}`] = {
                    analysis: this.result.analysis || "",
                    recommendations: this.result.recommendations || [],
                    reasoning: this.result.reasoning || "",
                    data: this.result.data || null
                };
                console.log("Created synthetic step from root result data");
            }
            
            // Look for any object properties that might contain analysis data
            for (const key in this.result) {
                const value = this.result[key];
                if (
                    typeof value === 'object' && 
                    !Array.isArray(value) &&
                    (value.analysis || value.recommendations || value.content)
                ) {
                    this.steps[`output_${key}`] = value;
                    console.log(`Found potential step data in key: ${key}`);
                }
            }
        },
        
        // Add visual feedback for the user when no valid results are found
        getNoResultsMessage() {
            if (this.errorMessage) {
                return this.errorMessage;
            }
            
            if (Object.keys(this.result).length === 0) {
                return "No result data was found. The analysis may have failed to complete.";
            }
            
            return "The result data has an unexpected format. Please check the raw JSON download.";
        },
        
        // [Other methods remain the same...]
    };
}
