"""
Security utilities - Password hashing and JWT token handling
"""

from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets
import jwt
import config


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against stored hash"""
    try:
        salt, password_hash = stored_hash.split(":")
        check_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return check_hash == password_hash
    except:
        return False


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token"""
    expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def calculate_credits_to_deduct(characters_typed: int) -> int:
    """Calculate credits to deduct based on characters typed (2:1 ratio)"""
    return (characters_typed + 1) // config.CREDIT_RATIO  # Round up
