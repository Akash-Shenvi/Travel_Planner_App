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

### ROUTES ###
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Fetch user by email
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
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    # Check if user already exists
    query_check = "SELECT id FROM users WHERE email = %s OR phone = %s"
    cursor_object.execute(query_check, (email, phone))
    existing_user = cursor_object.fetchone()

    if existing_user:
        return jsonify({"response": "User already exists"}), 409

    # Insert new user
    hashed_password = generate_password_hash(password)
    query_insert = "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)"
    cursor_object.execute(query_insert, (name, email, phone, hashed_password))
    database.commit()

    return jsonify({"response": "User registered successfully"}), 201


@auth.route('/otpreq', methods=['POST'])
def otp_req():
    data = request.get_json()
    email = data.get('email')

    # Validate if email exists in the database
    query = "SELECT id FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    res = cursor_object.fetchone()

    if not res:
        return jsonify({"response": "User not found"}), 404

    # Generate OTP
    otp = random.randint(100000, 999999)
    otp_storage[email] = otp

    # Compose email
    msg = Message(
        subject="Your OTP for Password Reset",
        sender=emailinfo.MAIL_USERNAME,  # Configured sender
        recipients=[email]  # Use the provided email
    )
    msg.body = f"Your OTP is {otp}. It will expire in 10 minutes."

    try:
        # Send email with app context
        with app.app_context():
            mail.send(msg)
            logger.info(f"OTP sent to {email}: {otp}")
            return jsonify({"response": "OTP sent successfully."}), 200
    except Exception as e:
        logger.error(f"Failed to send OTP to {email}: {e}")
        return jsonify({"response": "Failed to send OTP.", "error": str(e)}), 500


@auth.route('/password_reset', methods=['POST'])
def password_reset():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Validate OTP
    stored_otp = otp_storage.get(email)
    if stored_otp and int(otp) == stored_otp:
        hashed_password = generate_password_hash(new_password)

        # Update user's password
        query_update = "UPDATE users SET password = %s WHERE email = %s"
        cursor_object.execute(query_update, (hashed_password, email))
        database.commit()

        # Clear OTP after successful reset
        otp_storage.pop(email, None)

        return jsonify({"response": "Password reset successfully"}), 200
    else:
        return jsonify({"response": "Invalid OTP"}), 401


# Register the auth Blueprint
app.register_blueprint(auth, url_prefix='/auth')

# Run the app

