from flask import Flask, render_template, redirect, url_for, jsonify, session, request, send_from_directory
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import config

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

load_dotenv()
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# API endpoints first
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        print("Received chat request")  # Debug print
        data = request.json
        print(f"Request data: {data}")  # Debug print
        
        message = data.get('message')
        inventory = data.get('inventory', [])
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful foraging assistant. Help users identify plants and provide advice on their uses."},
                {"role": "user", "content": message}
            ],
            temperature=0.7
        )
        
        return jsonify({
            'message': response.choices[0].message.content
        })
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/test')
def test_api():
    return jsonify(message="Backend is working!")

# Then other routes
@app.route("/")
def home():
    return redirect(url_for("project_select"))

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)