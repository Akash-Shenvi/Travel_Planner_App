from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .db import cursor_object, database  # Import the cursor object and database connection
import random
from flask_mail import Mail, Message

auth = Blueprint('auth', __name__)
mail=Mail()
# Temporary storage for OTPs
otp_storage = {}

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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

    query_check = "SELECT id FROM users WHERE email = %s OR phone = %s"
    cursor_object.execute(query_check, (email, phone))
    existing_user = cursor_object.fetchone()

    if existing_user:
        return jsonify({"response": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    query_insert = "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)"
    cursor_object.execute(query_insert, (name, email, phone, hashed_password))
    database.commit()

    return jsonify({"response": "User registered successfully"}), 201

@auth.route('/otpreq', methods=['POST'])
def otp_req():
    data = request.get_json()
    email = data.get('email')

    query = "SELECT id FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    res = cursor_object.fetchone()

    if not res:
        return jsonify({"response": "User not found"}), 404

    otp = random.randint(100000, 999999)
    otp_storage[email] = otp

    # Print OTP to console for testing purposes
    print(f"Generated OTP for {email}: {otp}")
    # msg = Message('Your OTP for password reset', sender='akashshenvi93outlook.com', recipients='akashshenvi8@gmail.com')
    # msg.body = f"Your OTP is {otp}. It will expire in 10 minutes."
    
    # try:
    #     mail.send(msg)  # Correctly sending the message
    #     return jsonify({"response": "OTP sent successfully."}), 200  # Return a success response
    # except Exception as e:
    #     return jsonify({"response": "Failed to send OTP.", "error": str(e)}), 500

    return jsonify({"response": "OTP generated and printed to console"}), 200

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
        
        query_update = "UPDATE users SET password = %s WHERE email = %s"
        cursor_object.execute(query_update, (hashed_password, email))
        database.commit()

        # Clear OTP after successful reset
        otp_storage.pop(email, None)
        
        return jsonify({"response": "Password reset successfully"}), 200
    else:
        return jsonify({"response": "Invalid OTP"}), 401
