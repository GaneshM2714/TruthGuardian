import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CX_ID = os.getenv("GOOGLE_CX_ID")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY");
    FACT_API = os.getenv("FACT_API")