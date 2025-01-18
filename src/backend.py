from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from pymongo import MongoClient

app = Flask(__name__)

# Allow only requests from your GitHub Pages domain
CORS(app, origins=["https://tommaiberone.github.io"], supports_credentials=True)

API_KEY = "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"

def connect_to_db():
    # Replace with your connection string
    connection_string = "mongodb+srv://<backend_user>:<1m10eVZpWVIOl3XA>@moraltorturemachineclus.zvs9u.mongodb.net/?retryWrites=true&w=majority&appName=MoralTortureMachineCluster"

    # Create a client
    client = MongoClient(connection_string)

    # Access a specific database
    db = client['MoralTortureMachine']

    return db

@app.route('/get-dilemma', methods=['GET'])
def get_dilemma():
    try:
        db = connect_to_db()

        # Access a specific collection
        collection = db['dilemmas']

        # Find a random document
        dilemma = collection.aggregate([{ "$sample": { "size": 1 } }]).next()

        return jsonify(dilemma), 200
    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/generate-dilemma', methods=['POST'])
def generate_dilemma():
    try:
        # Updated payload for the external API
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {
                    "role": "user",
                    "content": (
                        'Generate a concise ethical dilemma (40-80 words) with two challenging options. '
                        'Each option should present a valid but contrasting viewpoint, encouraging reflection. '
                        'Add a light tease for each option to make the dilemma more engaging. '
                        'Ensure balance and complexity, avoiding oversimplified choices. '
                        'Respond strictly in JSON format with the following structure: '
                        "{\"dilemma\": \"...\", \"firstAnswer\": \"...\", \"secondAnswer\": \"...\", "
                        "\"teaseOption1\": \"...\", \"teaseOption2\": \"...\"} "
                        'Here is an example of a good answer (just the json, with the correct structure): '
                        "{\"dilemma\": \"A community leader must decide whether to allocate limited resources to rebuilding homes after a natural disaster or invest in long-term educational programs to prevent future vulnerabilities. Allocating resources to immediate rebuilding could restore lives quickly but might neglect future preparedness. On the other hand, investing in education could strengthen the community's resilience but delay immediate relief efforts.\", "
                        "\"firstAnswer\": \"Rebuild homes\", "
                        "\"secondAnswer\": \"Invest in education\", "
                        "\"teaseOption1\": \"Prioritizing now over later? Interesting choice! 🤔\", "
                        "\"teaseOption2\": \"Planning for the future, but at what cost? 🤨\"}"
                        'FORMAT THE ANSWER STRICTLY IN THE JSON I PROVIDED! NOTHING BUT THE JSON SHOULD BE IN YOUR ANSWER'
                    )
                },
            ],
        }

        app.logger.info(f"Prepared payload: {payload}")

        api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(api_url, headers=headers, json=payload)
        app.logger.info(f"External API response: {response.status_code}, {response.text}")

        if response.status_code != 200:
            return jsonify({"error": f"Error from external API: {response.status_code}"}), response.status_code

        return jsonify(response.json()), 200
    except Exception as e:
        app.logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
