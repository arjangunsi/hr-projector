import { useState } from 'react'
import { gsap } from 'gsap'
import Nav from './Nav'

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

function SliderField({ label, valueKey, min, max, form, setForm }: {
  label: string; valueKey: string; min: number; max: number;
  form: any; setForm: (fn: (p: any) => any) => void
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{label}</label>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{form[valueKey]}</span>
      </div>
      <input type="range" min={min} max={max}
        value={form[valueKey]}
        onChange={e => setForm((p: any) => ({ ...p, [valueKey]: Number(e.target.value) }))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function SelectField({ label, valueKey, options, form, setForm }: {
  label: string; valueKey: string;
  options: { value: string; label: string }[];
  form: any; setForm: (fn: (p: any) => any) => void
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: '8px' }}>
        {label}
      </label>
      <select value={form[valueKey]}
        onChange={e => setForm((p: any) => ({ ...p, [valueKey]: e.target.value }))}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
          padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/project/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setResult(data)
      setTimeout(() => {
        gsap.fromTo('.result-card',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )
      }, 50)
    } catch {
      alert('Make sure the API is running: python -m uvicorn api.main:app --reload')
    }
    setLoading(false)
  }

  const prob = result ? result.hr_probability : 0
  const color = prob > 0.5 ? '#22cc66' : prob > 0.25 ? '#ffaa22' : '#4488ff'

  return (
    <div style={{
      minHeight: '100vh', background: '#00000a',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color: '#fff',
    }}>
      <Nav />

      <div style={{ maxWidth: '940px', margin: '0 auto', padding: '96px 5% 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.26em',
            color: '#4477ff', textTransform: 'uppercase', marginBottom: '12px',
          }}>Manual Tool</p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px' }}>
            HR{' '}
            <span style={{
              background: 'linear-gradient(90deg, #1a44dd, #55aaff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Projector</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
            Enter the matchup details to get an instant home run probability
          </p>
        </div>

        {/* Form grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Left column */}
          <div>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
              color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px',
            }}>Contact</p>

            <SliderField label="Exit Velocity (mph)" valueKey="launch_speed" min={70} max={120} form={form} setForm={setForm} />
            <SliderField label="Launch Angle (°)" valueKey="launch_angle" min={-20} max={60} form={form} setForm={setForm} />

            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
              color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px', marginTop: '32px',
            }}>Pitch</p>

            <SliderField label="Release Speed (mph)" valueKey="release_speed" min={70} max={105} form={form} setForm={setForm} />
            <SliderField label="Spin Rate (rpm)" valueKey="release_spin_rate" min={1500} max={3500} form={form} setForm={setForm} />

            <SelectField
              label="Pitch Type"
              valueKey="pitch_type"
              options={PITCH_TYPES.map(pt => ({ value: pt.code, label: pt.label }))}
              form={form} setForm={setForm}
            />
          </div>

          {/* Right column */}
          <div>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
              color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px',
            }}>Matchup</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <SelectField
                label="Batter Stands" valueKey="stand"
                options={[{ value: 'R', label: 'Right' }, { value: 'L', label: 'Left' }]}
                form={form} setForm={setForm}
              />
              <SelectField
                label="Pitcher Throws" valueKey="p_throws"
                options={[{ value: 'R', label: 'Right' }, { value: 'L', label: 'Left' }]}
                form={form} setForm={setForm}
              />
            </div>

            <SelectField
              label="Park" valueKey="park"
              options={PARKS.map(pk => ({ value: pk, label: pk }))}
              form={form} setForm={setForm}
            />

            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
              color: '#4477ff', textTransform: 'uppercase', marginBottom: '20px', marginTop: '28px',
            }}>Situation</p>

            <SliderField label="Inning" valueKey="inning" min={1} max={9} form={form} setForm={setForm} />
            <SliderField label="Balls" valueKey="balls" min={0} max={3} form={form} setForm={setForm} />
            <SliderField label="Strikes" valueKey="strikes" min={0} max={2} form={form} setForm={setForm} />
            <SliderField label="Pitcher Days Rest" valueKey="pitcher_days_rest" min={0} max={10} form={form} setForm={setForm} />
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', marginTop: '40px',
            background: 'linear-gradient(135deg, #0f2fa8, #1f55ff)',
            color: '#fff', border: 'none', padding: '18px',
            borderRadius: '10px', fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 50px rgba(20,70,255,0.3)',
            letterSpacing: '0.07em', opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}>
          {loading ? 'Calculating…' : 'Project Home Run Probability →'}
        </button>

        {/* Result card */}
        {result && (
          <div className="result-card" style={{
            marginTop: '32px', padding: '40px 36px',
            background: 'rgba(255,255,255,0.028)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px', textAlign: 'center',
          }}>
            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.35)',
              marginBottom: '14px', letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>HR Probability</p>
            <p style={{
              fontSize: 'clamp(56px, 10vw, 96px)', fontWeight: 800,
              lineHeight: 1, color,
              textShadow: `0 0 60px ${color}55`,
            }}>
              {result.hr_probability_pct}
            </p>

            {/* Progress bar */}
            <div style={{
              margin: '24px auto 28px', maxWidth: '360px',
              background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '6px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${prob * 100}%`,
                background: `linear-gradient(90deg, #1133bb, ${color})`,
                transition: 'width 0.9s ease', borderRadius: '6px',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              {[
                { label: 'Park', val: result.park },
                { label: 'Matchup', val: result.matchup },
                { label: 'Pitch', val: result.pitch_type },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '5px',
                  }}>{item.label}</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
