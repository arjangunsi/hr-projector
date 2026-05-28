from fastapi import APIRouter
from pydantic import BaseModel
from api.model import build_feature_vector, predict_hr_probability

router = APIRouter()

class ProjectionRequest(BaseModel):
    launch_speed: float
    launch_angle: float
    release_speed: float
    release_spin_rate: float
    stand: str
    p_throws: str
    pitch_type: str
    park: str
    pitcher_days_rest: int = 5
    inning: int = 1
    balls: int = 0
    strikes: int = 0

@router.post("/")
def get_projection(req: ProjectionRequest):
    features = build_feature_vector(
        launch_speed=req.launch_speed,
        launch_angle=req.launch_angle,
        release_speed=req.release_speed,
        release_spin_rate=req.release_spin_rate,
        stand=req.stand,
        p_throws=req.p_throws,
        pitch_type=req.pitch_type,
        park=req.park,
        pitcher_days_rest=req.pitcher_days_rest,
        inning=req.inning,
        balls=req.balls,
        strikes=req.strikes,
    )
    probability = predict_hr_probability(features)
    return {
        "hr_probability": probability,
        "hr_probability_pct": f"{probability * 100:.1f}%",
        "park": req.park,
        "matchup": f"{req.stand}HB vs {req.p_throws}HP",
        "pitch_type": req.pitch_type,
    }
