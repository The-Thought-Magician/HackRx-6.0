#!/usr/bin/env python3
"""
Database initialization script for Insurance RAG system.
Creates default admin user for easy login.
"""

import sys
import os

from sqlalchemy.orm import Session
from models.database import SessionLocal, create_tables, User
from services.auth_service import auth_service
from core.config import settings

def create_default_user():
    """Create default admin user for testing"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("✓ Default admin user already exists")
            print("  Username: admin")
            print("  Password: admin123")
            return existing_user
        
        # Create default admin user
        user = auth_service.create_user(
            db=db,
            email="admin@insurance.com",
            username="admin",
            password="admin123"
        )
        
        print("✓ Created default admin user:")
        print("  Username: admin")
        print("  Password: admin123")
        print("  Email: admin@insurance.com")
        
        return user
        
    except Exception as e:
        print(f"✗ Error creating default user: {e}")
        return None
    finally:
        db.close()

def create_demo_user():
    """Create demo user for testing"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "demo").first()
        if existing_user:
            print("✓ Demo user already exists")
            return existing_user
        
        # Create demo user
        user = auth_service.create_user(
            db=db,
            email="demo@insurance.com",
            username="demo",
            password="demo123"
        )
        
        print("✓ Created demo user:")
        print("  Username: demo")
        print("  Password: demo123")
        print("  Email: demo@insurance.com")
        
        return user
        
    except Exception as e:
        print(f"✗ Error creating demo user: {e}")
        return None
    finally:
        db.close()

def main():
    """Initialize database with default data"""
    print("🚀 Initializing Insurance RAG Database...")
    print(f"Database URL: {settings.DATABASE_URL}")
    
    # Create tables
    print("📊 Creating database tables...")
    create_tables()
    print("✓ Database tables created")
    
    # Create default users
    print("\n👤 Creating default users...")
    admin_user = create_default_user()
    demo_user = create_demo_user()
    
    if admin_user and demo_user:
        print("\n🎉 Database initialization complete!")
        print("\n📋 Available login credentials:")
        print("┌─────────────────────────────────────┐")
        print("│            Admin Account            │")
        print("├─────────────────────────────────────┤")
        print("│  Username: admin                    │")
        print("│  Password: admin123                 │")
        print("│  Email: admin@insurance.com         │")
        print("└─────────────────────────────────────┘")
        print("┌─────────────────────────────────────┐")
        print("│             Demo Account            │")
        print("├─────────────────────────────────────┤")
        print("│  Username: demo                     │")
        print("│  Password: demo123                  │")
        print("│  Email: demo@insurance.com          │")
        print("└─────────────────────────────────────┘")
        print("\n🌐 Access the application at: http://localhost:3001")
        print("🔗 API Documentation at: http://localhost:8000/docs")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()