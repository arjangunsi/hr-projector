import { useState } from 'react'
import { gsap } from 'gsap'

const PARKS = ['NYY','LAD','BOS','CHC','SF','COL','HOU','ATL','NYM','PHI','MIL','TB','TOR','LAA','CIN','SEA','TEX','MIN','SD','MIA','BAL','AZ','ATH','DET','CLE','CWS','STL','PIT','WSH','KC']
const PITCH_TYPES = [
  { code: 'FF', label: '4-Seam Fastball' },
  { code: 'SI', label: 'Sinker' },
  { code: 'FC', label: 'Cutter' },
  { code: 'SL', label: 'Slider' },
  { code: 'CH', label: 'Changeup' },
  { code: 'CU', label: 'Curveball' },
  { code: 'ST', label: 'Sweeper' },
  { code: 'KC', label: 'Knuckle Curve' },
  { code: 'FS', label: 'Splitter' },
]

interface Result {
  hr_probability: number
  hr_probability_pct: string
  park: string
  matchup: string
  pitch_type: string
}

export default function Projector() {
  const [form, setForm] = useState({
    launch_speed: 104,
    launch_angle: 28,
    release_speed: 94,
    release_spin_rate: 2300,
    stand: 'R',
    p_throws: 'R',
    pitch_type: 'FF',
    park: 'NYY',
    pitcher_days_rest: 5,
    inning: 1,
    balls: 0,
    strikes: 0,
  })
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/project/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setResult(data)
      setTimeout(() => {
        gsap.fromTo('.result-card',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )
      }, 50)
    } catch (e) {
      alert('Make sure the API is running: python -m uvicorn api.main:app --reload')
    }
    setLoading(false)
  }

  const prob = result ? result.hr_probability : 0
  const color = prob > 0.5 ? '#22cc66' : prob > 0.25 ? '#ffaa22' : '#4488ff'

  return (
    <div style={{
      minHeight: '100vh', background: '#00000a',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#fff', padding: '40px 5%'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <button onClick={() => window.location.href = '/'}
          style={{
            background: 'none', border: '1px solid rgba(80,140,255,0.3)',
            color: 'rgba(255,255,255,0.5)', padding: '8px 18px',
            borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
            marginBottom: '40px', letterSpacing: '0.05em'
          }}>
          ← Back
        </button>

        <h1 style={{
          fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
          marginBottom: '8px', lineHeight: 1.1
        }}>
          HR <span style={{
            background: 'linear-gradient(90deg, #1a44dd, #55aaff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Projector</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '48px' }}>
          Enter the matchup details to get a home run probability
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px' }}>Contact</p>

            {[
              { label: 'Exit Velocity (mph)', key: 'launch_speed', min: 70, max: 120 },
              { label: 'Launch Angle (°)', key: 'launch_angle', min: -20, max: 60 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{f.label}</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{(form as any)[f.key]}</span>
                </div>
                <input type="range" min={f.min} max={f.max}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#2255ff' }}
                />
              </div>
            ))}

            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px', marginTop: '32px' }}>Pitch</p>

            {[
              { label: 'Release Speed (mph)', key: 'release_speed', min: 70, max: 105 },
              { label: 'Spin Rate (rpm)', key: 'release_spin_rate', min: 1500, max: 3500 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{f.label}</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{(form as any)[f.key]}</span>
                </div>
                <input type="range" min={f.min} max={f.max}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#2255ff' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>Pitch Type</label>
              <select value={form.pitch_type}
                onChange={e => setForm(p => ({ ...p, pitch_type: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  padding: '10px 12px', borderRadius: '6px', fontSize: '13px'
                }}>
                {PITCH_TYPES.map(pt => <option key={pt.code} value={pt.code}>{pt.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px' }}>Matchup</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Batter Stands', key: 'stand' },
                { label: 'Pitcher Throws', key: 'p_throws' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                  <select value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                      padding: '10px 12px', borderRadius: '6px', fontSize: '13px'
                    }}>
                    <option value="R">Right</option>
                    <option value="L">Left</option>
                  </select>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px' }}>Park</label>
              <select value={form.park}
                onChange={e => setForm(p => ({ ...p, park: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  padding: '10px 12px', borderRadius: '6px', fontSize: '13px'
                }}>
                {PARKS.map(pk => <option key={pk} value={pk}>{pk}</option>)}
              </select>
            </div>

            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px', marginTop: '32px' }}>Situation</p>

            {[
              { label: 'Inning', key: 'inning', min: 1, max: 9 },
              { label: 'Balls', key: 'balls', min: 0, max: 3 },
              { label: 'Strikes', key: 'strikes', min: 0, max: 2 },
              { label: "Pitcher Days Rest", key: 'pitcher_days_rest', min: 0, max: 10 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{f.label}</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{(form as any)[f.key]}</span>
                </div>
                <input type="range" min={f.min} max={f.max}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#2255ff' }}
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', marginTop: '40px',
            background: 'linear-gradient(135deg, #0f2fa8, #1f55ff)',
            color: '#fff', border: 'none', padding: '18px',
            borderRadius: '8px', fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 50px rgba(20,70,255,0.3)',
            letterSpacing: '0.08em', opacity: loading ? 0.7 : 1
          }}>
          {loading ? 'Calculating...' : 'Project Home Run Probability →'}
        </button>

        {result && (
          <div className="result-card" style={{
            marginTop: '40px', padding: '36px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              HR Probability
            </p>
            <p style={{
              fontSize: 'clamp(56px, 10vw, 96px)', fontWeight: 800,
              lineHeight: 1, color,
              textShadow: `0 0 60px ${color}66`
            }}>
              {result.hr_probability_pct}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '32px',
              marginTop: '28px', flexWrap: 'wrap'
            }}>
              {[
                { label: 'Park', val: result.park },
                { label: 'Matchup', val: result.matchup },
                { label: 'Pitch', val: result.pitch_type },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.val}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', overflow: 'hidden', height: '8px' }}>
              <div style={{
                height: '100%', width: `${prob * 100}%`,
                background: `linear-gradient(90deg, #1133bb, ${color})`,
                transition: 'width 0.8s ease', borderRadius: '8px'
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
