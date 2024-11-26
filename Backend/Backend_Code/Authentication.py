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

# Initialize Flask app
app = Flask(__name__)

api_key =api_key['api'] # Replace with your actual API key
os.environ["GOOGLE_API_KEY"] = api_key

# Configure genai with the API key
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Create the model generation configuration
generation_config = {
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Initialize the model
model = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config=generation_config)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = emailinfo.MAIL_SERVER
app.config['MAIL_PORT'] = emailinfo.MAIL_PORT
app.config['MAIL_USE_TLS'] = emailinfo.MAIL_USE_TLS
app.config['MAIL_USE_SSL'] = emailinfo.MAIL_USE_SSL
app.config['MAIL_USERNAME'] = emailinfo.MAIL_USERNAME
app.config['MAIL_PASSWORD'] = emailinfo.MAIL_PASSWORD

# Initialize Flask-Mail
mail = Mail(app)

# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(hours=1)
Session(app)

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
        return jsonify({"response": "User already exists"}), 409

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
    try:
        # Parse user message from the request JSON
        data = request.json
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Start a chat session and send a message
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(user_message)

        # Return the response in JSON format
        return jsonify({
            "message": user_message,
            "response": response.text  # Assuming the response has a `text` attribute
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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



# Register the blueprint

app.register_blueprint(auth, url_prefix='/auth')

# Run the app