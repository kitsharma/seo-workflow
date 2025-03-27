# achievewith.ai SEO Workflow System

A web-based system for running SEO workflows powered by Claude AI.

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/achievewith-ai-seo-workflow.git
   cd achievewith-ai-seo-workflow
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your API keys and configuration:
   ```
   # Copy example files
   cp .env.example .env
   cp keys.json.example keys.json
   
   # Edit keys.json to add your API keys
   # Edit .env if you need to change any configuration settings
   ```

5. Edit `keys.json` to add your Claude API key and any other secrets.

### Security Configuration

This application uses a two-layer security approach:

1. **Environment Variables (.env)**: Contains non-sensitive configuration settings and references to the keys file
2. **Keys File (keys.json)**: Contains sensitive API keys and secrets

This separation allows you to:
- Keep sensitive keys out of environment variables
- Store keys in a more secure location
- Rotate keys without changing application configuration
- Use different key files for different environments

#### Keys File Structure

The `keys.json` file should contain:

```json
{
  "anthropic": {
    "api_key": "your_claude_api_key_here",
    "org_id": "" 
  },
  "application": {
    "secret_key": "your_application_secret_key_here" 
  }
}
```

The `org_id` field is optional and only needed if you're accessing the API through an organization account. It can be left empty for individual API users.

#### Keys File Location

For maximum security, we recommend storing the keys file outside your project directory:

```
/secure/path/
└── achievewith_keys.json  <-- Store here for maximum security

# OR

/path/to/project/
├── secrets/
│   └── keys.json  <-- Alternative location
└── achievewith-ai-seo-workflow/
    ├── app.py
    └── ...
```

Update your `.env` file to point to your chosen location:
```
KEYS_FILE_PATH=/secure/path/achievewith_keys.json
# Or using a relative path:
# KEYS_FILE_PATH=../secrets/keys.json
```

### Running the Application

Start the server:
```
python app.py
```

The web interface will be available at: http://127.0.0.1:8082

## Features

- Pre-built SEO workflow templates
- Custom workflow creation
- Interactive results viewer
- Download results as JSON
- Supports multiple SEO specializations:
  - Keyword Research
  - Content Briefs
  - Content Writing
  - Technical SEO Audits
  - Content Gap Analysis
  - SEO Strategy Development

## Mock Mode vs. API Mode

The system can operate in two modes:

### Mock Mode

Mock mode generates simulated responses without making actual API calls to Claude:

- **When it's used**: 
  - No API key is provided in the keys file
  - Development and testing scenarios
  - Demonstrations without incurring API costs
  - When the API is unavailable

- **Characteristics**:
  - Generates realistic but simulated responses
  - Executes instantly without API latency
  - No API costs incurred
  - Clearly labeled as mock data in the UI and logs

- **Forcing mock mode**: Add `FORCE_MOCK_MODE=true` to your `.env` file to use mock mode even when an API key is available

### API Mode (Live)

API mode makes real calls to the Claude API:

- **When it's used**:
  - Valid API key is provided in the keys file
  - Production use cases
  - When high-quality AI responses are required

- **Characteristics**:
  - High-quality, context-aware responses from Claude
  - Subject to API rate limits and costs
  - Real-time processing with API latency
  - Clearly labeled as live API in the UI and logs

### How Mode Is Determined

The system automatically determines the mode based on:
1. The presence of a valid Claude API key in the keys file
2. The `FORCE_MOCK_MODE` environment variable (if set)

### Mode Indicators

You can identify which mode is active through:
- Console logs when the system starts
- Visual indicator in the web interface
- "api_mode" field in JSON results

## Development

### Project Structure

- `app.py`: Main application entry point
- `claude_workflow_orchestrator.py`: Core orchestration logic
- `claude_agent_framework.py`: Base classes for Claude agents
- `claude_seo_agents.py`: Specialized SEO agent implementations
- `templates/`: HTML templates for the web interface
- `static/`: Static assets (CSS, JS, images)
- `results/`: Storage location for workflow results

## License

This project is licensed under the MIT License - see the LICENSE file for details.
