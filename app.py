"""
achievewith.ai SEO Workflow System - Main Application

Path: /app.py
Purpose: Entry point for the achievewith.ai SEO Workflow System that runs the web UI.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
import os
import json
import uuid
import shutil
import logging
from datetime import datetime

from key_manager import KeyManager
from claude_workflow_orchestrator import ClaudeSEOWorkflowOrchestrator

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("app")

# Initialize Flask app
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'achievewith-ai-seo-workflow-secret-key'

# Initialize key manager
key_manager = KeyManager()

# Get API mode info
api_mode, api_mode_reason = key_manager.get_api_mode_info()
api_diagnostics = key_manager.get_diagnostic_info()

# Get API key if available - Fixed the argument count here
anthropic_api_key = key_manager.get_key("anthropic", "api_key")

# Initialize orchestrator with API mode and key information
orchestrator = ClaudeSEOWorkflowOrchestrator(api_mode=api_mode, api_key=anthropic_api_key)

# Register template context processor to add API mode to all templates
@app.context_processor
def inject_api_mode():
    return {
        'api_mode': api_mode, 
        'api_mode_reason': api_mode_reason,
        'keys_file_path': api_diagnostics.get('keys_file_path', 'Not specified')
    }

@app.route('/')
def index():
    """Render the main dashboard"""
    workflows = orchestrator.get_available_workflows()
    
    # Get recent results
    results = []
    results_dir = os.path.join(os.getcwd(), 'results')
    if os.path.exists(results_dir):
        result_files = sorted(
            [f for f in os.listdir(results_dir) if f.endswith('.json')],
            key=lambda x: os.path.getmtime(os.path.join(results_dir, x)),
            reverse=True
        )[:5]  # Get 5 most recent results
        
        for result_file in result_files:
            try:
                with open(os.path.join(results_dir, result_file), 'r') as f:
                    result_data = json.load(f)
                    
                result_id = os.path.splitext(result_file)[0]
                timestamp = datetime.fromtimestamp(
                    os.path.getmtime(os.path.join(results_dir, result_file))
                ).strftime('%Y-%m-%d %H:%M:%S')
                
                results.append({
                    'id': result_id,
                    'workflow_type': result_data.get('workflow_type', 'Unknown'),
                    'timestamp': timestamp,
                    'steps': len(result_data.get('execution_summary', {}).get('execution_log', []))
                })
            except Exception as e:
                print(f"Error loading result file {result_file}: {str(e)}")
    
    return render_template('index.html', workflows=workflows, results=results)

@app.route('/workflow/<workflow_type>')
def workflow_config(workflow_type):
    """Render the workflow configuration page"""
    workflows = orchestrator.get_available_workflows()
    
    if workflow_type == 'custom':
        workflow_description = "Build your own workflow by combining specialized agents."
        agents = orchestrator.get_agent_descriptions()
    else:
        if workflow_type not in workflows:
            return redirect(url_for('index'))
            
        workflow_description = workflows[workflow_type]
        agents = {}
    
    return render_template(
        'workflow_config.html',
        workflow_type=workflow_type,
        workflow_description=workflow_description,
        agents=agents
    )

@app.route('/start_workflow', methods=['POST'])
def start_workflow():
    """Start a workflow with the provided configuration"""
    data = request.json
    workflow_type = data.get('workflow_type')
    workflow_data = data.get('data', {})
    
    if workflow_type == 'custom':
        steps = data.get('steps', [])
        if not steps:
            return jsonify({'error': 'No steps selected for custom workflow'}), 400
            
        try:
            result = orchestrator.run_custom_workflow(steps, workflow_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        try:
            result = orchestrator.run_workflow(workflow_type, workflow_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Add API mode information to result
    result['api_mode'] = api_mode
    result['api_mode_reason'] = api_mode_reason
    
    # Generate a unique ID for the result
    result_id = str(uuid.uuid4())
    
    # Save the result
    results_dir = os.path.join(os.getcwd(), 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    with open(os.path.join(results_dir, f"{result_id}.json"), 'w') as f:
        json.dump(result, f, indent=2)
    
    return jsonify({'success': True, 'result_id': result_id})

@app.route('/results/<result_id>')
def view_result(result_id):
    """Render the result view page"""
    result_file = os.path.join(os.getcwd(), 'results', f"{result_id}.json")
    
    if not os.path.exists(result_file):
        return redirect(url_for('index'))
    
    with open(result_file, 'r') as f:
        result = json.load(f)
    
    return render_template('result_view.html', result=result, result_id=result_id)

@app.route('/download/<result_id>')
def download_result(result_id):
    """Download the result as a JSON file"""
    result_file = os.path.join(os.getcwd(), 'results', f"{result_id}.json")
    
    if not os.path.exists(result_file):
        return redirect(url_for('index'))
    
    return send_file(result_file, as_attachment=True, download_name=f"{result_id}.json")

@app.route('/system-info')
def system_info():
    """Display system configuration and diagnostic information"""
    info = {
        'api_mode': api_mode,
        'api_mode_reason': api_mode_reason,
        'key_diagnostics': api_diagnostics,
        'environment': {
            'KEYS_FILE_PATH': os.getenv('KEYS_FILE_PATH', 'Not set'),
            'CLAUDE_MODEL': os.getenv('CLAUDE_MODEL', 'Not set'),
            'ANTHROPIC_API_VERSION': os.getenv('ANTHROPIC_API_VERSION', 'Not set'),
            'FORCE_MOCK_MODE': os.getenv('FORCE_MOCK_MODE', 'Not set'),
            'DEBUG': os.getenv('DEBUG', 'Not set'),
            'PORT': os.getenv('PORT', 'Not set'),
            'HOST': os.getenv('HOST', 'Not set'),
        }
    }
    
    return render_template('system_info.html', info=info)

def setup_images():
    """Set up all required images"""
    img_dir = os.path.join(app.static_folder, 'img')
    os.makedirs(img_dir, exist_ok=True)
    
    # Path for logo
    logo_path = os.path.join(img_dir, 'logo.png')
    
    # Path for large genie image
    large_genie_path = os.path.join(img_dir, 'genie_800x600.png')
    
    # Check if the genie images are available in the root directory
    genie_icon_path = os.path.join(os.getcwd(), 'genie.png')
    large_genie_source = os.path.join(os.getcwd(), 'genie_800x600.png')
    
    # Copy the icon genie if available
    if os.path.exists(genie_icon_path) and not os.path.exists(logo_path):
        shutil.copy(genie_icon_path, logo_path)
        print(f"Set genie icon as logo: {logo_path}")
    
    # Copy the large genie if available
    if os.path.exists(large_genie_source) and not os.path.exists(large_genie_path):
        shutil.copy(large_genie_source, large_genie_path)
        print(f"Set large genie image: {large_genie_path}")
    
    # Check if images exist
    logo_exists = os.path.exists(logo_path)
    large_genie_exists = os.path.exists(large_genie_path)
    
    return logo_exists, large_genie_exists

if __name__ == '__main__':
    # Display API mode info
    print(f"API Mode: {api_mode.upper()}")
    print(f"Reason: {api_mode_reason}")
    print(f"Keys File Path: {api_diagnostics.get('keys_file_path')}")
    print(f"Absolute Path: {api_diagnostics.get('absolute_path', 'Not resolved')}")
    
    # Display API key information (masked)
    if anthropic_api_key:
        masked_key = anthropic_api_key[:4] + "..." + anthropic_api_key[-4:] if len(anthropic_api_key) > 8 else "****"
        print(f"API Key: {masked_key}")
    else:
        print("API Key: Not found")
    
    # Ensure the genie images are set up
    logo_exists, large_genie_exists = setup_images()
    
    if logo_exists:
        print("Genie logo is set up successfully.")
    else:
        print("Warning: Could not find genie icon. Please place genie.png in the application directory.")
    
    if large_genie_exists:
        print("Large genie image is set up successfully.")
    else:
        print("Warning: Could not find large genie image. Please place genie_800x600.png in the application directory.")
    
    print("Starting achievewith.ai SEO Workflow System...")
    print("Access the web interface at http://127.0.0.1:8082")
    app.run(debug=True, host='127.0.0.1', port=8082)
