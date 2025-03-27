"""
Claude SEO Workflow Orchestrator - Main workflow management system

Path: /claude_workflow_orchestrator.py
Purpose: Manages the execution of SEO workflows using various specialized Claude agents.
         Provides structured workflow templates and handles the organization of results.
"""

from typing import Dict, List, Any
import os
import time
import json
import logging
import datetime
from dotenv import load_dotenv
from api_client import ClaudeAPIClient

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("workflow_orchestrator")

# Load environment variables from .env file
load_dotenv()

# Get model from environment variables
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-opus-20240229")

class ClaudeSEOWorkflowOrchestrator:
    """Orchestrates Claude-based SEO workflows"""
    
    def __init__(self, api_mode="mock", api_key=""):
        """
        Initialize the workflow orchestrator
        
        Args:
            api_mode: 'live' or 'mock' to control API usage
            api_key: Claude API key (if not provided in keys.json)
        """
        logger.info(f"Initializing ClaudeSEOWorkflowOrchestrator in {api_mode} mode")
        
        # Set API mode
        self.api_mode = api_mode
        self.api_key = api_key
        
        # Initialize API client if in live mode
        if self.api_mode == "live" and self.api_key:
            self.api_client = ClaudeAPIClient(self.api_key, CLAUDE_MODEL)
        else:
            self.api_client = None
        
        # Default workflow templates
        self.workflow_templates = {
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
        }
    
    def call_claude_api(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """
        Call the Claude API with the given prompt and system prompt
        
        Args:
            prompt: The user prompt to send to the API
            system_prompt: The system instructions for Claude
            
        Returns:
            The parsed response from Claude as a dictionary
        """
        if self.api_mode != "live" or not self.api_client:
            # Generate a mock response if not in live mode
            logger.info("Using mock API response")
            return self._generate_mock_response(prompt, system_prompt)
        
        try:
            # Call the API using the enhanced client with version fallbacks
            api_response = self.api_client.call_api(prompt, system_prompt)
            
            # Parse the response content
            if "content" in api_response:
                structured_response = self.api_client.parse_response_content(api_response["content"])
                
                # Add API metadata
                structured_response["_api_info"] = {
                    "model": api_response.get("model", CLAUDE_MODEL),
                    "version": api_response.get("api_version", "unknown"),
                    "mock_data": False
                }
                
                return structured_response
            else:
                logger.error("API response missing content field")
                return self._generate_mock_response(prompt, system_prompt)
            
        except Exception as e:
            logger.error(f"API call failed: {str(e)}")
            logger.warning("Falling back to mock mode due to API error")
            return self._generate_mock_response(prompt, system_prompt)
    
    def _generate_mock_response(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """
        Generate a mock response for demo mode
        
        Args:
            prompt: The user prompt
            system_prompt: The system instructions
            
        Returns:
            A mock response dictionary
        """
        # Extract context from the prompt to create a more relevant mock response
        mock_response = {}
        
        if "keyword" in prompt.lower() or "keywords" in prompt.lower():
            mock_response = {
                "analysis": "Analyzed target keywords for potential search traffic and user intent.",
                "recommendations": [
                    "Focus on long-tail keywords with lower competition",
                    "Include semantic variants in your content",
                    "Target question-based keywords for featured snippets"
                ],
                "keyword_groups": {
                    "high_intent": ["buy online", "best price", "near me"],
                    "informational": ["how to", "guide", "tutorial"]
                }
            }
        elif "content" in prompt.lower() and "brief" in prompt.lower():
            mock_response = {
                "analysis": "Created a comprehensive content brief based on target keywords and competitor analysis.",
                "recommendations": [
                    "Structure content with clear H2 and H3 headings",
                    "Include FAQ section to target question-based searches",
                    "Add data visualizations to improve engagement"
                ],
                "content_structure": {
                    "title_options": [
                        "Complete Guide to [Topic]",
                        "How to [Achieve Goal] with [Topic]"
                    ],
                    "sections": [
                        "Introduction",
                        "What is [Topic]",
                        "Benefits of [Topic]",
                        "How to Get Started",
                        "Common Challenges",
                        "Best Practices",
                        "Conclusion"
                    ]
                }
            }
        elif "technical" in prompt.lower() or "audit" in prompt.lower():
            mock_response = {
                "analysis": "Performed a technical SEO audit to identify issues affecting performance and crawlability.",
                "recommendations": [
                    "Fix broken links and redirect chains",
                    "Optimize image sizes and implement lazy loading",
                    "Implement schema markup for rich snippets"
                ],
                "issues": {
                    "critical": [
                        "Slow page speed on mobile devices",
                        "Missing meta descriptions on 12 pages",
                        "Duplicate content on product variations"
                    ],
                    "warning": [
                        "Non-optimized images",
                        "Missing alt text on 8 images",
                        "Shallow content on category pages"
                    ]
                }
            }
        elif "gap" in prompt.lower() or "competitor" in prompt.lower():
            mock_response = {
                "analysis": "Identified content gaps by analyzing competitor content and user search behavior.",
                "recommendations": [
                    "Create content addressing user questions not currently covered",
                    "Expand content on high-value topics with limited current coverage",
                    "Update outdated content with fresh information and statistics"
                ],
                "content_opportunities": [
                    "Beginner's guide to [Topic]",
                    "Comparison of [Topic] vs alternatives",
                    "Case studies showing results from [Topic]"
                ]
            }
        elif "strategy" in prompt.lower():
            mock_response = {
                "analysis": "Developed a comprehensive SEO strategy based on all available data and insights.",
                "recommendations": [
                    "Prioritize technical fixes with highest impact on crawlability",
                    "Create content calendar focused on identified gaps",
                    "Implement structured data to enhance SERP visibility"
                ],
                "priority_actions": [
                    "Fix critical technical issues within 2 weeks",
                    "Produce 3 cornerstone content pieces within 1 month",
                    "Optimize top 10 existing pages for improved conversions"
                ]
            }
        else:
            mock_response = {
                "analysis": "Processed the input data and generated insights.",
                "recommendations": [
                    "Follow best practices for on-page SEO",
                    "Improve content quality and relevance",
                    "Focus on user experience metrics"
                ]
            }
        
        # Add mock data flag
        mock_response["_api_info"] = {
            "model": CLAUDE_MODEL,
            "version": "mock",
            "mock_data": True
        }
        
        return mock_response
    
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
        logger.info(f"Running workflow: {workflow_type}")
        
        if workflow_type not in self.workflow_templates:
            available_workflows = list(self.workflow_templates.keys())
            raise ValueError(f"Unknown workflow type: {workflow_type}. Available workflows: {available_workflows}")
        
        workflow_info = self.workflow_templates[workflow_type]
        workflow_steps = workflow_info["steps"]
        
        # Initialize result with execution summary
        result = {
            "workflow_type": workflow_type,
            "workflow_description": workflow_info["description"],
            "api_mode": self.api_mode,
            "execution_summary": {
                "total_steps_executed": len(workflow_steps),
                "total_execution_time_seconds": 0,
                "average_step_time_seconds": 0,
                "execution_log": []
            }
        }
        
        # Include initial data in result
        for key, value in initial_data.items():
            result[key] = value
        
        # Track total execution time
        total_time = 0
        
        # Execute each workflow step
        current_data = initial_data.copy()
        for step in workflow_steps:
            step_start_time = time.time()
            
            # Create step-specific system prompt
            system_prompt = self._create_system_prompt_for_step(step)
            
            # Format the input data as a structured prompt
            prompt = self._format_input_for_step(step, current_data)
            
            # Call Claude API or generate mock response
            step_output = self.call_claude_api(prompt, system_prompt)
            
            # Calculate execution time
            step_execution_time = time.time() - step_start_time
            total_time += step_execution_time
            
            # Store the input and output for this step
            result[f"input_{step}"] = current_data.copy()
            result[f"output_{step}"] = step_output
            
            # Update current data with step output for next iteration
            current_data.update(step_output)
            
            # Add to execution log
            result["execution_summary"]["execution_log"].append({
                "timestamp": datetime.datetime.now().isoformat(),
                "agent": step,
                "execution_time_seconds": step_execution_time,
                "input_data_keys": list(current_data.keys()),
                "output_data_keys": list(step_output.keys())
            })
        
        # Update execution summary
        result["execution_summary"]["total_execution_time_seconds"] = total_time
        if len(workflow_steps) > 0:
            result["execution_summary"]["average_step_time_seconds"] = total_time / len(workflow_steps)
        
        return result
    
    def run_custom_workflow(self, steps: List[str], initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a custom workflow with specified steps and UI-compatible output"""
        logger.info(f"Running custom workflow with steps: {steps}")
        
        # Create a workflow info for custom workflow
        workflow_info = {
            "description": "Custom workflow with user-selected steps",
            "steps": steps
        }
        
        # Run the workflow using the same method as predefined workflows
        custom_result = self.run_workflow("custom", initial_data)
        
        # Update workflow description
        custom_result["workflow_description"] = workflow_info["description"]
        
        return custom_result
    
    def _create_system_prompt_for_step(self, step: str) -> str:
        """
        Create a system prompt for a specific workflow step
        
        Args:
            step: The workflow step name
            
        Returns:
            A system prompt string tailored to the step
        """
        base_prompt = """You are an expert SEO agent specialized in providing structured analysis and recommendations.
Your task is to analyze the provided input data and generate insights and recommendations.
Always provide your response in a structured JSON format with at least 'analysis' and 'recommendations' fields."""
        
        if step == "keyword_research":
            return base_prompt + """
You specialize in discovering valuable keywords for SEO campaigns based on user input, industry trends, search behavior, and underlying search intent.

Follow these steps:
1. Analyze the provided target topic, industry, website, or business objective
2. Identify primary and secondary keywords that would be valuable targets
3. Evaluate search volume, competition, difficulty, and user intent for each keyword
4. Group keywords into semantic clusters and topic clusters
5. Prioritize keywords based on potential ROI, relevance, intent match, and conversion potential
6. Consider the full search journey across the marketing funnel
7. Provide clear reasoning behind keyword selections and groupings
8. Return a structured analysis with keyword recommendations"""
        
        elif step == "content_brief":
            return base_prompt + """
You specialize in creating comprehensive content briefs for SEO-optimized articles that address user intent and exceed search engines' expectations.

Follow these steps:
1. Analyze the target keyword and thoroughly understand the underlying search intent
2. Research top-ranking content for the keyword to identify patterns and gaps
3. Identify key topics, questions, subtopics, and semantic entities to cover
4. Suggest compelling title options, meta descriptions, and logical heading structure
5. Recommend content length, format, media inclusions, and internal linking strategy
6. Outline specific sections that should be included with rationale for each
7. Consider E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) factors
8. Explain how the content should address different phases of the user journey
9. Return a detailed, structured content brief for writers with clear strategic direction"""
        
        elif step == "content_writer":
            return base_prompt + """
You specialize in writing high-quality, SEO-optimized content that reads naturally and engages human readers while satisfying search intent.

Follow these steps:
1. Analyze the provided content brief thoroughly
2. Create engaging, informative content that matches search intent and sounds completely natural
3. Properly incorporate primary and secondary keywords in a way that flows naturally
4. Structure content with appropriate headings and subheadings to improve readability
5. Include relevant examples, data points, stories, and supportive information
6. Write with a consistent, appropriate tone that matches the target audience
7. Incorporate elements that enhance E-E-A-T signals throughout the content
8. Add appropriate transitional elements between sections for improved flow
9. Return a complete, publishing-ready article that requires minimal editing"""
        
        elif step == "technical_seo":
            return base_prompt + """
You specialize in identifying technical SEO issues and providing recommendations for fixes with clear explanations of impact and importance.

Follow these steps:
1. Analyze the provided technical data for a website
2. Identify critical technical SEO issues and prioritize them by impact
3. Evaluate page speed, mobile-friendliness, and core web vitals
4. Check for crawlability and indexation problems
5. Assess structured data implementation and opportunities
6. Evaluate site architecture and internal linking structure
7. Examine URL structure, redirects, and status code issues
8. Analyze international SEO considerations if applicable
9. Provide detailed explanations of why each issue matters
10. Include specific implementation guidance for fixing issues
11. Return a structured analysis with technical recommendations and prioritization"""
        
        elif step == "content_gap_analysis":
            return base_prompt + """
You specialize in identifying content gaps and opportunities by analyzing competitor content and user needs.

Follow these steps:
1. Analyze the current content inventory of the website
2. Research competitor content for the target keywords and topics
3. Identify topics, questions, and content types that competitors cover but the client doesn't
4. Discover unaddressed user needs and questions related to the topic
5. Evaluate content depth, breadth, and comprehensiveness compared to top-ranking pages
6. Recommend specific content pieces to create with clear justification
7. Suggest improvements to existing content based on competitive analysis
8. Prioritize content opportunities based on potential impact and effort
9. Return a structured content gap analysis with actionable recommendations"""
        
        elif step == "seo_strategy":
            return base_prompt + """
You specialize in developing comprehensive SEO strategies tailored to business goals and market conditions.

Follow these steps:
1. Analyze the business goals, target audience, and competitive landscape
2. Evaluate current SEO performance and identify strengths and weaknesses
3. Develop a comprehensive SEO strategy aligned with business objectives
4. Create a prioritized roadmap of tactical SEO initiatives
5. Recommend specific KPIs and success metrics for the strategy
6. Consider resources required and potential ROI for recommendations
7. Include content, technical, and off-page strategic elements
8. Account for industry trends and search engine algorithm considerations
9. Return a structured SEO strategy with clear rationale and implementation guidance"""
        
        else:
            return base_prompt

    def _format_input_for_step(self, step: str, input_data: Dict[str, Any]) -> str:
        """
        Format input data into a prompt string for a specific step
        
        Args:
            step: The workflow step name
            input_data: The input data dictionary
            
        Returns:
            A formatted prompt string
        """
        formatted_input = f"Input data for {step} analysis:\n\n"
        
        # Include formatted data
        for key, value in input_data.items():
            if isinstance(value, dict) or isinstance(value, list):
                formatted_input += f"{key}: {json.dumps(value, indent=2)}\n\n"
            else:
                formatted_input += f"{key}: {value}\n\n"
        
        # Add task-specific instructions
        if step == "keyword_research":
            formatted_input += """
Please analyze this data and identify valuable target keywords. 
Group them by search intent and provide recommendations for prioritization.
Return your analysis in JSON format with 'analysis' and 'recommendations' fields.
"""
        elif step == "content_brief":
            formatted_input += """
Please create a comprehensive content brief based on this data.
Include title options, content structure, key points to cover, and guidelines for tone and style.
Return your analysis in JSON format with 'analysis' and 'recommendations' fields.
"""
        elif step == "content_writer":
            formatted_input += """
Please write SEO-optimized content based on this data and any content brief provided.
The content should be engaging, informative, and aligned with search intent.
Return your content in JSON format with 'analysis' and 'content' fields.
"""
        elif step == "technical_seo":
            formatted_input += """
Please analyze this data for technical SEO issues and opportunities.
Identify critical issues, prioritize them by impact, and provide implementation guidance.
Return your analysis in JSON format with 'analysis', 'recommendations', and 'issues' fields.
"""
        elif step == "content_gap_analysis":
            formatted_input += """
Please analyze this data to identify content gaps and opportunities.
Compare against competitors, identify unaddressed user needs, and suggest new content.
Return your analysis in JSON format with 'analysis', 'recommendations', and 'content_opportunities' fields.
"""
        elif step == "seo_strategy":
            formatted_input += """
Please develop a comprehensive SEO strategy based on this data.
Include short-term and long-term goals, tactical initiatives, and KPIs.
Return your strategy in JSON format with 'analysis', 'recommendations', and 'priority_actions' fields.
"""
        else:
            formatted_input += """
Please analyze this data and provide insights and recommendations.
Return your analysis in JSON format with 'analysis' and 'recommendations' fields.
"""
        
        return formatted_input
