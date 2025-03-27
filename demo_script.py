#!/usr/bin/env python3
"""
Claude SEO Workflow System - Demo Script

This script runs a simple SEO workflow without the web UI,
to test that the core functionality works correctly.
"""

import os
import json
from dotenv import load_dotenv
from claude_workflow_orchestrator import ClaudeSEOWorkflowOrchestrator

# Load environment variables
load_dotenv()

def main():
    """Run a simple demo workflow"""
    
    print("Starting Claude SEO Workflow Demo...")
    
    # Check if API key is set
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        print("Please set it in the .env file.")
        return
    
    # Create orchestrator
    orchestrator = ClaudeSEOWorkflowOrchestrator()
    
    # Get available workflows
    workflows = orchestrator.get_available_workflows()
    print("\nAvailable workflows:")
    for name, description in workflows.items():
        print(f"- {name}: {description}")
    
    # Create sample input data
    input_data = {
        "website_url": "https://achievewith.ai",
        "target_keywords": "artificial intelligence, machine learning, neural networks",
        "industry": "Technology",
        "target_audience": "Technical professionals, data scientists, software engineers",
        "additional_information": "We want to improve our website's SEO for AI-related topics."
    }
    
    # Run a technical audit workflow (shortest one)
    workflow_type = "technical_audit"
    
    print(f"\nRunning {workflow_type} workflow...")
    print("This will take a few moments as Claude processes the request...")
    
    try:
        result = orchestrator.run_workflow(workflow_type, input_data)
        
        # Save the result
        os.makedirs("results", exist_ok=True)
        result_file = os.path.join("results", "demo_result.json")
        with open(result_file, "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"\nWorkflow completed successfully!")
        print(f"Results saved to {result_file}")
        
        # Print a summary
        execution_summary = result["execution_summary"]
        print("\nExecution summary:")
        print(f"- Total steps executed: {execution_summary['total_steps_executed']}")
        print(f"- Total execution time: {execution_summary['total_execution_time_seconds']:.2f} seconds")
        
        # Print the first recommendation (if available)
        output_key = "output_technical_seo"
        if output_key in result and "recommendations" in result[output_key]:
            recommendations = result[output_key]["recommendations"]
            if recommendations:
                print("\nSample recommendation:")
                print(f"- {recommendations[0]}")
        
    except Exception as e:
        print(f"Error running workflow: {str(e)}")

if __name__ == "__main__":
    main()
