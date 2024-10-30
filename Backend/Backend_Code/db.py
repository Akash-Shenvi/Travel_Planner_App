import mysql.connector
import os
import json

# Load the database configuration from JSON
with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'base_data.json'), encoding='utf-8') as fobj:
    connection = json.load(fobj)['database']
    print(connection)

# Establish the database connection
database = mysql.connector.connect(
    user=connection['user'],
    passwd=connection['password'],
    host=connection['host'],
    database=connection['database name']
)

# Create a cursor object
cursor_object = database.cursor(buffered=True)

# Optional: Create a function to close the connection and cursor
def close_connection():
    cursor_object.close()
    database.close()
