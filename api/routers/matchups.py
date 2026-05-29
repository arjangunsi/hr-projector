from fastapi import APIRouter
import requests
from datetime import date
from api.model import build_feature_vector, predict_hr_probability, PARK_FACTORS
from api.batter_stats import get_batter_profile

router = APIRouter()

MLB_BASE = "https://statsapi.mlb.com/api/v1"

TEAM_PARK_MAP = {
    "New York Yankees": "NYY", "Los Angeles Dodgers": "LAD",
    "Boston Red Sox": "BOS", "Chicago Cubs": "CHC",
    "San Francisco Giants": "SF", "Colorado Rockies": "COL",
    "Houston Astros": "HOU", "Atlanta Braves": "ATL",
    "New York Mets": "NYM", "Philadelphia Phillies": "PHI",
    "Milwaukee Brewers": "MIL", "Tampa Bay Rays": "TB",
    "Toronto Blue Jays": "TOR", "Los Angeles Angels": "LAA",
    "Cincinnati Reds": "CIN", "Seattle Mariners": "SEA",
    "Texas Rangers": "TEX", "Minnesota Twins": "MIN",
    "San Diego Padres": "SD", "Miami Marlins": "MIA",
    "Baltimore Orioles": "BAL", "Arizona Diamondbacks": "AZ",
    "Athletics": "ATH", "Detroit Tigers": "DET",
    "Cleveland Guardians": "CLE", "Chicago White Sox": "CWS",
    "St. Louis Cardinals": "STL", "Pittsburgh Pirates": "PIT",
    "Washington Nationals": "WSH", "Kansas City Royals": "KC"
}

def get_todays_games():
    today = date.today().isoformat()
    url = f"{MLB_BASE}/schedule?sportId=1&date={today}&hydrate=probablePitcher,lineups,team"
    res = requests.get(url, timeout=10)
    data = res.json()
    games = []
    for date_entry in data.get("dates", []):
        for game in date_entry.get("games", []):
            away = game["teams"]["away"]
            home = game["teams"]["home"]
            games.append({
                "game_id": game["gamePk"],
                "away_team": away["team"]["name"],
                "home_team": home["team"]["name"],
                "away_pitcher": away.get("probablePitcher", {}).get("fullName", "TBD"),
                "away_pitcher_id": away.get("probablePitcher", {}).get("id"),
                "home_pitcher": home.get("probablePitcher", {}).get("fullName", "TBD"),
                "home_pitcher_id": home.get("probablePitcher", {}).get("id"),
                "venue": game.get("venue", {}).get("name", ""),
                "game_time": game.get("gameDate", ""),
            })
    return games

def get_pitcher_info(pitcher_id: int):
    if not pitcher_id:
        return {"throws": "R", "avg_speed": 92.0, "spin_rate": 2200, "pitch_type": "FF"}
    try:
        url = f"{MLB_BASE}/people/{pitcher_id}"
        res = requests.get(url, timeout=8)
        data = res.json()
        people = data.get("people", [{}])
        throws = people[0].get("pitchHand", {}).get("code", "R") if people else "R"
        return {"throws": throws, "avg_speed": 92.0, "spin_rate": 2200, "pitch_type": "FF"}
    except:
        return {"throws": "R", "avg_speed": 92.0, "spin_rate": 2200, "pitch_type": "FF"}

def get_roster_batters(team_id: int):
    try:
        url = f"{MLB_BASE}/teams/{team_id}/roster?rosterType=active"
        res = requests.get(url, timeout=8)
        data = res.json()
        batters = []
        for player in data.get("roster", []):
            pos = player.get("position", {}).get("type", "")
            if pos != "Pitcher":
                batters.append({
                    "id": player["person"]["id"],
                    "name": player["person"]["fullName"],
                    "stand": player.get("person", {}).get("batSide", {}).get("code", "R")
                })
        return batters[:9]
    except:
        return []

def get_team_id(team_name: str):
    try:
        url = f"{MLB_BASE}/teams?sportId=1"
        res = requests.get(url, timeout=8)
        data = res.json()
        for team in data.get("teams", []):
            if team["name"] == team_name:
                return team["id"]
    except:
        pass
    return None

@router.get("/today")
def get_today_projections():
    games = get_todays_games()
    if not games:
        return {"date": date.today().isoformat(), "games": [], "top_hr_candidates": []}

    all_candidates = []

    for game in games:
        park = TEAM_PARK_MAP.get(game["home_team"], "NYY")

        for side in ["away", "home"]:
            batting_team = game[f"{side}_team"]
            pitcher_id = game[f"{'home' if side == 'away' else 'away'}_pitcher_id"]
            pitcher_name = game[f"{'home' if side == 'away' else 'away'}_pitcher"]

            pitcher_info = get_pitcher_info(pitcher_id)
            team_id = get_team_id(batting_team)
            if not team_id:
                continue

            batters = get_roster_batters(team_id)

            for batter in batters:
                profile = get_batter_profile(batter["id"])
                features = build_feature_vector(
                    launch_speed=profile["launch_speed"],
                    launch_angle=profile["launch_angle"],
                    release_speed=pitcher_info["avg_speed"],
                    release_spin_rate=pitcher_info["spin_rate"],
                    stand=batter["stand"],
                    p_throws=pitcher_info["throws"],
                    pitch_type=pitcher_info["pitch_type"],
                    park=park,
                    pitcher_days_rest=4,
                    inning=1,
                    balls=0,
                    strikes=0,
                )
                prob = predict_hr_probability(features)
                all_candidates.append({
                    "batter": batter["name"],
                    "batter_id": batter["id"],
                    "team": batting_team,
                    "pitcher": pitcher_name,
                    "park": park,
                    "exit_velo": round(profile["launch_speed"], 1),
                    "launch_angle": round(profile["launch_angle"], 1),
                    "hr_probability": prob,
                    "hr_probability_pct": f"{prob * 100:.1f}%",
                    "game": f"{game['away_team']} @ {game['home_team']}"
                })

    all_candidates.sort(key=lambda x: x["hr_probability"], reverse=True)

    return {
        "date": date.today().isoformat(),
        "games": games,
        "top_hr_candidates": all_candidates[:30]
    }
