import time
from typing import List, Dict

from fastapi import HTTPException
import requests

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
        model="gemini-2.0-flash",
        contents=[prompt, img]
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
        # Avoid repeating categories if possible
        used_categories = [q["category"] for q in state["history"]]
        available = [c for c in CATEGORIES if c not in used_categories[-2:]]  # Avoid last 2
        category = random.choice(available if available else CATEGORIES)
        q = generate_question(category)

    # After assessment = practice phase (target weak areas)
    else:
        state["phase"] = "practice"
        # Prioritize weakest category, otherwise pick a random one
        category = state["weak_categories"][0] if state["weak_categories"] else random.choice(CATEGORIES)

        # Every 3rd question in practice is a scenario with an image
        is_scenario_turn = True

        if is_scenario_turn:
            image_dir = settings.IMAGES_PATH
            if os.path.isdir(image_dir):
                images = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                if images:
                    print(1)
                    image_file = random.choice(images)
                    image_path = os.path.join(image_dir, image_file)
                    q = generate_scenario_question(image_path, category)
                    print(2)
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

def analyze_driving_performance(video_url: str, actions: List[Dict], video_type: str,
                                potential_hazards: List[str]) -> dict:
    """
    Analyze driving performance based on video and user's observation actions.

    Args:
        video_url: URL to the driving video
        actions: List of user actions with timestamps
            [{"type": "EYE_LEFT", "timestamp": 2.5, "videoTime": 2.5}, ...]
        video_type: Type of scenario (e.g., "right-turn", "lane-change")
        potential_hazards: List of hazards present in the video

    Returns:
        dict with score, feedback, and detailed analysis
    """

    # Format actions for Gemini
    actions_text = "\n".join([
        f"- {action['type']} at {action['timestamp']:.2f}s (video time: {action['videoTime']:.2f}s)"
        for action in actions
    ])

    # Count action types
    action_breakdown = {
        "EYE_LEFT": len([a for a in actions if a["type"] == "EYE_LEFT"]),
        "EYE_RIGHT": len([a for a in actions if a["type"] == "EYE_RIGHT"]),
        "HEAD_LEFT": len([a for a in actions if a["type"] == "HEAD_LEFT"]),
        "HEAD_RIGHT": len([a for a in actions if a["type"] == "HEAD_RIGHT"])
    }

    prompt = f"""You are an experienced Irish driving instructor analyzing a learner's hazard perception performance.

SCENARIO DETAILS:
- Type: {video_type}
- Potential Hazards: {', '.join(potential_hazards)}
- Video URL: {video_url}

USER'S OBSERVATION ACTIONS:
{actions_text}

ACTION SUMMARY:
- Mirror checks (left): {action_breakdown['EYE_LEFT']}
- Mirror checks (right): {action_breakdown['EYE_RIGHT']}
- Blind spot checks (left): {action_breakdown['HEAD_LEFT']}
- Blind spot checks (right): {action_breakdown['HEAD_RIGHT']}
- Total observations: {len(actions)}

TASK:
Analyze the driving scenario in the video and evaluate whether the learner performed appropriate observation checks at the right times. Consider:

1. Were mirror checks performed before the maneuver?
2. Were blind spot checks performed when necessary?
3. Were observations made at critical moments (e.g., before turning, changing lanes)?
4. Were there missed observations that could be dangerous?
5. Was observation frequency appropriate?

Return ONLY this JSON (no markdown):
{{
    "score": 85,
    "grade": "Good",
    "feedback": "Overall performance summary in 2-3 sentences",
    "strengths": ["What they did well", "Another strength"],
    "improvements": ["What needs improvement", "Another area to work on"],
    "critical_misses": ["Any dangerous missed observations"],
    "timing_analysis": "Brief analysis of whether observations were timely",
    "detailed_breakdown": {{
        "mirror_checks": "Assessment of mirror usage",
        "blind_spot_checks": "Assessment of blind spot checks",
        "observation_timing": "Assessment of when observations were made"
    }}
}}

Examples of 'Observation' faults include:
➢ Not looking around when moving off (Cat. A, A2, A1, A M, B, BE, and W)
➢ Where an applicant is on a wide road and is required to make a significant change
9
in position to the right or left a fault may be recorded for "observation
Changing Lane" or Mirrors Changing Lane as appropriate.
➢ Not taking adequate observations before and while overtaking.
➢ Not taking adequate observations before and while changing lanes to the left or
right, or where lanes merge into one another.
➢ Not taking adequate observations when crossing junctions.
➢ Not taking adequate observations before, on, and exiting roundabouts.
➢ Not taking adequate observations before and while turning left/right.
➢ Where an applicant turns right, (or is beckoned to turn right and the view is
restricted) in front of an oncoming vehicle, a check should be made of the 'inside'
of the oncoming vehicle before completing the turn.
➢ Where an applicant turns right in front of an oncoming vehicle without checking the
road directly ahead and does not see the vehicle. E.g. when forward vision is
obscured.
➢ Where an applicant makes a severe 'swan-neck' while turning right or is very wide
when turning left and does not take observations to the side before completing the
turn. Two faults may be recorded in this case.
➢ Not taking adequate observations when being the first vehicle to move off from
traffic lights at a blind junction.
➢ Not taking adequate observations to the left when turning right, and in possession
of a junction.
➢ Not taking adequate observations when driving out from a parking space or a fault
may be recorded for "Observations Moving Off".
Observation faults changing lane on a roundabout are recorded opposite 'Observations at
Roundabouts'
In some situations, such as overtaking, changing lanes, or moving off in HGV or PCV
vehicles observations may be taken by use of the mirrors, and this is acceptable where it is
done competently and effectively.
In a case where an applicant does see another road user but deliberately impedes or
restricts passage, a fault should be recorded for 'Right of Way' as appropriate and not for
'Observation' in this case.
Where visibility is severely restricted due to condensation, a fault may be recorded for
"Secondary Controls" and not Observations in this case.
React Promptly and Properly to Hazards
React
By identifying hazards, applicants will have time to take any necessary action. They should
ensure that they read the road ahead to observe any situation that will involve adjusting
their speed or altering their course. There will be times when applicants will have to deal
with more than one hazard within a short space of time. This may require using both initiative
and common sense to deal with a particular set of circumstances.
An applicant should show awareness by reading the road and traffic situation ahead and
reacting in an appropriate manner, or a fault may be recorded for "Reaction".
10
Examples of 'React' faults include:
➢ Where an applicant is driving towards parked vehicles on the left and does not
move out in good time to pass them.
➢ Where an applicant's vision is diverted down to the controls for an extended
period.
➢ Where an applicant brakes hard on an amber light when the vehicle should clearly
have carried on.
➢ Where an applicant drives into, or causes, or contributes unnecessarily to a
'bottleneck'.
➢ Where an applicant intends to turn from a major road into a minor or narrow road
and obliges a vehicle which intends to emerge from that road to reverse out of the
way.
➢ Where an applicant makes exaggerated use of the mirror(s) which distracts from
forward observation.
➢ Where an applicant makes exaggerated/unnecessary observations to the side or
rear, which distracts from forward observation.
➢ Where an applicant is on a slip road, and intends to join a dual carriageway, and
stops unnecessarily.
➢ Where an applicant splashes pedestrians/cyclists with surface water.
➢ Where an applicant stops suddenly when e.g. turning left on a slip lane by
misreading the main lights.
➢ Where an applicant has commenced to turn at traffic lights and stops
unnecessarily when part way through, on seeing the red light for the other road.
➢ Where an applicant does not react correctly to speed ramps.

Score range: 0-100 (The range should be strictly based on live scenario)
- 90-100: Excellent - Professional level observation
- 75-89: Good - Safe and attentive AND NO CRITICAL MISSES
- 60-74: Adequate - Passing but needs improvement
- 40-59: Poor - Significant gaps in observation
- 0-39: Dangerous - Critical observation failures"""

    try:
        # Upload video to Gemini for analysis
        with open("/tmp/video.mp4", "wb") as f:
            f.write(requests.get(video_url).content)

        video_file = client.files.upload(file="/tmp/video.mp4", config={"display_name": "video.mp4", "mime_type": "video/mp4"})

        while video_file.state.name == "PROCESSING":
            print(f"Current state: {video_file.state.name}. Waiting...")
            time.sleep(10)
            video_file = client.files.get(name=video_file.name)

        if video_file.state.name == "FAILED":
            raise ValueError(f"Video processing failed: {video_file.state}")

        print(f"File is now ACTIVE. State: {video_file.state.name}")

        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[prompt, video_file]
        )

        # Parse response
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        data = json.loads(text)

        # Add metadata
        data["analysis_id"] = str(uuid.uuid4())
        data["video_url"] = video_url
        data["video_type"] = video_type
        data["total_actions"] = len(actions)
        data["action_breakdown"] = action_breakdown

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze video: {str(e)}")