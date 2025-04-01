"""
achievewith.ai SEO Workflow System - Secure Config Helper

Path: /config_secure.py
Purpose: Provides functions to securely get API keys from environment or keys file
"""

import os
import json
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("config_secure")

# Set to False to enable live API calls if keys are available
FORCE_MOCK_MODE = False

# Path to secrets file - using the secrets directory in the parent folder
SECRETS_PATH = os.getenv("SECRETS_PATH", "../secrets/keys.json")

def get_api_key(key_type="anthropic", default=""):
    """
    Get API key from environment variables or keys file
    
    Args:
        key_type: The type of API key to get (anthropic, etc.)
        default: Default value if key not found
        
    Returns:
        The API key or default value
    """
    # Return default if mock mode is forced
    if FORCE_MOCK_MODE:
        logger.info(f"Mock mode is forced, returning default value for {key_type} API key")
        return default
        
    # Try environment variable first - most secure
    env_var_name = f"{key_type.upper()}_API_KEY"
    api_key = os.getenv(env_var_name)
    
    if api_key:
        logger.info(f"Using {key_type} API key from environment variable {env_var_name}")
        return api_key
        
    # Try keys file as fallback
    try:
        keys_file = os.getenv("KEYS_FILE_PATH", SECRETS_PATH)
        
        if os.path.exists(keys_file):
            with open(keys_file, 'r') as f:
                keys_data = json.load(f)
                
            # Check for both "api_key" and "anthropic_api_key" for compatibility
            api_key = keys_data.get(key_type, {}).get("anthropic_api_key")
            if not api_key:
                api_key = keys_data.get(key_type, {}).get("api_key")
            
            if api_key and api_key != "your_claude_api_key_here":
                logger.info(f"Using {key_type} API key from keys file")
                return api_key
            else:
                logger.warning(f"API key in keys file is empty or a placeholder value")
        else:
            logger.warning(f"Keys file not found: {keys_file}")
    
    except Exception as e:
        logger.error(f"Error reading API key from keys file: {str(e)}")
    
    # Use the provided default value
    logger.warning(f"No valid {key_type} API key found, using default/mock mode")
    return default

def set_env_from_keys_file():
    """Set environment variables from keys file for consistency"""
    # Don't change environment if mock mode is forced
    if FORCE_MOCK_MODE:
        return
        
    try:
        keys_file = os.getenv("KEYS_FILE_PATH", SECRETS_PATH)
        
        if os.path.exists(keys_file):
            with open(keys_file, 'r') as f:
                keys_data = json.load(f)
                
            # Set Anthropic key - check for both field names
            if "anthropic" in keys_data:
                api_key = None
                # Try anthropic_api_key first (new field name)
                if "anthropic_api_key" in keys_data["anthropic"]:
                    api_key = keys_data["anthropic"]["anthropic_api_key"]
                    logger.info("Found anthropic_api_key in keys file")
                # Fallback to api_key (old field name)
                elif "api_key" in keys_data["anthropic"]:
                    api_key = keys_data["anthropic"]["api_key"]
                    logger.info("Found api_key in keys file")
                
                if api_key and api_key != "your_claude_api_key_here":
                    os.environ["ANTHROPIC_API_KEY"] = api_key
                    logger.info("Set ANTHROPIC_API_KEY from keys file")
            
            # Set other keys as needed
            # ...
            
    except Exception as e:
        logger.error(f"Error setting environment variables from keys file: {str(e)}")