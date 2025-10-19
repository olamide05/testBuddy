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

def get_gemini_client():
    return genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION
    )

def generate_question(category: str) -> dict:
    client = get_gemini_client()
    
    # Randomize correct answer position
    correct_positions = ["A", "B", "C", "D"]
    target_position = random.choice(correct_positions)
    
    prompt = f"""Generate an Irish driving theory test question about {category}.

IMPORTANT RULES:
1. Do NOT ask about images, photos, or "this sign" - ask about general knowledge only
2. Make the correct answer be option {target_position}
3. Make all wrong answers plausible but clearly incorrect
4. Vary the difficulty

Return ONLY valid JSON (no markdown):
{{
    "question": "A clear question about {category} (NO references to images)",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correct": "{target_position}",
    "explanation": "Why {target_position} is correct"
}}

Example for {category}:
- Good: "What is the speed limit in a built-up area?"
- Bad: "What does this road sign mean?" (references non-existent image)
"""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
    )
    
    text = response.text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    
    data = json.loads(text)
    
    # Validation: Check if question mentions images
    question_lower = data["question"].lower()
    bad_keywords = ["this sign", "this image", "picture", "photo", "shown", "above", "below"]
    
    if any(keyword in question_lower for keyword in bad_keywords):
        # Regenerate if it references an image
        return generate_question(category)
    
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

def generate_scenario_question(image_path: str, category: str) -> dict:
    client = get_gemini_client()
    
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    
    mime_type = 'image/png' if image_path.endswith('.png') else 'image/jpeg'
    
    # Randomize correct answer position
    correct_positions = ["A", "B", "C", "D"]
    target_position = random.choice(correct_positions)
    
    prompt = f"""Analyze this driving scenario image and create an Irish driving test question.
Category: {category}

CRITICAL REQUIREMENTS:
1. The correct answer MUST be option {target_position}
2. Describe what you see in the image clearly
3. Ask what the driver should do based on the image
4. Make wrong answers plausible but clearly incorrect

Return ONLY valid JSON:
{{
    "question": "Based on this image showing [describe scene], what should you do?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "{target_position}",
    "explanation": "Explanation of why {target_position} is correct based on what's in the image"
}}
"""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=[
            types.Part.from_text(prompt),
            types.Part.from_image(img)
        ]
    )
    
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

def evaluate_and_update(state: dict, user_answer: str) -> dict:
    q = state["current_question"]
    q["user_answer"] = user_answer
    q["is_correct"] = (user_answer == q["correct"])
    
    state["history"].append(q)
    
    cat = q["category"]
    if cat not in state["scores"]:
        state["scores"][cat] = {"correct": 0, "total": 0}

    state["scores"][cat]["total"] += 1
    if q["is_correct"]:
        state["scores"][cat]["correct"] += 1
    
    weak = []
    for category, score in state["scores"].items():
        if score["total"] >= 2:
            accuracy = (score["correct"] / score["total"]) * 100
            if accuracy < 70:
                weak.append(category)

    state["weak_categories"] = weak

    return state

def get_next_question(state: dict) -> dict:
    if len(state["history"]) < 5:
        state["phase"] = "assessment"
        category = random.choice(CATEGORIES)
        q = generate_question(category)
    else:
        state["phase"] = "practice"
        category = state["weak_categories"][0] if state["weak_categories"] else random.choice(CATEGORIES)
        
        # Every 3rd question after assessment = scenario with image
        use_scenario = (len(state["history"]) - 5) % 3 == 0
        
        if use_scenario:
            import os
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