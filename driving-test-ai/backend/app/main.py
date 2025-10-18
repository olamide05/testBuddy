# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.config import settings
from app import services
import uuid
import os

app = FastAPI(title="Irish Driving Test AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve images
if os.path.exists(settings.IMAGES_PATH):
    app.mount("/images", StaticFiles(directory=settings.IMAGES_PATH), name="images")

# In-memory sessions
sessions = {}

# Pydantic models
class StartSession(BaseModel):
    user_id: str

class SubmitAnswer(BaseModel):
    answer: str

# Routes
@app.get("/")
def root():
    return {"status": "ok", "message": "Irish Driving Test AI"}

@app.post("/api/session/start")
def start_session(data: StartSession):
    session_id = str(uuid.uuid4())
    
    # Initialize state
    state = {
        "user_id": data.user_id,
        "session_id": session_id,
        "phase": "assessment",
        "current_question": None,
        "history": [],
        "scores": {},
        "weak_categories": []
    }
    
    # Get first question
    state = services.get_next_question(state)
    
    # Store session
    sessions[session_id] = state
    
    return {
        "session_id": session_id,
        "question": state["current_question"],
        "phase": state["phase"]
    }

@app.post("/api/session/{session_id}/answer")
def submit_answer(session_id: str, data: SubmitAnswer):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")
    
    state = sessions[session_id]
    
    # Evaluate answer
    state = services.evaluate_and_update(state, data.answer)
    
    # Get feedback
    last_q = state["history"][-1]
    
    # Check if done (15 questions)
    if len(state["history"]) >= 15:
        return {
            "is_correct": last_q["is_correct"],
            "correct_answer": last_q["correct"],
            "explanation": last_q["explanation"],
            "next_question": None,
            "complete": True
        }
    
    # Get next question
    state = services.get_next_question(state)
    
    # Update session
    sessions[session_id] = state
    
    return {
        "is_correct": last_q["is_correct"],
        "correct_answer": last_q["correct"],
        "explanation": last_q["explanation"],
        "next_question": state["current_question"],
        "complete": False
    }

@app.get("/api/session/{session_id}/progress")
def get_progress(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")
    
    state = sessions[session_id]
    
    # Calculate overall accuracy
    total = len(state["history"])
    correct = sum(1 for q in state["history"] if q["is_correct"])
    accuracy = (correct / total * 100) if total > 0 else 0
    
    return {
        "total_answered": total,
        "correct_answers": correct,
        "overall_accuracy": accuracy,
        "category_scores": state["scores"],
        "weak_categories": state["weak_categories"]
    }