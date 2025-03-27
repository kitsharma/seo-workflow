"""
Claude SEO Workflow Orchestrator - Main workflow management system

Path: /claude_workflow_orchestrator.py
Purpose: Manages the execution of SEO workflows using various specialized Claude agents.
Provides structured workflow templates and handles the organization of results.
"""

import os
import time
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from claude_agent_framework import SEOWorkflow
from claude_seo_agents import (
    KeywordResearchAgent,
    ContentBriefAgent,
    ContentWriterAgent,
    TechnicalSEOAgent,
    ContentGapAnalysisAgent,
    SEOStrategyAgent
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('seo_workflow_orchestrator')

class ClaudeSEOWorkflowOrchestrator:
    """Orchestrates Claude-based SEO workflows"""
    
    def __init__(self):
        """Initialize the workflow orchestrator"""
        # Create workflow instance
        self.workflow = SEOWorkflow()
        
        # Register all available agents
        self._register_agents()
        
        # Define workflow templates
        self.workflow_templates = self._define_workflow_templates()
    
    def _register_agents(self) -> None:
        """Register all available agents with the workflow"""
        # Create agent instances
        keyword_research_agent = KeywordResearchAgent()
        content_brief_agent = ContentBriefAgent()
        content_writer_agent = ContentWriterAgent()
        technical_seo_agent = TechnicalSEOAgent()
        content_gap_analysis_agent = ContentGapAnalysisAgent()
        seo_strategy_agent = SEOStrategyAgent()
        
        # Register agents with workflow
        self.workflow.register_agent("keyword_research", keyword_research_agent)
        self.workflow.register_agent("content_brief", content_brief_agent)
        self.workflow.register_agent("content_writer", content_writer_agent)
        self.workflow.register_agent("technical_seo", technical_seo_agent)
        self.workflow.register_agent("content_gap_analysis", content_gap_analysis_agent)
        self.workflow.register_agent("seo_strategy", seo_strategy_agent)
        
        logger.info("Registered all agents with workflow system")
    
    def _define_workflow_templates(self) -> Dict[str, Dict[str, Any]]:
        """Define available workflow templates"""
        return {
            "content_strategy": {
                "description": "Develop a comprehensive content strategy based on keyword research and content gap analysis",
                "steps": ["keyword_research", "content_gap_analysis", "seo_strategy"]
            },
            "content_creation": {
                "description": "Create high-quality, SEO-optimized content based on keyword research and a detailed content brief",
                "steps": ["keyword_research", "content_brief", "content_writer"]
            },
            "technical_audit": {
                "description": "Perform a technical SEO audit to identify issues and opportunities for improvement",
                "steps": ["technical_seo", "seo_strategy"]
            },
            "full_seo_analysis": {
                "description": "Comprehensive SEO analysis including keyword research, content gaps, and technical recommendations",
                "steps": ["keyword_research", "content_gap_analysis", "technical_seo", "seo_strategy"]
            }
            # Placeholder for new workflow types
            # Additional workflow templates can be added here
        }
    
    def get_available_workflows(self) -> Dict[str, str]:
        """Get all available workflow templates with descriptions"""
        return {
            name: info["description"] 
            for name, info in self.workflow_templates.items()
        }
    
    def get_agent_descriptions(self) -> Dict[str, str]:
        """Get descriptions of all available agents"""
        return {
            "keyword_research": "Discovers valuable keywords with intent understanding",
            "content_brief": "Creates content briefs with strategic direction",
            "content_writer": "Generates naturally flowing, SEO-optimized content",
            "technical_seo": "Identifies and explains technical improvements",
            "content_gap_analysis": "Identifies content opportunities",
            "seo_strategy": "Develops comprehensive SEO strategies"
        }
    
    def run_workflow(self, workflow_type: str, initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a predefined workflow template with UI-compatible output"""
        if workflow_type not in self.workflow_templates:
            available_workflows = list(self.workflow_templates.keys())
            raise ValueError(f"Unknown workflow type: {workflow_type}. Available workflows: {available_workflows}")
        
        workflow_info = self.workflow_templates[workflow_type]
        workflow_steps = workflow_info["steps"]
        
        logger.info(f"Starting workflow: {workflow_type} with {len(workflow_steps)} steps")
        
        start_time = time.time()
        result = self.workflow.execute_workflow(initial_data, workflow_steps)
        execution_time = time.time() - start_time
        
        logger.info(f"Workflow {workflow_type} completed in {execution_time:.2f} seconds")
        
        # Format result for UI compatibility
        return self._format_for_ui(result, workflow_type, workflow_info)

    def run_custom_workflow(self, steps: List[str], initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a custom workflow with specified steps and UI-compatible output"""
        # Validate that all steps have registered agents
        for step in steps:
            if step not in self.workflow.agents:
                available_agents = list(self.workflow.agents.keys())
                raise ValueError(f"No agent registered for step: {step}. Available agents: {available_agents}")
        
        logger.info(f"Starting custom workflow with {len(steps)} steps")
        
        start_time = time.time()
        result = self.workflow.execute_workflow(initial_data, steps)
        execution_time = time.time() - start_time
        
        logger.info(f"Custom workflow completed in {execution_time:.2f} seconds")
        
        # Format for UI compatibility
        workflow_info = {
            "steps": steps,
            "description": "Custom workflow with user-selected steps"
        }
        return self._format_for_ui(result, "custom", workflow_info)

    def _format_for_ui(self, result: Dict[str, Any], workflow_type: str, workflow_info: Dict[str, Any]) -> Dict[str, Any]:
        """Format the workflow results to ensure compatibility with the UI template"""
        # Add execution summary
        result["execution_summary"] = self.workflow.get_execution_summary()
        result["workflow_type"] = workflow_type
        result["workflow_description"] = workflow_info["description"]
        
        # Ensure each step output has the expected "output_" prefix
        for step in workflow_info["steps"]:
            # Check if we have raw step data (from execution_workflow) that needs prefixing
            step_key = f"input_{step}"
            if step_key in result and step not in result and f"output_{step}" not in result:
                # This might be a case where step output was stored without prefix
                for key in list(result.keys()):
                    if key == step:
                        # Rename to have the expected prefix
                        result[f"output_{step}"] = result.pop(key)
                        logger.info(f"Renamed result key '{step}' to 'output_{step}' for UI compatibility")
        
        # Ensure each step has minimum required fields for UI rendering
        for key in list(result.keys()):
            if key.startswith("output_"):
                step_data = result[key]
                if isinstance(step_data, dict):
                    # Ensure each step output has the basic fields the UI expects
                    if not "analysis" in step_data and not "response_text" in step_data:
                        # If there's no analysis, use any text field we can find
                        for text_field in ["output", "result", "text", "content"]:
                            if text_field in step_data:
                                step_data["analysis"] = step_data[text_field]
                                break
                        # If still no analysis, create a placeholder
                        if not "analysis" in step_data:
                            step_data["analysis"] = "No detailed analysis available for this step."
                    
                    # Ensure recommendations is at least an empty array
                    if not "recommendations" in step_data:
                        step_data["recommendations"] = []
                elif isinstance(step_data, str):
                    # If the output is just a string, convert to expected format
                    result[key] = {
                        "analysis": step_data,
                        "recommendations": []
                    }
        
        return result