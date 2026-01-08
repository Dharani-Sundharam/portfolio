# Environment Configuration
# This file is embedded in the exe - no need for .env file

import os

# MongoDB Configuration
MONGODB_URI = "mongodb+srv://dharani3318s_db_user:HslGkpCG93kO3KC6@userdb.jjgrkqq.mongodb.net/"
DATABASE_NAME = "autotyper_db"

# JWT Configuration
SECRET_KEY = "autotyper-secret-key-change-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Credit Configuration
FREE_TRIAL_CREDITS = 2000  # New users get 2000 free credits
CREDIT_RATIO = 1  # 1 character typed = 1 credit deducted (1:1 ratio)

# Pricing Packages (in INR)
CREDIT_PACKAGES = [
    {"credits": 1000, "price": 10, "label": "₹10 - 1,000 credits"},
    {"credits": 7000, "price": 49, "label": "₹49 - 7,000 credits"},
    {"credits": 13000, "price": 99, "label": "₹99 - 13,000 credits"},
]

# API Configuration
API_HOST = "0.0.0.0"
API_PORT = 8000
