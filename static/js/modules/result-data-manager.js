/**
 * achievewith.ai - Result Data Manager
 * 
 * Responsible for loading and managing the result data.
 */

export class ResultDataManager {
  /**
   * Constructor
   */
  constructor() {
    this.resultData = null;
  }
  
  /**
   * Load result data from the page
   * @returns {Promise<Object>} The result data
   */
  async loadResultData() {
    try {
      // Get the data from the script tag
      const dataScript = document.getElementById('seo-results-data');
      if (dataScript) {
        this.resultData = JSON.parse(dataScript.textContent);
        return this.resultData;
      }
      
      // If not found, check if Alpine.js has already loaded it
      if (window.Alpine) {
        const resultElement = document.querySelector('[x-data]');
        if (resultElement) {
          this.resultData = window.Alpine.evaluate(resultElement, 'result');
          if (this.resultData && Object.keys(this.resultData).length > 0) {
            return this.resultData;
          }
        }
      }
      
      // If still no data, check for a global variable
      if (window.seoAnalysisResults) {
        this.resultData = window.seoAnalysisResults;
        return this.resultData;
      }
      
      // If still not found, throw error
      throw new Error('No result data found');
    } catch (error) {
      console.error('Error loading result data:', error);
      throw error;
    }
  }
  
  /**
   * Get data from a specific step
   * @param {string} stepKey - The step key
   * @returns {Object|null} The step data or null if not found
   */
  getStepData(stepKey) {
    if (!this.resultData) {
      return null;
    }
    
    return this.resultData[stepKey] || null;
  }
  
  /**
   * Get execution summary
   * @returns {Object|null} The execution summary or null if not found
   */
  getExecutionSummary() {
    if (!this.resultData || !this.resultData.execution_summary) {
      return null;
    }
    
    return this.resultData.execution_summary;
  }
  
  /**
   * Get workflow type
   * @returns {string} The workflow type or 'Unknown' if not found
   */
  getWorkflowType() {
    if (!this.resultData || !this.resultData.workflow_type) {
      return 'Unknown';
    }
    
    return this.resultData.workflow_type;
  }
  
  /**
   * Get workflow description
   * @returns {string} The workflow description or empty string if not found
   */
  getWorkflowDescription() {
    if (!this.resultData || !this.resultData.workflow_description) {
      return '';
    }
    
    return this.resultData.workflow_description;
  }
}
