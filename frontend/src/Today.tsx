import { useEffect, useState } from 'react'

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

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
  } catch { return iso }
}

export default function Today() {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/matchups/today')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('API not running. Start it with: python -m uvicorn api.main:app --reload'); setLoading(false) })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#00000a',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#fff', padding: '40px 5%'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <button onClick={() => window.location.href = '/'}
              style={{
                background: 'none', border: '1px solid rgba(80,140,255,0.3)',
                color: 'rgba(255,255,255,0.5)', padding: '8px 18px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                marginBottom: '20px', letterSpacing: '0.05em'
              }}>← Back</button>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              Today's <span style={{
                background: 'linear-gradient(90deg, #1a44dd, #55aaff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>HR Candidates</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '8px' }}>
              {data?.date} · {data?.games.length || 0} games · ranked by HR probability
            </p>
          </div>
          <button onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', padding: '10px 20px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}>↻ Refresh</button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '14px', letterSpacing: '0.1em' }}>Pulling today's matchups...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)',
            borderRadius: '8px', padding: '20px', color: 'rgba(255,100,100,0.9)', fontSize: '13px'
          }}>{error}</div>
        )}

        {data && (
          <>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '16px' }}>Today's Games</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {data.games.map((g, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px', padding: '16px 20px'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      {g.away_team} <span style={{ color: 'rgba(255,255,255,0.3)' }}>@</span> {g.home_team}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                      {g.away_pitcher} vs {g.home_pitcher}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                      {g.venue} · {formatTime(g.game_time)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '16px' }}>
                Top HR Candidates
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 120px 120px 80px 80px 100px',
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '10px', fontWeight: 700,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.15em', textTransform: 'uppercase'
                }}>
                  <span>#</span>
                  <span>Batter</span>
                  <span>Matchup</span>
                  <span>Park</span>
                  <span>Exit Velo</span>
                  <span>LA°</span>
                  <span style={{ textAlign: 'right' }}>HR Prob</span>
                </div>

                {data.top_hr_candidates.map((c, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 120px 80px 80px 100px',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{i + 1}</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{c.batter}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{c.team}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>vs {c.pitcher.split(' ').pop()}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{c.park}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.exit_velo}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{c.launch_angle}°</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '14px', fontWeight: 700,
                        color: probColor(c.hr_probability)
                      }}>{c.hr_probability_pct}</span>
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
