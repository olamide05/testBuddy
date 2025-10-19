# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.config import settings
from app import services
import uuid
import os

from app.models import DrivingAnalysisRequest

app = FastAPI(title="Irish Driving Test AI")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Static Images --------------------
if os.path.exists(settings.IMAGES_PATH):
    app.mount("/images", StaticFiles(directory=settings.IMAGES_PATH), name="images")

# -------------------- In-Memory Session Store --------------------
sessions = {}  # session_id -> state

# -------------------- Schemas --------------------
class StartSession(BaseModel):
    user_id: str

class SubmitAnswer(BaseModel):
    answer: str

# -------------------- Routes --------------------
@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/api/analyze-driving")
async def analyze_driving(request: DrivingAnalysisRequest):
    actions_dict = [a.dict() for a in request.actions]
    return services.analyze_driving_performance(
        video_url=request.videoUrl,
        actions=actions_dict,
        video_type=request.videoType,
        potential_hazards=request.potentialHazards
    )

# -------------------- SESSION LOGIC --------------------
@app.post("/api/session/start")
def start_session(data: StartSession):
    """Always create a brand-new session and first question."""
    session_id = str(uuid.uuid4())

    state = {
        "user_id": data.user_id,
        "session_id": session_id,
        "phase": "assessment",
        "current_question": None,
        "history": []
    }

    # generate first question
    state = services.get_next_question(state)
    sessions[session_id] = state

    return {
        "session_id": session_id,
        "question": state["current_question"],
        "phase": state["phase"]
    }

@app.post("/api/session/{session_id}/answer")
def submit_answer(session_id: str, data: SubmitAnswer):
    """Submit an answer and get the next question."""
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")

    state = sessions[session_id]
    state = services.evaluate_and_update(state, data.answer)
    last_q = state["history"][-1]

    # stop after 15
    if len(state["history"]) >= 15:
        del sessions[session_id]
        return {
            "is_correct": last_q["is_correct"],
            "correct_answer": last_q["correct"],
            "explanation": last_q["explanation"],
            "next_question": None,
            "complete": True
        }

    # next question
    state = services.get_next_question(state)
    sessions[session_id] = state

    return {
        "is_correct": last_q["is_correct"],
        "correct_answer": last_q["correct"],
        "explanation": last_q["explanation"],
        "next_question": state["current_question"],
        "complete": False
    }

@app.post("/api/session/{session_id}/end")
def end_session(session_id: str):
    """End test early and clear the session."""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": "Session ended"}
    raise HTTPException(404, "Session not found")

@app.delete("/api/session/{session_id}")
def delete_session(session_id: str):
    """Alias for end_session (frontend can call either)."""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": "Session deleted"}
    raise HTTPException(404, "Session not found")
