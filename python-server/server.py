import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from config import Config  
from bs4 import BeautifulSoup
from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

# --------------------------
# DATABASE CONFIGURATION
# --------------------------
class Database:
    def __init__(self):
        self.client = MongoClient(Config.MONGO_URI)
        self.db = self.client["misinfo_db"]
        self.claims = self.db.claims
        self._create_indexes()

    def _create_indexes(self):
        self.claims.create_index([("text", "text")])
        self.claims.create_index([("status", 1)])
    
    def insert_claim(self, claim_data: Dict) -> str:
        claim_data["views"] = 0  # Initialize the views count
        result = self.claims.insert_one(claim_data)
        return str(result.inserted_id)
    
    def get_unprocessed_claims(self) -> List[Dict]:
        return list(self.claims.find({"status": "unprocessed"}))
    
    def update_claim(self, claim_id: str, update_data: Dict) -> None:
        self.claims.update_one(
            {"_id": ObjectId(claim_id)},
            {"$set": update_data}
        )

# --------------------------
# GEMINI AI VERIFIER
# --------------------------
class GeminiVerifier:
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def verify(self, claim: str, evidence: List[Dict]) -> Dict:
        prompt = f"""
        Verify the following claim and provide a response (true/false) with a detailed explanation:
        Claim: "{claim}"
        Evidence: 
        """
        for item in evidence:
            prompt += f"Source: {item['url']} - {item['title']}\nSnippet: {item['snippet']}\nFull Content: {item['content']}\n\n"
        
        prompt += """ You may also cross-check additional sources. """
        response = self.model.generate_content(prompt)
        return {"response": response.text}

# --------------------------
# EVIDENCE RETRIEVAL SYSTEM
# --------------------------
class EvidenceFinder:
    def __init__(self):
        self.api_key = Config.GOOGLE_API_KEY  # Use API key from config
        self.cx = Config.GOOGLE_CX_ID  # Use CX ID from config

    def find_evidence(self, claim: str):
        url = f"https://www.googleapis.com/customsearch/v1?q={claim}&key={self.api_key}&cx={self.cx}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('items', [])
            
            detailed_results = [
                {
                    "url": item['link'],
                    "title": item.get('title', ''),
                    "snippet": item.get('snippet', ''),
                    "content": self._fetch_page_content(item['link'])
                }
                for item in results[:3]
            ]
            return detailed_results
        except Exception as e:
            print(f"Search API Error: {e}")
            return []

    def _fetch_page_content(self, url: str) -> str:
        try:
            response = requests.get(url, timeout=5)
            soup = BeautifulSoup(response.content, 'html.parser')
            paragraphs = soup.find_all(['p', 'article'])
            return ' '.join([p.get_text(strip=True) for p in paragraphs[:3]])
        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return ""

# --------------------------
# FASTAPI SERVER SETUP
# --------------------------
app = FastAPI()
db = Database()
evidence_finder = EvidenceFinder()
gemini_verifier = GeminiVerifier()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClaimRequest(BaseModel):
    claim: str

@app.post("/check")
async def check_claim(request: ClaimRequest):
    claim = request.claim.strip()
    evidence = evidence_finder.find_evidence(claim)
    gemini_response = gemini_verifier.verify(claim, evidence)
    
    claim_data = {
        "claim": claim,
        "gemini_response": gemini_response["response"],
        "evidence": evidence,
        "status": "processed",
        "timestamp": datetime.utcnow()
    }
    claim_id = db.insert_claim(claim_data)
    
    return {
        "id": claim_id,
        "claim": claim,
        "gemini_verification": gemini_response["response"],
        "evidence": evidence
    }

@app.get("/claim/{claim_id}")
async def get_claim(claim_id: str):
    claim = db.claims.find_one({"_id": ObjectId(claim_id)})
    if claim:
        db.update_claim(claim_id, {"views": claim.get("views", 0) + 1})
        return claim
    return {"error": "Claim not found"}

@app.get("/trending-claims")
async def get_trending_claims():
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "key": Config.FACT_API,
        "query": "India",  # Try a specific query
        "pageSize": 12,
        "languageCode": "en"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        claims = [
            {
                "text": item.get("text"),
                "claimant": item.get("claimant", "Unknown"),
                "reviewed_by": item.get("claimReview", [{}])[0].get("publisher", {}).get("name", "Unknown"),
                "review_url": item.get("claimReview", [{}])[0].get("url", "Unknown"),
                "rating": item.get("claimReview", [{}])[0].get("textualRating", "Not rated"),
            }
            for item in data.get("claims", [])
        ]
        return claims

    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return {"error": "Failed to fetch claims", "details": str(e)}

    except Exception as e:
        print(f"General Error: {e}")
        return {"error": "An unexpected error occurred", "details": str(e)}
