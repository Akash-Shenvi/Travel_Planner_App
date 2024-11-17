import datetime
from flask import Blueprint, request, jsonify, Flask
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from Backend_Code import emailinfo
from .db import cursor_object, database  # Import the cursor object and database connection
import random
import logging

# Initialize Flask app
app = Flask(__name__)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = emailinfo.MAIL_SERVER
app.config['MAIL_PORT'] = emailinfo.MAIL_PORT
app.config['MAIL_USE_TLS'] = emailinfo.MAIL_USE_TLS
app.config['MAIL_USE_SSL'] = emailinfo.MAIL_USE_SSL
app.config['MAIL_USERNAME'] = emailinfo.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = emailinfo.MAIL_PASSWORD

# Initialize Flask-Mail
mail = Mail(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Temporary storage for OTPs
otp_storage = {}

# Create a Blueprint for authentication routes
auth = Blueprint('auth', __name__)

# Routes

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({"response": "Email and password are required."}), 400

    query = "SELECT name, password FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    result = cursor_object.fetchone()

    if result is None:
        return jsonify({"response": "User not found"}), 404

    name, hashed_password = result
    if check_password_hash(hashed_password, password):
        return jsonify({"response": "Login successful", "name": name}), 200
    else:
        return jsonify({"response": "Incorrect password"}), 401


@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email').strip().lower()
    phone = data.get('phone')
    password = data.get('password')

    if not name or not email or not phone or not password:
        return jsonify({"response": "All fields (name, email, phone, password) are required."}), 400

    # Check if user with same email or phone already exists
    query_check = "SELECT id FROM users WHERE email = %s OR phone = %s"
    cursor_object.execute(query_check, (email, phone))
    existing_user = cursor_object.fetchone()

    if existing_user:
        return jsonify({"response": "User already exists"}), 409

    # Generate OTP and store it with expiry
    otp = random.randint(100000, 999999)
    otp_storage[email] = {
        "otp": otp,
        "expiry": datetime.datetime.now() + datetime.timedelta(minutes=10),
        "name": name,
        "phone": phone,
        "password": password  # Temporarily store password until verification
    }

    # Send OTP via email
    msg = Message(
        subject="Registration OTP",
        sender=emailinfo.MAIL_USERNAME,
        recipients=[email]
    )
    msg.body = f"Your OTP for registration is {otp}. It will expire in 10 minutes."

    try:
        with app.app_context():
            mail.send(msg)
            return jsonify({"response": "OTP sent. Please verify your OTP to complete registration."}), 201
    except Exception as e:
        logger.error(f"Failed to send OTP: {e}")
        return jsonify({"response": "Failed to send OTP.", "error": str(e)}), 500


@auth.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    user_otp = data.get('otp')

    if not email or not user_otp:
        return jsonify({"message": "Email and OTP are required."}), 400

    if email not in otp_storage:
        return jsonify({"message": "Invalid or expired OTP."}), 400

    stored_otp_data = otp_storage[email]
    stored_otp = stored_otp_data['otp']
    expiry_time = stored_otp_data['expiry']

    if datetime.datetime.now() > expiry_time:
        del otp_storage[email]
        return jsonify({"message": "OTP has expired."}), 400

    try:
        if int(user_otp) != stored_otp:
            return jsonify({"message": "Incorrect OTP."}), 401
    except ValueError:
        return jsonify({"message": "OTP must be numeric."}), 400

    # Fetch user details from otp_storage
    name = stored_otp_data['name']
    phone = stored_otp_data['phone']
    password = stored_otp_data['password']

    # Hash the password securely
    hashed_password = generate_password_hash(password)

    try:
        # Insert user into the database
        query_insert = "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)"
        cursor_object.execute(query_insert, (name, email, phone, hashed_password))
        database.commit()  # Commit the transaction
    except Exception as e:
        logger.error(f"Failed to save user to database: {e}")
        return jsonify({"message": "Failed to save user information to the database."}), 500

    del otp_storage[email]  # Clean up the OTP after successful registration
    return jsonify({"message": "OTP verified successfully and user registered!"}), 200


# Register Blueprint
app.register_blueprint(auth, url_prefix='/auth')
