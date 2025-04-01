import os
import json

# Build the absolute path to secrets/keys.json
secrets_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../secrets/keys.json"))

# Print the full path for debugging
print(f"Looking for secrets file at: {secrets_path}")

# Load and print the API key
try:
    with open(secrets_path, "r") as f:
        key_data = json.load(f)
        api_key = key_data.get("anthropic", {}).get("api_key")
        print("API Key:", api_key)
except Exception as e:
    print(f"❌ Error reading API key: {e}")
