from flask import Flask

app = Flask(__name__)

# Import the database cursor
from .db import cursor_object

# Optional: Create a close_connection function that you can use when needed
def close_database():
    from .db import close_connection
    close_connection()
