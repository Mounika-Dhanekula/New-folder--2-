from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from routes.auth_routes import auth_bp
from routes.vital_routes import vital_bp
from routes.medication_routes import medication_bp
from routes.appointment_routes import appointment_bp

load_dotenv()

app = Flask(__name__)
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Config
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")

# Init extensions
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(vital_bp, url_prefix="/api/vitals")
app.register_blueprint(medication_bp, url_prefix="/api/medications")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")

@app.route("/")
def home():
    return jsonify({"message": "🩺 HealthSync Backend Running"})

if __name__ == "__main__":
    app.run(debug=True)