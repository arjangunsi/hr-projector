import { useEffect, useState } from 'react'
import Nav from './Nav'

interface Candidate {
  batter: string
  team: string
  pitcher: string
  park: string
  exit_velo: number
  launch_angle: number
  hr_probability: number
  hr_probability_pct: string
  game: string
}

interface Game {
  away_team: string
  home_team: string
  away_pitcher: string
  home_pitcher: string
  venue: string
  game_time: string
}

interface TodayData {
  date: string
  games: Game[]
  top_hr_candidates: Candidate[]
}

function probColor(p: number) {
  if (p > 0.15) return '#22cc66'
  if (p > 0.08) return '#ffaa22'
  if (p > 0.04) return '#4488ff'
  return 'rgba(255,255,255,0.4)'
}

function probBg(p: number) {
  if (p > 0.15) return 'rgba(34,204,102,0.08)'
  if (p > 0.08) return 'rgba(255,170,34,0.07)'
  if (p > 0.04) return 'rgba(68,136,255,0.07)'
  return 'transparent'
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    })
  } catch { return iso }
}

export default function Today() {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/matchups/today`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => {
        setError('API not running. Start it with: python -m uvicorn api.main:app --reload')
        setLoading(false)
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#00000a',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color: '#fff',
    }}>
      <Nav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 5% 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.26em',
            color: '#4477ff', textTransform: 'uppercase', marginBottom: '12px',
          }}>Daily Leaderboard</p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px' }}>
            Today's{' '}
            <span style={{
              background: 'linear-gradient(90deg, #1a44dd, #55aaff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>HR Candidates</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '13px' }}>
              {data?.date} · {data?.games.length || 0} games · ranked by HR probability
            </p>
            <button onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.55)', padding: '8px 18px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
              }}>↻ Refresh</button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.25)' }}>
            <p style={{ fontSize: '14px', letterSpacing: '0.1em' }}>Pulling today's matchups…</p>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255,50,50,0.07)', border: '1px solid rgba(255,50,50,0.18)',
            borderRadius: '10px', padding: '20px 24px',
            color: 'rgba(255,100,100,0.9)', fontSize: '13px', lineHeight: 1.6,
          }}>{error}</div>
        )}

        {data && (
          <>
            {/* Games grid */}
            <div style={{ marginBottom: '52px' }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
                color: '#4477ff', textTransform: 'uppercase', marginBottom: '16px',
              }}>Today's Games</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {data.games.map((g, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.028)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px', padding: '16px 20px',
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      {g.away_team}{' '}
                      <span style={{ color: 'rgba(255,255,255,0.28)' }}>@</span>{' '}
                      {g.home_team}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginBottom: '4px' }}>
                      {g.away_pitcher} vs {g.home_pitcher}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>
                      {g.venue} · {formatTime(g.game_time)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates table */}
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
                color: '#4477ff', textTransform: 'uppercase', marginBottom: '16px',
              }}>Top HR Candidates</p>

              <div style={{
                background: 'rgba(255,255,255,0.018)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', overflow: 'hidden',
              }}>
                {/* Table header */}
                <div className="leaderboard-row leaderboard-header">
                  <span className="col-rank">#</span>
                  <span className="col-batter">Batter</span>
                  <span className="col-matchup col-hide-sm">Matchup</span>
                  <span className="col-park col-hide-sm">Park</span>
                  <span className="col-velo col-hide-md">Exit Velo</span>
                  <span className="col-angle col-hide-md">LA°</span>
                  <span className="col-prob">HR Prob</span>
                </div>

                {data.top_hr_candidates.map((c, i) => (
                  <div key={i} className="leaderboard-row leaderboard-data-row"
                    style={{ background: probBg(c.hr_probability) }}
                  >
                    <span className="col-rank" style={{ color: 'rgba(255,255,255,0.22)', fontWeight: 600, fontSize: '12px' }}>
                      {i + 1}
                    </span>
                    <div className="col-batter">
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{c.batter}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)' }}>{c.team}</p>
                    </div>
                    <div className="col-matchup col-hide-sm">
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                        vs {c.pitcher.split(' ').slice(-1)[0]}
                      </p>
                    </div>
                    <span className="col-park col-hide-sm" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                      {c.park}
                    </span>
                    <span className="col-velo col-hide-md" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {c.exit_velo}
                    </span>
                    <span className="col-angle col-hide-md" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                      {c.launch_angle}°
                    </span>
                    <div className="col-prob" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: probColor(c.hr_probability) }}>
                        {c.hr_probability_pct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
