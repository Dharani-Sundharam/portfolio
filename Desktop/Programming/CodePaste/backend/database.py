"""
MongoDB Database Connection and Models
"""

from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
from bson import ObjectId
from typing import Optional
import config

# Global client
_client: Optional[MongoClient] = None
_db = None


def get_database():
    """Get MongoDB database connection"""
    global _client, _db
    if _client is None:
        _client = MongoClient(config.MONGODB_URI)
        _db = _client[config.DATABASE_NAME]
        # Create indexes
        _ensure_indexes()
    return _db


def _ensure_indexes():
    """Create necessary indexes"""
    db = _db
    # Unique email index
    db.users.create_index("email", unique=True)
    # User ID index for transactions and usage logs
    db.transactions.create_index("user_id")
    db.usage_logs.create_index("user_id")
    db.usage_logs.create_index("timestamp")


def get_users_collection() -> Collection:
    """Get users collection"""
    return get_database().users


def get_transactions_collection() -> Collection:
    """Get transactions collection"""
    return get_database().transactions


def get_usage_logs_collection() -> Collection:
    """Get usage logs collection"""
    return get_database().usage_logs


# ============ User Operations ============

def create_user(email: str, password_hash: str) -> dict:
    """Create a new user with free trial credits"""
    users = get_users_collection()
    
    user_doc = {
        "email": email,
        "password_hash": password_hash,
        "credits": config.FREE_TRIAL_CREDITS,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "is_active": True
    }
    
    result = users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    users = get_users_collection()
    return users.find_one({"email": email})


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    users = get_users_collection()
    return users.find_one({"_id": ObjectId(user_id)})


def update_user_credits(user_id: str, new_credits: int) -> bool:
    """Update user's credit balance"""
    users = get_users_collection()
    result = users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"credits": new_credits}}
    )
    return result.modified_count > 0


def update_last_login(user_id: str):
    """Update user's last login timestamp"""
    users = get_users_collection()
    users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_login": datetime.utcnow()}}
    )


# ============ Transaction Operations ============

def create_transaction(user_id: str, trans_type: str, credits_change: int, 
                       amount_paid: float = 0, payment_id: str = None,
                       status: str = "completed") -> dict:
    """Create a transaction record"""
    transactions = get_transactions_collection()
    
    trans_doc = {
        "user_id": ObjectId(user_id),
        "type": trans_type,  # 'purchase', 'usage', 'refund', 'signup_bonus'
        "credits_change": credits_change,
        "amount_paid": amount_paid,
        "payment_id": payment_id,
        "timestamp": datetime.utcnow(),
        "status": status
    }
    
    result = transactions.insert_one(trans_doc)
    trans_doc["_id"] = result.inserted_id
    return trans_doc


def get_user_transactions(user_id: str, limit: int = 50) -> list:
    """Get user's transaction history"""
    transactions = get_transactions_collection()
    cursor = transactions.find(
        {"user_id": ObjectId(user_id)}
    ).sort("timestamp", -1).limit(limit)
    return list(cursor)


# ============ Usage Log Operations ============

def create_usage_log(user_id: str, characters_typed: int, credits_used: int,
                     session_id: str = None) -> dict:
    """Create a usage log entry"""
    usage_logs = get_usage_logs_collection()
    
    log_doc = {
        "user_id": ObjectId(user_id),
        "characters_typed": characters_typed,
        "credits_used": credits_used,
        "session_id": session_id,
        "timestamp": datetime.utcnow()
    }
    
    result = usage_logs.insert_one(log_doc)
    log_doc["_id"] = result.inserted_id
    return log_doc


def get_user_usage_stats(user_id: str) -> dict:
    """Get user's total usage statistics"""
    usage_logs = get_usage_logs_collection()
    
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$group": {
            "_id": None,
            "total_characters": {"$sum": "$characters_typed"},
            "total_credits_used": {"$sum": "$credits_used"},
            "session_count": {"$sum": 1}
        }}
    ]
    
    result = list(usage_logs.aggregate(pipeline))
    if result:
        return {
            "total_characters": result[0]["total_characters"],
            "total_credits_used": result[0]["total_credits_used"],
            "session_count": result[0]["session_count"]
        }
    return {"total_characters": 0, "total_credits_used": 0, "session_count": 0}
