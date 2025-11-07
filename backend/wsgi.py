"""
WSGI Entry Point for Gunicorn
"""
from app import create_app, db

app = create_app()

# Auto-initialize database tables on startup
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables initialized successfully!")
    except Exception as e:
        print(f"⚠️ Database initialization error (may already exist): {e}")

if __name__ == "__main__":
    app.run()
