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

### ROUTES ###
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password')

    # Validate required fields
    if not email or not password:
        return jsonify({"response": "Email and password are required."}), 400

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
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password')

    # Validate required fields
    if not name or not email or not phone or not password:
        return jsonify({"response": "All fields (name, email, phone, password) are required."}), 400

    # Check if user already exists
    query_check = "SELECT id FROM users WHERE email = %s OR phone = %s"
    cursor_object.execute(query_check, (email, phone))
    existing_user = cursor_object.fetchone()

    if existing_user:
        return jsonify({"response": "User already exists"}), 409

    # Generate OTP and send email
    otp = random.randint(100000, 999999)
    otp_storage[email] = {
        "otp": otp,
        "expiry": datetime.datetime.now() + datetime.timedelta(minutes=10)  # OTP valid for 10 minutes
    }

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


@auth.route('/otpreq', methods=['POST'])
def otp_req():
    data = request.get_json()
    email = data.get('email', '').strip().lower()

    # Validate if email exists in the database
    query = "SELECT id FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    res = cursor_object.fetchone()

    if not res:
        return jsonify({"response": "User not found"}), 404

    # Generate OTP
    otp = random.randint(100000, 999999)
    otp_storage[email] = {
        "otp": otp,
        "expiry": datetime.datetime.now() + datetime.timedelta(minutes=10)
    }

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
    email = data.get('email', '').strip().lower()
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Validate required fields
    if not email or not otp or not new_password:
        return jsonify({"response": "Email, OTP, and new password are required."}), 400

    # Validate OTP
    stored_otp_data = otp_storage.get(email)
    if not stored_otp_data:
        return jsonify({"response": "Invalid or expired OTP."}), 400

    stored_otp = stored_otp_data['otp']
    expiry_time = stored_otp_data['expiry']

    if datetime.datetime.now() > expiry_time:
        del otp_storage[email]  # Delete expired OTP
        return jsonify({"response": "OTP has expired."}), 400

    try:
        if int(otp) != stored_otp:
            return jsonify({"response": "Invalid OTP."}), 401
    except ValueError:
        return jsonify({"response": "OTP must be a number."}), 400

    # Hash the new password
    hashed_password = generate_password_hash(new_password)

    # Update user's password
    query_update = "UPDATE users SET password = %s WHERE email = %s"
    cursor_object.execute(query_update, (hashed_password, email))
    database.commit()

    # Clear OTP after successful reset
    del otp_storage[email]

    return jsonify({"response": "Password reset successfully"}), 200


@auth.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    user_otp = data.get('otp')

    if not email or not user_otp:
        return jsonify({"message": "Email and OTP are required."}), 400

    # Check if OTP exists for the email
    if email not in otp_storage:
        return jsonify({"message": "Invalid or expired OTP."}), 400

    stored_otp_data = otp_storage[email]
    stored_otp = stored_otp_data['otp']
    expiry_time = stored_otp_data['expiry']

    # Check if OTP has expired
    if datetime.datetime.now() > expiry_time:
        del otp_storage[email]  # Remove expired OTP
        return jsonify({"message": "OTP has expired."}), 400

    try:
        if int(user_otp) != stored_otp:
            return jsonify({"message": "Incorrect OTP."}), 401
    except ValueError:
        return jsonify({"message": "OTP must be numeric."}), 400

    # OTP is valid, registration complete
    del otp_storage[email]  # Remove OTP after successful verification
    return jsonify({"message": "OTP verified successfully!"}), 200



# Register the auth Blueprint
app.register_blueprint(auth, url_prefix='/auth')
