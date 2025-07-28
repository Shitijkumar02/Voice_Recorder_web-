from flask import Flask, render_template, request, send_from_directory, jsonify
import os
from datetime import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'recordings'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('Voice_Recorder_web.html')

@app.route('/upload', methods=['POST'])
def upload():
    audio = request.files['audio_data']
    filename = f"recording_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.wav"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    audio.save(filepath)
    return {'filename': filename}

@app.route('/recordings/<filename>')
def serve_recording(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/list')
def list_recordings():
    files = os.listdir(UPLOAD_FOLDER)
    files.sort(reverse=True)
    return jsonify(files)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_recording(filename):
    try:
        os.remove(os.path.join(UPLOAD_FOLDER, filename))
        return {'status': 'deleted'}
    except FileNotFoundError:
        return {'error': 'file not found'}, 404

if __name__ == '__main__':
    app.run(debug=True)
