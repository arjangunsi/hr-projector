import pybaseball as pb
import pandas as pd

_cache: dict = {}

def get_batter_stats_2026() -> dict:
    if _cache:
        return _cache

    try:
        # Pull all statcast data for 2026 season so far
        df = pb.statcast(start_dt="2026-03-27", end_dt="2026-05-28")

        # Filter to fly balls only
        fb = df[df['bb_type'] == 'fly_ball'].copy()
        fb = fb.dropna(subset=['launch_speed', 'launch_angle', 'batter'])

        # Aggregate per batter — min 20 fly balls for reliable sample
        grouped = fb.groupby('batter').agg(
            avg_launch_speed=('launch_speed', 'mean'),
            avg_launch_angle=('launch_angle', 'mean'),
            fly_ball_count=('launch_speed', 'count')
        ).reset_index()

        grouped = grouped[grouped['fly_ball_count'] >= 20]

        for _, row in grouped.iterrows():
            _cache[int(row['batter'])] = {
                'launch_speed': round(float(row['avg_launch_speed']), 1),
                'launch_angle': round(float(row['avg_launch_angle']), 1),
            }

        print(f"Loaded fly-ball stats for {len(_cache)} batters")

    except Exception as e:
        print(f"Could not fetch 2026 batter stats: {e}")

    return _cache

def get_batter_profile(batter_id: int) -> dict:
    stats = get_batter_stats_2026()
    return stats.get(batter_id, {
        'launch_speed': 88.0,
        'launch_angle': 26.0,
    })
