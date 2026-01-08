"""
API Client for AutoTyper - Direct MongoDB Connection
Connects directly to MongoDB Atlas cloud database
"""

from pymongo import MongoClient
from typing import Optional
import json
import hashlib
from datetime import datetime

# MongoDB Atlas connection
MONGODB_URI = "mongodb+srv://dharani3318s_db_user:HslGkpCG93kO3KC6@userdb.jjgrkqq.mongodb.net/"
DATABASE_NAME = "autotyper_db"


def get_database():
    """Get MongoDB connection"""
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[DATABASE_NAME]
        db.command('ping')
        return db
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None


class APIClient:
    """Direct MongoDB client for AutoTyper"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.email: Optional[str] = None
        self.credits: int = 0
        self.db = get_database()
    
    def signup(self, email: str, password: str) -> dict:
        """Create new account"""
        try:
            if self.db is None:
                return {"success": False, "error": "Database connection failed"}
            
            users = self.db["users"]
            
            # Check if user exists
            if users.find_one({"email": email}):
                return {"success": False, "error": "Email already registered"}
            
            # Create user with hashed password
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            users.insert_one({
                "email": email,
                "password_hash": password_hash,
                "credits": 0,
                "created_at": datetime.utcnow()
            })
            
            # Generate token
            self.token = hashlib.sha256(f"{email}:{password}".encode()).hexdigest()
            self.email = email
            self.credits = 0
            
            return {
                "success": True,
                "data": {
                    "access_token": self.token,
                    "email": email,
                    "credits": 0
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def login(self, email: str, password: str) -> dict:
        """Login to existing account"""
        try:
            if self.db is None:
                self.db = get_database()
            if self.db is None:
                return {"success": False, "error": "Database connection failed"}
            
            users = self.db["users"]
            
            # Find user
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            user = users.find_one({"email": email, "password_hash": password_hash})
            
            if not user:
                return {"success": False, "error": "Invalid email or password"}
            
            # Generate token
            self.token = hashlib.sha256(f"{email}:{password}".encode()).hexdigest()
            self.email = email
            self.credits = user.get("credits", 0)
            
            return {
                "success": True,
                "data": {
                    "access_token": self.token,
                    "email": email,
                    "credits": self.credits
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_balance(self) -> dict:
        """Get current credit balance"""
        try:
            if self.db is None:
                self.db = get_database()
            if self.db is None or not self.email:
                return {"success": False, "error": "Not connected"}
            
            users = self.db["users"]
            user = users.find_one({"email": self.email})
            
            if user:
                self.credits = user.get("credits", 0)
                return {"success": True, "data": {"credits": self.credits}}
            return {"success": False, "error": "User not found"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def deduct_credits(self, characters_typed: int, session_id: str = None) -> dict:
        """Deduct credits after typing"""
        try:
            if self.db is None or not self.email:
                return {"success": False, "error": "Not connected"}
            
            users = self.db["users"]
            
            # Deduct credits
            result = users.update_one(
                {"email": self.email, "credits": {"$gte": characters_typed}},
                {"$inc": {"credits": -characters_typed}}
            )
            
            if result.modified_count > 0:
                self.credits -= characters_typed
                return {
                    "success": True,
                    "data": {
                        "credits_used": characters_typed,
                        "remaining_credits": self.credits
                    }
                }
            else:
                return {"success": False, "error": "Insufficient credits"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def add_credits(self, credits: int) -> dict:
        """Add credits to user account"""
        try:
            if self.db is None or not self.email:
                return {"success": False, "error": "Not connected"}
            
            users = self.db["users"]
            users.update_one(
                {"email": self.email},
                {"$inc": {"credits": credits}}
            )
            self.credits += credits
            return {"success": True, "data": {"credits": self.credits}}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_packages(self) -> dict:
        """Get available credit packages"""
        return {
            "success": True,
            "data": [
                {"id": 1, "name": "Starter", "credits": 1000, "price": 10},
                {"id": 2, "name": "Pro", "credits": 7000, "price": 49},
                {"id": 3, "name": "Premium", "credits": 13000, "price": 99}
            ]
        }
    
    def get_stats(self) -> dict:
        """Get usage statistics"""
        return {"success": True, "data": {"total_typed": 0, "sessions": 0}}
    
    def is_logged_in(self) -> bool:
        """Check if user is logged in"""
        return self.token is not None and self.email is not None
    
    def logout(self):
        """Clear authentication"""
        self.token = None
        self.email = None
        self.credits = 0
    
    def save_session(self, filepath: str):
        """Save session to file"""
        data = {
            "token": self.token,
            "email": self.email,
            "credits": self.credits
        }
        with open(filepath, "w") as f:
            json.dump(data, f)
    
    def load_session(self, filepath: str) -> bool:
        """Load session from file"""
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            self.token = data.get("token")
            self.email = data.get("email")
            self.credits = data.get("credits", 0)
            
            # Verify session is still valid by refreshing credits
            if self.email:
                result = self.get_balance()
                return result["success"]
            return False
        except:
            return False


# Global client instance
api_client = APIClient()
