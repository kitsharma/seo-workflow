"""
Key Manager Module for achievewith.ai SEO Workflow System

Path: /key_manager.py
Purpose: Provides secure access to API keys and sensitive configuration with diagnostic capabilities.
"""

import os
import json
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("key_manager")

class KeyManager:
    """Manages secure access to API keys and secrets with detailed diagnostics"""
    
    def __init__(self):
        """Initialize the key manager and load keys"""
        self.keys = {}
        self.keys_loaded = False
        self.keys_file_path = os.getenv("KEYS_FILE_PATH", "keys.json")
        self.diagnostics = {
            "status": "unknown",
            "message": "Key manager not initialized",
            "details": [],
            "keys_file_path": self.keys_file_path
        }
        self.load_keys()
    
    def load_keys(self) -> None:
        """Load keys from the specified JSON file with diagnostic information"""
        self.diagnostics["keys_file_path"] = self.keys_file_path
        
        try:
            # Support both absolute and relative paths
            file_path = Path(self.keys_file_path)
            
            # Convert to absolute path for logging clarity
            abs_path = file_path.absolute()
            self.diagnostics["absolute_path"] = str(abs_path)
            
            logger.info(f"Attempting to load keys from: {abs_path}")
            
            # Check if file exists
            if not file_path.exists():
                self.diagnostics["status"] = "file_not_found"
                self.diagnostics["message"] = f"Keys file not found at {abs_path}"
                logger.warning(f"Keys file not found at {abs_path}. Running in mock mode.")
                return
            
            # Check file size
            if file_path.stat().st_size == 0:
                self.diagnostics["status"] = "empty_file"
                self.diagnostics["message"] = f"Keys file exists but is empty: {abs_path}"
                logger.warning(f"Keys file exists but is empty: {abs_path}")
                return
                
            # Try to read the file with detailed error handling
            try:
                with open(file_path, 'r') as f:
                    file_content = f.read()
                    
                # Log a truncated version of the content for debugging (careful not to expose full keys)
                content_sample = file_content[:20] + "..." if len(file_content) > 20 else file_content
                logger.debug(f"Read file content: {content_sample}")
                
                try:
                    self.keys = json.loads(file_content)
                    self.keys_loaded = True
                    logger.info(f"Successfully loaded keys from {abs_path}")
                    
                    # Basic validation
                    if not isinstance(self.keys, dict):
                        self.diagnostics["status"] = "invalid_format"
                        self.diagnostics["message"] = "Keys file must contain a JSON object"
                        logger.error(f"Keys file contains invalid format: {abs_path}")
                        self.keys = {}
                        self.keys_loaded = False
                        return
                    
                    # Check for required keys
                    anthropic_key = self.get_key("anthropic", "api_key")
                    if not anthropic_key:
                        self.diagnostics["status"] = "missing_key"
                        self.diagnostics["message"] = "No Anthropic API key found in keys file"
                        logger.warning("No Anthropic API key found in keys file")
                    else:
                        self.diagnostics["status"] = "success"
                        self.diagnostics["message"] = "Keys loaded successfully"
                        # Log partial key for verification (first 4 chars only)
                        key_prefix = anthropic_key[:4] if len(anthropic_key) > 4 else anthropic_key
                        logger.info(f"Found Anthropic API key starting with: {key_prefix}...")
                
                except json.JSONDecodeError as json_err:
                    self.diagnostics["status"] = "invalid_json"
                    self.diagnostics["message"] = f"Invalid JSON format in keys file: {str(json_err)}"
                    self.diagnostics["details"].append(str(json_err))
                    logger.error(f"Invalid JSON format in keys file: {str(json_err)}")
            
            except PermissionError as perm_err:
                self.diagnostics["status"] = "permission_denied"
                self.diagnostics["message"] = f"Permission denied when trying to read keys file: {abs_path}"
                self.diagnostics["details"].append(str(perm_err))
                logger.error(f"Permission denied when trying to read keys file: {abs_path}")
            
            except Exception as read_err:
                self.diagnostics["status"] = "read_error"
                self.diagnostics["message"] = f"Error reading keys file: {str(read_err)}"
                self.diagnostics["details"].append(str(read_err))
                logger.error(f"Error reading keys file: {str(read_err)}")
        
        except Exception as e:
            self.diagnostics["status"] = "unexpected_error"
            self.diagnostics["message"] = f"Unexpected error loading keys: {str(e)}"
            self.diagnostics["details"].append(str(e))
            logger.error(f"Unexpected error loading keys: {str(e)}")
    
    def get_key(self, provider: str, key_name: str) -> str:
        """
        Get a specific key for a provider
        
        Args:
            provider: The service provider (e.g., 'anthropic')
            key_name: The specific key name (e.g., 'api_key')
            
        Returns:
            The key value or empty string if not found
        """
        if not self.keys_loaded:
            return ""
        
        try:
            return self.keys.get(provider, {}).get(key_name, "")
        except Exception as e:
            logger.error(f"Error retrieving key {provider}.{key_name}: {str(e)}")
            return ""
    
    def get_diagnostic_info(self) -> dict:
        """Get diagnostic information about the key loading process"""
        return self.diagnostics
    
    def get_api_mode_info(self) -> tuple:
        """
        Get information about the current API mode
        
        Returns:
            A tuple of (mode, reason) where:
                mode: 'live' or 'mock'
                reason: Human-readable explanation of the mode
        """
        # Check for forced mock mode first
        if os.getenv("FORCE_MOCK_MODE", "").lower() == "true":
            return 'mock', "Mock mode is forced by FORCE_MOCK_MODE setting"
        
        # Check key loading status
        if not self.keys_loaded:
            return 'mock', self.diagnostics["message"]
        
        # Check for Anthropic API key
        if not self.get_key("anthropic", "api_key"):
            return 'mock', "No Anthropic API key found in keys file"
        
        # All checks passed
        return 'live', "Using live Claude API with valid key"
