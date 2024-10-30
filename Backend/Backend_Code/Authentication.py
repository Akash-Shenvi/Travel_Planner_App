from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .db import cursor_object, database  # Import the cursor object and database connection

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def Login():
    
    data = request.get_json()
    email = data['email']
    password = data['password']

    query = "SELECT name, password FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    result = cursor_object.fetchone()

    if result is None:
        return jsonify({"response": "User not found"}), 404
    else:
        name, hashed_password = result
        if check_password_hash(hashed_password, password):
            return jsonify({"response": "Login successful", "name": name}), 200
        else:
            return jsonify({"response": "Incorrect password"}), 401

@auth.route('/signup', methods=['POST'])
def Signup():
    print("Account Created")
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
    query_insert = """
    INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)
    """
    cursor_object.execute(query_insert, (name, email, phone, hashed_password))
    
    # Commit the transaction using the database object
    database.commit()  # Commit changes to the database

    return jsonify({"response": "User registered successfully"}), 201
