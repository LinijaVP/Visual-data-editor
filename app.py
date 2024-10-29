from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__, static_folder='build/static', static_url_path='/')

# Path to your JSON file
JSON_FILE_PATH = 'data.json'

# Load the JSON file
def load_json():
    with open(JSON_FILE_PATH, 'r') as file:
        return json.load(file)

# Save to JSON file
def save_json(data):
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(data, file, indent=4)

# Save as to JSON file
def save_as_json(data):
    data = request.json.get('data')  # JSON data to save
    filename = request.json.get('filename')  # New filename

    if not filename:
        return jsonify({'status': 'error', 'message': 'Filename not provided'}), 400

    # Save to the specified filename
    try:
        with open(filename, 'w') as file:
            json.dump(data, file, indent=4)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Route to load JSON data
@app.route('/load_json', methods=['GET'])
def load_json_route():
    data = load_json()
    return jsonify(data)

# upload custom JSON 
@app.route('/upload_json', methods=['POST'])
def upload_json():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.json'):
        try:
            data = json.load(file)  
            return jsonify({"success": True, "data": data}), 200  
        
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON file"}), 400

    return jsonify({"error": "Unsupported file format"}), 400

# Route to save JSON data
@app.route('/save_json', methods=['POST'])
def save_json_route():
    data = request.json
    save_json(data)
    return jsonify({'status': 'success'})

# Route to save as JSON data
@app.route('/save_as_json', methods=['POST'])
def save_as_json_route():
    data = request.json
    return save_as_json(data)

# Home route to serve the editor interface
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
