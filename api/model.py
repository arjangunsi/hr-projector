import pickle
import os
import pandas as pd

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(_ROOT, "models", "xgb_hr_model.pkl")
FEATURES_PATH = os.path.join(_ROOT, "models", "feature_cols.pkl")

_model = None
_feature_cols = None

def _load():
    global _model, _feature_cols
    if _model is None:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(FEATURES_PATH, "rb") as f:
            _feature_cols = pickle.load(f)

PARK_FACTORS = {
    "CIN": 0.183, "ATL": 0.182, "NYY": 0.181, "LAD": 0.179, "PHI": 0.179,
    "LAA": 0.177, "MIL": 0.168, "TB": 0.166, "NYM": 0.166, "TOR": 0.164,
    "COL": 0.163, "CHC": 0.159, "BOS": 0.158, "WSH": 0.157, "HOU": 0.155,
    "BAL": 0.154, "SEA": 0.153, "TEX": 0.151, "MIN": 0.150, "SD": 0.149,
    "MIA": 0.146, "ATH": 0.143, "AZ": 0.143, "DET": 0.138, "CLE": 0.136,
    "CWS": 0.135, "STL": 0.134, "PIT": 0.131, "SF": 0.129, "KC": 0.127
}

PITCH_TYPES = ["CH", "CU", "FA", "FC", "FF", "FS", "KC", "SI", "SL", "ST", "SV"]

def build_feature_vector(
    launch_speed, launch_angle, release_speed, release_spin_rate,
    stand, p_throws, pitch_type, park,
    pitcher_days_rest=5, inning=1, balls=0, strikes=0
):
    row = {
        "launch_speed": launch_speed,
        "launch_angle": launch_angle,
        "release_speed": release_speed,
        "release_spin_rate": release_spin_rate,
        "stand_enc": 1 if stand == "R" else 0,
        "p_throws_enc": 1 if p_throws == "R" else 0,
        "pitcher_days_since_prev_game": pitcher_days_rest,
        "inning": inning,
        "balls": balls,
        "strikes": strikes,
        "park_hr_factor": PARK_FACTORS.get(park, 0.155),
    }
    for pt in PITCH_TYPES:
        row[f"pitch_{pt}"] = 1 if pitch_type == pt else 0

    _load()
    df = pd.DataFrame([row])
    df = df.reindex(columns=_feature_cols, fill_value=0)
    return df

def predict_hr_probability(feature_vector):
    _load()
    prob = _model.predict_proba(feature_vector)[0][1]
    return round(float(prob), 4)
