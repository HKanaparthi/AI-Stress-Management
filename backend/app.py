"""
Main Flask Application Entry Point
"""

from app import create_app, db
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = create_app()

@app.route('/')
def index():
    """Root endpoint"""
    return {
        'message': 'Student Stress Monitor API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth',
            'assessment': '/api/assessment',
            'admin': '/api/admin'
        }
    }

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    app.run(host='0.0.0.0', port=port, debug=debug)
