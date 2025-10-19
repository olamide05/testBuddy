# backend/app/services.py
from google import genai
from google.genai import types
from app.config import settings
import json
import uuid
import random

# Categories
CATEGORIES = ["road_signs", "right_of_way", "speed_limits", "parking", "roundabouts"]

# Initialize Gemini client
def get_gemini_client():
    return genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION
    )

# Generate a theory question
def generate_question(category: str) -> dict:
    client = get_gemini_client()
    
    prompt = f"""Generate an Irish driving theory test question about {category}.
    
Return ONLY this JSON (no markdown, no extra text):
{{
    "question": "Your question here?",
    "options": ["A) First", "B) Second", "C) Third", "D) Fourth"],
    "correct": "A",
    "explanation": "Why this is correct"
}}"""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )
    
    # Parse response
    text = response.text.strip()
    # Remove markdown if present
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    
    data = json.loads(text)
    
    return {
        "id": str(uuid.uuid4()),
        "text": data["question"],
        "options": data["options"],
        "correct": data["correct"],
        "category": category,
        "explanation": data["explanation"],
        "image_url": None,
        "user_answer": None,
        "is_correct": None
    }

# Analyze image and generate scenario question
def generate_scenario_question(image_path: str, category: str) -> dict:
    client = get_gemini_client()
    
    # Read image
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    
    mime_type = 'image/png' if image_path.endswith('.png') else 'image/jpeg'
    
    prompt = f"""Analyze this driving scenario image and create an Irish driving test question.
Category: {category}

Return ONLY this JSON:
{{
    "question": "In this scenario, what should you do?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A",
    "explanation": "..."
}}"""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ]
    )
    
    # Parse response
    text = response.text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    
    data = json.loads(text)
    
    return {
        "id": str(uuid.uuid4()),
        "text": data["question"],
        "options": data["options"],
        "correct": data["correct"],
        "category": category,
        "explanation": data["explanation"],
        "image_url": f"/images/{image_path.split('/')[-1]}",
        "user_answer": None,
        "is_correct": None
    }

# Evaluate answer and update state
def evaluate_and_update(state: dict, user_answer: str) -> dict:
    q = state["current_question"]
    q["user_answer"] = user_answer
    q["is_correct"] = (user_answer == q["correct"])
    
    # Add to history
    state["history"].append(q)
    
    # Update scores
    cat = q["category"]
    if cat not in state["scores"]:
        state["scores"][cat] = {"correct": 0, "total": 0}
    
    state["scores"][cat]["total"] += 1
    if q["is_correct"]:
        state["scores"][cat]["correct"] += 1
    
    # Find weak categories (< 70% accuracy)
    weak = []
    for category, score in state["scores"].items():
        if score["total"] >= 2:
            accuracy = (score["correct"] / score["total"]) * 100
            if accuracy < 70:
                weak.append(category)
    
    state["weak_categories"] = weak
    
    return state

# Get next question
def get_next_question(state: dict) -> dict:
    # First 5 questions = assessment (random categories)
    if len(state["history"]) < 5:
        state["phase"] = "assessment"
        category = random.choice(CATEGORIES)
        q = generate_question(category)
    
    # After assessment = practice (target weak areas)
    else:
        state["phase"] = "practice"
        # Pick weakest category or random
        category = state["weak_categories"][0] if state["weak_categories"] else random.choice(CATEGORIES)
        
        # Every 3rd question = scenario with image
        use_scenario = len(state["history"]) % 3 == 0
        
        if use_scenario:
            import os
            # Get random image from directory
            image_dir = settings.IMAGES_PATH
            if os.path.exists(image_dir):
                images = [f for f in os.listdir(image_dir) if f.endswith(('.png', '.jpg', '.jpeg'))]
                if images:
                    # Pick random image instead of always first one
                    image_file = random.choice(images)
                    image_path = f"{image_dir}/{image_file}"
                    q = generate_scenario_question(image_path, category)
                else:
                    q = generate_question(category)
            else:
                q = generate_question(category)
        else:
            q = generate_question(category)
    
    state["current_question"] = q
    return state