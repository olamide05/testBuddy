from typing import List

from pydantic import BaseModel


class Action(BaseModel):
    type: str  # EYE_LEFT, EYE_RIGHT, HEAD_LEFT, HEAD_RIGHT
    timestamp: float  # Relative time in seconds
    videoTime: float  # Video playback time


class DrivingAnalysisRequest(BaseModel):
    videoUrl: str
    videoType: str  # e.g., "right-turn", "lane-change"
    potentialHazards: List[str]
    actions: List[Action]


class SimpleDrivingAnalysisRequest(BaseModel):
    videoType: str
    actions: List[Action]
    duration: float


# Response Models
class ActionBreakdown(BaseModel):
    EYE_LEFT: int
    EYE_RIGHT: int
    HEAD_LEFT: int
    HEAD_RIGHT: int


class DetailedBreakdown(BaseModel):
    mirror_checks: str
    blind_spot_checks: str
    observation_timing: str
