# Travel Planner App

## Overview

The **Travel Planner App** is a full-stack application that helps users plan and manage their travel experiences. The project consists of:

- A **Flask-based backend** for authentication, database management, and API services.
- A **React Native frontend** for an intuitive mobile experience.
- A **MySQL database** to store user data and travel-related information.

## Features

- User Authentication (Signup/Login)
- Save and manage travel destinations
- Fetch and display travel details
- AI-driven trip recommendations
- Profile management

---

## Installation

### Prerequisites

Ensure you have the following installed:

- Python 3.x
- Node.js & npm
- MySQL

### Backend Setup (Flask)

1. Navigate to the backend directory:
   ```sh
   cd Backend
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Configure MySQL database:
   - Import the SQL scripts in `Backend/SQL scripts/` into MySQL.
   - Update `db.py` with your database credentials.
5. Start the backend server:
   ```sh
   python Start_Server.py
   ```

### Frontend Setup (React Native)

1. Navigate to the frontend directory:
   ```sh
   cd Frontend/Travel_Planner
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the React Native application:
   ```sh
   npm start
   ```

---

## Usage

- Open the mobile app and register/login.
- Search, save, and manage travel destinations.
- View AI-recommended travel itineraries.
- Update your profile and preferences.

---

## Project Structure

```
Travel_Planner_App-master/
│── Backend/
│   ├── Backend_Code/  # All Backend Codes are available
│   ├── SQL scripts/   # Sql Scripts available 
│   ├── Start_Server.py  # Starting point of server
│── Frontend/
│   ├── Travel_Planner/  # React Native app
│   ├── package.json  # Dependencies
```

---

## Developers

- Akash Shenvi, Anruddh Nayak,Anantha,Joylan Dsouza

##

