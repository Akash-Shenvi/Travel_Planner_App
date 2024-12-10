import datetime
import json
from flask import Blueprint, request, jsonify, Flask, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from Backend_Code import emailinfo
from .db import cursor_object, database  # Import the cursor object and database connection
import random
import logging
import os
import google.generativeai as genai
from flask_session import Session
from flask import Flask, request, jsonify
with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'base_data.json'), encoding='utf-8') as fobj:
    api_key = json.load(fobj)['apikey']
app = Flask(__name__)

api_key =api_key['api'] 
os.environ["GOOGLE_API_KEY"] = api_key


genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

#  model generation configuration
generation_config = {
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}


model = genai.GenerativeModel(model_name="gemini-1.5-flash-8b", generation_config=generation_config)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = emailinfo.MAIL_SERVER
app.config['MAIL_PORT'] = emailinfo.MAIL_PORT
app.config['MAIL_USE_TLS'] = emailinfo.MAIL_USE_TLS
app.config['MAIL_USE_SSL'] = emailinfo.MAIL_USE_SSL
app.config['MAIL_USERNAME'] = emailinfo.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = emailinfo.MAIL_PASSWORD


mail = Mail(app)

# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(hours=48)
Session(app)
app.config['MYSQL_POOL_SIZE'] = 10
app.config['MYSQL_CONNECT_TIMEOUT'] = 300  # Increase timeout


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

    query = "SELECT id, name, password FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    result = cursor_object.fetchone()

    if result is None:
        return jsonify({"response": "User not found"}), 404

    user_id, name, hashed_password = result
    if check_password_hash(hashed_password, password):
        session['user_id'] = user_id
        print(user_id)
        return jsonify({"response": "Login successful", "name": name}), 200
    else:
        return jsonify({"response": "Incorrect password"}), 400


@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email').strip().lower()
    phone = data.get('phone')
    password = data.get('password')

    if not name or not email or not phone or not password:
        return jsonify({"response": "All fields (name, email, phone, password) are required."}), 400

    query_check = "SELECT id FROM users WHERE email = %s OR phone = %s"
    cursor_object.execute(query_check, (email, phone))
    existing_user = cursor_object.fetchone()

    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    otp = random.randint(100000, 999999)
    otp_storage[email] = {
        "otp": otp,
        "expiry": datetime.datetime.now() + datetime.timedelta(minutes=10),
        "name": name,
        "phone": phone,
        "password": password
    }

    msg = Message(
        subject="Registration OTP",
        sender=emailinfo.MAIL_USERNAME,
        recipients=[email]
    )
    msg.html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }}
        .container {{
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
        }}
        .header {{
            font-size: 20px;
            font-weight: bold;
            color: #0056b3;
            text-align: center;
            margin-bottom: 20px;
        }}
        .otp {{
            font-size: 28px;
            font-weight: bold;
            color: #d9534f;
            text-align: center;
            margin: 20px 0;
        }}
        .footer {{
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
            color: #555;
        }}
        a {{
            color: #0056b3;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Welcome to AI Travel Planner!</div>
        <p>Dear {name},</p>
        <p>Thank you for choosing <strong>AI Travel Planner</strong>. We are excited to have you on board!</p>
        <p>Your One-Time Password (OTP) for completing your registration is:</p>
        <div class="otp">{otp}</div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Please use it promptly to complete your registration process.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <p>For any questions or assistance, feel free to reach out to us at <a href="mailto:accmovie906@gmail.com">accmovie906@gmail.com</a>.</p>
        <p>Warm regards,<br>
        <strong>The AI Travel Planner Team</strong><br>
        <em>Personalized journeys, smarter travels</em></p>
        <div class="footer">
            &copy; {datetime.datetime.now().year} AI Travel Planner. All rights reserved.
        </div>
    </div>
</body>
</html>
"""

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

    if int(user_otp) != stored_otp:
        return jsonify({"message": "Incorrect OTP."}), 401

    name = stored_otp_data['name']
    phone = stored_otp_data['phone']
    password = stored_otp_data['password']
    hashed_password = generate_password_hash(password)

    try:
        query_insert = "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)"
        cursor_object.execute(query_insert, (name, email, phone, hashed_password))
        database.commit()
        msg = Message(
            subject="Welcome to AI Travel Planner!",
            sender=emailinfo.MAIL_USERNAME,
            recipients=[email]
        )
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }}
                .header {{
                    font-size: 20px;
                    font-weight: bold;
                    color: #0056b3;
                    text-align: center;
                    margin-bottom: 20px;
                }}
                .footer {{
                    font-size: 14px;
                    text-align: center;
                    margin-top: 20px;
                    color: #555;
                }}
                a {{
                    color: #0056b3;
                    text-decoration: none;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Welcome to AI Travel Planner!</div>
                <p>Dear {name},</p>
                <p>Congratulations! Your account has been successfully registered with <strong>AI Travel Planner</strong>.</p>
                <p>We are thrilled to have you on board and look forward to helping you plan your journeys effortlessly.</p>
                <p>If you have any questions, feel free to reach out to us at <a href="mailto:accmovie906@gmail.com">accmovie906@gmail.com</a>.</p>
                <p>Warm regards,<br>
                <strong>The AI Travel Planner Team</strong><br>
                <em>Personalized journeys, smarter travels</em></p>
                <div class="footer">
                    &copy; {datetime.datetime.now().year} AI Travel Planner. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """

        with app.app_context():
            mail.send(msg)
    except Exception as e:
        logger.error(f"Failed to save user to database: {e}")
        return jsonify({"message": "Failed to save user information to the database."}), 500

    del otp_storage[email]
    return jsonify({"message": "OTP verified successfully and user registered!"}), 200


@auth.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session['user_id']
    print(user_id)
    data = request.get_json()

    # Extract fields for profile update
    dob = data.get('dob')
    gender = data.get('gender')
    marital_status = data.get('marital_status')
    nationality = data.get('nationality')
    city = data.get('city')
    state = data.get('state')

    # Ensure at least one field is provided
    if not any([dob, gender, marital_status, nationality, city, state]):
        return jsonify({"error": "No fields provided for update."}), 400

    try:
        # Check if user already has a profile
        query_check = "SELECT 1 FROM users_profiles WHERE user_id = %s"
        cursor_object.execute(query_check, (user_id,))
        user_exists = cursor_object.fetchone()

        if not user_exists:
            # Insert a new profile record
            query_insert = """
                INSERT INTO users_profiles (user_id, dob, gender, marital_status, nationality, city, state)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor_object.execute(query_insert, (user_id, dob, gender, marital_status, nationality, city, state))
        else:
            # Update the existing profile
            query_update = """
                UPDATE users_profiles
                SET dob = %s, gender = %s, marital_status = %s, nationality = %s, city = %s, state = %s
                WHERE user_id = %s
            """
            cursor_object.execute(query_update, (dob, gender, marital_status, nationality, city, state, user_id))

        database.commit()  # Commit the transaction
        return jsonify({"message": "Profile updated successfully!"}), 200

    except Exception as e:
        database.rollback()  # Roll back transaction in case of error
        logger.error(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile.", "details": str(e)}), 500
    

@auth.route('/view_profile', methods=['POST'])
def view_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session['user_id']

    try:
        # Query to fetch user profile
        query = """
        SELECT u.name, u.email, u.phone, up.dob, up.gender, up.marital_status, up.nationality, up.city, up.state
        FROM users u
        LEFT JOIN users_profiles up ON u.id = up.user_id
        WHERE u.id = %s
        """
        cursor_object.execute(query, (user_id,))
        user_profile = cursor_object.fetchone()

        if not user_profile:
            return jsonify({"error": "User profile not found"}), 404

        # Map the profile fields to a dictionary for JSON response
        profile_data = {
            "name": user_profile[0],
            "email": user_profile[1],
            "phone": user_profile[2],
            "dob": user_profile[3],
            "gender": user_profile[4],
            "marital_status": user_profile[5],
            "nationality": user_profile[6],
            "city": user_profile[7],
            "state": user_profile[8],
        }

        return jsonify({"profile": profile_data}), 200

    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return jsonify({"error": "An error occurred while fetching the profile.", "details": str(e)}), 500

    
@auth.route('/logout',methods=['POST'])
def logout():
    if 'user_id' in session:
        session.pop('user_id', None)
        return jsonify({"message": "Logged out successfully"}), 200
    else:
        return jsonify({"error": "No user logged in"}), 401

@auth.route('/otpreq', methods=['POST'])
def otp_req():
    data = request.get_json()
    email = data.get('email')

    # Check if user exists
    query = "SELECT id FROM users WHERE email = %s"
    cursor_object.execute(query, (email,))
    res = cursor_object.fetchone()

    if not res:
        return jsonify({"response": "User not found"}), 404

    # Generate OTP
    otp = random.randint(100000, 999999)
    expiration_time = datetime.datetime.now() + datetime.timedelta(minutes=10)
    otp_storage[email] = {'otp': otp, 'expires_at': expiration_time}

    # Print OTP to console for testing purposes
    print(f"Generated OTP for {email}: {otp}")

    # Send email with OTP
    msg = Message('Your OTP for password reset', sender='noreply@gmail.com', recipients=[email])
    msg.body = f"Your OTP is {otp}. It will expire in 10 minutes."

    try:
        with app.app_context():
            mail.send(msg)
            return jsonify({"response": "OTP sent successfully."}), 200
    except Exception as e:
        return jsonify({"response": "Failed to send OTP.", "error": str(e)}), 500

@auth.route('/password_reset', methods=['POST'])
def password_reset():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Check if OTP exists for the given email and if it is still valid
    if email not in otp_storage:
        return jsonify({"response": "OTP not requested or expired."}), 404
    
    stored_otp_data = otp_storage[email]
    stored_otp = stored_otp_data['otp']
    expiration_time = stored_otp_data['expires_at']

    # Check if the OTP has expired
    if datetime.datetime.now() > expiration_time:
        otp_storage.pop(email, None)  # Remove expired OTP
        return jsonify({"response": "OTP has expired."}), 401

    # Validate OTP
    if int(otp) == stored_otp:
        # Hash new password and update it
        hashed_password = generate_password_hash(new_password)

        query_update = "UPDATE users SET password = %s WHERE email = %s"
        cursor_object.execute(query_update, (hashed_password, email))
        database.commit()

        # Clear OTP after successful reset
        otp_storage.pop(email, None)

        return jsonify({"response": "Password reset successfully"}), 200
    else:
        return jsonify({"response": "Invalid OTP"}), 401
    
    
    
@auth.route('/chat', methods=['POST'])
def chat():
    # Get user message from the request body
    user_message = request.json.get("message", "")

    if not user_message:
        return jsonify({"response": "No message provided"}), 400

    try:
        # Start a new chat session with no history
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
        )

        chat_session = model.start_chat(history=[])

        # Send the user message to the model and get the AI response
        response = chat_session.send_message(user_message)

        # Return the AI's response
        return jsonify({"response": response.text})
    except Exception as e:
        print("Error:", e)
        return jsonify({"response": "An error occurred while processing your request."}), 500
    
@auth.route('/saveAttraction', methods=['POST'])
def save_attraction():
    try:
        # Ensure user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = session['user_id']

        # Extract data from the request
        data = request.json
        name = data.get('name')
        location = data.get('location', {})  # Default to an empty dictionary if not provided
        photo = data.get('photo')
        description = data.get('description')

        # Extract latitude and longitude from location
        lat = location.get('lat')
        lng = location.get('lng')

        # Debugging prints (optional)
        print(f"Name: {name}, Location: {lat}, {lng}, Photo: {photo}, Description: {description}")

        # Validate required fields
        if not name or lat is None or lng is None:
            return jsonify({'error': 'Name and location (lat, lng) are required fields'}), 400

        # SQL query to insert attraction data
        query = """
            INSERT INTO saved_attractions (user_id, name, location_lat, location_lng, photo_url, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor_object.execute(query, (user_id, name, lat, lng, photo, description))
        database.commit()

        return jsonify({'message': 'Attraction saved successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@auth.route('/saveResturants', methods=['POST'])
def save_Resturants():
    try:
        # Ensure user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = session['user_id']

        # Extract data from the request
        data = request.json
        name = data.get('name')
        location = data.get('location', {})  # Default to an empty dictionary if not provided
        photo = data.get('photo')
        description = data.get('description')

        # Extract latitude and longitude from location
        lat = location.get('lat')
        lng = location.get('lng')

        # Debugging prints (optional)
        print(f"Name: {name}, Location: {lat}, {lng}, Photo: {photo}, Description: {description}")

        # Validate required fields
        if not name or lat is None or lng is None:
            return jsonify({'error': 'Name and location (lat, lng) are required fields'}), 400

        # SQL query to insert attraction data
        query = """
            INSERT INTO saved_resturants (user_id, name, location_lat, location_lng, photo_url, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor_object.execute(query, (user_id, name, lat, lng, photo, description))
        database.commit()

        return jsonify({'message': 'Attraction saved successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@auth.route('/saveHotels', methods=['POST'])
def save_Hotels():
    try:
        # Ensure user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401

        user_id = session['user_id']

        # Extract data from the request
        data = request.json
        name = data.get('name')
        location = data.get('location', {})  # Default to an empty dictionary if not provided
        photo = data.get('photo')
        description = data.get('description')

        # Extract latitude and longitude from location
        lat = location.get('lat')
        lng = location.get('lng')

        # Debugging prints (optional)
        print(f"Name: {name}, Location: {lat}, {lng}, Photo: {photo}, Description: {description}")

        # Validate required fields
        if not name or lat is None or lng is None:
            return jsonify({'error': 'Name and location (lat, lng) are required fields'}), 400

        # SQL query to insert attraction data
        query = """
            INSERT INTO saved_Hotels (user_id, name, location_lat, location_lng, photo_url, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor_object.execute(query, (user_id, name, lat, lng, photo, description))
        database.commit()

        return jsonify({'message': 'Attraction saved successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@auth.route('/getAttractions', methods=['POST'])
def get_attractions():
    """
    Endpoint to fetch attractions data for the currently logged-in user.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = session['user_id']  # Get the user ID from the session

    try:
        # Query to fetch attractions linked to the current user
        query = """
            SELECT 
               
                name,
                location_lat,
                location_lng,
                photo_url,
                description
            FROM saved_attractions
            WHERE user_id = %s
        """
        cursor_object.execute(query, (user_id,))
        attractions = cursor_object.fetchall()
        

        # Map the query results to a list of dictionaries
        attractions_list = [
            {
                "name": attraction[0],
                "latitude": attraction[1],
                "longitude": attraction[2],
                "photo": attraction[3],
                "description": attraction[4],
                # "id":attraction[5],
                
            }
            for attraction in attractions
        ]

        return jsonify({"attractions": attractions_list}), 200

    except Exception as e:
        logger.error(f"Error fetching attractions for user {user_id}: {e}")
        return jsonify({"error": "Failed to fetch attractions.", "details": str(e)}), 500


@auth.route('/getHotels', methods=['POST'])
def get_Hotels():
    """
    Endpoint to fetch attractions data for the currently logged-in user.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = session['user_id']  # Get the user ID from the session

    try:
        # Query to fetch attractions linked to the current user
        query = """
            SELECT 
                name,
                location_lat,
                location_lng,
                photo_url,
                description
            FROM saved_Hotels
            WHERE user_id = %s
        """
        cursor_object.execute(query, (user_id,))
        attractions = cursor_object.fetchall()

        # Map the query results to a list of dictionaries
        attractions_list = [
            {
                "name": attraction[0],
                "latitude": attraction[1],
                "longitude": attraction[2],
                "photo": attraction[3],
                "description": attraction[4],
            }
            for attraction in attractions
        ]

        return jsonify({"attractions": attractions_list}), 200

    except Exception as e:
        logger.error(f"Error fetching attractions for user {user_id}: {e}")
        return jsonify({"error": "Failed to fetch attractions.", "details": str(e)}), 500
   
@auth.route('/getresturants', methods=['POST'])
def get_resturants():
    """
    Endpoint to fetch attractions data for the currently logged-in user.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    user_id = session['user_id']  # Get the user ID from the session

    try:
        # Query to fetch attractions linked to the current user
        query = """
            SELECT 
                
                name,
                location_lat,
                location_lng,
                photo_url,
                description
            FROM saved_resturants
            WHERE user_id = %s
        """
        cursor_object.execute(query, (user_id,))
        attractions = cursor_object.fetchall()

        # Map the query results to a list of dictionaries
        attractions_list = [
            {
                "name": attraction[0],
                "latitude": attraction[1],
                "longitude": attraction[2],
                "photo": attraction[3],
                "description": attraction[4],
                
            }
            for attraction in attractions
        ]

        return jsonify({"attractions": attractions_list}), 200

    except Exception as e:
        logger.error(f"Error fetching attractions for user {user_id}: {e}")
        return jsonify({"error": "Failed to fetch attractions.", "details": str(e)}), 500
    
@auth.route('/deleteAttraction', methods=['POST'])
def delete_attraction():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    data = request.json
    place_name = data.get('name')
    print(place_name)# Get the place name from the frontend
    if not place_name:
        return jsonify({"error": "Place name is required"}), 400

    try:
        # Find the attraction ID by querying the place name
        query_get_id = "SELECT id FROM saved_attractions WHERE name = %s AND user_id = %s"
        cursor_object.execute(query_get_id, (place_name, session['user_id']))
        attraction_id = cursor_object.fetchone()

        if not attraction_id:
            return jsonify({"error": "Attraction not found"}), 404

        # Delete the attraction using the retrieved ID
        query_delete = "DELETE FROM saved_attractions WHERE id = %s AND user_id = %s"
        cursor_object.execute(query_delete, (attraction_id[0], session['user_id']))
        database.commit()

        return jsonify({"success": True}), 200
    except Exception as e:
        logger.error(f"Error deleting attraction: {e}")
        return jsonify({"error": "Failed to delete attraction."}), 500
    
@auth.route('/deleteHotels', methods=['POST'])
def delete_Hotels():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    data = request.json
    place_name = data.get('name')
    print(place_name)# Get the place name from the frontend
    if not place_name:
        return jsonify({"error": "Place name is required"}), 400

    try:
        # Find the attraction ID by querying the place name
        query_get_id = "SELECT id FROM saved_Hotels WHERE name = %s AND user_id = %s"
        cursor_object.execute(query_get_id, (place_name, session['user_id']))
        attraction_id = cursor_object.fetchone()

        if not attraction_id:
            return jsonify({"error": "Attraction not found"}), 404

        # Delete the attraction using the retrieved ID
        query_delete = "DELETE FROM saved_Hotels WHERE id = %s AND user_id = %s"
        cursor_object.execute(query_delete, (attraction_id[0], session['user_id']))
        database.commit()

        return jsonify({"success": True}), 200
    except Exception as e:
        logger.error(f"Error deleting attraction: {e}")
        return jsonify({"error": "Failed to delete attraction."}), 500
    
    
@auth.route('/deleteresto', methods=['POST'])
def delete_Restro():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    data = request.json
    place_name = data.get('name')
    print(place_name)# Get the place name from the frontend
    if not place_name:
        return jsonify({"error": "Place name is required"}), 400

    try:
        # Find the attraction ID by querying the place name
        query_get_id = "SELECT id FROM saved_resturants WHERE name = %s AND user_id = %s"
        cursor_object.execute(query_get_id, (place_name, session['user_id']))
        attraction_id = cursor_object.fetchone()

        if not attraction_id:
            return jsonify({"error": "Attraction not found"}), 404

        # Delete the attraction using the retrieved ID
        query_delete = "DELETE FROM saved_resturants WHERE id = %s AND user_id = %s"
        cursor_object.execute(query_delete, (attraction_id[0], session['user_id']))
        database.commit()

        return jsonify({"success": True}), 200
    except Exception as e:
        logger.error(f"Error deleting attraction: {e}")
        return jsonify({"error": "Failed to delete attraction."}), 500


@auth.route('/generate_trip', methods=['POST'])
def generate_trip():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    def clean_ai_response(response_text):
        """
        Cleans the AI response to remove code block markers like ```json and ```.
        """
        if response_text.startswith("```json"):
            response_text = response_text[len("```json"):].strip()
        if response_text.endswith("```"):
            response_text = response_text[:-len("```")].strip()
        return response_text

    try:
        # Parse request data
        data = request.json
        if not data:
            return jsonify({"error": "No request data provided"}), 400

        # Extract trip details from request data
        name = data.get('name', 'Traveler')  # Default to 'Traveler' if not provided
        start_date = data.get('startDate', '2024-11-28')  # Default start date
        end_date = data.get('endDate', '2024-12-01')  # Default end date
        total_days = data.get('totalDays', 3)  # Default duration
        title = data.get('title', 'Vacation')  # Default trip title
        budget = data.get('budget', 'luxury')  # Default to 'luxury' budget
        print(name,start_date,end_date,total_days,title,budget)

        # Define prompt for GeminiAI
        prompt = f"""
        Create a detailed travel plan for {name} for a {title} trip from {start_date} to {end_date} ({total_days} days). 
        The plan should consider a {budget} budget and include:
        - Trip details: destination, dates, budget, and duration.
        - Daily itinerary: list of activities with descriptions, locations, and estimated costs.
        - Important notes or recommendations.
        Output must be in valid JSON format with the following structure:
        {{
            "trip_details": {{
                "destination": "string",
                "dates": "string",
                "budget": "string",
                "duration": "integer"
            }},
            "itinerary": [
                {{
                    "day": "string",
                    "activities": [
                        {{
                            "description": "string",
                            "location": "string",
                            "estimated_cost": "string",
                            "notes": "string (optional)"
                        }}
                    ]
                }}
            ],
            "notes": ["string"]
        }}
        """

        # Generate response from GeminiAI
        try:
            chat_session = model.start_chat(history=[])
            response = chat_session.send_message(prompt)
            response_text = clean_ai_response(response.text.strip())
            logging.info(f"Cleaned AI Response: {response_text}")

            # Parse the AI response to verify JSON validity
            try:
                response_json = json.loads(response_text)
            except json.JSONDecodeError as json_error:
                logging.error(f"Invalid JSON format: {json_error}")
                return jsonify({"error": "AI response is not in valid JSON format"}), 500

            # Return the AI response as JSON
            return jsonify(response_json), 200

        except Exception as ai_error:
            logging.error(f"Error generating AI response: {ai_error}")
            return jsonify({"error": "Failed to generate trip plan"}), 500

    except Exception as e:
        logging.error(f"Error generating trip data: {e}")
        return jsonify({"error": "Failed to generate trip data"}), 500
    
@auth.route('/save_trip', methods=['POST'])
def save_trip():
    try:
        data = request.get_json()

        # Extract details from the request
        trip_name = data.get('tripName')
        trip_data = data.get('tripData')
        user_id = session['user_id']
        print(trip_name,trip_data,user_id)
         

        if not trip_name or not trip_data or not user_id:
            return jsonify({"error": "Missing required fields: tripName, tripData, or user_id"}), 400

        # Convert trip_data to JSON string
        trip_data_json = json.dumps(trip_data)

        # Connect to the database
        

        # Insert trip into the database
        query = """
            INSERT INTO user_trips (user_id, trip_name, trip_data)
            VALUES (%s, %s, %s)
        """
        cursor_object.execute(query, (user_id, trip_name, trip_data_json))
        database.commit()
        return jsonify({"message": "Trip saved successfully!"}), 201

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
    
@auth.route('/get_trips', methods=['GET'])
def get_trips():
    try:
        # Ensure the user is logged in and their session has a user_id
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized access. Please log in."}), 401

        # Get the user_id from the session
        user_id = session['user_id']

        # Query to fetch trips specific to the logged-in user
        query = """
        SELECT trip_id, trip_name 
        FROM user_trips 
        WHERE user_id = %s
        """
        cursor_object.execute(query, (user_id,))

        # Fetch the trips
        trips = cursor_object.fetchall()

        # Structure the response to ensure clarity
        trip_list = [{"id": trip[0], "trip_name": trip[1]} for trip in trips]

        return jsonify(trip_list), 200
    except Exception as e:
        # Log the error for debugging purposes
        app.logger.error(f"Error fetching trips for user {session.get('user_id', 'unknown')}: {e}")
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

    
@auth.route('/get_trip_details', methods=['POST'])
def get_trip_details():
    try:
        # Validate user login
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthorized access. Please log in."}), 401

        # Parse and validate input data
        data = request.get_json()
        trip_id = data.get('trip_id')
        if not trip_id:
            return jsonify({"error": "Trip ID is required."}), 400

        # Query to fetch trip details for the logged-in user
        query = """
        SELECT trip_id, trip_name, trip_data, created_at 
        FROM user_trips 
        WHERE trip_id = %s AND user_id = %s
        """
        cursor_object.execute(query, (trip_id, user_id))
        trip = cursor_object.fetchone()

        # Check if trip exists and is authorized
        if not trip:
            return jsonify({"error": "Trip not found or unauthorized access."}), 404

        # Structure the response
        trip_id, trip_name, trip_data, created_at = trip
        trip_details = {
            "trip_id": trip_id,
            "trip_name": trip_name,
            "trip_data": trip_data if isinstance(trip_data, dict) else json.loads(trip_data),
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S") if created_at else None,
        }

        return jsonify(trip_details), 200

    except json.JSONDecodeError:
        app.logger.error("Failed to parse trip_data JSON.")
        return jsonify({"error": "Invalid trip data format."}), 400
    except Exception as e:
        # Log the error for debugging purposes
        app.logger.error(f"Error fetching trip details: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500


@auth.route('/delete_ai_trip', methods=['DELETE'])
def delete_trip():
    data = request.json
    trip_id = data.get('trip_id')

    if not trip_id:
        return jsonify({"error": "Trip ID is required."}), 400

    try:
        
        cursor_object.execute("DELETE FROM user_trips WHERE trip_id = %s", (trip_id,))
       
        return jsonify({"message": "Trip deleted successfully."}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

    
    
    





#add place part from here 
@auth.route('/add_place', methods=['POST'])
def add_place():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        data = request.json
        user_id = session['user_id']
        place_name = data.get('name')
        place_type = data.get('place_type')

        if not place_name or not place_type:
            return jsonify({"error": "Place Name and Place Type are required"}), 400

        # Log incoming data for debugging
        print(f"Place Name: {place_name}")
        print(f"Place Type: {place_type}")

        if place_type == 'attraction':
            query_get_id = "SELECT id FROM saved_attractions WHERE name = %s AND user_id = %s"
            cursor_object.execute(query_get_id, (place_name, user_id))
            result = cursor_object.fetchone()
        elif place_type == 'restaurant':
            query_get_id = "SELECT id FROM saved_resturants WHERE name = %s AND user_id=%s"
            cursor_object.execute(query_get_id, (place_name, user_id))
            result = cursor_object.fetchone()
        elif place_type == 'hotel':
            query_get_id = "SELECT id FROM saved_hotels WHERE name = %s AND user_id=%s"
            cursor_object.execute(query_get_id, (place_name, user_id))
            result = cursor_object.fetchone()
        else:
            return jsonify({"error": "Invalid place type"}), 400
        if not result:
            return jsonify({"error": "Place ID not found"}), 404

        place_id = result[0]  # Extract the ID from the tuple

        if place_type == 'attraction':
            query = "INSERT INTO user_attractions (user_id, attraction_id) VALUES (%s, %s)"
        elif place_type == 'restaurant':
            query = "INSERT INTO user_restaurants (user_id, restaurant_id) VALUES (%s, %s)"
        elif place_type == 'hotel':
            query = "INSERT INTO user_hotels (user_id, hotel_id) VALUES (%s, %s)"
        else:
            return jsonify({"error": "Invalid place type"}), 400

        cursor_object.execute(query, (user_id, place_id))
        database.commit()

        return jsonify({"message": "Place added successfully"}), 201

    except Exception as e:
        logging.error(f"Error adding place: {str(e)}")
        return jsonify({"error": "Failed to add place"}), 500


@auth.route('/get_user_places', methods=['GET'])
def get_user_places():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        user_id = session['user_id']

        query = """
        SELECT 
            ua.attraction_id AS place_id,
            sa.name AS place_name,
            sa.description AS place_description,
            sa.photo_url AS place_photo_url,
            
            'attraction' AS place_type
        FROM 
            user_attractions ua
        INNER JOIN 
            saved_attractions sa 
        ON 
            ua.attraction_id = sa.id
        WHERE 
            ua.user_id = %s

        UNION

        SELECT 
            ur.restaurant_id AS place_id,
            sr.name AS place_name,
            sr.description AS place_description,
            sr.photo_url AS place_photo_url,
            
            'restaurant' AS place_type
        FROM 
            user_restaurants ur
        INNER JOIN 
            saved_resturants sr 
        ON 
            ur.restaurant_id = sr.id
        WHERE 
            ur.user_id = %s

        UNION

        SELECT 
            uh.hotel_id AS place_id,
            sh.name AS place_name,
            sh.description AS place_description,
            sh.photo_url AS place_photo_url,
        
            'hotel' AS place_type
        FROM 
            user_hotels uh
        INNER JOIN 
            saved_hotels sh 
        ON 
            uh.hotel_id = sh.id
        WHERE 
            uh.user_id = %s;
        """

        cursor_object.execute(query, (user_id, user_id, user_id))
        places = cursor_object.fetchall()

        return jsonify({"places": places}), 200

    except Exception as e:
        logging.error(f"Error fetching user places: {e}")
        return jsonify({"error": "Failed to fetch places"}), 500
    
@auth.route('/delete_all_places', methods=['DELETE'])
def delete_all_places():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401
    
    try:
        user_id = session['user_id']

        # Execute DELETE queries for each table separately
        tables = ['user_attractions', 'user_restaurants', 'user_hotels']
        for table in tables:
            query = f"DELETE FROM {table} WHERE user_id = %s;"
            cursor_object.execute(query, (user_id,))
        
        database.commit()
        
        return jsonify({"message": "All places deleted successfully."}), 200
    
    except Exception as e:
        logging.error(f"Error deleting all places: {e}")
        database.rollback()  # Rollback any partial changes
        return jsonify({"error": "Failed to delete all places."}), 500
@auth.route('/mark_as_visited', methods=['POST'])
def mark_place_as_visited():
    """
    Marks a hotel, restaurant, or attraction as visited for the logged-in user.
    """
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401

        user_id = session['user_id']
        data = request.get_json()
        place_id = data.get('place_id')
        place_type = data.get('place_type')  # 'hotel', 'restaurant', or 'attraction'
        print(place_id)
        if not place_id or not place_type:
            return jsonify({'error': 'Place ID and Place Type are required.'}), 400

        # Map place_type to corresponding table and id column
        table_mapping = {
            'hotel': ('user_hotels', 'hotel_id'),
            'restaurant': ('user_restaurants', 'restaurant_id'),
            'attraction': ('user_attractions', 'attraction_id'),
        }

        table_info = table_mapping.get(place_type.lower())
        if not table_info:
            return jsonify({'error': 'Invalid place type.'}), 400

        table_name, column_id = table_info

        # Debugging logs
        logging.info(f"Marking as visited: user_id={user_id}, place_id={place_id}, place_type={place_type}, table_name={table_name}")

        # Update the `visited` column in the corresponding table
        query = f"""
            UPDATE {table_name}
            SET visited = 1
            WHERE user_id = %s AND {column_id} = %s AND visited = 0
        """
        cursor_object.execute(query, (user_id, place_id))
        database.commit()

        # Check if a row was updated
        if cursor_object.rowcount == 0:
            logging.warning(f"No rows updated. Either place not found or already marked as visited. user_id={user_id}, place_id={place_id}")
            return jsonify({'error': 'No matching place found or already marked as visited.'}), 404

        return jsonify({'message': f'{place_type.capitalize()} marked as visited successfully.'}), 200

    except Exception as e:
        logging.error(f"Error marking place as visited: {str(e)}")
        return jsonify({'error': 'An error occurred while updating the place status.', 'details': str(e)}), 500

@auth.route('/delete_place', methods=['DELETE'])
def delete_place():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401
    
    data = request.get_json()
    place_id = data.get('place_id')
    place_type = data.get('place_type')
    
    if not place_id or not place_type:
        return jsonify({"error": "Missing place_id or place_type"}), 400

    try:
        user_id = session['user_id']

        if place_type == 'attraction':
            query = "DELETE FROM user_attractions WHERE user_id = %s AND attraction_id = %s"
        elif place_type == 'restaurant':
            query = "DELETE FROM user_restaurants WHERE user_id = %s AND restaurant_id = %s"
        elif place_type == 'hotel':
            query = "DELETE FROM user_hotels WHERE user_id = %s AND hotel_id = %s"
        else:
            return jsonify({"error": "Invalid place_type"}), 400
        
        cursor_object.execute(query, (user_id, place_id))
        database.commit()

        return jsonify({"message": "Place deleted successfully."}), 200
    
    except Exception as e:
        logging.error(f"Error deleting place: {e}")
        return jsonify({"error": "Failed to delete place."}), 500
    
@auth.route('/get_user_places_locations', methods=['GET'])
def get_user_places_locations():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    try:
        user_id = session['user_id']
        place_id = request.args.get('place_id')  # Get place_id from the frontend

        if not place_id:
            return jsonify({"error": "Place ID is required"}), 400

        # Query to fetch location based on the place_id for attractions, restaurants, or hotels
        query = """
        SELECT 
            sa.location_lat AS place_latitude,
            sa.location_lng AS place_longitude,
            'attraction' AS place_type
        FROM 
            user_attractions ua
        INNER JOIN 
            saved_attractions sa 
        ON 
            ua.attraction_id = sa.id
        WHERE 
            ua.user_id = %s
            AND sa.id = %s

        UNION

        SELECT 
            sr.location_lat AS place_latitude,
            sr.location_lng AS place_longitude,
            'restaurant' AS place_type
        FROM 
            user_restaurants ur
        INNER JOIN 
            saved_resturants sr 
        ON 
            ur.restaurant_id = sr.id
        WHERE 
            ur.user_id = %s
            AND sr.id = %s

        UNION

        SELECT 
            sh.location_lat AS place_latitude,
            sh.location_lng AS place_longitude,
            'hotel' AS place_type
        FROM 
            user_hotels uh
        INNER JOIN 
            saved_hotels sh 
        ON 
            uh.hotel_id = sh.id
        WHERE 
            uh.user_id = %s
            AND sh.id = %s;
        """

        # Execute the query with user_id and place_id for all three categories
        cursor_object.execute(query, (user_id, place_id, user_id, place_id, user_id, place_id))
        location = cursor_object.fetchone()

        if not location:
            return jsonify({"error": "Place not found"}), 404

        # Format the response for a single location
        formatted_location = {
            "latitude": location[0],
            "longitude": location[1],
            "place_type": location[2]
        }

        return jsonify({"location": formatted_location}), 200

    except Exception as e:
        logging.error(f"Error fetching user place location: {e}")
        return jsonify({"error": "Failed to fetch location"}), 500


@auth.route('/check_place_visited', methods=['GET'])
def check_place_visited():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session['user_id']
    place_id = request.args.get('place_id')
    place_type = request.args.get('place_type')

    if not place_id or not place_type:
        return jsonify({"error": "Place ID and type are required"}), 400

    # Define a mapping from place type to table name
    table_mapping = {
        'hotel': 'user_hotels',
        'restaurant': 'user_restaurants',
        'attraction': 'user_attractions',
    }

    # Get the appropriate table name
    table_name = table_mapping.get(place_type.lower())
    if not table_name:
        return jsonify({"error": "Invalid place type"}), 400

    try:
        # Check if the place is marked as visited
        query = f"""
            SELECT visited
            FROM {table_name}
            WHERE user_id = %s AND {place_type}_id = %s
        """
        cursor_object.execute(query, (user_id, place_id))
        result = cursor_object.fetchone()

        if not result:
            return jsonify({"error": "Place not found"}), 404

        visited = result[0] 
        print(visited)# Fetch the "visited" value (0 or 1)
        return jsonify({"visited": bool(visited)}), 200

    except Exception as e:
        # Log the error details for debugging
        print(f"Error checking visited status: {str(e)}")
        return jsonify({"error": "Failed to check place status", "details": str(e)}), 500
    
@auth.route('/check-session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({"session": True, "user_id": session['user_id']}), 200
    return jsonify({"session": False}), 200

@auth.route('/send-feedback', methods=['POST'])
def feedback():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized. Please log in."}), 401

    user_id = session['user_id']
    data = request.json
    feedback = data.get('feedback')

    if not feedback:
        return jsonify({"message": "Feedback is required"}), 400

    try:
        # Query the database for the user's name and email using user_id
          # Replace with your database connection function
        
        query=f"SELECT name, email FROM users WHERE id = %s"
        cursor_object.execute(query, (user_id,))
        result = cursor_object.fetchone()

        if not result:
            return jsonify({"message": "User not found"}), 404

        name, email = result

        # Prepare the feedback message
        msg = Message(
            subject="Feedback from Users",
            sender=emailinfo.MAIL_USERNAME,
            recipients=['akashshenvi8@gmail.com']
        )
        msg.body = f"User Feedback:\n\nName: {name}\nEmail: {email}\n\nFeedback: {feedback}"

        # Send the email
        with app.app_context():
            mail.send(msg)
            return jsonify({"message": "Feedback sent successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to send feedback", "error": str(e)}), 500
   



    

# Register the blueprint

app.register_blueprint(auth, url_prefix='/auth')

# Run the app