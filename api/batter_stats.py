import pybaseball as pb
import pandas as pd
from datetime import date

_cache: dict = {}

def get_batter_stats_2026() -> dict:
    if _cache:
        return _cache

    try:
        df = pb.statcast_batter_exitvelo_barrels(2026, minBBE=10)
        for _, row in df.iterrows():
            _cache[int(row['player_id'])] = {
                'launch_speed': float(row.get('avg_hit_speed', 88.0)),
                'launch_angle': float(row.get('avg_hit_angle', 12.0)),
            }
    except Exception as e:
        print(f"Could not fetch 2026 batter stats: {e}")

    return _cache

def get_batter_profile(batter_id: int) -> dict:
    stats = get_batter_stats_2026()
    return stats.get(batter_id, {
        'launch_speed': 88.0,
        'launch_angle': 12.0,
    })
