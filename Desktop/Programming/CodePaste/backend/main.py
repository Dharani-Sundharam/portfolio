"""
FastAPI Backend for Auto-Typer Application
Handles authentication, credits, and usage tracking
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import uvicorn

import config
import database as db
import security

app = FastAPI(title="AutoTyper API", version="1.0.0")

# Enable CORS for desktop app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Pydantic Models ============

class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    credits: int
    email: str


class UserResponse(BaseModel):
    email: str
    credits: int
    created_at: str


class CreditDeductRequest(BaseModel):
    characters_typed: int
    session_id: Optional[str] = None


class CreditDeductResponse(BaseModel):
    credits_deducted: int
    remaining_credits: int
    characters_typed: int


# ============ Auth Dependency ============

async def get_current_user(authorization: str = Header(...)):
    """Extract and verify user from Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    payload = security.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


# ============ Auth Endpoints ============

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """Create a new user account"""
    # Check if email already exists
    existing = db.get_user_by_email(request.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    password_hash = security.hash_password(request.password)
    user = db.create_user(request.email, password_hash)
    
    # Create signup bonus transaction
    db.create_transaction(
        user_id=str(user["_id"]),
        trans_type="signup_bonus",
        credits_change=config.FREE_TRIAL_CREDITS,
        status="completed"
    )
    
    # Generate token
    token = security.create_access_token(str(user["_id"]), user["email"])
    
    return TokenResponse(
        access_token=token,
        credits=user["credits"],
        email=user["email"]
    )


@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login and get access token"""
    user = db.get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not security.verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    db.update_last_login(str(user["_id"]))
    
    # Generate token
    token = security.create_access_token(str(user["_id"]), user["email"])
    
    return TokenResponse(
        access_token=token,
        credits=user["credits"],
        email=user["email"]
    )


@app.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        email=user["email"],
        credits=user["credits"],
        created_at=user["created_at"].isoformat()
    )


# ============ Credits Endpoints ============

@app.get("/credits/balance")
async def get_balance(user: dict = Depends(get_current_user)):
    """Get current credit balance"""
    return {"credits": user["credits"], "email": user["email"]}


@app.post("/credits/deduct", response_model=CreditDeductResponse)
async def deduct_credits(request: CreditDeductRequest, user: dict = Depends(get_current_user)):
    """Deduct credits after typing (2:1 ratio - 2 chars = 1 credit)"""
    credits_to_deduct = security.calculate_credits_to_deduct(request.characters_typed)
    
    if user["credits"] < credits_to_deduct:
        raise HTTPException(
            status_code=402, 
            detail=f"Insufficient credits. Need {credits_to_deduct}, have {user['credits']}"
        )
    
    new_balance = user["credits"] - credits_to_deduct
    
    # Update credits
    db.update_user_credits(str(user["_id"]), new_balance)
    
    # Log usage
    db.create_usage_log(
        user_id=str(user["_id"]),
        characters_typed=request.characters_typed,
        credits_used=credits_to_deduct,
        session_id=request.session_id
    )
    
    # Create transaction record
    db.create_transaction(
        user_id=str(user["_id"]),
        trans_type="usage",
        credits_change=-credits_to_deduct,
        status="completed"
    )
    
    return CreditDeductResponse(
        credits_deducted=credits_to_deduct,
        remaining_credits=new_balance,
        characters_typed=request.characters_typed
    )


@app.get("/credits/packages")
async def get_packages():
    """Get available credit packages"""
    return {"packages": config.CREDIT_PACKAGES}


@app.get("/credits/stats")
async def get_usage_stats(user: dict = Depends(get_current_user)):
    """Get user's usage statistics"""
    stats = db.get_user_usage_stats(str(user["_id"]))
    stats["current_credits"] = user["credits"]
    return stats


# ============ Health Check ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    print("Starting AutoTyper API Server...")
    uvicorn.run(app, host=config.API_HOST, port=config.API_PORT)
