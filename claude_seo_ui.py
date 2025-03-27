"""
Claude SEO UI - Flask web interface for the Claude SEO Workflow System

Path: /claude_seo_ui.py
Purpose: Provides a web interface to interact with SEO workflows.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
import os
import json
import uuid
from datetime import datetime

from claude_workflow_orchestrator import ClaudeSEOWorkflowOrchestrator

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'claude-seo-workflow-secret-key'

# Initialize orchestrator
orchestrator = ClaudeSEOWorkflowOrchestrator()

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

# Run the application
def run_app():
    app.run(debug=True, host='0.0.0.0', port=5000)
