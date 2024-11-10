from helper import process
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import config
import os

app = Flask(__name__)

# make folder for uploads
os.makedirs(config.UPLOAD_DIR, exist_ok=True)
app.config["UPLOAD_FOLDER"] = config.UPLOAD_DIR


@app.route("/process", methods=["POST"])
def process_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file in request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the file
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    # process the image
    return jsonify(process(file_path))


@app.route("/<path:path>")
def reroute(path):
    return jsonify({"success": False})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
