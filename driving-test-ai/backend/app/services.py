from app.config import settings
from google import genai
from google.genai import types
import json
import uuid
import random
import os
import PIL.Image

# Categories
CATEGORIES = ["road_signs", "right_of_way", "speed_limits", "parking", "roundabouts"]

# Initialize genai client once
client = genai.Client(api_key=settings.GEMINI_API_KEY)


# --- Service Functions ---

# Generate a theory question
def generate_question(category: str) -> dict:
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
        contents=prompt,
    )

    # Parse response
    text = response.text.strip()
    # Handle potential markdown formatting
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()

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
    # Open the image using PIL
    img = PIL.Image.open(image_path)

    prompt = f"""Analyze this driving scenario image and create an Irish driving test question.
Category: {category}

Return ONLY this JSON:
{{
    "question": "In this scenario, what should you do?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A",
    "explanation": "..."
}}"""

    # Use client.models.generate_content with multimodal input
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=[
            types.Part.from_text(prompt),
            types.Part.from_image(img)
        ]
    )

    # Parse response
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()

    data = json.loads(text)

    return {
        "id": str(uuid.uuid4()),
        "text": data["question"],
        "options": data["options"],
        "correct": data["correct"],
        "category": category,
        "explanation": data["explanation"],
        "image_url": f"/images/{os.path.basename(image_path)}",
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

    # Find weak categories (< 70% accuracy after at least 2 questions)
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
    # First 5 questions = assessment phase (random categories)
    if len(state["history"]) < 5:
        state["phase"] = "assessment"
        category = random.choice(CATEGORIES)
        q = generate_question(category)

    # After assessment = practice phase (target weak areas)
    else:
        state["phase"] = "practice"
        # Prioritize weakest category, otherwise pick a random one
        category = state["weak_categories"][0] if state["weak_categories"] else random.choice(CATEGORIES)

        # Every 3rd question in practice is a scenario with an image
        is_scenario_turn = (len(state["history"]) - 5) % 3 == 0

        if is_scenario_turn:
            image_dir = settings.IMAGES_PATH
            if os.path.isdir(image_dir):
                images = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                if images:
                    image_file = random.choice(images)
                    image_path = os.path.join(image_dir, image_file)
                    q = generate_scenario_question(image_path, category)
                else:
                    # Fallback to a standard question if no images are found
                    q = generate_question(category)
            else:
                # Fallback if image directory doesn't exist
                q = generate_question(category)
        else:
            q = generate_question(category)

    state["current_question"] = q
    return state