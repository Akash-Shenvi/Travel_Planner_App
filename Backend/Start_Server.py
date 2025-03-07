from Backend_Code.main import app
from flask_cors import CORS
CORS(app)

if __name__ == '__main__':
    # app.run(debug=True)
    
    app.run(host='0.0.0.0', port=5000,debug=True)