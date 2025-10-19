# backend/app/state.py
from typing import TypedDict, List, Dict, Optional

class Question(TypedDict):
    id: str
    text: str
    options: List[str]
    correct: str
    category: str
    explanation: str
    image_url: Optional[str]
    user_answer: Optional[str]
    is_correct: Optional[bool]

class State(TypedDict):
    user_id: str
    session_id: str
    phase: str  # "assessment" or "practice"
    current_question: Optional[Question]
    history: List[Question]
    scores: Dict[str, Dict[str, int]]  # category -> {correct, total}
    weak_categories: List[str]