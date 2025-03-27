"""
Simplified Claude API client with improved error handling

Path: /api_client.py
Purpose: Provides a robust API client for Claude with proper versioning.
"""

import os
import json
import logging
import requests
from typing import Dict, Any

# Set up logging
logger = logging.getLogger("api_client")

class ClaudeAPIClient:
    """Claude API client with minimal error handling"""
    
    def __init__(self, api_key: str, model: str = "claude-3-opus-20240229"):
        """Initialize the Claude API client
        
        Args:
            api_key: The Anthropic API key
            model: The Claude model to use
        """
        self.api_key = api_key
        self.model = model
        
        # Get API version from environment or use default stable version
        # The version '2023-06-01' is currently the most widely supported
        self.api_version = os.getenv("ANTHROPIC_API_VERSION", "2023-06-01")
        
        # Get timeout from environment or use default
        self.timeout = int(os.getenv("REQUEST_TIMEOUT", "60"))
        
        logger.info(f"Initialized Claude API client with version: {self.api_version}, timeout: {self.timeout}s")
    
    def call_api(self, prompt: str, system_prompt: str = "", max_tokens: int = 4000, temperature: float = 0.7) -> Dict[str, Any]:
        """Call the Claude API with the given prompt
        
        Args:
            prompt: The user message
            system_prompt: System instructions for Claude
            max_tokens: Maximum tokens in the response
            temperature: Controls randomness (0-1)
            
        Returns:
            The parsed response from Claude
            
        Raises:
            Exception: If the API call fails
        """
        # API endpoint
        api_url = "https://api.anthropic.com/v1/messages"
        
        # Request data
        request_data = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        # Add system prompt if provided
        if system_prompt:
            request_data["system"] = system_prompt
        
        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": self.api_version
        }
        
        # Mask the API key for logging
        masked_key = self.api_key[:4] + "..." + self.api_key[-4:] if len(self.api_key) > 8 else "****"
        logger.info(f"Making API call with version: {self.api_version}")
        
        try:
            # Make the API call with configured timeout
            response = requests.post(api_url, headers=headers, json=request_data, timeout=self.timeout)
            
            # Log response status
            logger.info(f"API response status: {response.status_code}")
            
            # Check for success
            if response.status_code == 200:
                logger.info(f"API call successful")
                response_data = response.json()
                
                # Extract and return the response text
                if "content" in response_data and len(response_data["content"]) > 0:
                    content = response_data["content"][0]["text"]
                    return {"content": content, "api_version": self.api_version, "model": self.model}
                else:
                    error_msg = "Unexpected response format - missing content"
                    logger.error(error_msg)
                    raise Exception(error_msg)
            else:
                # Log detailed error information
                error_msg = f"API request failed with status {response.status_code}: {response.text}"
                logger.error(error_msg)
                
                # For 401 errors, provide more specific guidance
                if response.status_code == 401:
                    logger.error("Authentication error: Check that your API key is valid and not expired")
                
                raise Exception(error_msg)
        
        except requests.exceptions.Timeout:
            error_msg = f"API request timed out after {self.timeout} seconds"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        except Exception as e:
            error_msg = f"API request failed: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def parse_response_content(self, content: str) -> Dict[str, Any]:
        """Parse the response content to extract structured data
        
        Args:
            content: The text response from Claude
            
        Returns:
            Parsed JSON as a dictionary
        """
        try:
            # Look for JSON-like blocks within the text
            response_lines = content.split('\n')
            json_block = []
            in_json_block = False
            
            for line in response_lines:
                if line.strip() == "```json" or line.strip() == "{":
                    in_json_block = True
                    if line.strip() == "{":
                        json_block.append(line)
                elif line.strip() == "```" and in_json_block:
                    in_json_block = False
                elif in_json_block:
                    json_block.append(line)
            
            if json_block:
                json_text = "\n".join(json_block)
                return json.loads(json_text)
            
            # Fallback: Try to find a JSON object anywhere in the text
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
                
            # If no JSON found, create a simple structure with the raw text
            return {"response_text": content}
            
        except json.JSONDecodeError:
            return {"response_text": content}
        except Exception as e:
            return {"response_text": content, "parse_error": str(e)}
