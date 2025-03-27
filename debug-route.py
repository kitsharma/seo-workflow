# Add this to app.py

@app.route('/debug/results/<result_id>')
def debug_result(result_id):
    """Debug view to inspect raw JSON data structure"""
    result_file = os.path.join(os.getcwd(), 'results', f"{result_id}.json")
    
    if not os.path.exists(result_file):
        return jsonify({"error": "Result file not found"}), 404
    
    try:
        with open(result_file, 'r') as f:
            result = json.load(f)
        
        # Analyze structure
        analysis = {
            "file_size_bytes": os.path.getsize(result_file),
            "top_level_keys": list(result.keys()),
            "has_execution_summary": "execution_summary" in result,
            "output_keys": [k for k in result.keys() if k.startswith("output_")],
            "workflow_type": result.get("workflow_type", "Unknown"),
        }
        
        if "execution_summary" in result:
            analysis["execution_log_count"] = len(result["execution_summary"].get("execution_log", []))
        
        return render_template(
            'debug_result.html', 
            result=result,
            result_id=result_id,
            analysis=analysis
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
